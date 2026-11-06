'use strict';

// Run with node; the child Electron process uses an isolated profile and no account services.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const output = path.join(root, 'output', 'branding');

if (!process.versions.electron) {
  const { spawnSync } = require('node:child_process');
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'favoradio-branding-'));
  try {
    const result = spawnSync(require('electron'), [__filename, ...process.argv.slice(2)], {
      cwd: root,
      env: { ...process.env, FAVORADIO_BRANDING_PROFILE: profile },
      encoding: 'utf8', timeout: 45000,
    });
    process.stdout.write(result.stdout || '');
    process.stderr.write(result.stderr || '');
    if (result.error) throw result.error;
    process.exitCode = result.status === 0 ? 0 : 1;
  } finally {
    // Only remove the temporary profile allocated by this process.
    assert.equal(path.dirname(profile), path.resolve(os.tmpdir()));
    assert.ok(path.basename(profile).startsWith('favoradio-branding-'));
    fs.rmSync(profile, { recursive: true, force: true });
  }
} else {
  const { app, BrowserWindow, nativeImage, session } = require('electron');
  app.setPath('userData', process.env.FAVORADIO_BRANDING_PROFILE);
  app.whenReady().then(async () => {
    fs.mkdirSync(output, { recursive: true });
    session.defaultSession.webRequest.onBeforeRequest({ urls: ['http://*/*', 'https://*/*'] }, (_details, callback) => callback({ cancel: true }));
    const win = new BrowserWindow({
      show: false, width: 1280, height: 720, useContentSize: true,
      backgroundColor: '#050607', icon: path.join(root, 'build/icon.ico'),
      webPreferences: { contextIsolation: true, nodeIntegration: false, backgroundThrottling: false, offscreen: true },
    });
    const run = source => win.webContents.executeJavaScript(source);
    const icon = nativeImage.createFromPath(path.join(root, 'build/icon.ico'));
    assert.equal(icon.isEmpty(), false, 'Windows must be able to decode the application icon');
    const ico = fs.readFileSync(path.join(root, 'build/icon.ico'));
    assert.equal(ico.readUInt16LE(4), 10, 'ICO includes tray, taskbar and desktop sizes');
    for (let i = 0; i < 10; i++) {
      const offset = ico.readUInt32LE(6 + i * 16 + 12);
      const length = ico.readUInt32LE(6 + i * 16 + 8);
      assert.equal(nativeImage.createFromBuffer(ico.subarray(offset, offset + length)).isEmpty(), false);
    }
    await win.loadFile(path.join(root, 'desktop/startup.html'));
    assert.equal(await run('document.title'), 'Favoradio');
    assert.equal(await run('document.querySelector(".mark").complete && document.querySelector(".mark").naturalWidth === 512'), true);
    await new Promise(resolve => setTimeout(resolve, 200));
    fs.writeFileSync(path.join(output, 'startup.png'), (await win.webContents.capturePage()).toPNG());

    await win.loadFile(path.join(root, 'public/index.html'));
    await new Promise(resolve => setTimeout(resolve, 5600));
    assert.equal(await run('document.querySelector(".splash-word-favo").textContent'), 'Favo');
    assert.equal(await run('document.querySelector(".splash-wordmark").getAttribute("aria-label")'), 'Favoradio');
    assert.equal(await run('document.querySelector(".login-node-orb").textContent'), 'FR');
    assert.equal(await run('document.querySelector(".login-node-copy b").textContent'), 'FR');
    assert.equal(await run('document.querySelector("link[rel=icon]").getAttribute("href")'), 'assets/favoradio-icon.png');
    const screenshot = (await win.webContents.capturePage()).toPNG();
    fs.writeFileSync(path.join(output, 'splash.png'), screenshot);
    if (process.argv.includes('--update-readme')) {
      fs.writeFileSync(path.join(root, 'docs/assets/readme/cinema-beat-smoke.png'), screenshot);
    }
    console.log('[OK] FR icon decodes at all 10 sizes; startup, splash, login badges and favicon are correct.');
    win.destroy();
    app.exit(0);
  }).catch(error => { console.error(error); app.exit(1); });
}
