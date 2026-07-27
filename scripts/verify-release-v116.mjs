import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root=process.cwd();
const failures=[];
const check=(condition,message)=>{ if(!condition) failures.push(message); };
const pass=(message)=>console.log(`PASS ${message}`);
const text=(file)=>readFileSync(path.join(root,file),'utf8');
const json=(file)=>JSON.parse(text(file));

const pkg=json('package.json');
const lock=json('package-lock.json');
const version=json('public/version.json');
const index=text('index.html');
const main=text('src/main.js');
const style=text('src/style.css');
const sw=text('public/sw.js');
const staticBootstrap=text('public/static-bootstrap.js');

const currentPatch=Number(String(pkg.version).split('.')[2]||0);
check(currentPatch>=16 && pkg.version===pkg.dokkaebi?.releaseVersion,'current release predates v1.0.16 or package identity mismatch');
check(lock.version===pkg.version && lock.packages?.['']?.version===pkg.version && lock.packages?.['']?.dokkaebi?.buildId===pkg.dokkaebi?.buildId,'package-lock identity mismatch');
check(version.releaseVersion===pkg.version && version.buildId===pkg.dokkaebi?.buildId && version.cacheRevision===`${pkg.version}-${pkg.dokkaebi?.buildId}`,'public version mismatch');
check(index.includes(`RELEASE_VERSION = '${pkg.version}'`) && index.includes(`BUILD_ID = '${pkg.dokkaebi?.buildId}'`),'index identity mismatch');
check(main.includes(`const GAME_VERSION = '${pkg.version}'`),'runtime identity mismatch');
check(sw.includes(`RELEASE_VERSION = '${pkg.version}'`) && staticBootstrap.includes(`RELEASE_VERSION = '${pkg.version}'`),'offline identity mismatch');
if(!failures.length) pass(`v1.0.16 foundation is preserved under current release ${pkg.version} / ${pkg.dokkaebi?.buildId}`);

check(index.includes('data-touch-coverage="full-map-v116"'),'full-map touch marker missing');
check(!style.includes('#look-zone { inset:22% 0 22% 34%; }'),'legacy left 34 percent exclusion remains');
for(const token of [
  'v1.0.16 Full-Map Touch Navigation',
  'body.dd-shell-mobile-v112.dd-shell-portrait-v112 .look-zone',
  'body.dd-shell-mobile-v112.dd-shell-landscape-v112 .look-zone',
  'left: 0 !important; right: 0 !important; width: auto !important;'
]) check(style.includes(token),`touch coverage style missing: ${token}`);
check(style.includes('body.playing:not(.modal-open) .look-zone { pointer-events: auto; }') || style.includes('body[data-map-touch-ready-v141="true"]:not(.modal-open) .look-zone { pointer-events: auto; }'),'touch coverage active-state selector missing');
if(!failures.length) pass('mobile portrait, mobile landscape, tablet and PC map touch layers cover the left, center and right battlefield lanes');

for(const token of [
  'mapTouchDiagnosticsV116',
  "bands: { left: 0, center: 0, right: 0 }",
  "const band = ratioX < 1 / 3 ? 'left' : ratioX < 2 / 3 ? 'center' : 'right'",
  "this.listen(ui.lookZone, 'lostpointercapture'",
  'event.preventDefault()',
  'clientX < rect.left || clientX > rect.right'
]) check(main.includes(token),`map input hardening missing: ${token}`);
if(!failures.length) pass('map taps are bounded to the canvas, classified across three horizontal QA bands and cancelled safely');

check(pkg.scripts?.verify?.includes('verify:release:v116'),'full verification chain omits v116');
for(const file of ['docs/PATCH_NOTES_v1.0.16.md','docs/PATCH_APPLY_v1.0.16.md']) check(existsSync(path.join(root,file)),`missing ${file}`);
if(!failures.length) pass('v1.0.16 documentation and release verification are installed');

if(failures.length){ for(const failure of failures) console.error(`FAIL ${failure}`); console.error(`\nv1.0.16 verification failed with ${failures.length} issue(s).`); process.exit(1); }
console.log('\nv1.0.16 Full-Map Touch Navigation verified.');
