import { createHash } from 'node:crypto';
import fs from 'node:fs';
const read = (file) => fs.readFileSync(file, 'utf8');
const hash = (file) => createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const pkg=JSON.parse(read('package.json')); const lock=JSON.parse(read('package-lock.json')); const baseline=JSON.parse(read('scripts/patch-baselines/v1.0.9.json'));
const main=read('src/main.js'), catalog=read('src/engine/asset-catalog.js'), visual=read('src/runtime/combat-visual-director-v110.js'), layout=read('src/ui-layout-manager.js'), css=read('src/style.css'), policy=read('src/version-policy.js'), html=read('index.html'), sw=read('public/sw.js'), staticBootstrap=read('public/static-bootstrap.js'), buildStatic=read('scripts/build-static-fallback.mjs');
const hasDist=fs.existsSync('dist/index.html')&&fs.existsSync('dist/src/main.js')&&fs.existsSync('dist/src/runtime/combat-visual-director-v110.js');
const distMain=hasDist?read('dist/src/main.js'):'', distVisual=hasDist?read('dist/src/runtime/combat-visual-director-v110.js'):'', distCss=hasDist?read('dist/src/style.css'):'';
const protectedFiles=['src/art-style-tokens.js','docs/ABSOLUTE_ART_BIBLE_v2.0.md'];
const artBibleUnchanged=protectedFiles.every(file=>baseline.files?.[file]?.sha256===hash(file));
const existingAssetsUnchanged=Object.entries(baseline.files||{}).filter(([file])=>file.startsWith('src/assets/')||file.startsWith('public/assets/')).every(([file,meta])=>fs.existsSync(file)&&meta.sha256===hash(file));
const combatIds=new Set(catalog.match(/combat-art-(?:hero|guardian|monster|boss)-[a-z]+-v109/g)||[]);
const sources=[html,css,main,catalog,visual,layout,sw,staticBootstrap,buildStatic].join('\n');
const checks=[
 ['release identity is v1.0.10 / b24.10',pkg.version==='1.0.10'&&pkg.dokkaebi?.releaseVersion==='1.0.10'&&pkg.dokkaebi?.buildId==='b24.10'&&Number(pkg.dokkaebi?.buildRevision)===10],
 ['package lock identity and metadata are synchronized',lock.version===pkg.version&&lock.packages?.['']?.version===pkg.version&&lock.packages?.['']?.dokkaebi?.releaseVersion===pkg.version&&Number(lock.packages?.['']?.dokkaebi?.buildRevision)===10],
 ['runtime and cache identities match',policy.includes("PUBLIC_GAME_VERSION = '1.0.10'")&&policy.includes('BUILD_REVISION = 10')&&main.includes("const GAME_VERSION = '1.0.10'")&&html.includes("RELEASE_VERSION = '1.0.10'")&&sw.includes("RELEASE_VERSION = '1.0.10'")&&sw.includes("BUILD_ID = 'b24.10'")&&staticBootstrap.includes("RELEASE_VERSION = '1.0.10'")],
 ['21 approved high-resolution raster combat sources remain catalogued',combatIds.size===21&&catalog.includes('COMBAT_ART_TEXTURE_IDS')&&catalog.includes("role: 'combat-art'")],
 ['visual director resolves 11 directions and 6 combat action states',visual.includes('const DIRECTIONS = 11')&&visual.includes("['idle', 'move', 'attack', 'skill', 'hit', 'death']")&&visual.includes('DirectionalImpostorSelector')&&visual.includes('setDirectionalState(')&&visual.includes('directionTurn')],
 ['world-space HP bars follow core heroes guardians and enemies',visual.includes('worldHealthBarV110')&&visual.includes('updateHealth(record, camera, showHealth')&&visual.includes('getWorldQuaternion')&&main.includes('getHp: () => this.coreHp')&&main.includes('getHp: () => player.hp')&&main.includes('getHp: () => unit.hp')&&main.includes('getHp: () => enemy.hp')],
 ['skills and enemy specials drive visible skill action state',main.includes("trigger(unit.animation, 'skill'")&&main.includes("trigger(enemy.animation, 'skill'")&&visual.includes("state === 'skill'")&&visual.includes('combatActionAuraV110')],
 ['guardian citadel approved raster is attached above sacred core',catalog.includes('GUARDIAN_CITADEL_TEXTURE_ID')&&visual.includes('guardianCitadelV110')&&main.includes('attachCitadel(premium')],
 ['desktop HUD uses separate context meter status side and boss lanes',layout.includes("makeRail('top-context-rail'")&&layout.includes("makeRail('center-meter-rail'")&&layout.includes("makeRail('top-status-rail'")&&css.includes('--desktop-hud-top-v110')&&css.includes('--desktop-side-top-v110')],
 ['static builder emits current identity',buildStatic.includes("const version = '1.0.10'")&&buildStatic.includes("const buildId = 'b24.10'")&&buildStatic.includes('src/bootstrap.js?v=1.0.10-b24.10')],
 ['dist preserves v1.0.10 combat visual and HUD shell when present',!hasDist||(distMain.includes('CombatVisualDirectorV110')&&distVisual.includes('directional-action-projection-v110')&&distCss.includes('--desktop-hud-top-v110'))],
 ['absolute art bible files are unchanged',artBibleUnchanged],
 ['all pre-v1.0.10 runtime raster and 3D art bytes are unchanged',existingAssetsUnchanged],
 ['no SVG file reference or runtime SVG construction was introduced',!/<svg\b|createElementNS\([^)]*svg/i.test(sources)]
];
let failed=0; for(const [name,passed] of checks){console.log(`${passed?'PASS':'FAIL'} ${name}`); if(!passed)failed++;} if(failed)process.exit(1);
console.log('\nv1.0.10 Directional Combat, World HP, Citadel and Desktop HUD contract verified');
