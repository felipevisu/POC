const { app, BrowserWindow, ipcMain, dialog, Menu } = require("electron");
const path = require("path");
const fs = require("fs");

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 680,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadFile("index.html");

  const menu = Menu.buildFromTemplate([
    {
      label: "File",
      submenu: [
        {
          label: "Open File",
          accelerator: "CmdOrCtrl+O",
          click: () => handleOpenFile(),
        },
        {
          label: "Save File",
          accelerator: "CmdOrCtrl+S",
          click: () => mainWindow.webContents.send("trigger-save"),
        },
        { type: "separator" },
        { role: "quit" },
      ],
    },
    {
      label: "Edit",
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
      ],
    },
    {
      label: "View",
      submenu: [
        { role: "reload" },
        { role: "toggleDevTools" },
        { type: "separator" },
        { role: "zoomIn" },
        { role: "zoomOut" },
        { role: "resetZoom" },
      ],
    },
  ]);

  Menu.setApplicationMenu(menu);
}

async function handleOpenFile() {
  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    properties: ["openFile"],
    filters: [
      { name: "Text Files", extensions: ["txt", "md", "js", "json", "html", "css"] },
      { name: "All Files", extensions: ["*"] },
    ],
  });

  if (canceled || filePaths.length === 0) return;

  const filePath = filePaths[0];
  const content = fs.readFileSync(filePath, "utf-8");
  mainWindow.webContents.send("file-opened", { filePath, content });
}

ipcMain.handle("open-file", handleOpenFile);

ipcMain.handle("save-file", async (_event, { filePath, content }) => {
  if (!filePath) {
    const { canceled, filePath: savePath } = await dialog.showSaveDialog(mainWindow, {
      filters: [
        { name: "Text Files", extensions: ["txt", "md", "js", "json"] },
        { name: "All Files", extensions: ["*"] },
      ],
    });
    if (canceled) return null;
    filePath = savePath;
  }

  fs.writeFileSync(filePath, content, "utf-8");
  return filePath;
});

ipcMain.handle("get-system-info", () => {
  return {
    platform: process.platform,
    arch: process.arch,
    electronVersion: process.versions.electron,
    nodeVersion: process.versions.node,
    chromeVersion: process.versions.chrome,
    v8Version: process.versions.v8,
  };
});

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
