import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import BossIdentityAssuranceDirectorV133, {
  BOSS_IDENTITY_ASSURANCE_V133_ID,
  BOSS_IDENTITY_ASSURANCE_POLICY_V133,
  BOSS_IDENTITY_PROFILES_V133,
  colorDistanceV133,
  validateBossIdentityProfilesV133,
  resolveBossIdentityV133,
  compactDangerSectorsV133
} from '../src/runtime/boss-identity-assurance-director-v133.js';

const root = process.cwd();
const failures = [];
const check = (condition, message) => { if (!condition) failures.push(message); };
const text = (relative) => readFileSync(path.join(root, relative), 'utf8');
const json = (relative) => JSON.parse(text(relative));
const sha256 = (relative) => createHash('sha256').update(readFileSync(path.join(root, relative))).digest('hex');

const pkg = json('package.json');
const lock = json('package-lock.json');
const version = json('public/version.json');
const audit = json('public/assets/visual-v133/boss-identity-audit-v133.json');
const registry = json('public/assets/visual-v133/boss-identity-registry-v133.json');
const manifest = json('public/assets/visual-v133/boss-identity-manifest-v133.json');
const currentModuleShell = existsSync(path.join(root, 'public/assets/system-v135/runtime-module-shell-v135.json'))
  ? json('public/assets/system-v135/runtime-module-shell-v135.json')
  : null;
const main = text('src/main.js');
const css = text('src/style.css');
const sw = text('public/sw.js');
const workflow = text('.github/workflows/deploy.yml');
const index = text('index.html');
const versionPolicy = text('src/version-policy.js');

const releaseParts = String(pkg.version || '').split('.').map(Number);
const releaseAtLeastV133 = releaseParts.length === 3
  && releaseParts.every(Number.isFinite)
  && (releaseParts[0] > 1 || (releaseParts[0] === 1 && (releaseParts[1] > 0 || releaseParts[2] >= 33)));
const currentRevision = Number(pkg.dokkaebi?.buildRevision || 0);
const currentBuildId = String(pkg.dokkaebi?.buildId || '');
const currentCacheRevision = String(pkg.dokkaebi?.cacheRevision || '');
const currentReleaseTag = releaseParts[0] === 1 && releaseParts[1] === 0
  ? `release-v1${releaseParts[2]}-b${pkg.dokkaebi?.buildEpoch}-${currentRevision}`
  : currentCacheRevision;

check(releaseAtLeastV133 && pkg.dokkaebi?.buildEpoch === 24 && currentRevision >= 33 && currentBuildId === `b24.${currentRevision}`, 'package identity');
check(lock.version === pkg.version && lock.packages?.['']?.version === pkg.version && lock.packages?.['']?.dokkaebi?.buildId === currentBuildId, 'lock identity');
check(version.releaseVersion === pkg.version && version.buildId === currentBuildId && version.buildRevision === currentRevision, 'public version identity');
check(main.includes(`const GAME_VERSION = '${pkg.version}'`) && index.includes(currentReleaseTag) && index.includes(currentCacheRevision), 'runtime identity');
check(versionPolicy.includes(`BUILD_REVISION = ${currentRevision}`) && versionPolicy.includes(`PUBLIC_GAME_VERSION = '${pkg.version}'`), 'version policy identity');
check(BOSS_IDENTITY_ASSURANCE_V133_ID === 'DD-BOSS-IDENTITY-ASSURANCE-V133' && BOSS_IDENTITY_ASSURANCE_POLICY_V133.waveTarget === 90, 'policy identity');

const profileResult = validateBossIdentityProfilesV133(BOSS_IDENTITY_PROFILES_V133);
check(profileResult.approved && profileResult.profiles === 3 && profileResult.uniqueSigils === 3 && profileResult.uniqueAccents === 3, 'boss profile validation');
check(profileResult.reviewDistance >= BOSS_IDENTITY_ASSURANCE_POLICY_V133.minimumReviewPairColorDistance, 'review pair color distance');
check(colorDistanceV133('#39f4d4', '#ff4fd8') >= 200, 'serpent king accent distance');
const serpent = resolveBossIdentityV133('serpent', 2, '청월 윤무');
const king = resolveBossIdentityV133('king', 3, '백귀 야행진');
check(serpent?.sigil === '龍' && serpent?.accent === '#39f4d4' && king?.sigil === '王' && king?.secondary === '#ffd36a', 'identity resolution');

