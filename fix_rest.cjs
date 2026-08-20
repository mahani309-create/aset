const fs = require('fs');

const createMapString = (varName, mappedArr, arrCalc, bodyRows, colSpanOverride) => {
  return [
    '              <tbody className="divide-y divide-slate-100">',
    '                {' + mappedArr + '.length > 0 ? (',
    '                  ' + mappedArr + '.map((' + varName + ') => {',
    '                    ' + arrCalc,
    '                    return (',
    '                      ' + bodyRows,
    '                    );',
    '                  })',
    '                ) : (',
    '                  <tr>',
    '                    <td colSpan={' + colSpanOverride + '} className="px-6 py-10 text-center text-slate-500">',
    '                      Tidak ada data yang ditemukan.',
    '                    </td>',
    '                  </tr>',
    '                )}',
    '              </tbody>',
    '            </table>'
  ].join('\n');
};

// Rooms
let roomRows = [
  '                    <tr key={room.id} className="hover:bg-slate-50/50 transition-colors">',
  '                      <td className="px-6 py-4"><input type="checkbox" className="rounded border-slate-300 text-primary-600 focus:ring-primary-500" checked={selectedIds.includes(room.id)} onChange={() => toggleSelect(room.id)} /></td>',
  '                      <td className="px-6 py-4 text-slate-600"><div className="font-medium">{room.kodeRuangan}</div><div className="text-xs text-slate-500">{room.jenis}</div></td>',
  '                      <td className="px-6 py-4 font-medium text-slate-900">{room.nama}</td>',
  '                      <td className="px-6 py-4">{room.penanggungJawab}</td>',
  '                      <td className="px-6 py-4 text-right">{room.kapasitas} orang</td>',
  '                      <td className="px-6 py-4 text-right font-medium">{totalAssets}</td>',
  '                      <td className="px-6 py-4 text-right text-slate-900">Rp {totalValue.toLocaleString("id-ID")}</td>',
  '                      <td className="px-6 py-4 text-right pr-4">',
  '                        <RowActions actions={[',
  '                          { label: "Edit Item", icon: Edit, onClick: () => { setSelectedRoomId(room.id); setIsModalOpen(true); } },',
  '                          { label: "Hapus", icon: Trash2, variant: "destructive", onClick: () => openDeleteModal(room.id, room.nama) }',
  '                        ]} />',
  '                      </td>',
  '                    </tr>'
].join('\n');
let roomCalc = [
  'const roomAssets = assets.filter((a) => a.ruanganId && a.ruanganId.includes(room.id));',
  'const totalAssets = roomAssets.length;',
  'const totalValue = roomAssets.reduce((sum, a) => sum + a.harga, 0);'
].join('\n');

let roomContent = fs.readFileSync('src/pages/Rooms.tsx', 'utf8');
roomContent = roomContent.replace(/<tbody className="divide-y divide-slate-100">[\s\S]*?<\/table>/, createMapString('room', 'filteredRooms', roomCalc, roomRows, 8).replace(/\\\\n/g, '\\n'));
roomContent = roomContent.replace(/<th className="px-6 py-3 font-medium w-12">[\s\S]*?<thead className="text-xs text-slate-500 uppercase bg-slate-50\/50 border-b border-slate-100">/g, '<thead className="text-xs text-slate-500 uppercase bg-slate-50/50 border-b border-slate-100">\\n<tr>\\n<th className="px-6 py-3 font-medium w-12"><input type="checkbox" className="rounded border-slate-300 text-primary-600 focus:ring-primary-500" checked={selectedIds.length === filteredRooms.length && filteredRooms.length > 0} onChange={toggleSelectAll} /></th>');
fs.writeFileSync('src/pages/Rooms.tsx', roomContent);

// Depreciation
let depRows = [
  '                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">',
  '                      <td className="px-6 py-4"><input type="checkbox" className="rounded border-slate-300 text-primary-600 focus:ring-primary-500" checked={selectedIds.includes(item.id)} onChange={() => toggleSelect(item.id)} /></td>',
  '                      <td className="px-6 py-4 font-medium text-slate-900">{item.nama} <span className="text-slate-500 font-normal">({item.kodeAset})</span></td>',
  '                      <td className="px-6 py-4 text-center">{item.tahunPerolehan}</td>',
  '                      <td className="px-6 py-4 text-right">Rp {item.harga.toLocaleString("id-ID")}</td>',
  '                      <td className="px-6 py-4 text-right text-rose-600">Rp {item.akumulasiPenyusutan}</td>',
  '                      <td className="px-6 py-4 text-right font-medium text-primary-700">Rp {item.nilaiBuku}</td>',
  '                    </tr>'
].join('\n');
let depContent = fs.readFileSync('src/pages/Depreciation.tsx', 'utf8');
depContent = depContent.replace(/<tbody className="divide-y divide-slate-100">[\s\S]*?<\/table>/, createMapString('item', 'depreciatedAssets', '', depRows, 6).replace(/\\\\n/g, '\\n'));
depContent = depContent.replace(/<th className="px-6 py-3 font-medium w-12">[\s\S]*?<thead className="text-xs text-slate-500 uppercase bg-slate-50\/50 border-b border-slate-100">/g, '<thead className="text-xs text-slate-500 uppercase bg-slate-50/50 border-b border-slate-100">\\n<tr>\\n<th className="px-6 py-3 font-medium w-12"><input type="checkbox" className="rounded border-slate-300 text-primary-600 focus:ring-primary-500" checked={selectedIds.length === depreciatedAssets.length && depreciatedAssets.length > 0} onChange={toggleSelectAll} /></th>');
fs.writeFileSync('src/pages/Depreciation.tsx', depContent);

