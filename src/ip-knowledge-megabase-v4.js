export const IP_KNOWLEDGE_MEGABASE_VERSION = '4.0.0';
export const IP_KNOWLEDGE_STYLE_LOCK = 'DD-ABSOLUTE-ART-BIBLE-2.0';
export const IP_KNOWLEDGE_LIBRARY_URL = './ip-mega-library-v4.html';

export const IP_KNOWLEDGE_BASE_COUNTS = Object.freeze({
  heroes: 176,
  guardians: 88,
  monsters: 352,
  bosses: 64,
  towers: 176,
  weapons: 512,
  skills: 1024,
  vfx: 2048,
  ui: 1024,
  environment: 2048,
  audio: 680
});

export const IP_KNOWLEDGE_RECORD_COUNTS = Object.freeze({
  baseAssets: 8192,
  directionalMotion: 89232,
  towerStateActions: 10560,
  hudContracts: 480,
  visualQaScenarios: 5040,
  performanceProfiles: 960,
  knowledgeRelations: 32768,
  total: 147232
});

const directionLabels = [
  '\uc815\uba74', '\uc6b0\uc804\ubc29 1', '\uc6b0\uc804\ubc29 2', '\uc6b0\uce21', '\uc6b0\ud6c4\ubc29 1', '\uc6b0\ud6c4\ubc29 2',
  '\ud6c4\uba74', '\uc88c\ud6c4\ubc29 2', '\uc88c\ud6c4\ubc29 1', '\uc88c\uce21', '\uc88c\uc804\ubc29'
];

export const AUTHORED_DIRECTIONS_V4 = Object.freeze(Array.from({ length: 11 }, (_, index) => Object.freeze({
  index,
  id: `d${String(index).padStart(2, '0')}`,
  degrees: Number(((index * 360) / 11).toFixed(3)),
  label: directionLabels[index],
  authored: true,
  mirroringAllowed: false
})));

export const HERO_ACTIONS_V4 = Object.freeze([
  'idle', 'walk', 'run', 'attack-primary', 'attack-secondary', 'skill-1', 'skill-2',
  'ultimate', 'hit-light', 'hit-heavy', 'guard-break', 'death', 'victory', 'spawn'
]);

export const MONSTER_ACTIONS_V4 = Object.freeze([
  'idle', 'walk', 'run', 'attack', 'special', 'roar', 'hit', 'break', 'death', 'spawn'
]);

export const GUARDIAN_CITADEL_STATES_V4 = Object.freeze({
  growthTiers: Object.freeze(['seed', 'awakened', 'fortified', 'mythic', 'sovereign']),
  damageStates: Object.freeze(['normal', 'hit-crack', 'critical', 'broken']),
  actionModes: Object.freeze(['idle-pulse', 'defense-cast', 'emergency-burst'])
});

export const WORLD_HP_STATUS_V4 = Object.freeze([
  Object.freeze({ id: 'shield', label: '\ubcf4\ud638\ub9c9', lane: 'overlay', priority: 1 }),
  Object.freeze({ id: 'break', label: '\ube0c\ub808\uc774\ud06c', lane: 'secondary', priority: 2 }),
  Object.freeze({ id: 'stun', label: '\uae30\uc808', lane: 'status', priority: 3 }),
  Object.freeze({ id: 'poison', label: '\uc911\ub3c5', lane: 'status', priority: 4 }),
  Object.freeze({ id: 'burn', label: '\ud654\uc0c1', lane: 'status', priority: 5 }),
  Object.freeze({ id: 'freeze', label: '\ube59\uacb0', lane: 'status', priority: 6 }),
  Object.freeze({ id: 'shock', label: '\uac10\uc804', lane: 'status', priority: 7 }),
  Object.freeze({ id: 'curse', label: '\uc800\uc8fc', lane: 'status', priority: 8 })
]);

export const ACTION_TIMING_PRESETS_V4 = Object.freeze({
  melee: Object.freeze({ windup: 0.18, active: 0.10, recovery: 0.26, impactNormalized: 0.39, cancelAfterNormalized: 0.62 }),
  ranged: Object.freeze({ windup: 0.24, active: 0.06, recovery: 0.22, projectileNormalized: 0.42, cancelAfterNormalized: 0.68 }),
  magic: Object.freeze({ windup: 0.34, active: 0.14, recovery: 0.31, castNormalized: 0.44, impactNormalized: 0.66 }),
  roar: Object.freeze({ windup: 0.38, active: 0.22, recovery: 0.36, shockwaveNormalized: 0.56 }),
  tower: Object.freeze({ windup: 0.20, active: 0.08, recovery: 0.30, muzzleNormalized: 0.46 })
});

export const HUD_SHELLS_V4 = Object.freeze({
  pc: Object.freeze({ shell: 'three-lane-tactical', maxPrimaryBlocks: 7, maxSecondaryBlocks: 5, touchTargetPx: 36 }),
  mobile: Object.freeze({ shell: 'thumb-zone-combat', maxPrimaryBlocks: 4, maxSecondaryBlocks: 2, touchTargetPx: 48 })
});

export const IP_KNOWLEDGE_MEGABASE_SUMMARY = Object.freeze({
  version: IP_KNOWLEDGE_MEGABASE_VERSION,
  styleLockId: IP_KNOWLEDGE_STYLE_LOCK,
  authoredDirections: AUTHORED_DIRECTIONS_V4.length,
  mirroringAllowed: false,
  baseAssets: IP_KNOWLEDGE_RECORD_COUNTS.baseAssets,
  totalRecords: IP_KNOWLEDGE_RECORD_COUNTS.total,
  heroActions: HERO_ACTIONS_V4.length,
  monsterActions: MONSTER_ACTIONS_V4.length,
  publicLibraryUrl: IP_KNOWLEDGE_LIBRARY_URL,
  finalArtApproved: 0,
  knowledgeStatus: 'generated',
  finalArtStatus: 'planned'
});

export function resolveAuthoredDirectionV4(relativeRadians = 0) {
  const tau = Math.PI * 2;
  const normalized = ((Number(relativeRadians) % tau) + tau) % tau;
  const step = tau / AUTHORED_DIRECTIONS_V4.length;
  const index = Math.floor((normalized + step * 0.5) / step) % AUTHORED_DIRECTIONS_V4.length;
  return AUTHORED_DIRECTIONS_V4[index];
}
