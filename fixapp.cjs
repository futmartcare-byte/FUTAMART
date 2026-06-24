const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');
c = c.replace(/\<style\>\{\\n/g, '<style>{\n');
c = c.replace(/\<\/style\>/g, '</style>');
fs.writeFileSync('src/App.jsx', c, 'utf8');
console.log('done, length:', c.length);