// Disposal
let dispRows = [
  '                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">',
  '                      <td className="px-6 py-4"><input type="checkbox" className="rounded border-slate-300 text-primary-600 focus:ring-primary-500" checked={selectedIds.includes(item.id)} onChange={() => toggleSelect(item.id)} /></td>',
  '                      <td className="px-6 py-4 font-medium text-slate-900">{new Date(item.tanggalPengajuan).toLocaleDateString("id-ID")}</td>',
  '                      <td className="px-6 py-4">{asset ? asset.nama : "Unknown Asset"}</td>',
  '                      <td className="px-6 py-4 text-slate-600">{item.metode}</td>',
  '                      <td className="px-6 py-4">',
  '                        <span className="text-slate-600 line-clamp-1" title={item.alasan}>{item.alasan}</span>',
  '                      </td>',
  '                      <td className="px-6 py-4">',
  '                        <Badge variant={item.status === "Selesai" ? "success" : item.status === "Disetujui" ? "success" : item.status === "Ditolak" ? "destructive" : "warning"}>',
  '                          {item.status}',
  '                        </Badge>',
  '                      </td>',
  '                      <td className="px-6 py-4 text-right pr-4">',
  '                        <RowActions actions={[',
  '                          { label: "Update Status", icon: Edit, onClick: () => { setSelectedItemId(item.id); setIsModalOpen(true); } },',
  '                          { label: "Hapus", icon: Trash2, variant: "destructive", onClick: () => openDeleteModal(item.id, asset ? asset.nama : "Data") }',
  '                        ]} />',
  '                      </td>',
  '                    </tr>'
].join('\n');
let dispCalc = 'const asset = assets.find(a => a.id === item.assetId);';
let dispContent = fs.readFileSync('src/pages/Disposal.tsx', 'utf8');
dispContent = dispContent.replace(/<tbody className="divide-y divide-slate-100">[\s\S]*?<\/table>/, createMapString('item', 'filteredDisposals', dispCalc, dispRows, 7).replace(/\\\\n/g, '\\n'));
dispContent = dispContent.replace(/<th className="px-6 py-3 font-medium w-12">[\s\S]*?<thead className="text-xs text-slate-500 uppercase bg-slate-50\/50 border-b border-slate-100">/g, '<thead className="text-xs text-slate-500 uppercase bg-slate-50/50 border-b border-slate-100">\\n<tr>\\n<th className="px-6 py-3 font-medium w-12"><input type="checkbox" className="rounded border-slate-300 text-primary-600 focus:ring-primary-500" checked={selectedIds.length === filteredDisposals.length && filteredDisposals.length > 0} onChange={toggleSelectAll} /></th>');
fs.writeFileSync('src/pages/Disposal.tsx', dispContent);

