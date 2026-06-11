import Phaser from 'phaser';
import type { StageConfig, TowerKind } from './types';

export type TacticalOrderId =
  | 'royal_stipend'
  | 'engineer_guild'
  | 'hero_vanguard'
  | 'mana_circuit'
  | 'bulwark_line'
  | 'rapid_command'
  | 'ranger_lanes'
  | 'arcane_bloom'
  | 'mercenary_contract';

export type TacticalOrderChoice = {
  id: TacticalOrderId;
  title: string;
  tag: string;
  description: string;
  icon: string;
  color: number;
  priority: 'economy' | 'defense' | 'offense' | 'utility';
  effects: {
    instantGold?: number;
    healLives?: number;
    costMultiplier?: number;
    towerDamageMultiplier?: number;
    towerFireRateMultiplier?: number;
    heroDamageMultiplier?: number;
    cooldownReductionMs?: number;
    meteorDamageMultiplier?: number;
    mercenaryExtra?: number;
    overdriveMs?: number;
    preferredTower?: TowerKind;
  };
};

export type TacticalOrderState = {
  chosen: TacticalOrderChoice[];
  costMultiplier: number;
  towerDamageMultiplier: number;
  towerFireRateMultiplier: number;
  heroDamageMultiplier: number;
  meteorDamageMultiplier: number;
  mercenaryExtra: number;
  lastDraftWave: number;
};

export function createTacticalOrderState(): TacticalOrderState {
  return {
    chosen: [],
    costMultiplier: 1,
    towerDamageMultiplier: 1,
    towerFireRateMultiplier: 1,
    heroDamageMultiplier: 1,
    meteorDamageMultiplier: 1,
    mercenaryExtra: 0,
    lastDraftWave: -99,
  };
}

const ORDER_POOL: TacticalOrderChoice[] = [
  {
    id: 'royal_stipend',
    title: '왕실 보급 계약',
    tag: '경제',
    description: '즉시 골드 획득. 다음 타워 배치가 쉬워집니다.',
    icon: 'v2-order-icon-gold-v27',
    color: 0xffd56c,
    priority: 'economy',
    effects: { instantGold: 92 },
  },
  {
    id: 'engineer_guild',
    title: '공병 길드 파견',
    tag: '건설',
    description: '모든 타워 건설 비용이 감소합니다.',
    icon: 'v2-order-icon-engineer-v27',
    color: 0x7ce8ff,
    priority: 'economy',
    effects: { costMultiplier: 0.92 },
  },
  {
    id: 'hero_vanguard',
    title: '영웅 선봉 명령',
    tag: '영웅',
    description: '영웅 피해량 증가. 전선 돌파 대응력이 좋아집니다.',
    icon: 'v2-order-icon-hero-v27',
    color: 0xffa86b,
    priority: 'defense',
    effects: { heroDamageMultiplier: 1.16, healLives: 1 },
  },
  {
    id: 'mana_circuit',
    title: '마력 회로 재정렬',
    tag: '스킬',
    description: '스킬 쿨타임 즉시 감소. 메테오 피해가 소폭 상승합니다.',
    icon: 'v2-order-icon-mana-v27',
    color: 0xaa8cff,
    priority: 'utility',
    effects: { cooldownReductionMs: 6500, meteorDamageMultiplier: 1.08 },
  },
  {
    id: 'bulwark_line',
    title: '방벽 전선 구축',
    tag: '방어',
    description: '생명력 회복. 기존 타워가 짧게 긴급 강화됩니다.',
    icon: 'v2-order-icon-shield-v27',
    color: 0x8be878,
    priority: 'defense',
    effects: { healLives: 3, overdriveMs: 4200 },
  },
  {
    id: 'rapid_command',
    title: '속사 지휘망',
    tag: '공속',
    description: '타워 공격 주기가 소폭 빨라집니다.',
    icon: 'v2-order-icon-speed-v27',
    color: 0xfff0a3,
    priority: 'offense',
    effects: { towerFireRateMultiplier: 0.96 },
  },
  {
    id: 'ranger_lanes',
    title: '궁수 사격로 확보',
    tag: '화력',
    description: '전체 화력 증가. 공중 적 대응이 안정됩니다.',
    icon: 'v2-order-icon-bow-v27',
    color: 0x9fd7ff,
    priority: 'offense',
    effects: { towerDamageMultiplier: 1.055, preferredTower: 'archer' },
  },
  {
    id: 'mercenary_contract',
    title: '용병 계약 갱신',
    tag: '소환',
    description: '용병 소환 수가 증가합니다. 길막 운영이 강해집니다.',
    icon: 'v2-order-icon-shield-v27',
    color: 0xa6ffb0,
    priority: 'defense',
    effects: { mercenaryExtra: 1, cooldownReductionMs: 1800 },
  },
  {
    id: 'arcane_bloom',
    title: '비전 개화',
    tag: '마법',
    description: '마법/포격 중심 운영에 좋은 화력 보정입니다.',
    icon: 'v2-order-icon-arcane-v27',
    color: 0xd69cff,
    priority: 'offense',
    effects: { towerDamageMultiplier: 1.045, cooldownReductionMs: 2400, preferredTower: 'mage' },
  },
];

