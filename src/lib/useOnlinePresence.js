import { useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useProfile } from "@/lib/useProfile";

const HEARTBEAT_INTERVAL = 30000;
const INACTIVE_TIMEOUT = 120000;

export function useOnlinePresence() {
  const { data: profile } = useProfile();
  const profileIdRef = useRef(null);
  const lastActivityRef = useRef(Date.now());
  const intervalRef = useRef(null);

  // Keep profileId ref in sync
  useEffect(() => {
    profileIdRef.current = profile?.id || null;
  }, [profile?.id]);

  useEffect(() => {
    const setOnline = async (isOnline) => {
      const pid = profileIdRef.current;
      if (!pid) return;
      try {
        await base44.entities.Profile.update(pid, {
          is_online: isOnline,
          last_seen: new Date().toISOString(),
        });
      } catch {
        // silently ignore — presence is best-effort
      }
    };

    const resetActivity = () => { lastActivityRef.current = Date.now(); };

    setOnline(true);

    intervalRef.current = setInterval(() => {
      const idle = Date.now() - lastActivityRef.current;
      setOnline(idle < INACTIVE_TIMEOUT);
    }, HEARTBEAT_INTERVAL);

    const events = ["mousemove", "keydown", "touchstart", "scroll", "click"];
    events.forEach(e => window.addEventListener(e, resetActivity, { passive: true }));

    const handleVisibility = () => {
      if (document.hidden) setOnline(false);
      else { resetActivity(); setOnline(true); }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("beforeunload", () => setOnline(false));

    return () => {
      clearInterval(intervalRef.current);
      events.forEach(e => window.removeEventListener(e, resetActivity));
      document.removeEventListener("visibilitychange", handleVisibility);
      setOnline(false);
    };
  }, []); // run once — uses refs to stay current
}
