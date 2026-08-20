const fs = require('fs');

// Depreciation
let b = fs.readFileSync('src/pages/Depreciation.tsx', 'utf8');
b = b.replace(/const \{ assets \} = useData\(\);/, 'const { assets, setAssets } = useData();');
b = b.replace(/setDepreciatedAssets/g, 'setAssets');
fs.writeFileSync('src/pages/Depreciation.tsx', b);

// Rooms
let e = fs.readFileSync('src/pages/Rooms.tsx', 'utf8');
if (!e.includes('RowActions')) {
  e = e.replace(/import \{ Card, CardContent \} from "\.\.\/components\/ui\/Card";/g, 'import { Card, CardContent } from "../components/ui/Card";\\nimport { RowActions } from "../components/shared/RowActions";');
}
if (!e.includes('Trash2')) {
  e = e.replace(/import \{ Plus, Search \} from "lucide-react";/g, 'import { Plus, Search, Trash2, Edit } from "lucide-react";');
}
fs.writeFileSync('src/pages/Rooms.tsx', e);
