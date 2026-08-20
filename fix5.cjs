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
  // replace literal "\n                        <td ..." things inserted
  content = content.replace(/<tr>\\n\s*<td className="px-6 py-4"><input[^>]+><\/td>\\n\s*<td colSpan/g, '<tr>\n<td colSpan');
  
  // also fix the weird line breaks
  content = content.replace(/\\n\s*<td className="px-6 py-4">/g, '\n<td className="px-6 py-4">');
  content = content.replace(/<\/td>\\n\s*<td/g, '</td>\n<td');

  fs.writeFileSync(f, content);
}
