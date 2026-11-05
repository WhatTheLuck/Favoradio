const { contextBridge, ipcRenderer, clipboard, webUtils } = require('electron');

contextBridge.exposeInMainWorld('desktopWindow', {
  isDesktop: true,
  minimize: () => ipcRenderer.invoke('desktop-window-minimize'),
  restore: () => ipcRenderer.invoke('desktop-window-restore'),
  toggleMaximize: () => ipcRenderer.invoke('desktop-window-toggle-maximize'),
  toggleFullscreen: () => ipcRenderer.invoke('desktop-window-toggle-fullscreen'),
  exitFullscreenWindowed: () => ipcRenderer.invoke('desktop-window-exit-fullscreen-windowed'),
  getState: () => ipcRenderer.invoke('desktop-window-get-state'),
  getGpuDiagnostics: () => ipcRenderer.invoke('faveradio-get-gpu-diagnostics'),
  getMemorySnapshot: () => ipcRenderer.invoke('faveradio-memory-get-snapshot'),
  configureMemoryReduct: (payload) => ipcRenderer.invoke('faveradio-memory-configure-auto', payload || {}),
  trimAppMemory: (payload) => ipcRenderer.invoke('faveradio-memory-trim-app', payload || {}),
  purgeSystemMemory: (payload) => ipcRenderer.invoke('faveradio-memory-purge-system', payload || {}),
  getCacheSettings: () => ipcRenderer.invoke('faveradio-cache-get-settings'),
  chooseCacheDirectory: () => ipcRenderer.invoke('faveradio-cache-choose-directory'),
  setCacheSettings: (payload) => ipcRenderer.invoke('faveradio-cache-set-settings', payload || {}),
  listWallpaperEngineProjects: (payload) => ipcRenderer.invoke('faveradio-wallpaper-engine-list', payload || {}),
  getWallpaperEngineProjectDetails: (id) => ipcRenderer.invoke('faveradio-wallpaper-engine-project-details', String(id || '')),
  openWallpaperEngineProjectDetails: (id, target) => ipcRenderer.invoke('faveradio-wallpaper-engine-open-project-details', {
    id: String(id || ''),
    target: target === 'workshop' ? 'workshop' : 'we',
  }),
  chooseWallpaperEngineDirectory: () => ipcRenderer.invoke('faveradio-wallpaper-engine-choose-directory'),
  chooseWallpaperEngineProjectFile: () => ipcRenderer.invoke('faveradio-wallpaper-engine-choose-project-file'),
  removeWallpaperEngineDirectory: (rootId) => ipcRenderer.invoke('faveradio-wallpaper-engine-remove-directory', String(rootId || '')),
  getWallpaperEngineRuntimeStatus: (payload) => ipcRenderer.invoke('faveradio-wallpaper-engine-runtime-status', payload || {}),
  startWallpaperEngineScene: (payload) => ipcRenderer.invoke('faveradio-wallpaper-engine-start-scene', payload || {}),
  reportWallpaperEngineCaptureResult: (payload) => ipcRenderer.invoke('faveradio-wallpaper-engine-capture-result', payload || {}),
  prepareWallpaperEngineGlassCapture: (payload) => ipcRenderer.invoke('faveradio-wallpaper-engine-prepare-glass-capture', payload || {}),
  activateWallpaperEngineDwmSurface: (payload) => ipcRenderer.invoke('faveradio-wallpaper-engine-activate-dwm-surface', payload || {}),
  updateWallpaperEngineGlassSurface: (payload) => ipcRenderer.send('faveradio-wallpaper-engine-glass-surface', payload || {}),
  updateWallpaperEngineVisualSettings: (payload) => ipcRenderer.send('faveradio-wallpaper-engine-visual-settings', payload || {}),
  reportWallpaperEnginePointerActivity: (payload) => ipcRenderer.send('faveradio-wallpaper-engine-pointer-activity', payload || {}),
  stopWallpaperEngineScene: (payload) => ipcRenderer.invoke('faveradio-wallpaper-engine-stop-scene', payload || {}),
  onWallpaperEngineHostBoundsChanged: (callback) => {
    if (typeof callback !== 'function') return () => {};
    const listener = (_event, payload) => callback(payload || {});
    ipcRenderer.on('faveradio-wallpaper-engine-host-bounds-changed', listener);
    return () => ipcRenderer.removeListener('faveradio-wallpaper-engine-host-bounds-changed', listener);
  },
  listLocalMusicLibrary: () => ipcRenderer.invoke('faveradio-local-library-list'),
  readLocalMusicLyric: (localFileId) => ipcRenderer.invoke('faveradio-local-library-lyric', String(localFileId || '')),
  listBuiltInPlaylists: () => ipcRenderer.invoke('faveradio-built-in-playlists-list'),
  readBuiltInPlaylist: (id, options) => ipcRenderer.invoke('faveradio-built-in-playlist-page', String(id || ''), options || {}),
  createBuiltInPlaylist: (name) => ipcRenderer.invoke('faveradio-built-in-playlist-create', String(name || '')),
  renameBuiltInPlaylist: (id, name) => ipcRenderer.invoke('faveradio-built-in-playlist-rename', String(id || ''), String(name || '')),
  deleteBuiltInPlaylist: (id) => ipcRenderer.invoke('faveradio-built-in-playlist-delete', String(id || '')),
  addBuiltInPlaylistTrack: (id, track) => ipcRenderer.invoke('faveradio-built-in-playlist-add-track', String(id || ''), track || {}),
  addBuiltInPlaylistTracks: (id, tracks) => ipcRenderer.invoke('faveradio-built-in-playlist-add-tracks', String(id || ''), tracks),
  removeBuiltInPlaylistTracks: (id, tracks) => ipcRenderer.invoke('faveradio-built-in-playlist-remove-tracks', String(id || ''), tracks),
  removeBuiltInPlaylistTrack: (id, index) => ipcRenderer.invoke('faveradio-built-in-playlist-remove-track', String(id || ''), Number(index)),
  reorderBuiltInPlaylistTrack: (id, fromIndex, toIndex) => ipcRenderer.invoke('faveradio-built-in-playlist-reorder-track', String(id || ''), Number(fromIndex), Number(toIndex)),
  visualPresets: (action,kind,name,value) => ipcRenderer.invoke('faveradio-visual-presets',action,kind,name,value),
  createMergedPlaylist: (name,tracks) => ipcRenderer.invoke('faveradio-merge-playlists',name,tracks),
  readSmartFavorites: () => ipcRenderer.invoke('faveradio-smart-favorites-read'),
  saveSmartFavorites: (state) => ipcRenderer.invoke('faveradio-smart-favorites-save', state || {}),
  getSmartFavoritesLlmStatus: () => ipcRenderer.invoke('faveradio-smart-favorites-llm-status'),
  configureSmartFavoritesLlm: (payload) => ipcRenderer.invoke('faveradio-smart-favorites-llm-configure', payload || {}),
  clearSmartFavoritesLlm: () => ipcRenderer.invoke('faveradio-smart-favorites-llm-clear'),
  testSmartFavoritesLlm: () => ipcRenderer.invoke('faveradio-smart-favorites-llm-test'),
  analyzeSmartFavoriteTracks: (tracks, tags) => ipcRenderer.invoke('faveradio-smart-favorites-analyze', Array.isArray(tracks) ? tracks : [], Array.isArray(tags) ? tags : []),
  getMuqStatus: () => ipcRenderer.invoke('faveradio-muq-status'),
  getMuqAudioCache: (keys) => ipcRenderer.invoke('faveradio-muq-audio-cache', keys),
  embedMuqAudio: (key, fingerprint, pcm) => ipcRenderer.invoke('faveradio-muq-embed-audio', key, fingerprint, pcm),
  embedMuqTexts: (tags) => ipcRenderer.invoke('faveradio-muq-embed-texts', tags),
  getEmomusicVlmStatus: () => ipcRenderer.invoke('faveradio-emomusic-vlm-status'),
  analyzeEmomusicFrame: (imageDataUrl) => ipcRenderer.invoke('faveradio-emomusic-vlm-analyze', String(imageDataUrl || '')),
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
    const authorization = await ipcRenderer.invoke('faveradio-local-library-authorize', { files: entries });
    if (!authorization || authorization.ok !== true || !authorization.token) return authorization;
    return ipcRenderer.invoke('faveradio-local-library-import', { token: authorization.token });
  },
  readLyricCache: (key) => ipcRenderer.invoke('faveradio-cache-read-lyric', key || ''),
  writeLyricCache: (key, payload) => ipcRenderer.invoke('faveradio-cache-write-lyric', key || '', payload || {}),
  close: (behavior) => ipcRenderer.invoke('desktop-window-close', behavior),
  getCloseBehavior: () => ipcRenderer.invoke('desktop-window-get-close-behavior'),
  setCloseBehavior: (behavior) => ipcRenderer.invoke('desktop-window-set-close-behavior', behavior),
  getLoginEasterEggStatus: () => ipcRenderer.invoke('faveradio-login-easter-egg-status'),
  unlockLoginEasterEgg: (value) => ipcRenderer.invoke('faveradio-login-easter-egg-unlock', String(value || '')),
  resetLoginEasterEgg: () => ipcRenderer.invoke('faveradio-login-easter-egg-reset'),
  openNeteaseMusicLogin: () => ipcRenderer.invoke('netease-music-open-login'),
  clearNeteaseMusicLogin: () => ipcRenderer.invoke('netease-music-clear-login'),
  openQQMusicLogin: (options) => ipcRenderer.invoke('qq-music-open-login', options || {}),
  clearQQMusicLogin: () => ipcRenderer.invoke('qq-music-clear-login'),
  openKugouMusicLogin: (options) => ipcRenderer.invoke('kugou-music-open-login', options || {}),
  clearKugouMusicLogin: () => ipcRenderer.invoke('kugou-music-clear-login'),
  clearQishuiMusicLogin: () => ipcRenderer.invoke('qishui-music-clear-login'),
  openUpdatePage: (url) => ipcRenderer.invoke('faveradio-open-update-page', String(url || '')),
  restartApp: () => ipcRenderer.invoke('faveradio-restart-app'),
  configureGlobalHotkeys: (bindings) => ipcRenderer.invoke('faveradio-hotkeys-configure-global', bindings || []),
  copyText: (text) => {
    clipboard.writeText(String(text || ''));
    return { ok: true };
  },
  readText: () => ({ ok: true, text: clipboard.readText() || '' }),
  exportJsonFile: (payload) => ipcRenderer.invoke('faveradio-export-json-file', payload || {}),
  exportLoginCookie: (provider) => ipcRenderer.invoke('faveradio-export-login-cookie', provider || ''),
  importJsonFile: () => ipcRenderer.invoke('faveradio-import-json-file'),
  readCurrentFxAutosaveSync: () => ipcRenderer.sendSync('faveradio-current-fx-autosave-read-sync'),
  saveCurrentFxAutosaveSync: (payload) => ipcRenderer.sendSync('faveradio-current-fx-autosave-save-sync', payload || {}),
  saveCurrentFxAutosave: (payload) => ipcRenderer.invoke('faveradio-current-fx-autosave-save', payload || {}),
  onGlobalHotkey: (callback) => {
    if (typeof callback !== 'function') return () => {};
    const listener = (_event, payload) => callback(payload || {});
    ipcRenderer.on('faveradio-global-hotkey', listener);
    return () => ipcRenderer.removeListener('faveradio-global-hotkey', listener);
  },
  setDesktopLyricsEnabled: (enabled, payload) => ipcRenderer.invoke('faveradio-desktop-lyrics-set-enabled', !!enabled, payload || {}),
  updateDesktopLyrics: (payload) => ipcRenderer.invoke('faveradio-desktop-lyrics-update', payload || {}),
  onDesktopLyricsLockState: (callback) => {
    if (typeof callback !== 'function') return () => {};
    const listener = (_event, payload) => callback(payload || {});
    ipcRenderer.on('faveradio-desktop-lyrics-lock-state', listener);
    return () => ipcRenderer.removeListener('faveradio-desktop-lyrics-lock-state', listener);
  },
  onDesktopLyricsEnabledState: (callback) => {
    if (typeof callback !== 'function') return () => {};
    const listener = (_event, payload) => callback(payload || {});
    ipcRenderer.on('faveradio-desktop-lyrics-enabled-state', listener);
    return () => ipcRenderer.removeListener('faveradio-desktop-lyrics-enabled-state', listener);
  },
  setWallpaperMode: (enabled, payload) => ipcRenderer.invoke('faveradio-wallpaper-set-enabled', !!enabled, payload || {}),
  updateWallpaperMode: (payload) => ipcRenderer.invoke('faveradio-wallpaper-update', payload || {}),
  getWallpaperModeStatus: () => ipcRenderer.invoke('faveradio-wallpaper-get-status'),
  requestGestureCameraPermission: () => ipcRenderer.invoke('faveradio-gesture-camera-request-permission'),
  updateDesktopIconShields: (payload) => ipcRenderer.send('faveradio-full-desktop-icon-shields', payload || {}),
  setDesktopSoftwareLocked: (locked) => ipcRenderer.invoke('faveradio-full-desktop-set-software-lock', locked === true),
  setDesktopIconsVisible: (visible) => ipcRenderer.invoke('faveradio-full-desktop-set-icons-visible', visible !== false),
  requestDesktopKeyboardFocus: (reason) => ipcRenderer.invoke(
    'faveradio-full-desktop-request-keyboard-focus',
    String(reason || 'renderer-pointerdown').slice(0, 80)
  ),
  updateDesktopPointerRoute: (payload) => ipcRenderer.send('faveradio-full-desktop-pointer-route', {
    overSoftwareUi: payload && payload.overSoftwareUi === true,
    overDesktopControls: payload && payload.overDesktopControls === true,
  }),
  onWallpaperModeState: (callback) => {
    if (typeof callback !== 'function') return () => {};
    const listener = (_event, payload) => callback(payload || {});
    ipcRenderer.on('faveradio-wallpaper-runtime-state', listener);
    return () => ipcRenderer.removeListener('faveradio-wallpaper-runtime-state', listener);
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
