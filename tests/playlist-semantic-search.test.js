'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const os = require('node:os');
const path = require('node:path');
const { BuiltInPlaylistLibrary } = require('../desktop/built-in-playlist-library');
const { cosine } = require('../desktop/muq-recommendation');

function fixture(tracks = []) {
  const events = {};
  const context = {
    Set, Number, console, setTimeout, clearTimeout,
    document: { getElementById: () => ({ addEventListener: (type, handler) => { events[type] = handler; } }) },
    window: { confirm: () => true, desktopWindow: {} },
    playlistPanelDetailState: { key: 'favoradio:source', playlist: { name: '测试' }, tracks, total: tracks.length, nextOffset: tracks.length, hasMore: false },
    userPlaylists: [{ id: 'dest', provider: 'favoradio', name: '收藏' }],
    smartFavoritesBridge: () => ({ embedMuqTexts: async tags => ({ ok: true, vectors: { [tags[0].value]: [1, 0] } }) }),
    smartMuqEnsureAudio: async track => track.vector,
    smartMuqCosine: cosine,
    renderPlaylistPanelDetailRows() {}, showToast() {}, applyBuiltInPlaylistSnapshot() {},
    playlistPanelKey: (provider, id) => provider + ':' + id,
    isSongAccountLoggedIn: () => true,
    builtInPlaylistErrorMessage: () => '收藏失败',
    loadMorePlaylistPanelDetailTracks: async () => {},
    escHtml: value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;'),
    playlistProviderLabel: () => 'FR'
  };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../public/js/modules/06-lyrics/02a-playlist-search.js'), 'utf8'), context);
  context.events = events;
  return context;
}

test('semantic ranking uses raw cosine threshold, stable source indices, and excludes failed vectors', async () => {
  const c = fixture([
    { id: 1, name: 'a', vector: [0, 1] }, { id: 2, name: 'b', vector: [3, 4] },
    { id: 3, name: 'c', vector: [1, 0] }, { id: 4, name: 'd', vector: [0, 0] },
    { id: 5, name: 'e', vector: [-1, 0] }
  ]);
  const s = c.playlistSearchState(); s.mode = 'semantic'; s.draft = '悲伤';
  assert.equal(s.threshold, 50);
  await c.runPlaylistSearch();
  assert.deepEqual(Array.from(c.playlistSearchRows(), row => [row.index, row.score]), [[2, 100], [1, 60]]);
  assert.match(s.status, /1 首无法分析/);
  s.selected = new Set([1, 2]); s.threshold = 70; c.playlistSearchPruneSelection();
  assert.deepEqual([...s.selected], [2]);
  s.threshold = 0;
  assert.deepEqual(Array.from(c.playlistSearchRows(), row => row.index), [2, 1, 0, 4]);
});

test('text search loads all pages and matches metadata without encoding audio', async () => {
  const c = fixture([{ name: '开场', artist: 'A' }]);
  c.playlistPanelDetailState.hasMore = true;
  c.loadMorePlaylistPanelDetailTracks = async () => {
    c.playlistPanelDetailState.tracks.push({ name: '终曲', artist: 'B', album: 'SAD songs' });
    c.playlistPanelDetailState.nextOffset++;
    c.playlistPanelDetailState.hasMore = false;
  };
  c.smartMuqEnsureAudio = async () => { throw new Error('text must not encode'); };
  c.playlistSearchState().draft = 'sad'; await c.runPlaylistSearch();
  assert.deepEqual(Array.from(c.playlistSearchRows(), row => row.index), [1]);
});

test('late semantic response cannot overwrite a new query or playlist', async () => {
  const c = fixture([{ id: 1, vector: [1, 0] }]);
  let resolve;
  c.smartFavoritesBridge = () => ({ embedMuqTexts: () => new Promise(done => { resolve = done; }) });
  const s = c.playlistSearchState(); s.mode = 'semantic'; s.draft = '旧查询';
  const running = c.runPlaylistSearch();
  c.playlistSearchReset(true);
  resolve({ ok: true, vectors: { '旧查询': [1, 0] } }); await running;
  assert.equal(s.query, ''); assert.equal(Object.keys(s.scores).length, 0); assert.equal(s.busy, false);
});

