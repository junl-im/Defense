// © 2026 곰같은여우. Bounded A* navigation for mobile-friendly static cover maps.
// Pure deterministic module: no renderer, browser APIs, or network.
const SQRT2=Math.SQRT2;
const NEIGHBORS=[[-1,0,1],[1,0,1],[0,-1,1],[0,1,1],[-1,-1,SQRT2],[-1,1,SQRT2],[1,-1,SQRT2],[1,1,SQRT2]];
export function segmentWalkable(a,b,blocked,step=0.35){
 const n=Math.max(1,Math.ceil(Math.hypot(b.x-a.x,b.z-a.z)/step));
 for(let i=0;i<=n;i++){
  const t=i/n;
  if(blocked(a.x+(b.x-a.x)*t,a.z+(b.z-a.z)*t))return false;
 }
 return true;
}
export function findGridPath(from,to,blocked,{arena=27,cell=1.5,maxNodes=800}={}){
 if(segmentWalkable(from,to,blocked))return [to];
 const size=Math.floor(arena*2/cell)+1;
 const point=(gx,gz)=>({x:-arena+gx*cell,z:-arena+gz*cell});
 const index=(gx,gz)=>gz*size+gx;
 const inGrid=(x,z)=>x>=0&&z>=0&&x<size&&z<size;
 const grid=(p)=>({gx:Math.max(0,Math.min(size-1,Math.round((p.x+arena)/cell))),
  gz:Math.max(0,Math.min(size-1,Math.round((p.z+arena)/cell)))});
 const cellSafe=new Map();
 const walk=(gx,gz)=>{
  if(!inGrid(gx,gz))return false;
  const id=index(gx,gz);
  if(!cellSafe.has(id)){const p=point(gx,gz);cellSafe.set(id,!blocked(p.x,p.z));}
  return cellSafe.get(id);
 };
 // Grid rounding can put a safe actor into an unsafe cell; find nearby free point.
 const nearest=(p)=>{
  const q=grid(p);
  if(walk(q.gx,q.gz))return q;
  let best=null,score=Infinity;
  for(let ring=1;ring<=3;ring++){
   for(let dz=-ring;dz<=ring;dz++)for(let dx=-ring;dx<=ring;dx++){
    if(Math.max(Math.abs(dx),Math.abs(dz))!==ring)continue;
    const gx=q.gx+dx,gz=q.gz+dz;
    if(!walk(gx,gz))continue;
    const pt=point(gx,gz);
    if(!segmentWalkable(p,pt,blocked))continue;
    const d=(pt.x-p.x)**2+(pt.z-p.z)**2;
    if(d<score){best={gx,gz};score=d;}
   }
   if(best)return best;
  }
  return null;
 };
 const start=nearest(from),goal=nearest(to);
 if(!start||!goal)return [];
 const h=(gx,gz)=>{
  const dx=Math.abs(goal.gx-gx),dz=Math.abs(goal.gz-gz);
  return (dx+dz)+(SQRT2-2)*Math.min(dx,dz);
 };
 const n=size*size,dist=new Float32Array(n).fill(Infinity),prev=new Int32Array(n).fill(-1);
 const closed=new Uint8Array(n),open=[];
 const startId=index(start.gx,start.gz),endId=index(goal.gx,goal.gz);
 dist[startId]=0;open.push({id:startId,gx:start.gx,gz:start.gz,f:h(start.gx,start.gz)});
 let solved=false,expanded=0;
 while(open.length&&expanded++<maxNodes){
  let best=0;
  for(let j=1;j<open.length;j++)if(open[j].f<open[best].f)best=j;
  const node=open.splice(best,1)[0];
  if(closed[node.id])continue;
  closed[node.id]=1;
  if(node.id===endId){solved=true;break;}
  for(const [dx,dz,cost] of NEIGHBORS){
   const gx=node.gx+dx,gz=node.gz+dz;
   if(!walk(gx,gz))continue;
   if(dx&&dz&&(!walk(node.gx+dx,node.gz)||!walk(node.gx,node.gz+dz)))continue;
   const id=index(gx,gz);
   if(closed[id])continue;
   const newCost=dist[node.id]+cost;
   if(newCost+1e-5>=dist[id])continue;
   dist[id]=newCost;prev[id]=node.id;
   open.push({id,gx,gz,f:newCost+h(gx,gz)});
  }
 }
 if(!solved)return [];
 const reverse=[];
 for(let at=endId;at!==startId&&at!==-1;at=prev[at]){
  reverse.push(point(at%size,Math.floor(at/size)));
  if(reverse.length>n)return [];
 }
 reverse.reverse();
 if(segmentWalkable(reverse.at(-1)||from,to,blocked))reverse.push(to);
 // String-pulling removes grid zigzags while retaining clearance from every wall.
 const raw=[from,...reverse],smoothed=[];
 let at=0;
 while(at<raw.length-1){
  let target=raw.length-1;
  while(target>at+1&&!segmentWalkable(raw[at],raw[target],blocked))target--;
  smoothed.push(raw[target]);at=target;
 }
 return smoothed;
}
