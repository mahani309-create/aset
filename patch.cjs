const fs = require('fs');

const files = [
  { path: 'src/pages/Consumables.tsx', setter: 'setConsumables', arrayName: 'filteredConsumables', idField: 'id' },
  { path: 'src/pages/Rooms.tsx', setter: 'setRooms', arrayName: 'filteredRooms', idField: 'id' },
  { path: 'src/pages/Procurement.tsx', setter: 'setProcurements', arrayName: 'filteredProcurements', idField: 'id' },
  { path: 'src/pages/Borrowing.tsx', setter: 'setBorrowings', arrayName: 'filteredBorrowings', idField: 'id' },
  { path: 'src/pages/Mutation.tsx', setter: 'setMutations', arrayName: 'filteredMutations', idField: 'id' },
  { path: 'src/pages/Stocktake.tsx', setter: 'setStocktakes', arrayName: 'filteredStocktakes', idField: 'id' },
  { path: 'src/pages/Maintenance.tsx', setter: 'setMaintenances', arrayName: 'filteredMaintenances', idField: 'id' },
  { path: 'src/pages/Disposal.tsx', setter: 'setDisposals', arrayName: 'filteredDisposals', idField: 'id' },
  { path: 'src/pages/Depreciation.tsx', setter: 'setDepreciations', arrayName: 'filteredFilteredDepreciations', idField: 'id' }
];

