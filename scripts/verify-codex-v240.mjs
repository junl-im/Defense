import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  createDefaultCodexProgress,
  recordCodexEncounter,
  recordCodexDefeat,
  recordGuardianUse,
  getCodexKnowledge,
  getCodexProgressSummary,
  getWeaknessDamageBonus,
  LOOT_CATALOG,
  ENEMY_RESEARCH
} from '../src/codex-progression.js';

const root = resolve(import.meta.dirname, '..');
const read = (path) => readFileSync(resolve(root, path), 'utf8');
const failures = [];
const assert = (condition, message) => {
  if (condition) console.log(`PASS ${message}`);
  else failures.push(message);
};

const progress = createDefaultCodexProgress();
let summary = getCodexProgressSummary(progress);
assert(summary.discoverable === 32, '도감 전체 32종 유지');
assert(summary.discovered === 16, '전장·효과 16종 기본 발견');
assert(summary.weaknessTotal === 10 && Object.keys(ENEMY_RESEARCH).length === 10, '요괴·보스 약점 연구 10종');
assert(summary.lootTotal === 13 && Object.keys(LOOT_CATALOG).length === 13, '전리품 13종');

const summon = recordGuardianUse(progress, 'ember');
assert(summon.newDiscovery && getCodexKnowledge(progress, 'guardian', 'ember').uses === 1, '첫 수호대 강림 발견 기록');
recordGuardianUse(progress, 'ember');
recordGuardianUse(progress, 'ember');
assert(getCodexKnowledge(progress, 'guardian', 'ember').mastery >= 2, '수호대 강림 숙련 상승');

const seen = recordCodexEncounter(progress, 'monster', 'imp');
assert(seen.newDiscovery && getCodexKnowledge(progress, 'monster', 'imp').encounters === 1, '요괴 첫 조우 발견');
recordCodexDefeat(progress, 'monster', 'imp', () => .99);
recordCodexDefeat(progress, 'monster', 'imp', () => .99);
const third = recordCodexDefeat(progress, 'monster', 'imp', () => .99);
assert(third.newWeakness && getCodexKnowledge(progress, 'monster', 'imp').weaknessUnlocked, '일반 요괴 3회 격파 약점 해독');
assert(getCodexKnowledge(progress, 'monster', 'imp').encounters === 1, '격파 기록이 조우 횟수를 중복 증가시키지 않음');
assert(getWeaknessDamageBonus(progress, 'imp', 'frost') === 1.22, '해독 후 달서리 약점 배율 적용');
assert(getWeaknessDamageBonus(progress, 'imp', 'ember') === 1, '비약점 공격은 기본 배율');

recordCodexEncounter(progress, 'boss', 'tiger');
const tiger = recordCodexDefeat(progress, 'boss', 'tiger', () => 0);
assert(tiger.newWeakness, '보스 첫 격파 약점 즉시 해독');
assert(tiger.drops.some((drop) => drop.id === 'tiger-fang'), '저승 호랑이 첫 격파 전용 엄니 보장');
assert(getCodexKnowledge(progress, 'boss', 'tiger').loot.some((loot) => loot.id === 'tiger-fang' && loot.count === 1), '보스 전리품 영구 기록');

summary = getCodexProgressSummary(progress);
assert(summary.discovered >= 19 && summary.weaknesses >= 2 && summary.lootOwned >= 1, '도감 요약 수치 누적');

const main = read('src/main.js');
const html = read('index.html');
const style = read('src/style.css');
const premium = read('src/premium-assets.js');
assert(main.includes('handleCodexEnemyDefeat(enemy)') && main.includes('getWeaknessDamageBonus(this.codexProgress'), '전투 런타임 도감 연결');
assert(main.includes('createMoonMarketModuleSet()') && main.includes("root.name = 'MoonMarketModuleSetV1'"), '모듈형 야시장 환경 세트');
assert(premium.includes('export function applyPremiumBossPhase') && premium.includes("type === 'tiger'"), '저승 호랑이 페이즈 전용 시각 구조');
assert(html.includes('id="codex-progress-readout"') && html.includes('id="codex-loot-readout"'), '도감 3D 연구 판넬');
assert(style.includes('.codex-item.locked') && style.includes('.codex-mastery-pips'), '미발견·숙련도 도감 스타일');
assert(existsSync(resolve(root, 'src/assets/moon-mascot-expressions-v1.webp')), '마스코트 표정 아틀라스 파일');

if (failures.length) {
  failures.forEach((message) => console.error(`FAIL ${message}`));
  process.exit(1);
}
console.log('v2.4 도감 연구·약점·전리품·보스 페이즈 검증 완료');
