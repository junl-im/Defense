export const IP_PRODUCTION_VERSION = '3.8.0';
export const IP_PROJECT_NAME = 'Dokkaebi Defense';
export const IP_STYLE_LOCK_ID = 'DD-ABSOLUTE-ART-BIBLE-2.0';

export const PRODUCTION_DIRECTORIES = Object.freeze([
  '01_ArtBible',
  '02_Characters',
  '03_Monsters',
  '04_Boss',
  '05_UI',
  '06_Icons',
  '07_VFX',
  '08_Map',
  '09_Sound',
  '10_Animation',
  '11_Unity',
  '12_Monetization',
  '13_LiveOps'
]);

export const ART_CONCEPT = Object.freeze({
  theme: '한국 전통 판타지',
  motifs: Object.freeze(['도깨비', '신선', '무당', '저승사자', '구미호', '호랑이', '산신령', '용']),
  feelings: Object.freeze(['귀엽다', '멋있다', '반짝인다', '가볍다']),
  primaryColors: Object.freeze(['Gold', 'Blue', 'Purple', 'Red', 'White']),
  forbiddenDominantColors: Object.freeze(['회색 위주', '어두운 갈색', '칙칙한 색']),
  materials: Object.freeze(['Stylized PBR', 'Soft Shadow', 'No Realistic', 'Bright', 'Hand Painted', 'AAA Mobile'])
});

export const CHARACTER_PROPORTIONS = Object.freeze({
  headsTall: 2.3,
  headPercent: 42,
  chestPercent: 18,
  waistPercent: 15,
  bodyPercent: 33,
  legPercent: 25,
  eyeRule: '눈은 얼굴 폭 28%, 얼굴 중앙보다 조금 아래, 동그란 눈동자와 큰 광택, 속눈썹 거의 없음',
  handRule: '둥근 손과 단순한 손가락',
  weaponRule: '전체 높이의 18% 이상이며 몸보다 크게 읽히고 0.3초 안에 역할이 식별되게'
});

export const STARTER_CLASSES = Object.freeze([
  Object.freeze({ id: 'dokkaebi-warrior', ko: '도깨비 전사', en: 'Dokkaebi Warrior', role: '근접·방어' }),
  Object.freeze({ id: 'dokkaebi-archer', ko: '도깨비 궁수', en: 'Dokkaebi Archer', role: '원거리·치명타' }),
  Object.freeze({ id: 'dokkaebi-mage', ko: '도깨비 법사', en: 'Dokkaebi Mage', role: '범위·원소' }),
  Object.freeze({ id: 'taoist', ko: '도사', en: 'Taoist', role: '부적·제어' }),
  Object.freeze({ id: 'shaman', ko: '무당', en: 'Shaman', role: '지원·저주' }),
  Object.freeze({ id: 'tiger-guardian', ko: '호랑이', en: 'Tiger Guardian', role: '돌진·격투' }),
  Object.freeze({ id: 'haetae', ko: '해태', en: 'Haetae', role: '수호·정화' }),
  Object.freeze({ id: 'gumiho', ko: '구미호', en: 'Gumiho', role: '환영·마법' }),
  Object.freeze({ id: 'sanshin', ko: '산신령', en: 'Mountain Spirit', role: '소환·자연' }),
  Object.freeze({ id: 'grim-reaper', ko: '저승사자', en: 'Grim Reaper', role: '처형·영혼' }),
  Object.freeze({ id: 'dragon', ko: '용', en: 'Dragon', role: '폭발·궁극' })
]);

export const RARITIES = Object.freeze([
  Object.freeze({ id: 'common', ko: 'Common', color: 'Gray', usage: '작은 테두리와 라벨에만 사용; 화면 지배 금지' }),
  Object.freeze({ id: 'rare', ko: 'Rare', color: 'Blue' }),
  Object.freeze({ id: 'epic', ko: 'Epic', color: 'Purple' }),
  Object.freeze({ id: 'legend', ko: 'Legend', color: 'Orange' }),
  Object.freeze({ id: 'mythic', ko: 'Mythic', color: 'Red' }),
  Object.freeze({ id: 'immortal', ko: 'Immortal', color: 'Blue-Gold Iridescent', usage: '무지개 금지; Blue와 Gold 두 색만 사용' }),
  Object.freeze({ id: 'god', ko: 'God', color: 'Gold' })
]);

