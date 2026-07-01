const fs = require("fs");
let content = fs.readFileSync("src/pages/ListingDetail.jsx", "utf8").replace(/\r\n/g, "\n");

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

fs.writeFileSync("src/pages/ListingDetail.jsx", content, { encoding: "utf8" });
console.log("Main carousel swipe added");
