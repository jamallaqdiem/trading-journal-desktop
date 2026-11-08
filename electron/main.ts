import { app, BrowserWindow } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import { startLocalServer } from "../server/index.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow: BrowserWindow | null = null;

// Create Window
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    title: "Trading Journal Pro",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  const isDev = process.env.NODE_ENV === "development";

  if (isDev) {
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }
}

// Application Lifecycle
app.whenReady().then(async () => {
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

  //  Open desktop window
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
