export const EQUIPMENT_STORAGE_KEY = 'dokkaebi-equipment-v1';

export const EQUIPMENT_SLOTS = Object.freeze([
  Object.freeze({ id: 'weapon', name: '무기', icon: '⚔' }),
  Object.freeze({ id: 'charm', name: '부적', icon: '◆' }),
  Object.freeze({ id: 'boots', name: '신발', icon: '➶' })
]);

export const EQUIPMENT_RARITIES = Object.freeze({
  common: Object.freeze({ id: 'common', name: '일반', rank: 1, color: '#aeb5c1' }),
  rare: Object.freeze({ id: 'rare', name: '희귀', rank: 2, color: '#64a9ff' }),
  epic: Object.freeze({ id: 'epic', name: '영웅', rank: 3, color: '#b46dff' }),
  legendary: Object.freeze({ id: 'legendary', name: '전설', rank: 4, color: '#ffad4f' }),
  mythic: Object.freeze({ id: 'mythic', name: '신화', rank: 5, color: '#ff5e73' })
});

export const EQUIPMENT_ITEMS = Object.freeze([
  Object.freeze({ id: 'moon-club', slot: 'weapon', rarity: 'common', icon: '봉', name: '달무늬 방망이', desc: '대장 피해 +6%', bonuses: Object.freeze({ heroDamage: 1.06 }) }),
  Object.freeze({ id: 'jade-edge', slot: 'weapon', rarity: 'rare', icon: '검', name: '비취 혼불검', desc: '대장 피해 +10% · 기술 피해 +5%', bonuses: Object.freeze({ heroDamage: 1.1, skillDamage: 1.05 }) }),
  Object.freeze({ id: 'thunder-weapon', slot: 'weapon', rarity: 'epic', icon: '뢰', name: '뇌운 신장병', desc: '대장 피해 +14% · 보스 피해 +8%', bonuses: Object.freeze({ heroDamage: 1.14, bossDamage: 1.08 }) }),
  Object.freeze({ id: 'tree-knot', slot: 'charm', rarity: 'common', icon: '목', name: '신목 매듭부', desc: '엽전 회수 범위 +0.35', bonuses: Object.freeze({ pickupRadius: .35 }) }),
  Object.freeze({ id: 'fox-bead', slot: 'charm', rarity: 'rare', icon: '호', name: '구미호 여의주', desc: '기술 피해 +10% · 혼불 획득 +6%', bonuses: Object.freeze({ skillDamage: 1.1, soulGain: 1.06 }) }),
  Object.freeze({ id: 'sun-seal', slot: 'charm', rarity: 'legendary', icon: '해', name: '천계 금빛부', desc: '대장 피해 +12% · 기술 피해 +12%', bonuses: Object.freeze({ heroDamage: 1.12, skillDamage: 1.12 }) }),
  Object.freeze({ id: 'cloud-shoes', slot: 'boots', rarity: 'common', icon: '운', name: '구름 짚신', desc: '이동 속도 +5%', bonuses: Object.freeze({ moveSpeed: 1.05 }) }),
  Object.freeze({ id: 'tiger-step', slot: 'boots', rarity: 'rare', icon: '호', name: '호랑이 발걸음', desc: '이동 속도 +8% · 질주 재사용 -6%', bonuses: Object.freeze({ moveSpeed: 1.08, dashCooldown: .94 }) }),
  Object.freeze({ id: 'star-path', slot: 'boots', rarity: 'mythic', icon: '성', name: '별길 비단신', desc: '이동 속도 +12% · 질주 재사용 -12%', bonuses: Object.freeze({ moveSpeed: 1.12, dashCooldown: .88 }) })
]);

const ITEM_BY_ID = Object.freeze(Object.fromEntries(EQUIPMENT_ITEMS.map((item) => [item.id, item])));
const DEFAULT_OWNED = Object.freeze(['moon-club', 'tree-knot', 'cloud-shoes']);
const DEFAULT_EQUIPPED = Object.freeze({ weapon: 'moon-club', charm: 'tree-knot', boots: 'cloud-shoes' });

export function getEquipmentItem(id) {
  return ITEM_BY_ID[id] || null;
}

