import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import {
  ABSOLUTE_NEGATIVE_PROMPT,
  ABSOLUTE_STYLE_PROMPT,
  ART_STYLE_LOCK_ID
} from '../src/art-style-tokens.js';
import {
  ACTION_TIMING_PRESETS_V4,
  AUTHORED_DIRECTIONS_V4,
  GUARDIAN_CITADEL_STATES_V4,
  HERO_ACTIONS_V4,
  HUD_SHELLS_V4,
  IP_KNOWLEDGE_BASE_COUNTS,
  IP_KNOWLEDGE_MEGABASE_VERSION,
  IP_KNOWLEDGE_RECORD_COUNTS,
  MONSTER_ACTIONS_V4,
  WORLD_HP_STATUS_V4
} from '../src/ip-knowledge-megabase-v4.js';

const root = resolve(import.meta.dirname, '..');
const productionRoot = resolve(root, 'production/DokkaebiDefense/14_IP_Knowledge_Megabase');
const publicRoot = resolve(root, 'public/assets/ip-mega-v4/data');
const checkOnly = process.argv.includes('--check');
const VERSION = IP_KNOWLEDGE_MEGABASE_VERSION;
const schemaVersion = 4;
const generatedAt = '2026-07-24T08:40:00.000Z';
const shardSize = 4096;
const createdFiles = [];
const stableJson = (value) => `${JSON.stringify(value, null, 2)}\n`;
const sha256 = (value) => createHash('sha256').update(value).digest('hex');
const pad = (value, length = 4) => String(value).padStart(length, '0');
const slug = (value) => String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'asset';

function ensureCleanOutput() {
  if (checkOnly) return;
  rmSync(productionRoot, { recursive: true, force: true });
  rmSync(publicRoot, { recursive: true, force: true });
  mkdirSync(productionRoot, { recursive: true });
  mkdirSync(publicRoot, { recursive: true });
}

function writeText(relativePath, content, { publicFile = false, track = true } = {}) {
  const absolute = resolve(publicFile ? publicRoot : productionRoot, relativePath);
  if (checkOnly) {
    if (!existsSync(absolute)) throw new Error(`Missing generated file: ${absolute}`);
    if (readFileSync(absolute, 'utf8') !== content) throw new Error(`Stale generated file: ${absolute}`);
  } else {
    mkdirSync(dirname(absolute), { recursive: true });
    writeFileSync(absolute, content, 'utf8');
  }
  if (track && !publicFile) createdFiles.push({ path: relativePath, bytes: Buffer.byteLength(content), sha256: sha256(content) });
}

function writeJson(relativePath, value, options) {
  writeText(relativePath, stableJson(value), options);
}

function rarity(index) {
  const values = ['common', 'rare', 'epic', 'legend', 'mythic', 'immortal', 'god'];
  return values[Math.min(values.length - 1, Math.floor((index % 70) / 10))];
}

function priority(index, total) {
  const ratio = index / Math.max(1, total - 1);
  if (ratio < 0.08) return 'P0';
  if (ratio < 0.28) return 'P1';
  if (ratio < 0.64) return 'P2';
  return 'P3';
}

const stages = [
  { id: 'dokkaebi-village', ko: '\ub3c4\uae68\ube44\ub9c8\uc744', en: 'Dokkaebi Village' },
  { id: 'bamboo-forest', ko: '\ub300\ub098\ubb34\uc232', en: 'Bamboo Forest' },
  { id: 'ruined-temple', ko: '\ud3d0\uc0ac\ucc30', en: 'Ruined Temple' },
  { id: 'snow-mountain', ko: '\uc124\uc0b0', en: 'Snow Mountain' },
  { id: 'dragon-palace', ko: '\uc6a9\uad81', en: 'Dragon Palace' },
  { id: 'underworld', ko: '\uc800\uc2b9', en: 'Underworld' },
  { id: 'celestial-realm', ko: '\ucc9c\uacc4', en: 'Celestial Realm' }
];

