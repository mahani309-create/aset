const fs = require('fs');
const path = require('path');

const files = [
  'Assets.tsx',
  'Borrowing.tsx',
  'Depreciation.tsx',
  'Disposal.tsx',
  'Maintenance.tsx',
  'Mutation.tsx',
  'Procurement.tsx',
  'Rooms.tsx',
  'Stocktake.tsx'
];

const dir = path.join(process.cwd(), 'src', 'pages');

files.forEach(file => {
  const filePath = path.join(dir, file);
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf-8');

  // ensure Inbox is imported
  if (!content.includes('Inbox')) {
    content = content.replace(/import {([^}]*?)} from "lucide-react";/, (match, p1) => {
      let coreIcons = p1;
      if (!p1.includes('Inbox')) coreIcons += ', Inbox';
      return `import {${coreIcons}} from "lucide-react";`;
    });
  }

  const emptyStateRegex = /<td colSpan={(\d+)} className="px-6 py-10 text-center text-slate-500">([\s\S]*?)<\/td>/g;
  
  content = content.replace(emptyStateRegex, (match, colSpan, innerContent) => {
    return `<td colSpan={${colSpan}} className="px-6 py-16 text-center text-slate-500">
                        <div className="flex flex-col items-center justify-center">
                          <Inbox className="h-12 w-12 text-slate-300 mb-3" />
                          <p className="text-slate-600 font-medium text-base">Tidak Ada Data</p>
                          <p className="text-slate-400 text-sm mt-1">Belum ada catatan yang ditemukan atau kriteria pencarian tidak cocok.</p>
                        </div>
                      </td>`;
  });
  
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`Updated ${file}`);
});
