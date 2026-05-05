"use strict";
const electron = require("electron");
const preload = require("@electron-toolkit/preload");
const api = {
  getBaseDir: () => electron.ipcRenderer.invoke("get-base-dir"),
  getResourcesDir: () => electron.ipcRenderer.invoke("get-resources-dir"),
  selectFile: () => electron.ipcRenderer.invoke("select-file"),
  readDir: (path) => electron.ipcRenderer.invoke("read-dir", path),
  readJson: (path) => electron.ipcRenderer.invoke("read-json", path),
  writeJson: (path, data) => electron.ipcRenderer.invoke("write-json", path, data),
  deleteFile: (path) => electron.ipcRenderer.invoke("delete-file", path),
  importFile: (sourcePath) => electron.ipcRenderer.invoke("import-file", sourcePath),
  playSfxFile: (filePath) => electron.ipcRenderer.invoke("play-sfx-file", filePath),
  downloadSound: (url, playlistId, id) => electron.ipcRenderer.invoke("download-sound", url, playlistId, id),
  registerShortcut: (accelerator) => electron.ipcRenderer.invoke("register-shortcut", accelerator),
  unregisterShortcut: (accelerator) => electron.ipcRenderer.invoke("unregister-shortcut", accelerator),
  unregisterAllShortcuts: () => electron.ipcRenderer.invoke("unregister-all-shortcuts"),
  onShortcutPressed: (callback) => {
    const listener = (_event, accelerator) => callback(accelerator);
    electron.ipcRenderer.on("shortcut-pressed", listener);
    return () => electron.ipcRenderer.removeListener("shortcut-pressed", listener);
  }
};
if (process.contextIsolated) {
  try {
    electron.contextBridge.exposeInMainWorld("electron", preload.electronAPI);
    electron.contextBridge.exposeInMainWorld("api", api);
  } catch (error) {
    console.error(error);
  }
} else {
  window.electron = preload.electronAPI;
  window.api = api;
}
