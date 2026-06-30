const fs = require("fs");
const path = "src/components/ShareMenu.jsx";
let content = fs.readFileSync(path, "utf8").replace(/\r\n/g, "\n");
content = content.replace(
  'const text = encodeURIComponent(`Check out: ${listing?.title} - $${listing?.price}`);',
  'const text = encodeURIComponent(`Check out: ${listing?.title} - \u20a6${listing?.price?.toLocaleString()}`);'
);
fs.writeFileSync(path, content, { encoding: "utf8" });
console.log("DONE");
