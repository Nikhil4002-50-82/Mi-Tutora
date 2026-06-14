const fs = require('fs');
const path = require('path');

function traverse(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            traverse(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf-8');
            if (content.includes('ease: [')) {
                content = content.replace(/ease:\s*\[([\d\.\s,]+)\](?! as any)/g, 'ease: [$1] as any');
                fs.writeFileSync(fullPath, content);
                console.log('Fixed ease in', fullPath);
            }
        }
    }
}
traverse(path.join(__dirname, 'src'));
