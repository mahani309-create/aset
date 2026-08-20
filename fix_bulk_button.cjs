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

const block = [
  '        {selectedIds.length > 0 && (',
  '          <div className="bg-primary-50 px-6 py-3 border-b border-primary-100 flex items-center justify-between">',
  '            <span className="text-sm font-medium text-primary-700">',
  '              {selectedIds.length} baris terpilih',
  '            </span>',
  '            <Button variant="destructive" size="sm" onClick={openBulkDeleteModal} className="h-8">',
  '              <Trash2 className="w-4 h-4 mr-2" />',
  '              Hapus Terpilih',
  '            </Button>',
  '          </div>',
  '        )}',
  '        <div className="overflow-x-auto">'
].join('\\n');

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes('baris terpilih')) {
    content = content.replace('<div className="overflow-x-auto">', block);
    // make sure Trash2 is imported
    if (content.includes('lucide-react') && !content.includes('Trash2')) {
      content = content.replace('import { ', 'import { Trash2, ');
    }
  }
  fs.writeFileSync(file, content);
}