check(audit.version === '1.0.33' && audit.waveTarget === 90 && audit.reviewPair?.humanReviewRetained === true && audit.reviewPair?.nearDuplicate === false, 'audit payload');
check(audit.combatTelegraphs?.serpent?.shape === 'concentric-circular' && audit.combatTelegraphs?.king?.shape === 'alternating-line-and-impact', 'telegraph distinction');
check(registry.summary?.bossProfiles === 3 && registry.summary?.newFinalCharacterArt === 0 && registry.approvals?.bombImpRuntime === 'quarantined', 'approval boundary');
for (const entry of manifest.files || []) {
  const relative = entry.path.startsWith('src/') ? entry.path : path.join('public', entry.path);
  check(existsSync(path.join(root, relative)), `manifest missing ${entry.path}`);
  const supersededRuntime = entry.path === 'src/runtime/boss-identity-assurance-director-v133.js' && pkg.version !== '1.0.33';
  if (supersededRuntime) {
    const currentEntry = currentModuleShell?.files?.find((file) => file.path === entry.path);
    check(Boolean(currentEntry) && sha256(relative) === currentEntry.sha256, `current release hash ${entry.path}`);
  } else {
    check(sha256(relative) === entry.sha256, `manifest hash ${entry.path}`);
  }
}

check(main.includes('BossIdentityAssuranceDirectorV133') && main.includes("'boss-identity-assurance-v133'") && main.includes('bossIdentityAssuranceV133: game.bossIdentityAssuranceV133?.report'), 'main integration');
check(main.includes('color: 0xff4fd8') && main.includes('color: 0xffc85a') && main.includes("const color = index === 1 ? 0xffc85a : 0xff4fd8"), 'king combat color distinction');
check(css.includes('boss-identity-badge-v133') && css.includes('boss-identity-serpent-v133') && css.includes('boss-identity-king-v133'), 'CSS integration');
check(sw.includes('boss-identity-assurance-director-v133.js') && sw.includes('boss-identity-lab-v133.html') && sw.includes('boss-identity-audit-v133.json'), 'service worker integration');
check(pkg.scripts.verify.includes('verify:release:v133') && workflow.includes('npm run verify:dist:v133'), 'CI chain');
check(existsSync(path.join(root, 'public/boss-identity-lab-v133.html')) && existsSync(path.join(root, 'docs/NEXT_UPDATE_v1.0.34.md')), 'docs and lab');

check(!existsSync(path.join(root, 'COMPACT_PACKAGE_NOTE.txt')) && !existsSync(path.join(root, 'REBUILD_DIST_WINDOWS.bat')), 'obsolete root compact files removed');
check(existsSync(path.join(root, 'docs/COMPACT_PACKAGE_NOTE_v1.0.32.md')) && existsSync(path.join(root, 'scripts/REBUILD_DIST_WINDOWS.bat')), 'compact files moved to allowed locations');
const rebuild = text('scripts/REBUILD_DIST_WINDOWS.bat');
check(rebuild.includes('cd /d "%~dp0.."') && rebuild.includes('npm run build:static'), 'rebuild tool working directory');

const sectors = compactDangerSectorsV133([
  { direction: 'front-left', count: 2, remaining: 1.2, occluded: 1 },
  { direction: 'left', count: 1, remaining: .6, occluded: 0 },
  { direction: 'right', count: 1, remaining: 2.2, occluded: 0 },
  { direction: 'back', count: 1, remaining: 3.2, occluded: 0 }
]);
check(sectors.length === 3 && sectors[0].sector === 'left' && sectors[0].count === 3 && sectors[0].severity === 'critical', 'mobile sector compaction');

const fake = { diagnostics: { activeRecords: 7 } };
const director = new BossIdentityAssuranceDirectorV133({ combatVisual: fake });
for (let wave = 1; wave <= 90; wave += 1) {
  fake.diagnostics.activeRecords = 7 + Math.floor(wave / 30);
  director.update({
    wave,
    boss: wave % 10 === 0 ? { type: wave % 20 === 0 ? 'king' : 'serpent', phase: wave % 30 === 0 ? 3 : 2, intent: '검증 패턴' } : null,
    particles: 24 + wave,
    projectiles: 5 + Math.floor(wave / 10),
    hazards: 2 + Math.floor(wave / 32),
    fps: 60 - Math.floor(wave / 22),
    directionGroups: []
  });
}
check(director.report.ninetyWaveTargetReached && director.report.lifecycleHealthy && director.report.ready, '90 wave lifecycle');

if (failures.length) {
  failures.forEach((item) => console.error(`FAIL ${item}`));
  process.exit(1);
}
console.log(`PASS v1.0.33 boss identity foundation preserved under current release ${pkg.version} / ${currentBuildId}`);
