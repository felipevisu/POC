const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  openFile: () => ipcRenderer.invoke("open-file"),
  saveFile: (data) => ipcRenderer.invoke("save-file", data),
  getSystemInfo: () => ipcRenderer.invoke("get-system-info"),
  onFileOpened: (callback) => ipcRenderer.on("file-opened", (_event, data) => callback(data)),
  onTriggerSave: (callback) => ipcRenderer.on("trigger-save", () => callback()),
});
