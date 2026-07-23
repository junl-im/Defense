import { UNIT_TYPES, UNIT_KEYS, ENEMY_TYPES } from './game-data.js';
import { BOSS_PROFILES } from './boss-director.js';

const V13 = (category, row, column) => `assets/ip-v13/crops/${category}/${category}-r${String(row).padStart(2, '0')}-c${String(column).padStart(2, '0')}.png`;

export const CODEX_SECTION_ORDER = Object.freeze(['guardian', 'monster', 'boss', 'world', 'effect']);

export const CODEX_SECTION_META = Object.freeze({
  guardian: Object.freeze({ label: '수호대', icon: '鬼', copy: '근거리에서도 한눈에 역할이 읽히는 도깨비 실루엣' }),
  monster: Object.freeze({ label: '요괴', icon: '妖', copy: '이동 방식과 위험 패턴이 몸의 형태만으로 구분되는 적' }),
  boss: Object.freeze({ label: '월식 보스', icon: '王', copy: '화면을 장악하지만 약점과 공격 예고가 또렷한 거대 실루엣' }),
  world: Object.freeze({ label: '전장', icon: '月', copy: '조선 야시장과 달빛 신앙을 결합한 모듈형 타일 오브젝트' }),
  effect: Object.freeze({ label: '기술 효과', icon: '✦', copy: '작은 화면에서도 속성·방향·위험도를 읽을 수 있는 발사체와 장판' })
});

const GUARDIAN_ART = Object.freeze({
  ember: { art: V13('heroes', 4, 6), shape: '둥근 머리 · 앞으로 기운 상체 · 긴 불꼬리', motif: '도깨비불 화로와 장터 숯집', signature: '손끝에서 피어나는 주황 도깨비불', danger: '연사 누적 화력' },
  frost: { art: V13('heroes', 4, 5), shape: '낮은 갓 · 넓은 소매 · 얼음 방울 장식', motif: '서리 낀 청자와 달무늬 비녀', signature: '푸른 서리 구슬과 얼음 띠', danger: '둔화·결계' },
  wind: { art: V13('heroes', 5, 1), shape: '높은 갓 · 가는 팔 · 뒤로 흐르는 천', motif: '선비 갓과 바람 부적', signature: '초록 화살과 얇은 절단선', danger: '장거리 관통' },
  stone: { art: V13('heroes', 4, 4), shape: '짧고 넓은 몸 · 큰 몽둥이 · 바위 어깨', motif: '장승과 산신 돌무더기', signature: '금빛 균열이 난 낙석', danger: '범위 충격' },
  bell: { art: V13('heroes', 1, 4), shape: '삼각 무당모 · 방울 소매 · 떠 있는 부적', motif: '무속 방울과 오방색 매듭', signature: '자주색 혼령 파동과 방울 궤적', danger: '연쇄 전이' },
  thunder: { art: V13('heroes', 1, 3), shape: '각진 투구 · 넓은 어깨 · 번개 깃발', motif: '벽사 문양과 장군 갑주', signature: '노란 낙뢰 표식과 심판 번개', danger: '단일 처형' }
});

const MONSTER_ART = Object.freeze({
  imp: { art: V13('monsters', 1, 4), symbol: '牙', shape: '큰 귀 · 짧은 팔다리 · 비대칭 뿔', motif: '장터 장난감과 깨진 탈', signature: '붉은 손톱과 튀는 웃음', danger: '기본 돌격' },
  runner: { art: V13('monsters', 3, 4), symbol: '走', shape: '앞으로 숙인 몸 · 긴 종아리 · 뒤집힌 상투', motif: '두억시니와 짚신', signature: '주황 잔상과 돌진선', danger: '고속 침투' },
  brute: { art: V13('monsters', 4, 2), symbol: '岩', shape: '거대한 상체 · 짧은 목 · 돌판 갑옷', motif: '성벽 돌과 무덤 석상', signature: '보라 균열과 묵직한 발자국', danger: '고체력 압박' },
  shaman: { art: V13('monsters', 2, 3), symbol: '呪', shape: '긴 팔 · 기울어진 탈 · 부적 치마', motif: '버려진 굿판과 젖은 부적', signature: '청록 저주 원과 떠도는 종이', danger: '장판 유도' },
  ghost: { art: V13('monsters', 1, 7), symbol: '魂', shape: '큰 얼굴 · 흐르는 꼬리 · 비어 있는 발', motif: '달그림자와 혼백 등불', signature: '청백 반투명 몸과 자주 후광', danger: '결계 침투' },
  skeleton: { art: V13('monsters', 1, 8), symbol: '骨', shape: '큰 해골 · 넓은 방패 · 짧은 다리', motif: '폐사찰 갑주와 백골 무사', signature: '상아색 뼈와 금빛 방패 문양', danger: '방패 압박' },
  crow: { art: V13('monsters', 4, 5), symbol: '烏', shape: '넓은 날개 · 작은 몸 · 날카로운 부리', motif: '먹구름과 까마귀 장승', signature: '보라 날개 잔상과 노란 부리', danger: '고속 우회' }
});

