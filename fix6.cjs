const fs = require("fs");
const path = "src/pages/Admin.jsx";
let content = fs.readFileSync(path, "utf8").replace(/\r\n/g, "\n");
content = content.replace(
  'className="glass w-max min-w-fullgrid grid-cols-8 h-10 rounded-none border-b border-white/5"',
  'className="glass w-max min-w-full flex h-10 rounded-none border-b border-white/5"'
);
fs.writeFileSync(path, content, { encoding: "utf8" });
console.log("DONE");
