const fs = require("fs");
const path = "src/pages/Admin.jsx";
let c = fs.readFileSync(path, "utf8");
c = c.replace(/\r\n/g, "\n");
c = c.replace(
  `        ))}
      </div>
    </div>
  );
}

// ---- Listings Tab ----`,
  `        ))}
      </div>
      {spectating && <SpectateChatsModal profile={spectating} onClose={() => setSpectating(null)} />}
    </div>
  );
}

// ---- Listings Tab ----`
);
fs.writeFileSync(path, c, "utf8");
console.log("Done - lines around modal:");
const lines = c.split("\n").slice(382, 392);
lines.forEach((l, i) => console.log(383 + i, l));