const BOSS_ART = Object.freeze({
  tiger: { art: V13('mixed', 2, 1), symbol: '虎', shape: '낮게 엎드린 거대 호랑이 · 칼날 같은 등털', motif: '산군과 저승사자 홍색 띠', signature: '붉은 돌진선과 지면 충격파', danger: '돌진·도약' },
  serpent: { art: V13('bosses', 5, 3), symbol: '龍', shape: 'S자 몸통 · 달조각 비늘 · 뿔 달린 머리', motif: '이무기와 청동 용뉴', signature: '청록 독월 고리와 혼령 덫', danger: '영역 봉쇄' },
  king: { art: V13('bosses', 5, 4), symbol: '王', shape: '거대한 탈 얼굴 · 다층 왕관 · 떠 있는 팔', motif: '백귀야행 두루마리와 월식 가면', signature: '자주색 행진선과 처형 낙하', danger: '3페이즈 복합전' }
});

const WORLD_ENTRIES = Object.freeze([
  { id: 'sacred-tree', art: V13('environment', 3, 1), symbol: '木', name: '천년 신목', subtitle: '핵심 방어 오브젝트', shape: '멀리서도 보이는 굽은 줄기와 달고리 수관', motif: '당산나무 · 금줄 · 오방색 천', signature: '뿌리 룬과 잎 사이 혼불', danger: '파괴 시 원정 종료' },
  { id: 'monster-gate', art: V13('environment', 2, 2), symbol: '門', name: '요괴문', subtitle: '적 출현 포털', shape: '비뚤어진 기둥과 갈라진 문지방', motif: '솟대 · 홍살문 · 깨진 탈', signature: '징조 색으로 변하는 내부 소용돌이', danger: '습격 방향 표시' },
  { id: 'market-stall', art: V13('environment', 2, 1), symbol: '市', name: '달빛 야시장', subtitle: '배경 타일 세트', shape: '낮은 포목 지붕과 비대칭 가판대', motif: '조선 장터 · 한지 등 · 엽전 끈', signature: '따뜻한 등불과 차가운 월광의 대비', danger: '카메라 시야 가림 최소화' },
  { id: 'lantern-post', art: V13('environment', 1, 2), symbol: '燈', name: '혼불 등주', subtitle: '길찾기 랜드마크', shape: '가느다란 기둥과 큰 등불 머리', motif: '청사초롱 · 방울 · 부적', signature: '약한 청록 맥동과 바닥 방향광', danger: '전장 경계 인식' },
  { id: 'jangseung', art: V13('environment', 1, 7), symbol: '將', name: '월식 장승', subtitle: '외곽 장식 오브젝트', shape: '과장된 눈과 비뚤어진 이빨의 세로 실루엣', motif: '천하대장군 · 지하여장군', signature: '징조마다 눈빛 색 변화', danger: '외곽 동선 표식' },
  { id: 'moon-jar', art: V13('items', 4, 7), symbol: '壺', name: '달항아리 제단', subtitle: '상호작용 후보', shape: '둥근 백자와 낮은 돌 제단', motif: '조선 백자 달항아리 · 금박 균열', signature: '혼불이 차오르는 반투명 표면', danger: '보상·정화 이벤트 슬롯' },
  { id: 'stone-tile', art: V13('environment', 5, 2), symbol: '石', name: '월문 석판', subtitle: '모듈형 바닥 타일', shape: '8m 단위 판석과 끊어진 원형 문양', motif: '기와 문양 · 연꽃 · 귀면와', signature: '징조에 따라 약하게 발광하는 홈', danger: '장판 대비를 해치지 않는 저채도' },
  { id: 'market-clutter', art: V13('environment', 4, 4), symbol: '物', name: '야시장 소품군', subtitle: '저비용 인스턴스 세트', shape: '상자·바구니·천·엽전 더미의 높낮이 묶음', motif: '대나무 광주리 · 포목 · 약재함', signature: '3~5개 묶음 랜덤 배치', danger: '이동 충돌 없이 밀도 보강' }
]);

