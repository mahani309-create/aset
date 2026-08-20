const fs = require('fs');

// Borrowing
let a = fs.readFileSync('src/pages/Borrowing.tsx', 'utf8');
a = a.replace('{borrow.status !== "Dikembalikan" && <Button size="sm" variant="outline" className="mr-2" onClick={() => handleKembalikan(borrow.id)}>Kembalikan</Button>}', '');
a = a.replace('{ label: "Cetak BAST", icon: Printer, onClick: () => { setSelectedBorrowId(borrow.id); setIsBastModalOpen(true); } }, ', '');
fs.writeFileSync('src/pages/Borrowing.tsx', a);

// Depreciation
let b = fs.readFileSync('src/pages/Depreciation.tsx', 'utf8');
b = b.replace(/setDepreciations/g, 'setDepreciatedAssets');
fs.writeFileSync('src/pages/Depreciation.tsx', b);

// Disposal
let c = fs.readFileSync('src/pages/Disposal.tsx', 'utf8');
c = c.replace(/setSelectedItemId\(item\.id\)/g, 'setSelectedDisposalId(item.id)');
fs.writeFileSync('src/pages/Disposal.tsx', c);

// Mutation
let d = fs.readFileSync('src/pages/Mutation.tsx', 'utf8');
d = d.replace(/setSelectedItemId\(item\.id\)/g, 'setSelectedMutationId(item.id)');
d = d.replace('{ label: "Cetak BAST", icon: Printer, onClick: () => { setSelectedMutationId(item.id); setIsBastModalOpen(true); } },', '');
fs.writeFileSync('src/pages/Mutation.tsx', d);

// Rooms
let e = fs.readFileSync('src/pages/Rooms.tsx', 'utf8');
if (!e.includes('RowActions')) {
  e = e.replace('import { Button } from "../components/Button";', 'import { Button } from "../components/Button";\\nimport { RowActions } from "../components/RowActions";');
}
if (!e.includes('Trash2')) {
  e = e.replace('import { Plus, Search', 'import { Plus, Search, Trash2, Edit');
}
fs.writeFileSync('src/pages/Rooms.tsx', e);

// Stocktake
let f = fs.readFileSync('src/pages/Stocktake.tsx', 'utf8');
f = f.replace('{ label: "Cetak Bukti Opname", icon: Printer, onClick: () => { setSelectedStocktakeId(item.id); setIsBastModalOpen(true); } },', '');
fs.writeFileSync('src/pages/Stocktake.tsx', f);
