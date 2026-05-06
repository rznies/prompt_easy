const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Compiling TypeScript...');
try {
  execSync('npx tsc', { stdio: 'inherit' });
} catch (error) {
  console.error('TypeScript compilation failed');
  process.exit(1);
}

console.log('Copying static assets...');

const copyFile = (src, dest) => {
  const destDir = path.dirname(dest);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  fs.copyFileSync(src, dest);
  console.log(`Copied ${src} to ${dest}`);
};

const assets = [
  { src: 'src/manifest.json', dest: 'dist/manifest.json' },
  { src: 'src/popup/popup.html', dest: 'dist/popup/popup.html' }
];

assets.forEach(asset => {
  if (fs.existsSync(asset.src)) {
    copyFile(asset.src, asset.dest);
  } else {
    console.error(`Asset not found: ${asset.src}`);
  }
});

console.log('Build complete! Output is in the dist/ directory.');
