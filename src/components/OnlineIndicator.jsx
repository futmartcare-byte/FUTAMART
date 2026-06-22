import { cn } from "@/lib/utils";

export default function OnlineIndicator({ isOnline, size = "sm", className }) {
  const sizes = { sm: "w-2.5 h-2.5", md: "w-3.5 h-3.5", lg: "w-4 h-4" };
  return (
    <span
      className={cn(
        "rounded-full border-2 border-background inline-block",
        sizes[size],
        isOnline ? "bg-green-500 glow-green" : "bg-gray-500",
        className
      )}
    />
  );
}
