import { cn } from "@/lib/utils";

export default function GlassCard({ children, className, glow, ...props }) {
  return (
    <div
      className={cn(
        "glass rounded-2xl",
        glow === "orange" && "glow-orange",
        glow === "blue" && "glow-blue",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
