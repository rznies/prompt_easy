const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const esbuild = require('esbuild');

async function build() {
  console.log('Building extension...');

  // 1. Clean dist directory
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
  }
  fs.mkdirSync('dist');

  // 2. Bundle JS entry points using esbuild
  // This resolves node_modules and internal imports into single files
  try {
    await esbuild.build({
      entryPoints: [
        'src/background/service-worker.ts',
        'src/content/content.ts',
        'src/popup/popup.ts'
      ],
      bundle: true,
      outdir: 'dist',
      format: 'iife', // Use IIFE to avoid 'exports' errors in browser
      platform: 'browser',
      target: 'es2020',
      sourcemap: true,
      minify: false, // Keep it readable for now
      define: {
        'process.env.NODE_ENV': '"production"'
      }
    });
    console.log('Bundling complete!');
  } catch (error) {
    console.error('Bundling failed:', error);
    process.exit(1);
  }

  // 3. Copy static assets
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
    { src: 'src/popup/popup.html', dest: 'dist/popup/popup.html' },
    { src: 'src/popup/popup.css', dest: 'dist/popup/popup.css' }
  ];

  assets.forEach(asset => {
    if (fs.existsSync(asset.src)) {
      copyFile(asset.src, asset.dest);
    } else {
      console.error(`Asset not found: ${asset.src}`);
    }
  });

  console.log('Build successful! Output is in the dist/ directory.');
}

build();
