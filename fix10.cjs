const fs = require("fs");
const path = "src/pages/Home.jsx";
let content = fs.readFileSync(path, "utf8").replace(/\r\n/g, "\n");
content = content.replace(
  'style={{ background: "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.4) 55%, rgba(0,0,0,0.1) 100%)" }}',
  'style={{ background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 40%, transparent 100%)" }}'
);
content = content.replace(
  `<div className="absolute top-3 left-3 flex items-center gap-2">
            <span className="bg-orange-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full tracking-wide">PRO</span>
            <span className="text-white/50 text-[9px] tracking-widest uppercase font-medium">You may like this</span>
          </div>`,
  `<div className="absolute top-3 left-3">
            <span className="text-white/60 text-[9px] tracking-widest uppercase font-medium">You may like this</span>
          </div>`
);
fs.writeFileSync(path, content, { encoding: "utf8" });
console.log("DONE");
