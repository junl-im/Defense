// Contextual empty-land construction plans. Pure decision logic: no WebGL/DOM.
// A combined plan is shown only when tile cost + actual building cost are affordable.
import { TILE_TYPES } from '../tiles/TileDefs.js';
import { BUILDINGS } from '../config/BuildingConfig.js';
import { scaledTileCost } from '../config/EconomyConfig.js';

export const QUICK_COMBOS = Object.freeze([
  { type:'forest', building:'lumber_mill', label:'숲 + 벌목장' },
  { type:'field', building:'farm', label:'농지 + 농장' },
  { type:'mountain', building:'mine', label:'산지 + 광산' },
]);

export function buildPlans(game, q, r) {
  if (game.grid.has(q,r) || !game.grid.canPlace(q,r) ||
      !game.nativeVillage.allows(q,r)) return [];
  const prog=game.progressionSystem;
  const space=prog.underTileCap(game.tilesPlaced);
  const plans=[];
  for (const [type,def] of Object.entries(TILE_TYPES)) {
    if (!prog.isUnlocked(type)) continue;
    const cost=scaledTileCost(type,game.tilesPlaced);
    plans.push({id:'tile:'+type,type,building:null,label:def.name,cost,
      ok:space&&game.resourceSystem.canAfford(cost),
      reason:!space?'영토 한도 초과':(!game.resourceSystem.canAfford(cost)?'자원이 부족합니다':'')});
  }
  for (const combo of QUICK_COMBOS) {
    const def=BUILDINGS[combo.building];
    if(!def || !prog.isUnlocked(combo.type)) continue;
    if (def.research && !game.researchSystem.isCompleted(def.research)) continue;
    if(def.upgradeOnly || def.context || def.townOnly || def.frontierOnly ||
      (def.tiles!=='*'&&!def.tiles.includes(combo.type))) continue;
    const tileCost=scaledTileCost(combo.type,game.tilesPlaced);
    const total={...tileCost};
    for(const [res,qty] of Object.entries(def.cost))total[res]=(total[res]||0)+qty;
    const affordable=game.resourceSystem.canAfford(total);
    plans.unshift({id:'combo:'+combo.building,type:combo.type,building:combo.building,
      label:combo.label,cost:total,ok:space&&affordable,
      reason:!space?'영토 한도 초과':(!affordable?'자원이 부족합니다':'')});
  }
  return plans;
}
