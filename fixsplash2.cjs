const fs = require("fs");
const path = "src/App.jsx";
let content = fs.readFileSync(path, "utf8").replace(/\r\n/g, "\n");

const oldBlock = `      <div className="fixed inset-0 flex items-center justify-center bg-background overflow-hidden">
        <div className="flex flex-col items-center gap-4">`;

const newBlock = `      <div className="fixed inset-0 flex items-center justify-center bg-background overflow-hidden">
        <div className="absolute bottom-8 left-0 right-0 flex justify-center">
          <span className="text-[11px] text-white/40 tracking-wide">Powered by Ck's Team</span>
        </div>
        <div className="flex flex-col items-center gap-4">`;

if (!content.includes(oldBlock)) {
  console.log("NOT FOUND step1");
} else {
  content = content.replace(oldBlock, newBlock);
}

content = content.replace(
  `          <div className="mt-2 px-3 py-1 rounded-full" style={{ background: "rgba(255,255,255,0.06)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <span className="text-[10px] text-white/50 tracking-wide">Powered by Ck's Team</span>
          </div>`,
  ``
);

fs.writeFileSync(path, content, { encoding: "utf8" });
console.log("DONE");
