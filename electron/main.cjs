const { app, BrowserWindow, Menu, shell, dialog } = require('electron');
const path = require('path');

// ─── Prevent multiple instances ───────────────────────────────
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {

let mainWindow;

// ─── Window-state persistence helpers ─────────────────────────
const fs = require('fs');
const stateFile = path.join(app.getPath('userData'), 'window-state.json');

function loadWindowState() {
  try {
    if (fs.existsSync(stateFile)) {
      return JSON.parse(fs.readFileSync(stateFile, 'utf-8'));
    }
  } catch (_) { /* ignore corrupt file */ }
  return { width: 1400, height: 900 };
}

function saveWindowState(win) {
  if (!win || win.isDestroyed()) return;
  const bounds = win.getBounds();
  const isMaximized = win.isMaximized();
  try {
    fs.writeFileSync(stateFile, JSON.stringify({ ...bounds, isMaximized }));
  } catch (_) { /* best-effort */ }
}

// ─── Create main window ──────────────────────────────────────
function createWindow() {
  const state = loadWindowState();

  mainWindow = new BrowserWindow({
    width: state.width,
    height: state.height,
    x: state.x,
    y: state.y,
    minWidth: 1024,
    minHeight: 700,
    title: 'Hotels Dashboard — Management System',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      spellcheck: false,
    },
    backgroundColor: '#0a0a0a',
    show: false,
    autoHideMenuBar: true,
  });

  // Restore maximized state
  if (state.isMaximized) mainWindow.maximize();

  // Remove the default menu bar
  Menu.setApplicationMenu(null);

  // Load the app
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Show window when ready to avoid white flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Open external links in default browser (not inside Electron)
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http')) shell.openExternal(url);
    return { action: 'deny' };
  });

  // Intercept navigation to external URLs
  mainWindow.webContents.on('will-navigate', (event, url) => {
    const appOrigin = new URL(mainWindow.webContents.getURL()).origin;
    if (!url.startsWith(appOrigin) && url.startsWith('http')) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  // Save window state on move / resize
  mainWindow.on('resize', () => saveWindowState(mainWindow));
  mainWindow.on('move', () => saveWindowState(mainWindow));
  mainWindow.on('close', () => saveWindowState(mainWindow));

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// ─── App lifecycle ───────────────────────────────────────────
app.whenReady().then(createWindow);

// When a second instance is launched, focus the existing window
app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

app.on('window-all-closed', () => {
  app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

} // end single-instance lock
