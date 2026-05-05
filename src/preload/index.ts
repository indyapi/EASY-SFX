import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  getBaseDir: () => ipcRenderer.invoke('get-base-dir'),
  getResourcesDir: () => ipcRenderer.invoke('get-resources-dir'),
  selectFile: () => ipcRenderer.invoke('select-file'),
  readDir: (path: string) => ipcRenderer.invoke('read-dir', path),
  readJson: (path: string) => ipcRenderer.invoke('read-json', path),
  writeJson: (path: string, data: any) => ipcRenderer.invoke('write-json', path, data),
  deleteFile: (path: string) => ipcRenderer.invoke('delete-file', path),
  importFile: (sourcePath: string) => ipcRenderer.invoke('import-file', sourcePath),
  playSfxFile: (filePath: string) => ipcRenderer.invoke('play-sfx-file', filePath),
  downloadSound: (url: string, playlistId: string, id: string) =>
    ipcRenderer.invoke('download-sound', url, playlistId, id),
  registerShortcut: (accelerator: string) => ipcRenderer.invoke('register-shortcut', accelerator),
  unregisterShortcut: (accelerator: string) => ipcRenderer.invoke('unregister-shortcut', accelerator),
  unregisterAllShortcuts: () => ipcRenderer.invoke('unregister-all-shortcuts'),
  onShortcutPressed: (callback: (accelerator: string) => void) => {
    const listener = (_event: any, accelerator: string) => callback(accelerator)
    ipcRenderer.on('shortcut-pressed', listener)
    return () => ipcRenderer.removeListener('shortcut-pressed', listener)
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
