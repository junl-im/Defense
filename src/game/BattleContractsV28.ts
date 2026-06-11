import type { EnemyKind, StageConfig, TowerKind } from './types';

export type BattleContractId =
  | 'clear_kills'
  | 'build_line'
  | 'spell_command'
  | 'flawless_guard'
  | 'combo_chain'
  | 'fast_command'
  | 'anti_air_watch'
  | 'armor_break';

export type BattleContractEvent =
  | { type: 'kill'; enemyKind: EnemyKind; threat?: string; flying?: boolean; armor?: number }
  | { type: 'build'; towerKind: TowerKind }
  | { type: 'spell'; spell: 'meteor' | 'mercenary' | 'hero' }
  | { type: 'leak'; amount: number }
  | { type: 'combo'; streak: number }
  | { type: 'earlyWave' }
  | { type: 'finish'; clearTimeMs: number };

export type BattleContract = {
  id: BattleContractId;
  title: string;
  shortTitle: string;
  description: string;
  icon: string;
  tone: 'blue' | 'gold' | 'green';
  progress: number;
  goal: number;
  rewardGold: number;
  scoreBonus: number;
  completed: boolean;
  claimed: boolean;
  failed?: boolean;
  eventTypes: BattleContractEvent['type'][];
};

export type BattleContractState = {
  contracts: BattleContract[];
  leaks: number;
  earlyWaves: number;
  spellsCast: number;
  towersBuilt: number;
  bestCombo: number;
  contractGoldEarned: number;
  contractScoreEarned: number;
};

const EMPTY_STATE: BattleContractState = {
  contracts: [],
  leaks: 0,
  earlyWaves: 0,
  spellsCast: 0,
  towersBuilt: 0,
  bestCombo: 0,
  contractGoldEarned: 0,
  contractScoreEarned: 0,
};