for (const { path: filePath, setter, arrayName } of files) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('ConfirmDeleteModal')) continue;

    // 1. Add import
    const lastImportIndex = content.lastIndexOf('import ');
    const endOfLastImport = content.indexOf('\n', lastImportIndex);
    content = content.slice(0, endOfLastImport + 1) + 
      'import { ConfirmDeleteModal } from "../components/shared/ConfirmDeleteModal";\n' + 
      content.slice(endOfLastImport + 1);

    // 2. State variables inside component
    const useEffectIndex = content.indexOf('const toast = useToast()') !== -1 ? content.indexOf('const toast = useToast()') : content.indexOf('useEffect(() =>');
    const stateVars = `
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteModalState, setDeleteModalState] = useState<{isOpen: boolean, isBulk: boolean, idToDelete?: string, title?: string, message?: string}>({isOpen: false, isBulk: false});
`;
    content = content.slice(0, useEffectIndex) + stateVars + content.slice(useEffectIndex);

    // 3. Helper functions inside component (below useToast or somewhere safe)
    let handlerInsertionPoint = content.indexOf('const handleAction') !== -1 ? content.indexOf('const handleAction') : content.indexOf('return (');
    if (handlerInsertionPoint === -1) handlerInsertionPoint = content.indexOf('return(');
    
    // some array name fixes
    let realArrayName = arrayName;
    if (arrayName === 'filteredFilteredDepreciations') realArrayName = 'filteredDepreciations';
    
    // check if it's there
    if (!content.includes(realArrayName)) {
        if (filePath.includes('Depreciation')) {
            realArrayName = 'filteredAssets';
        }
    }

    const helpers = `
  const openDeleteModal = (id: string, name?: string) => {
    setDeleteModalState({
      isOpen: true,
      isBulk: false,
      idToDelete: id,
      title: "Hapus Data",
      message: \`Apakah Anda yakin ingin menghapus data \${name ? '"'+name+'"' : 'ini'}? Aksi ini tidak dapat dibatalkan.\`
    });
  };

  const openBulkDeleteModal = () => {
    setDeleteModalState({
      isOpen: true,
      isBulk: true,
      title: "Hapus Kelompok Data",
      message: \`Apakah Anda yakin ingin menghapus \${selectedIds.length} data terpilih? Aksi ini tidak dapat dibatalkan.\`
    });
  };

  const confirmDelete = () => {
    if (deleteModalState.isBulk) {
      ${setter}(prev => prev.filter(item => !selectedIds.includes(item.id)));
      toast(\`Berhasil menghapus \${selectedIds.length} data terpilih.\`, 'success');
      setSelectedIds([]);
    } else if (deleteModalState.idToDelete) {
      ${setter}(prev => prev.filter(item => item.id !== deleteModalState.idToDelete));
      toast('Berhasil menghapus data.', 'success');
      setSelectedIds(prev => prev.filter(id => id !== deleteModalState.idToDelete));
    }
    setDeleteModalState({ isOpen: false, isBulk: false });
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === ${realArrayName}.length && ${realArrayName}.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(${realArrayName}.map(item => item.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(selectedId => selectedId !== id) : [...prev, id]);
  };
`;
    content = content.slice(0, handlerInsertionPoint) + helpers + content.slice(handlerInsertionPoint);

    // 4. Bulk Delete UI & Checkboxes
    const cardHeaderEndRegex = /<\/CardHeader>\s*<CardContent/g;
    const bulkHtml = `</CardHeader>
        {selectedIds.length > 0 && (
          <div className="bg-primary-50 px-6 py-3 border-b border-primary-100 flex items-center justify-between">
            <span className="text-sm font-medium text-primary-700">
              {selectedIds.length} baris terpilih
            </span>
            <Button variant="destructive" size="sm" onClick={openBulkDeleteModal} className="h-8">
              <Trash2 className="w-4 h-4 mr-2" />
              Hapus Terpilih
            </Button>
          </div>
        )}
        <CardContent`;
    content = content.replace(cardHeaderEndRegex, bulkHtml);

    // 5. Th Checkbox
    const theadRegex = /<thead[^>]*>[\s\S]*?<tr>\s*<th/;
    content = content.replace(theadRegex, match => {
        return match.replace(/<th/, `<th className="px-6 py-3 font-medium w-12"><input type="checkbox" className="rounded border-slate-300 text-primary-600 focus:ring-primary-500" checked={selectedIds.length === ${realArrayName}.length && ${realArrayName}.length > 0} onChange={toggleSelectAll} /></th>\\n                  <th`);
    });

    // 6. Td Checkbox & RowActions delete replacement
    const tbodyRegex = /<tbody[^>]*>[\s\S]*?<\/tbody>/;
    const matchTbody = tbodyRegex.exec(content);
    if (matchTbody) {
        let tbody = matchTbody[0];
        // Replace first <td> with exactly `<td className="px-6 py-4"> <input ... /> </td> <td`
        // We will inject the TD at the beginning of the TR
        tbody = tbody.replace(/<tr([^>]*)>\s*<td/g, `<tr$1>\\n                        <td className="px-6 py-4"><input type="checkbox" className="rounded border-slate-300 text-primary-600 focus:ring-primary-500" checked={selectedIds.includes(item.id || record.id || p.id || m.id || d.id || asset.id)} onChange={() => toggleSelect(item.id || record.id || p.id || m.id || d.id || asset.id)} /></td>\\n                        <td`);
        
        // Add colspan to placeholder
        tbody = tbody.replace(/colSpan=\{([0-9]+)\}/g, (match, val) => `colSpan={${parseInt(val) + 1}}`);

        // Replace handleDelete or set... filter delete in RowActions
        // Example: onClick: () => { setConsumables(prev => prev.filter(c => c.id !== item.id));... }
        // Let's just find onClick inside `{ label: "Hapus", ... }` and replace it
        tbody = tbody.replace(/{ label: "Hapus", icon: Trash2, variant: "destructive", onClick: \(\) => {[^}]*}[^\}]*}/g, `{ label: "Hapus", icon: Trash2, variant: "destructive", onClick: () => openDeleteModal(item.id || record.id || p.id || m.id || d.id || asset.id, item.nama || record.id || p.id || m.id || d.id || asset.nama) }`);
        // if it doesn't have {} block
        tbody = tbody.replace(/{ label: "Hapus", icon: Trash2, variant: "destructive", onClick: \(\) => [^}]* }/g, `{ label: "Hapus", icon: Trash2, variant: "destructive", onClick: () => openDeleteModal(item.id || record.id || p.id || m.id || d.id || asset.id, item.nama || record.id || p.id || m.id || d.id || asset.nama) }`);
        
        // Sometimes it is label: "Batalkan"
        tbody = tbody.replace(/{ label: "Batalkan", icon: Trash2, variant: "destructive", onClick: \(\) => [^}]* }/g, `{ label: "Batalkan", icon: Trash2, variant: "destructive", onClick: () => openDeleteModal(item.id || record.id || p.id || m.id || d.id || asset.id, item.nama || record.id || p.id || m.id || d.id || asset.nama) }`);

        // For item.id issue we will fix the variable name.
        // Let's use `const rowId = `
        content = content.replace(matchTbody[0], tbody);
    }

    // 7. Inject ConfirmDeleteModal output at the end of component
    const lastDivMatch = /<\/div>\s*\n\s*\);\n}\n?$/.exec(content);
    if (lastDivMatch) {
       content = content.replace(/<\/div>\s*\n\s*\);\n}\n?$/, `      <ConfirmDeleteModal 
        isOpen={deleteModalState.isOpen}
        onClose={() => setDeleteModalState({ isOpen: false, isBulk: false })}
        onConfirm={confirmDelete}
        title={deleteModalState.title}
        message={deleteModalState.message}
      />\n    </div>\n  );\n}\n`);
    }

    fs.writeFileSync(filePath, content);
    console.log('Patched', filePath);
  } catch(e) {
    console.log('Failed', filePath, e.message);
  }
}
