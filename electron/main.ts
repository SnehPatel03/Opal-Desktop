import { app, BrowserWindow, desktopCapturer, ipcMain } from "electron";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// The built directory structure

process.env.APP_ROOT = path.join(__dirname, "..");

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, "public")
  : RENDERER_DIST;

let win: BrowserWindow | null;
let studio: BrowserWindow | null;
let floatingWebCam: BrowserWindow | null;
let studioProfile: unknown | null = null;

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
      preload: path.join(__dirname, "preload.mjs"),
    },
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
      preload: path.join(__dirname, "preload.mjs"),
    },
  });

  floatingWebCam = new BrowserWindow({
  width: 400,
  height: 400,

  minWidth: 400,
  minHeight: 400,

  show: false,
  frame: false,
  hasShadow: false,

  transparent: true,
  backgroundColor: "#00000000",

  alwaysOnTop: true,
  focusable: true,

  resizable: false,

  icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),

  webPreferences: {
    nodeIntegration: false,
    devTools: true,
    contextIsolation: true,
    preload: path.join(__dirname, "preload.mjs"),
  },
});

  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  win.setAlwaysOnTop(true, "screen-saver", 1);

  studio.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  studio.setAlwaysOnTop(true, "screen-saver", 1);

  floatingWebCam.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  floatingWebCam.setAlwaysOnTop(true, "screen-saver", 1);

  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString());
  });
  studio.webContents.on("did-finish-load", () => {
    studio?.webContents.send(
      "main-process-message",
      new Date().toLocaleString(),
    );
    if (studioProfile) {
      studio?.webContents.send("profile-received", studioProfile);
    }
  });

  win.once("ready-to-show", () => win?.show());
  studio.once("ready-to-show", () => studio?.show());
  floatingWebCam.once("ready-to-show", () => floatingWebCam?.show());

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
    studio.loadURL(new URL("studio.html", VITE_DEV_SERVER_URL).toString());
    floatingWebCam.loadURL(
      new URL("webcam.html", VITE_DEV_SERVER_URL).toString(),
    );
  } else {
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
    studio.loadFile(path.join(RENDERER_DIST, "studio.html"));
    floatingWebCam.loadFile(path.join(RENDERER_DIST, "webcam.html"));
  }
}

ipcMain.on("closeApp", (event) => {
  BrowserWindow.fromWebContents(event.sender)?.close();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
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
    ((win = null), (studio = null), (floatingWebCam = null));
  }
});

ipcMain.handle("getSources", async () => {
  const data = await desktopCapturer.getSources({
    thumbnailSize: { height: 100, width: 150 },
    fetchWindowIcons: true,
    types: ["window", "screen"],
  });
  // console.log('DISPLAYS 👊',data)
  return data;
});
ipcMain.on("media-sources", async (event, payload) => {
  console.log("🧐 Resources", payload);
  studioProfile = payload;
  studio?.webContents.send("profile-received", payload);
});

ipcMain.on("resize-studio", (event, payload) => {
  console.log(event);
  if (payload.shrink) {
    studio?.setSize(400, 100);
  }
  if (!payload.shrink) {
    studio?.setSize(400, 330);
  }
});

ipcMain.on("hide-plugin", (event, payload) => {
  console.log(event);
  win?.webContents.send("hide-plugin", payload);
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.whenReady().then(createWindow);
