// Deterministic obstruction and auto-fire damage. No Babylon dependency.
export const BARRICADE_MAX_HP=300;
export const BARRICADE_Z=62;
export const BARRICADE_HOLD_Z=58.8;
export function barricadeDps(units) {
  const count=Math.max(0,Math.min(10000,Math.floor(Number(units)||0)));
  // Heroine base weapon remains functional even after the squad loses members.
  return 18+count*.82;
}
export function stepBarricade(hp, units, dt) {
  const before=Math.max(0,Number(hp)||0);
  const seconds=Math.max(0,Math.min(.35,Number(dt)||0));
  const damage=Math.min(before,barricadeDps(units)*seconds);
  return {hp:Math.max(0,before-damage),damage,destroyed:before>0&&before-damage<=0};
}
export function advanceTowardsBarricade(currentZ, speedDelta, hp) {
  const next=currentZ+Math.max(0,speedDelta);
  return hp>0?Math.min(BARRICADE_HOLD_Z,next):next;
}
