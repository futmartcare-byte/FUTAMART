import { useRef, useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";

const PULL_THRESHOLD = 70;
const MAX_PULL = 100;

export default function PullToRefresh({ children }) {
  const queryClient = useQueryClient();
  const containerRef = useRef(null);
  const startYRef = useRef(null);
  const pullingRef = useRef(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const onTouchStart = useCallback((e) => {
    const scrollEl = containerRef.current;
    if (!scrollEl || scrollEl.scrollTop > 0 || isRefreshing) return;
    startYRef.current = e.touches[0].clientY;
    pullingRef.current = true;
  }, [isRefreshing]);

  const onTouchMove = useCallback((e) => {
    if (!pullingRef.current || startYRef.current === null) return;
    const delta = e.touches[0].clientY - startYRef.current;
    if (delta <= 0) { setPullDistance(0); return; }
    const eased = Math.min(MAX_PULL, delta * 0.4);
    setPullDistance(eased);
  }, []);

  const onTouchEnd = useCallback(async () => {
    if (!pullingRef.current) return;
    pullingRef.current = false;
    startYRef.current = null;

    if (pullDistance >= PULL_THRESHOLD) {
      setIsRefreshing(true);
      setPullDistance(PULL_THRESHOLD * 0.6);
      if (navigator.vibrate) navigator.vibrate(20);
      try {
        await queryClient.invalidateQueries();
      } finally {
        setTimeout(() => {
          setIsRefreshing(false);
          setPullDistance(0);
        }, 500);
      }
    } else {
      setPullDistance(0);
    }
  }, [pullDistance, queryClient]);

  const progress = Math.min(1, pullDistance / PULL_THRESHOLD);
  const spinnerOffset = isRefreshing ? PULL_THRESHOLD * 0.6 : pullDistance;
  const contentShift = isRefreshing ? PULL_THRESHOLD * 0.35 : pullDistance * 0.35;

  return (
    <div
      ref={containerRef}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      style={{ overscrollBehaviorY: "contain", position: "relative" }}
    >
      <div
        className="absolute left-0 right-0 flex items-center justify-center pointer-events-none transition-transform duration-200"
        style={{
          top: 8,
          transform: `translateY(${spinnerOffset - 36}px)`,
          opacity: isRefreshing ? 1 : progress,
          zIndex: 30,
        }}
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg"
          style={{
            background: "linear-gradient(160deg, #FF6B00 0%, #FF8C00 50%, #FFB000 100%)",
            boxShadow: "0 4px 14px rgba(255,107,0,0.45)",
            transform: isRefreshing ? "none" : `rotate(${progress * 360}deg) scale(${0.7 + progress * 0.3})`,
          }}
        >
          <RefreshCw className={`w-4 h-4 text-white ${isRefreshing ? "animate-spin" : ""}`} strokeWidth={2.5} />
        </div>
      </div>
      <div
        className="transition-transform duration-200"
        style={{ transform: `translateY(${contentShift}px)` }}
      >
        {children}
      </div>
    </div>
  );
}
