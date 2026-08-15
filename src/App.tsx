import { FolderOpen, ArrowRight, FileText } from "lucide-react";
import { useState } from "react";

function App() {
  const [sourceFolder, setSourceFolder] = useState("");
  const [destinationFolder, setDestinationFolder] = useState("");

  const selectSourceFolder = async () => {
    console.log("Browse clicked");
    console.log("electronAPI:", window.electronAPI);

    const folder = await window.electronAPI.selectFolder();

    if (folder) {
      setSourceFolder(folder);
    }
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
            Raw File Matcher
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Find matching raw files and copy them to another folder.
          </p>
        </div>

        {/* Source / Destination */}
        <div className="space-y-6">
          <FolderInput
            label="Source folder"
            value={sourceFolder}
            onBrowse={selectSourceFolder}
          />

          <div className="flex justify-center">
            <ArrowRight className="size-5 text-muted-foreground" />
          </div>

          <FolderInput
            label="Destination folder"
            value={destinationFolder}
            onBrowse={selectDestinationFolder}
          />
        </div>

        {/* Match input */}
        <div className="mt-10">
          <div className="mb-2 flex items-center gap-2">
            <FileText className="size-4" />

            <label className="text-sm font-medium">Files to match</label>
          </div>

          <textarea
            className="min-h-40 w-full resize-y rounded-lg border bg-background px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-ring"
            placeholder={`Paste filenames here...

                          Example:
                          ABC001
                          ABC002
                          ABC003`}
          />

          <p className="mt-2 text-xs text-muted-foreground">
            Enter one filename per line.
          </p>
        </div>

        {/* Start */}
        <div className="mt-8 flex justify-end">
          <button
            type="button"
            className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            Start Copy
          </button>
        </div>

        {/* Progress */}
        <div className="mt-10 rounded-xl border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Ready</p>

              <p className="mt-1 text-xs text-muted-foreground">
                Select your folders and enter the filenames to begin.
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
          <span className="truncate text-muted-foreground">
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
