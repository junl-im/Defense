import { access, cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

await import('./clean-obsolete-assets.mjs');

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const version = '23.0.1';

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
await cp(path.join(root, 'public'), dist, { recursive: true });
await rm(path.join(dist, 'assets/ip-v13/sheets'), { recursive: true, force: true });
await cp(path.join(root, 'src'), path.join(dist, 'src'), { recursive: true });

let localThreeVendored = false;
const threeRoot = path.join(root, 'node_modules/three');
try {
  await access(path.join(threeRoot, 'build/three.module.js'));
  const vendorRoot = path.join(dist, 'vendor/three');
  await mkdir(vendorRoot, { recursive: true });
  await cp(path.join(threeRoot, 'build/three.module.js'), path.join(vendorRoot, 'three.module.js'));
  await cp(path.join(threeRoot, 'examples/jsm'), path.join(vendorRoot, 'addons'), { recursive: true });
  localThreeVendored = true;
} catch {
  // A multi-CDN recovery loader is emitted below when node_modules is unavailable.
}

let html = await readFile(path.join(root, 'index.html'), 'utf8');
html = html.replace('    <title>', '    <link rel="stylesheet" href="./src/style.css?v=23.0.1" />\n    <title>');
html = html.replace(
  '<script type="module" src="/src/bootstrap.js"></script>',
  '<script src="./static-bootstrap.js?v=23.0.1"></script>'
);
await writeFile(path.join(dist, 'index.html'), html);

const mainPath = path.join(dist, 'src/main.js');
let main = await readFile(mainPath, 'utf8');
main = main.replace("import './style.css';\n", '');
await writeFile(mainPath, main);

await writeFile(path.join(dist, 'STATIC_BUILD_NOTICE.txt'), [
  `DokkaebiLuckDefense3D v${version} resilient static deployment`,
  localThreeVendored
    ? 'Three.js 0.185.1 was copied into dist/vendor/three and will load locally.'
    : 'Local Three.js was unavailable during packaging. The runtime will probe local vendor, jsDelivr, unpkg, then esm.sh and show a Korean recovery error instead of leaving a dead start button.',
  'For a fully self-contained production bundle, run npm ci && npm run build.',
  ''
].join('\n'));

console.log(`Static fallback build created: ${dist} (${localThreeVendored ? 'local Three.js' : 'multi-CDN recovery'})`);
