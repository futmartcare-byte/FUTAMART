import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { X, MessageSquare } from "lucide-react";

export default function NotificationToast({ notification, onClose }) {
  const navigate = useNavigate();
  const audioRef = useRef(null);

  useEffect(() => {
    // Play a subtle notification sound using Web Audio API
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.frequency.setValueAtTime(880, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.3);

    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, []);

  const handleClick = () => {
    if (notification.chat_id) navigate(`/chat/${notification.chat_id}`);
    onClose();
  };

  return (
    <div
      className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] w-[92vw] max-w-sm cursor-pointer"
      onClick={handleClick}
      style={{ animation: "slideDown 0.3s cubic-bezier(0.34,1.56,0.64,1)" }}
    >
      <div className="glass rounded-2xl p-3 flex items-center gap-3 border border-orange-400/30 shadow-2xl">
        <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center shrink-0 border border-orange-400/30">
          <MessageSquare className="w-5 h-5 text-orange-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-foreground truncate">{notification.senderName}</p>
          <p className="text-[11px] text-muted-foreground truncate">{notification.preview}</p>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          className="p-1 rounded-full glass shrink-0"
        >
          <X className="w-3 h-3 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
}
