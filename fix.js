const fs = require('fs');
const fixed = fs.readFileSync('src/components/AIChatBot.jsx', 'utf8')
  .replace(/\n(\s+)(href="mailto:futmartcares@gmail\.com")/g, '\n<a ')
  .replace(/\n(\s+)(href="mailto:futmartcares@gmail\.com\?subject)/g, '\n<a ')
  .replace(/<a (<a )/g, '<a ');
fs.writeFileSync('src/components/AIChatBot.jsx', fixed, 'utf8');
console.log('done, length:', fixed.length);
