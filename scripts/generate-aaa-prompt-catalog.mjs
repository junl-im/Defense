import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { ABSOLUTE_STYLE_PROMPT, ABSOLUTE_NEGATIVE_PROMPT, ART_STYLE_LOCK_ID } from '../src/art-style-tokens.js';

const root = resolve(import.meta.dirname, '..');
const output = resolve(root, 'docs/AAA_ASSET_PROMPT_CATALOG.json');
const checkOnly = process.argv.includes('--check');

const characterNames = [
  '도깨비 전사','도깨비 궁수','도깨비 화염 법사','도깨비 얼음 법사','도깨비 바람 도사','도깨비 번개 도사','도깨비 바위 수호자','도깨비 방울 승려','도깨비 부적사','도깨비 장군',
  '달빛 검객','해태 기사','호랑이 권사','구미호 술사','저승사자','청룡 소환사','주작 무희','백호 창병','현무 방패병','삼족오 정찰병',
  '산신령','선녀 치유사','달토끼 연금술사','장승 파수꾼','탈춤 광대','사물놀이 악사','북 치는 깨비','징 치는 깨비','꽹과리 깨비','장구 깨비',
  '엽전 상인','한지 인형사','매화 검사','대나무 창술사','연꽃 승려','호롱불 안내자','비단 부채술사','금줄 결계사','달항아리 정령사','호박 엿장수',
  '도깨비 대장장이','도깨비 약초사','도깨비 사냥꾼','도깨비 기수','도깨비 왕자','도깨비 공주','도깨비 왕','도깨비 왕비','월식 수호자','천년 신목 화신'
];
const characterDetails = [
  'blue skin, small rounded horns, traditional Korean hat, oversized wooden club, confident friendly smile, simple leather armor',
  'large curved bow, broad gat silhouette, short quiver, focused playful eyes',
  'oversized flame staff, red hanbok jacket, mint spirit flame accessory',
  'ice crystal wand, pale blue robe, rounded snowflake ornament',
  'paper talismans, long rounded sleeves, green wind ribbon',
  'violet thunder blade, compact helmet, bright electric charm',
  'large rounded stone shield, thick short legs, warm brown armor',
  'large prayer beads, golden bell, cream monk robe',
  'floating paper charms, magic scroll, white hair, youthful exorcist face',
  'broad toy-like armor, crescent command banner, heroic smile'
];

const monsterNames = [
  '장난 슬라임','푸른 도깨비불','종이 귀신','해골 장난꾼','산 늑대','멧돼지 돌격수','여우 요괴','작은 도깨비','그림자 악령','달거미',
  '붉은 버섯 요괴','항아리 귀신','우물 손귀신','짚신 도깨비','방망이 꼬마귀','탈 쓴 망령','부적 먹는 벌레','돌갑옷 귀수','두억 질주꾼','저주 무당',
  '까마귀 요괴','박쥐 혼령','뿔토끼 요괴','달팽이 갑주귀','개구리 독술사','두꺼비 금고지기','뱀 허물 요괴','비늘 악어귀','불꼬리 족제비','눈보라 담비',
  '바람 두더지','대나무 창귀','소나무 갑주귀','등롱 도둑','엽전 먹보','그림자 장수','비명 가면귀','한지 인형귀','금줄 절단귀','장승 파괴자',
  '월식 사냥개','백귀 병사','혼령 궁수','독안개 술사','번개 뿔귀','얼음 손귀','용암 발굽귀','거울 분신귀','탐욕 상자귀','밤시장 포식자'
];

const bossNames = [
  '저승 호랑이','청월 이무기','백귀 야행왕','구미호 여왕','해태 심판관','도깨비왕','월식 저승사자','장산범','불가사리 철갑왕','삼두 귀수',
  '산군 대왕','청룡의 그림자','주작 화염군주','백호 폭풍왕','현무 심해왕','천년 나무귀','달 먹는 불개','거대 장승신','황금 두꺼비왕','귀면 대장군'
];

const weaponTypes = ['도끼','검','창','활','지팡이','부적','방패','방망이','방울','부채'];
const weaponThemes = ['불씨','달서리','청풍','바위','혼령','천뢰','금빛','옥빛','월식','왕실'];
const uiGroups = ['전투','소환','강화','상점','도감','인벤토리','스킬','퀘스트','업적','우편','설정','재화','등급','장비','영웅','몬스터','보스','이벤트','패스','길드'];
const uiItems = ['기본 버튼','강조 버튼','비활성 버튼','뒤로가기','닫기','확인','취소','잠금','해제','알림','새 항목','레벨업','보상 받기','상세보기','도움말'];
const vfxElements = ['불','얼음','바람','바위','혼령','번개','독','회복','달빛','그림자'];
const vfxEvents = ['기본 공격','강공격','치명타','스킬 시작','스킬 폭발','궁극기','피격','사망','레벨업','강화 성공','소환','보상 획득','장판 예고','보호막','이동 잔상'];
const environmentTypes = ['잔디 타일','흙길 타일','월문 석판','얕은 물 타일','둥근 소나무','단풍나무','대나무 묶음','꽃나무','둥근 바위','층진 바위','절벽 모듈','장터 가판대','곡선 기와집','등롱 기둥','장승','달항아리','우물','돌담','나무 울타리','요괴문'];
const environmentVariants = ['봄','여름','가을','겨울'];

