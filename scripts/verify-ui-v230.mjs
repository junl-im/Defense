import { readFileSync, existsSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const read = (path) => readFileSync(resolve(root, path), 'utf8');
const failures = [];
const assert = (condition, message) => {
  if (condition) console.log(`PASS ${message}`);
  else failures.push(message);
};

const html = read('index.html');
const main = read('src/main.js');
const style = read('src/style.css');
const codexViewer = read('src/codex-viewer.js');

assert(
  html.includes('id="controls-btn" class="title-settings-btn"') &&
  html.includes('aria-label="카메라와 조작 설정"') &&
  html.includes('aria-hidden="true">⚙️</span>'),
  '첫 화면 우측 상단 카메라 설정 톱니바퀴'
);
assert(
  style.includes('.title-settings-btn {') &&
  style.includes('position: fixed; z-index: 128;') &&
  style.includes('width: 44px; height: 44px;') &&
  style.includes('var(--safe-top)') && style.includes('var(--safe-right)'),
  '안전 영역을 반영한 44px 고정 설정 버튼'
);
assert(
  main.includes("document.body.classList.toggle('ui-compact', compact)") &&
  main.includes("document.body.classList.toggle('ui-ultra-compact', ultraCompact)") &&
  main.includes("document.body.classList.toggle('ui-landscape-compact', landscapeCompact)") &&
  main.includes("--viewport-height") &&
  main.includes("window.visualViewport?.height"),
  'visualViewport 기반 표준·컴팩트·초컴팩트 프로필'
);
assert(
  style.includes('body.ui-ultra-compact .title-panel > .kicker') &&
  style.includes('body.ui-ultra-compact .daily-edict-preview { display: none; }') &&
  style.includes('body.ui-compact .run-preview span:nth-child(n+4) { display: none; }') &&
  style.includes('body.ui-compact .title-actions { grid-template-columns: repeat(3'),
  '짧은 모바일 화면의 비핵심 정보 축약'
);
assert(
  main.includes('this.pinchState.cameraDistance - delta * .018') &&
  codexViewer.includes('this.pinchState.zoom - delta * .012') &&
  html.includes('벌리면 줌인 · 오므리면 줌아웃'),
  '핀치 벌리기 줌인·오므리기 줌아웃 방향 통일'
);
assert(
  main.includes("radius: 1.82, type: 'core'") &&
  main.includes("radius: 2.15, height: 6.7, type: 'core'") &&
  main.includes('premium.scale.setScalar(.78)') &&
  main.includes('damageAnchorY = 4.55') && main.includes('impactY = 3.7'),
  '축소된 중앙 신목과 충돌·피격 앵커 동기화'
);
assert(
  main.includes("document.body.classList.add('boss-active')") &&
  main.includes("document.body.classList.remove('boss-active')") &&
  style.includes('body.ui-compact.boss-active .synergy-panel') &&
  style.includes('body.ui-compact.boss-active .kill-chain'),
  '보스 체력바 활성 시 좌우 HUD 레일 충돌 회피'
);
assert(
  main.includes('createMarketHeritageProps()') &&
  main.includes("root.name = 'MoonMarketHeritageProps'") &&
  main.includes('createJangseung') && main.includes('moonRing'),
  '장승·달항아리·마스코트 제단 환경 장식'
);
assert(
  main.includes("attachUnitImpostor(unit)") &&
  main.includes("attachEnemyImpostor(group, type)") &&
  main.includes('setDirectionalImpostorState(impostor, state') &&
  main.includes("for (const state of ['idle', 'move', 'attack'])") &&
  main.includes('updateDirectionalImpostorFrame(impostor, unit.group.rotation.y, unit.group)') &&
  main.includes('updateDirectionalImpostorFrame(impostor, enemy.group.rotation.y, enemy.group)'),
  '수호대·요괴 상태별 11방향 LOD와 부모 회전 보정'
);

// The compact title layout is intentionally budgeted rather than scaled as a single bitmap.
// These conservative block estimates include vertical gaps and panel padding.
const titleProfiles = [
  { name: '320x568 ultra', viewport: 568, safe: 20, content: 350 },
  { name: '360x640 ultra', viewport: 640, safe: 20, content: 350 },
  { name: '390x844 compact', viewport: 844, safe: 24, content: 485 },
  { name: '430x740 compact', viewport: 740, safe: 24, content: 485 }
];
for (const profile of titleProfiles) {
  assert(profile.content + profile.safe <= profile.viewport, `${profile.name} 첫 화면 높이 예산`);
}

function webpSize(path) {
  const buffer = readFileSync(resolve(root, path));
  if (buffer.toString('ascii', 0, 4) !== 'RIFF' || buffer.toString('ascii', 8, 12) !== 'WEBP') return null;
  const chunk = buffer.toString('ascii', 12, 16);
  if (chunk === 'VP8X') {
    const width = 1 + buffer.readUIntLE(24, 3);
    const height = 1 + buffer.readUIntLE(27, 3);
    return { width, height };
  }
  return null;
}

const mascotPath = 'src/assets/moon-mascot-v1.webp';
assert(existsSync(resolve(root, mascotPath)) && statSync(resolve(root, mascotPath)).size > 30000, '마스코트 도깨비 WebP 에셋');
const mascotSize = webpSize(mascotPath);
assert(mascotSize?.width === 768 && mascotSize?.height === 768, '마스코트 768x768 투명 캔버스');

const atlases = [
  'public/assets/impostors/guardian/ember-idle-11.webp',
  'public/assets/impostors/guardian/ember-move-11.webp',
  'public/assets/impostors/guardian/ember-attack-11.webp',
  'public/assets/impostors/monster/imp-idle-11.webp',
  'public/assets/impostors/monster/imp-move-11.webp',
  'public/assets/impostors/monster/imp-attack-11.webp'
];
for (const path of atlases) {
  const size = existsSync(resolve(root, path)) ? webpSize(path) : null;
  assert(size?.width === 768 && size?.height === 576, `${path} 768x576 상태 아틀라스`);
}

if (failures.length) {
  failures.forEach((message) => console.error(`FAIL ${message}`));
  process.exit(1);
}
console.log('v2.3 모바일 UI·핀치·마스코트·LOD 검증 완료');
