import { useState, useRef } from "react";
import { compressImage } from "@/lib/imageUtils";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";

const LIMIT_KB = 900;

export default function FileUploadWithCompress({ onFile, accept = "image/*", multiple = false, children }) {
  const [pendingFiles, setPendingFiles] = useState([]);
  const [compressing, setCompressing] = useState(false);
  const inputRef = useRef();

  const handleChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const oversized = files.filter(f => f.size > LIMIT_KB * 1024);
    const fine = files.filter(f => f.size <= LIMIT_KB * 1024);
    fine.forEach(f => onFile(f));
    if (oversized.length) setPendingFiles(oversized);
    e.target.value = "";
  };

  const handleCompress = async () => {
    if (!pendingFiles.length) return;
    setCompressing(true);
    try {
      for (const file of pendingFiles) {
        const compressed = await compressImage(file, LIMIT_KB);
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
        <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4" onClick={() => !compressing && setPendingFiles([])}>
          <div className="glass rounded-2xl border border-red-500/40 bg-red-500/10 p-5 max-w-sm w-full space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="font-bold text-foreground text-sm">Image Too Large</p>
                <p className="text-xs text-muted-foreground">
                  {pendingFiles.length > 1 ? `${pendingFiles.length} images are` : "This image is"} over 900KB
                </p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Compress {pendingFiles.length > 1 ? "them" : "it"} to continue, or cancel and choose a different file.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleCompress}
                disabled={compressing}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-red-500 text-white disabled:opacity-60"
              >
                {compressing ? "Compressing..." : "Compress"}
              </button>
              <button
                onClick={() => setPendingFiles([])}
                disabled={compressing}
                className="px-4 py-2.5 rounded-xl text-sm text-muted-foreground glass"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

