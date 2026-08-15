export {};

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
        copiedCount: number;
        totalBytes: number;
      }>;
    };
  }
}

interface RawFileMatch {
  rawFile: string;
  relativePath: string;
  fileName: string;
}
