function favoradioCacheStorageNode(id) {
  return document.getElementById(id);
}

function formatFavoradioCacheBytes(value) {
  var bytes = Math.max(0, Number(value) || 0);
  if (bytes < 1024) return bytes + ' B';
  var units = ['KB', 'MB', 'GB', 'TB'];
  var index = -1;
  do {
    bytes /= 1024;
    index += 1;
  } while (bytes >= 1024 && index < units.length - 1);
  return (bytes >= 100 || index === 0 ? bytes.toFixed(0) : bytes.toFixed(1)) + ' ' + units[index];
}

function setFavoradioCacheStorageText(id, value) {
  var node = favoradioCacheStorageNode(id);
  if (node) node.textContent = value == null || value === '' ? '—' : String(value);
}

function applyFavoradioCacheSettings(snapshot) {
  if (!snapshot || !snapshot.ok) {
    setFavoradioCacheStorageText('cache-storage-total', '读取失败');
    setFavoradioCacheStorageText('cache-storage-note', snapshot && snapshot.error ? ('缓存设置不可用：' + snapshot.error) : '缓存设置不可用');
    return;
  }
  var settings = snapshot.settings || {};
  var usage = snapshot.usage || {};
  setFavoradioCacheStorageText('cache-storage-root', settings.rootPath);
  setFavoradioCacheStorageText('cache-storage-total', '已占用 ' + formatFavoradioCacheBytes(usage.totalManagedBytes));
  setFavoradioCacheStorageText('cache-storage-lyrics-path', settings.lyricsPath);
  setFavoradioCacheStorageText('cache-storage-lyrics-size', formatFavoradioCacheBytes(usage.lyricsBytes));
  setFavoradioCacheStorageText('cache-storage-chromium-path', settings.activeChromiumPath || settings.chromiumPath);
  setFavoradioCacheStorageText('cache-storage-chromium-size', formatFavoradioCacheBytes(usage.chromiumBytes));
  setFavoradioCacheStorageText('cache-storage-beatmaps-path', settings.activeBeatmapsPath || settings.beatmapsPath);
  setFavoradioCacheStorageText('cache-storage-beatmaps-size', formatFavoradioCacheBytes(usage.beatmapsBytes));
  setFavoradioCacheStorageText('cache-storage-wallpaper-path', settings.activeWallpaperEnginePath || settings.wallpaperEnginePath);
  setFavoradioCacheStorageText('cache-storage-wallpaper-size', formatFavoradioCacheBytes(usage.wallpaperEngineBytes));
  setFavoradioCacheStorageText('cache-storage-userdata-path', settings.userDataPath || '系统安全数据目录');
  setFavoradioCacheStorageText('cache-storage-userdata-size', formatFavoradioCacheBytes(usage.userDataBytes));
  var restartButton = favoradioCacheStorageNode('cache-storage-restart');
  if (restartButton) restartButton.hidden = !settings.restartRequired;
  setFavoradioCacheStorageText(
    'cache-storage-note',
    settings.restartRequired
      ? '歌词缓存已切换；封面、网络、音频分片、节奏分析与 WE 静音场景将在重启后改用新目录。'
      : '歌词缓存立即生效；封面、网络、音频分片、节奏分析与 WE 静音场景已使用此目录。'
  );
}

function refreshFavoradioCacheSettings() {
  if (!window.desktopWindow || typeof window.desktopWindow.getCacheSettings !== 'function') {
    applyFavoradioCacheSettings({ ok: false, error: '仅桌面版支持本地缓存路径设置' });
    return Promise.resolve();
  }
  setFavoradioCacheStorageText('cache-storage-total', '正在统计...');
  return window.desktopWindow.getCacheSettings().then(applyFavoradioCacheSettings).catch(function (error) {
    applyFavoradioCacheSettings({ ok: false, error: error && error.message || '读取失败' });
  });
}

function chooseFavoradioCacheRoot() {
  if (!window.desktopWindow || typeof window.desktopWindow.chooseCacheDirectory !== 'function') return;
  window.desktopWindow.chooseCacheDirectory().then(function (choice) {
    if (!choice || !choice.ok || choice.canceled || !choice.rootPath) return;
    return window.desktopWindow.setCacheSettings({ rootPath: choice.rootPath });
  }).then(function (snapshot) {
    if (snapshot) applyFavoradioCacheSettings(snapshot);
  }).catch(function (error) {
    applyFavoradioCacheSettings({ ok: false, error: error && error.message || '保存失败' });
  });
}

function restartFavoradioForCachePath() {
  if (!window.desktopWindow || typeof window.desktopWindow.restartApp !== 'function') return;
  window.desktopWindow.restartApp();
}

setTimeout(refreshFavoradioCacheSettings, 450);
