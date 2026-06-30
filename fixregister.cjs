const fs = require("fs");
const path = "src/pages/Register.jsx";
let content = fs.readFileSync(path, "utf8").replace(/\r\n/g, "\n");

const oldCode = `  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      await signUp(email, password);
      setShowConfirmEmail(true);
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };`;

const newCode = `  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("Account creation is unavailable for now. Try Google login instead.");
  };`;

if (!content.includes(oldCode)) {
  console.log("NOT FOUND");
} else {
  content = content.replace(oldCode, newCode);
  fs.writeFileSync(path, content, { encoding: "utf8" });
  console.log("DONE");
}
