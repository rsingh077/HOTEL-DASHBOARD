const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  isElectron: true,
  appVersion: require('../package.json').version,
  arch: process.arch,
  nodeVersion: process.versions.node,
  electronVersion: process.versions.electron,
});
