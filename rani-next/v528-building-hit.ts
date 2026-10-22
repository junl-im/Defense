/** v5.28: pick the actually visible 2.5D building, not just the terrain tile below its roof.
 * Converts the TRUE blueprint footprint into a projected roof+wall silhouette.
 * No extra world collision, save field, raycaster or gameplay state.
 */
export type RaniScreenPoint={x:number;y:number};
type Spot={x:number;z:number;def:{footprint:readonly [number,number]}};
const cross=(a:RaniScreenPoint,b:RaniScreenPoint,c:RaniScreenPoint)=>
 (b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);
function hull(points:RaniScreenPoint[]):RaniScreenPoint[]{
 const p=[...points].sort((a,b)=>a.x-b.x||a.y-b.y);
 if(p.length<3)return p;
 const lo:RaniScreenPoint[]=[],hi:RaniScreenPoint[]=[];
 for(const v of p){while(lo.length>=2&&cross(lo[lo.length-2],lo[lo.length-1],v)<=0)lo.pop();lo.push(v);}
 for(let i=p.length-1;i>=0;i--){const v=p[i];while(hi.length>=2&&cross(hi[hi.length-2],hi[hi.length-1],v)<=0)hi.pop();hi.push(v);}
 lo.pop();hi.pop();return [...lo,...hi];
}
function within(px:number,py:number,vertices:RaniScreenPoint[],pad:number):boolean{
 if(vertices.length<3)return false;
 let inside=true;
 for(let i=0;i<vertices.length;i++){
  const a=vertices[i],b=vertices[(i+1)%vertices.length];
  if(cross(a,b,{x:px,y:py}) < -0.001){inside=false;break;}
 }
 if(inside)return true;
 // Small finger/mouse tolerance, bounded by the true projected outline,
 // never an oversized rectangle across neighbouring houses.
 for(let i=0;i<vertices.length;i++){
  const a=vertices[i],b=vertices[(i+1)%vertices.length];
  const dx=b.x-a.x,dy=b.y-a.y,n=dx*dx+dy*dy;
  const t=n?Math.max(0,Math.min(1,((px-a.x)*dx+(py-a.y)*dy)/n)):0;
  if(Math.hypot(px-a.x-dx*t,py-a.y-dy*t)<=pad)return true;
 }
 return false;
}
export function rkProjectedCorners(b:Spot,project:(x:number,z:number)=>[number,number]):RaniScreenPoint[]{
 const [w,d]=b.def.footprint;
 return [[b.x,b.z],[b.x+w,b.z],[b.x+w,b.z+d],[b.x,b.z+d]]
   .map(([x,z])=>{const [sx,sy]=project(x,z);return {x:sx,y:sy};});
}
export function rkPickVisibleBuilding<T extends Spot>(
 px:number,py:number,buildings:readonly T[],
 project:(x:number,z:number)=>[number,number],touch=false
):T|null{
 let found:T|null=null,score=-Infinity;
 const allowance=touch?6:3;
 for(const b of buildings){
  const quad=rkProjectedCorners(b,project);
  if(quad.some(p=>!Number.isFinite(p.x)||!Number.isFinite(p.y)))continue;
  const ys=quad.map(p=>p.y),xs=quad.map(p=>p.x);
  const groundHeight=Math.max(...ys)-Math.min(...ys);
  const width=Math.max(...xs)-Math.min(...xs);
  // A footprint 3x3 fortress is taller than a cottage. The raised roof
  // must NOT be assigned the ground tile underneath/behind the artwork.
  const [w,d]=b.def.footprint;
  const rise=Math.max(24,Math.min(150,groundHeight*.76+Math.sqrt(w*d)*11));
  const faces=hull([...quad,...quad.map(v=>({x:v.x,y:v.y-rise}))]);
  if(!within(px,py,faces,allowance))continue;
  const cx=(Math.min(...xs)+Math.max(...xs))/2;
  const cy=(Math.min(...ys)+Math.max(...ys))/2-rise*.45;
  const normalized=((px-cx)/Math.max(14,width*.53))**2+
                   ((py-cy)/Math.max(14,(groundHeight+rise)*.52))**2;
  // Prefer visually nearest centre, then foreground in overlapping roofs.
  const depth=Math.max(...ys)*.001;
  const rank=-normalized+depth*.001;
  if(rank>score){score=rank;found=b;}
 }
 return found;
}
