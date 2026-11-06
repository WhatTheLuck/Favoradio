'use strict';
// Isolated renderer with real playlist modules/CSS; vector and account services are fixtures.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'playlist-search-ui-'));
const output = path.join(root, 'output', 'playlist-search');
fs.mkdirSync(output, { recursive: true });
const fixture = `
var PLAYLIST_DETAIL_INITIAL_RENDER=96, PLAYLIST_DETAIL_ROW_STEP=56, PLAYLIST_DETAIL_VIRTUAL_OVERSCAN=7,
PLAYLIST_DETAIL_OUTER_CHROME_HEIGHT=142, PLAYLIST_DETAIL_OUTER_FOOTER_HEIGHT=44, PLAYLIST_CARD_VIRTUAL_OVERSCAN_PX=760;
var playlistRenderSeq=0,playlistCatalogRevision=0,playlistCatalogSyncState={},userPlaylists=[];
function escHtml(s){return String(s||'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');}
function songCoverSrc(){return '';}
function songAccountProvider(s){return s.provider||'netease';}
function isSongAccountLoggedIn(){return true;}
function queuePanelItemKey(s){return s.id;}
function showToast(s){window.lastToast=s;}
function smartFavoritesBridge(){return {embedMuqTexts:async function(tags){return {ok:true,vectors:{[tags[0].value]:[1,0]}};}};}
function smartMuqEnsureAudio(track){return Promise.resolve(track.vector);}
function smartMuqCosine(a,b){return b[0];}
function applyBuiltInPlaylistSnapshot(){}
function builtInPlaylistErrorMessage(){return '收藏失败';}
window.desktopWindow={addBuiltInPlaylistTracks:async function(id,tracks){window.savedTracks=tracks;return {ok:true};},removeBuiltInPlaylistTracks:async function(id,tracks){window.removedTracks=tracks;return {ok:true};}};
window.confirm=function(){return true;};
`;
const init = `
userPlaylists=[{id:'demo',provider:'favoradio',name:'深夜慢听',creator:'Favoradio',trackCount:120},{id:'target',provider:'favoradio',name:'我的收藏',trackCount:0}];
playlistPanelDetailState={key:'favoradio:demo',playlist:userPlaylists[0],tracks:Array.from({length:120},function(_,i){return {id:i+1,provider:'netease',name:i===0?'悲伤的夜晚':'夜曲 '+(i+1),artist:'测试歌手',album:'夜行',vector:[i===0?.92:i===1?.81:.3,0]};}),total:120,nextOffset:120,hasMore:false};
renderUserPlaylistsList();
`;
const html = '<!doctype html><html><head><meta charset="utf-8"><style>' +
  fs.readFileSync(path.join(root, 'public/css/index.css'), 'utf8') + '\n' +
  fs.readFileSync(path.join(root, 'public/css/playlist-search.css'), 'utf8') +
  '\nbody{background:#10151d} #playlist-panel{display:block!important;position:relative!important;transform:none!important;opacity:1!important;visibility:visible!important;left:0!important;top:0!important;width:100%!important;max-width:540px!important;height:100vh!important;overflow:auto!important;margin:0 auto;padding:12px!important;box-sizing:border-box} #playlist-panel .pl-detail-sticky{top:0}</style></head><body><div id="playlist-panel"><div id="pl-list"></div></div><script>' + fixture + '</script><script>' +
  fs.readFileSync(path.join(root, 'public/js/modules/06-lyrics/02-playlist-detail.js'), 'utf8') + '</script><script>' +
  fs.readFileSync(path.join(root, 'public/js/modules/06-lyrics/02a-playlist-search.js'), 'utf8') + '</script><script>' + init + '</script></body></html>';
