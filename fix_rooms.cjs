//
const fs = require('fs');

const makeTable = (varName, mappedArr, arrCalc, cols, bodyCols, actions) => [
'<table className="w-full text-sm text-left whitespace-nowrap">',
'  <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 border-b border-slate-100">',
'    <tr>',
'      <th className="px-6 py-3 font-medium w-12"><input type="checkbox" className="rounded border-slate-300 text-primary-600 focus:ring-primary-500" checked={selectedIds.length === ' + mappedArr + '.length && ' + mappedArr + '.length > 0} onChange={toggleSelectAll} /></th>',
...cols.map(c => '      <th className="' + c.class + '">' + c.name + '</th>'),
'    </tr>',
'  </thead>',
'  <tbody className="divide-y divide-slate-100">',
'    {' + mappedArr + '.length > 0 ? (',
'      ' + mappedArr + '.map((' + varName + ') => {',
...arrCalc,
'        return (',
'        <tr key={' + varName + '.id} className="hover:bg-slate-50/50 transition-colors">',
'          <td className="px-6 py-4"><input type="checkbox" className="rounded border-slate-300 text-primary-600 focus:ring-primary-500" checked={selectedIds.includes(' + varName + '.id)} onChange={() => toggleSelect(' + varName + '.id)} /></td>',
...bodyCols,
'          <td className="px-6 py-4 text-right pr-4">',
...actions,
'          </td>',
'        </tr>',
'        )',
'      })',
'    ) : (',
'      <tr>',
'        <td colSpan={' + (cols.length + 1) + '} className="px-6 py-10 text-center text-slate-500">',
'          Tidak ada data yang ditemukan.',
'        </td>',
'      </tr>',
'    )}',
'  </tbody>',
'</table>'
].join('\\n');

let rTable = makeTable('room', 'filteredRooms', [
  'const roomAssets = assets.filter((a) => a.ruanganId && a.ruanganId.includes(room.id));',
  'const totalAssets = roomAssets.length;',
  'const totalValue = roomAssets.reduce((sum, a) => sum + a.harga, 0);'
], [
  {name: 'Kode/Jenis', class: 'px-6 py-3 font-medium'},
  {name: 'Nama Ruangan', class: 'px-6 py-3 font-medium'},
  {name: 'Penanggung Jawab', class: 'px-6 py-3 font-medium'},
  {name: 'Kapasitas', class: 'px-6 py-3 font-medium text-right'},
  {name: 'Jumlah Aset', class: 'px-6 py-3 font-medium text-right'},
  {name: 'Estimasi Nilai', class: 'px-6 py-3 font-medium text-right'},
  {name: 'Aksi', class: 'px-6 py-3 font-medium text-right'},
], [
  '<td className="px-6 py-4 text-slate-600"><div className="font-medium">{room.kodeRuangan}</div><div className="text-xs text-slate-500">{room.jenis}</div></td>',
  '<td className="px-6 py-4 font-medium text-slate-900">{room.nama}</td>',
  '<td className="px-6 py-4">{room.penanggungJawab}</td>',
  '<td className="px-6 py-4 text-right">{room.kapasitas} orang</td>',
  '<td className="px-6 py-4 text-right font-medium">{totalAssets}</td>',
  '<td className="px-6 py-4 text-right text-slate-900">Rp {totalValue.toLocaleString("id-ID")}</td>'
], [
  '<RowActions actions={[{ label: "Edit Item", icon: Edit, onClick: () => { setSelectedRoomId(room.id); setIsModalOpen(true); } }, { label: "Hapus", icon: Trash2, variant: "destructive", onClick: () => openDeleteModal(room.id, room.nama) }]} />'
]);

let content = fs.readFileSync('src/pages/Rooms.tsx', 'utf8');
content = content.replace(/<table className="w-full text-sm text-left whitespace-nowrap">[\s\S]*?<\/table>/, rTable.replace(/\\n/g, '\n'));
fs.writeFileSync('src/pages/Rooms.tsx', content);
