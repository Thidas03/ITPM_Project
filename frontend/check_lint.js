const fs = require('fs');
let out;
try { out = fs.readFileSync('lint.json', 'utf16le'); } catch(e) { out = fs.readFileSync('lint.json', 'utf8'); }
try {
  const data = JSON.parse(out);
  data.forEach(file => {
    if (file.errorCount > 0 || file.warningCount > 0) {
      console.log('File:', file.filePath);
      file.messages.forEach(msg => {
        console.log(`  Line ${msg.line}: ${msg.message}`);
      });
    }
  });
} catch(e) {
  console.log("Parse error:", e);
}
