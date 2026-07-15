const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk(srcDir);
files.forEach((file) => {
  const content = fs.readFileSync(file, 'utf8');
  let newContent = content;
  
  // Replace Engine imports
  newContent = newContent.replace(/@\/lib\/([a-zA-Z]+)Engine/g, '@/lib/$1');
  newContent = newContent.replace(/\.\/([a-zA-Z]+)Engine/g, './$1');
  
  if (newContent !== content) {
    fs.writeFileSync(file, newContent);
    console.log(`Updated ${file}`);
  }
});
