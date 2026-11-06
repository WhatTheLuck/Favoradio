# Favoradio brand assets

The three source PNGs were produced with the built-in imagegen tool on 2026-11-06 and visually checked before export. The runtime UI screenshot in `docs/assets/readme/cinema-beat-smoke.png` is captured from Electron, not generated.

Generation instructions:
- App icon: centered white **FR** letters on the existing dark rounded-square tile; retain the subtle diagonal gradient, fine silver edge and transparent corners; no additional symbols or text; legible at tray-icon sizes.
- Installer header: retain the flat white and blue layout, display **Favoradio** and **安装向导**, preserve the 150:57 aspect ratio.
- Installer sidebar: retain the white and blue layout, display **FAVORADIO**, **音乐**, **歌词与视觉**, **安装**, and **C:\Favoradio**, preserve the 164:314 aspect ratio.

Run `powershell -ExecutionPolicy Bypass -File scripts/build-brand-assets.ps1` from the repository root to export the PNG, multi-resolution ICO and 24-bit installer BMPs. The source images are excluded from application packaging.

The ICO includes 16, 20, 24, 32, 40, 48, 64, 96, 128 and 256 pixel entries. The boot screen uses the 512-pixel PNG; the browser uses the 256-pixel PNG. `node tests/branding-electron-smoke.cjs` checks native icon decoding and renders the boot and splash screens into `output/branding`.
