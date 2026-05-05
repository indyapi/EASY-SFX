const fs = require('fs');
const path = require('path');

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

const src = path.join(__dirname, '../resources/data/library');
const dest = path.join(__dirname, '../out/renderer/library');

if (fs.existsSync(src)) {
    copyRecursiveSync(src, dest);
    console.log('✅ SFX assets copied to out/renderer/library');
} else {
    console.warn('⚠️ SFX source directory not found:', src);
}
