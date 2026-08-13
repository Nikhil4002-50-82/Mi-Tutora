const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, replacements) {
    let content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    replacements.forEach(r => {
        // r.line is 1-indexed
        if (lines[r.line - 1]) {
            lines[r.line - 1] = lines[r.line - 1].replace(r.search, r.replace);
        }
    });
    
    fs.writeFileSync(filePath, lines.join('\n'));
    console.log(`Updated ${filePath}`);
}

// Student Page
replaceInFile(path.join(__dirname, '../src/app/dashboard/student/page.tsx'), [
    { line: 613, search: /user,\s*/, replace: '' },
    { line: 749, search: /user,\s*/, replace: '' },
    { line: 969, search: /addDoc,\s*/, replace: '' },
    { line: 1039, search: /getDoc,\s*/, replace: '' },
    { line: 1756, search: /isPending,\s*/, replace: '' },
    { line: 2282, search: /val,\s*/, replace: '' }
]);

// Teacher Page
replaceInFile(path.join(__dirname, '../src/app/dashboard/teacher/page.tsx'), [
    { line: 5, search: /import Head from 'next\/head';/, replace: '' },
    { line: 11, search: /import axios from 'axios';/, replace: '' },
    { line: 13, search: /ShieldCheck,\s*/, replace: '' },
    { line: 13, search: /Clock,\s*/, replace: '' },
    { line: 21, search: /const logo = '\/imports\/logo\.png';/, replace: '' },
    { line: 410, search: /auth,\s*/, replace: '' },
    { line: 528, search: /user,\s*/, replace: '' },
    { line: 626, search: /date,\s*time,\s*/, replace: '' },
    { line: 1450, search: /address,\s*/, replace: '' },
    { line: 1453, search: /numStudents,\s*/, replace: '' },
    { line: 1458, search: /isPending,\s*/, replace: '' },
    { line: 1461, search: /isLocked,\s*/, replace: '' },
    { line: 1896, search: /val,\s*/, replace: '' },
    { line: 1959, search: /phone,\s*/, replace: '' },
    { line: 1960, search: /email,\s*/, replace: '' },
    { line: 3142, search: /val,\s*/, replace: '' }
]);
