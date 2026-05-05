import { app, shell, BrowserWindow, ipcMain, dialog, globalShortcut } from 'electron'
import { join, basename, extname, normalize, isAbsolute } from 'path'
import { existsSync, mkdirSync, writeFileSync, readFileSync, unlinkSync, copyFileSync, readdirSync, rmdirSync } from 'fs'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/assets/icon/easysfx.ico?asset'
import { pathToFileURL } from 'url'

const APP_DATA_DIR = join(app.getPath('userData'), 'EASY SFX')
const PROJECT_ROOT = app.getAppPath()
const LOCAL_RESOURCES_DIR = is.dev 
  ? join(PROJECT_ROOT, 'resources')
  : join(process.resourcesPath, '..', 'resources')

const CACHE_BASE = join(APP_DATA_DIR, 'Cache/Neccessory(Do not delete)/SFX LIST')

const ALLOWED_EXTENSIONS = ['.mp3', '.wav']

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-z0-9.]/gi, '_').toLowerCase()
}

function isSafePath(path: string): boolean {
  const normalizedPath = normalize(path).toLowerCase()
  const allowedPaths = [
    APP_DATA_DIR.toLowerCase(),
    LOCAL_RESOURCES_DIR.toLowerCase(),
    PROJECT_ROOT.toLowerCase()
  ]
  return allowedPaths.some(allowed => normalizedPath.startsWith(allowed))
}

function initStorage(): void {
  try {
    const dirs = [
      APP_DATA_DIR,
      join(APP_DATA_DIR, 'data/library'),
      join(APP_DATA_DIR, 'data/favorite'),
      join(APP_DATA_DIR, 'data/playlist'),
      join(LOCAL_RESOURCES_DIR, 'data/library/imported'),
      join(LOCAL_RESOURCES_DIR, 'assets/styles'),
      join(LOCAL_RESOURCES_DIR, 'assets/lang'),
      CACHE_BASE
    ]

    dirs.forEach((dir) => {
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true })
      }
    })

    const libraryPath = join(APP_DATA_DIR, 'data/library/library_list.json')
    if (!existsSync(libraryPath)) {
      const defaultLibraryPath = join(LOCAL_RESOURCES_DIR, 'assets/default/library.json')

      if (existsSync(defaultLibraryPath)) {
        copyFileSync(defaultLibraryPath, libraryPath)
      } else {
        writeFileSync(libraryPath, JSON.stringify({ list: [] }))
      }
    }
  } catch (error) {
    console.error('Storage initialization failed:', error)
  }
}

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    show: false,
    autoHideMenuBar: true,
    icon,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      webSecurity: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // Set permissions for audio
  mainWindow.webContents.session.setPermissionCheckHandler((webContents, permission) => {
      if (permission === 'media') return true;
      return false;
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  // Handle DevTools shortcut
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (
      input.type === 'keyDown' &&
      (input.control || input.meta) &&
      input.shift &&
      input.code === 'KeyD'
    ) {
      mainWindow.webContents.toggleDevTools()
      event.preventDefault()
    }
  })
}

