export const GUARDIAN_COUNCIL_VERSION = '1.0.0';
export const GUARDIAN_COUNCIL_STORAGE_KEY = 'dokkaebi-guardian-council-v1';

export const GUARDIAN_COUNCIL_SUPPORTS = Object.freeze({
  warrior: Object.freeze({ id: 'warrior', icon: '◆', name: '철벽 호위', role: '수호', description: '신목 피해를 줄이고 대장 공격을 안정화합니다.', modifiers: Object.freeze({ coreDamage: .95, heroDamage: 1.02 }) }),
  archer: Object.freeze({ id: 'archer', icon: '➶', name: '월영 척후', role: '사냥', description: '보스 추적과 치명타 기회를 강화합니다.', modifiers: Object.freeze({ bossDamage: 1.05, critChanceBonus: .025 }) }),
  mage: Object.freeze({ id: 'mage', icon: '✦', name: '원소 참모', role: '증폭', description: '기술과 원소 반응의 폭발력을 높입니다.', modifiers: Object.freeze({ reactionDamage: 1.1, skillDamage: 1.03 }) }),
  taoist: Object.freeze({ id: 'taoist', icon: '符', name: '봉인 도사', role: '제어', description: '상태이상의 지속과 위력을 높입니다.', modifiers: Object.freeze({ statusDuration: 1.12, statusPotency: 1.08 }) }),
  shaman: Object.freeze({ id: 'shaman', icon: '鈴', name: '신목 무당', role: '회복', description: '신목 회복과 혼불 획득을 강화합니다.', modifiers: Object.freeze({ coreHealing: 1.18, soulGain: 1.05 }) })
});

const BONDS = Object.freeze({
  'archer|archer': Object.freeze({ id: 'pure-moonhunt', icon: '☾', name: '월영 쌍수', description: '보스 피해와 치명타 집중', modifiers: Object.freeze({ bossDamage: 1.07, critChanceBonus: .02 }) }),
  'archer|mage': Object.freeze({ id: 'starfall-arrow', icon: '✧', name: '별똥 화살', description: '기술 피해와 원소 반응 연계', modifiers: Object.freeze({ skillDamage: 1.04, reactionDamage: 1.06 }) }),
  'archer|shaman': Object.freeze({ id: 'spirit-hunt', icon: '靈', name: '신령 사냥', description: '보스 사냥 중 혼불 회수', modifiers: Object.freeze({ bossDamage: 1.04, soulGain: 1.05 }) }),
  'archer|taoist': Object.freeze({ id: 'seal-shot', icon: '封', name: '봉인 사격', description: '상태이상과 약점 집중', modifiers: Object.freeze({ statusPotency: 1.07, bossDamage: 1.03 }) }),
  'archer|warrior': Object.freeze({ id: 'moon-vanguard', icon: '月', name: '월광 선봉', description: '안정적인 공격과 보스 돌파', modifiers: Object.freeze({ heroDamage: 1.03, bossDamage: 1.04 }) }),
  'mage|mage': Object.freeze({ id: 'pure-conduit', icon: '∞', name: '원소 쌍맥', description: '반응 피해와 기술 위력 극대화', modifiers: Object.freeze({ reactionDamage: 1.1, skillDamage: 1.05 }) }),
  'mage|shaman': Object.freeze({ id: 'ancestral-flame', icon: '魂', name: '신령 원소굿', description: '기술과 혼불 순환 강화', modifiers: Object.freeze({ skillDamage: 1.03, soulGain: 1.06 }) }),
  'mage|taoist': Object.freeze({ id: 'five-element-seal', icon: '五', name: '오행 봉진', description: '원소 반응과 상태 제어 강화', modifiers: Object.freeze({ reactionDamage: 1.07, statusDuration: 1.09 }) }),
  'mage|warrior': Object.freeze({ id: 'spellblade', icon: '刃', name: '혼불 마검', description: '대장 공격과 기술의 균형', modifiers: Object.freeze({ heroDamage: 1.03, skillDamage: 1.04 }) }),
  'shaman|shaman': Object.freeze({ id: 'pure-ritual', icon: '祭', name: '쌍신 굿판', description: '회복과 혼불 수급 극대화', modifiers: Object.freeze({ coreHealing: 1.25, soulGain: 1.08 }) }),
  'shaman|taoist': Object.freeze({ id: 'guardian-ward', icon: '護', name: '신령 결계', description: '신목 보호와 상태 제어', modifiers: Object.freeze({ coreDamage: .96, statusDuration: 1.08 }) }),
  'shaman|warrior': Object.freeze({ id: 'ancestral-guard', icon: '盾', name: '선조의 방패', description: '신목 방어와 대장 생존력 강화', modifiers: Object.freeze({ coreDamage: .95, coreHealing: 1.12 }) }),
  'taoist|taoist': Object.freeze({ id: 'pure-seal', icon: '禁', name: '백귀 대봉진', description: '상태이상 지속과 위력 극대화', modifiers: Object.freeze({ statusDuration: 1.16, statusPotency: 1.1 }) }),
  'taoist|warrior': Object.freeze({ id: 'warded-club', icon: '鎭', name: '진압 방망이', description: '대장 피해와 상태 제어', modifiers: Object.freeze({ heroDamage: 1.03, statusPotency: 1.07 }) }),
  'warrior|warrior': Object.freeze({ id: 'pure-bulwark', icon: '山', name: '쌍철벽', description: '신목 방어와 대장 피해 강화', modifiers: Object.freeze({ coreDamage: .94, heroDamage: 1.05 }) })
});

