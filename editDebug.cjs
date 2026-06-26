const fs = require("fs");
const path = "src/pages/Admin.jsx";
let c = fs.readFileSync(path, "utf8");
c = c.replace(/\r\n/g, "\n");
c = c.replace(
  `      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="fixed inset-0 z-50`,
  `      console.log("spectate chats:", data, error);
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="fixed inset-0 z-50`
);
fs.writeFileSync(path, c, "utf8");
console.log("Done");
