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
    <main className={(hideNav ? "" : "pb-20") + " flex-1 overflow-y-auto"}>
      <Outlet />
    </main>
  );

  return (
    <div className="h-[100dvh] flex flex-col max-w-lg mx-auto" style={{ background: "transparent" }}>
      <PresenceWrapper />
      {isHome ? <PullToRefresh>{content}</PullToRefresh> : content}
      {!hideNav && <BottomNav />}
      <PWAInstallBanner />
      <GlobalNotificationSystem />
    </div>
  );
}