fs.writeFileSync(path.join(temp, 'index.html'), html);
fs.writeFileSync(path.join(temp, 'smoke.cjs'), `
const {app,BrowserWindow}=require('electron');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
app.disableHardwareAcceleration();
app.setPath('userData',path.join(${JSON.stringify(temp)},'profile'));
app.whenReady().then(async()=>{
 const win=new BrowserWindow({show:false,width:640,height:850,webPreferences:{contextIsolation:true,nodeIntegration:false}});
 const errors=[];win.webContents.on('console-message',(_e,level,message)=>{if(level===3)errors.push(message);});
 const run=s=>win.webContents.executeJavaScript(s,true);
 try{
  await win.loadFile(${JSON.stringify(path.join(temp, 'index.html'))});
  assert.equal(await run("document.querySelectorAll('#pl-search-query').length"),1);
  await run("var input=document.getElementById('pl-search-query');input.focus();input.value='夜曲';input.dispatchEvent(new Event('input',{bubbles:true}));input.setSelectionRange(1,1);renderUserPlaylistsList({preserveScroll:true});");
  assert.equal(await run("document.activeElement.id+':'+document.activeElement.selectionStart"),'pl-search-query:1');
  await run("document.getElementById('playlist-panel').scrollTop=3500;renderUserPlaylistsList({preserveScroll:true});");
  await run("document.getElementById('pl-search-mode').value='semantic';document.getElementById('pl-search-mode').dispatchEvent(new Event('change',{bubbles:true}));var input=document.getElementById('pl-search-query');input.value='悲伤';input.dispatchEvent(new Event('input',{bubbles:true}));document.querySelector('.pl-search-form').requestSubmit();");
  for(let i=0;i<100 && await run('playlistSearchState().busy');i++)await new Promise(r=>setTimeout(r,20));
  assert.equal(await run('playlistSearchRows().length'),2);
  assert.equal(await run("document.getElementById('playlist-panel').scrollTop < 500"),true,'filtering returns from a distant virtual row to the results');
  assert.deepEqual(await run("Array.from(document.querySelectorAll('.pl-search-score span'),x=>x.textContent)"),['92.0%','81.0%']);
  await run("document.getElementById('pl-search-all').click()");
  assert.equal(await run('playlistSearchState().selected.size'),2);
  await run("document.getElementById('pl-search-threshold').value=85;document.getElementById('pl-search-threshold').dispatchEvent(new Event('change',{bubbles:true}));");
  assert.equal(await run('playlistSearchState().selected.size'),1);
  for(const width of [540,340]){
   win.setContentSize(width,850);await new Promise(r=>setTimeout(r,80));
   await run('renderUserPlaylistsList({preserveScroll:true})');
   const overflow=await run("Array.from(document.querySelectorAll('.pl-search-form,.pl-search-filter,.pl-search-selection,.pl-search-collect')).filter(el=>el.scrollWidth>el.clientWidth+1).length");
   assert.equal(overflow,0,'toolbar overflow at '+width);
   fs.writeFileSync(path.join(${JSON.stringify(output)},'semantic-'+width+'.png'),(await win.webContents.capturePage()).toPNG());
  }
  assert.equal(await run("!!document.querySelector('[data-pl-search-action=collect]')"),false);
  assert.equal(await run("Array.from(document.getElementById('pl-search-target').options).some(o=>o.value==='favoradio:demo')"),false);
  await run("document.getElementById('pl-search-target').value='favoradio:target';document.getElementById('pl-search-target').dispatchEvent(new Event('change',{bubbles:true}));document.querySelector('[data-pl-search-action=copy]').click();");
  for(let i=0;i<50 && await run('playlistSearchState().actionBusy');i++)await new Promise(r=>setTimeout(r,20));
  assert.deepEqual(await run('savedTracks.map(t=>t.id)'),[1]);
  assert.equal(await run('playlistPanelDetailState.tracks.length'),120);
  await run("document.getElementById('pl-search-all').click();document.querySelector('[data-pl-search-action=move]').click();");
  for(let i=0;i<50 && await run('playlistSearchState().actionBusy');i++)await new Promise(r=>setTimeout(r,20));
  assert.deepEqual(await run('removedTracks.map(t=>t.id)'),[1]);
  assert.equal(await run('playlistPanelDetailState.tracks.length'),119);
  assert.equal(await run('playlistSearchRows().length'),0);
  assert.equal(await run("document.querySelector('.pl-detail-list').textContent.includes('没有符合条件')"),true);
  assert.equal(errors.length,0,errors.join('\\n'));
  console.log('PLAYLIST_SEARCH_UI_OK');app.exit(0);
 }catch(e){console.error(e.stack);app.exit(1);}
});
`);
try {
  const env = { ...process.env }; delete env.ELECTRON_RUN_AS_NODE;
  const result = spawnSync(path.join(root, 'node_modules/electron/dist/electron.exe'), [path.join(temp, 'smoke.cjs')], { env, cwd: root, encoding: 'utf8', timeout: 45000, windowsHide: true });
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stdout, /PLAYLIST_SEARCH_UI_OK/);
  console.log('Playlist search Electron UI passed (540px / 340px). Screenshots: ' + output);
} finally { fs.rmSync(temp, { recursive: true, force: true }); }