const elements = [
  { id: 'fire', ko: '\ud654\uc5fc', en: 'Flame', palette: ['#ff744f', '#ffc95f', '#4a1831'] },
  { id: 'frost', ko: '\ube59\uacb0', en: 'Frost', palette: ['#78cfff', '#dff9ff', '#233a6f'] },
  { id: 'wind', ko: '\ubc14\ub78c', en: 'Wind', palette: ['#73efb5', '#d9ffcd', '#255b4d'] },
  { id: 'earth', ko: '\ub300\uc9c0', en: 'Earth', palette: ['#cf9c68', '#f1d29a', '#5c3d2a'] },
  { id: 'spirit', ko: '\ud63c\ub839', en: 'Spirit', palette: ['#c17aff', '#ffb4f7', '#47245e'] },
  { id: 'thunder', ko: '\ucc9c\ub465', en: 'Thunder', palette: ['#ffe76f', '#fff8c1', '#5d4b1e'] },
  { id: 'moon', ko: '\ub2ec\ube5b', en: 'Moon', palette: ['#9bb8ff', '#f3efff', '#30395f'] },
  { id: 'holy', ko: '\uc131\uad11', en: 'Holy', palette: ['#ffd879', '#fff6d4', '#6c5130'] },
  { id: 'poison', ko: '\ub3c5', en: 'Poison', palette: ['#7fe16c', '#d4ff76', '#2f5a2d'] },
  { id: 'shadow', ko: '\uadf8\ub9bc\uc790', en: 'Shadow', palette: ['#6f63a8', '#ae94ff', '#231b3d'] },
  { id: 'water', ko: '\ubb3c\uacb0', en: 'Water', palette: ['#56d8e9', '#c7fdff', '#20516b'] },
  { id: 'metal', ko: '\uae08\uac15', en: 'Metal', palette: ['#c7d1e0', '#ffe2a3', '#3d4554'] },
  { id: 'wood', ko: '\uc2e0\ubaa9', en: 'Sacred Wood', palette: ['#80cc76', '#d8f4a1', '#38543b'] },
  { id: 'crimson', ko: '\ud64d\ub828', en: 'Crimson Lotus', palette: ['#ff6681', '#ffc0ad', '#5a2038'] },
  { id: 'star', ko: '\ubcc4\ube5b', en: 'Starlight', palette: ['#a2a7ff', '#fff1a8', '#34366b'] },
  { id: 'void', ko: '\uacf5\ud5c8', en: 'Void', palette: ['#9a65e8', '#d694ff', '#25163f'] }
];

const heroFamilies = [
  { id: 'dokkaebi-warrior', ko: '\ub3c4\uae68\ube44 \uc804\uc0ac', en: 'Dokkaebi Warrior', role: 'melee', tool: 'club' },
  { id: 'dokkaebi-archer', ko: '\ub3c4\uae68\ube44 \uad81\uc218', en: 'Dokkaebi Archer', role: 'ranged', tool: 'bow' },
  { id: 'dokkaebi-mage', ko: '\ub3c4\uae68\ube44 \ubc95\uc0ac', en: 'Dokkaebi Mage', role: 'magic', tool: 'staff' },
  { id: 'taoist', ko: '\ub3c4\uc0ac', en: 'Taoist', role: 'magic', tool: 'talisman' },
  { id: 'shaman', ko: '\ubb34\ub2f9', en: 'Shaman', role: 'support', tool: 'bell' },
  { id: 'tiger-guardian', ko: '\ud638\ub791\uc774 \uc218\ud638\uc790', en: 'Tiger Guardian', role: 'melee', tool: 'gauntlet' },
  { id: 'haetae', ko: '\ud574\ud0dc', en: 'Haetae', role: 'tank', tool: 'horn' },
  { id: 'gumiho', ko: '\uad6c\ubbf8\ud638', en: 'Gumiho', role: 'magic', tool: 'orb' },
  { id: 'sanshin', ko: '\uc0b0\uc2e0\ub839', en: 'Mountain Spirit', role: 'summon', tool: 'branch' },
  { id: 'grim-reaper', ko: '\uc800\uc2b9\uc0ac\uc790', en: 'Grim Reaper', role: 'execute', tool: 'scythe' },
  { id: 'dragon', ko: '\uc6a9\uc2e0', en: 'Dragon Deity', role: 'ultimate', tool: 'dragon-orb' }
];

const guardianFamilies = [
  { id: 'moon-citadel', ko: '\uc6d4\uad11 \uc218\ud638\uc131', en: 'Moon Citadel', role: 'defense', tool: 'crystal' },
  { id: 'tiger-sentinel', ko: '\ud638\ub791 \uc218\ubb38\uc7a5', en: 'Tiger Sentinel', role: 'melee', tool: 'claw' },
  { id: 'haetae-warden', ko: '\ud574\ud0dc \uac10\uc2dc\uc790', en: 'Haetae Warden', role: 'tank', tool: 'shield' },
  { id: 'fox-oracle', ko: '\uc5ec\uc6b0 \uc2e0\ud0c1\uc790', en: 'Fox Oracle', role: 'support', tool: 'orb' },
  { id: 'dragon-ward', ko: '\uc6a9\ub9e5 \uc218\ud638\ub300', en: 'Dragon Ward', role: 'ranged', tool: 'lance' },
  { id: 'spirit-general', ko: '\ud63c\ub839 \uc7a5\uad70', en: 'Spirit General', role: 'control', tool: 'banner' },
  { id: 'mountain-keeper', ko: '\uc0b0\ub839 \uc9c0\ud0b4\uc774', en: 'Mountain Keeper', role: 'summon', tool: 'totem' },
  { id: 'underworld-judge', ko: '\uc800\uc2b9 \ud310\uad00', en: 'Underworld Judge', role: 'execute', tool: 'tablet' }
];

