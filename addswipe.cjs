const fs = require("fs");
let content = fs.readFileSync("src/pages/ListingDetail.jsx", "utf8").replace(/\r\n/g, "\n");

// 1. Add useRef import
content = content.replace(
  'import { useState } from "react";',
  'import { useState, useRef } from "react";'
);

// 2. Add refs and touch handlers right after existing useState declarations
content = content.replace(
  '  const [saved, setSaved] = useState(false);',
  `  const [saved, setSaved] = useState(false);
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);
  const wasSwipe = useRef(false);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    wasSwipe.current = false;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;
    if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY)) {
      wasSwipe.current = true;
      if (deltaX > 0) {
        setCurrentImage((prev) => Math.max(0, prev - 1));
      } else {
        setCurrentImage((prev) => Math.min(images.length - 1, prev + 1));
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };`
);

// 3. Main carousel image - add touch handlers, guard the tap-to-zoom click
content = content.replace(
  `            <img
              src={addWatermark(images[currentImage],listing?.seller_username)}
              alt={listing.title}
              className="w-full h-full object-cover cursor-zoom-in allow-interaction"
              onClick={() => setLightbox(true)}
            />`,
  `            <img
              src={addWatermark(images[currentImage],listing?.seller_username)}
              alt={listing.title}
              className="w-full h-full object-cover cursor-zoom-in allow-interaction"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              onClick={() => { if (wasSwipe.current) { wasSwipe.current = false; return; } setLightbox(true); }}
            />`
);

// 4. Lightbox wrapper - add touch handlers, guard the tap-to-close click
content = content.replace(
  `      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.95)" }}
          onClick={() => setLightbox(false)}
        >`,
  `      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.95)" }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onClick={() => { if (wasSwipe.current) { wasSwipe.current = false; return; } setLightbox(false); }}
        >`
);

fs.writeFileSync("src/pages/ListingDetail.jsx", content, { encoding: "utf8" });
console.log("Swipe handlers added");