// Mutation
let mutRows = [
  '                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">',
  '                      <td className="px-6 py-4"><input type="checkbox" className="rounded border-slate-300 text-primary-600 focus:ring-primary-500" checked={selectedIds.includes(item.id)} onChange={() => toggleSelect(item.id)} /></td>',
  '                      <td className="px-6 py-4 font-medium text-slate-900">{new Date(item.tanggalMutasi).toLocaleDateString("id-ID")}</td>',
  '                      <td className="px-6 py-4">{asset ? asset.nama : "Unknown"}</td>',
  '                      <td className="px-6 py-4 text-slate-600">',
  '                        <div className="flex items-center gap-2">',
  '                            <span className="text-slate-500 line-through">{dariRuang ? dariRuang.nama : "-"}</span>',
  '                            <span>&rarr;</span>',
  '                            <span className="font-medium text-primary-600">{keRuang ? keRuang.nama : "-"}</span>',
  '                        </div>',
  '                      </td>',
  '                      <td className="px-6 py-4">',
  '                        <span className="text-slate-600 line-clamp-1" title={item.alasan}>{item.alasan}</span>',
  '                      </td>',
  '                      <td className="px-6 py-4">',
  '                        <Badge variant={item.status === "Selesai" ? "success" : item.status === "Disetujui" ? "success" : item.status === "Ditolak" ? "destructive" : "warning"}>',
  '                          {item.status}',
  '                        </Badge>',
  '                      </td>',
  '                      <td className="px-6 py-4 text-right pr-4">',
  '                        <RowActions actions={[',
  '                          { label: "Update Status", icon: Edit, onClick: () => { setSelectedItemId(item.id); setIsModalOpen(true); } },',
  '                          { label: "Cetak BAST", icon: Printer, onClick: () => { setSelectedItemId(item.id); setIsBastModalOpen(true); } },',
  '                          { label: "Hapus", icon: Trash2, variant: "destructive", onClick: () => openDeleteModal(item.id, asset ? asset.nama : "Data") }',
  '                        ]} />',
  '                      </td>',
  '                    </tr>'
].join('\n');
let mutCalc = [
  'const asset = assets.find(a => a.id === item.assetId);',
  'const dariRuang = rooms.find(r => r.id === item.dariRuanganId);',
  'const keRuang = rooms.find(r => r.id === item.keRuanganId);'
].join('\n');
let mutContent = fs.readFileSync('src/pages/Mutation.tsx', 'utf8');
mutContent = mutContent.replace(/<tbody className="divide-y divide-slate-100">[\s\S]*?<\/table>/, createMapString('item', 'filteredMutations', mutCalc, mutRows, 7).replace(/\\\\n/g, '\\n'));
mutContent = mutContent.replace(/<th className="px-6 py-3 font-medium w-12">[\s\S]*?<thead className="text-xs text-slate-500 uppercase bg-slate-50\/50 border-b border-slate-100">/g, '<thead className="text-xs text-slate-500 uppercase bg-slate-50/50 border-b border-slate-100">\\n<tr>\\n<th className="px-6 py-3 font-medium w-12"><input type="checkbox" className="rounded border-slate-300 text-primary-600 focus:ring-primary-500" checked={selectedIds.length === filteredMutations.length && filteredMutations.length > 0} onChange={toggleSelectAll} /></th>');
fs.writeFileSync('src/pages/Mutation.tsx', mutContent);

// Stocktake
let stockRows = [
  '                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">',
  '                      <td className="px-6 py-4"><input type="checkbox" className="rounded border-slate-300 text-primary-600 focus:ring-primary-500" checked={selectedIds.includes(item.id)} onChange={() => toggleSelect(item.id)} /></td>',
  '                      <td className="px-6 py-4 font-medium text-slate-900">{new Date(item.tanggalMulai).toLocaleDateString("id-ID")}</td>',
  '                      <td className="px-6 py-4">{item.penanggungJawab}</td>',
  '                      <td className="px-6 py-4 text-right font-medium">{item.totalAsetDiperiksa}</td>',
  '                      <td className="px-6 py-4 text-right text-emerald-600 font-medium">{item.asetSesuai}</td>',
  '                      <td className="px-6 py-4 text-right text-rose-600 font-medium">{item.asetSelisih}</td>',
  '                      <td className="px-6 py-4">',
  '                        <Badge variant={item.status === "Selesai" ? "success" : "warning"}>',
  '                          {item.status}',
  '                        </Badge>',
  '                      </td>',
  '                      <td className="px-6 py-4 text-right pr-4">',
  '                        <RowActions actions={[',
  '                          { label: "Update Hasil", icon: Edit, onClick: () => { setSelectedStocktakeId(item.id); setIsModalOpen(true); } },',
  '                          { label: "Cetak Bukti Opname", icon: Printer, onClick: () => { setSelectedStocktakeId(item.id); setIsBastModalOpen(true); } },',
  '                          { label: "Hapus", icon: Trash2, variant: "destructive", onClick: () => openDeleteModal(item.id, undefined) }',
  '                        ]} />',
  '                      </td>',
  '                    </tr>'
].join('\n');
let stockContent = fs.readFileSync('src/pages/Stocktake.tsx', 'utf8');
stockContent = stockContent.replace(/<tbody className="divide-y divide-slate-100">[\s\S]*?<\/table>/, createMapString('item', 'filteredStocktakes', '', stockRows, 8).replace(/\\\\n/g, '\\n'));
stockContent = stockContent.replace(/<th className="px-6 py-3 font-medium w-12">[\s\S]*?<thead className="text-xs text-slate-500 uppercase bg-slate-50\/50 border-b border-slate-100">/g, '<thead className="text-xs text-slate-500 uppercase bg-slate-50/50 border-b border-slate-100">\\n<tr>\\n<th className="px-6 py-3 font-medium w-12"><input type="checkbox" className="rounded border-slate-300 text-primary-600 focus:ring-primary-500" checked={selectedIds.length === filteredStocktakes.length && filteredStocktakes.length > 0} onChange={toggleSelectAll} /></th>');
fs.writeFileSync('src/pages/Stocktake.tsx', stockContent);
