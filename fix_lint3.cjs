const fs = require('fs');

let e = fs.readFileSync('src/pages/Rooms.tsx', 'utf8');
if (!e.includes('RowActions')) {
  e = "import { RowActions } from '../components/shared/RowActions';\\n" + e;
}
if (!e.includes('Trash2')) {
  e = "import { Trash2, Edit } from 'lucide-react';\\n" + e;
}
fs.writeFileSync('src/pages/Rooms.tsx', e);
