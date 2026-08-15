import fs from "node:fs/promises";
import path from "node:path";

export interface TransferResult {
  copiedCount: number;
  totalBytes: number;
}

export async function transferFiles(
  rawFiles: string[],
  rawRootFolder: string,
  outputFolder: string,
): Promise<TransferResult> {
  let totalBytes = 0;

  for (const rawFile of rawFiles) {
    const relativePath = path.relative(rawRootFolder, rawFile);

    const destinationPath = path.join(outputFolder, relativePath);

    await fs.mkdir(path.dirname(destinationPath), {
      recursive: true,
    });

    await fs.copyFile(rawFile, destinationPath);

    const stats = await fs.stat(rawFile);
    totalBytes += stats.size;
  }

  return {
    copiedCount: rawFiles.length,
    totalBytes,
  };
}
