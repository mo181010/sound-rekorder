const { app, BrowserWindow, desktopCapturer, session, ipcMain, shell } = require('electron');
const path = require('path'), fs = require('fs'), { pathToFileURL } = require('url');

app.whenReady().then(() => {
  // Alle Aufnahmen landen in  Musik\Sound
  const dir = path.join(app.getPath('music'), 'Sound');
  fs.mkdirSync(dir, { recursive: true });
  const safe = n => path.join(dir, path.basename(n));

  // Systemton (Windows-Loopback) statt Bildschirmbild
  session.defaultSession.setDisplayMediaRequestHandler((req, cb) => {
    desktopCapturer.getSources({ types: ['screen'] }).then(s => cb({ video: s[0], audio: 'loopback' }));
  });

  ipcMain.handle('dir', () => dir);
  ipcMain.handle('save', (e, name, buf) => { fs.writeFileSync(safe(name), Buffer.from(buf)); return true; });
  ipcMain.handle('open', () => shell.openPath(dir));
  ipcMain.handle('show', (e, n) => shell.showItemInFolder(safe(n)));
  ipcMain.handle('del', (e, n) => shell.trashItem(safe(n)));
  ipcMain.handle('list', () => fs.readdirSync(dir).filter(f => /\.(webm|wav)$/i.test(f)).map(f => {
    const p = path.join(dir, f), s = fs.statSync(p);
    return { name: f, size: s.size, time: s.mtimeMs, url: pathToFileURL(p).href };
  }).sort((a, b) => b.time - a.time));

  const win = new BrowserWindow({
    width: 1000, height: 700, minWidth: 700, minHeight: 560, backgroundColor: '#150f1f',
    autoHideMenuBar: true, icon: path.join(__dirname, 'icon.png'),
    webPreferences: { preload: path.join(__dirname, 'preload.js') }
  });
  win.loadFile('index.html');
});
app.on('window-all-closed', () => app.quit());
