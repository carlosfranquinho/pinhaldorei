const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    if (!fs.existsSync(dir)) return results;
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.html')) results.push(file);
        }
    });
    return results;
}

const folders = [
    'src/lugares-recantos',
    'src/historias-personagens',
    'src/fauna-flora-do-pinhal-do-rei'
];

let files = [];
const projectRoot = __dirname;

folders.forEach(f => {
    files = files.concat(walk(path.join(projectRoot, f)));
});

let deletedCount = 0;
let modifiedCount = 0;

files.forEach(file => {
    if (!fs.existsSync(file)) return;
    
    let content = fs.readFileSync(file, 'utf8');
    
    // Check if it's an attachment page by looking for HTML doctype instead of frontmatter
    if (content.trim().startsWith('<!DOCTYPE html>')) {
        const dirname = path.dirname(file);
        // Ensure we are deleting a safe subdirectory, not a main folder
        const relDir = path.relative(projectRoot, dirname);
        if (!folders.includes(relDir) && relDir !== 'src') {
             console.log('Deleting attachment directory:', dirname);
             fs.rmSync(dirname, { recursive: true, force: true });
             deletedCount++;
        }
        return;
    }
    
    // Remove <a> wrapping an <img>
    const regex = /<a[^>]*href="[^"]*"[^>]*>\s*(<img[^>]+>)\s*<\/a>/gi;
    const newContent = content.replace(regex, '$1');
    
    if (content !== newContent) {
        fs.writeFileSync(file, newContent);
        modifiedCount++;
    }
});

console.log(`Cleanup complete. Deleted ${deletedCount} attachment directories. Modified ${modifiedCount} article files.`);
