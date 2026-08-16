import { ipcMain, BrowserWindow, app, desktopCapturer } from "electron";
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
let studioProfile = null;
function createWindow() {
  win = new BrowserWindow({
    width: 440,
    height: 340,
    minHeight: 340,
    minWidth: 440,
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
    height: 100,
    minHeight: 100,
    minWidth: 400,
    show: false,
    frame: false,
    hasShadow: false,
    transparent: true,
    backgroundColor: "#00000000",
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
    studio == null ? void 0 : studio.webContents.send(
      "main-process-message",
      (/* @__PURE__ */ new Date()).toLocaleString()
    );
    if (studioProfile) {
      studio == null ? void 0 : studio.webContents.send("profile-received", studioProfile);
    }
  });
  win.once("ready-to-show", () => win == null ? void 0 : win.show());
  studio.once("ready-to-show", () => studio == null ? void 0 : studio.show());
  floatingWebCam.once("ready-to-show", () => floatingWebCam == null ? void 0 : floatingWebCam.show());
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
    studio.loadURL(new URL("studio.html", VITE_DEV_SERVER_URL).toString());
    floatingWebCam.loadURL(
      new URL("webcam.html", VITE_DEV_SERVER_URL).toString()
    );
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
ipcMain.on("closeApp", () => {
  if (process.platform != "darwin") {
    app.quit();
    win = null, studio = null, floatingWebCam = null;
  }
});
ipcMain.handle("getSources", async () => {
  const data = await desktopCapturer.getSources({
    thumbnailSize: { height: 100, width: 150 },
    fetchWindowIcons: true,
    types: ["window", "screen"]
  });
  return data;
});
ipcMain.on("media-sources", async (event, payload) => {
  console.log("🧐 Resources", payload);
  studioProfile = payload;
  studio == null ? void 0 : studio.webContents.send("profile-received", payload);
});
ipcMain.on("resize-studio", (event, payload) => {
  console.log(event);
  if (payload.shrink) {
    studio == null ? void 0 : studio.setSize(400, 100);
  }
  if (!payload.shrink) {
    studio == null ? void 0 : studio.setSize(400, 330);
  }
});
ipcMain.on("hide-plugin", (event, payload) => {
  console.log(event);
  win == null ? void 0 : win.webContents.send("hide-plugin", payload);
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
