export default function TypingIndicator({ name }) {
  if (!name) return null;
  return (
    <div className="flex items-end gap-1.5 px-3 py-1">
      <div className="w-7 h-7 rounded-full bg-card flex items-center justify-center text-xs font-bold text-orange-400 shrink-0">
        {name[0]?.toUpperCase()}
      </div>
      <div className="bg-white/10 rounded-2xl rounded-bl-sm px-3 py-2 flex items-center gap-1.5">
        <span className="text-[10px] text-muted-foreground mr-1">{name} is typing</span>
        <span className="flex gap-0.5 items-end">
          <span className="w-1 h-1 rounded-full bg-muted-foreground/70 animate-bounce" style={{ animationDelay: "0ms", animationDuration: "900ms" }} />
          <span className="w-1 h-1 rounded-full bg-muted-foreground/70 animate-bounce" style={{ animationDelay: "180ms", animationDuration: "900ms" }} />
          <span className="w-1 h-1 rounded-full bg-muted-foreground/70 animate-bounce" style={{ animationDelay: "360ms", animationDuration: "900ms" }} />
        </span>
      </div>
    </div>
  );
}