app.whenReady().then(() => {
  initStorage()
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC Handlers
  ipcMain.handle('get-base-dir', () => APP_DATA_DIR)
  ipcMain.handle('get-resources-dir', () => LOCAL_RESOURCES_DIR)

  ipcMain.handle('select-file', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [{ name: 'Audio Files', extensions: ['mp3', 'wav'] }]
    })
    return result.canceled ? null : result.filePaths[0]
  })

  ipcMain.handle('read-dir', (_, path: string) => {
    try {
      const fullPath = join(APP_DATA_DIR, path)
      const resourcePath = join(LOCAL_RESOURCES_DIR, path)
      
      if (existsSync(fullPath) && isSafePath(fullPath)) {
        return readdirSync(fullPath)
      } else if (existsSync(resourcePath) && isSafePath(resourcePath)) {
        return readdirSync(resourcePath)
      }
    } catch (error) {
      console.error(`Failed to read directory at ${path}:`, error)
    }
    return []
  })

  ipcMain.handle('import-file', async (_, sourcePath: string) => {
    try {
      const ext = extname(sourcePath).toLowerCase()
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        throw new Error('Invalid file type')
      }

      const originalFilename = basename(sourcePath)
      const sanitized = sanitizeFilename(originalFilename)
      const targetDir = join(LOCAL_RESOURCES_DIR, 'data/library/imported')
      
      if (!existsSync(targetDir)) {
        mkdirSync(targetDir, { recursive: true })
      }

      let targetPath = join(targetDir, sanitized)
      
      if (existsSync(targetPath)) {
        const name = basename(sanitized, ext)
        targetPath = join(targetDir, `${name}_${Date.now()}${ext}`)
      }

      copyFileSync(sourcePath, targetPath)
      return targetPath
    } catch (error) {
      console.error('Import failed:', error)
      return null
    }
  })

  ipcMain.handle('read-json', (_, path: string) => {
    try {
      let fullPath = join(APP_DATA_DIR, path)
      if (!existsSync(fullPath)) {
        fullPath = join(LOCAL_RESOURCES_DIR, path)
      }

      if (!isSafePath(fullPath)) throw new Error('Path traversal detected')
      
      if (existsSync(fullPath)) {
        const content = readFileSync(fullPath, 'utf-8')
        return JSON.parse(content)
      }
    } catch (error) {
      console.warn(`Failed to read JSON at ${path}, falling back to default:`, error)
    }
    return null
  })

  ipcMain.handle('write-json', (_, path: string, data: any) => {
    try {
      const fullPath = join(APP_DATA_DIR, path)
      if (!isSafePath(fullPath)) throw new Error('Path traversal detected')
      
      const dir = join(fullPath, '..')
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true })
      }

      writeFileSync(fullPath, JSON.stringify(data, null, 2))
      return true
    } catch (error) {
      console.error(`Failed to write JSON to ${path}:`, error)
      return false
    }
  })

  ipcMain.handle('delete-file', (_, path: string) => {
    try {
      const fullPath = isAbsolute(path) ? path : join(APP_DATA_DIR, path)
      if (!isSafePath(fullPath)) throw new Error('Path traversal detected')

      if (existsSync(fullPath)) {
          const stat = require('fs').lstatSync(fullPath)
          if (stat.isDirectory()) {
              rmdirSync(fullPath, { recursive: true })
          } else {
              unlinkSync(fullPath)
          }
        return true
      }
    } catch (error) {
      console.error(`Failed to delete file/dir at ${path}:`, error)
    }
    return false
  })

  ipcMain.handle('update-favorite-name', async (_, oldId: string, newName: string) => {
    try {
      const oldDir = join(APP_DATA_DIR, 'data/favorite', oldId)
      const oldJson = join(oldDir, `${oldId}.json`)
      if (existsSync(oldJson)) {
        const content = JSON.parse(readFileSync(oldJson, 'utf-8'))
        content.name = newName
        writeFileSync(oldJson, JSON.stringify(content, null, 2))
        return true
      }
    } catch (error) {
      console.error('Rename favorite failed:', error)
    }
    return false
  })

  ipcMain.handle('register-shortcut', (event, accelerator: string) => {
    try {
      const success = globalShortcut.register(accelerator, () => {
        event.sender.send('shortcut-pressed', accelerator)
      })
      return success
    } catch (error) {
      console.error(`Failed to register shortcut ${accelerator}:`, error)
      return false
    }
  })

  ipcMain.handle('unregister-shortcut', (_, accelerator: string) => {
    globalShortcut.unregister(accelerator)
  })

  ipcMain.handle('unregister-all-shortcuts', () => {
    globalShortcut.unregisterAll()
  })

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