function hashString(value: string): number {
  let h = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function cloneContract(contract: BattleContract): BattleContract {
  return { ...contract, eventTypes: [...contract.eventTypes] };
}

function baseContracts(stage: StageConfig): BattleContract[] {
  const stageScale = Math.max(1, Math.floor(stage.number / 3));
  const totalWaves = stage.waves.length;
  const flyingHeavy = stage.waves.flat().some((wave) => ['bat', 'wasp', 'specter', 'gargoyle', 'wyvern', 'phoenix', 'dragon'].includes(wave.kind));
  const armorHeavy = stage.waves.flat().some((wave) => ['brute', 'shield', 'troll', 'golem', 'obsidianKnight', 'titan'].includes(wave.kind));

  const pool: BattleContract[] = [
    {
      id: 'clear_kills',
      title: '정찰대 소탕',
      shortTitle: '처치',
      description: '적을 꾸준히 처치해 보급 골드를 확보합니다.',
      icon: 'v2-contract-icon-kill',
      tone: 'gold',
      progress: 0,
      goal: 16 + stage.number * 2,
      rewardGold: 34 + stage.number * 5,
      scoreBonus: 450 + stage.number * 90,
      completed: false,
      claimed: false,
      eventTypes: ['kill'],
    },
    {
      id: 'build_line',
      title: '방어선 완성',
      shortTitle: '건설',
      description: '서로 다른 지점에 타워를 배치해 전선을 만듭니다.',
      icon: 'v2-contract-icon-build',
      tone: 'blue',
      progress: 0,
      goal: Math.min(5, 2 + stageScale),
      rewardGold: 28 + stage.number * 4,
      scoreBonus: 340 + stage.number * 80,
      completed: false,
      claimed: false,
      eventTypes: ['build'],
    },
    {
      id: 'spell_command',
      title: '왕실 전술 시전',
      shortTitle: '스킬',
      description: '메테오/용병/영웅 스킬을 전술적으로 사용합니다.',
      icon: 'v2-contract-icon-spell',
      tone: 'green',
      progress: 0,
      goal: Math.min(5, 2 + stageScale),
      rewardGold: 24 + stage.number * 4,
      scoreBonus: 320 + stage.number * 70,
      completed: false,
      claimed: false,
      eventTypes: ['spell'],
    },
    {
      id: 'flawless_guard',
      title: '무누수 방어',
      shortTitle: '무누수',
      description: '성문을 지켜낸 상태로 스테이지를 클리어합니다.',
      icon: 'v2-contract-icon-flawless',
      tone: 'blue',
      progress: 0,
      goal: 1,
      rewardGold: 42 + stage.number * 6,
      scoreBonus: 700 + stage.number * 120,
      completed: false,
      claimed: false,
      eventTypes: ['leak', 'finish'],
    },
    {
      id: 'combo_chain',
      title: '연속 처치 지휘',
      shortTitle: '연속',
      description: '짧은 시간 안에 연속 처치 흐름을 유지합니다.',
      icon: 'v2-contract-icon-combo',
      tone: 'gold',
      progress: 0,
      goal: 8 + stageScale * 3,
      rewardGold: 30 + stage.number * 4,
      scoreBonus: 520 + stage.number * 85,
      completed: false,
      claimed: false,
      eventTypes: ['combo'],
    },
    {
      id: 'fast_command',
      title: '선제 출격 명령',
      shortTitle: '선제',
      description: '다음 웨이브를 직접 빠르게 호출해 템포 보상을 노립니다.',
      icon: 'v2-contract-icon-speed',
      tone: 'green',
      progress: 0,
      goal: Math.min(4, Math.max(2, Math.floor(totalWaves / 4))),
      rewardGold: 26 + stage.number * 5,
      scoreBonus: 480 + stage.number * 82,
      completed: false,
      claimed: false,
      eventTypes: ['earlyWave'],
    },
  ];

  if (flyingHeavy) {
    pool.push({
      id: 'anti_air_watch',
      title: '공중 감시망',
      shortTitle: '대공',
      description: '비행 적을 빠르게 정리합니다. 궁수/마법 운용에 적합합니다.',
      icon: 'v2-contract-icon-kill',
      tone: 'blue',
      progress: 0,
      goal: 8 + stageScale * 3,
      rewardGold: 32 + stage.number * 5,
      scoreBonus: 520 + stage.number * 95,
      completed: false,
      claimed: false,
      eventTypes: ['kill'],
    });
  }

  if (armorHeavy) {
    pool.push({
      id: 'armor_break',
      title: '장갑 파쇄 작전',
      shortTitle: '장갑',
      description: '장갑/중형 적을 처치해 전선 압박을 낮춥니다.',
      icon: 'v2-contract-icon-kill',
      tone: 'gold',
      progress: 0,
      goal: 5 + stageScale * 2,
      rewardGold: 36 + stage.number * 5,
      scoreBonus: 560 + stage.number * 95,
      completed: false,
      claimed: false,
      eventTypes: ['kill'],
    });
  }

  return pool;
}

export function createBattleContractState(): BattleContractState {
  return { ...EMPTY_STATE, contracts: [] };
}

export function createStageBattleContracts(stage: StageConfig, userKey: string): BattleContractState {
  const seed = hashString(`${userKey}:${stage.id}:battle-contracts-v2.8`);
  const pool = baseContracts(stage)
    .map((contract, index) => ({ contract, score: ((seed >>> (index % 13)) & 63) + (contract.id === 'flawless_guard' ? 48 : 0) }))
    .sort((a, b) => b.score - a.score)
    .map((entry) => cloneContract(entry.contract));
  const chosen = pool.slice(0, 3);
  return { ...createBattleContractState(), contracts: chosen };
}

function setProgress(contract: BattleContract, value: number): void {
  if (contract.failed || contract.completed) return;
  contract.progress = Math.min(contract.goal, Math.max(contract.progress, value));
  if (contract.progress >= contract.goal) contract.completed = true;
}

function increment(contract: BattleContract, amount = 1): void {
  setProgress(contract, contract.progress + amount);
}

export function recordBattleContractEvent(state: BattleContractState, event: BattleContractEvent): BattleContract[] {
  if (event.type === 'leak') state.leaks += event.amount;
  if (event.type === 'earlyWave') state.earlyWaves += 1;
  if (event.type === 'spell') state.spellsCast += 1;
  if (event.type === 'build') state.towersBuilt += 1;
  if (event.type === 'combo') state.bestCombo = Math.max(state.bestCombo, event.streak);

  state.contracts.forEach((contract) => {
    if (contract.completed || contract.failed) return;
    if (!contract.eventTypes.includes(event.type)) return;

    if (contract.id === 'clear_kills' && event.type === 'kill') increment(contract);
    if (contract.id === 'build_line' && event.type === 'build') increment(contract);
    if (contract.id === 'spell_command' && event.type === 'spell') increment(contract);
    if (contract.id === 'flawless_guard') {
      if (event.type === 'leak' && event.amount > 0) contract.failed = true;
      if (event.type === 'finish' && state.leaks <= 0) setProgress(contract, 1);
    }
    if (contract.id === 'combo_chain' && event.type === 'combo') setProgress(contract, event.streak);
    if (contract.id === 'fast_command' && event.type === 'earlyWave') increment(contract);
    if (contract.id === 'anti_air_watch' && event.type === 'kill' && event.flying) increment(contract);
    if (contract.id === 'armor_break' && event.type === 'kill' && ((event.armor ?? 0) >= 0.28 || event.threat === 'tank' || event.threat === 'boss')) increment(contract);
  });

  return claimCompletedBattleContracts(state);
}

export function claimCompletedBattleContracts(state: BattleContractState): BattleContract[] {
  const newlyCompleted = state.contracts.filter((contract) => contract.completed && !contract.claimed);
  newlyCompleted.forEach((contract) => {
    contract.claimed = true;
    state.contractGoldEarned += contract.rewardGold;
    state.contractScoreEarned += contract.scoreBonus;
  });
  return newlyCompleted;
}

export function battleContractHudLine(state: BattleContractState): string {
  const active = state.contracts.find((contract) => !contract.completed && !contract.failed) ?? state.contracts.find((contract) => contract.completed) ?? state.contracts[0];
  if (!active) return '계약 대기';
  const done = state.contracts.filter((contract) => contract.completed).length;
  const status = active.failed ? '실패' : active.completed ? '완료' : `${active.progress}/${active.goal}`;
  return `전장 계약 ${done}/${state.contracts.length} · ${active.shortTitle} ${status}`;
}

export function battleContractDetailLines(state: BattleContractState): string[] {
  return state.contracts.map((contract) => {
    const mark = contract.completed ? '◆' : contract.failed ? '×' : '◇';
    const status = contract.failed ? '실패' : `${contract.progress}/${contract.goal}`;
    return `${mark} ${contract.shortTitle} ${status}`;
  });
}

export function battleContractResultLines(state: BattleContractState): string[] {
  if (state.contracts.length === 0) return ['전장 계약 없음'];
  return state.contracts.map((contract) => {
    const mark = contract.completed ? '★' : contract.failed ? '×' : '☆';
    const status = contract.failed ? '실패' : `${contract.progress}/${contract.goal}`;
    return `${mark} ${contract.title} ${status}  +$${contract.completed ? contract.rewardGold : 0}`;
  });
}
