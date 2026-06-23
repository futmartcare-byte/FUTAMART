import { useState, useEffect } from "react";
import { Download, X, RefreshCw } from "lucide-react";

export default function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstall, setShowInstall] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);
  const [swRegistration, setSwRegistration] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone;
    if (isStandalone) { setIsInstalled(true); return; }

    // Install banner
    const dismissed = sessionStorage.getItem("futmart-pwa-dismissed");
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!dismissed) { setShowInstall(true); setTimeout(() => setVisible(true), 50); }
    };
    window.addEventListener("beforeinstallprompt", handler);

    // SW update detection
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistration().then((reg) => {
        if (!reg) return;
        setSwRegistration(reg);
        reg.addEventListener("updatefound", () => {
          const newWorker = reg.installing;
          newWorker?.addEventListener("statechange", () => {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              setShowInstall(false);
              setShowUpdate(true);
              setTimeout(() => setVisible(true), 50);
            }
          });
        });
      });
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") { setIsInstalled(true); hide(); }
    setDeferredPrompt(null);
  };

  const handleUpdate = () => {
    if (swRegistration?.waiting) {
      swRegistration.waiting.postMessage({ type: "SKIP_WAITING" });
    }
    window.location.reload();
  };

  const hide = () => {
    setVisible(false);
    setTimeout(() => { setShowInstall(false); setShowUpdate(false); }, 300);
    sessionStorage.setItem("futmart-pwa-dismissed", "1");
  };

  if (isInstalled || (!showInstall && !showUpdate)) return null;

  return (
    <div
      className="fixed bottom-[76px] left-3 right-3 z-50 max-w-lg mx-auto"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: "opacity 0.3s ease, transform 0.3s ease",
      }}
    >
      <div
        className="rounded-2xl p-3.5 flex items-center gap-3 shadow-2xl border border-orange-400/25"
        style={{
          background: "linear-gradient(135deg, rgba(255,107,0,0.15) 0%, rgba(255,140,0,0.12) 100%)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 shadow-md" style={{ borderRadius: "20%" }}>
          <img
            src="https://media.base44.com/images/public/6a2370f9e6d0e6ce0d081a52/5bd4ffbb9_QjhED.jpg"
            alt="FUTAMART" className="w-full h-full object-contain"
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-foreground leading-tight">
            {showUpdate ? "Update Available" : "Install FutaMart"}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {showUpdate
              ? "A new version of FutaMart is available."
              : "Faster access, notifications & better experience."}
          </p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={showUpdate ? handleUpdate : handleInstall}
            className="px-3 py-1.5 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 shadow-lg"
            style={{
              background: "linear-gradient(135deg, #FF6B00 0%, #FF8C00 50%, #FFB000 100%)",
              boxShadow: "0 3px 12px rgba(255,107,0,0.45), inset 0 1px 0 rgba(255,255,255,0.2)",
            }}
          >
            {showUpdate ? <RefreshCw className="w-3 h-3" /> : <Download className="w-3 h-3" />}
            {showUpdate ? "Update" : "Install"}
          </button>
          <button onClick={hide} className="p-1.5 rounded-full glass text-muted-foreground hover:text-foreground">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