export const ENEMY_SEEDS = Object.freeze({
  normal: Object.freeze(['Ghost', 'Skeleton', 'Crow', 'Wolf', 'Pig', 'Spider', 'Bat', 'Goblin']),
  elite: Object.freeze(['큰 귀신', '화염 도깨비', '얼음 도깨비']),
  bosses: Object.freeze(['도깨비왕', '구미호', '구천현녀', '이무기', '용', '저승대왕'])
});

export const STAGES = Object.freeze([
  Object.freeze({ id: 'goblin-village', ko: '도깨비마을', en: 'Dokkaebi Village' }),
  Object.freeze({ id: 'bamboo-forest', ko: '대나무숲', en: 'Bamboo Forest' }),
  Object.freeze({ id: 'ruined-temple', ko: '폐사찰', en: 'Ruined Temple' }),
  Object.freeze({ id: 'snow-mountain', ko: '설산', en: 'Snow Mountain' }),
  Object.freeze({ id: 'dragon-palace', ko: '용궁', en: 'Dragon Palace' }),
  Object.freeze({ id: 'underworld', ko: '저승', en: 'Underworld' }),
  Object.freeze({ id: 'celestial-realm', ko: '천계', en: 'Celestial Realm' })
]);

export const MAP_COMPONENTS = Object.freeze(['Ground', 'Road', 'Grass', 'Rock', 'Tree', 'Shrine', 'Bridge', 'Fence', 'Water', 'Flower', 'Lantern', 'Torch']);
export const MAIN_UI_SCREENS = Object.freeze(['메인', '소환', '영웅', '가방', '상점', '업적', '패스', '랭킹', '길드', '설정']);
export const BUTTON_STYLES = Object.freeze(['Gold', 'Dark', 'Blue', 'Red', 'Green']);
export const BUTTON_RULES = Object.freeze(['둥근 모서리', '명확한 입체감', '상태별 Glow', '44px 이상 터치 영역', '문자 없이도 기능이 읽히는 아이콘']);

export const ICON_SEEDS = Object.freeze(['Coin', 'Gem', 'Attack', 'HP', 'Mana', 'Speed', 'Critical', 'Boss', 'Fire', 'Ice', 'Lightning', 'Poison', 'Heal', 'Shield', 'Sword', 'Bow', 'Staff']);
export const VFX_SEEDS = Object.freeze(['Slash', 'Explosion', 'Summon', 'Fire', 'Ice', 'Heal', 'Level Up', 'Critical', 'Lightning', 'Wind', 'Dark', 'Holy']);

export const PLAYER_ANIMATIONS = Object.freeze(['Idle', 'Walk', 'Run', 'Attack1', 'Attack2', 'Skill1', 'Skill2', 'Hit', 'Death', 'Victory', 'Spawn']);
export const AUTHORED_DIRECTIONS = Object.freeze([
  Object.freeze({ id: 'front', degrees: 0, label: '정면' }),
  Object.freeze({ id: 'front-quarter', degrees: 45, label: '45°' }),
  Object.freeze({ id: 'side', degrees: 90, label: '90°' }),
  Object.freeze({ id: 'back-quarter', degrees: 135, label: '135°' }),
  Object.freeze({ id: 'back', degrees: 180, label: '후면' })
]);

export const UI_REFERENCE_RESOLUTIONS = Object.freeze([
  Object.freeze({ width: 1920, height: 1080, orientation: 'landscape', usage: 'PC·태블릿 가로 기준' }),
  Object.freeze({ width: 1440, height: 2560, orientation: 'portrait', usage: '모바일 세로 기준' })
]);

export const ASSET_COUNTS = Object.freeze({
  characters: 50,
  monsters: 60,
  bosses: 20,
  weapons: 100,
  skillIcons: 120,
  ui: 250,
  vfx: 180,
  tiles: 70,
  backgrounds: 30,
  objects: 250
});

export const TOTAL_ASSET_COUNT = Object.values(ASSET_COUNTS).reduce((sum, count) => sum + count, 0);

export const CORE_DOCUMENTS = Object.freeze([
  'GAME_DESIGN_DOCUMENT_v3.8.0.md',
  '01_ArtBible/ART_BIBLE_v3.8.0.md',
  '05_UI/UI_UX_SPEC_v3.8.0.md',
  '10_Animation/ANIMATION_BIBLE_v3.8.0.md',
  'ASSET_MASTERLIST_v3.8.0.json'
]);

export const ALLOWED_DELIVERY_FORMATS = Object.freeze(['glb', 'png', 'webp', 'ktx2', 'wav', 'ogg', 'json', 'md']);
