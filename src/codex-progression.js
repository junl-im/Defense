import { CODEX_SECTION_ORDER, getCodexEntries } from './codex-data.js';
import { UNIT_TYPES } from './game-data.js';

export const CODEX_STORAGE_KEY = 'dokkaebi-codex-progress-v1';

export const ENEMY_RESEARCH = Object.freeze({
  imp: Object.freeze({ weakTo: 'frost', multiplier: 1.22, title: '차가운 달빛', tip: '장난 요괴의 뜨거운 귀면은 달서리 공격에 쉽게 갈라집니다.' }),
  runner: Object.freeze({ weakTo: 'wind', multiplier: 1.22, title: '발목을 베는 바람', tip: '질주 직선에 바람 관통을 맞히면 얇은 다리의 균형을 무너뜨립니다.' }),
  brute: Object.freeze({ weakTo: 'thunder', multiplier: 1.28, title: '갑주 틈의 낙뢰', tip: '돌갑옷의 금속 매듭은 천뢰에 과충전되어 큰 피해를 받습니다.' }),
  shaman: Object.freeze({ weakTo: 'ember', multiplier: 1.24, title: '젖은 부적 태우기', tip: '저주 무당의 젖은 부적은 도깨비불에 닿으면 결계가 빠르게 무너집니다.' }),
  tiger: Object.freeze({ weakTo: 'frost', multiplier: 1.18, title: '산군의 달그늘', tip: '광폭화한 등털을 달서리로 식히면 돌진 준비가 눈에 띄게 흔들립니다.' }),
  serpent: Object.freeze({ weakTo: 'thunder', multiplier: 1.18, title: '청동 뿔의 천뢰', tip: '청월 이무기의 청동 뿔과 비늘 고리는 낙뢰를 몸 전체로 전달합니다.' }),
  king: Object.freeze({ weakTo: 'bell', multiplier: 1.16, title: '가면 속 혼백', tip: '백귀 야행왕의 가면 안쪽 혼백은 방울 파동과 수호신 계열 공격에 약합니다.' })
});

export const LOOT_CATALOG = Object.freeze({
  'cracked-mask': Object.freeze({ icon: '面', name: '깨진 장난탈', rarity: 'common', shards: 1, copy: '장난 요괴가 쓰던 조각난 귀면. 웃음소리가 아주 약하게 남아 있습니다.' }),
  'night-shoe': Object.freeze({ icon: '履', name: '밤질주 짚신', rarity: 'common', shards: 1, copy: '두억 질주꾼의 발목을 감싸던 검은 짚신 매듭.' }),
  'stone-knot': Object.freeze({ icon: '岩', name: '귀수 돌매듭', rarity: 'common', shards: 2, copy: '돌갑옷 귀수의 갑주를 묶던 무거운 봉인 매듭.' }),
  'drowned-talisman': Object.freeze({ icon: '符', name: '젖은 저주부', rarity: 'common', shards: 2, copy: '비에 젖어 먹이 번진 부적. 아직 미약한 저주가 맴돕니다.' }),
  'tiger-fang': Object.freeze({ icon: '牙', name: '저승 산군의 엄니', rarity: 'boss', shards: 8, copy: '저승 호랑이의 첫 격파를 증명하는 붉은 엄니.' }),
  'blood-mane': Object.freeze({ icon: '鬣', name: '혈월 갈기', rarity: 'rare', shards: 5, copy: '광폭 페이즈에서만 떨어지는 달빛을 머금은 갈기.' }),
  'moon-scale': Object.freeze({ icon: '鱗', name: '청월 비늘', rarity: 'boss', shards: 10, copy: '독월 고리를 반사하는 이무기의 푸른 비늘.' }),
  'spirit-pearl': Object.freeze({ icon: '珠', name: '혼령 여의주 조각', rarity: 'rare', shards: 6, copy: '완성되지 못한 여의주의 청록색 파편.' }),
  'eclipse-mask': Object.freeze({ icon: '蝕', name: '월식 왕가면', rarity: 'boss', shards: 14, copy: '백귀 야행왕의 최종막을 깨뜨리고 얻은 가면 파편.' }),
  'hundred-scroll': Object.freeze({ icon: '卷', name: '백귀 행진 두루마리', rarity: 'rare', shards: 8, copy: '수많은 요괴의 이름이 흐릿하게 적힌 금단의 두루마리.' })
});

