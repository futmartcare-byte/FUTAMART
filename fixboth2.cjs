const fs = require("fs");

// Fix 1 - ShareMenu corrupted Naira
let share = fs.readFileSync("src/components/ShareMenu.jsx", "utf8").replace(/\r\n/g, "\n");
share = share.replace(
  'const text = encodeURIComponent(`Check out: ${listing?.title} - â‚¦${listing?.price?.toLocaleString()}`);',
  'const text = encodeURIComponent("Check out: " + listing?.title + " - \u20a6" + listing?.price?.toLocaleString());'
);
fs.writeFileSync("src/components/ShareMenu.jsx", share, { encoding: "utf8" });
console.log("ShareMenu DONE");

// Fix 2 - index.html corrupted em dash in description
let html = fs.readFileSync("index.html", "utf8").replace(/\r\n/g, "\n");
html = html.replace(/Buy and sell easily within FUTA â€[^"']*/g, "Buy and sell easily within FUTA - your campus marketplace.");
fs.writeFileSync("index.html", html, { encoding: "utf8" });
console.log("index.html DONE");