const monsterFamilies = [
  ['bomb-goblin', '\ud3ed\ud0c4 \ub3c4\uae68\ube44', 'Bomb Goblin', 'ranged', 'bomb'],
  ['blade-goblin', '\uce7c\ub0a0 \ub3c4\uae68\ube44', 'Blade Goblin', 'melee', 'blade'],
  ['fire-imp', '\ubd88\uaf43 \uc694\uad34', 'Fire Imp', 'magic', 'flame'],
  ['water-slime', '\ubb3c\ubc29\uc6b8 \uc2ac\ub77c\uc784', 'Water Slime', 'melee', 'body'],
  ['poison-slime', '\ub3c5\uc561 \uc2ac\ub77c\uc784', 'Poison Slime', 'control', 'body'],
  ['moon-ghost', '\ub2ec\uadf8\ub9bc\uc790 \uadc0\uc2e0', 'Moon Ghost', 'magic', 'spirit'],
  ['skeleton-soldier', '\ubc31\uace8 \ubb34\uc0ac', 'Skeleton Soldier', 'melee', 'sword'],
  ['mushroom-brute', '\ub3c5\ubc84\uc12f \uad34\uc218', 'Mushroom Brute', 'tank', 'cap'],
  ['curse-doll', '\uc800\uc8fc \uc778\ud615', 'Curse Doll', 'support', 'needle'],
  ['jade-spider', '\ube44\ucde8 \uac70\ubbf8', 'Jade Spider', 'control', 'fang'],
  ['iron-scorpion', '\ucca0\uac11 \uc804\uac08', 'Iron Scorpion', 'melee', 'tail']
].map(([id, ko, en, role, tool]) => ({ id, ko, en, role, tool }));

const bossFamilies = [
  ['blue-ogre-king', '\uccad\uadc0 \ub3c4\uae68\ube44\uc655', 'Blue Ogre King', 'melee', 'mace'],
  ['plague-taoist', '\uc5ed\ubcd1 \ub3c4\uc0ac', 'Plague Taoist', 'magic', 'talisman'],
  ['twin-dragon', '\uc30d\ub8e1', 'Twin Dragon', 'ultimate', 'breath'],
  ['stone-colossus', '\uc554\uc11d \uac70\uc778', 'Stone Colossus', 'tank', 'fist'],
  ['nine-tail-empress', '\uad6c\ubbf8\ud638 \uc5ec\uc81c', 'Nine Tail Empress', 'magic', 'orb'],
  ['underworld-king', '\uc800\uc2b9\ub300\uc655', 'Underworld King', 'execute', 'blade'],
  ['serpent-lord', '\uc774\ubb34\uae30 \uad70\uc8fc', 'Serpent Lord', 'control', 'breath'],
  ['thunder-general', '\ub1cc\uc815 \uc7a5\uad70', 'Thunder General', 'ranged', 'spear']
].map(([id, ko, en, role, tool]) => ({ id, ko, en, role, tool }));

const towerFamilies = [
  ['spirit-lantern', '\ud63c\ub839 \ub4f1\ub300', 'Spirit Lantern', 'magic', 'lantern'],
  ['arrow-pagoda', '\ud654\uc0b4 \uc11d\ud0d1', 'Arrow Pagoda', 'ranged', 'bow'],
  ['thunder-drum', '\ucc9c\ub465 \ubd81', 'Thunder Drum', 'control', 'drum'],
  ['guardian-gate', '\uc218\ud638 \ud64d\uc608\ubb38', 'Guardian Gate', 'tank', 'gate'],
  ['foxfire-shrine', '\uc5ec\uc6b0\ubd88 \uc0ac\ub2f9', 'Foxfire Shrine', 'magic', 'flame'],
  ['stone-bell', '\uc554\uc11d \ubc94\uc885', 'Stone Bell', 'melee', 'bell'],
  ['moon-well', '\ub2ec\ube5b \uc6b0\ubb3c', 'Moon Well', 'support', 'water'],
  ['talisman-obelisk', '\ubd80\uc801 \ube44\uc11d', 'Talisman Obelisk', 'control', 'talisman']
].map(([id, ko, en, role, tool]) => ({ id, ko, en, role, tool }));

const weaponFamilies = ['club', 'bow', 'staff', 'talisman', 'bell', 'sword', 'shield', 'spear', 'scythe', 'orb', 'fan', 'gauntlet', 'hammer', 'lance', 'blade', 'banner'];
const skillFamilies = ['slash', 'shot', 'cast', 'summon', 'roar', 'heal', 'shield', 'break', 'dash', 'execute', 'storm', 'burst', 'curse', 'freeze', 'burn', 'chain'];
const vfxFamilies = ['slash-arc', 'impact', 'projectile', 'muzzle', 'magic-circle', 'summon', 'aura', 'shield', 'break', 'status', 'critical', 'death', 'spawn', 'trail', 'ground-decal', 'boss-weakpoint'];
const uiFamilies = ['world-hp', 'boss-hp', 'skill-icon', 'unit-card', 'wave-chip', 'currency', 'status-icon', 'panel', 'button', 'tooltip', 'minimap', 'result'];
const environmentFamilies = ['ground', 'road', 'grass', 'rock', 'tree', 'shrine', 'bridge', 'fence', 'water', 'flower', 'lantern', 'torch', 'roof', 'gate', 'mist', 'sky'];
const audioFamilies = ['melee-hit', 'projectile', 'magic-cast', 'roar', 'tower-fire', 'status', 'ui', 'ambient', 'boss', 'victory'];

