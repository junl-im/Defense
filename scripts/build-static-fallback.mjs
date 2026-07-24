import { access, cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

await import('./clean-obsolete-assets.mjs');

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const version = '1.0.10';
const buildId = 'b24.10';
const revision = `${version}-${buildId}`;

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
await cp(path.join(root, 'public'), dist, { recursive: true });
await rm(path.join(dist, 'assets/ip-v13/sheets'), { recursive: true, force: true });
await cp(path.join(root, 'src'), path.join(dist, 'src'), { recursive: true });

let localThreeVendored = false;
let localThreeSource = '';
const checkedInThree = path.join(root, 'public/vendor/three');
const installedThree = path.join(root, 'node_modules/three');
const vendorCandidates = [
  {
    id: 'checked-in-public-vendor',
    module: path.join(checkedInThree, 'three.module.js'),
    addons: path.join(checkedInThree, 'addons')
  },
  {
    id: 'installed-node-module',
    module: path.join(installedThree, 'build/three.module.js'),
    addons: path.join(installedThree, 'examples/jsm')
  }
];
for (const candidate of vendorCandidates) {
  try {
    await access(candidate.module);
    await access(path.join(candidate.addons, 'loaders/GLTFLoader.js'));
    const vendorRoot = path.join(dist, 'vendor/three');
    await mkdir(vendorRoot, { recursive: true });
    await cp(candidate.module, path.join(vendorRoot, 'three.module.js'));
    await cp(candidate.addons, path.join(vendorRoot, 'addons'), { recursive: true });
    localThreeVendored = true;
    localThreeSource = candidate.id;
    break;
  } catch {
    // Continue to the next local runtime source.
  }
}

let html = await readFile(path.join(root, 'index.html'), 'utf8');
html = html.replace('    <title>', `    <link rel="stylesheet" href="./src/style.css?v=${revision}" />\n    <title>`);
html = html.replace(
  '<script type="module" src="./src/bootstrap.js?v=1.0.10-b24.10"></script>',
  `<script src="./static-bootstrap.js?v=${revision}" data-entry="./src/bootstrap.js" data-vendor-base="./vendor/three/"></script>`
);
await writeFile(path.join(dist, 'index.html'), html);

const mainPath = path.join(dist, 'src/main.js');
let main = await readFile(mainPath, 'utf8');
main = main.replace("import './style.css';\n", '');
await writeFile(mainPath, main);

await writeFile(path.join(dist, 'STATIC_BUILD_NOTICE.txt'), [
  `DokkaebiLuckDefense3D v${version} (${buildId}) resilient static deployment`,
  localThreeVendored
    ? `Three.js 0.185.1 was copied into dist/vendor/three from ${localThreeSource} and will load locally.`
    : 'Local Three.js was unavailable during packaging. The runtime will probe the actual Three.js core and GLTF loader through local vendor, pinned jsDelivr endpoints, unpkg, then esm.sh and will show a Korean recovery error instead of leaving a dead start button.',
  'For a fully self-contained static bundle, run npm ci && npm run build:static so dist/vendor/three is copied locally.',
  ''
].join('\n'));

console.log(`Static fallback build created: ${dist} (${localThreeVendored ? `local Three.js: ${localThreeSource}` : 'multi-CDN recovery'})`);
