function faveradioCacheStorageNode(id) {
  return document.getElementById(id);
}

function formatFaveradioCacheBytes(value) {
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

function setFaveradioCacheStorageText(id, value) {
  var node = faveradioCacheStorageNode(id);
  if (node) node.textContent = value == null || value === '' ? '—' : String(value);
}

function applyFaveradioCacheSettings(snapshot) {
  if (!snapshot || !snapshot.ok) {
    setFaveradioCacheStorageText('cache-storage-total', '读取失败');
    setFaveradioCacheStorageText('cache-storage-note', snapshot && snapshot.error ? ('缓存设置不可用：' + snapshot.error) : '缓存设置不可用');
    return;
  }
  var settings = snapshot.settings || {};
  var usage = snapshot.usage || {};
  setFaveradioCacheStorageText('cache-storage-root', settings.rootPath);
  setFaveradioCacheStorageText('cache-storage-total', '已占用 ' + formatFaveradioCacheBytes(usage.totalManagedBytes));
  setFaveradioCacheStorageText('cache-storage-lyrics-path', settings.lyricsPath);
  setFaveradioCacheStorageText('cache-storage-lyrics-size', formatFaveradioCacheBytes(usage.lyricsBytes));
  setFaveradioCacheStorageText('cache-storage-chromium-path', settings.activeChromiumPath || settings.chromiumPath);
  setFaveradioCacheStorageText('cache-storage-chromium-size', formatFaveradioCacheBytes(usage.chromiumBytes));
  setFaveradioCacheStorageText('cache-storage-beatmaps-path', settings.activeBeatmapsPath || settings.beatmapsPath);
  setFaveradioCacheStorageText('cache-storage-beatmaps-size', formatFaveradioCacheBytes(usage.beatmapsBytes));
  setFaveradioCacheStorageText('cache-storage-wallpaper-path', settings.activeWallpaperEnginePath || settings.wallpaperEnginePath);
  setFaveradioCacheStorageText('cache-storage-wallpaper-size', formatFaveradioCacheBytes(usage.wallpaperEngineBytes));
  setFaveradioCacheStorageText('cache-storage-userdata-path', settings.userDataPath || '系统安全数据目录');
  setFaveradioCacheStorageText('cache-storage-userdata-size', formatFaveradioCacheBytes(usage.userDataBytes));
  var restartButton = faveradioCacheStorageNode('cache-storage-restart');
  if (restartButton) restartButton.hidden = !settings.restartRequired;
  setFaveradioCacheStorageText(
    'cache-storage-note',
    settings.restartRequired
      ? '歌词缓存已切换；封面、网络、音频分片、节奏分析与 WE 静音场景将在重启后改用新目录。'
      : '歌词缓存立即生效；封面、网络、音频分片、节奏分析与 WE 静音场景已使用此目录。'
  );
}

function refreshFaveradioCacheSettings() {
  if (!window.desktopWindow || typeof window.desktopWindow.getCacheSettings !== 'function') {
    applyFaveradioCacheSettings({ ok: false, error: '仅桌面版支持本地缓存路径设置' });
    return Promise.resolve();
  }
  setFaveradioCacheStorageText('cache-storage-total', '正在统计...');
  return window.desktopWindow.getCacheSettings().then(applyFaveradioCacheSettings).catch(function (error) {
    applyFaveradioCacheSettings({ ok: false, error: error && error.message || '读取失败' });
  });
}

function chooseFaveradioCacheRoot() {
  if (!window.desktopWindow || typeof window.desktopWindow.chooseCacheDirectory !== 'function') return;
  window.desktopWindow.chooseCacheDirectory().then(function (choice) {
    if (!choice || !choice.ok || choice.canceled || !choice.rootPath) return;
    return window.desktopWindow.setCacheSettings({ rootPath: choice.rootPath });
  }).then(function (snapshot) {
    if (snapshot) applyFaveradioCacheSettings(snapshot);
  }).catch(function (error) {
    applyFaveradioCacheSettings({ ok: false, error: error && error.message || '保存失败' });
  });
}

function restartFaveradioForCachePath() {
  if (!window.desktopWindow || typeof window.desktopWindow.restartApp !== 'function') return;
  window.desktopWindow.restartApp();
}

setTimeout(refreshFaveradioCacheSettings, 450);
