const fs = require('fs');
const path = require('path');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf-8');
    let changed = false;

    // Add 'use client'
    if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
        if (!content.includes('"use client"') && !content.includes("'use client'")) {
            // Check if it has 'use client' already
            content = '"use client";\n\n' + content;
            changed = true;
        }
    }

    // Replace react-router Link with next/link and useNavigate with useRouter
    if (content.includes("from 'react-router'")) {
        content = content.replace(/import\s+\{([^}]*)\}\s+from\s+['"]react-router['"];/g, (match, imports) => {
            let nextImports = [];
            let nextNavImports = [];
            if (imports.includes('Link')) nextImports.push('Link');
            if (imports.includes('useNavigate')) {
                nextNavImports.push('useRouter');
                content = content.replace(/useNavigate/g, 'useRouter');
            }
            if (imports.includes('useSearchParams')) {
                nextNavImports.push('useSearchParams');
            }
            
            let result = '';
            if (nextImports.length > 0) result += `import { ${nextImports.join(', ')} } from 'next/link';\n`;
            if (nextNavImports.length > 0) result += `import { ${nextNavImports.join(', ')} } from 'next/navigation';\n`;
            return result.trim();
        });
        changed = true;
    }

    // Replace <Link to="..."> with <Link href="...">
    if (content.includes('<Link')) {
        content = content.replace(/<Link([^>]+)to=/g, '<Link$1href=');
        changed = true;
    }

    // Replace image imports: import logo from '../../imports/logo.png' -> const logo = '/imports/logo.png'
    const imgRegex = /import\s+(\w+)\s+from\s+['"]([^'"]+\/imports\/([^'"]+\.(?:png|jpg|jpeg|svg|webp)))['"];?/g;
    if (imgRegex.test(content)) {
        content = content.replace(imgRegex, "const $1 = '/imports/$3';");
        changed = true;
    }

    // Remove react-helmet-async (Next.js handles metadata, but since these are client components now, we can just render normal titles or ignore helmet)
    // Actually, Next.js supports <title> in client components using normal React, but let's just strip Helmet tags to avoid errors if they don't want to install it.
    if (content.includes('react-helmet-async')) {
        content = content.replace(/import\s+\{\s*Helmet\s*\}\s+from\s+['"]react-helmet-async['"];?/g, '');
        content = content.replace(/<Helmet>[\s\S]*?<\/Helmet>/g, '');
        changed = true;
    }

    // Fix component imports since pages moved
    // Old: import { Hero } from '../components/Hero'; (from src/app/pages/Home.tsx)
    // New: in src/app/page.tsx it should be `import { Hero } from '@/components/Hero';`
    // Let's just blindly replace `../components` with `@/components` and `../../components` with `@/components`
    if (content.includes('../components')) {
        content = content.replace(/\.\.\/components/g, '@/components');
        changed = true;
    }
    if (content.includes('../../components')) {
        content = content.replace(/\.\.\/\.\.\/components/g, '@/components');
        changed = true;
    }
    
    // Also, some components imported ui things like `import { Button } from "./ui/button"` which is fine if they are in components.
    
    if (changed) {
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log('Updated ' + filePath);
    }
}

function traverse(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            // don't traverse ui folder if we don't want to prepend use client to all shadcn UI, but it's fine.
            traverse(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            processFile(fullPath);
        }
    }
}

traverse(path.join(__dirname, 'src', 'components'));
traverse(path.join(__dirname, 'src', 'app'));

console.log("Migration script completed.");
