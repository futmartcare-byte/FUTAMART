const fs = require("fs");
const path = "src/pages/Home.jsx";
let content = fs.readFileSync(path, "utf8").replace(/\r\n/g, "\n");

const oldSlide = `  const slide = slides[current];

  return (
    <div className="px-4 pt-3">
      <Link to={\`/listing/\${slide.id}\`}>
        <div className="rounded-2xl overflow-hidden relative" style={{maxHeight: 180 }}>
          {slide.images?.[0] ? (
            <img
              src={slide.images[0]}
              alt={slide.title}
              className="w-full object-cover rounded-2xl transition-all duration-500"
              style={{ maxHeight: 180, minHeight: 140 }}
            />
          ) : (
            <div className="w-full bg-card rounded-2xl flex items-center justify-center" style={{ height: 160 }}>
              <span className="text-muted-foreground text-xs">No image</span>
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 px-3 py-2 rounded-b-2xl"
            style={{ background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)" }}>
            <p className="text-white text-sm font-semibold truncate">{slide.title}</p>
            <div className="flex items-center justify-between">
              <p className="text-orange-300 text-xs font-bold">&#8358;{slide.price?.toLocaleString()}</p>
              <span className="text-[10px] text-white/70">@{slide.seller_username}</span>
            </div>
          </div>
          <div className="absolute top-2 left-2 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            PRO
          </div>
          <div className="absolute top-2 right-2 flex gap-1">
            {slides.map((_, i) => (
              <div key={i} className={\`rounded-full transition-all \${i=== current ? "w-4 h-1.5 bg-orange-400" : "w-1.5 h-1.5 bg-white/40"}\`}/>
            ))}
          </div>
        </div>
      </Link>
    </div>
  );
}`;

const newSlide = `  const slide = slides[current];

  return (
    <div className="px-4 pt-3">
      <style>{\`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
      \`}</style>
      <p className="text-[10px] text-white/40 mb-1 px-1 tracking-widest uppercase">You may like this</p>
      <Link to={\`/listing/\${slide.id}\`}>
        <div key={animKey} className="rounded-2xl overflow-hidden relative" style={{ height: 180, animation: "fadeSlideIn 0.5s ease forwards" }}>
          {slide.images?.[0] ? (
            <img
              src={slide.images[0]}
              alt={slide.title}
              className="w-full h-full object-cover rounded-2xl"
            />
          ) : (
            <div className="w-full h-full bg-card rounded-2xl flex items-center justify-center">
              <span className="text-muted-foreground text-xs">No image</span>
            </div>
          )}
          <div className="absolute inset-0 rounded-2xl" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)" }} />
          <div className="absolute bottom-0 left-0 right-0 px-3 py-2.5">
            <p className="text-white text-sm font-semibold truncate mb-1">{slide.title}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center text-white text-[9px] font-bold shrink-0">
                  {slide.seller_username?.[0]?.toUpperCase()}
                </div>
                <span className="text-white/80 text-[11px] font-medium">{slide.seller_username}</span>
                <span className="text-white/40 text-[10px]">·</span>
                <span className="text-orange-300 text-[11px] font-bold">₦{slide.price?.toLocaleString()}</span>
              </div>
              <span className="text-[9px] text-white/35 italic">Sponsored</span>
            </div>
          </div>
          <div className="absolute top-2 left-2 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
            PRO
          </div>
          <div className="absolute top-2 right-2 flex gap-1">
            {slides.map((_, i) => (
              <div key={i} className={\`rounded-full transition-all duration-300 \${i === current ? "w-4 h-1.5 bg-orange-400" : "w-1.5 h-1.5 bg-white/30"}\`}/>
            ))}
          </div>
        </div>
      </Link>
    </div>
  );
}`;

if (!content.includes(oldSlide)) {
  console.log("NOT FOUND - paste output to Claude");
} else {
  content = content.replace(oldSlide, newSlide);
  fs.writeFileSync(path, content, { encoding: "utf8" });
  console.log("DONE - file saved");
}