export const ENEMY_LOOT_TABLES = Object.freeze({
  imp: Object.freeze([{ id: 'cracked-mask', chance: .18 }]),
  runner: Object.freeze([{ id: 'night-shoe', chance: .16 }]),
  brute: Object.freeze([{ id: 'stone-knot', chance: .15 }]),
  shaman: Object.freeze([{ id: 'drowned-talisman', chance: .15 }]),
  tiger: Object.freeze([{ id: 'tiger-fang', chance: 1, firstOnly: true }, { id: 'blood-mane', chance: .16 }]),
  serpent: Object.freeze([{ id: 'moon-scale', chance: 1, firstOnly: true }, { id: 'spirit-pearl', chance: .14 }]),
  king: Object.freeze([{ id: 'eclipse-mask', chance: 1, firstOnly: true }, { id: 'hundred-scroll', chance: .12 }])
});

const entryKey = (section, id) => `${section}:${id}`;
const normaliseCount = (value) => Math.max(0, Math.floor(Number(value) || 0));

function createEntry(section, id, discovered = false) {
  return { section, id, discovered, encounters: discovered ? 1 : 0, defeats: 0, uses: 0, weaknessUnlocked: false, mastery: discovered ? 1 : 0, firstSeenAt: discovered ? Date.now() : 0 };
}

export function createDefaultCodexProgress() {
  const entries = {};
  for (const section of CODEX_SECTION_ORDER) {
    for (const entry of getCodexEntries(section)) {
      const autoDiscover = section === 'world' || section === 'effect';
      entries[entryKey(section, entry.id)] = createEntry(section, entry.id, autoDiscover);
    }
  }
  return { version: 1, entries, loot: {}, lastUpdatedAt: Date.now() };
}

function masteryFor(section, record) {
  const value = section === 'guardian' ? record.uses : record.defeats;
  const thresholds = section === 'boss' ? [1, 3, 10, 25] : section === 'guardian' ? [1, 3, 10, 30] : [1, 5, 20, 60];
  let tier = record.discovered ? 1 : 0;
  thresholds.forEach((threshold, index) => { if (value >= threshold) tier = index + 1; });
  return Math.min(4, tier);
}

function migrateProgress(raw) {
  const fallback = createDefaultCodexProgress();
  if (!raw || typeof raw !== 'object') return fallback;
  for (const [key, base] of Object.entries(fallback.entries)) {
    const source = raw.entries?.[key];
    if (!source || typeof source !== 'object') continue;
    base.discovered = Boolean(source.discovered);
    base.encounters = normaliseCount(source.encounters);
    base.defeats = normaliseCount(source.defeats);
    base.uses = normaliseCount(source.uses);
    base.weaknessUnlocked = Boolean(source.weaknessUnlocked);
    base.firstSeenAt = normaliseCount(source.firstSeenAt);
    base.mastery = masteryFor(base.section, base);
  }
  for (const id of Object.keys(LOOT_CATALOG)) fallback.loot[id] = normaliseCount(raw.loot?.[id]);
  fallback.lastUpdatedAt = normaliseCount(raw.lastUpdatedAt) || Date.now();
  return fallback;
}

export function loadCodexProgress(storage = globalThis.localStorage) {
  try { return migrateProgress(JSON.parse(storage?.getItem?.(CODEX_STORAGE_KEY) || 'null')); }
  catch { return createDefaultCodexProgress(); }
}

export function saveCodexProgress(progress, storage = globalThis.localStorage) {
  progress.lastUpdatedAt = Date.now();
  try { storage?.setItem?.(CODEX_STORAGE_KEY, JSON.stringify(progress)); }
  catch {}
}