function categoryConfig() {
  return {
    heroes: { prefix: 'HERO', folder: '02_Characters/Heroes', families: heroFamilies, directions: 11, actions: 14 },
    guardians: { prefix: 'GUARD', folder: '02_Characters/Guardians', families: guardianFamilies, directions: 11, actions: 14 },
    monsters: { prefix: 'MON', folder: '03_Monsters/Normal', families: monsterFamilies, directions: 11, actions: 10 },
    bosses: { prefix: 'BOSS', folder: '04_Boss', families: bossFamilies, directions: 11, actions: 14 },
    towers: { prefix: 'TWR', folder: '08_Map/Towers', families: towerFamilies, directions: 0, actions: 5 },
    weapons: { prefix: 'WPN', folder: '02_Characters/Weapons', families: weaponFamilies.map((id) => ({ id, ko: id, en: id, role: 'equipment', tool: id })), directions: 0, actions: 0 },
    skills: { prefix: 'SKL', folder: '10_Animation/Skills', families: skillFamilies.map((id) => ({ id, ko: id, en: id, role: id, tool: 'skill' })), directions: 0, actions: 0 },
    vfx: { prefix: 'VFX', folder: '07_VFX', families: vfxFamilies.map((id) => ({ id, ko: id, en: id, role: 'effect', tool: 'vfx' })), directions: 0, actions: 0 },
    ui: { prefix: 'UI', folder: '05_UI', families: uiFamilies.map((id) => ({ id, ko: id, en: id, role: 'interface', tool: 'ui' })), directions: 0, actions: 0 },
    environment: { prefix: 'ENV', folder: '08_Map/Environment', families: environmentFamilies.map((id) => ({ id, ko: id, en: id, role: 'world', tool: 'prop' })), directions: 0, actions: 0 },
    audio: { prefix: 'AUD', folder: '09_Sound', families: audioFamilies.map((id) => ({ id, ko: id, en: id, role: 'audio', tool: 'audio' })), directions: 0, actions: 0 }
  };
}

function promptFor(category, family, element, role) {
  return `${ABSOLUTE_STYLE_PROMPT}\nASSET: ${element.ko} ${family.ko} / ${element.en} ${family.en}. CATEGORY: ${category}. ROLE: ${role}. Korean folklore fantasy, readable in 0.3 seconds, palette ${element.palette.join(' ')}, independent authored directions when required, feet-center anchor, separated action and VFX sockets, game-ready silhouette.`;
}

function technicalFor(category, config, family) {
  const directional = config.directions > 0;
  const textureTargets = { heroes: 12, guardians: 10, monsters: 8, bosses: 20, towers: 12, weapons: 6, skills: 4, vfx: 8, ui: 4, environment: 10, audio: 0 };
  return {
    anchor: directional ? 'feet-center' : category === 'ui' ? 'panel-center' : 'origin-center',
    colorSpace: category === 'audio' ? 'n/a' : 'sRGB',
    mobileReadable: true,
    authoredDirections: config.directions,
    actions: config.actions,
    sheet: directional ? { directions: config.directions, cell: [512, 512], fpsRange: [8, 24] } : null,
    tool: family.tool,
    hitPoints: directional ? ['head', 'chest', 'weapon', 'feet'] : category === 'towers' ? ['core', 'muzzle', 'base'] : [],
    gpu: { atlasGroup: category, targetTextureMB: textureTargets[category], batchable: !['bosses', 'audio'].includes(category) }
  };
}

