import { useState, useEffect } from "react";
import { Download, X, Share, SquarePlus } from "lucide-react";

export default function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstall, setShowInstall] = useState(false);
  const [showIosSteps, setShowIosSteps] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone;
    const dismissed = sessionStorage.getItem("futmart-pwa-dismissed");
    if (isStandalone || dismissed) return;

    const ua = window.navigator.userAgent;
    const iosDevice = /iPhone|iPad|iPod/.test(ua) && !window.MSStream;
    const isSafari = /^((?!chrome|android).)*safari/i.test(ua);

    if (iosDevice && isSafari) {
      setIsIos(true);
      setShowInstall(true);
      setTimeout(() => setVisible(true), 50);
    } else {
      const handler = (e) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setShowInstall(true);
        setTimeout(() => setVisible(true), 50);
      };
      window.addEventListener("beforeinstallprompt", handler);
      return () => window.removeEventListener("beforeinstallprompt", handler);
    }
  }, []);

  const handleInstall = async () => {
    if (isIos) { setShowIosSteps(true); return; }
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") hide();
    setDeferredPrompt(null);
  };

  const hide = () => {
    setVisible(false);
    setTimeout(() => { setShowInstall(false); setShowIosSteps(false); }, 300);
    sessionStorage.setItem("futmart-pwa-dismissed", "1");
  };

  if (!showInstall) return null;

  return (
    <div
      className="fixed bottom-[76px] left-3 right-3 z-50 max-w-lg mx-auto"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: "opacity 0.3s ease, transform 0.3s ease",
      }}
    >
      {showIosSteps ? (
        <div
          className="rounded-2xl p-4 shadow-2xl border border-orange-400/25"
          style={{
            background: "linear-gradient(135deg, rgba(255,107,0,0.18) 0%, rgba(255,140,0,0.14) 100%)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-bold text-foreground">Install FutaMart</p>
            <button onClick={hide} className="p-1 rounded-full glass text-muted-foreground hover:text-foreground">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex items-center gap-2 text-xs text-foreground/90 mb-1.5">
            <span className="w-5 h-5 rounded-full bg-orange-400/20 flex items-center justify-center font-bold text-orange-400 shrink-0">1</span>
            Tap the <Share className="w-3.5 h-3.5 inline mx-1" /> Share icon in Safari's toolbar
          </div>
          <div className="flex items-center gap-2 text-xs text-foreground/90">
            <span className="w-5 h-5 rounded-full bg-orange-400/20 flex items-center justify-center font-bold text-orange-400 shrink-0">2</span>
            Scroll down and tap <SquarePlus className="w-3.5 h-3.5 inline mx-1" /> "Add to Home Screen"
          </div>
        </div>
      ) : (
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
              alt="FUTAMART"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-foreground leading-tight">Install FutaMart</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Faster access, notifications & better experience.</p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleInstall}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 shadow-lg"
              style={{
                background: "linear-gradient(135deg, #FF6B00 0%, #FF8C00 50%, #FFB000 100%)",
                boxShadow: "0 3px 12px rgba(255,107,0,0.45), inset 0 1px 0 rgba(255,255,255,0.2)",
              }}
            >
              <Download className="w-3 h-3" />
              Install
            </button>
            <button onClick={hide} className="p-1.5 rounded-full glass text-muted-foreground hover:text-foreground">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
