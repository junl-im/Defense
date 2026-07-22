import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import {
  IP_PRODUCTION_VERSION,
  IP_PROJECT_NAME,
  IP_STYLE_LOCK_ID,
  PRODUCTION_DIRECTORIES,
  STARTER_CLASSES,
  RARITIES,
  STAGES,
  MAIN_UI_SCREENS,
  MAP_COMPONENTS,
  ICON_SEEDS,
  VFX_SEEDS,
  PLAYER_ANIMATIONS,
  AUTHORED_DIRECTIONS,
  ASSET_COUNTS,
  TOTAL_ASSET_COUNT
} from '../src/ip-production-spec.js';
import { ABSOLUTE_STYLE_PROMPT, ABSOLUTE_NEGATIVE_PROMPT } from '../src/art-style-tokens.js';

const root = resolve(import.meta.dirname, '..');
const productionRoot = resolve(root, 'production/DokkaebiDefense');
const checkOnly = process.argv.includes('--check');
const writes = [];

const stableJson = (value) => `${JSON.stringify(value, null, 2)}\n`;
const writeGenerated = (relativePath, content) => {
  const path = resolve(productionRoot, relativePath);
  if (checkOnly) {
    if (!existsSync(path)) throw new Error(`Generated production file missing: ${relativePath}`);
    if (readFileSync(path, 'utf8') !== content) throw new Error(`Generated production file is stale: ${relativePath}`);
    return;
  }
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content, 'utf8');
  writes.push(relativePath);
};

const pad = (value, length = 3) => String(value).padStart(length, '0');
const cleanSlug = (value) => String(value)
  .normalize('NFKD')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '') || 'asset';
const rarityForIndex = (index) => RARITIES[Math.min(RARITIES.length - 1, Math.floor(index / 8))].id;
const priorityForIndex = (index, p0, p1, p2) => index < p0 ? 'P0' : index < p1 ? 'P1' : index < p2 ? 'P2' : 'P3';

const promptTemplateForCategory = (category) => ({
  characters: 'PROMPT-CHARACTER',
  monsters: 'PROMPT-MONSTER',
  bosses: 'PROMPT-BOSS',
  weapons: 'PROMPT-WEAPON',
  skillIcons: 'PROMPT-SKILL-ICON',
  ui: 'PROMPT-UI',
  vfx: 'PROMPT-VFX',
  tiles: 'PROMPT-TILE',
  backgrounds: 'PROMPT-BACKGROUND',
  objects: 'PROMPT-OBJECT'
})[category];

const makeAsset = ({
  id, category, subcategory, nameKo, nameEn, folder, fileName, format,
  priority = 'P2', rarity = null, milestone = 'Scale Out', technical = {}, tags = [], notes = ''
}) => Object.freeze({
  id,
  category,
  subcategory,
  nameKo,
  nameEn,
  productionFolder: folder,
  deliveryFile: fileName,
  format,
  styleLockId: IP_STYLE_LOCK_ID,
  promptTemplateId: promptTemplateForCategory(category),
  priority,
  rarity,
  status: 'planned',
  artReview: 'not-started',
  technicalReview: 'not-started',
  milestone,
  owner: 'unassigned',
  dependencies: [],
  technical,
  tags,
  notes
});

