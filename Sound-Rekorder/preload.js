const { contextBridge, ipcRenderer: r } = require('electron');
contextBridge.exposeInMainWorld('sound', {
  dir: () => r.invoke('dir'), list: () => r.invoke('list'), open: () => r.invoke('open'),
  save: (n, b) => r.invoke('save', n, b), show: n => r.invoke('show', n), del: n => r.invoke('del', n)
});
