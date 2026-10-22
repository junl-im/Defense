/** Persistent Lv.2/3 castle ornaments and real-footprint selection outline.
 * Never mutates simulation or saves. No SVG or additional texture memory.
 * Real buildings are rendered underneath by their existing 2.5D model/sprite.
 */
type Building={id:number;x:number;z:number;lvl?:number;def:{label:string;footprint:[number,number]}};
type Point=[number,number];
const maxVisible=32;
export function createRaniStageAppearance(
 buildings:()=>Building[],selected:()=>Building|null,
 project:(x:number,z:number)=>Point
){
 const root=document.createElement('div');
 root.id='rk-stage-appearance';root.setAttribute('aria-hidden','true');
 document.body.append(root);
 type Rendered={node:HTMLDivElement;last:string};
 const nodes=new Map<number,Rendered>();let last=0;
 function projected(b:Building){
   const [w,d]=b.def.footprint;
   const points:Point[]=[
     project(b.x,b.z),project(b.x+w,b.z),
     project(b.x+w,b.z+d),project(b.x,b.z+d)
   ];
   if(points.some(p=>!p.every(Number.isFinite)))return null;
   const xs=points.map(p=>p[0]),ys=points.map(p=>p[1]);
   const x=Math.min(...xs),y=Math.min(...ys);
   const width=Math.max(...xs)-x,height=Math.max(...ys)-y;
   if(width<1||height<1)return null;
   const topLift=Math.max(23,Math.min(112,height*.76+Math.sqrt(w*d)*11));
   if(x>innerWidth+100||x+width< -100||y-topLift>innerHeight+85||y+height< -80)return null;
   return {points,x,y,width,height,topLift};
 }
 function make(b:Building){
   const el=document.createElement('div');el.className='rk-stage-building';
   el.dataset.rkId=String(b.id);el.setAttribute('aria-hidden','true');
   const outline=document.createElement('span');outline.className='rk-stage-outline';
   for(let i=0;i<4;i++){
     const edge=document.createElement('i');edge.className='rk-stage-edge';
     edge.dataset.rkEdge=String(i);outline.append(edge);
   }
   const roof=document.createElement('span');roof.className='rk-stage-roof';
   const crest=document.createElement('span');crest.className='rk-stage-crest';
   const flagLeft=document.createElement('span');flagLeft.className='rk-stage-flag rk-flag-left';
   const flagRight=document.createElement('span');flagRight.className='rk-stage-flag rk-flag-right';
   const level=document.createElement('span');level.className='rk-stage-level';
   level.textContent='Lv.'+String(Math.max(1,Math.min(3,b.lvl??1)));
   el.append(roof,outline,crest,flagLeft,flagRight,level);
   root.append(el);
   const entry={node:el,last:''};nodes.set(b.id,entry);return entry;
 }
 function layout(el:HTMLDivElement,p:NonNullable<ReturnType<typeof projected>>,stage:number,focus:boolean){
   const {points,x,y,width,height,topLift}=p;
   el.style.left=x+'px';el.style.top=(y-topLift)+'px';
   el.style.width=width+'px';el.style.height=(height+topLift)+'px';
   const outline=el.querySelector<HTMLElement>('.rk-stage-outline')!;
   outline.style.top=topLift+'px';outline.style.left='0px';
   for(let i=0;i<4;i++){
     const [ax,ay]=points[i], [bx,by]=points[(i+1)%4];
     const edge=outline.children[i] as HTMLElement;
     edge.style.left=(ax-x)+'px';edge.style.top=(ay-y)+'px';
     edge.style.width=Math.hypot(bx-ax,by-ay)+'px';
     edge.style.transform='rotate('+Math.atan2(by-ay,bx-ax)+'rad)';
   }
   const roof=el.querySelector<HTMLElement>('.rk-stage-roof')!;
   const roofTop=Math.max(0,topLift-height*.13);
   roof.style.top=roofTop+'px';
   roof.style.height=(height+topLift-roofTop)+'px';
   roof.style.clipPath='polygon('+points.map(([px,py])=>
      (((px-x)/width)*100).toFixed(2)+'% '+(((py-y+topLift-roofTop)/(height+topLift-roofTop))*100).toFixed(2)+'%'
     ).join(',')+')';
   // At Lv.2 a small metal crest appears over the roof; at Lv.3
   // two heraldic pennants flank it. All parts scale with real building size.
   const crest=el.querySelector<HTMLElement>('.rk-stage-crest')!;
   crest.style.left=(width/2)+'px';
   crest.style.top=Math.max(2,topLift-height*.32)+'px';
   const left=el.querySelector<HTMLElement>('.rk-flag-left')!;
   const right=el.querySelector<HTMLElement>('.rk-flag-right')!;
   left.style.left=(width*.23)+'px';right.style.left=(width*.77)+'px';
   left.style.top=Math.max(5,topLift*.22)+'px';
   right.style.top=Math.max(5,topLift*.22)+'px';
   const badge=el.querySelector<HTMLElement>('.rk-stage-level')!;
   badge.style.left=(width/2)+'px';badge.style.top='0px';
   el.dataset.rkStage=String(stage);
   el.dataset.rkSelected=String(focus);
   el.dataset.rkFootprintCorners='4';
   el.dataset.rkProjectedWidth=String(Math.round(width));
 }
 function update(force=false){
   const now=performance.now();
   if(!force&&now-last<95)return;last=now;
   const focus=selected();
   const enhancements=buildings().filter(b=>(b.lvl??1)>1||b===focus);
   const visible=enhancements.map(b=>({b,p:projected(b)}))
     .filter((v):v is {b:Building;p:NonNullable<ReturnType<typeof projected>>}=>!!v.p);
   const prioritize=visible.sort((a,b)=>
     Number(b.b===focus)-Number(a.b===focus)
     ||Math.abs((a.p.x+a.p.width/2)-innerWidth/2)-Math.abs((b.p.x+b.p.width/2)-innerWidth/2)
   ).slice(0,maxVisible);
   const keep=new Set<number>();
   for(const {b,p} of prioritize){
     keep.add(b.id);
     const stage=Math.max(1,Math.min(3,b.lvl??1));
     const active=b===focus;
     const entry=nodes.get(b.id)||make(b);
     layout(entry.node,p,stage,active);
     const tag=String(stage)+'/'+String(active);
     if(entry.last!==tag){
       entry.last=tag;
       entry.node.setAttribute('aria-label',b.def.label+' 강화 '+stage+'단계');
       entry.node.querySelector<HTMLElement>('.rk-stage-level')!.textContent='Lv.'+stage;
     }
   }
   for(const [id,item] of nodes)if(!keep.has(id)){item.node.remove();nodes.delete(id);}
   root.dataset.rkShown=String(nodes.size);
   root.dataset.rkSelected=focus?String(focus.id):'';
 }
 return {update,force:()=>update(true),count:()=>nodes.size,destroy:()=>root.remove()};
}
