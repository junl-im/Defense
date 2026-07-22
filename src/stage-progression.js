export const STAGE_ROADMAP = Object.freeze([
  Object.freeze({ id: 'goblin-village', name: '도깨비마을', accent: '#ffd66d', status: 'active' }),
  Object.freeze({ id: 'bamboo-forest', name: '대나무숲', accent: '#7be6a1', status: 'planned' }),
  Object.freeze({ id: 'ruined-temple', name: '폐사찰', accent: '#bb91ff', status: 'planned' }),
  Object.freeze({ id: 'snow-mountain', name: '설산', accent: '#9deaff', status: 'planned' }),
  Object.freeze({ id: 'dragon-palace', name: '용궁', accent: '#5edcff', status: 'planned' }),
  Object.freeze({ id: 'underworld', name: '저승', accent: '#ff6686', status: 'planned' }),
  Object.freeze({ id: 'celestial-realm', name: '천계', accent: '#ffe496', status: 'planned' })
]);

const VILLAGE_ZONES = Object.freeze([
  Object.freeze({ from: 0, to: 2, name: '달문 입구', icon: '門', copy: '사방 귀문을 봉인하세요.' }),
  Object.freeze({ from: 3, to: 5, name: '야시장 거리', icon: '市', copy: '상점가를 침범한 요괴를 몰아냅니다.' }),
  Object.freeze({ from: 6, to: 8, name: '신목 광장', icon: '木', copy: '신목 결계를 지키며 정예를 상대합니다.' }),
  Object.freeze({ from: 9, to: 10, name: '만월 제단', icon: '月', copy: '월식 보스와 마지막 결전을 준비합니다.' })
]);

export function getStageProgress(wave = 0, maxWaves = 10) {
  const normalizedWave = Math.max(0, Math.floor(Number(wave) || 0));
  const zone = VILLAGE_ZONES.find((entry) => normalizedWave >= entry.from && normalizedWave <= entry.to) || VILLAGE_ZONES.at(-1);
  return Object.freeze({
    stage: STAGE_ROADMAP[0],
    zone,
    wave: normalizedWave,
    progress: Math.min(1, Math.max(0, normalizedWave / Math.max(1, maxWaves)))
  });
}
