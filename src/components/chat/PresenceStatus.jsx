import { formatDistanceToNow } from "date-fns";

export default function PresenceStatus({ profile }) {
  const isOnline = profile?.is_online;
  const lastSeen = profile?.last_seen;

  let statusText = "Offline";
  let statusClass = "text-muted-foreground/70";
  let dotClass = "bg-gray-500";

  if (isOnline) {
    statusText = "Online";
    statusClass = "text-emerald-400";
    dotClass = "bg-emerald-400";
  } else if (lastSeen) {
    const distance = formatDistanceToNow(new Date(lastSeen), { addSuffix: true });
    statusText = `Last seen ${distance}`;
    statusClass = "text-muted-foreground/60";
    dotClass = "bg-gray-500";
  }

  return (
    <div className="flex items-center gap-1.5 mt-0.5">
      <span className={`relative flex h-2 w-2 shrink-0`}>
        {isOnline && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${dotClass} ${isOnline ? "shadow-[0_0_6px_2px_rgba(52,211,153,0.6)]" : ""}`} />
      </span>
      <span className={`text-[10px] font-medium tracking-wide ${statusClass}`}>{statusText}</span>
    </div>
  );
}
