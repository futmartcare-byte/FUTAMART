import { Outlet, useLocation } from "react-router-dom";
import BottomNav from "./BottomNav";
import PWAInstallBanner from "./PWAInstallBanner";
import PullToRefresh from "./PullToRefresh";
import { useOnlinePresence } from "@/lib/useOnlinePresence";
import GlobalNotificationSystem from "./notification/GlobalNotificationSystem";

function PresenceWrapper() {
  useOnlinePresence();
  return null;
}

export default function AppLayout() {
  const location = useLocation();
  const hideNav = location.pathname.startsWith("/listing/");
  const isHome = location.pathname === "/";

  const content = (
    <main className={hideNav ? "" : "pb-20"}>
      <Outlet />
    </main>
  );

  return (
    <div className="min-h-screen max-w-lg mx-auto" style={{ background: "transparent" }}>
      <PresenceWrapper />
      {isHome ? <PullToRefresh>{content}</PullToRefresh> : content}
      {!hideNav && <BottomNav />}
      <PWAInstallBanner />
      <GlobalNotificationSystem />
    </div>
  );
}
