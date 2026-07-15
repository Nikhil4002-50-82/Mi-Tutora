const fs = require('fs');

let content = fs.readFileSync('c:\\\\Users\\\\Dell\\\\Desktop\\\\mushi\\\\web\\\\src\\\\components\\\\TeacherForm.tsx', 'utf8');
let lines = content.split(/\r?\n/);

const modeStart = 853;
const modeEnd = 910;

// Remove mode block lines
const modeBlockLines = lines.splice(modeStart, modeEnd - modeStart + 1);

const addressStart = 514;
// Insert mode block before address block
lines.splice(addressStart, 0, ...modeBlockLines, '');

fs.writeFileSync('c:\\\\Users\\\\Dell\\\\Desktop\\\\mushi\\\\web\\\\src\\\\components\\\\TeacherForm.tsx', lines.join('\n'));
console.log('Mode block moved successfully using array splice.');
