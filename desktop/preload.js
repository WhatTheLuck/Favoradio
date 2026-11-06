const { contextBridge, ipcRenderer, clipboard, webUtils } = require('electron');

contextBridge.exposeInMainWorld('desktopWindow', {
  isDesktop: true,
  minimize: () => ipcRenderer.invoke('desktop-window-minimize'),
  restore: () => ipcRenderer.invoke('desktop-window-restore'),
  toggleMaximize: () => ipcRenderer.invoke('desktop-window-toggle-maximize'),
  toggleFullscreen: () => ipcRenderer.invoke('desktop-window-toggle-fullscreen'),
  exitFullscreenWindowed: () => ipcRenderer.invoke('desktop-window-exit-fullscreen-windowed'),
  getState: () => ipcRenderer.invoke('desktop-window-get-state'),
  getGpuDiagnostics: () => ipcRenderer.invoke('favoradio-get-gpu-diagnostics'),
  getMemorySnapshot: () => ipcRenderer.invoke('favoradio-memory-get-snapshot'),
  configureMemoryReduct: (payload) => ipcRenderer.invoke('favoradio-memory-configure-auto', payload || {}),
  trimAppMemory: (payload) => ipcRenderer.invoke('favoradio-memory-trim-app', payload || {}),
  purgeSystemMemory: (payload) => ipcRenderer.invoke('favoradio-memory-purge-system', payload || {}),
  getCacheSettings: () => ipcRenderer.invoke('favoradio-cache-get-settings'),
  chooseCacheDirectory: () => ipcRenderer.invoke('favoradio-cache-choose-directory'),
  setCacheSettings: (payload) => ipcRenderer.invoke('favoradio-cache-set-settings', payload || {}),
  listWallpaperEngineProjects: (payload) => ipcRenderer.invoke('favoradio-wallpaper-engine-list', payload || {}),
  getWallpaperEngineProjectDetails: (id) => ipcRenderer.invoke('favoradio-wallpaper-engine-project-details', String(id || '')),
  openWallpaperEngineProjectDetails: (id, target) => ipcRenderer.invoke('favoradio-wallpaper-engine-open-project-details', {
    id: String(id || ''),
    target: target === 'workshop' ? 'workshop' : 'we',
  }),
  chooseWallpaperEngineDirectory: () => ipcRenderer.invoke('favoradio-wallpaper-engine-choose-directory'),
  chooseWallpaperEngineProjectFile: () => ipcRenderer.invoke('favoradio-wallpaper-engine-choose-project-file'),
  removeWallpaperEngineDirectory: (rootId) => ipcRenderer.invoke('favoradio-wallpaper-engine-remove-directory', String(rootId || '')),
  getWallpaperEngineRuntimeStatus: (payload) => ipcRenderer.invoke('favoradio-wallpaper-engine-runtime-status', payload || {}),
  startWallpaperEngineScene: (payload) => ipcRenderer.invoke('favoradio-wallpaper-engine-start-scene', payload || {}),
  reportWallpaperEngineCaptureResult: (payload) => ipcRenderer.invoke('favoradio-wallpaper-engine-capture-result', payload || {}),
  prepareWallpaperEngineGlassCapture: (payload) => ipcRenderer.invoke('favoradio-wallpaper-engine-prepare-glass-capture', payload || {}),
  activateWallpaperEngineDwmSurface: (payload) => ipcRenderer.invoke('favoradio-wallpaper-engine-activate-dwm-surface', payload || {}),
  updateWallpaperEngineGlassSurface: (payload) => ipcRenderer.send('favoradio-wallpaper-engine-glass-surface', payload || {}),
  updateWallpaperEngineVisualSettings: (payload) => ipcRenderer.send('favoradio-wallpaper-engine-visual-settings', payload || {}),
  reportWallpaperEnginePointerActivity: (payload) => ipcRenderer.send('favoradio-wallpaper-engine-pointer-activity', payload || {}),
  stopWallpaperEngineScene: (payload) => ipcRenderer.invoke('favoradio-wallpaper-engine-stop-scene', payload || {}),
  onWallpaperEngineHostBoundsChanged: (callback) => {
    if (typeof callback !== 'function') return () => {};
    const listener = (_event, payload) => callback(payload || {});
    ipcRenderer.on('favoradio-wallpaper-engine-host-bounds-changed', listener);
    return () => ipcRenderer.removeListener('favoradio-wallpaper-engine-host-bounds-changed', listener);
  },
  listLocalMusicLibrary: () => ipcRenderer.invoke('favoradio-local-library-list'),
  readLocalMusicLyric: (localFileId) => ipcRenderer.invoke('favoradio-local-library-lyric', String(localFileId || '')),
  listBuiltInPlaylists: () => ipcRenderer.invoke('favoradio-built-in-playlists-list'),
  readBuiltInPlaylist: (id, options) => ipcRenderer.invoke('favoradio-built-in-playlist-page', String(id || ''), options || {}),
  createBuiltInPlaylist: (name) => ipcRenderer.invoke('favoradio-built-in-playlist-create', String(name || '')),
  renameBuiltInPlaylist: (id, name) => ipcRenderer.invoke('favoradio-built-in-playlist-rename', String(id || ''), String(name || '')),
  deleteBuiltInPlaylist: (id) => ipcRenderer.invoke('favoradio-built-in-playlist-delete', String(id || '')),
  addBuiltInPlaylistTrack: (id, track) => ipcRenderer.invoke('favoradio-built-in-playlist-add-track', String(id || ''), track || {}),
  addBuiltInPlaylistTracks: (id, tracks) => ipcRenderer.invoke('favoradio-built-in-playlist-add-tracks', String(id || ''), tracks),
  removeBuiltInPlaylistTracks: (id, tracks) => ipcRenderer.invoke('favoradio-built-in-playlist-remove-tracks', String(id || ''), tracks),
  removeBuiltInPlaylistTrack: (id, index) => ipcRenderer.invoke('favoradio-built-in-playlist-remove-track', String(id || ''), Number(index)),
  reorderBuiltInPlaylistTrack: (id, fromIndex, toIndex) => ipcRenderer.invoke('favoradio-built-in-playlist-reorder-track', String(id || ''), Number(fromIndex), Number(toIndex)),
  visualPresets: (action,kind,name,value) => ipcRenderer.invoke('favoradio-visual-presets',action,kind,name,value),
  createMergedPlaylist: (name,tracks) => ipcRenderer.invoke('favoradio-merge-playlists',name,tracks),
  readSmartFavorites: () => ipcRenderer.invoke('favoradio-smart-favorites-read'),
  saveSmartFavorites: (state) => ipcRenderer.invoke('favoradio-smart-favorites-save', state || {}),
  getSmartFavoritesLlmStatus: () => ipcRenderer.invoke('favoradio-smart-favorites-llm-status'),
  configureSmartFavoritesLlm: (payload) => ipcRenderer.invoke('favoradio-smart-favorites-llm-configure', payload || {}),
  clearSmartFavoritesLlm: () => ipcRenderer.invoke('favoradio-smart-favorites-llm-clear'),
  testSmartFavoritesLlm: () => ipcRenderer.invoke('favoradio-smart-favorites-llm-test'),
  analyzeSmartFavoriteTracks: (tracks, tags) => ipcRenderer.invoke('favoradio-smart-favorites-analyze', Array.isArray(tracks) ? tracks : [], Array.isArray(tags) ? tags : []),
  getMuqStatus: () => ipcRenderer.invoke('favoradio-muq-status'),
  getMuqAudioCache: (keys) => ipcRenderer.invoke('favoradio-muq-audio-cache', keys),
  embedMuqAudio: (key, fingerprint, pcm) => ipcRenderer.invoke('favoradio-muq-embed-audio', key, fingerprint, pcm),
  embedMuqTexts: (tags) => ipcRenderer.invoke('favoradio-muq-embed-texts', tags),
  getEmomusicVlmStatus: () => ipcRenderer.invoke('favoradio-emomusic-vlm-status'),
  analyzeEmomusicFrame: (imageDataUrl) => ipcRenderer.invoke('favoradio-emomusic-vlm-analyze', String(imageDataUrl || '')),
  importLocalMusicFiles: async (files) => {
    const entries = [];
    for (const file of Array.from(files || [])) {
      let filePath = '';
      try {
        filePath = webUtils && typeof webUtils.getPathForFile === 'function' ? webUtils.getPathForFile(file) : '';
      } catch (_) {}
      if (!filePath) continue;
      entries.push({
        path: filePath,
        relativePath: String(file && (file.webkitRelativePath || file.name) || ''),
      });
    }
    if (!entries.length) return { ok: false, count: 0, tracks: [], error: 'NO_AUTHORIZED_LOCAL_AUDIO' };
    const authorization = await ipcRenderer.invoke('favoradio-local-library-authorize', { files: entries });
    if (!authorization || authorization.ok !== true || !authorization.token) return authorization;
    return ipcRenderer.invoke('favoradio-local-library-import', { token: authorization.token });
  },
  readLyricCache: (key) => ipcRenderer.invoke('favoradio-cache-read-lyric', key || ''),
  writeLyricCache: (key, payload) => ipcRenderer.invoke('favoradio-cache-write-lyric', key || '', payload || {}),
  close: (behavior) => ipcRenderer.invoke('desktop-window-close', behavior),
  getCloseBehavior: () => ipcRenderer.invoke('desktop-window-get-close-behavior'),
  setCloseBehavior: (behavior) => ipcRenderer.invoke('desktop-window-set-close-behavior', behavior),
  getLoginEasterEggStatus: () => ipcRenderer.invoke('favoradio-login-easter-egg-status'),
  unlockLoginEasterEgg: (value) => ipcRenderer.invoke('favoradio-login-easter-egg-unlock', String(value || '')),
  resetLoginEasterEgg: () => ipcRenderer.invoke('favoradio-login-easter-egg-reset'),
  openNeteaseMusicLogin: () => ipcRenderer.invoke('netease-music-open-login'),
  clearNeteaseMusicLogin: () => ipcRenderer.invoke('netease-music-clear-login'),
  openQQMusicLogin: (options) => ipcRenderer.invoke('qq-music-open-login', options || {}),
  clearQQMusicLogin: () => ipcRenderer.invoke('qq-music-clear-login'),
  openKugouMusicLogin: (options) => ipcRenderer.invoke('kugou-music-open-login', options || {}),
  clearKugouMusicLogin: () => ipcRenderer.invoke('kugou-music-clear-login'),
  clearQishuiMusicLogin: () => ipcRenderer.invoke('qishui-music-clear-login'),
  openUpdatePage: (url) => ipcRenderer.invoke('favoradio-open-update-page', String(url || '')),
  restartApp: () => ipcRenderer.invoke('favoradio-restart-app'),
  configureGlobalHotkeys: (bindings) => ipcRenderer.invoke('favoradio-hotkeys-configure-global', bindings || []),
  copyText: (text) => {
    clipboard.writeText(String(text || ''));
    return { ok: true };
  },
  readText: () => ({ ok: true, text: clipboard.readText() || '' }),
  exportJsonFile: (payload) => ipcRenderer.invoke('favoradio-export-json-file', payload || {}),
  exportLoginCookie: (provider) => ipcRenderer.invoke('favoradio-export-login-cookie', provider || ''),
  importJsonFile: () => ipcRenderer.invoke('favoradio-import-json-file'),
  readCurrentFxAutosaveSync: () => ipcRenderer.sendSync('favoradio-current-fx-autosave-read-sync'),
  saveCurrentFxAutosaveSync: (payload) => ipcRenderer.sendSync('favoradio-current-fx-autosave-save-sync', payload || {}),
  saveCurrentFxAutosave: (payload) => ipcRenderer.invoke('favoradio-current-fx-autosave-save', payload || {}),
  onGlobalHotkey: (callback) => {
    if (typeof callback !== 'function') return () => {};
    const listener = (_event, payload) => callback(payload || {});
    ipcRenderer.on('favoradio-global-hotkey', listener);
    return () => ipcRenderer.removeListener('favoradio-global-hotkey', listener);
  },
  setDesktopLyricsEnabled: (enabled, payload) => ipcRenderer.invoke('favoradio-desktop-lyrics-set-enabled', !!enabled, payload || {}),
  updateDesktopLyrics: (payload) => ipcRenderer.invoke('favoradio-desktop-lyrics-update', payload || {}),
  onDesktopLyricsLockState: (callback) => {
    if (typeof callback !== 'function') return () => {};
    const listener = (_event, payload) => callback(payload || {});
    ipcRenderer.on('favoradio-desktop-lyrics-lock-state', listener);
    return () => ipcRenderer.removeListener('favoradio-desktop-lyrics-lock-state', listener);
  },
  onDesktopLyricsEnabledState: (callback) => {
    if (typeof callback !== 'function') return () => {};
    const listener = (_event, payload) => callback(payload || {});
    ipcRenderer.on('favoradio-desktop-lyrics-enabled-state', listener);
    return () => ipcRenderer.removeListener('favoradio-desktop-lyrics-enabled-state', listener);
  },
  setWallpaperMode: (enabled, payload) => ipcRenderer.invoke('favoradio-wallpaper-set-enabled', !!enabled, payload || {}),
  updateWallpaperMode: (payload) => ipcRenderer.invoke('favoradio-wallpaper-update', payload || {}),
  getWallpaperModeStatus: () => ipcRenderer.invoke('favoradio-wallpaper-get-status'),
  requestGestureCameraPermission: () => ipcRenderer.invoke('favoradio-gesture-camera-request-permission'),
  updateDesktopIconShields: (payload) => ipcRenderer.send('favoradio-full-desktop-icon-shields', payload || {}),
  setDesktopSoftwareLocked: (locked) => ipcRenderer.invoke('favoradio-full-desktop-set-software-lock', locked === true),
  setDesktopIconsVisible: (visible) => ipcRenderer.invoke('favoradio-full-desktop-set-icons-visible', visible !== false),
  requestDesktopKeyboardFocus: (reason) => ipcRenderer.invoke(
    'favoradio-full-desktop-request-keyboard-focus',
    String(reason || 'renderer-pointerdown').slice(0, 80)
  ),
  updateDesktopPointerRoute: (payload) => ipcRenderer.send('favoradio-full-desktop-pointer-route', {
    overSoftwareUi: payload && payload.overSoftwareUi === true,
    overDesktopControls: payload && payload.overDesktopControls === true,
  }),
  onWallpaperModeState: (callback) => {
    if (typeof callback !== 'function') return () => {};
    const listener = (_event, payload) => callback(payload || {});
    ipcRenderer.on('favoradio-wallpaper-runtime-state', listener);
    return () => ipcRenderer.removeListener('favoradio-wallpaper-runtime-state', listener);
  },
  onStateChange: (callback) => {
    const listener = (_event, state) => callback(state);
    ipcRenderer.on('desktop-window-state', listener);
    return () => ipcRenderer.removeListener('desktop-window-state', listener);
  },
});

window.addEventListener('DOMContentLoaded', () => {
  document.documentElement.classList.add('desktop-shell-root');
  document.body.classList.add('desktop-shell');
});
