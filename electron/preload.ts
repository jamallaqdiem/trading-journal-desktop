import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("api", {
  getTrades: () => ipcRenderer.invoke("get-trades"),
  addTrade: (trade: unknown) => ipcRenderer.invoke("add-trade", trade),
});
