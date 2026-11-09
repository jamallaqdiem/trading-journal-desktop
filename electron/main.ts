import { app, BrowserWindow, protocol, net, ipcMain, dialog } from "electron";
import path from "node:path";
import fs from "fs";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { startLocalServer } from "../server/index.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow: BrowserWindow | null = null;

//  register schemes as privileged before app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: "trade-img", privileges: { bypassCSP: true, stream: true } },
]);

// Create Window
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: "Trading Analytics Platform",
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "./preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Maximize window on open
  mainWindow.maximize();

  const isDev = process.env.NODE_ENV === "development";

  if (isDev) {
    // Vite dev server URL
    const PORT = process.env.VITE_PORT || 5173;
    mainWindow.loadURL(`http://localhost:${PORT}`);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, "../client/dist/index.html"));
  }
}

// Application Lifecycle
app.whenReady().then(async () => {
  // Set up custom file protocol handler for secure trade img rendering
  protocol.handle("trade-img", (request) => {
    const filePath = decodeURIComponent(
      request.url.replace("trade-img://", ""),
    );
    return net.fetch(`file://${path.resolve(filePath)}`);
  });

  try {
    // Boot up local Express server + SQLite migrations on port 5000
    await startLocalServer();
    console.log(
      "[Electron]: Local Express & SQLite backend initialized successfully.",
    );
  } catch (error) {
    console.error(
      "[Electron Error]: Failed to start local backend server:",
      error,
    );
  }

  // Open desktop window
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// IPC Handler to provide the designated trade screenshots directory inside userData
ipcMain.handle("dialog:openTradeScreenshot", async () => {
  try {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      properties: ["openFile"],
      filters: [{ name: "Images", extensions: ["png", "jpg", "jpeg", "webp"] }],
    });

    if (canceled || filePaths.length === 0) {
      return null;
    }

    const sourcePath = filePaths[0];
    const userDataDir = app.getPath("userData");
    const imagesDir = path.join(userDataDir, "trade_screenshots");

    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
    }

    const ext = path.extname(sourcePath) || ".png";
    const fileName = `${Date.now()}_${crypto.randomBytes(4).toString("hex")}${ext}`;
    const destinationPath = path.join(imagesDir, fileName);

    fs.copyFileSync(sourcePath, destinationPath);
    return destinationPath; // Absolute path to save in SQLite
  } catch (error) {
    console.error("Failed to select/save screenshot:", error);
    return null;
  }
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
