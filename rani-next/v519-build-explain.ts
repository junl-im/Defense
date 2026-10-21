// Rani v5.19: pure presentation of source-of-truth construction cost.
// This module reads original Fiefdom definitions; it never changes stock or rules.
import { RESOURCE_LABELS, type BuildingDef, type Resource } from '../game/defs';

export type BuildCostLine = { resource: Resource; need: number; have: number; label: string; enough: boolean };

export function describeBuildingCost(def: BuildingDef, stock: Record<Resource, number>): {
  footprint: string; cost: string; missing: string; enough: boolean; lines: BuildCostLine[];
} {
  const lines = Object.entries(def.cost).filter(([,n])=>Number(n)>0).map(([r,n])=>{
    const resource=r as Resource,need=Number(n),have=Number(stock[resource]||0);
    return {resource,need,have,label:RESOURCE_LABELS[resource]||r,enough:have>=need};
  });
  const [width,depth]=def.footprint;
  const footprint=width+'×'+depth+'칸';
  return {
    footprint,
    cost:lines.length?lines.map(l=>l.label+' '+l.need+' / '+l.have).join(' · '):'건설 재료 없음',
    missing:lines.filter(l=>!l.enough).map(l=>l.label+' '+(l.need-l.have)).join(' · '),
    enough:lines.every(l=>l.enough),
    lines,
  };
}