const characterNames = [
  ...STARTER_CLASSES.map((entry) => [entry.ko, entry.en, entry.id, 'starter']),
  ['불꽃 도깨비 전사', 'Flame Dokkaebi Warrior', 'flame-warrior', 'elemental'],
  ['서리 도깨비 궁수', 'Frost Dokkaebi Archer', 'frost-archer', 'elemental'],
  ['천둥 도깨비 법사', 'Thunder Dokkaebi Mage', 'thunder-mage', 'elemental'],
  ['청명 도사', 'Azure Taoist', 'azure-taoist', 'ascended'],
  ['홍련 무당', 'Crimson Shaman', 'crimson-shaman', 'ascended'],
  ['백호 수호자', 'White Tiger Guardian', 'white-tiger', 'ascended'],
  ['금빛 해태', 'Golden Haetae', 'golden-haetae', 'ascended'],
  ['설화 구미호', 'Snow Gumiho', 'snow-gumiho', 'ascended'],
  ['청록 산신령', 'Verdant Mountain Spirit', 'verdant-sanshin', 'ascended'],
  ['청염 저승사자', 'Blue Flame Reaper', 'blue-flame-reaper', 'ascended'],
  ['황금 용신', 'Golden Dragon Deity', 'golden-dragon', 'ascended'],
  ['달빛 방패병', 'Moonlight Shieldbearer', 'moon-shield', 'guardian'],
  ['별빛 창술사', 'Starlight Lancer', 'star-lancer', 'guardian'],
  ['풍류 악사', 'Pungnyu Bard', 'pungnyu-bard', 'support'],
  ['부적 연금술사', 'Talisman Alchemist', 'talisman-alchemist', 'support'],
  ['달토끼 약사', 'Moon Rabbit Healer', 'moon-rabbit', 'support'],
  ['홍매화 검객', 'Red Plum Swordsman', 'plum-swordsman', 'seasonal'],
  ['대나무 그림자', 'Bamboo Shadow', 'bamboo-shadow', 'seasonal'],
  ['설산 사냥꾼', 'Snow Mountain Hunter', 'snow-hunter', 'seasonal'],
  ['용궁 파도술사', 'Dragon Palace Wavecaster', 'wavecaster', 'seasonal'],
  ['저승 문지기', 'Underworld Gatekeeper', 'underworld-gatekeeper', 'seasonal'],
  ['천계 별지기', 'Celestial Star Keeper', 'star-keeper', 'seasonal'],
  ['깨비 대장장이', 'Dokkaebi Blacksmith', 'blacksmith', 'npc'],
  ['신선 상인', 'Immortal Merchant', 'immortal-merchant', 'npc'],
  ['무녀 안내자', 'Shrine Guide', 'shrine-guide', 'npc'],
  ['산신령 장로', 'Mountain Elder', 'mountain-elder', 'npc'],
  ['용궁 공주', 'Dragon Palace Princess', 'dragon-princess', 'npc'],
  ['저승 서기', 'Underworld Scribe', 'underworld-scribe', 'npc'],
  ['깨비 꼬마', 'Dokkaebi Kid', 'dokkaebi-kid', 'pet'],
  ['달빛 여우', 'Moonlight Fox', 'moon-fox', 'pet'],
  ['구름 호랑이', 'Cloud Tiger Cub', 'cloud-tiger', 'pet'],
  ['미니 해태', 'Mini Haetae', 'mini-haetae', 'pet'],
  ['청룡 새끼', 'Azure Dragonling', 'azure-dragonling', 'pet'],
  ['도깨비불 정령', 'Goblin Flame Spirit', 'goblin-flame-spirit', 'pet'],
  ['복주머니 요정', 'Lucky Pouch Fairy', 'lucky-pouch-fairy', 'pet'],
  ['연꽃 정령', 'Lotus Spirit', 'lotus-spirit', 'pet'],
  ['천계 금강역사', 'Celestial Vajra Guardian', 'celestial-vajra', 'seasonal'],
  ['용궁 진주술사', 'Dragon Palace Pearl Sage', 'pearl-sage', 'support'],
  ['저승 까마귀 사자', 'Underworld Crow Familiar', 'underworld-crow', 'pet']
];
if (characterNames.length !== ASSET_COUNTS.characters) throw new Error(`Character seed count ${characterNames.length}`);

const assets = [];
for (let i = 0; i < characterNames.length; i++) {
  const [ko, en, slug, group] = characterNames[i];
  assets.push(makeAsset({
    id: `CHR-${pad(i + 1)}`,
    category: 'characters',
    subcategory: group,
    nameKo: ko,
    nameEn: en,
    folder: `02_Characters/${group}`,
    fileName: `chr_${slug}_lod0.glb`,
    format: 'glb',
    priority: priorityForIndex(i, 11, 22, 35),
    rarity: rarityForIndex(i),
    milestone: i < 11 ? 'Starter Roster' : i < 22 ? 'Ascension Set' : 'Roster Scale Out',
    technical: {
      triangles: '6000-10000',
      headsTall: 2.3,
      textures: ['BaseColor', 'Normal', 'ORM', 'Emissive optional'],
      animations: PLAYER_ANIMATIONS,
      authoredDirections: AUTHORED_DIRECTIONS.map((entry) => entry.degrees),
      runtimeDirections: '5 authored + mirroring = 10-11 views',
      sockets: ['WeaponSocket', 'AccessorySocket']
    },
    tags: ['korean-fantasy', 'chibi', group]
  }));
}

