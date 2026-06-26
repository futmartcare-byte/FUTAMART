import { useRef, useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";

const PULL_THRESHOLD = 64;
const MAX_PULL = 90;

export default function PullToRefresh({ children }) {
  const queryClient = useQueryClient();
  const startYRef = useRef(null);
  const pullingRef = useRef(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const onTouchStart = useCallback((e) => {
    if (window.scrollY > 0 || isRefreshing) return;
    startYRef.current = e.touches[0].clientY;
    pullingRef.current = true;
  }, [isRefreshing]);

  const onTouchMove = useCallback((e) => {
    if (!pullingRef.current || startYRef.current === null) return;
    if (window.scrollY > 0) {
      pullingRef.current = false;
      setPullDistance(0);
      return;
    }
    const delta = e.touches[0].clientY - startYRef.current;
    if (delta <= 0) { setPullDistance(0); return; }
    const eased = Math.min(MAX_PULL, delta * 0.45);
    setPullDistance(eased);
  }, []);

  const onTouchEnd = useCallback(async () => {
    if (!pullingRef.current) return;
    pullingRef.current = false;
    startYRef.current = null;

    if (pullDistance >= PULL_THRESHOLD) {
      setIsRefreshing(true);
      setPullDistance(PULL_THRESHOLD * 0.55);
      if (navigator.vibrate) navigator.vibrate(15);
      try {
        await queryClient.invalidateQueries();
      } finally {
        setTimeout(() => {
          setIsRefreshing(false);
          setPullDistance(0);
        }, 600);
      }
    } else {
      setPullDistance(0);
    }
  }, [pullDistance, queryClient]);

  const progress = Math.min(1, pullDistance / PULL_THRESHOLD);
  const circleY = isRefreshing ? PULL_THRESHOLD * 0.55 : pullDistance;

  return (
    <div
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      style={{ position: "relative" }}
    >
      <div
        className="fixed left-0 right-0 flex items-center justify-center pointer-events-none"
        style={{
          top: 0,
          transform: `translateY(${circleY + 14}px)`,
          opacity: isRefreshing ? 1 : progress,
          transition: pullingRef.current ? "none" : "transform 0.25s ease, opacity 0.25s ease",
          zIndex: 60,
        }}
      >
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{
            background: "linear-gradient(160deg, #FF6B00 0%, #FF8C00 50%, #FFB000 100%)",
            boxShadow: "0 4px 16px rgba(255,107,0,0.5), 0 2px 6px rgba(0,0,0,0.25)",
            transform: isRefreshing ? "none" : `rotate(${progress * 300}deg) scale(${0.6 + progress * 0.4})`,
            transition: pullingRef.current ? "none" : "transform 0.25s ease",
          }}
        >
          <RefreshCw className={`w-4 h-4 text-white ${isRefreshing ? "animate-spin" : ""}`} strokeWidth={2.5} />
        </div>
      </div>
      {children}
    </div>
  );
}
