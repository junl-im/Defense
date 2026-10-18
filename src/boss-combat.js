// Deterministic three-pattern boss controller. All logic can be unit tested without WebGL.
import { clamp } from './logic.js';

const LANES = Object.freeze([-3.1, 0, 3.1]);
export const BOSS_PATTERN_NAMES = Object.freeze({
 lane: '지정 구역 내려찍기',
 sweep: '양측 광역 공격',
 pulse: '중앙 마력 충격파'
});
export function nearestLane(x) {
 return LANES.reduce((best, current) =>
  Math.abs(current-x)<Math.abs(best-x)?current:best, LANES[0]);
}
export function makeBossAttack(phase, count, x, now) {
 if (![1,2,3].includes(phase)) throw new Error('Invalid boss phase');
 if (!Number.isFinite(now)|| !Number.isFinite(x)) throw new Error('Invalid attack coordinates');
 const types = phase===1?['lane']:phase===2?['lane','sweep']:['lane','sweep','pulse'];
 const type=types[Math.abs(Math.trunc(count))%types.length];
 const warningSeconds=phase===3?.7:phase===2?.85:1.05;
 const cadence=phase===3?1.85:phase===2?2.45:2.85;
 return {
  type,
  title:BOSS_PATTERN_NAMES[type],
  phase,
  lane:type==='lane'?nearestLane(clamp(x,-4.9,4.9)):0,
  createdAt:now,
  executeAt:now+warningSeconds,
  nextAttackAt:now+cadence
 };
}
export function hitsHero(attack,x) {
 if (!attack || !Number.isFinite(x)) return false;
 if (attack.type==='lane') return Math.abs(x-attack.lane)<1.45;
 if (attack.type==='sweep') return Math.abs(x)>1.55;
 if (attack.type==='pulse') return Math.abs(x)<2.55;
 return false;
}
export function bossCasualties(units,attack) {
 const size=Math.max(0,Math.floor(units));
 if (!size || !attack) return 0;
 const phase=clamp(attack.phase,1,3);
 const base=attack.type==='lane'?4:attack.type==='sweep'?6:7;
 const scaling=attack.type==='pulse'?.18:attack.type==='sweep'?.13:.09;
 return Math.min(size,Math.max(base+phase,Math.ceil(size*scaling)));
}
