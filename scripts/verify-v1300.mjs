import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { IP_ASSET_LIBRARY_V13 } from '../src/ip-asset-library-v13.js';
import { HERO_CLASSES, HERO_CLASS_ORDER } from '../src/hero-classes.js';
import { EQUIPMENT_ITEMS } from '../src/equipment-system.js';
import { SAVE_SCHEMA_VERSION } from '../src/runtime/save-schema.js';

const root = resolve(import.meta.dirname, '..');
const read = (p) => readFileSync(resolve(root,p),'utf8');
const json = (p) => JSON.parse(read(p));
const hash = (p) => createHash('sha256').update(readFileSync(resolve(root,p))).digest('hex');
let failures=0;
const check=(value,message)=>value?console.log(`PASS ${message}`):(failures++,console.error(`FAIL ${message}`));

const pkg=json('package.json');
const manifest=json('public/assets/ip-v13/asset-manifest-v13.json');
const html=read('index.html');
const main=read('src/main.js');
const codex=read('src/codex-data.js');
const consoleSource=read('src/production-console.js');

check(Number((pkg.dokkaebi?.lineageVersion || pkg.version).split('.')[0])>=13,'package version remains v13 or later');
check(Number((pkg.dokkaebi?.lineageVersion || pkg.version).split('.')[0]) >= 13 && main.includes('LEGACY_LINEAGE_VERSION'),'runtime retains v13 lineage');
check(SAVE_SCHEMA_VERSION>=11,'save schema remains v11 or later');
check(IP_ASSET_LIBRARY_V13.totalCrops===415 && manifest.summary.totalCrops===415,'415 cropped sprite assets');
check(manifest.summary.sourceSheets===10,'10 source sheets registered');
check(manifest.assets.length===415,'manifest contains 415 entries');
check(manifest.summary.production3DApproved===0 && IP_ASSET_LIBRARY_V13.production3DApproved===0,'2D crop import does not grant 3D production approval');
check(manifest.assets.every(a=>existsSync(resolve(root,'public',a.path))),'all crop files exist');
check(manifest.assets.every(a=>hash(resolve('public',a.path))===a.sha256),'all crop hashes match manifest');
check(manifest.assets.some(a=>a.category==='heroes') && manifest.assets.some(a=>a.category==='ui') && manifest.assets.some(a=>a.category==='vfx'),'hero, UI and VFX categories available');
check(HERO_CLASS_ORDER.every(id=>HERO_CLASSES[id].conceptArt.includes('assets/ip-v13/crops/heroes/')),'five hero cards use v13 transparent crops');
check(EQUIPMENT_ITEMS.every(item=>item.iconImage?.includes('assets/ip-v13/crops/')),'all equipment items use v13 sprite icons');
check(codex.includes("const V13 =") && codex.includes("art: V13('monsters'") && codex.includes("art: V13('environment'") && codex.includes("art: V13('vfx'"),'codex routes monster, world and VFX sprites');
check(html.includes('id="title-vault-modal"') && (consoleSource.includes('IP_ASSET_LIBRARY_V13') || consoleSource.includes('IP_ASSET_LIBRARY_V15')), 'v13 Sprite Forge lineage remains accessible outside simplified title');
check((consoleSource.includes('IP_ASSET_LIBRARY_V13') || consoleSource.includes('IP_ASSET_LIBRARY_V14') || consoleSource.includes('IP_ASSET_LIBRARY_V15')) && (consoleSource.includes('415 SLICED SPRITES') || consoleSource.includes('128 RUNTIME FRAMES') || consoleSource.includes('154 FRAMES') || consoleSource.includes('ATLAS</b>')),'production console preserves v13 diagnostics lineage');
check(existsSync(resolve(root,'docs/ASSET_SHEET_CUT_PREVIEW_v13.0.0.jpg')),'v13 cut preview board exists');

if(failures){console.error(`\nFAIL v13.0.0 Transparent Arsenal contract ${failures}`);process.exit(1)}
console.log('\nv13.0.0 Transparent Arsenal contract verified');
