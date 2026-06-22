import { CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function VerifiedBadge({ className }) {
  return (
    <span className={cn("inline-flex items-center gap-0.5 text-green-400 text-xs font-medium", className)}>
      <CheckCircle className="w-3.5 h-3.5 fill-green-500/20" />
      Verified
    </span>
  );
}
