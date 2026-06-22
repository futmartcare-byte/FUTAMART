import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { supabase } from "@/api/supabaseClient";
import { X, Bell } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

function NotificationToast({ toast, onClose }) {
  const navigate = useNavigate();
  useEffect(() => {
    const t = setTimeout(onClose, 5000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className="flex items-center gap-3 glass rounded-2xl px-3 py-2.5 border border-orange-400/20 shadow-2xl cursor-pointer"
      style={{ animation: "slideInDown 0.3s cubic-bezier(0.34,1.56,0.64,1)" }}
      onClick={() => { navigate("/notifications"); onClose(); }}
    >
      <div className="w-8 h-8 rounded-full bg-orange-500/20 border border-orange-400/30 flex items-center justify-center shrink-0">
        <Bell className="w-4 h-4 text-orange-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-foreground leading-tight truncate">{toast.title}</p>
        <p className="text-[11px] text-muted-foreground truncate">{toast.body}</p>
      </div>
      <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="shrink-0 p-0.5">
        <X className="w-3.5 h-3.5 text-muted-foreground" />
      </button>
    </div>
  );
}

export default function GlobalNotificationSystem() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [toasts, setToasts] = useState([]);
  const seenIds = useRef(new Set());
  const isFirstLoad = useRef(true);

  const dismiss = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  const playNotifSound = () => {
    const soundEnabled = localStorage.getItem("futmart-sound-notif") !== "false";
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (_) {}
  };

  useEffect(() => {
    if (!user?.id) return;

    // Ignore events that fire on initial subscription warmup
    const warmup = setTimeout(() => { isFirstLoad.current = false; }, 2500);

    // Listen for new messages (any chat) — used to refresh unread counts
    const msgChannel = supabase
      .channel(`global-messages-${user.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const msg = payload.new;
          if (!msg || msg.sender_id === user.id) return;
          if (seenIds.current.has(msg.id)) return;
          if (isFirstLoad.current) {
            seenIds.current.add(msg.id);
            return;
          }
          seenIds.current.add(msg.id);

          const msgNotifEnabled = localStorage.getItem("futmart-msg-notif") !== "false";
          if (!msgNotifEnabled) return;

          queryClient.invalidateQueries({ queryKey: ["chats-unread"] });
          queryClient.invalidateQueries({ queryKey: ["my-chats"] });
        }
      )
      .subscribe();

    // Listen for new notifications targeted at this user — show in-app toast
    const notifChannel = supabase
      .channel(`global-notifications-${user.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        (payload) => {
          const notif = payload.new;
          if (!notif) return;
          const key = `n-${notif.id}`;
          if (seenIds.current.has(key)) return;
          if (isFirstLoad.current) {
            seenIds.current.add(key);
            return;
          }
          seenIds.current.add(key);

          playNotifSound();

          setToasts((prev) => [
            ...prev.slice(-2),
            {
              id: `notif-${notif.id}`,
              title: notif.title,
              body: notif.message,
              type: notif.type || "info",
            },
          ]);
          queryClient.invalidateQueries({ queryKey: ["notifications", user.id] });
          queryClient.invalidateQueries({ queryKey: ["notifications"] });
        }
      )
      .subscribe();

    return () => {
      clearTimeout(warmup);
      supabase.removeChannel(msgChannel);
      supabase.removeChannel(notifChannel);
    };
  }, [user?.id, queryClient]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[300] w-[92vw] max-w-sm space-y-2 pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <NotificationToast toast={t} onClose={() => dismiss(t.id)} />
        </div>
      ))}
    </div>
  );
}
