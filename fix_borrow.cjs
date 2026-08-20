const fs = require('fs');

const makeTable = (varName, mappedArr, cols, bodyCols, actions) => [
'<table className="w-full text-sm text-left whitespace-nowrap">',
'  <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 border-b border-slate-100">',
'    <tr>',
'      <th className="px-6 py-3 font-medium w-12"><input type="checkbox" className="rounded border-slate-300 text-primary-600 focus:ring-primary-500" checked={selectedIds.length === ' + mappedArr + '.length && ' + mappedArr + '.length > 0} onChange={toggleSelectAll} /></th>',
...cols.map(c => '      <th className="' + c.class + '">' + c.name + '</th>'),
'    </tr>',
'  </thead>',
'  <tbody className="divide-y divide-slate-100">',
'    {' + mappedArr + '.length > 0 ? (',
'      ' + mappedArr + '.map((' + varName + ') => (',
'        <tr key={' + varName + '.id} className="hover:bg-slate-50/50 transition-colors">',
'          <td className="px-6 py-4"><input type="checkbox" className="rounded border-slate-300 text-primary-600 focus:ring-primary-500" checked={selectedIds.includes(' + varName + '.id)} onChange={() => toggleSelect(' + varName + '.id)} /></td>',
...bodyCols,
'          <td className="px-6 py-4 text-right pr-4">',
...actions,
'          </td>',
'        </tr>',
'      ))',
'    ) : (',
'      <tr>',
'        <td colSpan={' + (cols.length + 1) + '} className="px-6 py-10 text-center text-slate-500">',
'          Tidak ada data yang ditemukan.',
'        </td>',
'      </tr>',
'    )}',
'  </tbody>',
'</table>'
].join('\n');

let bTable = makeTable('borrow', 'filteredBorrowings', [
  {name: 'Peminjam', class: 'px-6 py-3 font-medium'},
  {name: 'Barang dipinjam', class: 'px-6 py-3 font-medium'},
  {name: 'Tgl Pinjam', class: 'px-6 py-3 font-medium'},
  {name: 'Harap Kembali', class: 'px-6 py-3 font-medium'},
  {name: 'Status', class: 'px-6 py-3 font-medium'},
  {name: 'Aksi', class: 'px-6 py-3 font-medium text-right'},
], [
  '<td className="px-6 py-4 font-medium text-slate-900">{borrow.namaPeminjam}</td>',
  '<td className="px-6 py-4">{borrow.items && borrow.items.map ? borrow.items.map((item, idx) => <div key={idx} className="text-sm"><span className="font-medium text-slate-700">{item.namaBarang}</span> (x{item.jumlah})</div>) : null}</td>',
  '<td className="px-6 py-4 text-slate-600">{new Date(borrow.tanggalPinjam).toLocaleDateString("id-ID")}</td>',
  '<td className="px-6 py-4 text-slate-600">{new Date(borrow.kembaliDiharapkan).toLocaleDateString("id-ID")}</td>',
  '<td className="px-6 py-4"><Badge variant={borrow.status === "Dipinjam" ? "warning" : borrow.status === "Terlambat" ? "destructive" : "success"}>{borrow.status}</Badge></td>',
], [
  '{borrow.status !== "Dikembalikan" && <Button size="sm" variant="outline" className="mr-2" onClick={() => handleKembalikan(borrow.id)}>Kembalikan</Button>}',
  '<RowActions actions={[{ label: "Cetak BAST", icon: Printer, onClick: () => { setSelectedBorrowId(borrow.id); setIsBastModalOpen(true); } }, { label: "Hapus", icon: Trash2, variant: "destructive", onClick: () => openDeleteModal(borrow.id, borrow.namaPeminjam) }]} />'
]);

let content = fs.readFileSync('src/pages/Borrowing.tsx', 'utf8');
content = content.replace(/<table className="w-full text-sm text-left whitespace-nowrap">[\s\S]*?<\/table>/, bTable);
fs.writeFileSync('src/pages/Borrowing.tsx', content);

