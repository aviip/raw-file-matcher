import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  selectFolder: () => ipcRenderer.invoke("select-folder"),

  scanFolder: (folderPath: string, type: "raw" | "jpeg") =>
    ipcRenderer.invoke("scan-folder", folderPath, type),

  findMatches: (rawFolder: string, rawFiles: string[], jpegFiles: string[]) =>
    ipcRenderer.invoke("find-matches", rawFolder, rawFiles, jpegFiles),

  transferFiles: (
    rawFiles: string[],
    rawRootFolder: string,
    outputFolder: string,
  ) =>
    ipcRenderer.invoke("transfer-files", rawFiles, rawRootFolder, outputFolder),

  onTransferProgress: (
    callback: (progress: {
      copiedFiles: number;
      totalFiles: number;
      copiedBytes: number;
      totalBytes: number;
      currentFile: string;
    }) => void,
  ) => {
    const listener = (
      _event: Electron.IpcRendererEvent,
      progress: {
        copiedFiles: number;
        totalFiles: number;
        copiedBytes: number;
        totalBytes: number;
        currentFile: string;
      },
    ) => {
      callback(progress);
    };

    ipcRenderer.on("transfer-progress", listener);

    return () => {
      ipcRenderer.removeListener("transfer-progress", listener);
    };
  },
});