export function createDefaultEquipmentState() {
  return { owned: [...DEFAULT_OWNED], equipped: { ...DEFAULT_EQUIPPED }, essence: 0, drops: 0 };
}

export function sanitizeEquipmentState(raw) {
  const base = createDefaultEquipmentState();
  const owned = new Set(Array.isArray(raw?.owned) ? raw.owned.filter((id) => ITEM_BY_ID[id]) : base.owned);
  DEFAULT_OWNED.forEach((id) => owned.add(id));
  const equipped = { ...base.equipped };
  for (const slot of EQUIPMENT_SLOTS) {
    const candidate = raw?.equipped?.[slot.id];
    if (candidate && ITEM_BY_ID[candidate]?.slot === slot.id && owned.has(candidate)) equipped[slot.id] = candidate;
  }
  return {
    owned: [...owned],
    equipped,
    essence: Math.max(0, Math.floor(Number(raw?.essence) || 0)),
    drops: Math.max(0, Math.floor(Number(raw?.drops) || 0))
  };
}

export function loadEquipmentState(storage = globalThis.localStorage) {
  try { return sanitizeEquipmentState(JSON.parse(storage?.getItem(EQUIPMENT_STORAGE_KEY) || 'null')); }
  catch { return createDefaultEquipmentState(); }
}

export function saveEquipmentState(state, storage = globalThis.localStorage) {
  const sanitized = sanitizeEquipmentState(state);
  try { storage?.setItem(EQUIPMENT_STORAGE_KEY, JSON.stringify(sanitized)); } catch {}
  return sanitized;
}

export function equipItem(state, itemId) {
  const next = sanitizeEquipmentState(state);
  const item = getEquipmentItem(itemId);
  if (!item || !next.owned.includes(itemId)) return next;
  next.equipped[item.slot] = itemId;
  return next;
}

export function getEquippedItems(state) {
  const clean = sanitizeEquipmentState(state);
  return EQUIPMENT_SLOTS.map((slot) => getEquipmentItem(clean.equipped[slot.id])).filter(Boolean);
}

export function getEquipmentBonuses(state) {
  const totals = {
    heroDamage: 1, skillDamage: 1, moveSpeed: 1, dashCooldown: 1,
    soulGain: 1, bossDamage: 1, pickupRadius: 0
  };
  for (const item of getEquippedItems(state)) {
    for (const [key, value] of Object.entries(item.bonuses || {})) {
      if (key === 'pickupRadius') totals.pickupRadius += value;
      else totals[key] *= value;
    }
  }
  return Object.freeze(totals);
}

export function applyEquipmentBonuses(mods, state) {
  const bonuses = getEquipmentBonuses(state);
  mods.heroDamage *= bonuses.heroDamage;
  mods.skillDamage *= bonuses.skillDamage;
  mods.moveSpeed *= bonuses.moveSpeed;
  mods.dashCooldown *= bonuses.dashCooldown;
  mods.soulGain *= bonuses.soulGain;
  mods.bossDamage *= bonuses.bossDamage;
  mods.pickupRadius += bonuses.pickupRadius;
  return bonuses;
}

export function awardEquipmentDrop(state, { wave = 0, won = false, random = Math.random } = {}) {
  const next = sanitizeEquipmentState(state);
  const eligibleRank = won ? 5 : wave >= 8 ? 4 : wave >= 5 ? 3 : 2;
  const candidates = EQUIPMENT_ITEMS.filter((item) => EQUIPMENT_RARITIES[item.rarity].rank <= eligibleRank);
  const roll = Math.min(.999999, Math.max(0, Number(random()) || 0));
  const item = candidates[Math.floor(roll * candidates.length)] || EQUIPMENT_ITEMS[0];
  const duplicate = next.owned.includes(item.id);
  if (duplicate) next.essence += EQUIPMENT_RARITIES[item.rarity].rank * 6;
  else next.owned.push(item.id);
  next.drops += 1;
  return Object.freeze({ state: next, item, duplicate, essence: duplicate ? EQUIPMENT_RARITIES[item.rarity].rank * 6 : 0 });
}