const normalMonsterNames = ['떠도는 귀신', '해골 병사', '까마귀 요괴', '산 늑대', '욕심 돼지', '독거미', '밤 박쥐', '장난 고블린'];
const eliteMonsterNames = ['큰 귀신', '화염 도깨비', '얼음 도깨비'];
const monsterEnglish = ['Wandering Ghost', 'Skeleton Soldier', 'Crow Yokai', 'Mountain Wolf', 'Greedy Pig', 'Venom Spider', 'Night Bat', 'Trick Goblin'];
const monsterRows = [];
for (let stageIndex = 0; stageIndex < STAGES.length; stageIndex++) {
  for (let seedIndex = 0; seedIndex < normalMonsterNames.length; seedIndex++) {
    monsterRows.push({
      ko: `${STAGES[stageIndex].ko} ${normalMonsterNames[seedIndex]}`,
      en: `${STAGES[stageIndex].en} ${monsterEnglish[seedIndex]}`,
      stage: STAGES[stageIndex],
      family: cleanSlug(monsterEnglish[seedIndex]),
      elite: false
    });
  }
}
for (let i = 0; i < 4; i++) {
  monsterRows.push({
    ko: eliteMonsterNames[i % eliteMonsterNames.length],
    en: ['Giant Ghost', 'Flame Dokkaebi', 'Frost Dokkaebi'][i % 3],
    stage: STAGES[(i + 2) % STAGES.length],
    family: ['giant-ghost', 'flame-dokkaebi', 'frost-dokkaebi'][i % 3],
    elite: true
  });
}
if (monsterRows.length !== ASSET_COUNTS.monsters) throw new Error(`Monster seed count ${monsterRows.length}`);
monsterRows.forEach((row, index) => assets.push(makeAsset({
  id: `MON-${pad(index + 1)}`,
  category: 'monsters',
  subcategory: row.elite ? 'elite' : row.stage.id,
  nameKo: row.ko,
  nameEn: row.en,
  folder: `03_Monsters/${row.elite ? 'Elite' : row.stage.id}`,
  fileName: `mon_${row.stage.id}_${row.family}_${pad(index + 1)}.glb`,
  format: 'glb',
  priority: priorityForIndex(index, 11, 28, 44),
  rarity: row.elite ? 'epic' : 'common',
  milestone: row.elite || index < 8 ? 'Enemy Readability Set' : 'Stage Expansion',
  technical: {
    triangles: row.elite ? '7000-10000' : '5000-9000',
    textures: ['BaseColor', 'Normal', 'ORM', 'Emissive optional'],
    animations: ['Idle', 'Walk', 'Run', 'Attack', 'Skill', 'Hit', 'Death'],
    authoredDirections: AUTHORED_DIRECTIONS.map((entry) => entry.degrees)
  },
  tags: [row.stage.id, row.elite ? 'elite' : 'normal']
})));