const EFFECT_ENTRIES = Object.freeze([
  { id: 'ember-orb', art: V13('vfx', 5, 1), symbol: '火', name: '도깨비불 탄환', subtitle: '화염 발사체', shape: '앞이 밝고 꼬리가 갈라지는 짧은 혜성', motif: '불씨 · 귀면', signature: '주황 핵 + 자주 외곽 불꽃', danger: '아군 빠른 탄환' },
  { id: 'frost-orb', art: V13('vfx', 1, 4), symbol: '氷', name: '월빙 구슬', subtitle: '둔화 발사체', shape: '납작한 얼음 달과 얇은 결정 꼬리', motif: '반달 · 서리꽃', signature: '청백 핵 + 육각 파편', danger: '둔화 상태 명확화' },
  { id: 'wind-arrow', art: V13('combat-props', 1, 1), symbol: '風', name: '천풍 화살', subtitle: '관통 발사체', shape: '가늘고 긴 V자 절단선', motif: '부적 끝 · 갓끈', signature: '초록 중심선 + 투명 공기 칼날', danger: '관통 방향 표시' },
  { id: 'stone-drop', art: V13('combat-props', 5, 3), symbol: '山', name: '태산 낙석', subtitle: '광역 발사체', shape: '불규칙 십이면체와 굵은 낙하 그림자', motif: '산신석 · 금빛 균열', signature: '착지 전 원형 그림자와 먼지 고리', danger: '범위 공격 예고' },
  { id: 'spirit-chain', art: V13('vfx', 1, 1), symbol: '魂', name: '백귀 방울파', subtitle: '연쇄 효과', shape: '방울에서 방울로 이어지는 굽은 리본', motif: '무당 방울 · 혼백', signature: '자주 리본 + 작은 부적 파편', danger: '연쇄 대상 순서 표시' },
  { id: 'thunder-mark', art: V13('vfx', 4, 6), symbol: '雷', name: '천뢰 심판표', subtitle: '처형 효과', shape: '세 갈래 낙뢰와 바닥 귀면 인장', motif: '벽사문 · 번개 북', signature: '노란 예고 인장 후 백색 낙뢰', danger: '강한 순간 타격' },
  { id: 'enemy-telegraph', art: V13('vfx', 3, 6), symbol: '警', name: '요괴 위험 예고', subtitle: '적 장판 공통 규칙', shape: '외곽선이 먼저 차오르고 중심은 비워 둔 링', motif: '붉은 금줄 · 깨진 부적', signature: '위험도별 선 굵기와 점멸 속도 차등', danger: '회피 가능 시간 전달' },
  { id: 'guardian-burst', art: V13('vfx', 6, 2), symbol: '神', name: '수호신 폭주', subtitle: '궁극 상태 효과', shape: '플레이어 뒤 거대한 반투명 귀면과 불꽃 띠', motif: '수호신 탈 · 월광 후광', signature: '청록 핵 + 금빛 가장자리', danger: '10초 강화 상태' }
]);

function guardianEntries() {
  return UNIT_KEYS.map((id) => {
    const unit = UNIT_TYPES[id];
    return {
      id,
      symbol: unit.symbol,
      name: unit.name,
      subtitle: `${unit.element} · ${unit.role}`,
      description: unit.description,
      ultimate: `5성 궁극 · ${unit.ultimateName}`,
      color: unit.color,
      ...GUARDIAN_ART[id]
    };
  });
}

function monsterEntries() {
  return Object.entries(ENEMY_TYPES)
    .filter(([, enemy]) => !enemy.boss)
    .map(([id, enemy]) => ({
      id,
      name: enemy.name,
      subtitle: `체력 ${enemy.hp} · 이동 ${enemy.speed}`,
      description: `${enemy.reward} 엽전을 떨어뜨리는 ${MONSTER_ART[id].danger} 요괴입니다.`,
      color: enemy.color,
      ...MONSTER_ART[id]
    }));
}

function bossEntries() {
  return Object.entries(ENEMY_TYPES)
    .filter(([, enemy]) => enemy.boss)
    .map(([id, enemy]) => ({
      id,
      name: enemy.name,
      subtitle: `${BOSS_PROFILES[id]?.phases || 1}페이즈 · 체력 ${enemy.hp}`,
      description: BOSS_PROFILES[id]?.intent || '월식 보스 패턴',
      color: enemy.color,
      ...BOSS_ART[id]
    }));
}

export function getCodexEntries(section = 'guardian') {
  if (section === 'guardian') return guardianEntries();
  if (section === 'monster') return monsterEntries();
  if (section === 'boss') return bossEntries();
  if (section === 'world') return WORLD_ENTRIES;
  if (section === 'effect') return EFFECT_ENTRIES;
  return guardianEntries();
}

export function getCodexTotals() {
  return Object.fromEntries(CODEX_SECTION_ORDER.map((section) => [section, getCodexEntries(section).length]));
}
