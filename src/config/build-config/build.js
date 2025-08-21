const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

fs.rmSync('./dist', { recursive: true, force: true });

// Copy swagger json files
fs.mkdirSync('./dist/routes/admin', { recursive: true });
fs.mkdirSync('./dist/routes/public', { recursive: true });
fs.copyFileSync('./src/routes/admin/swagger.json', './dist/routes/admin/swagger.json');
fs.copyFileSync('./src/routes/public/swagger.json', './dist/routes/public/swagger.json');

esbuild.build({
    entryPoints: ['./src/server.ts'],
    bundle: true,
    platform: 'node',
    target: 'node20',
    outfile: './dist/server.js',
    sourcemap: false,
    minify: false,
    external: ['swagger-ui-dist'],
    tsconfig: './tsconfig.json'
}).then(() => {
    console.log('✅ Build thành công!');
}).catch(() => process.exit(1));
