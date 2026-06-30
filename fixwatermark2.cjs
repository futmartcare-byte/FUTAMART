const fs = require("fs");

let edit = fs.readFileSync("src/pages/EditListing.jsx", "utf8").replace(/\r\n/g, "\n");

// 1. Make sure useProfile is imported
if (!edit.includes('useProfile')) {
  edit = edit.replace(
    'import { useAuth } from "@/lib/AuthContext";',
    'import { useAuth } from "@/lib/AuthContext";\nimport { useProfile } from "@/lib/useProfile";'
  );
}

// 2. Make sure profile is pulled in alongside user
if (!edit.includes('useProfile()')) {
  edit = edit.replace(
    'const { user } = useAuth();',
    'const { user } = useAuth();\n  const { data: profile } = useProfile();'
  );
}

// 3. Burn watermark using the real profile.username (with safe fallback)
edit = edit.replace(
  'const urls = await Promise.all(\n        files.map((file) => uploadToCloudinary(file, "futmart/listings"))\n      );',
  'const rawUrls = await Promise.all(\n        files.map((file) => uploadToCloudinary(file, "futmart/listings"))\n      );\n      const wmUsername = profile?.username || "FUTAMART";\n      const urls = rawUrls.map(url => url && url.includes("cloudinary.com") ? url.replace("/upload/", "/upload/l_text:Arial_18_bold:" + encodeURIComponent(wmUsername + " x FUTAMART") + ",o_25,co_white,g_south_east,x_10,y_10/") : url);'
);

fs.writeFileSync("src/pages/EditListing.jsx", edit, { encoding: "utf8" });
console.log("EditListing DONE (with real username)");