function generateBaseAssets() {
  const configs = categoryConfig();
  const catalogs = {};
  for (const [category, count] of Object.entries(IP_KNOWLEDGE_BASE_COUNTS)) {
    const config = configs[category];
    const rows = [];
    for (let index = 0; index < count; index += 1) {
      const family = config.families[index % config.families.length];
      const element = elements[Math.floor(index / config.families.length) % elements.length];
      const stage = ['environment', 'towers', 'audio'].includes(category) ? stages[index % stages.length] : null;
      const number = index + 1;
      const id = `${config.prefix}-V4-${pad(number)}`;
      const role = family.role || category;
      const nameKo = `${element.ko} ${family.ko}${stage ? ` - ${stage.ko}` : ''}`;
      const nameEn = `${element.en} ${family.en}${stage ? ` - ${stage.en}` : ''}`;
      const extension = category === 'audio' ? 'ogg' : category === 'ui' ? 'webp' : 'png';
      rows.push({
        id,
        schemaVersion,
        megabaseVersion: VERSION,
        styleLockId: ART_STYLE_LOCK_ID,
        category,
        family: family.id,
        nameKo,
        nameEn,
        role,
        element: element.id,
        stage: stage?.id || null,
        rarity: rarity(index),
        priority: priority(index, count),
        knowledgeStatus: 'generated',
        artStatus: 'planned',
        productionApproved: false,
        authoredDirections: config.directions,
        mirroringAllowed: false,
        delivery: {
          path: `${config.folder}/${family.id}/${slug(element.en)}_${family.id}_${config.directions ? `${config.directions}dir` : 'master'}.${extension}`,
          format: extension,
          sourceLayersRequired: category !== 'audio',
          transparentBackground: !['environment', 'audio'].includes(category)
        },
        promptPack: { positive: promptFor(category, family, element, role), negative: `${ABSOLUTE_NEGATIVE_PROMPT}, mirrored duplicate direction, floating feet, unreadable role, baked UI text` },
        technical: technicalFor(category, config, family),
        tags: [category.slice(0, -1) || category, family.id, element.id, role, config.directions ? '11-direction-authored' : 'master-asset']
      });
    }
    if (rows.length !== count) throw new Error(`Base count mismatch ${category}`);
    catalogs[category] = rows;
  }
  return catalogs;
}

function writeShards(group, rows, directory) {
  const shards = [];
  for (let offset = 0, shard = 1; offset < rows.length; offset += shardSize, shard += 1) {
    const slice = rows.slice(offset, offset + shardSize);
    const relativePath = `${directory}/${group}-${pad(shard, 3)}.json`;
    writeJson(relativePath, { schemaVersion, megabaseVersion: VERSION, group, shard, offset, count: slice.length, rows: slice });
    shards.push({ path: relativePath, count: slice.length, firstId: slice[0]?.id || null, lastId: slice.at(-1)?.id || null });
  }
  return shards;
}

function timingFor(action, role, seed) {
  const isRoar = action === 'roar';
  const kind = isRoar ? 'roar' : role === 'ranged' ? 'ranged' : ['magic', 'support', 'control', 'summon', 'ultimate'].includes(role) ? 'magic' : 'melee';
  const base = ACTION_TIMING_PRESETS_V4[kind];
  const scale = 0.92 + (seed % 17) * 0.01;
  return {
    kind,
    windup: Number((base.windup * scale).toFixed(3)),
    active: Number((base.active * scale).toFixed(3)),
    recovery: Number((base.recovery * scale).toFixed(3)),
    duration: Number(((base.windup + base.active + base.recovery) * scale).toFixed(3)),
    impactNormalized: base.impactNormalized ?? base.projectileNormalized ?? base.shockwaveNormalized ?? 0.5,
    cancelAfterNormalized: base.cancelAfterNormalized ?? 0.72
  };
}

function generateMotion(catalogs) {
  const groups = [
    ['hero', catalogs.heroes, HERO_ACTIONS_V4],
    ['guardian', catalogs.guardians, HERO_ACTIONS_V4],
    ['monster', catalogs.monsters, MONSTER_ACTIONS_V4],
    ['boss', catalogs.bosses, HERO_ACTIONS_V4]
  ];
  const inventory = [];
  let total = 0;
  for (const [group, assets, actions] of groups) {
    const rows = [];
    assets.forEach((asset, assetIndex) => {
      AUTHORED_DIRECTIONS_V4.forEach((direction) => {
        actions.forEach((action, actionIndex) => {
          const timing = timingFor(action, asset.role, assetIndex + actionIndex + direction.index);
          const isImpact = /attack|skill|ultimate|roar|hit|break/.test(action);
          rows.push({
            id: `MOT-${group.toUpperCase()}-${pad(assetIndex + 1)}-${direction.id}-${action}`,
            entityId: asset.id,
            action,
            directionIndex: direction.index,
            directionDegrees: direction.degrees,
            directionLabel: direction.label,
            authored: true,
            mirrored: false,
            clipKey: `${asset.id.toLowerCase()}_${direction.id}_${action}`,
            frames: Math.max(6, Math.round(timing.duration * (action === 'idle' ? 8 : 18))),
            fps: action === 'idle' ? 8 : action.includes('death') ? 12 : 18,
            timing,
            anchor: 'feet-center-92-percent',
            sockets: ['root', 'head', 'chest', 'weapon', 'feet', 'vfx-origin'],
            vfxPolicy: isImpact ? 'timed-socket-event' : 'minimal',
            hitStopMs: isImpact ? 34 + ((assetIndex + actionIndex) % 5) * 9 : 0,
            productionApproved: false
          });
        });
      });
    });
    total += rows.length;
    inventory.push({ group, count: rows.length, shards: writeShards(`${group}-motion`, rows, 'motion') });
  }
  if (total !== IP_KNOWLEDGE_RECORD_COUNTS.directionalMotion) throw new Error(`Motion count expected ${IP_KNOWLEDGE_RECORD_COUNTS.directionalMotion}, got ${total}`);
  return inventory;
}

