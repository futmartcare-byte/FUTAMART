const fs = require("fs");
const path = "src/pages/Home.jsx";
let content = fs.readFileSync(path, "utf8").replace(/\r\n/g, "\n");

// Add pull-to-refresh hook after the imports
const oldExport = `export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();`;

const newExport = `export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Pull-to-refresh
  useEffect(() => {
    let startY = 0;
    let pulling = false;
    const onTouchStart = (e) => {
      if (window.scrollY === 0) {
        startY = e.touches[0].clientY;
        pulling = true;
      }
    };
    const onTouchEnd = (e) => {
      if (pulling) {
        const diff = e.changedTouches[0].clientY - startY;
        if (diff > 80) {
          window.location.reload(true);
        }
      }
      pulling = false;
    };
    window.addEventListener("touchstart", onTouchStart);
    window.addEventListener("touchend", onTouchEnd);
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, []);`;

if (!content.includes(oldExport)) {
  console.log("NOT FOUND");
} else {
  content = content.replace(oldExport, newExport);
  fs.writeFileSync(path, content, { encoding: "utf8" });
  console.log("DONE");
}
