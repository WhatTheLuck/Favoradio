'use strict';

function playlistSearchState() {
  var st = playlistPanelDetailState;
  if (!st.search) st.search = { mode: 'text', draft: '', query: '', threshold: 50, scores: {}, selected: new Set(), revision: 0, run: 0, busy: false, actionBusy: false, status: '', target: '' };
  return st.search;
}

// Keep source indices: sorting and filtering must never change playback/delete targets.
function playlistSearchRows() {
  var s = playlistSearchState();
  var rows = (playlistPanelDetailState.tracks || []).map(function (track, index) { return { track: track, index: index, score: s.scores[index] }; });
  if (!s.query) return rows;
  if (s.mode === 'text') {
    var query = s.query.toLocaleLowerCase();
    return rows.filter(function (row) { return [row.track.name, row.track.artist, row.track.album].join(' ').toLocaleLowerCase().includes(query); });
  }
  return rows.filter(function (row) { return Number.isFinite(row.score) && row.score >= s.threshold; })
    .sort(function (a, b) { return b.score - a.score || a.index - b.index; });
}

function playlistSearchPruneSelection() {
  var s = playlistSearchState(), visible = new Set(playlistSearchRows().map(function (row) { return row.index; }));
  s.selected.forEach(function (index) { if (!visible.has(index)) s.selected.delete(index); });
}

function playlistSearchDeleteReason() {
  var st = playlistPanelDetailState, provider = st.key.split(':')[0], pl = st.playlist || {};
  if (provider === 'favoradio') return '';
  if (pl.subscribed || pl.virtual) return '此歌单只读，不能删除歌曲';
  if (provider === 'netease') return isSongAccountLoggedIn(provider) ? '' : '登录网易云后可删除歌曲';
  return '当前平台尚不支持删除歌单歌曲';
}

function playlistSearchTargets() {
  var s = playlistSearchState();
  var tracks = Array.from(s.selected).map(function (i) { return playlistPanelDetailState.tracks[i]; }).filter(Boolean);
  return (userPlaylists || []).filter(function (pl) {
    if (playlistPanelKey(pl.provider, pl.id) === playlistPanelDetailState.key) return false;
    if (pl.provider === 'favoradio') return true;
    var provider = playlistAccountProvider(pl), adapter = songAccountAdapter(provider);
    return tracks.length && !pl.subscribed && !pl.virtual && adapter && adapter.collect && adapter.playlistAddUrl && isSongAccountLoggedIn(provider) &&
      tracks.every(function (track) { return songAccountProvider(track) === provider; });
  });
}

