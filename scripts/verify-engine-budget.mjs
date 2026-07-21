import { createPremiumGuardian, createPremiumEnemy, createPremiumSacredTree } from '../src/premium-assets.js';
import { UNIT_TYPES, RANKS, ENEMY_TYPES } from '../src/game-data.js';
import { countObjectTriangles } from '../src/engine/geometry-budget.js';
import { MOBILE_ENGINE_CONFIG } from '../src/engine/engine-config.js';

const failures = [];
const check = (label, root, limit) => {
  const triangles = countObjectTriangles(root);
  if (triangles > limit) failures.push(`${label}: ${triangles} > ${limit}`);
  else console.log(`PASS ${label}: ${triangles}/${limit} triangles`);
};
for (const [type, config] of Object.entries(UNIT_TYPES)) {
  check(`premium guardian ${type}`, createPremiumGuardian(type, 5, config, RANKS[4]), MOBILE_ENGINE_CONFIG.budgets.unitTriangles);
}
for (const [type, config] of Object.entries(ENEMY_TYPES)) {
  check(`premium enemy ${type}`, createPremiumEnemy(type, config), config.boss ? MOBILE_ENGINE_CONFIG.budgets.bossTriangles : MOBILE_ENGINE_CONFIG.budgets.enemyTriangles);
}
check('premium sacred tree', createPremiumSacredTree(), 9000);
if (failures.length) { failures.forEach((failure) => console.error(`FAIL ${failure}`)); process.exit(1); }
console.log('Moon Forge 폴리곤 예산 검증 완료');
