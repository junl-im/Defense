import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const importMap = `    <script type="importmap">\n      {\n        "imports": {\n          "three": "https://cdn.jsdelivr.net/npm/three@0.185.1/build/three.module.js",\n          "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.185.1/examples/jsm/"\n        }\n      }\n    </script>\n`;

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
await cp(path.join(root, 'public'), dist, { recursive: true });
await cp(path.join(root, 'src'), path.join(dist, 'src'), { recursive: true });

let html = await readFile(path.join(root, 'index.html'), 'utf8');
html = html.replace('    <title>', '    <link rel="stylesheet" href="./src/style.css" />\n' + importMap + '    <title>');
html = html.replace('<script type="module" src="/src/main.js"></script>', '<script type="module" src="./src/main.js"></script>');
await writeFile(path.join(dist, 'index.html'), html);

const mainPath = path.join(dist, 'src/main.js');
let main = await readFile(mainPath, 'utf8');
main = main.replace("import './style.css';\n", '');
await writeFile(mainPath, main);

await writeFile(path.join(dist, 'STATIC_BUILD_NOTICE.txt'), [
  'DokkaebiLuckDefense3D v4.0.0 static ESM deployment',
  'Three.js is loaded from the pinned jsDelivr 0.185.1 ESM URL.',
  'Use npm run build when the package registry is available to create the normal bundled build.',
  ''
].join('\n'));

console.log(`Static fallback build created: ${dist}`);
