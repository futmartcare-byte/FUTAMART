const fs = require("fs");
let content = fs.readFileSync("src/pages/Onboarding.jsx", "utf8").replace(/\r\n/g, "\n");

const target = `  const handleSkip = () => {
    createProfile.mutate({
      username: makeUsername(user.email),
      full_name: user.user_metadata?.full_name || user.email?.split("@")[0],
    });
  };`;

if (!content.includes(target)) {
  console.log("NOT FOUND");
} else {
  content = content.replace(target, `  const handleSkip = () => {
    createProfile.mutate({
      username: makeUsername(user.email),
      full_name: user.user_metadata?.full_name || user.email?.split("@")[0],
      phone_number: "",
    });
  };`);
  fs.writeFileSync("src/pages/Onboarding.jsx", content, { encoding: "utf8" });
  console.log("DONE");
}
