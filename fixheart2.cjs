const fs = require("fs");
const path = "src/components/listing/ListingCard.jsx";
let content = fs.readFileSync(path, "utf8").replace(/\r\n/g, "\n");
content = content.replace(
  'style={{ background: "rgba(255,255,255,0.9)" }}',
  'style={{ background: "rgba(255,255,255,0.08)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.15)" }}'
);
fs.writeFileSync(path, content, { encoding: "utf8" });
console.log("DONE");
