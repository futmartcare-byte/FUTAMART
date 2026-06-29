const fs = require("fs");
const path = "src/pages/Home.jsx";
let content = fs.readFileSync(path, "utf8").replace(/\r\n/g, "\n");
content = content.replace(
  'className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0"',
  'className="w-9 h-9 rounded-full bg-orange-500 flex items-center justify-center text-white text-[11px] font-bold shrink-0"'
);
fs.writeFileSync(path, content, { encoding: "utf8" });
console.log("DONE");