const MULTIPLICATIVE_KEYS = new Set([
  'heroDamage', 'skillDamage', 'moveSpeed', 'bossDamage', 'coreDamage', 'coreHealing',
  'reactionDamage', 'statusDuration', 'statusPotency', 'soulGain'
]);

const keyFor = (leaderId, supportId) => [leaderId, supportId].sort().join('|');

export function getCouncilSupport(id = 'shaman') {
  return GUARDIAN_COUNCIL_SUPPORTS[id] || GUARDIAN_COUNCIL_SUPPORTS.shaman;
}

export function getCouncilBond(leaderId = 'warrior', supportId = 'shaman') {
  return BONDS[keyFor(leaderId, supportId)] || BONDS['shaman|warrior'];
}

export function resolveGuardianCouncil(leaderId = 'warrior', supportId = 'shaman') {
  const support = getCouncilSupport(supportId);
  const bond = getCouncilBond(leaderId, support.id);
  return Object.freeze({ version: GUARDIAN_COUNCIL_VERSION, leaderId, support, bond });
}

export function applyGuardianCouncilModifiers(mods, leaderId = 'warrior', supportId = 'shaman') {
  const council = resolveGuardianCouncil(leaderId, supportId);
  for (const source of [council.support.modifiers, council.bond.modifiers]) {
    for (const [key, value] of Object.entries(source)) {
      if (MULTIPLICATIVE_KEYS.has(key)) mods[key] = Number(mods[key] ?? 1) * Number(value);
      else mods[key] = Number(mods[key] ?? 0) + Number(value);
    }
  }
  return council;
}

export function sanitizeCouncilSupportId(id) {
  return GUARDIAN_COUNCIL_SUPPORTS[id] ? id : 'shaman';
}

export const GUARDIAN_COUNCIL_SUMMARY = Object.freeze({
  version: GUARDIAN_COUNCIL_VERSION,
  supportCount: Object.keys(GUARDIAN_COUNCIL_SUPPORTS).length,
  bondCount: Object.keys(BONDS).length,
  supportIds: Object.freeze(Object.keys(GUARDIAN_COUNCIL_SUPPORTS)),
  bondIds: Object.freeze(Object.values(BONDS).map((entry) => entry.id))
});
