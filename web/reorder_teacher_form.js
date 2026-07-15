const fs = require('fs');

let content = fs.readFileSync('c:\\\\Users\\\\Dell\\\\Desktop\\\\mushi\\\\web\\\\src\\\\components\\\\TeacherForm.tsx', 'utf8');
content = content.replace(/\r\n/g, '\n');

// Find Mode Block
const modeBlockRegex = /\{\/\* MODE \*\/\}[\s\S]*?(?:<\/div>\s*<\/div>\s*<\/div>\s*\}|<\/div>\s*<\/div>\s*\)\}\s*<\/div>)/;
const modeMatch = content.match(modeBlockRegex);

if (!modeMatch) {
    console.error("Mode block not found");
    process.exit(1);
}

let modeBlockStr = modeMatch[0];

// The match might include too much or too little, let's refine the regex.
// Mode block starts with {/* MODE */} and ends after the outer </div>
// It contains a ternary operator.
const refinedModeBlockRegex = /\{\/\* MODE \*\/\}[\s\S]*?\{\/\* FEES \*\/\}/;
let match = content.match(refinedModeBlockRegex);
if (!match) {
    console.error("Could not find Mode block to Fees block");
    process.exit(1);
}
let modeBlock = match[0].replace(/\{\/\* FEES \*\/\}/, '').trim();

// Find Address block
const addressBlockRegex = /\{formData\.mode !== 'Online' && \([\s\S]*?<\/>\s*\)\s*\)\}/;
let addressMatch = content.match(/\{formData\.mode !== 'Online' && \([\s\S]*?<\/div>\s*<\/div>\s*\)\}/);
if (!addressMatch) {
    console.error("Address block not found");
    process.exit(1);
}
let addressBlock = addressMatch[0];


// Remove modeBlock from its current position
content = content.replace(modeBlock, '');

// Insert modeBlock before addressBlock
content = content.replace(addressBlock, modeBlock + '\n\n          ' + addressBlock);

fs.writeFileSync('c:\\\\Users\\\\Dell\\\\Desktop\\\\mushi\\\\web\\\\src\\\\components\\\\TeacherForm.tsx', content);
console.log('TeacherForm reordered successfully.');
