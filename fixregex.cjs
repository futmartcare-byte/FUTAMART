const fs = require("fs");

let create = fs.readFileSync("src/pages/CreateListing.jsx", "utf8").replace(/\r\n/g, "\n");
create = create.replace("value.replace(/[^d]/g,", "value.replace(/[^\\d]/g,");
fs.writeFileSync("src/pages/CreateListing.jsx", create, { encoding: "utf8" });
console.log("CreateListing regex fixed");

let edit = fs.readFileSync("src/pages/EditListing.jsx", "utf8").replace(/\r\n/g, "\n");
edit = edit.replace("value.replace(/[^d]/g,", "value.replace(/[^\\d]/g,");
fs.writeFileSync("src/pages/EditListing.jsx", edit, { encoding: "utf8" });
console.log("EditListing regex fixed");
