import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function GlassButton({ children, variant = "orange", className, style, ...props }) {
  const orangeStyle = variant === "orange" ? {
    background: "#FF6B00",
    boxShadow: "0 4px 14px rgba(255,107,0,0.35), 0 2px 5px rgba(0,0,0,0.25)",
    border: "1px solid rgba(255,107,0,0.4)",
    ...style,
  } : style;

  return (
    <Button
      className={cn(
        "rounded-xl font-semibold transition-all duration-150",
        variant === "orange" && "text-white hover:brightness-110 active:scale-[0.97] active:translate-y-px",
        variant === "blue" && "bg-slate-600 hover:bg-slate-500 text-white",
        variant === "ghost" && "bg-secondary hover:bg-secondary/80 text-foreground",
        className
      )}
      style={orangeStyle}
      {...props}
    >
      {children}
    </Button>
  );
}