const make = (category, index, name, detail, extra = {}) => ({
  id: `${category}-${String(index + 1).padStart(3, '0')}`,
  category,
  name,
  styleLockId: ART_STYLE_LOCK_ID,
  approvalTarget: 'art-review',
  prompt: `${ABSOLUTE_STYLE_PROMPT},\n${detail}`,
  negativePrompt: ABSOLUTE_NEGATIVE_PROMPT,
  conceptOutput: category === 'ui' || category === 'vfx' ? '1024x1024, no text, transparent or neutral background' : 'front, 45 degree, side, 135 degree, back orthographic turnaround',
  ...extra
});

const assets = [];
characterNames.forEach((name, index) => assets.push(make('character', index, name, `${characterDetails[index % characterDetails.length]}, Korean folklore guardian, premium collectible toy-like form, separated Head HairOrHat Body Weapon Accessory parts`)));
monsterNames.forEach((name, index) => assets.push(make('monster', index, name, `Cute 70% + Cool 30%, Gross 0%, Korean folklore monster, readable 0.3-second silhouette, rounded beveled body, bright lighting, distinct role silhouette, separated Helmet Shoulder Weapon Accessory BackItem parts`)));
bossNames.forEach((name, index) => assets.push(make('boss', index, name, `large collectible chibi boss, player scale x2, weapon x3, FX x4, huge expressive head, compact powerful body, bright Korean folklore styling`, { triangleTarget: '10k-18k' })));
let index = 0;
for (const theme of weaponThemes) for (const type of weaponTypes) assets.push(make('weapon', index++, `${theme} ${type}`, `premium stylized Korean fantasy ${type}, ${theme} theme, minimum 18% character height, oversized readable shape, hand-painted stylized PBR, rounded bevel, white background orthographic prop turnaround`, { triangleTarget: '1k-4k' }));
index = 0;
for (const group of uiGroups) for (const item of uiItems) assets.push(make('ui', index++, `${group} ${item}`, `Premium Mobile Game UI, Korean Fantasy, Gold Border, Blue Glow, Rounded, Depth, Drop Shadow, hover 105%, pressed 95%, No Text, ${group} ${item}, 1024x1024`, { minimumReadability: '32px' }));
index = 0;
for (const element of vfxElements) for (const event of vfxEvents) assets.push(make('vfx', index++, `${element} ${event}`, `Stylized Magic Effect, ${element} energy, ${event}, Outer Glow, Inner Glow, Gradient, Minimal Noise, Blur 10%, Round Cute Particles, bright mobile game visibility, transparent background`, { atlasReady: true }));
index = 0;
for (const variant of environmentVariants) for (const type of environmentTypes) assets.push(make('environment', index++, `${variant} ${type}`, `stylized Korean fantasy ${type}, ${variant} variant, Large Shape, Simple Detail, Soft Edge, Hand Painted, bright soft shadow, rounded low poly shape, game ready, orthographic front side top views`, { gridMeters: 8 }));

const counts = assets.reduce((acc, asset) => ((acc[asset.category] = (acc[asset.category] || 0) + 1), acc), {});
const document = {
  schemaVersion: 1,
  styleLockId: ART_STYLE_LOCK_ID,
  generatedBy: 'scripts/generate-aaa-prompt-catalog.mjs',
  counts,
  total: assets.length,
  rules: {
    commonPromptImmutable: true,
    negativePromptImmutable: true,
    characterTurnaroundViews: 5,
    mirroredRuntimeDirections: 11,
    productionApprovalRequired: true
  },
  assets
};
const text = `${JSON.stringify(document, null, 2)}\n`;
if (checkOnly) {
  if (!existsSync(output)) throw new Error('AAA prompt catalog missing');
  const current = readFileSync(output, 'utf8');
  if (current !== text) throw new Error('AAA prompt catalog is stale. Run npm run generate:prompt-catalog');
  console.log(`PASS AAA prompt catalog ${assets.length} entries`);
} else {
  writeFileSync(output, text);
  console.log(`WROTE ${output} (${assets.length} entries)`);
}