function playlistSearchToolbarHtml() {
  var s = playlistSearchState(), rows = playlistSearchRows(), reason = playlistSearchDeleteReason();
  var disabled = s.actionBusy ? ' disabled' : '';
  var targets = playlistSearchTargets();
  var canTransfer = s.selected.size && targets.some(function (pl) { return playlistPanelKey(pl.provider, pl.id) === s.target; }) && !s.busy && !s.actionBusy;
  var options = '<option value="">选择目标歌单…</option>' + targets.map(function (pl) {
    var key = playlistPanelKey(pl.provider, pl.id);
    return '<option value="' + escHtml(key) + '"' + (key === s.target ? ' selected' : '') + '>' + escHtml(pl.name + ' · ' + playlistProviderLabel(pl.provider)) + '</option>';
  }).join('');
  return '<div class="pl-search" aria-label="歌单搜索">' +
    '<form class="pl-search-form"><select id="pl-search-mode" aria-label="搜索方式"' + disabled + '><option value="text"' + (s.mode === 'text' ? ' selected' : '') + '>文本搜索</option><option value="semantic"' + (s.mode === 'semantic' ? ' selected' : '') + '>语义搜索</option></select>' +
    '<input id="pl-search-query" type="search" maxlength="80" aria-label="搜索当前歌单" placeholder="' + (s.mode === 'semantic' ? '描述音乐，如：悲伤' : '歌名、歌手、专辑') + '" value="' + escHtml(s.draft) + '"' + disabled + '>' +
    '<button type="submit"' + disabled + '>搜索</button></form>' +
    '<div class="pl-search-filter">' + (s.mode === 'semantic' ? '<label for="pl-search-threshold">最低相似度</label><input id="pl-search-threshold" type="range" min="0" max="100" step="1" value="' + s.threshold + '"' + disabled + '><output for="pl-search-threshold">' + s.threshold + '%</output>' : '<span>在当前歌单中搜索</span>') +
    '<button type="button" data-pl-search-action="clear"' + disabled + '>' + (s.busy ? '停止' : '重置') + '</button></div>' +
    '<div class="pl-search-selection"><label><input id="pl-search-all" type="checkbox"' + (rows.length && s.selected.size === rows.length ? ' checked' : '') + (s.busy || s.actionBusy || !rows.length ? ' disabled' : '') + '>全选结果</label><span>已选 ' + s.selected.size + ' / ' + rows.length + '</span>' +
    '<button type="button" data-pl-search-action="delete" title="' + escHtml(reason || '从当前歌单删除所选歌曲') + '"' + (reason || !s.selected.size || s.busy || s.actionBusy ? ' disabled' : '') + '>删除</button></div>' +
    '<div class="pl-search-collect"><select id="pl-search-target" aria-label="目标歌单"' + disabled + '>' + options + '</select>' +
    '<button type="button" data-pl-search-action="move" aria-label="移动到歌单" title="' + escHtml(reason || '写入目标歌单后，从当前歌单移除') + '"' + (!canTransfer || reason ? ' disabled' : '') + '>移动到</button>' +
    '<button type="button" data-pl-search-action="copy" aria-label="复制到歌单" title="复制到目标歌单，保留当前歌单中的歌曲"' + (!canTransfer ? ' disabled' : '') + '>复制到</button></div>' +
    '<div class="pl-search-status" role="status" title="' + escHtml(s.status || reason) + '">' + escHtml(s.status || reason || (s.mode === 'semantic' ? '余弦相似度 × 100%，负值显示为 0%' : '支持筛选后批量操作')) + '</div></div>';
}

function playlistSearchRefresh(resetScroll) {
  playlistSearchState().revision++;
  if (resetScroll && typeof playlistPanelBuildVirtualEntries === 'function') {
    var panel = document.getElementById('playlist-panel'), list = document.getElementById('pl-list');
    var cache = playlistPanelBuildVirtualEntries();
    var index = cache.entries.findIndex(function (entry) { return entry.type === 'detail'; });
    if (panel && list && index >= 0) {
      var listTop = list.getBoundingClientRect().top - panel.getBoundingClientRect().top + panel.scrollTop;
      panel.scrollTop = Math.max(0, listTop + cache.offsets[index] - 126);
    }
  }
  renderPlaylistPanelDetailRows();
}

function playlistSearchReset(clear) {
  var s = playlistSearchState();
  s.run++; s.busy = false; s.query = ''; s.scores = {}; s.selected.clear(); s.status = '';
  if (clear) s.draft = '';
  playlistSearchRefresh(true);
}