const bossNames = [
  ['도깨비왕', 'Dokkaebi King', 'dokkaebi-king'], ['구미호', 'Nine-Tailed Fox', 'nine-tailed-fox'],
  ['구천현녀', 'Lady of the Ninth Heaven', 'ninth-heaven-lady'], ['이무기', 'Imugi', 'imugi'],
  ['용', 'Celestial Dragon', 'celestial-dragon'], ['저승대왕', 'Underworld King', 'underworld-king'],
  ['백호 산군', 'White Tiger Lord', 'white-tiger-lord'], ['청룡 해신', 'Azure Dragon Sea Lord', 'azure-sea-dragon'],
  ['주작 화신', 'Vermilion Phoenix', 'vermilion-phoenix'], ['현무 장군', 'Black Tortoise General', 'black-tortoise'],
  ['달 먹는 불가사리', 'Moon-Eating Bulgasari', 'moon-bulgasari'], ['천년 묵은 두꺼비', 'Ancient Moon Toad', 'ancient-toad'],
  ['귀면 장승', 'Demon-Faced Jangseung', 'demon-jangseung'], ['설산 설녀', 'Snow Mountain Spirit', 'snow-spirit'],
  ['용궁 거북대감', 'Dragon Palace Turtle Lord', 'turtle-lord'], ['망각의 무녀', 'Shaman of Oblivion', 'oblivion-shaman'],
  ['백귀 야행왕', 'King of the Hundred Ghosts', 'hundred-ghost-king'], ['천계 뇌공', 'Celestial Thunder Lord', 'thunder-lord'],
  ['태양 삼족오', 'Solar Three-Legged Crow', 'three-legged-crow'], ['무량 달신', 'Infinite Moon Deity', 'moon-deity']
];
bossNames.forEach(([ko, en, slug], index) => assets.push(makeAsset({
  id: `BOS-${pad(index + 1)}`,
  category: 'bosses',
  subcategory: STAGES[index % STAGES.length].id,
  nameKo: ko,
  nameEn: en,
  folder: `04_Boss/${STAGES[index % STAGES.length].id}`,
  fileName: `boss_${slug}_lod0.glb`,
  format: 'glb',
  priority: priorityForIndex(index, 6, 12, 17),
  rarity: index < 6 ? 'legend' : index < 14 ? 'mythic' : 'god',
  milestone: index < 6 ? 'Launch Boss Lineup' : 'Boss Season Expansion',
  technical: {
    triangles: '10000-18000',
    textures: ['BaseColor', 'Normal', 'ORM', 'Emissive'],
    animations: ['Idle', 'Walk', 'Run', 'AttackA', 'AttackB', 'SkillA', 'SkillB', 'Phase', 'Hit', 'Death'],
    phaseReadability: 'silhouette + aura + HUD color must change together'
  },
  tags: ['boss', STAGES[index % STAGES.length].id]
})));

const weaponFamilies = [
  ['검', 'sword', 20], ['활', 'bow', 16], ['지팡이', 'staff', 16], ['방망이', 'club', 12],
  ['창', 'spear', 10], ['부적', 'talisman', 10], ['부채', 'fan', 8], ['낫', 'scythe', 8]
];
let weaponIndex = 0;
for (const [koFamily, enFamily, count] of weaponFamilies) {
  for (let variant = 1; variant <= count; variant++) {
    const rarity = rarityForIndex(weaponIndex);
    assets.push(makeAsset({
      id: `WPN-${pad(weaponIndex + 1)}`,
      category: 'weapons',
      subcategory: enFamily,
      nameKo: `${koFamily} ${pad(variant, 2)}`,
      nameEn: `${enFamily[0].toUpperCase()}${enFamily.slice(1)} ${pad(variant, 2)}`,
      folder: `02_Characters/Weapons/${enFamily}`,
      fileName: `wpn_${enFamily}_${pad(variant)}_${rarity}.glb`,
      format: 'glb',
      priority: priorityForIndex(weaponIndex, 18, 45, 75),
      rarity,
      milestone: weaponIndex < 18 ? 'Starter Equipment' : 'Equipment Scale Out',
      technical: { triangles: '800-3500', socket: 'WeaponSocket', maxMaterials: 2, oversizedSilhouette: true },
      tags: ['equipment', enFamily, rarity]
    }));
    weaponIndex++;
  }
}
if (weaponIndex !== ASSET_COUNTS.weapons) throw new Error(`Weapon count ${weaponIndex}`);