test('select all includes offscreen matches and batch deletion sends source songs in sorted results', async () => {
  const c = fixture(Array.from({ length: 300 }, (_, i) => ({ id: i + 1, name: '曲' + i, vector: [1, 0] })));
  const s = c.playlistSearchState(); s.mode = 'semantic'; s.draft = '悲伤';
  await c.runPlaylistSearch();
  c.events.change({ target: { id: 'pl-search-all', checked: true, hasAttribute: () => false } });
  assert.equal(s.selected.size, 300);
  s.selected = new Set([0, 299]);
  let deleted;
  c.window.desktopWindow.removeBuiltInPlaylistTracks = async (id, tracks) => { deleted = Array.from(tracks, t => t.id); return { ok: true }; };
  await c.playlistSearchBatch('delete');
  assert.deepEqual(deleted, [300, 1]);
  assert.equal(c.playlistPanelDetailState.tracks.length, 298);
  assert.equal(c.playlistPanelDetailState.tracks[0].id, 2);
  assert.equal(s.query, '悲伤'); assert.equal(s.scores[0], 100); assert.equal(s.selected.size, 0);
});

test('failed copy keeps selection for retry; successful copy preserves the source', async () => {
  const c = fixture([{ id: 1 }, { id: 2 }]), s = c.playlistSearchState();
  s.selected = new Set([0, 1]); s.target = 'favoradio:dest';
  c.window.desktopWindow.addBuiltInPlaylistTracks = async () => ({ ok: false });
  await c.playlistSearchBatch('copy'); assert.equal(s.selected.size, 2); assert.equal(s.actionBusy, false);
  c.window.desktopWindow.addBuiltInPlaylistTracks = async (_, tracks) => { assert.equal(tracks.length, 2); return { ok: true }; };
  await c.playlistSearchBatch('copy'); assert.equal(s.selected.size, 0);
  assert.equal(c.playlistPanelDetailState.tracks.length, 2);
  assert.match(s.status, /已复制 2 首/);
});

test('move writes all selected songs before removing originals and retains filtered scores', async () => {
  const c = fixture([{ id: 1 }, { id: 2 }, { id: 3 }]), s = c.playlistSearchState(), calls = [];
  s.selected = new Set([0, 2]); s.target = 'favoradio:dest'; s.scores = { 0: 90, 1: 70, 2: 80 };
  c.window.desktopWindow.addBuiltInPlaylistTracks = async (id, tracks) => { calls.push(['copy', id, ...tracks.map(t => t.id)]); return { ok: true }; };
  c.window.desktopWindow.removeBuiltInPlaylistTracks = async (id, tracks) => { calls.push(['remove', id, ...tracks.map(t => t.id)]); return { ok: true }; };
  await c.playlistSearchBatch('move');
  assert.deepEqual(calls, [['copy', 'dest', 3, 1], ['remove', 'source', 3, 1]]);
  assert.deepEqual(c.playlistPanelDetailState.tracks.map(t => t.id), [2]);
  assert.equal(s.scores[0], 70); assert.equal(s.selected.size, 0); assert.match(s.status, /已移动 2 首/);
});

test('move failure never removes sources prematurely; removal failure retains selection for retry', async () => {
  const c = fixture([{ id: 1 }, { id: 2 }]), s = c.playlistSearchState();
  s.selected = new Set([0, 1]); s.target = 'favoradio:dest';
  let removals = 0;
  c.window.desktopWindow.addBuiltInPlaylistTracks = async () => ({ ok: false });
  c.window.desktopWindow.removeBuiltInPlaylistTracks = async () => { removals++; return { ok: false }; };
  await c.playlistSearchBatch('move');
  assert.equal(removals, 0); assert.equal(s.selected.size, 2); assert.match(s.status, /未从原歌单移除/);
  c.window.desktopWindow.addBuiltInPlaylistTracks = async () => ({ ok: true });
  await c.playlistSearchBatch('move');
  assert.equal(removals, 1); assert.equal(c.playlistPanelDetailState.tracks.length, 2);
  assert.equal(s.selected.size, 2); assert.match(s.status, /原歌单移除未确认/);
  c.window.desktopWindow.removeBuiltInPlaylistTracks = async () => ({ ok: true });
  await c.playlistSearchBatch('move');
  assert.equal(c.playlistPanelDetailState.tracks.length, 0);
});

