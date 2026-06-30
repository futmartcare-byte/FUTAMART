const fs = require("fs");
const path = "src/App.jsx";
let content = fs.readFileSync(path, "utf8").replace(/\r\n/g, "\n");

const oldCode = `          <span className="text-sm text-muted-foreground font-display tracking-wide">FUTAMART</span>
          <div className="w-6 h-6 border-2 border-orange-400 border-t-transparent rounded-full animate-spin mt-1" />`;

const newCode = `          <span className="text-sm text-muted-foreground font-display tracking-wide">FUTAMART</span>
          <div className="w-6 h-6 border-2 border-orange-400 border-t-transparent rounded-full animate-spin mt-1" />
          <div className="mt-2 px-3 py-1 rounded-full" style={{ background: "rgba(255,255,255,0.06)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <span className="text-[10px] text-white/50 tracking-wide">Powered by Ck's Team</span>
          </div>`;

if (!content.includes(oldCode)) {
  console.log("NOT FOUND");
} else {
  content = content.replace(oldCode, newCode);
  fs.writeFileSync(path, content, { encoding: "utf8" });
  console.log("DONE");
}
