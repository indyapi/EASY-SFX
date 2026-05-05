"use strict";
const electron = require("electron");
const path = require("path");
const fs = require("fs");
const utils = require("@electron-toolkit/utils");
const icon = path.join(__dirname, "../../resources/assets/icon/easysfx.ico");
const APP_DATA_DIR = path.join(electron.app.getPath("userData"), "EASY SFX");
const PROJECT_ROOT = electron.app.getAppPath();
const LOCAL_RESOURCES_DIR = utils.is.dev ? path.join(PROJECT_ROOT, "resources") : path.join(process.resourcesPath, "..", "resources");
const CACHE_BASE = path.join(APP_DATA_DIR, "Cache/Neccessory(Do not delete)/SFX LIST");
const ALLOWED_EXTENSIONS = [".mp3", ".wav"];
function sanitizeFilename(name) {
  return name.replace(/[^a-z0-9.]/gi, "_").toLowerCase();
}
function isSafePath(path$1) {
  const normalizedPath = path.normalize(path$1).toLowerCase();
  const allowedPaths = [
    APP_DATA_DIR.toLowerCase(),
    LOCAL_RESOURCES_DIR.toLowerCase(),
    PROJECT_ROOT.toLowerCase()
  ];
  return allowedPaths.some((allowed) => normalizedPath.startsWith(allowed));
}
function initStorage() {
  try {
    const dirs = [
      APP_DATA_DIR,
      path.join(APP_DATA_DIR, "data/library"),
      path.join(APP_DATA_DIR, "data/favorite"),
      path.join(APP_DATA_DIR, "data/playlist"),
      path.join(LOCAL_RESOURCES_DIR, "data/library/imported"),
      path.join(LOCAL_RESOURCES_DIR, "assets/styles"),
      path.join(LOCAL_RESOURCES_DIR, "assets/lang"),
      CACHE_BASE
    ];
    dirs.forEach((dir) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
    const libraryPath = path.join(APP_DATA_DIR, "data/library/library_list.json");
    if (!fs.existsSync(libraryPath)) {
      const defaultLibraryPath = path.join(LOCAL_RESOURCES_DIR, "assets/default/library.json");
      if (fs.existsSync(defaultLibraryPath)) {
        fs.copyFileSync(defaultLibraryPath, libraryPath);
      } else {
        fs.writeFileSync(libraryPath, JSON.stringify({ list: [] }));
      }
    }
  } catch (error) {
    console.error("Storage initialization failed:", error);
  }
}
function createWindow() {
  const mainWindow = new electron.BrowserWindow({
    width: 1e3,
    height: 800,
    show: false,
    autoHideMenuBar: true,
    icon,
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      sandbox: false,
      webSecurity: false
    }
  });
  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
  });
  mainWindow.webContents.setWindowOpenHandler((details) => {
    electron.shell.openExternal(details.url);
    return { action: "deny" };
  });
  mainWindow.webContents.session.setPermissionCheckHandler((webContents, permission) => {
    if (permission === "media") return true;
    return false;
  });
  if (utils.is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
  }
  mainWindow.webContents.on("before-input-event", (event, input) => {
    if (input.type === "keyDown" && (input.control || input.meta) && input.shift && input.code === "KeyD") {
      mainWindow.webContents.toggleDevTools();
      event.preventDefault();
    }
  });
}
electron.app.whenReady().then(() => {
  initStorage();
  utils.electronApp.setAppUserModelId("com.electron");
  electron.app.on("browser-window-created", (_, window) => {
    utils.optimizer.watchWindowShortcuts(window);
  });
  electron.ipcMain.handle("get-base-dir", () => APP_DATA_DIR);
  electron.ipcMain.handle("get-resources-dir", () => LOCAL_RESOURCES_DIR);
  electron.ipcMain.handle("select-file", async () => {
    const result = await electron.dialog.showOpenDialog({
      properties: ["openFile"],
      filters: [{ name: "Audio Files", extensions: ["mp3", "wav"] }]
    });
    return result.canceled ? null : result.filePaths[0];
  });
  electron.ipcMain.handle("read-dir", (_, path$1) => {
    try {
      const fullPath = path.join(APP_DATA_DIR, path$1);
      const resourcePath = path.join(LOCAL_RESOURCES_DIR, path$1);
      if (fs.existsSync(fullPath) && isSafePath(fullPath)) {
        return fs.readdirSync(fullPath);
      } else if (fs.existsSync(resourcePath) && isSafePath(resourcePath)) {
        return fs.readdirSync(resourcePath);
      }
    } catch (error) {
      console.error(`Failed to read directory at ${path$1}:`, error);
    }
    return [];
  });
  electron.ipcMain.handle("import-file", async (_, sourcePath) => {
    try {
      const ext = path.extname(sourcePath).toLowerCase();
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        throw new Error("Invalid file type");
      }
      const originalFilename = path.basename(sourcePath);
      const sanitized = sanitizeFilename(originalFilename);
      const targetDir = path.join(LOCAL_RESOURCES_DIR, "data/library/imported");
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      let targetPath = path.join(targetDir, sanitized);
      if (fs.existsSync(targetPath)) {
        const name = path.basename(sanitized, ext);
        targetPath = path.join(targetDir, `${name}_${Date.now()}${ext}`);
      }
      fs.copyFileSync(sourcePath, targetPath);
      return targetPath;
    } catch (error) {
      console.error("Import failed:", error);
      return null;
    }
  });
  electron.ipcMain.handle("read-json", (_, path$1) => {
    try {
      let fullPath = path.join(APP_DATA_DIR, path$1);
      if (!fs.existsSync(fullPath)) {
        fullPath = path.join(LOCAL_RESOURCES_DIR, path$1);
      }
      if (!isSafePath(fullPath)) throw new Error("Path traversal detected");
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, "utf-8");
        return JSON.parse(content);
      }
    } catch (error) {
      console.warn(`Failed to read JSON at ${path$1}, falling back to default:`, error);
    }
    return null;
  });
  electron.ipcMain.handle("write-json", (_, path$1, data) => {
    try {
      const fullPath = path.join(APP_DATA_DIR, path$1);
      if (!isSafePath(fullPath)) throw new Error("Path traversal detected");
      const dir = path.join(fullPath, "..");
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(fullPath, JSON.stringify(data, null, 2));
      return true;
    } catch (error) {
      console.error(`Failed to write JSON to ${path$1}:`, error);
      return false;
    }
  });
  electron.ipcMain.handle("delete-file", (_, path$1) => {
    try {
      const fullPath = path.isAbsolute(path$1) ? path$1 : path.join(APP_DATA_DIR, path$1);
      if (!isSafePath(fullPath)) throw new Error("Path traversal detected");
      if (fs.existsSync(fullPath)) {
        const stat = require("fs").lstatSync(fullPath);
        if (stat.isDirectory()) {
          fs.rmdirSync(fullPath, { recursive: true });
        } else {
          fs.unlinkSync(fullPath);
        }
        return true;
      }
    } catch (error) {
      console.error(`Failed to delete file/dir at ${path$1}:`, error);
    }
    return false;
  });
  electron.ipcMain.handle("update-favorite-name", async (_, oldId, newName) => {
    try {
      const oldDir = path.join(APP_DATA_DIR, "data/favorite", oldId);
      const oldJson = path.join(oldDir, `${oldId}.json`);
      if (fs.existsSync(oldJson)) {
        const content = JSON.parse(fs.readFileSync(oldJson, "utf-8"));
        content.name = newName;
        fs.writeFileSync(oldJson, JSON.stringify(content, null, 2));
        return true;
      }
    } catch (error) {
      console.error("Rename favorite failed:", error);
    }
    return false;
  });
  electron.ipcMain.handle("register-shortcut", (event, accelerator) => {
    try {
      const success = electron.globalShortcut.register(accelerator, () => {
        event.sender.send("shortcut-pressed", accelerator);
      });
      return success;
    } catch (error) {
      console.error(`Failed to register shortcut ${accelerator}:`, error);
      return false;
    }
  });
  electron.ipcMain.handle("unregister-shortcut", (_, accelerator) => {
    electron.globalShortcut.unregister(accelerator);
  });
  electron.ipcMain.handle("unregister-all-shortcuts", () => {
    electron.globalShortcut.unregisterAll();
  });
  createWindow();
  electron.app.on("activate", function() {
    if (electron.BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
electron.app.on("will-quit", () => {
  electron.globalShortcut.unregisterAll();
});
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    electron.app.quit();
  }
});
