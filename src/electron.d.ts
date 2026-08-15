export {};

export interface TransferProgress {
  copiedFiles: number;
  totalFiles: number;
  copiedBytes: number;
  totalBytes: number;
  currentFile: string;
}

declare global {
  interface Window {
    electronAPI: {
      selectFolder: () => Promise<string | null>;

      scanFolder: (
        folderPath: string,
        type: "raw" | "jpeg",
      ) => Promise<string[]>;

      findMatches: (
        rawFolder: string,
        rawFiles: string[],
        jpegFiles: string[],
      ) => Promise<RawFileMatch[]>;

      transferFiles: (
        rawFiles: string[],
        rawRootFolder: string,
        outputFolder: string,
      ) => Promise<{
        success: boolean;
      }>;

      onTransferProgress: (
        callback: (progress: TransferProgress) => void,
      ) => () => void;
    };
  }
}

export interface RawFileMatch {
  rawFile: string;
  relativePath: string;
  fileName: string;
}
