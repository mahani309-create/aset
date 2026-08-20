const fs = require('fs');

const vars = {
  'src/pages/Assets.tsx': 'asset',
  'src/pages/Borrowing.tsx': 'borrow',
  'src/pages/Consumables.tsx': 'item',
  'src/pages/Depreciation.tsx': 'item',
  'src/pages/Disposal.tsx': 'item',
  'src/pages/Maintenance.tsx': 'record',
  'src/pages/Mutation.tsx': 'item',
  'src/pages/Procurement.tsx': 'item',
  'src/pages/Rooms.tsx': 'room',
  'src/pages/Stocktake.tsx': 'item'
};

for (const [f, v] of Object.entries(vars)) {
  let content = fs.readFileSync(f, 'utf8');
    
  let nameField = v === 'borrow' ? 'borrow.namaPeminjam' : (v === 'room' ? 'room.nama' : (v+'.nama'));
  if (f.includes('Borrowing') || f.includes('Maintenance') || f.includes('Stocktake') || f.includes('Disposal')) {
     nameField = 'undefined';
  }

  content = content.replace(/toggleSelect\(item\.id \|\| record\.id \|\| p\.id \|\| m\.id \|\| d\.id \|\| asset\.id\)/g, "toggleSelect(" + v + ".id)");
  content = content.replace(/selectedIds\.includes\(item\.id \|\| record\.id \|\| p\.id \|\| m\.id \|\| d\.id \|\| asset\.id\)/g, "selectedIds.includes(" + v + ".id)");
  
  content = content.replace(/openDeleteModal\(item\.id \|\| record\.id \|\| p\.id \|\| m\.id \|\| d\.id \|\| asset\.id,\s*item\.nama \|\| record\.id \|\| p\.id \|\| m\.id \|\| d\.id \|\| asset\.nama\)/g, "openDeleteModal(" + v + ".id, " + nameField + ")");

  fs.writeFileSync(f, content);
}
