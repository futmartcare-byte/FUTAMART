import { useRef, useState } from "react";

const SWIPE_THRESHOLD = 60;

export default function SwipeMessage({ isMe, children, onReply }) {
  const startXRef = useRef(null);
  const [offset, setOffset] = useState(0);
  const [triggered, setTriggered] = useState(false);

  const onStart = (clientX) => {
    startXRef.current = clientX;
    setTriggered(false);
  };

  const onMove = (clientX) => {
    if (startXRef.current === null) return;
    const delta = clientX - startXRef.current;
    // Incoming = swipe right (positive delta), Outgoing = swipe left (negative delta)
    const valid = isMe ? delta < 0 : delta > 0;
    if (!valid) return;
    const clamped = isMe
      ? Math.max(-SWIPE_THRESHOLD * 1.2, delta)
      : Math.min(SWIPE_THRESHOLD * 1.2, delta);
    setOffset(clamped);
    if (!triggered && Math.abs(clamped) >= SWIPE_THRESHOLD) {
      setTriggered(true);
      if (navigator.vibrate) navigator.vibrate(40);
    }
  };

  const onEnd = () => {
    if (triggered) onReply?.();
    setOffset(0);
    setTriggered(false);
    startXRef.current = null;
  };

  return (
    <div
      className="relative select-none"
      style={{ transform: `translateX(${offset}px)`, transition: offset === 0 ? "transform 0.25s cubic-bezier(0.25,0.46,0.45,0.94)" : "none" }}
      onTouchStart={(e) => onStart(e.touches[0].clientX)}
      onTouchMove={(e) => onMove(e.touches[0].clientX)}
      onTouchEnd={onEnd}
      onMouseDown={(e) => onStart(e.clientX)}
      onMouseMove={(e) => { if (startXRef.current !== null) onMove(e.clientX); }}
      onMouseUp={onEnd}
      onMouseLeave={() => { if (startXRef.current !== null) onEnd(); }}
    >
      {children}
    </div>
  );
}
