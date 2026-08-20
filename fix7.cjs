const fs = require('fs');
const files = [
  'src/pages/Borrowing.tsx',
  'src/pages/Consumables.tsx',
  'src/pages/Depreciation.tsx',
  'src/pages/Disposal.tsx',
  'src/pages/Mutation.tsx',
  'src/pages/Procurement.tsx',
  'src/pages/Rooms.tsx',
  'src/pages/Stocktake.tsx'
];

for (const f of files) {
  let content = fs.readFileSync(f, 'utf8');
  
  // replace the empty state's injected checkbox
  content = content.replace(/<td className="px-6 py-4"><input type="checkbox"[^>]*><\/td>\n<td colSpan=\{([0-9]+)\}/g, '<td colSpan={$1}');
  
  if (f.includes('Depreciation')) {
    content = content.replace(/setDepreciatedAssets\(/g, 'setDepreciations(');
  }

  fs.writeFileSync(f, content);
}