function hashString(value: string): number {
  let h = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function stagePreference(stage: StageConfig): TacticalOrderId[] {
  if (stage.theme === 'canyon') return ['bulwark_line', 'hero_vanguard', 'rapid_command'];
  if (stage.theme === 'swamp') return ['mana_circuit', 'arcane_bloom', 'engineer_guild'];
  if (stage.theme === 'fortress') return ['bulwark_line', 'ranger_lanes', 'mana_circuit'];
  return ['engineer_guild', 'royal_stipend', 'ranger_lanes'];
}

export function pickTacticalOrderChoices(
  stage: StageConfig,
  userKey: string,
  waveIndex: number,
  state: TacticalOrderState
): TacticalOrderChoice[] {
  const used = new Set(state.chosen.map((choice) => choice.id));
  const preferred = stagePreference(stage);
  const seed = hashString(`${userKey}:${stage.id}:${waveIndex}:${state.chosen.length}`);
  const pool = ORDER_POOL
    .filter((choice) => !used.has(choice.id))
    .map((choice, index) => ({
      choice,
      score: ((seed >>> (index % 12)) & 31) + (preferred.includes(choice.id) ? 100 : 0) + (choice.priority === 'economy' && state.chosen.length === 0 ? 25 : 0),
    }))
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.choice);

  return pool.slice(0, 3);
}

export function shouldOfferTacticalOrder(state: TacticalOrderState, waveIndex: number, totalWaves: number): boolean {
  if (state.chosen.length >= 4) return false;
  if (waveIndex < 0) return state.chosen.length === 0;
  if (waveIndex >= totalWaves - 1) return false;
  if (waveIndex - state.lastDraftWave < 2) return false;
  return waveIndex === 1 || waveIndex === 3 || waveIndex === 5 || waveIndex === 8;
}

export function applyTacticalOrderChoice(state: TacticalOrderState, choice: TacticalOrderChoice, waveIndex: number): void {
  state.chosen.push(choice);
  state.lastDraftWave = waveIndex;
  if (choice.effects.costMultiplier) state.costMultiplier *= choice.effects.costMultiplier;
  if (choice.effects.towerDamageMultiplier) state.towerDamageMultiplier *= choice.effects.towerDamageMultiplier;
  if (choice.effects.towerFireRateMultiplier) state.towerFireRateMultiplier *= choice.effects.towerFireRateMultiplier;
  if (choice.effects.heroDamageMultiplier) state.heroDamageMultiplier *= choice.effects.heroDamageMultiplier;
  if (choice.effects.meteorDamageMultiplier) state.meteorDamageMultiplier *= choice.effects.meteorDamageMultiplier;
  if (choice.effects.mercenaryExtra) state.mercenaryExtra += choice.effects.mercenaryExtra;
}