function generateTowerStateActions(catalogs) {
  const rows = [];
  catalogs.towers.forEach((tower, towerIndex) => {
    GUARDIAN_CITADEL_STATES_V4.growthTiers.forEach((growthTier, growthIndex) => {
      GUARDIAN_CITADEL_STATES_V4.damageStates.forEach((damageState, damageIndex) => {
        GUARDIAN_CITADEL_STATES_V4.actionModes.forEach((actionMode, actionIndex) => {
          rows.push({
            id: `TSTATE-${pad(towerIndex + 1)}-${growthTier}-${damageState}-${actionMode}`,
            towerId: tower.id,
            growthTier,
            damageState,
            actionMode,
            crackCoveragePercent: damageIndex * 22,
            emissivePulse: Number((0.3 + growthIndex * 0.12 + actionIndex * 0.08).toFixed(2)),
            debrisEnabled: damageIndex >= 2,
            emergencyColorShift: damageState === 'critical' || damageState === 'broken',
            hpBarMode: damageIndex >= 2 ? 'critical-expanded' : 'compact',
            gpuBudget: { particles: 18 + growthIndex * 6 + actionIndex * 12, texturePages: growthIndex >= 3 ? 2 : 1 },
            productionApproved: false
          });
        });
      });
    });
  });
  if (rows.length !== IP_KNOWLEDGE_RECORD_COUNTS.towerStateActions) throw new Error(`Tower state count mismatch ${rows.length}`);
  return writeShards('tower-state-actions', rows, 'tower');
}

function generateHudContracts() {
  const platforms = ['pc', 'mobile'];
  const aspects = ['16:9', '16:10', '21:9', '9:16', 'foldable'];
  const densities = ['quiet', 'standard', 'boss', 'extreme'];
  const combatStates = ['idle', 'wave', 'elite', 'boss', 'reward', 'critical'];
  const variants = ['primary', 'accessibility'];
  const rows = [];
  for (const platform of platforms) for (const aspect of aspects) for (const density of densities) for (const combatState of combatStates) for (const variant of variants) {
    const shell = HUD_SHELLS_V4[platform];
    const mobile = platform === 'mobile';
    rows.push({
      id: `HUD-${platform}-${aspect.replace(':', '-')}-${density}-${combatState}-${variant}`,
      platform,
      aspect,
      density,
      combatState,
      variant,
      shell: shell.shell,
      maxPrimaryBlocks: Math.max(2, shell.maxPrimaryBlocks - (density === 'quiet' ? 2 : 0)),
      maxSecondaryBlocks: shell.maxSecondaryBlocks,
      touchTargetPx: shell.touchTargetPx,
      safeArea: mobile ? { top: 44, right: 18, bottom: 42, left: 18 } : { top: 18, right: 24, bottom: 24, left: 24 },
      overlapRules: ['world-hp-never-under-skill-shell', 'boss-name-never-under-wave-chip', 'status-overflow-counter', 'thumb-zone-reserved'],
      infoReduction: mobile ? 0.62 : 0.35,
      productionApproved: false
    });
  }
  if (rows.length !== IP_KNOWLEDGE_RECORD_COUNTS.hudContracts) throw new Error(`HUD count mismatch ${rows.length}`);
  const relativePath = 'hud/HUD_CONTRACTS_v4.0.0.json';
  writeJson(relativePath, { schemaVersion, megabaseVersion: VERSION, count: rows.length, rows });
  return { path: relativePath, count: rows.length };
}

function generateQaScenarios() {
  const devices = ['desktop-1080p', 'desktop-ultrawide', 'tablet', 'phone-small', 'phone-large', 'foldable'];
  const densities = ['low', 'medium', 'high', 'extreme'];
  const stresses = ['normal', 'overlap', 'vfx-saturation'];
  const rows = [];
  for (let wave = 1; wave <= 10; wave += 1) for (const stage of stages) for (const device of devices) for (const density of densities) for (const stress of stresses) {
    rows.push({
      id: `QA-W${pad(wave, 2)}-${stage.id}-${device}-${density}-${stress}`,
      wave,
      stage: stage.id,
      device,
      density,
      stress,
      checks: ['hero-monster-overlap', 'world-hp-occlusion', 'skill-vfx-readability', 'boss-ground-contact', 'hit-point-alignment', 'hud-safe-area', 'texture-streaming-placeholder', 'action-timing-visible'],
      thresholds: { maxOverlapPercent: 14, maxWorldHpOcclusionPercent: 8, minSilhouetteContrast: 0.32, maxVfxCoveragePercent: 36 },
      captureFrames: [0, 90, 180, 300, 480],
      productionApproved: false
    });
  }
  if (rows.length !== IP_KNOWLEDGE_RECORD_COUNTS.visualQaScenarios) throw new Error(`QA count mismatch ${rows.length}`);
  return writeShards('visual-qa', rows, 'qa');
}

