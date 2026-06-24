import { useRef, useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";

const PULL_THRESHOLD = 70;
const MAX_PULL = 110;

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
    const eased = Math.min(MAX_PULL, delta * 0.5);
    setPullDistance(eased);
  }, []);

  const onTouchEnd = useCallback(async () => {
    if (!pullingRef.current) return;
    pullingRef.current = false;
    startYRef.current = null;

    if (pullDistance >= PULL_THRESHOLD) {
      setIsRefreshing(true);
      setPullDistance(PULL_THRESHOLD);
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

  return (
    <div
      ref={containerRef}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      style={{ overscrollBehaviorY: "contain" }}
    >
      <div
        className="flex items-center justify-center overflow-hidden transition-[height] duration-200"
        style={{ height: isRefreshing ? PULL_THRESHOLD : pullDistance }}
      >
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center shadow-lg"
          style={{
            background: "linear-gradient(160deg, #FF6B00 0%, #FF8C00 50%, #FFB000 100%)",
            boxShadow: "0 4px 14px rgba(255,107,0,0.5)",
            transform: `rotate(${progress * 360}deg)`,
            opacity: progress,
          }}
        >
          <RefreshCw className={`w-4 h-4 text-white ${isRefreshing ? "animate-spin" : ""}`} strokeWidth={2.5} />
        </div>
      </div>
      {children}
    </div>
  );
}