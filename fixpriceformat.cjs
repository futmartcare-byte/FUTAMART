const fs = require("fs");

function formatPriceFn() {
  return `function formatPrice(value) {
  const digits = value.replace(/[^\d]/g, "");
  if (!digits) return "";
  return Number(digits).toLocaleString("en-US");
}

`;
}

// --- CreateListing.jsx ---
let create = fs.readFileSync("src/pages/CreateListing.jsx", "utf8").replace(/\r\n/g, "\n");

if (!create.includes("function formatPrice")) {
  create = create.replace("export default function", formatPriceFn() + "export default function");
}

create = create.replace(
  `<Input type="number" min="0" step="1" value={form.price}
            onChange={e => setForm({ ...form, price: e.target.value })}
            className="glass border-white/10" placeholder="0" />`,
  `<Input type="text" inputMode="numeric" value={formatPrice(form.price)}
            onChange={e => setForm({ ...form, price: e.target.value.replace(/[^\\d]/g, "") })}
            className="glass border-white/10" placeholder="0" />`.replace(/\\\\d/g, "\\d")
);

fs.writeFileSync("src/pages/CreateListing.jsx", create, { encoding: "utf8" });
console.log("CreateListing price formatting DONE");

// --- EditListing.jsx ---
let edit = fs.readFileSync("src/pages/EditListing.jsx", "utf8").replace(/\r\n/g, "\n");

if (!edit.includes("function formatPrice")) {
  edit = edit.replace("export default function", formatPriceFn() + "export default function");
}

edit = edit.replace(
  `<Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="glass border-white/10" />`,
  `<Input type="text" inputMode="numeric" value={formatPrice(form.price)} onChange={(e) => setForm({ ...form, price: e.target.value.replace(/[^\\d]/g, "") })} className="glass border-white/10" />`.replace(/\\\\d/g, "\\d")
);

fs.writeFileSync("src/pages/EditListing.jsx", edit, { encoding: "utf8" });
console.log("EditListing price formatting DONE");
