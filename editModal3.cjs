const fs = require("fs");
const path = "src/pages/Admin.jsx";
let c = fs.readFileSync(path, "utf8");
c = c.replace(/\r\n/g, "\n");
c = c.replace(
  `        </div>
      </div>
      {spectating && <SpectateChatsModal profile={spectating} onClose={() => setSpectating(null)} />}
    );
  }`,
  `        </div>
      </div>
      {spectating && <SpectateChatsModal profile={spectating} onClose={() => setSpectating(null)} />}
    </div>
  );
}`
);
fs.writeFileSync(path, c, "utf8");
console.log("Done");
