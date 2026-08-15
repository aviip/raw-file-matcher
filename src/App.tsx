import { ArrowRight, FileImage, FolderOpen } from "lucide-react";
import { useState } from "react";
import type { RawFileMatch } from "./electron";

function App() {
  const [rawFolder, setRawFolder] = useState("");
  const [jpegFolder, setJpegFolder] = useState("");
  const [destinationFolder, setDestinationFolder] = useState("");

  const [rawFileCount, setRawFileCount] = useState(0);
  const [jpegFileCount, setJpegFileCount] = useState(0);

  const [rawFiles, setRawFiles] = useState<string[]>([]);
  const [jpegFiles, setJpegFiles] = useState<string[]>([]);
  const [matchedFiles, setMatchedFiles] = useState<RawFileMatch[]>([]);

  const selectRawFolder = async () => {
    const folder = await window.electronAPI.selectFolder();

    if (!folder) return;

    setRawFolder(folder);

    const files = await window.electronAPI.scanFolder(folder, "raw");

    setRawFiles(files);
    setRawFileCount(files.length);

    setMatchedFiles([]);
  };

  const selectJpegFolder = async () => {
    const folder = await window.electronAPI.selectFolder();

    if (!folder) {
      return;
    }

    setJpegFolder(folder);

    const files = await window.electronAPI.scanFolder(folder, "jpeg");

    setJpegFiles(files);
    setJpegFileCount(files.length);

    setMatchedFiles([]);
  };

  const selectDestinationFolder = async () => {
    const folder = await window.electronAPI.selectFolder();

    if (folder) {
      setDestinationFolder(folder);
    }
  };

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

        <button
          type="button"
          disabled={!rawFiles.length || !jpegFiles.length}
          onClick={async () => {
            if (!rawFolder) {
              return;
            }

            console.log("RAW STATE:", rawFiles);
            console.log("JPEG STATE:", jpegFiles);

            const matches = await window.electronAPI.findMatches(
              rawFolder,
              rawFiles,
              jpegFiles,
            );

            console.log("MATCHES:", matches);
            console.log("MATCH COUNT:", matches.length);

            setMatchedFiles(matches);
          }}
          className="mt-6 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
        >
          Find Matches
        </button>

        {matchedFiles.length > 0 && (
          <div className="mt-6 rounded-xl border bg-card p-5">
            <p className="text-sm font-medium">
              Matches found: {matchedFiles.length}
            </p>

            <div className="mt-4 max-h-60 overflow-auto rounded-lg bg-muted p-3">
              {matchedFiles.map((match) => (
                <div key={match.rawFile} className="py-1 text-xs">
                  {match.relativePath}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Matching explanation */}
        <div className="mt-10 rounded-xl border bg-card p-5">
          <div className="flex items-start gap-3">
            <FileImage className="mt-0.5 size-5 shrink-0 text-muted-foreground" />

            <div>
              <p className="text-sm font-medium">How matching works</p>

              <p className="mt-1 text-sm text-muted-foreground">
                JPEG and RAW files are matched using their exact filename
                without the extension.
              </p>

              <div className="mt-3 rounded-lg bg-muted px-4 py-3 font-mono text-xs">
                <div>2.jpg → 2.ARW ✓</div>
                <div>5.jpg → 5.ARW ✓</div>
                <div>6.jpg → 6.ARW ✓</div>
              </div>
            </div>
          </div>
        </div>

        {/* Start */}
        <div className="mt-8 flex justify-end">
          <button
            type="button"
            className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            Transfer
          </button>
        </div>

        {/* Progress */}
        <div className="mt-10 rounded-xl border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Ready</p>

              <p className="mt-1 text-xs text-muted-foreground">
                Select your RAW, JPEG and output folders to begin.
              </p>
            </div>

            <span className="text-sm font-medium">0%</span>
          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full w-0 rounded-full bg-primary" />
          </div>
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
