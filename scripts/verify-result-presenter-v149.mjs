import { buildRunResultPresentationV149 } from '../src/runtime/result-presenter-v149.js';
const assert = (value, message) => { if (!value) throw new Error(message); };
const input = {
  won: true, score: 1000, coreHp: 10, kills: 12, maxRank: 4,
  units: [{ type: 'fox', rank: 2 }, { type: 'fox', rank: 4 }, { type: 'moon', rank: 3, showcase: true }],
  unitTypes: { fox: { symbol: '狐', name: '달여우' } },
  runStats: { damageByType: { fox: 1234 }, commandsUsed: 2, commandDamage: 300, moveOrders: 3, coinsCollected: 4, dangerDodges: 5, bossKills: 1, eliteKills: 2, wardBlocks: 3, jackpotTriggers: 4, trialsCompleted: 1, relicsChosen: 2, relicSetsActivated: 1, eliteBurstDodges: 1, eliteBurstHits: 0, bossHazardHits: 1, guardianBursts: 2, maxKillChain: 9, dashUses: 4, codexDiscoveries: 3, codexDrops: 2, weaknessUnlocks: 1, weaknessHits: 7, actsCleared: 2, bossBreaks: 1 },
  activeRunMode: { icon: '月', name: '월식' }, runSeed: 'V149', dailyEdict: { icon: '令', name: '시험' }, selectedSeedModeId: 'daily',
  guardianCouncil: { bond: { icon: '鬼', name: '맹약' }, support: { name: '후원' } }, equipmentState: { forged: 2, essence: 8 }
};
const result = buildRunResultPresentationV149(input);
assert(result.finalScore === 6300 && result.scoreText === '6,300', 'winning score calculation mismatch');
assert(result.unitsHtml.includes('달여우') && result.unitsHtml.includes('★★★★') && !result.unitsHtml.includes('moon'), 'unit summary mismatch');
assert(result.analysisHtml.includes('V149') && result.analysisHtml.includes('월식'), 'result analysis missing run identity');
assert(input.score === 1000, 'presenter must not mutate source state');

const hostile = '<img src=x onerror=alert(1)>';
const hardened = buildRunResultPresentationV149({
  won: true,
  score: Number.NaN,
  units: [{ type: 'hostile', rank: 1 }],
  unitTypes: { hostile: { symbol: hostile, name: hostile } },
  runStats: { damageByType: { hostile: 10 } },
  activeRunMode: { icon: hostile, name: hostile },
  runSeed: hostile,
  dailyEdict: { icon: hostile, name: hostile },
  guardianCouncil: { bond: { icon: hostile, name: hostile }, support: { name: hostile } }
});
assert(hardened.finalScore === 5000, 'invalid score must normalize before victory bonus');
assert(!hardened.unitsHtml.includes('<img') && !hardened.analysisHtml.includes('<img'), 'dynamic result strings must be HTML-escaped');
assert(hardened.unitsHtml.includes('&lt;img') && hardened.analysisHtml.includes('&lt;img'), 'escaped result evidence missing');
console.log('PASS v1.0.49 result presentation remains deterministic and v1.0.52 hardening escapes dynamic HTML and invalid scores');
