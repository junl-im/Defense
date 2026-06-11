import type { EnemyConfig, TowerKind, WaveSpawn } from './types';

export type WaveAdvisorV29 = {
  title: string;
  recommendedTower: TowerKind;
  reason: string;
  color: number;
};

export function isLiteModeV29(): boolean {
  if (typeof window === 'undefined') return false;
  const query = new URLSearchParams(window.location.search);
  return query.has('lite') || query.has('battery');
}

export function capCombatDeltaV29(deltaMs: number): number {
  // Large mobile frame spikes make enemies jump and make input feel broken.
  // Clamp simulation delta while the visual frame recovers.
  return Math.min(deltaMs, isLiteModeV29() ? 42 : 50);
}

export function towerRoleLineV29(kind: TowerKind): string {
  if (kind === 'archer') return '공중/고속 대응';
  if (kind === 'mage') return '장갑/느린 강적 대응';
  if (kind === 'barracks') return '길막/시간 벌기';
  return '무리/마법저항 대응';
}

export function recommendTowerForWaveV29(groups: WaveSpawn[], enemyMap: Record<string, EnemyConfig>): WaveAdvisorV29 {
  const enemies = groups.map((group) => enemyMap[group.kind]).filter(Boolean);
  const flying = enemies.some((enemy) => enemy.flying);
  const armor = enemies.some((enemy) => enemy.armor > 0.34 || enemy.threat === 'tank');
  const magicResist = enemies.some((enemy) => enemy.magicResist > 0.34);
  const fast = enemies.some((enemy) => enemy.threat === 'fast' || enemy.speed > 115);
  const swarmCount = groups.reduce((sum, group) => sum + group.count, 0);

  if (flying) return { title: '추천: 궁수', recommendedTower: 'archer', reason: '공중 적은 병영/포탑이 못 때립니다.', color: 0x9fd7ff };
  if (armor) return { title: '추천: 마법', recommendedTower: 'mage', reason: '장갑 적은 물리 피해를 많이 줄입니다.', color: 0xcaa4ff };
  if (magicResist || swarmCount >= 22) return { title: '추천: 포탑', recommendedTower: 'artillery', reason: '무리 적과 마법저항 적을 광역으로 정리합니다.', color: 0xffc16b };
  if (fast) return { title: '추천: 병영', recommendedTower: 'barracks', reason: '빠른 적은 길막 후 집중화력이 안정적입니다.', color: 0x8be878 };
  return { title: '추천: 균형 배치', recommendedTower: 'archer', reason: '궁수+병영으로 첫 라인을 안정화하세요.', color: 0xffd56c };
}

export function mobileShortNumberV29(value: number): string {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 10000) return `${Math.round(value / 1000)}K`;
  return `${value}`;
}
