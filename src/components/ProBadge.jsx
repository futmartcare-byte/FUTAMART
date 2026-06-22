import { cn } from "@/lib/utils";

export default function ProBadge({ className, size = "sm" }) {
  const isLg = size === "lg";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 font-bold rounded-full select-none",
        isLg
          ? "text-[11px] px-2.5 py-1"
          : "text-[9px] px-1.5 py-0.5",
        className
      )}
      title="Pro Seller"
      style={{
        background: "linear-gradient(135deg, #b8860b 0%, #ffd700 40%, #ffec6e 60%, #b8860b 100%)",
        color: "#1a0a00",
        boxShadow: "0 0 8px rgba(255,215,0,0.55), 0 1px 3px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.35)",
        border: "1px solid rgba(255,215,0,0.6)",
        textShadow: "0 0.5px 0 rgba(255,255,255,0.5)",
        letterSpacing: "0.03em",
      }}
    >
      <span style={{ filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.4))" }}>👑</span>
      {isLg ? " PRO SELLER" : "PRO"}
    </span>
  );
}