function generatePerformanceProfiles() {
  const devices = ['desktop-high', 'desktop-mid', 'tablet', 'phone-high', 'phone-low'];
  const qualities = ['ultra', 'high', 'balanced', 'safe'];
  const durations = [5, 15, 30, 60, 90, 120, 180, 240];
  const loads = ['idle', 'wave-normal', 'wave-extreme', 'boss', 'background-resume', 'texture-churn'];
  const rows = [];
  for (const device of devices) for (const quality of qualities) for (const durationMinutes of durations) for (const load of loads) {
    const mobile = /phone|tablet/.test(device);
    rows.push({
      id: `PERF-${device}-${quality}-${durationMinutes}m-${load}`,
      device,
      quality,
      durationMinutes,
      load,
      budgets: {
        p95FrameMs: quality === 'safe' ? 33.4 : 16.7,
        heapGrowthMB: mobile ? 10 : 18,
        textureMemoryMB: mobile ? 320 : 768,
        drawCalls: mobile ? 210 : 360,
        longTaskCount: durationMinutes <= 30 ? 2 : 6
      },
      probes: ['memory', 'texture-streaming', 'gpu-frame-time', 'draw-call', 'context-loss', 'atlas-eviction'],
      productionApproved: false
    });
  }
  if (rows.length !== IP_KNOWLEDGE_RECORD_COUNTS.performanceProfiles) throw new Error(`Performance count mismatch ${rows.length}`);
  const relativePath = 'performance/PERFORMANCE_REGRESSION_PROFILES_v4.0.0.json';
  writeJson(relativePath, { schemaVersion, megabaseVersion: VERSION, count: rows.length, rows });
  return { path: relativePath, count: rows.length };
}

function generateRelations(catalogs) {
  const all = Object.values(catalogs).flat();
  const relationTargets = [
    ['uses-vfx', catalogs.vfx],
    ['uses-ui', catalogs.ui],
    ['uses-environment', catalogs.environment],
    ['uses-audio', catalogs.audio]
  ];
  const rows = [];
  all.forEach((asset, index) => {
    relationTargets.forEach(([kind, targets], relationIndex) => {
      const target = targets[(index * (relationIndex * 2 + 3) + relationIndex * 97) % targets.length];
      rows.push({
        id: `REL-${pad(index + 1, 5)}-${relationIndex + 1}`,
        sourceId: asset.id,
        kind,
        targetId: target.id,
        weight: Number((0.72 + ((index + relationIndex) % 28) / 100).toFixed(2)),
        rationale: `${asset.category}:${asset.family} -> ${target.category}:${target.family}`
      });
    });
  });
  if (rows.length !== IP_KNOWLEDGE_RECORD_COUNTS.knowledgeRelations) throw new Error(`Relation count mismatch ${rows.length}`);
  return writeShards('knowledge-relations', rows, 'relations');
}

function buildPublicSample(catalogs) {
  const rows = [];
  for (const [category, assets] of Object.entries(catalogs)) {
    const take = category === 'audio' ? 8 : 12;
    rows.push(...assets.slice(0, take).map((asset) => ({
      id: asset.id,
      category: asset.category,
      nameKo: asset.nameKo,
      nameEn: asset.nameEn,
      role: asset.role,
      element: asset.element,
      stage: asset.stage,
      rarity: asset.rarity,
      priority: asset.priority,
      family: asset.family,
      artStatus: asset.artStatus,
      authoredDirections: asset.authoredDirections,
      mirroringAllowed: asset.mirroringAllowed,
      delivery: asset.delivery,
      technical: asset.technical,
      tags: asset.tags,
      positivePrompt: asset.promptPack.positive,
      negativePrompt: asset.promptPack.negative
    })));
  }
  return rows;
}

function readmeContent() {
  return `# IP Knowledge Megabase v${VERSION}\n\nDokkaebi Defense ultra-scale production knowledge output.\n\n- Base assets: **${IP_KNOWLEDGE_RECORD_COUNTS.baseAssets.toLocaleString()}**\n- 11-direction action records: **${IP_KNOWLEDGE_RECORD_COUNTS.directionalMotion.toLocaleString()}**\n- Guardian and tower state actions: **${IP_KNOWLEDGE_RECORD_COUNTS.towerStateActions.toLocaleString()}**\n- PC/mobile HUD contracts: **${IP_KNOWLEDGE_RECORD_COUNTS.hudContracts.toLocaleString()}**\n- Ten-wave visual QA scenarios: **${IP_KNOWLEDGE_RECORD_COUNTS.visualQaScenarios.toLocaleString()}**\n- Memory/texture/GPU profiles: **${IP_KNOWLEDGE_RECORD_COUNTS.performanceProfiles.toLocaleString()}**\n- Knowledge relations: **${IP_KNOWLEDGE_RECORD_COUNTS.knowledgeRelations.toLocaleString()}**\n- Total records: **${IP_KNOWLEDGE_RECORD_COUNTS.total.toLocaleString()}**\n\nKnowledge and prompt contracts are generated. Final art approval remains separate.\n\n- knowledgeStatus: generated\n- artStatus: planned\n- productionApproved: false\n- authored directions: 11\n- mirroring: forbidden\n\n## Commands\n\n\`\`\`bash\nnpm run generate:ip-mega:v4\nnpm run verify:ip-mega:v4\n\`\`\`\n`;
}