const skillRows = [];
for (const hero of STARTER_CLASSES) {
  for (let skill = 1; skill <= 9; skill++) skillRows.push({ hero, skill });
}
for (let shared = 1; shared <= 21; shared++) skillRows.push({ hero: null, skill: shared });
skillRows.forEach((row, index) => {
  const base = row.hero?.id ?? `shared-${ICON_SEEDS[index % ICON_SEEDS.length].toLowerCase()}`;
  assets.push(makeAsset({
    id: `ICO-${pad(index + 1)}`,
    category: 'skillIcons',
    subcategory: row.hero?.id ?? 'shared',
    nameKo: row.hero ? `${row.hero.ko} 스킬 ${row.skill}` : `공용 ${ICON_SEEDS[index % ICON_SEEDS.length]} 아이콘 ${row.skill}`,
    nameEn: row.hero ? `${row.hero.en} Skill ${row.skill}` : `Shared ${ICON_SEEDS[index % ICON_SEEDS.length]} Icon ${row.skill}`,
    folder: `06_Icons/${row.hero ? 'Skills' : 'Shared'}`,
    fileName: `icon_skill_${base}_${pad(row.skill, 2)}.webp`,
    format: 'webp',
    priority: priorityForIndex(index, 33, 66, 99),
    rarity: null,
    milestone: index < 33 ? 'Starter Combat UI' : 'Skill Icon Library',
    technical: { width: 1024, height: 1024, alpha: true, text: false, border: 'separate UI layer' },
    tags: ['icon', row.hero?.id ?? 'shared']
  }));
});

const uiFamilies = [
  ['screen', MAIN_UI_SCREENS, 10], ['button', ['gold', 'dark', 'blue', 'red', 'green'], 50],
  ['panel', ['main', 'modal', 'toast', 'hud', 'result'], 45], ['frame', RARITIES.map((entry) => entry.id), 35],
  ['slot', ['hero', 'weapon', 'relic', 'material', 'reward'], 35], ['badge', ['new', 'lock', 'clear', 'event', 'sale'], 30],
  ['navigation', ['tab', 'back', 'home', 'close', 'info'], 25], ['hud', ['hp', 'mana', 'boss', 'wave', 'currency'], 20]
];
let uiIndex = 0;
for (const [family, variants, count] of uiFamilies) {
  for (let i = 0; i < count; i++) {
    const variant = cleanSlug(variants[i % variants.length]);
    assets.push(makeAsset({
      id: `UI-${pad(uiIndex + 1)}`,
      category: 'ui',
      subcategory: family,
      nameKo: `${family} ${variants[i % variants.length]} ${pad(i + 1, 2)}`,
      nameEn: `${family} ${variants[i % variants.length]} ${pad(i + 1, 2)}`,
      folder: `05_UI/${family}`,
      fileName: `ui_${family}_${variant}_${pad(i + 1)}.webp`,
      format: 'webp',
      priority: priorityForIndex(uiIndex, 55, 120, 190),
      rarity: family === 'frame' ? RARITIES[i % RARITIES.length].id : null,
      milestone: uiIndex < 55 ? 'Core Navigation' : 'UI Library',
      technical: { referenceResolutions: ['1920x1080', '1440x2560'], nineSlice: ['panel', 'button', 'frame'].includes(family), alpha: true },
      tags: ['ui', family, variant]
    }));
    uiIndex++;
  }
}
if (uiIndex !== ASSET_COUNTS.ui) throw new Error(`UI count ${uiIndex}`);

for (let index = 0; index < ASSET_COUNTS.vfx; index++) {
  const family = VFX_SEEDS[index % VFX_SEEDS.length];
  const variant = Math.floor(index / VFX_SEEDS.length) + 1;
  assets.push(makeAsset({
    id: `VFX-${pad(index + 1)}`,
    category: 'vfx',
    subcategory: cleanSlug(family),
    nameKo: `${family} 이펙트 ${pad(variant, 2)}`,
    nameEn: `${family} Effect ${pad(variant, 2)}`,
    folder: `07_VFX/${cleanSlug(family)}`,
    fileName: `vfx_${cleanSlug(family)}_${pad(variant)}.ktx2`,
    format: 'ktx2',
    priority: priorityForIndex(index, 36, 84, 132),
    milestone: index < 36 ? 'Combat Feedback Core' : 'VFX Scale Out',
    technical: { atlas: '4x4 or 8x8', alpha: true, maxDurationSeconds: 1.8, readability: 'core-tail-impact' },
    tags: ['vfx', cleanSlug(family)]
  }));
}

