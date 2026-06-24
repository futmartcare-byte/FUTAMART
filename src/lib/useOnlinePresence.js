import { useEffect, useRef } from "react";
import { supabase } from "@/api/supabaseClient";
import { useAuth } from "@/lib/AuthContext";

const HEARTBEAT_INTERVAL = 15000;
const INACTIVE_TIMEOUT = 30000;

export function useOnlinePresence() {
  const { user } = useAuth();
  const userIdRef = useRef(null);
  const lastActivityRef = useRef(Date.now());
  const intervalRef = useRef(null);

  useEffect(() => {
    userIdRef.current = user?.id || null;
  }, [user?.id]);

  useEffect(() => {
    const setOnline = async (isOnline) => {
      const uid = userIdRef.current;
      if (!uid) return;
      try {
        await supabase.from("profiles").update({
          is_online: isOnline,
          last_seen: new Date().toISOString(),
        }).eq("id", uid);
      } catch {
        // silently ignore
      }
    };

    const resetActivity = () => { lastActivityRef.current = Date.now(); };

    setOnline(true);

    intervalRef.current = setInterval(() => {
      const idle = Date.now() - lastActivityRef.current;
      setOnline(idle < INACTIVE_TIMEOUT);
    }, HEARTBEAT_INTERVAL);

    const events = ["mousemove", "keydown", "touchstart", "scroll", "click", "pointermove"];
    events.forEach(e => window.addEventListener(e, resetActivity, { passive: true }));

    const handleVisibility = () => {
      if (document.hidden) {
        setOnline(false);
      } else {
        resetActivity();
        setOnline(true);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    const handleUnload = () => setOnline(false);
    window.addEventListener("beforeunload", handleUnload);

    const handleOffline = () => setOnline(false);
    const handleOnline = () => { resetActivity(); setOnline(true); };
    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      clearInterval(intervalRef.current);
      events.forEach(e => window.removeEventListener(e, resetActivity));
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("beforeunload", handleUnload);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
      setOnline(false);
    };
  }, []);
}

