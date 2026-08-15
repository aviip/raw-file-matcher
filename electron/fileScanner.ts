import fs from "node:fs/promises";
import path from "node:path";

export async function findFiles(
  folderPath: string,
  extensions: string[],
): Promise<string[]> {
  const files: string[] = [];

  const normalizedExtensions = new Set(
    extensions.map((extension) =>
      extension.toLowerCase().startsWith(".")
        ? extension.toLowerCase()
        : `.${extension.toLowerCase()}`,
    ),
  );

  async function scanFolder(currentFolder: string): Promise<void> {
    const entries = await fs.readdir(currentFolder, {
      withFileTypes: true,
    });

    for (const entry of entries) {
      const fullPath = path.join(currentFolder, entry.name);

      if (entry.isDirectory()) {
        await scanFolder(fullPath);
        continue;
      }

      if (!entry.isFile()) {
        continue;
      }

      const extension = path.extname(entry.name).toLowerCase();

      if (normalizedExtensions.has(extension)) {
        files.push(fullPath);
      }
    }
  }

  await scanFolder(folderPath);

  return files;
}
