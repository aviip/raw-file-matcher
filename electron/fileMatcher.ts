import path from "node:path";

export interface RawFileMatch {
  rawFile: string;
  relativePath: string;
  fileName: string;
}

function getFileBaseName(filePath: string): string {
  const fileName = path.basename(filePath);

  return fileName.split(".")[0].trim().toLowerCase();
}

export function findMatchingRawFiles(
  rawFiles: string[],
  jpegFiles: string[],
  rawRootFolder: string,
): RawFileMatch[] {
  const jpegBasenames = new Set(jpegFiles.map(getFileBaseName));

  const matches: RawFileMatch[] = [];

  for (const rawFile of rawFiles) {
    const rawBasename = getFileBaseName(rawFile);

    if (!jpegBasenames.has(rawBasename)) {
      continue;
    }

    matches.push({
      rawFile,
      relativePath: path.relative(rawRootFolder, rawFile),
      fileName: path.basename(rawFile),
    });
  }

  return matches;
}
