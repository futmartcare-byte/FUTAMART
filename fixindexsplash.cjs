const fs = require("fs");
const path = "index.html";
let content = fs.readFileSync(path, "utf8").replace(/\r\n/g, "\n");

const oldBody = `  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>`;

const newBody = `  <body>
    <div id="root">
      <div style="position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:#0B1220;">
        <div style="width:24px;height:24px;border:2px solid #fb923c;border-top-color:transparent;border-radius:50%;animation:spin 0.8s linear infinite;"></div>
      </div>
      <div style="position:fixed;bottom:28px;left:0;right:0;display:flex;justify-content:center;">
        <span style="font-size:11px;letter-spacing:0.05em;color:rgba(255,255,255,0.5);backdrop-filter:blur(6px);padding:4px 12px;">Powered by Ck's Team</span>
      </div>
      <style>@keyframes spin{to{transform:rotate(360deg);}}</style>
    </div>
    <script type="module" src="/src/main.jsx"></script>
  </body>`;

if (!content.includes(oldBody)) {
  console.log("NOT FOUND");
} else {
  content = content.replace(oldBody, newBody);
  fs.writeFileSync(path, content, { encoding: "utf8" });
  console.log("DONE");
}
