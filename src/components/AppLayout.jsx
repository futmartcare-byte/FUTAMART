import { Outlet, useLocation } from "react-router-dom";
import BottomNav from "./BottomNav";
import PWAInstallBanner from "./PWAInstallBanner";
import { useOnlinePresence } from "@/lib/useOnlinePresence";
import GlobalNotificationSystem from "./notification/GlobalNotificationSystem";

function PresenceWrapper() {
  useOnlinePresence();
  return null;
}

export default function AppLayout() {
  const location = useLocation();
  const hideNav = location.pathname.startsWith("/listing/");

  return (
    <div className="min-h-screen max-w-lg mx-auto" style={{ background: "transparent" }}>
      <PresenceWrapper />
      <main className={hideNav ? "" : "pb-20"}>
        <Outlet />
      </main>
      {!hideNav && <BottomNav />}
      <PWAInstallBanner />
      <GlobalNotificationSystem />
    </div>
  );
}