for (let stageIndex = 0; stageIndex < STAGES.length; stageIndex++) {
  for (let variant = 0; variant < 10; variant++) {
    const component = MAP_COMPONENTS[variant];
    const index = stageIndex * 10 + variant;
    assets.push(makeAsset({
      id: `TIL-${pad(index + 1)}`,
      category: 'tiles',
      subcategory: STAGES[stageIndex].id,
      nameKo: `${STAGES[stageIndex].ko} ${component} 타일`,
      nameEn: `${STAGES[stageIndex].en} ${component} Tile`,
      folder: `08_Map/${STAGES[stageIndex].id}/Tiles`,
      fileName: `tile_${STAGES[stageIndex].id}_${cleanSlug(component)}.ktx2`,
      format: 'ktx2',
      priority: stageIndex < 2 ? 'P0' : stageIndex < 4 ? 'P1' : 'P2',
      milestone: stageIndex < 2 ? 'Launch Map Set' : 'Stage Expansion',
      technical: { seamless: true, tileMeters: 8, resolution: 2048, channels: ['BaseColor', 'Normal', 'ORM'] },
      tags: ['map', STAGES[stageIndex].id, cleanSlug(component)]
    }));
  }
}

for (let index = 0; index < ASSET_COUNTS.backgrounds; index++) {
  const stage = STAGES[index % STAGES.length];
  const phase = ['dawn', 'day', 'night', 'boss'][Math.floor(index / STAGES.length) % 4];
  assets.push(makeAsset({
    id: `BG-${pad(index + 1)}`,
    category: 'backgrounds',
    subcategory: stage.id,
    nameKo: `${stage.ko} ${phase} 배경`,
    nameEn: `${stage.en} ${phase} Background`,
    folder: `08_Map/${stage.id}/Backgrounds`,
    fileName: `bg_${stage.id}_${phase}_${pad(index + 1)}.webp`,
    format: 'webp',
    priority: priorityForIndex(index, 8, 18, 25),
    milestone: index < 8 ? 'Launch Presentation' : 'Stage Mood Expansion',
    technical: { width: 3840, height: 2160, parallaxLayers: 3, noText: true },
    tags: ['background', stage.id, phase]
  }));
}

const universalObjects = ['Moon Gate', 'Lucky Pouch', 'Market Stall', 'Treasure Chest', 'Summon Altar', 'Upgrade Anvil', 'Quest Board', 'Guild Banner', 'Ranking Statue', 'Pass Totem'];
for (let index = 0; index < ASSET_COUNTS.objects; index++) {
  const stage = STAGES[index % STAGES.length];
  const component = index < 210 ? MAP_COMPONENTS[Math.floor(index / STAGES.length) % MAP_COMPONENTS.length] : universalObjects[(index - 210) % universalObjects.length];
  const universal = index >= 210;
  assets.push(makeAsset({
    id: `OBJ-${pad(index + 1)}`,
    category: 'objects',
    subcategory: universal ? 'universal' : stage.id,
    nameKo: `${universal ? '공용' : stage.ko} ${component} 오브젝트 ${pad(index + 1)}`,
    nameEn: `${universal ? 'Universal' : stage.en} ${component} Object ${pad(index + 1)}`,
    folder: `08_Map/${universal ? 'Universal' : stage.id}/Objects`,
    fileName: `obj_${universal ? 'universal' : stage.id}_${cleanSlug(component)}_${pad(index + 1)}.glb`,
    format: 'glb',
    priority: priorityForIndex(index, 50, 120, 190),
    milestone: index < 50 ? 'Launch Environment Kit' : 'World Dressing Scale Out',
    technical: { triangles: index % 10 === 0 ? '3500-12000' : '240-3500', maxMaterials: 3, instancing: index % 10 !== 0 },
    tags: ['environment', universal ? 'universal' : stage.id, cleanSlug(component)]
  }));
}

