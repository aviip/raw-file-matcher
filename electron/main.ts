import { app, BrowserWindow, dialog, ipcMain } from "electron";
import path from "node:path";
import { findFiles } from "./fileScanner";
import { RAW_EXTENSIONS, JPEG_EXTENSIONS } from "./constants";
import { findMatchingRawFiles } from "./fileMatcher";
import { transferFiles } from "./fileTransfer";

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1100,
    height: 750,
    minWidth: 900,
    minHeight: 600,

    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const devUrl = process.env.VITE_DEV_SERVER_URL;

  if (devUrl) {
    win.loadURL(devUrl);
  } else {
    win.loadFile(path.join(__dirname, "../dist/index.html"));
  }
};

ipcMain.handle("select-folder", async () => {
  const result = await dialog.showOpenDialog({
    properties: ["openDirectory"],
  });

  if (result.canceled) {
    return null;
  }

  return result.filePaths[0] ?? null;
});

ipcMain.handle(
  "find-matches",
  async (
    _event,
    rawFolder: string,
    rawFiles: string[],
    jpegFiles: string[],
  ) => {
    return findMatchingRawFiles(rawFiles, jpegFiles, rawFolder);
  },
);

ipcMain.handle(
  "scan-folder",
  async (_event, folderPath: string, type: "raw" | "jpeg") => {
    const extensions = type === "raw" ? RAW_EXTENSIONS : JPEG_EXTENSIONS;

    return findFiles(folderPath, extensions);
  },
);

ipcMain.handle(
  "transfer-files",
  async (
    _event,
    rawFiles: string[],
    rawRootFolder: string,
    outputFolder: string,
  ) => {
    return transferFiles(rawFiles, rawRootFolder, outputFolder);
  },
);

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
