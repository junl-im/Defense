import fs from 'node:fs';
import crypto from 'node:crypto';
import { generatedOutput } from './output-paths.mjs';

const read = (path) => fs.readFileSync(path, 'utf8');
const sha256 = (path) => crypto.createHash('sha256').update(fs.readFileSync(path)).digest('hex');
const fileInfo = (path) => ({ path, bytes: fs.statSync(path).size, sha256: sha256(path) });
const main = read('src/main.js');
const html = read('index.html');
const css = read('src/style.css');
const atlas = read('src/ip-asset-library-v15.js');
const equipment = read('src/equipment-system.js');
const codex = read('src/codex-data.js');
const battlefield = read('src/runtime/battlefield-sprite-director-v16.js');
const isolatedHan = [...html.matchAll(/>([\u3400-\u9fff])</gu)].map((match) => match[1]);
const aliases = [...atlas.matchAll(/"alias":"([^"]+)"/g)].map((match) => match[1]);
const uniqueAliases = [...new Set(aliases)];
const report = {
  version: '21.0.0',
  name: 'Asset Presence Enforcement',
  styleLock: 'DD-ABSOLUTE-ART-BIBLE-2.0',
  production3DApproved: 0,
  massProductionUnlocked: false,
  titleAssets: [
    fileInfo('src/assets/title-v17/title-bg-desktop-v17.webp'),
    fileInfo('src/assets/title-v17/title-bg-mobile-v17.webp'),
    fileInfo('src/assets/title-v17/title-mascot-v17.webp')
  ],
  atlas: {
    runtimeFrames: 154,
    uniqueAliases: uniqueAliases.length,
    dataAttributes: atlas.includes('data-asset-key') && atlas.includes('data-asset-category'),
    actionBindings: [...main.matchAll(/'((?:dash|skill|burst|summon|wave|interact)-btn)'/g)].map((match) => match[1]).filter((value, index, all) => all.indexOf(value) === index).length,
    codexArtReferences: (codex.match(/V13\(/g) || []).length,
    equipmentImageReferences: (equipment.match(/iconImage/g) || []).length,
    battlefieldAliasReferences: (battlefield.match(/alias:/g) || []).length
  },
  runtimeContracts: {
    assetPresenceEnforcer: main.includes('AssetPresenceEnforcer') && fs.existsSync('src/runtime/asset-presence-enforcer.js'),
    mobileHudDirector: (main.includes('MobileHudDirectorV21') || main.includes('MobileHudDirectorV22') || main.includes('MobileHudDirectorV23')) && fs.existsSync('src/runtime/mobile-hud-director-v23.js'),
    combatReadability: main.includes('CombatReadabilityDirectorV21') && fs.existsSync('src/combat/combat-readability-director-v21.js'),
    shamanThreatTracer: main.includes('spawnThreatTracer(enemy.group.position, target'),
    enemyMarkers: read('src/combat/combat-readability-director-v21.js').includes('ensureMarker(enemy)'),
    mobileEmergencyLayout: css.includes('mobile-hud-v21-emergency')
  },
  languageAudit: {
    documentLanguage: html.includes('<html lang="ko-KR">'),
    isolatedHanInStaticHtml: isolatedHan,
    pass: isolatedHan.length === 0
  },
  titlePresentation: {
    cacheRevision: /(?:presence-v21|automation-v22|quiet-screen-v23|release-v105-b24-5)/.test(html),
    mascotMarkup: /title-mascot-v17\.webp\?rev=(?:presence-v21|automation-v22|quiet-screen-v23|release-v105-b24-5)/.test(html),
    featureRibbon: html.includes('title-feature-ribbon-v21') || html.includes('title-brand-v105')
  }
};
const output = `${JSON.stringify(report, null, 2)}\n`;
const baselinePath = 'docs/ASSET_PRESENCE_AUDIT_v21.0.0.json';
const path = process.argv.includes('--check') ? baselinePath : generatedOutput({ category: 'audits', filename: 'ASSET_PRESENCE_AUDIT_v21.latest.json', baseline: baselinePath });
if (process.argv.includes('--check')) {
  if (!fs.existsSync(path) || fs.readFileSync(path, 'utf8') !== output) {
    console.error(`FAIL ${path} is missing or stale`);
    process.exit(1);
  }
  console.log(`PASS ${path} is current`);
} else {
  fs.writeFileSync(path, output);
  console.log(`WROTE ${path}`);
}
