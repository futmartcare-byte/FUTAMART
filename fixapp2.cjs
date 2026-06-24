const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');
const lines = c.split('\n');
lines[50] = "        <style>{";
lines[56] = "        }</style>";
fs.writeFileSync('src/App.jsx', lines.join('\n'), 'utf8');
console.log('line 51:', lines[50]);
console.log('line 57:', lines[56]);
