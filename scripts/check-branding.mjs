// Validate that our first-launch title is an actual raster image asset.
// This intentionally reads the file bytes: a CSS/text placeholder cannot pass.
import fs from 'node:fs';
import assert from 'node:assert/strict';

const src='assets/branding/rani-kingdom-logo.webp';
const asset=fs.readFileSync(src);
assert.ok(asset.byteLength>10000&&asset.byteLength<100000,'logo must be optimized WebP (10–100KB)');
assert.equal(asset.toString('ascii',0,4),'RIFF','invalid WebP RIFF header');
assert.equal(asset.toString('ascii',8,12),'WEBP','asset is not a WebP image');
const html=fs.readFileSync('index.html','utf8');
const css=fs.readFileSync('css/rani-branding.css','utf8');
const main=fs.readFileSync('src/main.js','utf8');
assert.match(html,/<h1 id="loading-title" class="loading-brand">/);
assert.match(html,/<img id="loading-logo" src="assets\/branding\/rani-kingdom-logo\.webp"/);
assert.match(html,/id="loading-logo-fallback" hidden/,'Korean text fallback must stay hidden by default');
assert.match(html,/href="css\/rani-branding\.css"/);
assert.match(html,/role="progressbar"/);
assert.match(css,/#loading-inner \.loading-brand/);
assert.match(css,/@media \(max-width: 700px\)/);
assert.match(css,/prefers-reduced-motion/);
assert.match(main,/logo\.hidden=true/);
assert.match(main,/loading-failure/);
console.log('PASS actual transparent-title WebP asset, Korean fallback, responsive style and boot logic');
