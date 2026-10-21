/** Rani v5.21: lightweight, reliably visible building/upgrade effects.
 * Pure HTML/CSS (no SVG, canvas/WebGL overlays, assets or world mutations).
 * Uses the native camera projection while effects are alive only. */
type Kind='build'|'upgrade';
type Pulse={node:HTMLDivElement;x:number;z:number;expires:number};
export function createRaniBuildFeedback(project:(x:number,z:number)=>[number,number]){
 const host=document.createElement('div');
 host.id='rk-construction-fx';host.setAttribute('aria-hidden','true');
 host.hidden=true;document.body.append(host);
 const active:Pulse[]=[];let raf=0;
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 const place=(entry:Pulse)=>{
   const [x,y]=project(entry.x,entry.z);
   const visible=Number.isFinite(x)&&Number.isFinite(y)&&x>=-100&&x<=innerWidth+100&&y>=-130&&y<=innerHeight+100;
   entry.node.hidden=!visible;
   if(visible){entry.node.style.left=x+'px';entry.node.style.top=y+'px';}
 };
 const animate=(now:number)=>{
   raf=0;
   for(let i=active.length-1;i>=0;i--){
     const fx=active[i];
     if(now>=fx.expires){fx.node.remove();active.splice(i,1);continue;}
     place(fx);
   }
   host.hidden=active.length===0;
   if(active.length)raf=requestAnimationFrame(animate);
 };
 const show=(kind:Kind,x:number,z:number,label:string,level?:number)=>{
   const ttl=reduced?1100:(kind==='upgrade'?2600:1900);
   const entry=document.createElement('div');entry.className='rk-build-visual '+(kind==='upgrade'?'rk-upgrade':'rk-construction');
   entry.setAttribute('aria-hidden','true');
   const ring=document.createElement('span');ring.className='rk-build-ring';
   const scaffold=document.createElement('span');scaffold.className='rk-build-scaffold';
   const title=document.createElement('span');title.className='rk-build-label';
   title.textContent=kind==='upgrade'?label.slice(0,24)+' · 강화 '+(level||2)+'단계':'건설 완료 · '+label.slice(0,24);
   entry.append(ring,scaffold);
   for(let i=0;i<8;i++){
     const dust=document.createElement('i');dust.className='rk-build-spark';
     dust.style.setProperty('--rk-angle',i*45+'deg');
     dust.style.setProperty('--rk-distance',(27+(i%3)*8)+'px');
     dust.style.animationDelay=(i*55)+'ms';entry.append(dust);
   }
   entry.append(title);host.append(entry);
   const fx={node:entry,x,z,expires:performance.now()+ttl};
   active.push(fx);
   while(active.length>9)active.shift()!.node.remove();
   host.dataset.rkEvent=kind;
   host.dataset.rkSerial=String(1+Number(host.dataset.rkSerial||0));
   host.hidden=false;
   place(fx); // immediate, synchronous visual feedback, even when RAF is late
   if(!raf)raf=requestAnimationFrame(animate);
 };
 return {
   built:(x:number,z:number,label:string)=>show('build',x,z,label),
   upgraded:(x:number,z:number,label:string,level:number)=>show('upgrade',x,z,label,level),
   count:()=>active.length
 };
}