if (assets.length !== TOTAL_ASSET_COUNT) throw new Error(`Master list total ${assets.length}, expected ${TOTAL_ASSET_COUNT}`);

const counts = Object.fromEntries(Object.keys(ASSET_COUNTS).map((key) => [key, assets.filter((asset) => asset.category === key).length]));
const master = {
  schemaVersion: 1,
  project: IP_PROJECT_NAME,
  productionVersion: IP_PRODUCTION_VERSION,
  styleLockId: IP_STYLE_LOCK_ID,
  totalAssets: assets.length,
  requestedApproximateTotal: 1100,
  exactPlannedTotal: TOTAL_ASSET_COUNT,
  counts,
  statusLegend: {
    planned: '요구사항과 파일명이 등록된 상태',
    concept: '턴어라운드 또는 UI 컨셉 제작 중',
    production: '모델링·텍스처·애니메이션 제작 중',
    artReview: '아트 바이블 검수 중',
    technicalReview: '엔진·메모리·포맷 검수 중',
    approved: '아트·기술 이중 승인 완료'
  },
  assets
};

writeGenerated('ASSET_MASTERLIST_v3.8.0.json', stableJson(master));

const promptTemplates = [
  ['PROMPT-CHARACTER', 'Cute stylized Korean folklore character, 2.3 heads, large expressive eyes, rounded face, tiny body, oversized readable weapon, orthographic 5-view turnaround'],
  ['PROMPT-MONSTER', 'Cute readable Korean folklore monster, friendly but threatening silhouette, oversized attack feature, orthographic 5-view turnaround'],
  ['PROMPT-BOSS', 'Premium chibi Korean mythology boss, massive readable silhouette, phase-change ornament and aura, orthographic turnaround'],
  ['PROMPT-WEAPON', 'Oversized stylized Korean fantasy weapon, hand painted PBR, rounded mobile-game shapes, isolated orthographic presentation'],
  ['PROMPT-SKILL-ICON', 'Premium mobile skill icon, one bold centered symbol, high contrast, transparent background, no text'],
  ['PROMPT-UI', 'Premium rounded mobile game UI, Korean fantasy, soft gradient, strong depth, high contrast, no text baked into art'],
  ['PROMPT-VFX', 'Stylized mobile magic effect, clear core-tail-impact structure, soft glow, transparent sprite sheet, high visibility'],
  ['PROMPT-TILE', 'Seamless stylized Korean fantasy map tile, hand painted, rounded low-poly forms, soft shadow, mobile quality'],
  ['PROMPT-BACKGROUND', 'Bright Korean fantasy stage background, layered parallax composition, soft atmosphere, no characters, no text'],
  ['PROMPT-OBJECT', 'Stylized Korean fantasy environment prop, rounded silhouette, hand painted PBR, game ready, orthographic view']
].map(([id, categoryPrompt]) => ({
  id,
  styleLockId: IP_STYLE_LOCK_ID,
  absoluteStylePrompt: ABSOLUTE_STYLE_PROMPT,
  categoryPrompt,
  absoluteNegativePrompt: ABSOLUTE_NEGATIVE_PROMPT,
  outputRule: 'White or transparent background as appropriate; no text, no watermark, no vector delivery'
}));
writeGenerated('01_ArtBible/PROMPT_TEMPLATES_v3.8.0.json', stableJson({
  productionVersion: IP_PRODUCTION_VERSION,
  styleLockId: IP_STYLE_LOCK_ID,
  templateCount: promptTemplates.length,
  templates: promptTemplates
}));