test('same-playlist destinations are excluded and read-only sources can copy but not move', async () => {
  const c = fixture([{ id: 1 }]), s = c.playlistSearchState();
  c.userPlaylists.push({ id: 'source', provider: 'favoradio' });
  s.selected = new Set([0]); s.target = 'favoradio:source';
  let copies = 0;
  c.window.desktopWindow.addBuiltInPlaylistTracks = async () => { copies++; return { ok: true }; };
  await c.playlistSearchBatch('move'); await c.playlistSearchBatch('copy'); assert.equal(copies, 0);
  c.playlistPanelDetailState.key = 'qq:readonly'; s.target = 'favoradio:dest';
  await c.playlistSearchBatch('move'); assert.equal(copies, 0);
  await c.playlistSearchBatch('copy'); assert.equal(copies, 1); assert.equal(c.playlistPanelDetailState.tracks.length, 1);
});

test('remote move verifies writes and keeps all originals on partial failure or unconfirmed result', async () => {
  const c = fixture([{ id: 1 }, { id: 2 }]), s = c.playlistSearchState();
  c.userPlaylists = [{ id: 'remote', provider: 'netease' }];
  c.playlistAccountProvider = pl => pl.provider;
  c.songAccountAdapter = () => ({ collect: true, playlistAddUrl: '/add' });
  c.songAccountProvider = () => 'netease'; c.songAccountId = song => song.id;
  c.refreshUserPlaylists = () => {};
  let calls = [], verified = true, failSecond = true;
  c.apiJson = async (_, request) => { const id = JSON.parse(request.body).id; calls.push('add:' + id); return id === 1 && failSecond ? { error: 'failed' } : { success: true }; };
  c.verifySongInPlaylist = async (_, song) => { calls.push('verify:' + song.id); return verified; };
  c.window.desktopWindow.removeBuiltInPlaylistTracks = async () => { calls.push('remove'); return { ok: true }; };
  s.selected = new Set([0, 1]); s.target = 'netease:remote';
  await c.playlistSearchBatch('move');
  assert.deepEqual(calls, ['add:2', 'verify:2', 'add:1']);
  assert.equal(s.selected.size, 2); assert.equal(c.playlistPanelDetailState.tracks.length, 2);
  failSecond = false; verified = false; calls = [];
  await c.playlistSearchBatch('move');
  assert.deepEqual(calls, ['add:2', 'verify:2']); assert.equal(s.selected.size, 2);
  verified = true; calls = [];
  await c.playlistSearchBatch('move');
  assert.deepEqual(calls, ['add:2', 'verify:2', 'add:1', 'verify:1', 'remove']);
  assert.equal(c.playlistPanelDetailState.tracks.length, 0);
});

test('library batch writes are atomic, deduplicate, and delete by identity after reorder', async t => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'playlist-search-test-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const lib = new BuiltInPlaylistLibrary({ userDataPath: dir });
  const id = (await lib.create('搜索收藏')).playlist.id;
  const tracks = [1, 2, 3].map(id => ({ id, provider: 'netease', name: '曲' + id }));
  await lib.addTracks(id, tracks.concat(tracks));
  assert.equal(lib.page(id).total, 3);
  await assert.rejects(lib.addTracks(id, [tracks[0], {}]));
  assert.equal(lib.page(id).total, 3);
  await lib.reorderTrack(id, 2, 0);
  await lib.removeTracks(id, [tracks[0], tracks[2]]);
  assert.deepEqual(lib.page(id).tracks.map(t => String(t.id)), ['2']);
  assert.equal(new BuiltInPlaylistLibrary({ userDataPath: dir }).page(id).total, 1);
});

