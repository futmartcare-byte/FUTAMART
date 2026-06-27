import { useState, useRef } from "react";
import { compressImage } from "@/lib/imageUtils";
import { toast } from "sonner";

const MIN_KB = 800;
const MAX_KB = 1024 * 1024;

export default function FileUploadWithCompress({ onFile, accept = "image/*", multiple = false, children }) {
  const [pendingFiles, setPendingFiles] = useState([]);
  const [compressing, setCompressing] = useState(false);
  const [targetKB, setTargetKB] = useState(800);
  const inputRef = useRef();

  const handleChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const oversized = files.filter(f => f.size > 800 * 1024);
    const fine = files.filter(f => f.size <= 800 * 1024);
    fine.forEach(f => onFile(f));
    if (oversized.length) setPendingFiles(oversized);
    e.target.value = "";
  };

  const handleCompress = async () => {
    if (!pendingFiles.length) return;
    setCompressing(true);
    try {
      for (const file of pendingFiles) {
        const compressed = await compressImage(file, targetKB);
        toast.success(compressed.name + " compressed to " + (compressed.size / 1024).toFixed(0) + "KB");
        onFile(compressed);
      }
      setPendingFiles([]);
    } catch {
      toast.error("Compression failed");
    } finally {
      setCompressing(false);
    }
  };

  const formatSize = (kb) => {
    if (kb >= 1024 * 1024) return (kb / (1024 * 1024)).toFixed(1) + "GB";
    if (kb >= 1024) return (kb / 1024).toFixed(1) + "MB";
    return kb + "KB";
  };

  return (
    <div>
      <label className="cursor-pointer" onClick={() => inputRef.current?.click()}>
        {children}
      </label>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={handleChange}
      />
      {pendingFiles.length > 0 && (
        <div className="mt-2 p-4 glass rounded-2xl border border-orange-400/30 space-y-3">
          <p className="text-xs text-orange-400 font-semibold">
            {pendingFiles.length} file{pendingFiles.length > 1 ? "s" : ""} over 800KB — choose target size:
          </p>
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>800KB</span>
              <span className="text-foreground font-bold">{formatSize(targetKB)}</span>
              <span>1GB</span>
            </div>
            <input
              type="range"
              min={MIN_KB}
              max={MAX_KB}
              step={100}
              value={targetKB}
              onChange={(e) => setTargetKB(Number(e.target.value))}
              className="w-full accent-orange-400"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCompress}
              disabled={compressing}
              className="flex-1 py-2 rounded-xl text-xs font-bold bg-orange-500/20 text-orange-400 border border-orange-400/30"
            >
              {compressing ? "Compressing..." : "Compress to " + formatSize(targetKB)}
            </button>
            <button
              onClick={() => setPendingFiles([])}
              className="px-3 py-2 rounded-xl text-xs text-muted-foreground glass"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
