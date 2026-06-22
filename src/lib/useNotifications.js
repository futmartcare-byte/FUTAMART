import { useEffect, useRef, useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";

export function useNotifications() {
  const { user } = useAuth();
  const [toasts, setToasts] = useState([]);
  const prevMsgIds = useRef(new Set());
  const isFirstLoad = useRef(true);

  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  useEffect(() => {
    if (!user?.id) return;

    const unsub = base44.entities.Message.subscribe((event) => {
      if (event.type !== "create") return;
      const msg = event.data;
      if (!msg || msg.sender_id === user.id) return;
      if (prevMsgIds.current.has(msg.id)) return;
      prevMsgIds.current.add(msg.id);
      if (isFirstLoad.current) return;

      // Check notification prefs
      const soundEnabled = localStorage.getItem("futmart-sound-notif") !== "false";
      const msgNotifEnabled = localStorage.getItem("futmart-msg-notif") !== "false";
      if (!msgNotifEnabled) return;

      const toast = {
        id: `toast-${msg.id}`,
        senderName: msg.sender_name || "Someone",
        preview: msg.payload_text || (msg.attachment_type === "voice_note" ? "🎙️ Voice note" : "📎 Attachment"),
        chat_id: msg.chat_id,
        soundEnabled,
      };
      setToasts(prev => [...prev.slice(-2), toast]);

      // Push notification
      if (Notification.permission === "granted" && document.visibilityState !== "visible") {
        new Notification(`New message from ${toast.senderName}`, {
          body: toast.preview,
          icon: "https://media.base44.com/images/public/6a2370f9e6d0e6ce0d081a52/5bd4ffbb9_QjhED.jpg",
          tag: `msg-${msg.chat_id}`,
          data: { chat_id: msg.chat_id },
        });
      }
    });

    setTimeout(() => { isFirstLoad.current = false; }, 2000);

    return () => unsub();
  }, [user?.id]);

  return { toasts, dismissToast };
}

export async function requestPushPermission() {
  if (!("Notification" in window)) return "unsupported";
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";
  const result = await Notification.requestPermission();
  return result;
}
