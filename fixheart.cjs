const fs = require("fs");
const path = "src/components/listing/ListingCard.jsx";
let content = fs.readFileSync(path, "utf8").replace(/\r\n/g, "\n");
content = content.replace(
  `style={{ background: isSaved ? "rgba(16,185,129,0.9)" : "rgba(255,255,255,0.9)" }}`,
  `style={{ background: "rgba(255,255,255,0.9)" }}`
);
content = content.replace(
  `{isSaved\n              ? <Check className="w-3.5 h-3.5 text-white" />\n              : <Heart className="w-3.5 h-3.5 text-gray-600" />`,
  `{isSaved\n              ? <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />\n              : <Heart className="w-3.5 h-3.5 text-gray-400" />`
);
fs.writeFileSync(path, content, { encoding: "utf8" });
console.log("DONE");
