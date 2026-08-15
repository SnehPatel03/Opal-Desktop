import { ipcMain, BrowserWindow, app } from "electron";
import { fileURLToPath } from "node:url";
import path from "node:path";
const __dirname$1 = path.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path.join(__dirname$1, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
let win;
let studio;
let floatingWebCam;
function createWindow() {
  win = new BrowserWindow({
    width: 600,
    height: 600,
    minHeight: 600,
    minWidth: 300,
    show: false,
    frame: false,
    hasShadow: false,
    transparent: true,
    backgroundColor: "#171717",
    alwaysOnTop: true,
    focusable: true,
    movable: true,
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      nodeIntegration: false,
      devTools: true,
      contextIsolation: true,
      preload: path.join(__dirname$1, "preload.mjs")
    }
  });
  studio = new BrowserWindow({
    width: 400,
    height: 70,
    minHeight: 70,
    minWidth: 400,
    show: false,
    frame: false,
    hasShadow: false,
    transparent: true,
    backgroundColor: "#171717",
    alwaysOnTop: true,
    focusable: true,
    movable: true,
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      nodeIntegration: false,
      devTools: true,
      contextIsolation: true,
      preload: path.join(__dirname$1, "preload.mjs")
    }
  });
  floatingWebCam = new BrowserWindow({
    width: 400,
    height: 200,
    minHeight: 70,
    minWidth: 400,
    show: false,
    frame: false,
    hasShadow: false,
    transparent: true,
    backgroundColor: "#171717",
    alwaysOnTop: true,
    focusable: true,
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      nodeIntegration: false,
      devTools: true,
      contextIsolation: true,
      preload: path.join(__dirname$1, "preload.mjs")
    }
  });
  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  win.setAlwaysOnTop(true, "screen-saver", 1);
  studio.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  studio.setAlwaysOnTop(true, "screen-saver", 1);
  win.webContents.on("did-finish-load", () => {
    win == null ? void 0 : win.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  });
  studio.webContents.on("did-finish-load", () => {
    studio == null ? void 0 : studio.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  });
  win.once("ready-to-show", () => win == null ? void 0 : win.show());
  studio.once("ready-to-show", () => studio == null ? void 0 : studio.show());
  floatingWebCam.once("ready-to-show", () => floatingWebCam == null ? void 0 : floatingWebCam.show());
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
    studio.loadURL(new URL("studio.html", VITE_DEV_SERVER_URL).toString());
    floatingWebCam.loadURL(new URL("webcam.html", VITE_DEV_SERVER_URL).toString());
  } else {
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
    studio.loadFile(path.join(RENDERER_DIST, "studio.html"));
    floatingWebCam.loadFile(path.join(RENDERER_DIST, "webcam.html"));
  }
}
ipcMain.on("closeApp", (event) => {
  var _a;
  (_a = BrowserWindow.fromWebContents(event.sender)) == null ? void 0 : _a.close();
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
    studio = null;
    floatingWebCam = null;
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
app.whenReady().then(createWindow);
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
