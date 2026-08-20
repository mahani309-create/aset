const fs = require('fs');
const path = require('path');

const directoryPath = path.join(process.cwd(), 'src', 'pages');

const files = [
  'Assets.tsx',
  'Borrowing.tsx',
  'Consumables.tsx',
  'Disposal.tsx',
  'Maintenance.tsx',
  'Mutation.tsx',
  'Procurement.tsx',
  'Rooms.tsx',
  'Stocktake.tsx'
];

files.forEach(file => {
  const filePath = path.join(directoryPath, file);
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${file}`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf-8');

  // Add ChevronDown and Filter to imports if not there
  if (!content.includes('ChevronDown')) {
    content = content.replace(/import {([^}]*?)} from "lucide-react";/, (match, p1) => {
      let coreIcons = p1;
      if (!p1.includes('ChevronDown')) coreIcons += ', ChevronDown';
      if (!p1.includes('Filter')) coreIcons += ', Filter';
       return `import {${coreIcons}} from "lucide-react";`;
    });
  }

  // Update filter block logic
  const filterDivRegex = /(<div className="flex flex-wrap gap-2 w-full lg:w-auto lg:justify-end">\s*)((?:<div className="hidden xl:flex items-center mr-1">\s*<Filter className="h-4 w-4 text-slate-400" \/>\s*<\/div>\s*)?)/;
  
  content = content.replace(filterDivRegex, (match, divOpen, existingFilter) => {
    return `${divOpen}<div className="hidden xl:flex items-center mr-1">
                <Filter className="h-4 w-4 text-slate-400" />
              </div>
              `;
  });
  
  const selectRegex = /<select([\s\S]*?)className="([^"]*?)appearance-none bg-white px-4 py-2 pr-8([^"]*?)"([\s\S]*?)<\/select>/g;
  
  content = content.replace(selectRegex, (match, attributesBefore, classBefore, classAfter, contentInside) => {
    return `<div className="relative w-full sm:w-auto">
              <select${attributesBefore}className="${classBefore}appearance-none bg-white px-4 py-2 pr-10${classAfter} hover:bg-slate-50 transition-colors"${contentInside}</select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>`;
  });

  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`Updated ${file}`);
});
