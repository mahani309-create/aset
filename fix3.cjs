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

for (const ObjectPath of Object.keys(vars)) {
  let content = fs.readFileSync(ObjectPath, 'utf8');
  
  // The empty state row has colSpan modified (e.g. colSpan={7}), and we injected an extra TD before it.
  content = content.replace(/<tr>\\n\s*<td className="px-6 py-4"><input type="checkbox"[^>]*><\/td>\\n\s*<td colSpan=\{([0-9]+)\}/g, '<tr>\\n                    <td colSpan={$1}');
  
  // also handle standard newlines if parsed as literal newline
  content = content.replace(/<tr>\s*<td className="px-6 py-4"><input type="checkbox"[^>]*><\/td>\s*<td colSpan=\{([0-9]+)\}/g, '<tr>\\n                    <td colSpan={$1}');

  fs.writeFileSync(ObjectPath, content);
}
