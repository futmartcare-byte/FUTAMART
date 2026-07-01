const fs = require("fs");
let content = fs.readFileSync("src/pages/ListingDetail.jsx", "utf8").replace(/\r\n/g, "\n");

const regex = /(<img\s*\n\s*src=\{addWatermark\(images\[currentImage\],\s*listing\?\.seller_username\)\}\s*\n\s*alt=\{listing\.title\}\s*\n\s*className="w-full h-full object-cover cursor-zoom-in allow-interaction"\s*\n\s*)onClick=\{\(\) => setLightbox\(true\)\}(\s*\n\s*\/>)/;

if (!regex.test(content)) {
  console.log("NOT FOUND - showing raw block for inspection:");
  const idx = content.indexOf("cursor-zoom-in");
  console.log(JSON.stringify(content.slice(idx - 200, idx + 200)));
} else {
  content = content.replace(regex, `$1onTouchStart={handleTouchStart}\n              onTouchEnd={handleTouchEnd}\n              onClick={() => { if (wasSwipe.current) { wasSwipe.current = false; return; } setLightbox(true); }}$2`);
  fs.writeFileSync("src/pages/ListingDetail.jsx", content, { encoding: "utf8" });
  console.log("DONE - main carousel swipe added");
}