function ensureRecord(progress, section, id) {
  const key = entryKey(section, id);
  if (!progress.entries[key]) progress.entries[key] = createEntry(section, id, false);
  return progress.entries[key];
}

export function recordCodexEncounter(progress, section, id) {
  const record = ensureRecord(progress, section, id);
  const newDiscovery = !record.discovered;
  record.discovered = true;
  record.encounters += 1;
  if (!record.firstSeenAt) record.firstSeenAt = Date.now();
  record.mastery = masteryFor(section, record);
  return { record, newDiscovery, mastery: record.mastery };
}

export function recordGuardianUse(progress, id) {
  const result = recordCodexEncounter(progress, 'guardian', id);
  const before = result.record.mastery;
  result.record.uses += 1;
  result.record.mastery = masteryFor('guardian', result.record);
  return { ...result, masteryChanged: result.record.mastery > before };
}

export function recordCodexDefeat(progress, section, id, random = Math.random) {
  const record = ensureRecord(progress, section, id);
  const newDiscovery = !record.discovered;
  if (newDiscovery) {
    record.discovered = true;
    record.encounters += 1;
    record.firstSeenAt = record.firstSeenAt || Date.now();
  }
  const beforeMastery = record.mastery;
  record.defeats += 1;
  const research = ENEMY_RESEARCH[id];
  const weaknessThreshold = section === 'boss' ? 1 : 3;
  const newWeakness = Boolean(research && !record.weaknessUnlocked && record.defeats >= weaknessThreshold);
  if (newWeakness) record.weaknessUnlocked = true;
  record.mastery = masteryFor(section, record);

  const drops = [];
  for (const rule of ENEMY_LOOT_TABLES[id] || []) {
    const current = normaliseCount(progress.loot[rule.id]);
    if (rule.firstOnly && current > 0) continue;
    if (random() <= rule.chance) {
      progress.loot[rule.id] = current + 1;
      drops.push({ id: rule.id, count: progress.loot[rule.id], ...LOOT_CATALOG[rule.id], first: current === 0 });
    }
  }
  return { record, newDiscovery, newWeakness, drops, masteryChanged: record.mastery > beforeMastery };
}

export function getCodexKnowledge(progress, section, id) {
  const record = ensureRecord(progress, section, id);
  const research = ENEMY_RESEARCH[id] || null;
  const loot = (ENEMY_LOOT_TABLES[id] || []).map((rule) => ({ id: rule.id, count: normaliseCount(progress.loot[rule.id]), ...LOOT_CATALOG[rule.id] }));
  return { ...record, research, loot };
}

export function getWeaknessDamageBonus(progress, enemyType, attackerType) {
  const record = ensureRecord(progress, ENEMY_RESEARCH[enemyType] ? (['tiger', 'serpent', 'king'].includes(enemyType) ? 'boss' : 'monster') : 'monster', enemyType);
  const research = ENEMY_RESEARCH[enemyType];
  if (!research || !record.weaknessUnlocked || research.weakTo !== attackerType) return 1;
  return research.multiplier;
}

export function getCodexProgressSummary(progress) {
  const records = Object.values(progress.entries || {});
  const discoverable = records.length;
  const discovered = records.filter((record) => record.discovered).length;
  const weaknessTotal = Object.keys(ENEMY_RESEARCH).length;
  const weaknesses = records.filter((record) => record.weaknessUnlocked).length;
  const lootOwned = Object.values(progress.loot || {}).filter((count) => normaliseCount(count) > 0).length;
  const lootTotal = Object.keys(LOOT_CATALOG).length;
  const mastery = records.reduce((sum, record) => sum + normaliseCount(record.mastery), 0);
  return { discovered, discoverable, weaknesses, weaknessTotal, lootOwned, lootTotal, mastery };
}

export function getWeaknessLabel(enemyType) {
  const research = ENEMY_RESEARCH[enemyType];
  if (!research) return '';
  return `${UNIT_TYPES[research.weakTo]?.symbol || '✦'} ${UNIT_TYPES[research.weakTo]?.name || research.weakTo}`;
}
