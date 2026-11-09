const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  getTradeImagesDir: () => ipcRenderer.invoke("get-trade-images-dir"),
  saveTradeScreenshot: (sourcePath) =>
    ipcRenderer.invoke("save-trade-screenshot", sourcePath),
  openTradeScreenshot: () => ipcRenderer.invoke("dialog:openTradeScreenshot"),
});
