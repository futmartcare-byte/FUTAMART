const fs = require("fs");
const path = "src/pages/Home.jsx";
let content = fs.readFileSync(path, "utf8").replace(/\r\n/g, "\n");

function applyFix(content, oldLines, newLines, label) {
  const oldStr = oldLines.join("\n");
  const newStr = newLines.join("\n");
  if (!content.includes(oldStr)) {
    console.log("NOT FOUND: " + label);
    return content;
  }
  console.log("FOUND: " + label);
  return content.replace(oldStr, newStr);
}

// STEP 2 - timer logic
content = applyFix(content, [
'  useEffect(() => {',
'    if (slides.length === 0 || done) return;',
'    timerRef.current = setInterval(() => {',
'      setCurrent(prev => {',
'        if (prev >= slides.length - 1) {',
'          setDone(true);',
'          clearInterval(timerRef.current);',
'          return prev;',
'        }',
'        return prev + 1;',
'      });',
'    }, 5000);',
'    return () => clearInterval(timerRef.current);',
'  }, [slides, done]);'
], [
'  useEffect(() => {',
'    if (slides.length === 0 || done) return;',
'    timerRef.current = setInterval(() => {',
'      setCurrent(prev => {',
'        if (prev >= slides.length - 1) {',
'          clearInterval(timerRef.current);',
'          setTimeout(() => setShowBanner(true), 500);',
'          setDone(true);',
'          return prev;',
'        }',
'        setAnimKey(k => k + 1);',
'        return prev + 1;',
'      });',
'    }, 5000);',
'    return () => clearInterval(timerRef.current);',
'  }, [slides, done]);'
], "Step2-timer");

// STEP 3 - banner/done render
content = applyFix(content, [
'  if (done || slides.length === 0) {',
'    return (',
'      <div className="px-4 pt-3">',
'        <div className="rounded-2xl overflow-hidden">',
'          <img',
'            src="https://media.base44.com/images/public/6a2370f9e6d0e6ce0d081a52/4f8c8752a_THEFEDERALUNIVERSITYOFTECHNOLOGYAKURE1.png"',
'            alt="Futarians New Marketplace"',
'            className="w-full object-cover rounded-sm"',
'            style={{ maxHeight: 180 }}',
'          />',
'        </div>',
'      </div>',
'    );',
'  }'
], [
'  if (slides.length === 0 || showBanner) {',
'    return (',
'      <div className="px-4 pt-3" style={{animation: "fadeSlideIn 0.6s ease forwards"}}>',
'        <div className="rounded-2xl overflow-hidden">',
'          <img',
'            src="https://media.base44.com/images/public/6a2370f9e6d0e6ce0d081a52/4f8c8752a_THEFEDERALUNIVERSITYOFTECHNOLOGYAKURE1.png"',
'            alt="Futarians New Marketplace"',
'            className="w-full object-cover rounded-sm"',
'            style={{ maxHeight: 180 }}',
'          />',
'        </div>',
'      </div>',
'    );',
'  }'
], "Step3-banner");

// STEP 4 - slide UI with "You may like this" + Sponsored label + avatar
content = applyFix(content, [
'  const slide = slides[current];',
'',
'  return (',
'    <div className="px-4 pt-3">',
'      <Link to={`/listing/${slide.id}`}>',
'        <div className="rounded-2xl overflow-hidden relative" style={{maxHeight: 180 }}>',
'          {slide.images?.[0] ? (',
'            <img',
'              src={slide.images[0]}',
'              alt={slide.title}',
'              className="w-full object-cover rounded-2xl transition-all duration-500"',
'              style={{ maxHeight: 180, minHeight: 140 }}',
'            />',
'          ) : (',
'            <div className="w-full bg-card rounded-2xl flex items-center justify-center" style={{ height: 160 }}>',
'              <span className="text-muted-foreground text-xs">No image</span>',
'            </div>',
'          )}',
'          <div className="absolute bottom-0 left-0 right-0 px-3 py-2 rounded-b-2xl"',
'            style={{ background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)" }}>',
'            <p className="text-white text-sm font-semibold truncate">{slide.title}</p>',
'            <div className="flex items-center justify-between">',
'              <p className="text-orange-300 text-xs font-bold">&#8358;{slide.price?.toLocaleString()}</p>',
'              <span className="text-[10px] text-white/70">@{slide.seller_username}</span>',
'            </div>',
'          </div>',
'          <div className="absolute top-2 left-2 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">',
'            PRO',
'          </div>',
'          <div className="absolute top-2 right-2 flex gap-1">',
'            {slides.map((_, i) => (',
'              <div key={i} className={`rounded-full transition-all ${i=== current ? "w-4 h-1.5 bg-orange-400" : "w-1.5 h-1.5 bg-white/40"}`}/>',
'            ))}',
'          </div>',
'        </div>',
'      </Link>',
'    </div>',
'  );',
'}'
], [
'  const slide = slides[current];',
'',
'  return (',
'    <div className="px-4 pt-3">',
'      <style>{`',
'        @keyframes fadeSlideIn {',
'          from { opacity: 0; transform: translateX(40px); }',
'          to { opacity: 1; transform: translateX(0); }',
'        }',
'      `}</style>',
'      <p className="text-[10px] text-white/50 mb-1 px-1 tracking-wide uppercase">You may like this</p>',
'      <Link to={`/listing/${slide.id}`}>',
'        <div key={animKey} className="rounded-2xl overflow-hidden relative" style={{maxHeight: 180, animation: "fadeSlideIn 0.5s ease forwards"}}>',
'          {slide.images?.[0] ? (',
'            <img',
'              src={slide.images[0]}',
'              alt={slide.title}',
'              className="w-full object-cover rounded-2xl"',
'              style={{ maxHeight: 180, minHeight: 140 }}',
'            />',
'          ) : (',
'            <div className="w-full bg-card rounded-2xl flex items-center justify-center" style={{ height: 160 }}>',
'              <span className="text-muted-foreground text-xs">No image</span>',
'            </div>',
'          )}',
'          <div className="absolute bottom-0 left-0 right-0 px-3 py-2 rounded-b-2xl"',
'            style={{ background: "linear-gradient(to top, rgba(0,0,0,0.85), transparent)" }}>',
'            <p className="text-white text-sm font-semibold truncate">{slide.title}</p>',
'            <div className="flex items-center justify-between mt-0.5">',
'              <div className="flex items-center gap-1.5">',
'                <div className="w-4 h-4 rounded-full bg-orange-500 flex items-center justify-center text-white text-[8px] font-bold overflow-hidden">',
'                  {slide.seller_username?.[0]?.toUpperCase()}',
'                </div>',
'                <p className="text-white/80 text-[10px]">@{slide.seller_username}</p>',
'                <p className="text-orange-300 text-xs font-bold">&#183; &#8358;{slide.price?.toLocaleString()}</p>',
'              </div>',
'              <span className="text-[9px] text-white/40 italic">Sponsored by FutaMart</span>',
'            </div>',
'          </div>',
'          <div className="absolute top-2 left-2 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">',
'            PRO',
'          </div>',
'          <div className="absolute top-2 right-2 flex gap-1">',
'            {slides.map((_, i) => (',
'              <div key={i} className={`rounded-full transition-all duration-300 ${i === current ? "w-4 h-1.5 bg-orange-400" : "w-1.5 h-1.5 bg-white/40"}`}/>',
'            ))}',
'          </div>',
'        </div>',
'      </Link>',
'    </div>',
'  );',
'}'
], "Step4-slideUI");

fs.writeFileSync(path, content, { encoding: "utf8" });
console.log("All steps applied. File saved.");
