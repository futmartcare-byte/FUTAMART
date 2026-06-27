import { useState } from "react";
import { compressImage, MAX_FILE_SIZE } from "@/lib/imageUtils";
import { toast } from "sonner";

export default function FileUploadWithCompress({ onFile, accept = "image/*", children }) {
  const [pendingFile, setPendingFile] = useState(null);
  const [compressing, setCompressing] = useState(false);

  const handleChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size <= MAX_FILE_SIZE) {
      onFile(file);
    } else {
      setPendingFile(file);
      toast.error(File is KB — over 1MB limit. Please compress it.);
    }
    e.target.value = "";
  };

  const handleCompress = async (targetKB) => {
    if (!pendingFile) return;
    setCompressing(true);
    try {
      const compressed = await compressImage(pendingFile, targetKB);
      toast.success(Compressed to KB);
      onFile(compressed);
      setPendingFile(null);
    } catch {
      toast.error("Compression failed");
    } finally {
      setCompressing(false);
    }
  };

  return (
    <div>
      <label className="cursor-pointer">
        {children}
        <input type="file" accept={accept} className="hidden" onChange={handleChange} />
      </label>
      {pendingFile && (
        <div className="mt-2 p-3 glass rounded-2xl border border-orange-400/30 space-y-2">
          <p className="text-xs text-orange-400 font-semibold">
            File too large ({(pendingFile.size / 1024).toFixed(0)}KB). Choose compression:
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => handleCompress(900)}
              disabled={compressing}
              className="flex-1 py-1.5 rounded-xl text-xs font-bold glass text-foreground"
            >
              {compressing ? "Compressing..." : "Compress to 900KB"}
            </button>
            <button
              onClick={() => handleCompress(1000)}
              disabled={compressing}
              className="flex-1 py-1.5 rounded-xl text-xs font-bold glass text-foreground"
            >
              {compressing ? "Compressing..." : "Compress to 1MB"}
            </button>
          </div>
          <button onClick={() => setPendingFile(null)} className="text-[10px] text-muted-foreground w-full text-center">
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
