const fs = require("fs");
const path = "src/pages/Admin.jsx";
let c = fs.readFileSync(path, "utf8");
c = c.replace(/\r\n/g, "\n");
c = c.replace(
  `      </div>
    </div>
    {spectating && <SpectateChatsModal profile={spectating} onClose={() => setSpectating(null)} />}
  );
}`,
  `      </div>
    </div>
    {spectating && <SpectateChatsModal profile={spectating} onClose={() => setSpectating(null)} />}
  );
}
`
);

// Actually just fix by wrapping in fragment
c = c.replace(
  `      </div>
    </div>
    {spectating && <SpectateChatsModal profile={spectating} onClose={() => setSpectating(null)} />}
  );
}`,
  `      </div>
    </div>
    {spectating && <SpectateChatsModal profile={spectating} onClose={() => setSpectating(null)} />}
    </>
  );
}`
);

// Fix the opening return to use fragment
c = c.replace(
  `  return (
    <div>
      <div className="glass sticky top-0 z-40 px-4 py-3 border-b border-white/5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..." className="bg-card border-white/10 pl-9" />
        </div>`,
  `  return (
    <>
    <div>
      <div className="glass sticky top-0 z-40 px-4 py-3 border-b border-white/5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..." className="bg-card border-white/10 pl-9" />
        </div>`
);

fs.writeFileSync(path, c, "utf8");
console.log("Done");
