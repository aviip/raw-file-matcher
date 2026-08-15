import { ArrowRight, FolderOpen } from "lucide-react";
import { useEffect, useState } from "react";
import type { RawFileMatch, TransferProgress } from "./electron";

function App() {
  const [rawFolder, setRawFolder] = useState("");
  const [jpegFolder, setJpegFolder] = useState("");
  const [destinationFolder, setDestinationFolder] = useState("");

  const [rawFileCount, setRawFileCount] = useState(0);
  const [jpegFileCount, setJpegFileCount] = useState(0);

  const [rawFiles, setRawFiles] = useState<string[]>([]);
  const [jpegFiles, setJpegFiles] = useState<string[]>([]);
  const [matchedFiles, setMatchedFiles] = useState<RawFileMatch[]>([]);

  const [transferProgress, setTransferProgress] =
    useState<TransferProgress | null>(null);

  const [isTransferring, setIsTransferring] = useState(false);

  const selectRawFolder = async () => {
    const folder = await window.electronAPI.selectFolder();

    if (!folder) return;

    setRawFolder(folder);

    const files = await window.electronAPI.scanFolder(folder, "raw");

    setRawFiles(files);
    setRawFileCount(files.length);

    await findMatches(files, jpegFiles, folder);
  };

  const selectJpegFolder = async () => {
    const folder = await window.electronAPI.selectFolder();

    if (!folder) return;

    setJpegFolder(folder);

    const files = await window.electronAPI.scanFolder(folder, "jpeg");

    setJpegFiles(files);
    setJpegFileCount(files.length);

    await findMatches(rawFiles, files, rawFolder);
  };

  const selectDestinationFolder = async () => {
    const folder = await window.electronAPI.selectFolder();

    if (folder) {
      setDestinationFolder(folder);
    }
  };

  const findMatches = async (
    currentRawFiles: string[],
    currentJpegFiles: string[],
    currentRawFolder: string,
  ) => {
    if (
      !currentRawFiles.length ||
      !currentJpegFiles.length ||
      !currentRawFolder
    ) {
      setMatchedFiles([]);
      return;
    }

    const matches = await window.electronAPI.findMatches(
      currentRawFolder,
      currentRawFiles,
      currentJpegFiles,
    );

    setMatchedFiles(matches);
  };

  useEffect(() => {
    const removeListener = window.electronAPI.onTransferProgress((progress) => {
      setTransferProgress(progress);
    });

    return removeListener;
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-4xl px-8 py-10">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-semibold tracking-tight">
            RAW Photo Transfer
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Find RAW files that match your selected JPEG photos and copy them to
            another folder.
          </p>
        </div>

        {/* Folders */}
        <div className="space-y-6">
          <FolderInput
            label="RAW folder"
            value={rawFolder}
            onBrowse={selectRawFolder}
          />

          {rawFolder && (
            <p className="-mt-4 text-xs text-muted-foreground">
              {rawFileCount.toLocaleString()} RAW file
              {rawFileCount === 1 ? "" : "s"} found
            </p>
          )}

          <div className="flex justify-center">
            <ArrowRight className="size-5 text-muted-foreground" />
          </div>

          <FolderInput
            label="JPEG folder"
            value={jpegFolder}
            onBrowse={selectJpegFolder}
          />

          {jpegFolder && (
            <p className="-mt-4 text-xs text-muted-foreground">
              {jpegFileCount.toLocaleString()} JPEG file
              {jpegFileCount === 1 ? "" : "s"} found
            </p>
          )}

          <FolderInput
            label="Output folder"
            value={destinationFolder}
            onBrowse={selectDestinationFolder}
          />
        </div>

        {/* Matching explanation */}
        <div className="mt-10 rounded-xl border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Matching RAW files</p>

              <p className="mt-1 text-xs text-muted-foreground">
                RAW files whose filename matches a JPEG.
              </p>
            </div>

            <div className="text-2xl font-semibold">
              {matchedFiles.length.toLocaleString()}
            </div>
          </div>
        </div>

        {matchedFiles.length > 0 && (
          <div className="mt-4 overflow-hidden rounded-xl border bg-card">
            <div className="border-b px-6 py-4">
              <p className="text-sm font-medium">Files to transfer</p>
            </div>

            <div className="max-h-64 overflow-y-auto">
              {matchedFiles.map((match) => (
                <div
                  key={match.rawFile}
                  className="border-b px-6 py-3 last:border-b-0"
                >
                  <p className="truncate text-sm font-medium">
                    {match.fileName}
                  </p>

                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    {match.relativePath}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Start */}
        <div className="mt-8 flex justify-end">
          <button
            type="button"
            disabled={
              isTransferring ||
              !rawFolder ||
              !jpegFolder ||
              !destinationFolder ||
              matchedFiles.length === 0
            }
            onClick={async () => {
              if (!rawFolder || !destinationFolder) {
                return;
              }

              setIsTransferring(true);
              setTransferProgress(null);

              try {
                await window.electronAPI.transferFiles(
                  matchedFiles.map((match) => match.rawFile),
                  rawFolder,
                  destinationFolder,
                );
              } catch (error) {
                console.error("TRANSFER FAILED:", error);
              } finally {
                setIsTransferring(false);
              }
            }}
            className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isTransferring ? "Transferring..." : "Transfer"}
          </button>
        </div>

        {/* Progress */}
        <div className="mt-10 rounded-xl border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">
                {isTransferring
                  ? "Transferring files..."
                  : transferProgress &&
                      transferProgress.copiedFiles ===
                        transferProgress.totalFiles
                    ? "Transfer completed"
                    : "Ready"}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                {transferProgress
                  ? `${transferProgress.copiedFiles.toLocaleString()} / ${transferProgress.totalFiles.toLocaleString()} files`
                  : "Select your folders and transfer matching RAW files."}
              </p>
            </div>

            <span className="text-sm font-medium">
              {transferProgress
                ? `${Math.round(
                    (transferProgress.copiedBytes /
                      transferProgress.totalBytes) *
                      100,
                  )}%`
                : "0%"}
            </span>
          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-200"
              style={{
                width: `${
                  transferProgress
                    ? Math.round(
                        (transferProgress.copiedBytes /
                          transferProgress.totalBytes) *
                          100,
                      )
                    : 0
                }%`,
              }}
            />
          </div>

          {transferProgress && (
            <p
              className="mt-3 truncate text-xs text-muted-foreground"
              title={transferProgress.currentFile}
            >
              Current: {transferProgress.currentFile}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function FolderInput({
  label,
  value,
  onBrowse,
}: {
  label: string;
  value: string;
  onBrowse: () => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium">{label}</label>

      <div className="flex gap-2">
        <div className="flex h-11 flex-1 items-center overflow-hidden rounded-lg border bg-background px-4 text-sm">
          <span
            className={value ? "truncate" : "truncate text-muted-foreground"}
            title={value}
          >
            {value || "No folder selected"}
          </span>
        </div>

        <button
          type="button"
          onClick={onBrowse}
          className="flex h-11 items-center gap-2 rounded-lg border bg-background px-4 text-sm font-medium transition hover:bg-muted"
        >
          <FolderOpen className="size-4" />
          Browse
        </button>
      </div>
    </div>
  );
}

export default App;
