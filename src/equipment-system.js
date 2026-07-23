export const EQUIPMENT_STORAGE_KEY = 'dokkaebi-equipment-v1';
export const EQUIPMENT_FORGE_MAX_LEVEL = 5;

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
  Object.freeze({ id: 'moon-club', slot: 'weapon', rarity: 'common', icon: '봉', iconImage: 'assets/ip-v13/crops/weapons/weapons-r01-c01.png', name: '달무늬 방망이', desc: '대장 피해 +6%', bonuses: Object.freeze({ heroDamage: 1.06 }) }),
  Object.freeze({ id: 'jade-edge', slot: 'weapon', rarity: 'rare', icon: '검', iconImage: 'assets/ip-v13/crops/weapons/weapons-r01-c06.png', name: '비취 혼불검', desc: '대장 피해 +10% · 기술 피해 +5%', bonuses: Object.freeze({ heroDamage: 1.1, skillDamage: 1.05 }) }),
  Object.freeze({ id: 'thunder-weapon', slot: 'weapon', rarity: 'epic', icon: '뢰', iconImage: 'assets/ip-v13/crops/weapons/weapons-r02-c05.png', name: '뇌운 신장병', desc: '대장 피해 +14% · 보스 피해 +8%', bonuses: Object.freeze({ heroDamage: 1.14, bossDamage: 1.08 }) }),
  Object.freeze({ id: 'tree-knot', slot: 'charm', rarity: 'common', icon: '목', iconImage: 'assets/ip-v13/crops/items/items-r01-c02.png', name: '신목 매듭부', desc: '엽전 회수 범위 +0.35', bonuses: Object.freeze({ pickupRadius: .35 }) }),
  Object.freeze({ id: 'fox-bead', slot: 'charm', rarity: 'rare', icon: '호', iconImage: 'assets/ip-v13/crops/items/items-r01-c04.png', name: '구미호 여의주', desc: '기술 피해 +10% · 혼불 획득 +6%', bonuses: Object.freeze({ skillDamage: 1.1, soulGain: 1.06 }) }),
  Object.freeze({ id: 'sun-seal', slot: 'charm', rarity: 'legendary', icon: '해', iconImage: 'assets/ip-v13/crops/items/items-r05-c03.png', name: '천계 금빛부', desc: '대장 피해 +12% · 기술 피해 +12%', bonuses: Object.freeze({ heroDamage: 1.12, skillDamage: 1.12 }) }),
  Object.freeze({ id: 'cloud-shoes', slot: 'boots', rarity: 'common', icon: '운', iconImage: 'assets/ip-v13/crops/ui/ui-r05-c10.png', name: '구름 짚신', desc: '이동 속도 +5%', bonuses: Object.freeze({ moveSpeed: 1.05 }) }),
  Object.freeze({ id: 'tiger-step', slot: 'boots', rarity: 'rare', icon: '호', iconImage: 'assets/ip-v13/crops/items/items-r05-c01.png', name: '호랑이 발걸음', desc: '이동 속도 +8% · 질주 재사용 -6%', bonuses: Object.freeze({ moveSpeed: 1.08, dashCooldown: .94 }) }),
  Object.freeze({ id: 'star-path', slot: 'boots', rarity: 'mythic', icon: '성', iconImage: 'assets/ip-v13/crops/ui/ui-r07-c07.png', name: '별길 비단신', desc: '이동 속도 +12% · 질주 재사용 -12%', bonuses: Object.freeze({ moveSpeed: 1.12, dashCooldown: .88 }) })
]);

const ITEM_BY_ID = Object.freeze(Object.fromEntries(EQUIPMENT_ITEMS.map((item) => [item.id, item])));
const DEFAULT_OWNED = Object.freeze(['moon-club', 'tree-knot', 'cloud-shoes']);
const DEFAULT_EQUIPPED = Object.freeze({ weapon: 'moon-club', charm: 'tree-knot', boots: 'cloud-shoes' });

export function getEquipmentItem(id) {
  return ITEM_BY_ID[id] || null;
}

export function createDefaultEquipmentState() {
  return { owned: [...DEFAULT_OWNED], equipped: { ...DEFAULT_EQUIPPED }, upgrades: {}, essence: 0, drops: 0, forged: 0 };
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
  const upgrades = {};
  for (const id of owned) {
    const level = Math.max(0, Math.min(EQUIPMENT_FORGE_MAX_LEVEL, Math.floor(Number(raw?.upgrades?.[id]) || 0)));
    if (level > 0) upgrades[id] = level;
  }
  return {
    owned: [...owned],
    equipped,
    upgrades,
    essence: Math.max(0, Math.floor(Number(raw?.essence) || 0)),
    drops: Math.max(0, Math.floor(Number(raw?.drops) || 0)),
    forged: Math.max(0, Math.floor(Number(raw?.forged) || 0))
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

export function getEquipmentForgeLevel(state, itemId) {
  const clean = sanitizeEquipmentState(state);
  return Math.max(0, Math.min(EQUIPMENT_FORGE_MAX_LEVEL, Number(clean.upgrades?.[itemId]) || 0));
}

export function getEquipmentForgeCost(item, level = 0) {
  const target = typeof item === 'string' ? getEquipmentItem(item) : item;
  if (!target) return Infinity;
  const current = Math.max(0, Math.min(EQUIPMENT_FORGE_MAX_LEVEL, Math.floor(Number(level) || 0)));
  if (current >= EQUIPMENT_FORGE_MAX_LEVEL) return 0;
  const rank = EQUIPMENT_RARITIES[target.rarity]?.rank || 1;
  return rank * 8 * (current + 1);
}

export function forgeEquipmentItem(state, itemId) {
  const next = sanitizeEquipmentState(state);
  const item = getEquipmentItem(itemId);
  if (!item || !next.owned.includes(itemId)) return Object.freeze({ state: next, upgraded: false, reason: 'not-owned', item, cost: 0, level: 0 });
  const level = getEquipmentForgeLevel(next, itemId);
  if (level >= EQUIPMENT_FORGE_MAX_LEVEL) return Object.freeze({ state: next, upgraded: false, reason: 'max-level', item, cost: 0, level });
  const cost = getEquipmentForgeCost(item, level);
  if (next.essence < cost) return Object.freeze({ state: next, upgraded: false, reason: 'insufficient-essence', item, cost, level });
  next.essence -= cost;
  next.upgrades[itemId] = level + 1;
  next.forged += 1;
  return Object.freeze({ state: next, upgraded: true, reason: 'upgraded', item, cost, level: level + 1 });
}

export function getEquipmentBonuses(state) {
  const totals = {
    heroDamage: 1, skillDamage: 1, moveSpeed: 1, dashCooldown: 1,
    soulGain: 1, bossDamage: 1, pickupRadius: 0
  };
  const clean = sanitizeEquipmentState(state);
  for (const item of getEquippedItems(clean)) {
    const level = getEquipmentForgeLevel(clean, item.id);
    const forgeScale = 1 + level * .18;
    for (const [key, value] of Object.entries(item.bonuses || {})) {
      if (key === 'pickupRadius') totals.pickupRadius += value * (1 + level * .2);
      else totals[key] *= 1 + (Number(value) - 1) * forgeScale;
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
