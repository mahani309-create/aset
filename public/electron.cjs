const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 768,
    autoHideMenuBar: false,
    icon: path.join(__dirname, 'icon.svg'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
  });

  // Remove the default menu so it looks more like an app
  Menu.setApplicationMenu(null);

  // Load the index.html from dist
  win.loadFile(path.join(__dirname, 'index.html'));
  
  // Uncomment below to open DevTools for debugging
  // win.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
