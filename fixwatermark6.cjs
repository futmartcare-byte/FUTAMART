const fs = require("fs");

function fixWatermarkFn(content) {
  return content.replace(
    /function addWatermark\(url, username\) \{[\s\S]*?\n\}/,
    `function addWatermark(url, username) {
  if (!url || !url.includes("cloudinary.com")) return url;
  const text = encodeURIComponent((username || "FUTAMART") + " x FUTAMART");
  return url.replace("/upload/", "/upload/c_limit,w_800/l_text:Arial_28_bold:" + text + ",co_white,o_55,g_south_east,x_14,y_14/q_auto,f_auto/");
}`
  );
}

let card = fs.readFileSync("src/components/listing/ListingCard.jsx", "utf8").replace(/\r\n/g, "\n");
card = fixWatermarkFn(card);
fs.writeFileSync("src/components/listing/ListingCard.jsx", card, { encoding: "utf8" });
console.log("ListingCard fixed");

let detail = fs.readFileSync("src/pages/ListingDetail.jsx", "utf8").replace(/\r\n/g, "\n");
detail = fixWatermarkFn(detail);
fs.writeFileSync("src/pages/ListingDetail.jsx", detail, { encoding: "utf8" });
console.log("ListingDetail fixed");
