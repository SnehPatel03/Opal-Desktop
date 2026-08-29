import {
  app,
  BrowserWindow,
  desktopCapturer,
  ipcMain,
  screen,
} from "electron";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

process.env.APP_ROOT = path.join(__dirname, "..");

export const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
export const MAIN_DIST = path.join(
  process.env.APP_ROOT,
  "dist-electron",
);
export const RENDERER_DIST = path.join(
  process.env.APP_ROOT,
  "dist",
);

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, "public")
  : RENDERER_DIST;

let win: BrowserWindow | null = null;
let studio: BrowserWindow | null = null;
let floatingWebCam: BrowserWindow | null = null;

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
    icon: path.join(
      process.env.VITE_PUBLIC,
      "electron-vite.svg",
    ),
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
    icon: path.join(
      process.env.VITE_PUBLIC,
      "electron-vite.svg",
    ),
    webPreferences: {
      nodeIntegration: false,
      devTools: true,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.mjs"),
    },
  });

  const primaryDisplay = screen.getPrimaryDisplay();
  const { workArea } = primaryDisplay;

  const webcamWidth = 400;
  const webcamHeight = 400;
  const margin = 5;

  const webcamX =
    workArea.x +
    workArea.width -
    webcamWidth -
    margin;

  const webcamY =
    workArea.y +
    workArea.height -
    webcamHeight -
    margin;

  floatingWebCam = new BrowserWindow({
    width: webcamWidth,
    height: webcamHeight,
    minWidth: webcamWidth,
    minHeight: webcamHeight,
    x: webcamX,
    y: webcamY,
    show: false,
    frame: false,
    hasShadow: false,
    transparent: true,
    backgroundColor: "#00000000",
    alwaysOnTop: true,
    focusable: true,
    movable: true,
    resizable: false,
    icon: path.join(
      process.env.VITE_PUBLIC,
      "electron-vite.svg",
    ),
    webPreferences: {
      nodeIntegration: false,
      devTools: true,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.mjs"),
    },
  });

  win.on("closed", () => {
    win = null;
  });

  studio.on("closed", () => {
    studio = null;
  });

  floatingWebCam.on("closed", () => {
    floatingWebCam = null;
  });

  if (win && !win.isDestroyed()) {
    win.setVisibleOnAllWorkspaces(true, {
      visibleOnFullScreen: true,
    });

    win.setAlwaysOnTop(true, "screen-saver", 1);
  }

  if (studio && !studio.isDestroyed()) {
    studio.setVisibleOnAllWorkspaces(true, {
      visibleOnFullScreen: true,
    });

    studio.setAlwaysOnTop(true, "screen-saver", 1);
  }

  if (
    floatingWebCam &&
    !floatingWebCam.isDestroyed()
  ) {
    floatingWebCam.setVisibleOnAllWorkspaces(true, {
      visibleOnFullScreen: true,
    });

    floatingWebCam.setAlwaysOnTop(
      true,
      "screen-saver",
      1,
    );
  }

  win.webContents.on("did-finish-load", () => {
    if (
      win &&
      !win.isDestroyed() &&
      !win.webContents.isDestroyed()
    ) {
      win.webContents.send(
        "main-process-message",
        new Date().toLocaleString(),
      );
    }
  });

  studio.webContents.on("did-finish-load", () => {
    if (
      !studio ||
      studio.isDestroyed() ||
      studio.webContents.isDestroyed()
    ) {
      return;
    }

    studio.webContents.send(
      "main-process-message",
      new Date().toLocaleString(),
    );

    if (studioProfile) {
      studio.webContents.send(
        "profile-received",
        studioProfile,
      );
    }
  });

  win.once("ready-to-show", () => {
    if (win && !win.isDestroyed()) {
      win.show();
    }
  });

  studio.once("ready-to-show", () => {
    if (studio && !studio.isDestroyed()) {
      studio.show();
    }
  });

  floatingWebCam.once("ready-to-show", () => {
    if (
      !floatingWebCam ||
      floatingWebCam.isDestroyed()
    ) {
      return;
    }

    floatingWebCam.setPosition(
      webcamX,
      webcamY,
    );

    floatingWebCam.show();
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);

    studio.loadURL(
      new URL(
        "studio.html",
        VITE_DEV_SERVER_URL,
      ).toString(),
    );

    floatingWebCam.loadURL(
      new URL(
        "webcam.html",
        VITE_DEV_SERVER_URL,
      ).toString(),
    );
  } else {
    win.loadFile(
      path.join(
        RENDERER_DIST,
        "index.html",
      ),
    );

    studio.loadFile(
      path.join(
        RENDERER_DIST,
        "studio.html",
      ),
    );

    floatingWebCam.loadFile(
      path.join(
        RENDERER_DIST,
        "webcam.html",
      ),
    );
  }
}

ipcMain.on("closeApp", (event) => {
  const currentWindow =
    BrowserWindow.fromWebContents(
      event.sender,
    );

  if (
    currentWindow &&
    !currentWindow.isDestroyed()
  ) {
    currentWindow.close();
  }
});

ipcMain.handle("getSources", async () => {
  const data =
    await desktopCapturer.getSources({
      thumbnailSize: {
        height: 100,
        width: 150,
      },
      fetchWindowIcons: true,
      types: [
        "window",
        "screen",
      ],
    });

  return data;
});

ipcMain.on(
  "media-sources",
  (_event, payload) => {
    console.log("🧐 Resources", payload);

    studioProfile = payload;

    if (
      studio &&
      !studio.isDestroyed() &&
      !studio.webContents.isDestroyed()
    ) {
      studio.webContents.send(
        "profile-received",
        payload,
      );
    }
  },
);

ipcMain.on(
  "resize-studio",
  (_event, payload) => {
    if (
      !studio ||
      studio.isDestroyed()
    ) {
      return;
    }

    if (payload.shrink) {
      studio.setSize(400, 100);
    } else {
      studio.setSize(400, 330);
    }
  },
);

ipcMain.on(
  "hide-plugin",
  (_event, payload) => {
    if (
      win &&
      !win.isDestroyed() &&
      !win.webContents.isDestroyed()
    ) {
      win.webContents.send(
        "hide-plugin",
        payload,
      );
    }
  },
);

app.on("activate", () => {
  if (
    BrowserWindow.getAllWindows()
      .length === 0
  ) {
    createWindow();
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();

    win = null;
    studio = null;
    floatingWebCam = null;
  }
});

app.whenReady().then(createWindow);