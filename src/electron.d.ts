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
    };
  }
}

export interface RawFileMatch {
  rawFile: string;
  relativePath: string;
  fileName: string;
}
