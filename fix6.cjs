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
  
  content = content.replace(/<tr>\s*\n<td className="px-6 py-4"><input type="checkbox"[^>]*><\/td>\s*\n<td colSpan=\{([0-9]+)\}/g, '<tr>\n<td colSpan={$1}');
  
  fs.writeFileSync(f, content);
}
