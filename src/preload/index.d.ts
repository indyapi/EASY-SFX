import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      getBaseDir: () => Promise<string>
      getResourcesDir: () => Promise<string>
      selectFile: () => Promise<string | null>
      readDir: (path: string) => Promise<string[]>
      readJson: (path: string) => Promise<any>
      writeJson: (path: string, data: any) => Promise<boolean>
      deleteFile: (path: string) => Promise<boolean>
      importFile: (sourcePath: string) => Promise<string>
      playSfxFile: (filePath: string) => Promise<void>
      downloadSound: (url: string, playlistId: string, id: string) => Promise<string | null>
      registerShortcut: (accelerator: string) => Promise<boolean>
      unregisterShortcut: (accelerator: string) => Promise<void>
      unregisterAllShortcuts: () => Promise<void>
      onShortcutPressed: (callback: (accelerator: string) => void) => () => void
    }
  }
}
