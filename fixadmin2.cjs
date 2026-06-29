const fs = require("fs");
const path = "src/pages/Admin.jsx";
let content = fs.readFileSync(path, "utf8").replace(/\r\n/g, "\n");
content = content.replace(
  'className="glass w-max min-w-full grid grid-cols-8 h-10 rounded-none border-b border-white/5"',
  'className="glass flex h-10 rounded-none border-b border-white/5 w-max"'
);
fs.writeFileSync(path, content, { encoding: "utf8" });
console.log("DONE");
