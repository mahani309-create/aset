const fs = require('fs');
const path = require('path');

function replaceColors(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceColors(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;
      
      // Update text colors for higher contrast
      content = content.replace(/text-slate-600/g, 'text-slate-700');
      content = content.replace(/text-slate-500/g, 'text-slate-600');
      content = content.replace(/text-slate-400/g, 'text-slate-500');
      content = content.replace(/text-primary-500/g, 'text-primary-600');
      content = content.replace(/border-slate-100/g, 'border-slate-200');
      content = content.replace(/border-slate-200/g, 'border-slate-300');
      
      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content);
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

replaceColors(path.join(process.cwd(), 'src'));
