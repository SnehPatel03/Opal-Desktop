import {
  app,
  BrowserWindow,
  desktopCapturer,
  ipcMain,
  net,
  protocol,
  screen,
  shell,
} from "electron";
import { createClerkBridge } from "@clerk/electron";
import { storage } from "@clerk/electron/storage";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RENDERER_SCHEME = "opal";
const RENDERER_HOST = "renderer";

protocol.registerSchemesAsPrivileged([
  {
    scheme: RENDERER_SCHEME,
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true,
      stream: true,
    },
  },
]);

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

const clerkBridge = createClerkBridge({
  storage: storage(),
  renderer: {
    scheme: RENDERER_SCHEME,
    host: RENDERER_HOST,
  },
  userAgent: `Opal/${app.getVersion()}`,
});

let win: BrowserWindow | null = null;
let studio: BrowserWindow | null = null;
let floatingWebCam: BrowserWindow | null = null;

let studioProfile: unknown | null = null;

function secureWindowNavigation(window: BrowserWindow) {
  const appOrigin = `${RENDERER_SCHEME}://${RENDERER_HOST}`;
  const developmentOrigin = VITE_DEV_SERVER_URL
    ? new URL(VITE_DEV_SERVER_URL).origin
    : null;
  const allowedOrigins = new Set(
    [appOrigin, developmentOrigin].filter(
      (origin): origin is string => Boolean(origin),
    ),
  );

  window.webContents.on("will-navigate", (event, url) => {
    const target = new URL(url);
    const targetOrigin = `${target.protocol}//${target.host}`;
    if (allowedOrigins.has(targetOrigin)) return;

    event.preventDefault();
    if (target.protocol === "https:" || target.protocol === "http:") {
      void shell.openExternal(url);
    }
  });

  window.webContents.on("before-input-event", (event, input) => {
    const key = input.key.toLowerCase();
    const isDevToolsShortcut =
      input.key === "F12" ||
      ((input.control || input.meta) && input.shift && key === "i");

    if (!isDevToolsShortcut) return;

    event.preventDefault();
    if (window.webContents.isDevToolsOpened()) {
      window.webContents.closeDevTools();
    } else {
      window.webContents.openDevTools({ mode: "detach" });
    }
  });

  window.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https://") || url.startsWith("http://")) {
      void shell.openExternal(url);
    }
    return { action: "deny" };
  });
}

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

  secureWindowNavigation(win);
  secureWindowNavigation(studio);
  secureWindowNavigation(floatingWebCam);

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
    void win.loadURL(`${RENDERER_SCHEME}://${RENDERER_HOST}/index.html`);
    void studio.loadURL(`${RENDERER_SCHEME}://${RENDERER_HOST}/studio.html`);
    void floatingWebCam.loadURL(
      `${RENDERER_SCHEME}://${RENDERER_HOST}/webcam.html`,
    );
  }
}

async function registerRendererProtocol() {
  await protocol.handle(RENDERER_SCHEME, (request) => {
    const url = new URL(request.url);
    if (url.host !== RENDERER_HOST) {
      return new Response("Not found", { status: 404 });
    }

    const requestedPath = decodeURIComponent(url.pathname);
    const relativePath = requestedPath === "/" ? "index.html" : requestedPath.slice(1);
    const filePath = path.resolve(RENDERER_DIST, relativePath);
    const rendererRoot = path.resolve(RENDERER_DIST);

    if (!filePath.startsWith(`${rendererRoot}${path.sep}`)) {
      return new Response("Not found", { status: 404 });
    }

    return net.fetch(pathToFileURL(filePath).toString());
  });
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

if (clerkBridge.isPrimaryInstance) {
  app.whenReady().then(async () => {
    if (!VITE_DEV_SERVER_URL) {
      await registerRendererProtocol();
      app.setAsDefaultProtocolClient(RENDERER_SCHEME);
    }

    createWindow();
  });
}

app.on("before-quit", () => {
  clerkBridge.cleanup();
});