const categoryTargets = {
  characters: '02_Characters/CHARACTER_CATALOG_v3.8.0.json',
  monsters: '03_Monsters/MONSTER_CATALOG_v3.8.0.json',
  bosses: '04_Boss/BOSS_CATALOG_v3.8.0.json',
  weapons: '02_Characters/Weapons/WEAPON_CATALOG_v3.8.0.json',
  skillIcons: '06_Icons/SKILL_ICON_CATALOG_v3.8.0.json',
  ui: '05_UI/UI_ASSET_CATALOG_v3.8.0.json',
  vfx: '07_VFX/VFX_CATALOG_v3.8.0.json',
  tiles: '08_Map/TILE_CATALOG_v3.8.0.json',
  backgrounds: '08_Map/BACKGROUND_CATALOG_v3.8.0.json',
  objects: '08_Map/OBJECT_CATALOG_v3.8.0.json'
};
for (const [category, path] of Object.entries(categoryTargets)) {
  writeGenerated(path, stableJson({
    schemaVersion: 1,
    project: IP_PROJECT_NAME,
    productionVersion: IP_PRODUCTION_VERSION,
    category,
    count: counts[category],
    assets: assets.filter((asset) => asset.category === category)
  }));
}

const animationRows = STARTER_CLASSES.flatMap((hero) => PLAYER_ANIMATIONS.map((animation, index) => ({
  id: `ANM-${hero.id.toUpperCase()}-${pad(index + 1, 2)}`,
  characterId: hero.id,
  character: hero.ko,
  animation,
  clipName: animation.toLowerCase(),
  authoredDirections: AUTHORED_DIRECTIONS.map((entry) => entry.degrees),
  runtimeViewRule: '5방향 제작 후 좌우 반전으로 10~11방향 구현',
  status: 'planned'
})));
writeGenerated('10_Animation/STARTER_ANIMATION_MATRIX_v3.8.0.json', stableJson({
  productionVersion: IP_PRODUCTION_VERSION,
  characters: STARTER_CLASSES.length,
  clipsPerCharacter: PLAYER_ANIMATIONS.length,
  totalClipRows: animationRows.length,
  rows: animationRows
}));

const soundFamilies = ['UI', 'Combat', 'Skill', 'Monster', 'Boss', 'Map', 'Reward', 'Voice'];
const soundRows = Array.from({ length: 96 }, (_, index) => ({
  id: `SND-${pad(index + 1)}`,
  family: soundFamilies[index % soundFamilies.length],
  cue: `snd_${cleanSlug(soundFamilies[index % soundFamilies.length])}_${pad(index + 1)}.ogg`,
  status: 'planned',
  note: '1,130 시각 에셋 합계에는 포함하지 않는 별도 오디오 제작 항목'
}));
writeGenerated('09_Sound/SOUND_CUE_CATALOG_v3.8.0.json', stableJson({
  productionVersion: IP_PRODUCTION_VERSION,
  count: soundRows.length,
  countedInVisualAssetTotal: false,
  rows: soundRows
}));

const summaryRows = Object.entries(ASSET_COUNTS).map(([category, count]) => `| ${category} | ${count.toLocaleString()} |`).join('\n');
writeGenerated('ASSET_MASTERLIST_SUMMARY_v3.8.0.md', `# ${IP_PROJECT_NAME} 에셋 제작 마스터리스트 요약\n\n- 제작 기준 버전: ${IP_PRODUCTION_VERSION}\n- 아트 잠금: ${IP_STYLE_LOCK_ID}\n- 사용자가 제시한 약 1,100개 목표의 정확한 산술 합계: **${TOTAL_ASSET_COUNT.toLocaleString()}개**\n- 현재 제작 승인: 0개\n- 모든 항목은 아트 리뷰와 기술 리뷰를 각각 통과해야 approved 상태가 된다.\n\n| 분류 | 수량 |\n|---|---:|\n${summaryRows}\n| **합계** | **${TOTAL_ASSET_COUNT.toLocaleString()}** |\n\n## 우선순위\n\n- P0: 11개 시작 직업, 핵심 적·보스, 전투 HUD, 첫 2개 스테이지\n- P1: 승급 캐릭터, 런칭 UI, 장비·스킬 아이콘, 3~4번째 스테이지\n- P2: 시즌 확장과 전체 수집 루프\n- P3: NPC·펫·월드 드레싱 장기 확장\n`);

if (checkOnly) console.log(`PASS IP production master list ${TOTAL_ASSET_COUNT} assets is current`);
else console.log(`Generated ${writes.length} IP production files · ${TOTAL_ASSET_COUNT} assets`);
