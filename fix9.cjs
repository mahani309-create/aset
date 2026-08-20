const fs = require('fs');
const files = [
  'src/pages/Borrowing.tsx',
  'src/pages/Depreciation.tsx',
  'src/pages/Disposal.tsx',
  'src/pages/Mutation.tsx',
  'src/pages/Rooms.tsx',
  'src/pages/Stocktake.tsx'
];

for (const f of files) {
  let content = fs.readFileSync(f, 'utf8');
  content = content.replace(/\\n/g, '\n');
  content = content.replace(/<thead className="text-xs text-slate-500 uppercase bg-slate-50\/50 border-b border-slate-100">\s*<tr>\s*<th className="px-6 py-3 font-medium w-12">[\s\S]*?<\/th>\s*<tr>/g, (match) => {
    return match.replace(/\s*<tr>$/, '');
  });
  
  if (f.includes('Borrowing')) {
    content = content.replace(/<td className="px-6 py-4">{borrow\.items && borrow\.items\.map \? borrow\.items\.map\(\(item, idx\) => <div key={idx} className="text-sm"><span className="font-medium text-slate-700">{item\.namaBarang}<\/span> \(/g, '<td className="px-6 py-4">{borrow.items && borrow.items.map ? borrow.items.map((item, idx) => (<div key={idx} className="text-sm"><span className="font-medium text-slate-700">{item.namaBarang}</span> (');
  }

  // Also fix the double <tr> issue in general
  content = content.replace(/<thead className="text-xs text-slate-500 uppercase bg-slate-50\/50 border-b border-slate-100">\s*<tr>\s*<th([^>]+)>([^<]+)<\/th>\s*<tr>/g, '<thead className="text-xs text-slate-500 uppercase bg-slate-50/50 border-b border-slate-100">\n<tr>\n<th$1>$2</th>');
  
  // also handle the specific case we generated
  content = content.replace(/<thead className="text-xs text-slate-500 uppercase bg-slate-50\/50 border-b border-slate-100">\s*<tr>\s*<th([^>]+)><input([^>]+)><\/th>\s*<tr>/g, '<thead className="text-xs text-slate-500 uppercase bg-slate-50/50 border-b border-slate-100">\n<tr>\n<th$1><input$2></th>');

  fs.writeFileSync(f, content);
}
