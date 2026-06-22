import { ShieldAlert } from "lucide-react";
import GlassCard from "./GlassCard";

export default function TrustBanner() {
  return (
    <GlassCard className="mx-4 my-2 p-3 flex items-start gap-2 border-amber-500/30 bg-[#563e3e] text-[#3b2b2b]">
      <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
      <p className="text-xs leading-relaxed text-[#ff0000]">FUTAMART SAFETY TIP
For your safety, inspect and verify the item before payment. Always meet in a public location.

      </p>
    </GlassCard>);

}

