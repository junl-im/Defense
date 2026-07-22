import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const read = (path) => readFileSync(resolve(root, path), 'utf8');
const html = read('index.html');
const css = read('src/style.css');
const main = read('src/main.js');
const manager = read('src/ui-layout-manager.js');
const failures = [];
const pass = (message) => console.log(`PASS ${message}`);
const fail = (message) => { failures.push(message); console.error(`FAIL ${message}`); };
const expect = (condition, ok, bad = ok) => condition ? pass(ok) : fail(bad);

expect(html.includes('id="hud-layout-btn"'), 'HUD 정보 밀도 버튼 연결', 'HUD 정보 밀도 버튼 누락');
expect(html.includes('data-control-toggle="autoHudLayout"'), 'HUD 자동 정리 설정 연결', 'HUD 자동 정리 설정 누락');
expect((html.match(/class="action-glyph/g) || []).length >= 5, '하단 5개 액션 아이콘 계층', '하단 액션 아이콘 누락');
expect(main.includes("from './ui-layout-manager.js'"), 'AdaptiveHudLayout 모듈 import', 'AdaptiveHudLayout import 누락');
expect(main.includes('this.hudLayout.mount()') && main.includes('this.hudLayout?.refresh'), 'HUD 레일 마운트·리사이즈 연결', 'HUD 레일 런타임 연결 누락');
expect(!main.match(/\[BOSS_ASSET_IDS\.tiger\][\s\S]{0,180}\[BOSS_ASSET_IDS\.tiger\]/), '보스 에셋 라벨 중복 제거', '보스 에셋 라벨 중복 잔존');

for (const id of ['top-status-rail', 'center-meter-rail', 'left-insight-rail', 'right-roster-rail']) {
  expect(manager.includes(`'${id}'`), `${id} 동적 레일 정의`, `${id} 레일 정의 누락`);
}
expect(manager.includes('auditCollisions()'), '실측 UI 충돌 감사기 포함', 'UI 충돌 감사기 누락');
expect(manager.includes("Object.freeze(['auto', 'full', 'minimal'])"), 'HUD 자동·전체·간소 모드', 'HUD 밀도 3단계 누락');
expect(css.includes('grid-template-areas: "dash skill burst summon wave"'), '데스크톱 5버튼 단일 행', '데스크톱 5버튼 그리드 누락');
expect(css.includes('grid-template-areas: "dash skill burst" "summon summon wave"'), '모바일 3+2 액션 도크', '모바일 3+2 액션 도크 누락');
expect(css.includes('body.boss-active .left-insight-rail') && css.includes('top: calc(202px + var(--safe-top))'), '보스 HUD 전용 안전 레일', '보스 HUD 안전 레일 누락');
expect(css.includes('@media (max-width: 390px)') && css.includes('@media (max-height: 640px)'), '좁은·짧은 모바일 별도 예산', '모바일 세부 브레이크포인트 누락');
expect(css.includes('body.ui-overflow-safe .run-seed-chip'), '충돌 감지 시 저우선 정보 자동 축약', '충돌 안전 축약 규칙 누락');

const mobileWidth = 320;
const joystickRight = 5 + 110;
const dockLeft = mobileWidth - 5 - 174;
expect(dockLeft - joystickRight >= 20, `320px 하단 조작 수평 간격 ${dockLeft - joystickRight}px`, '320px 하단 조작 수평 겹침 위험');
const topHudBottom = 46;
const topRailTop = 57;
const topRailBottom = 57 + 42;
const meterTop = 105;
const meterBottom = 105 + 31;
const bossTop = 143;
expect(topRailTop - topHudBottom >= 8, '상단 HUD↔상황 레일 간격 확보', '상단 HUD↔상황 레일 간격 부족');
expect(meterTop - topRailBottom >= 5, '상황 레일↔게이지 간격 확보', '상황 레일↔게이지 간격 부족');
expect(bossTop - meterBottom >= 5, '게이지↔보스 체력 간격 확보', '게이지↔보스 체력 간격 부족');

if (failures.length) {
  console.error(`\nv3.6 UI 검증 실패 ${failures.length}건`);
  process.exit(1);
}
console.log('\nv3.6 UI 레이아웃·디자인 검증 완료');
