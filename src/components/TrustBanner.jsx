import { ShieldAlert } from "lucide-react";

export default function TrustBanner() {
  return (
    <div className="mx-4 my-2 rounded-xl overflow-hidden flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/20">
      <ShieldAlert className="w-3.5 h-3.5 text-red-400 shrink-0" />
      <div className="overflow-hidden flex-1 whitespace-nowrap">
        <p className="inline-block text-[11px] font-bold text-red-400 animate-marquee">
          FUTAMART SAFETY TIP — For your safety, inspect and verify the item before payment. Always meet in a public location.
        </p>
      </div>
    </div>
  );
}
