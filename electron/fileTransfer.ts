import fs from "node:fs/promises";
import path from "node:path";

export interface TransferProgress {
  copiedFiles: number;
  totalFiles: number;
  copiedBytes: number;
  totalBytes: number;
  currentFile: string;
}

export async function getTransferSize(rawFiles: string[]): Promise<number> {
  let totalBytes = 0;

  for (const rawFile of rawFiles) {
    const stats = await fs.stat(rawFile);
    totalBytes += stats.size;
  }

  return totalBytes;
}

export async function transferFiles(
  rawFiles: string[],
  rawRootFolder: string,
  outputFolder: string,
  onProgress: (progress: TransferProgress) => void,
): Promise<void> {
  const totalFiles = rawFiles.length;

  const totalBytes = await getTransferSize(rawFiles);

  let copiedFiles = 0;
  let copiedBytes = 0;

  for (const rawFile of rawFiles) {
    const relativePath = path.relative(rawRootFolder, rawFile);

    const destinationPath = path.join(outputFolder, relativePath);

    await fs.mkdir(path.dirname(destinationPath), {
      recursive: true,
    });

    const stats = await fs.stat(rawFile);

    await fs.copyFile(rawFile, destinationPath);

    copiedFiles += 1;
    copiedBytes += stats.size;

    onProgress({
      copiedFiles,
      totalFiles,
      copiedBytes,
      totalBytes,
      currentFile: rawFile,
    });
  }
}
