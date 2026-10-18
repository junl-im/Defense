export function applyGate(units, type, value) {
  const u = Math.max(0, Math.floor(Number(units) || 0));
  const v = Math.max(0, Math.floor(Number(value) || 0));
  if (!['add','multiply','subtract'].includes(type)) throw new Error('unknown gate');
  return Math.min(10000, Math.max(0, type==='add' ? u+v : type==='multiply' ? u*v : u-v));
}
export function phaseForHp(hp, maxHp) {
  const ratio=Math.max(0,Math.min(1,hp/Math.max(1,maxHp)));
  return ratio>0.65?1:ratio>0.30?2:3;
}
export const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