async function runPlaylistSearch() {
  var st = playlistPanelDetailState, s = playlistSearchState();
  if (s.actionBusy) return;
  var query = s.draft.trim();
  if (!query) { playlistSearchReset(true); return; }
  var run = ++s.run;
  function active() { return playlistPanelDetailState === st && !!st.key && s.run === run; }
  s.query = query; s.scores = {}; s.selected.clear(); s.busy = true; s.status = '正在载入完整歌单…';
  playlistSearchRefresh(true);
  try {
    if (st.pageRequest) await st.pageRequest;
    if (st.warmTimer) { clearTimeout(st.warmTimer); st.warmTimer = 0; }
    while (active() && st.hasMore) {
      var before = st.nextOffset;
      await loadMorePlaylistPanelDetailTracks('search');
      if (active() && st.hasMore && st.nextOffset <= before) throw new Error('歌单分页未前进，请重新打开歌单重试');
      if (active()) { s.status = '正在载入歌单 ' + st.tracks.length + ' / ' + st.total; playlistSearchRefresh(); }
    }
    if (!active()) return;
    if (st.error) throw new Error('歌单未完整载入，请重新打开歌单重试');
    if (s.mode === 'semantic') {
      var bridge = smartFavoritesBridge();
      if (!bridge || typeof bridge.embedMuqTexts !== 'function') throw new Error('语义搜索需要桌面版 MuQ 模型');
      s.status = '正在计算文本向量…'; playlistSearchRefresh();
      var result = await bridge.embedMuqTexts([{ value: query, label: query, kind: 'style' }]);
      if (!active()) return;
      if (!result || !result.ok || !result.vectors || !result.vectors[query]) throw new Error('MuQ 文本编码失败，请检查模型后重试');
      var textVector = result.vectors[query], failed = 0;
      for (var i = 0; i < st.tracks.length; i++) {
        if (!active()) return;
        try {
          var vector = await smartMuqEnsureAudio(st.tracks[i]);
          if (!active()) return;
          var score = smartMuqCosine(textVector, vector);
          if (!Number.isFinite(score)) throw new Error('无效向量');
          s.scores[i] = Math.max(0, Math.min(100, score * 100));
        } catch (error) { if (!active()) return; failed++; }
        s.status = '已分析 ' + (i + 1) + ' / ' + st.tracks.length + (failed ? ' · ' + failed + ' 首无法分析' : '');
        if (i % 5 === 0 || i === st.tracks.length - 1) playlistSearchRefresh();
      }
      s.status = '分析完成 · ' + (st.tracks.length - failed) + ' / ' + st.tracks.length + ' 首' + (failed ? ' · ' + failed + ' 首无法分析，可重试' : '');
    } else s.status = '已搜索完整歌单 · ' + st.tracks.length + ' 首';
  } catch (error) {
    if (active()) s.status = /MUQ_RUNTIME|MUQ_WORKER/.test(String(error.message)) ? 'MuQ 模型不可用，请安装模型后重试' : (error.message || '搜索失败，请重试');
  } finally {
    if (active()) { s.busy = false; playlistSearchPruneSelection(); playlistSearchRefresh(); }
  }
}

async function playlistSearchRemoveSelected(st, s, indices, tracks) {
  var provider = st.key.split(':')[0], id = st.key.slice(provider.length + 1);
  var result = provider === 'favoradio'
    ? await window.desktopWindow.removeBuiltInPlaylistTracks(id, tracks)
    : await apiJson('/api/playlist/remove-songs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pid: id, ids: tracks.map(function (track) { return songAccountId(track, provider); }) }) });
  if (!result || result.error || result.ok === false || result.success === false) throw new Error('移除失败，请检查歌单权限后重试');
  var removed = new Set(indices), scores = {}, nextIndex = 0;
  st.tracks.forEach(function (_, index) { if (!removed.has(index)) scores[nextIndex++] = s.scores[index]; });
  indices.forEach(function (index) { st.tracks.splice(index, 1); });
  st.total = Math.max(st.tracks.length, st.total - tracks.length);
  st.nextOffset = Math.max(0, st.nextOffset - tracks.length);
  s.scores = scores; s.selected.clear();
  if (provider === 'favoradio') applyBuiltInPlaylistSnapshot(result, { preserveScroll: true });
  else refreshUserPlaylists(true);
}

async function playlistSearchBatch(action) {
  if (action !== 'delete' && action !== 'move' && action !== 'copy') return;
  var st = playlistPanelDetailState, s = playlistSearchState();
  playlistSearchPruneSelection();
  if (s.busy || s.actionBusy || !s.selected.size) return;
  var indices = Array.from(s.selected).sort(function (a, b) { return b - a; });
  var tracks = indices.map(function (i) { return st.tracks[i]; });
  var target = playlistSearchTargets().find(function (pl) { return playlistPanelKey(pl.provider, pl.id) === s.target; });
  if (action === 'delete') {
    if (playlistSearchDeleteReason()) return;
    if (!window.confirm('从“' + (st.playlist.name || '当前歌单') + '”删除选中的 ' + tracks.length + ' 首歌曲？不会删除本地音频文件。')) return;
  } else if (!target) return;
  if (action === 'move' && playlistSearchDeleteReason()) return;
  s.actionBusy = true; s.status = action === 'delete' ? '正在删除…' : (action === 'move' ? '正在移动…' : '正在复制…'); playlistSearchRefresh();
  var done = 0, result, removalStarted = false;
  try {
    if (st.pageRequest) await st.pageRequest;
    if (action === 'delete') {
      await playlistSearchRemoveSelected(st, s, indices, tracks); done = tracks.length;
    } else if (target.provider === 'favoradio') {
      result = await window.desktopWindow.addBuiltInPlaylistTracks(target.id, tracks);
      if (!result || !result.ok) throw new Error(builtInPlaylistErrorMessage(result, '复制失败'));
      done = tracks.length;
      if (action === 'copy') s.selected.clear();
      applyBuiltInPlaylistSnapshot(result, { preserveScroll: true });
    } else {
      var adapter = songAccountAdapter(target.provider);
      for (var i = 0; i < tracks.length; i++) {
        result = await apiJson(adapter.playlistAddUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pid: target.id, id: songAccountId(tracks[i], target.provider), song: tracks[i] }) });
        var failed = !result || result.error || result.success === false;
        var duplicate = failed && /exist|重复|已存在|already/i.test(String(result && (result.error || result.message || result.msg) || ''));
        if (failed && !duplicate) throw new Error('目标歌单写入失败，请重试');
        // A move needs read-back confirmation before any source songs are removed.
        if ((action === 'move' || duplicate) && !await verifySongInPlaylist(target.id, tracks[i])) throw new Error('尚未确认歌曲写入目标歌单，请稍后重试');
        done++;
        if (action === 'copy') s.selected.delete(indices[i]);
      }
      refreshUserPlaylists(true);
    }
    if (action === 'move') {
      removalStarted = true;
      s.status = '目标歌单已写入，正在从原歌单移除…'; playlistSearchRefresh();
      await playlistSearchRemoveSelected(st, s, indices, tracks);
    }
    s.status = (action === 'delete' ? '已删除 ' : (action === 'move' ? '已移动 ' : '已复制 ')) + done + ' 首';
  } catch (error) {
    s.status = action === 'move'
      ? (removalStarted ? '目标歌单已写入，原歌单移除未确认，请刷新后重试' : '已写入目标歌单 ' + done + ' / ' + tracks.length + ' 首，未从原歌单移除') + ' · ' + (error.message || '请重试')
      : '已完成 ' + done + ' / ' + tracks.length + ' 首 · ' + (error.message || '操作失败，可重试');
  }
  finally { s.actionBusy = false; if (playlistPanelDetailState === st) playlistSearchRefresh(); showToast(s.status); }
}

