const fs = require('fs');
for (const f of ['src/pages/Consumables.tsx', 'src/pages/Procurement.tsx', 'src/pages/Rooms.tsx']) {
    let content = fs.readFileSync(f, 'utf8');
    content = content.replace(/asset\.nama\) \} \}/g, 'asset.nama) }');
    content = content.replace(/ \]\}\ \/>/g, ' ]} />');
    fs.writeFileSync(f, content);
}