export function tacticalOrderSummary(state: TacticalOrderState): string {
  if (state.chosen.length === 0) return '작전 카드 대기';
  const last = state.chosen[state.chosen.length - 1];
  const damage = Math.round((state.towerDamageMultiplier - 1) * 100);
  const speed = Math.round((1 - state.towerFireRateMultiplier) * 100);
  const cost = Math.round((1 - state.costMultiplier) * 100);
  const parts = [`${state.chosen.length}장`, last.tag];
  if (damage > 0) parts.push(`화력+${damage}%`);
  if (speed > 0) parts.push(`공속+${speed}%`);
  if (cost > 0) parts.push(`건설-${cost}%`);
  return `작전 ${parts.join(' · ')}`;
}

export function renderTacticalOrderCard(
  scene: Phaser.Scene,
  x: number,
  y: number,
  choice: TacticalOrderChoice,
  onPick: () => void
): Phaser.GameObjects.Container {
  const card = scene.add.container(x, y);
  const bg = scene.textures.exists('v2-order-card-v27')
    ? scene.add.image(0, 0, 'v2-order-card-v27').setDisplaySize(232, 146)
    : scene.add.rectangle(0, 0, 232, 146, 0x09162a, 0.94).setStrokeStyle(3, choice.color, 0.72);
  const halo = scene.add.circle(-80, -39, 24, choice.color, 0.16).setStrokeStyle(2, choice.color, 0.58).setBlendMode(Phaser.BlendModes.ADD);
  const icon = scene.textures.exists(choice.icon)
    ? scene.add.image(-80, -39, choice.icon).setDisplaySize(36, 36)
    : scene.add.star(-80, -39, 5, 6, 19, choice.color, 0.86);
  const tag = scene.add.text(72, -49, choice.tag, {
    fontFamily: 'Pretendard, Noto Sans KR, Arial, sans-serif',
    fontSize: '9px',
    fontStyle: 'bold',
    color: '#092247',
    backgroundColor: '#fff2bd',
    padding: { x: 7, y: 3 },
  }).setOrigin(0.5);
  const title = scene.add.text(-50, -52, choice.title, {
    fontFamily: 'Pretendard, Noto Sans KR, Arial, sans-serif',
    fontSize: '11px',
    fontStyle: 'bold',
    color: '#fff4c2',
    stroke: '#092247',
    strokeThickness: 3,
    fixedWidth: 132,
  }).setOrigin(0, 0.5);
  const desc = scene.add.text(-96, -8, choice.description, {
    fontFamily: 'Pretendard, Noto Sans KR, Arial, sans-serif',
    fontSize: '9px',
    fontStyle: 'bold',
    color: '#dbe7ff',
    fixedWidth: 192,
    lineSpacing: 4,
    wordWrap: { width: 192, useAdvancedWrap: true },
  }).setOrigin(0, 0.5);
  const pick = scene.add.text(0, 53, '선택', {
    fontFamily: 'Pretendard, Noto Sans KR, Arial, sans-serif',
    fontSize: '11px',
    fontStyle: 'bold',
    color: '#fff9d8',
    stroke: '#2a1608',
    strokeThickness: 3,
  }).setOrigin(0.5);
  const hit = scene.add.zone(0, 0, 232, 146).setInteractive({ useHandCursor: true });
  card.add([bg, halo, icon, tag, title, desc, pick, hit]);
  hit.on('pointerover', () => scene.tweens.add({ targets: card, scaleX: 1.035, scaleY: 1.035, duration: 110, ease: 'Sine.easeOut' }));
  hit.on('pointerout', () => scene.tweens.add({ targets: card, scaleX: 1, scaleY: 1, duration: 120, ease: 'Sine.easeOut' }));
  hit.on('pointerdown', () => {
    scene.tweens.add({ targets: card, scaleX: 0.97, scaleY: 0.97, duration: 55, yoyo: true, ease: 'Quad.easeOut' });
    onPick();
  });
  return card;
}
