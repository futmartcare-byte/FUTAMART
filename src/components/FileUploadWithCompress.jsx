import { useState, useRef } from "react";
import { compressImage } from "@/lib/imageUtils";
import { toast } from "sonner";

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
        <div className="mt-2 p-4 glass rounded-2xl border border-orange-400/30 space-y-3">
          <p className="text-xs text-orange-400 font-semibold">
            {pendingFiles.length} image{pendingFiles.length > 1 ? "s are" : " is"} over 900KB
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleCompress}
              disabled={compressing}
              className="flex-1 py-2 rounded-xl text-xs font-bold bg-orange-500/20 text-orange-400 border border-orange-400/30"
            >
              {compressing ? "Compressing..." : "Compress"}
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
