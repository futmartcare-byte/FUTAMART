const fs = require("fs");
let edit = fs.readFileSync("src/pages/EditListing.jsx", "utf8").replace(/\r\n/g, "\n");

edit = edit.replace(
  'const username = edit_listing_username || "FUTAMART";',
  'const username = profile?.username || "FUTAMART";'
);

fs.writeFileSync("src/pages/EditListing.jsx", edit, { encoding: "utf8" });
console.log("DONE");