var playlistSearchRoot = document.getElementById('pl-list');
playlistSearchRoot.addEventListener('submit', function (event) {
  if (!event.target.matches('.pl-search-form')) return;
  event.preventDefault(); runPlaylistSearch();
});
playlistSearchRoot.addEventListener('keydown', function (event) {
  if (event.target.id === 'pl-search-query' && event.key === 'Enter' && event.isComposing) event.preventDefault();
});
playlistSearchRoot.addEventListener('input', function (event) {
  var s = playlistSearchState();
  if (event.target.id === 'pl-search-query') s.draft = event.target.value;
  if (event.target.id === 'pl-search-threshold') event.target.nextElementSibling.textContent = event.target.value + '%';
});
playlistSearchRoot.addEventListener('change', function (event) {
  var s = playlistSearchState(), target = event.target;
  if (s.actionBusy) return;
  if (target.id === 'pl-search-mode') { s.mode = target.value; playlistSearchReset(false); }
  if (target.id === 'pl-search-threshold') { s.threshold = Math.max(0, Math.min(100, Number(target.value) || 0)); playlistSearchPruneSelection(); playlistSearchRefresh(true); }
  if (target.id === 'pl-search-all' && !s.busy) { s.selected = target.checked ? new Set(playlistSearchRows().map(function (row) { return row.index; })) : new Set(); playlistSearchRefresh(); }
  if (target.hasAttribute('data-pl-search-select') && !s.busy) { var index = Number(target.getAttribute('data-pl-search-select')); if (target.checked) s.selected.add(index); else s.selected.delete(index); playlistSearchRefresh(); }
  if (target.id === 'pl-search-target') { s.target = target.value; playlistSearchRefresh(); }
});
playlistSearchRoot.addEventListener('click', function (event) {
  var button = event.target.closest('[data-pl-search-action]');
  if (!button) return;
  var action = button.getAttribute('data-pl-search-action');
  if (action === 'clear' && !playlistSearchState().actionBusy) playlistSearchReset(true);
  if (action === 'delete' || action === 'move' || action === 'copy') playlistSearchBatch(action);
});
