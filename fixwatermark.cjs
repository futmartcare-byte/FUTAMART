const fs = require("fs");

const wmFn = `function addWatermark(url, username) {\n  if (!url || !url.includes("cloudinary.com")) return url;\n  const text = encodeURIComponent((username || "FUTAMART") + " x FUTAMART");\n  return url.replace("/upload/", "/upload/l_text:Arial_18_bold:" + text + ",o_25,co_white,g_south_east,x_10,y_10/");\n}\n\n`;

// Fix ListingCard.jsx
let card = fs.readFileSync("src/components/listing/ListingCard.jsx", "utf8").replace(/\r\n/g, "\n");
if (!card.includes("function addWatermark")) {
  card = card.replace("export default function", wmFn + "export default function");
}
card = card.replace(
  'src={listing.images?.[0]?.includes("cloudinary.com") ? listing.images[0].replace("/upload/", "/upload/w_400,c_limit,q_80,f_auto/") : listing.images?.[0]}',
  'src={addWatermark(listing.images?.[0]?.includes("cloudinary.com") ? listing.images[0].replace("/upload/", "/upload/w_400,c_limit,q_80,f_auto/") : listing.images?.[0], listing.seller_username)}'
);
fs.writeFileSync("src/components/listing/ListingCard.jsx", card, { encoding: "utf8" });
console.log("ListingCard DONE");

// Fix ListingDetail.jsx
let detail = fs.readFileSync("src/pages/ListingDetail.jsx", "utf8").replace(/\r\n/g, "\n");
if (!detail.includes("function addWatermark")) {
  detail = detail.replace("export default function", wmFn + "export default function");
}
detail = detail.replace(/src=\{images\[currentImage\]\}/g, 'src={addWatermark(images[currentImage], listing?.seller_username)}');
fs.writeFileSync("src/pages/ListingDetail.jsx", detail, { encoding: "utf8" });
console.log("ListingDetail DONE");
