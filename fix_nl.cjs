const fs = require('fs');

const files = [
  'src/pages/Borrowing.tsx',
  'src/pages/Depreciation.tsx',
  'src/pages/Disposal.tsx',
  'src/pages/Maintenance.tsx',
  'src/pages/Mutation.tsx',
  'src/pages/Procurement.tsx',
  'src/pages/Rooms.tsx',
  'src/pages/Stocktake.tsx'
];

for (const file of files) {
  let c = fs.readFileSync(file, 'utf8');
  c = c.replace(/\\n/g, '\n');
  fs.writeFileSync(file, c);
}
