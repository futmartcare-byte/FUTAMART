const fs = require("fs");
const path = "src/pages/Home.jsx";
let content = fs.readFileSync(path, "utf8").replace(/\r\n/g, "\n");

const regex = /const slide = slides\[current\];[\s\S]*?return \([\s\S]*?\);\n\}/;

const newCode = `const slide = slides[current];

  return (
    <div className="px-4 pt-3">
      <style>{\`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
      \`}</style>
      <Link to={\`/listing/\${slide.id}\`}>
        <div key={animKey} className="rounded-2xl overflow-hidden relative" style={{ height: 200, animation: "fadeSlideIn 0.5s ease forwards" }}>
          {slide.images?.[0] ? (
            <img src={slide.images[0]} alt={slide.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-card flex items-center justify-center">
              <span className="text-muted-foreground text-xs">No image</span>
            </div>
          )}
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.4) 55%, rgba(0,0,0,0.1) 100%)" }} />
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <span className="bg-orange-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full tracking-wide">PRO</span>
            <span className="text-white/50 text-[9px] tracking-widest uppercase font-medium">You may like this</span>
          </div>
          <div className="absolute top-3 right-3 flex gap-1">
            {slides.map((_, i) => (
              <div key={i} className={\`rounded-full transition-all duration-300 \${i === current ? "w-4 h-1.5 bg-orange-400" : "w-1.5 h-1.5 bg-white/30"}\`} />
            ))}
          </div>
          <div className="absolute bottom-0 left-0 right-0 px-3 pb-4">
            <p className="text-white text-base font-bold leading-snug mb-2.5">{slide.title}</p>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-sm font-bold shrink-0 border-2 border-orange-300/40">
                {slide.seller_username?.[0]?.toUpperCase()}
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-white/90 text-[11px] font-semibold leading-none">{slide.seller_username}</span>
                <span className="text-orange-300 text-[12px] font-bold leading-none">₦{slide.price?.toLocaleString()}</span>
              </div>
              <span className="ml-auto text-[9px] text-white/30 italic self-end">Sponsored</span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}`;

if (!regex.test(content)) {
  console.log("NOT FOUND");
} else {
  content = content.replace(regex, newCode);
  fs.writeFileSync(path, content, { encoding: "utf8" });
  console.log("DONE");
}