test('copy then move persists both playlists without duplicating an existing destination song', async t => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'playlist-transfer-test-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const library = new BuiltInPlaylistLibrary({ userDataPath: dir });
  const source = (await library.create('原歌单')).playlist.id;
  const target = (await library.create('目标歌单')).playlist.id;
  await library.addTracks(source, [1, 2].map(id => ({ id, provider: 'netease', name: '曲' + id })));
  const c = fixture(library.page(source).tracks), s = c.playlistSearchState();
  c.playlistPanelDetailState.key = 'favoradio:' + source;
  c.userPlaylists = library.listSync().playlists;
  c.window.desktopWindow.addBuiltInPlaylistTracks = (id, tracks) => library.addTracks(id, tracks);
  c.window.desktopWindow.removeBuiltInPlaylistTracks = (id, tracks) => library.removeTracks(id, tracks);
  s.selected = new Set([0]); s.target = 'favoradio:' + target;
  await c.playlistSearchBatch('copy');
  assert.equal(library.page(source).total, 2); assert.equal(library.page(target).total, 1);
  s.selected = new Set([0, 1]);
  await c.playlistSearchBatch('move');
  const restored = new BuiltInPlaylistLibrary({ userDataPath: dir });
  assert.equal(restored.page(source).total, 0);
  assert.deepEqual(restored.page(target).tracks.map(track => String(track.id)).sort(), ['1', '2']);
});

test('playlist paging coalesces overlapping requests and discards responses after navigation', async () => {
  const c = fixture();
  Object.assign(c, { PLAYLIST_DETAIL_INITIAL_RENDER: 96, PLAYLIST_DETAIL_BATCH_SIZE: 96, cloneSong: x => x });
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../public/js/modules/06-lyrics/02-playlist-detail.js'), 'utf8'), c);
  c.renderPlaylistPanelDetailRows = () => {};
  c.renderPlaylistPanelDetailState = () => {};
  c.scrollPlaylistPanelDetailIntoView = () => {};
  let resolve, requests = 0;
  c.fetchPlaylistTracksPage = () => { requests++; return new Promise(done => { resolve = done; }); };
  const st = c.playlistPanelDetailState;
  Object.assign(st, { key: 'favoradio:one', token: 1, hasMore: true });
  const a = c.loadMorePlaylistPanelDetailTracks('search');
  const b = c.loadMorePlaylistPanelDetailTracks('scroll');
  assert.equal(a, b); assert.equal(requests, 1);
  c.playlistPanelDetailState = { key: 'favoradio:two', token: 2, tracks: [], hasMore: false };
  resolve({ tracks: [{ id: 1, name: '旧歌单' }], hasMore: false });
  await a;
  assert.equal(c.playlistPanelDetailState.tracks.length, 0);
  assert.equal(st.tracks.length, 0);
});

test('remote delete endpoint validates the request and invalidates cache only after success', async () => {
  const source = fs.readFileSync(path.join(__dirname, '../server.js'), 'utf8');
  const route = source.slice(source.indexOf("  if (pn === '/api/playlist/remove-songs')"), source.indexOf('  // ---------- 收藏歌曲到歌单 ----------'));
  const c = { pn: '/api/playlist/remove-songs', req: { method: 'POST' }, res: {}, body: { pid: '42', ids: ['1', '2'] },
    requireLogin: async () => true, readRequestBody: async () => c.body, userCookie: 'test',
    playlist_tracks: async args => { c.request = args; return { code: 200 }; },
    normalizeApiCode: r => r.code, normalizeApiMessage: () => 'Denied',
    invalidateNeteasePlaylistTrackIndex: id => { c.invalidated = id; }, sendJSON: (_, result, status) => { c.result = result; c.status = status; } };
  vm.createContext(c);
  await vm.runInContext('(async function(){' + route + '})()', c);
  assert.equal(c.request.op, 'del'); assert.equal(c.request.tracks, '1,2'); assert.equal(c.invalidated, '42');
  c.invalidated = null; c.body.ids = ['bad'];
  await vm.runInContext('(async function(){' + route + '})()', c);
  assert.equal(c.status, 400); assert.equal(c.invalidated, null);
  c.body.ids = ['1']; c.playlist_tracks = async () => ({ code: 403 });
  await vm.runInContext('(async function(){' + route + '})()', c);
  assert.equal(c.status, 409); assert.equal(c.invalidated, null);
});
