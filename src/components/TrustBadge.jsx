import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * TrustBadge — displays a user's trust score as a colour-coded badge.
 * score: 0-100 (from Profile.trust_score)
 */
export default function TrustBadge({ score = 50, className }) {
  let label, color, bg;

  if (score >= 80) {
    label = "Trusted";
    color = "text-emerald-400";
    bg = "bg-emerald-400/15 border-emerald-400/30";
  } else if (score >= 55) {
    label = "Good";
    color = "text-blue-400";
    bg = "bg-blue-400/15 border-blue-400/30";
  } else if (score >= 30) {
    label = "Fair";
    color = "text-yellow-400";
    bg = "bg-yellow-400/15 border-yellow-400/30";
  } else {
    label = "New";
    color = "text-muted-foreground";
    bg = "bg-white/5 border-white/10";
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border",
        bg,
        color,
        className
      )}
    >
      <ShieldCheck className="w-3 h-3 shrink-0" />
      {label} · {score}
    </span>
  );
}
