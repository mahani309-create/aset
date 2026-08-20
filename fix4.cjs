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
  content = content.replace(/<td className="px-6 py-4"><input type="checkbox"[^>]+><\/td>\s*<td colSpan/g, '<td colSpan');
  
  if (f.includes('Depreciation')) {
    // Also fix setDepreciations
    content = content.replace(/setDepreciations/g, 'setDepreciatedAssets');
    content = content.replace(/filteredAssets\.length/g, 'depreciatedAssets.length');
    content = content.replace(/filteredAssets\.map/g, 'depreciatedAssets.map');
  }

  fs.writeFileSync(f, content);
}
