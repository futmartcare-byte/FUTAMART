const fs = require("fs");

// Fix 1 - Naira symbol in Admin.jsx
let admin = fs.readFileSync("src/pages/Admin.jsx", "utf8").replace(/\r\n/g, "\n");
admin = admin.replace('â‚¦{listing.price?.toLocaleString()}', '₦{listing.price?.toLocaleString()}');
fs.writeFileSync("src/pages/Admin.jsx", admin, { encoding: "utf8" });
console.log("Admin Naira DONE");

// Fix 2 - Bump SW cache version to force PWA update
let sw = fs.readFileSync("public/sw.js", "utf8").replace(/\r\n/g, "\n");
sw = sw.replace("futamart-v38", "futamart-v39");
fs.writeFileSync("public/sw.js", sw, { encoding: "utf8" });
console.log("SW bump DONE");