ensureCleanOutput();
const catalogs = generateBaseAssets();
for (const [category, rows] of Object.entries(catalogs)) {
  writeJson(`catalogs/${category.toUpperCase()}_CATALOG_v4.0.0.json`, {
    schemaVersion,
    megabaseVersion: VERSION,
    styleLockId: ART_STYLE_LOCK_ID,
    category,
    count: rows.length,
    rows
  });
}

writeJson('spec/DIRECTION_LIBRARY_v4.0.0.json', {
  schemaVersion,
  megabaseVersion: VERSION,
  directionCount: AUTHORED_DIRECTIONS_V4.length,
  mirroringAllowed: false,
  directions: AUTHORED_DIRECTIONS_V4
});
writeJson('spec/ACTION_TIMING_LIBRARY_v4.0.0.json', {
  schemaVersion,
  megabaseVersion: VERSION,
  presets: ACTION_TIMING_PRESETS_V4,
  heroActions: HERO_ACTIONS_V4,
  monsterActions: MONSTER_ACTIONS_V4
});
writeJson('spec/WORLD_HP_STATUS_LIBRARY_v4.0.0.json', {
  schemaVersion,
  megabaseVersion: VERSION,
  statuses: WORLD_HP_STATUS_V4,
  contract: { shield: 'overlay', break: 'secondary-gauge', status: 'priority-icons', maxVisibleStatusIcons: 5, overflow: 'ellipsis-counter' }
});

const motionInventory = generateMotion(catalogs);
const towerInventory = generateTowerStateActions(catalogs);
const hudInventory = generateHudContracts();
const qaInventory = generateQaScenarios();
const performanceInventory = generatePerformanceProfiles();
const relationInventory = generateRelations(catalogs);
const baseTotal = Object.values(catalogs).reduce((sum, rows) => sum + rows.length, 0);
const calculatedTotal = baseTotal
  + motionInventory.reduce((sum, item) => sum + item.count, 0)
  + towerInventory.reduce((sum, item) => sum + item.count, 0)
  + hudInventory.count
  + qaInventory.reduce((sum, item) => sum + item.count, 0)
  + performanceInventory.count
  + relationInventory.reduce((sum, item) => sum + item.count, 0);
if (calculatedTotal !== IP_KNOWLEDGE_RECORD_COUNTS.total) throw new Error(`Grand total expected ${IP_KNOWLEDGE_RECORD_COUNTS.total}, got ${calculatedTotal}`);

const sample = buildPublicSample(catalogs);
const publicIndex = {
  schemaVersion,
  megabaseVersion: VERSION,
  generatedAt,
  styleLockId: ART_STYLE_LOCK_ID,
  counts: { base: IP_KNOWLEDGE_BASE_COUNTS, records: IP_KNOWLEDGE_RECORD_COUNTS },
  authoredDirectionPolicy: { directions: 11, mirrored: false, authored: true },
  actionPolicy: { heroActions: HERO_ACTIONS_V4.length, monsterActions: MONSTER_ACTIONS_V4.length },
  finalArtStatus: { approved: 0, status: 'planned' },
  referenceImages: ['../reference/gameplay-key-visual-v4.webp', '../reference/art-production-board-v4.webp']
};
writeJson('ip-mega-index-v4.json', publicIndex, { publicFile: true });
writeJson('ip-mega-sample-v4.json', { schemaVersion, megabaseVersion: VERSION, count: sample.length, rows: sample }, { publicFile: true });

const index = {
  schemaVersion,
  megabaseVersion: VERSION,
  generatedAt,
  styleLockId: ART_STYLE_LOCK_ID,
  title: 'Dokkaebi Defense IP Knowledge Megabase',
  authoredDirectionPolicy: { directions: 11, mirrored: false, authored: true },
  counts: { base: IP_KNOWLEDGE_BASE_COUNTS, records: IP_KNOWLEDGE_RECORD_COUNTS },
  motionInventory,
  towerInventory,
  hudInventory,
  qaInventory,
  performanceInventory,
  relationInventory,
  finalArtStatus: { approved: 0, planned: IP_KNOWLEDGE_RECORD_COUNTS.baseAssets, note: 'Knowledge contracts generated; final authored art approval remains separate.' },
  files: createdFiles.sort((a, b) => a.path.localeCompare(b.path))
};
writeJson('IP_MEGA_INDEX_v4.0.0.json', index, { track: false });
writeText('README.md', readmeContent(), { track: false });
console.log(`${checkOnly ? 'Verified' : 'Generated'} IP Knowledge Megabase v${VERSION}: ${IP_KNOWLEDGE_RECORD_COUNTS.total.toLocaleString()} records across ${createdFiles.length + 2} production files.`);
