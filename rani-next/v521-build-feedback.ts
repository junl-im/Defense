/** Rani v5.21: decorative feedback for successful native builds and upgrades.
 * No world mutation; only already-confirmed actions can trigger an effect.
 * No SVG, no textures, no continuous render loop while inactive. */
type Kind='build'|'upgrade';
type Point={x:number;z:number;label:string;level?:number;kind:Kind;start:number;ttl:number;seed:number};
export function createRaniBuildFeedback(project:(x:number,z:number)=>[number,number]){
 const canvas=document.createElement('canvas');
 canvas.id='rk-construction-fx';canvas.setAttribute('aria-hidden','true');
 document.body.append(canvas);
 const ctx=canvas.getContext('2d');
 const active:Point[]=[];
 let frame=0;
 const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 const clamp=(n:number,min:number,max:number)=>Math.max(min,Math.min(max,n));
 const ease=(t:number)=>1-Math.pow(1-t,3);
 const draw=(now:number)=>{
   frame=0;
   if(!ctx)return;
   const w=innerWidth,h=innerHeight,dpr=Math.min(1.5,devicePixelRatio||1);
   if(canvas.width!==Math.ceil(w*dpr)||canvas.height!==Math.ceil(h*dpr)){
     canvas.width=Math.ceil(w*dpr);canvas.height=Math.ceil(h*dpr);
     canvas.style.width=w+'px';canvas.style.height=h+'px';
   }
   ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
   for(let i=active.length-1;i>=0;i--){
     const fx=active[i],t=clamp((now-fx.start)/fx.ttl,0,1);
     if(t>=1){active.splice(i,1);continue;}
     const [x,y]=project(fx.x,fx.z);
     if(!Number.isFinite(x)||!Number.isFinite(y)||x<-160||x>w+160||y<-140||y>h+140)continue;
     const alpha=clamp(Math.min(t*5,(1-t)*3.1),0,1);
     ctx.save();ctx.globalAlpha=alpha;
     const gold=fx.kind==='upgrade';
     const bright=gold?'#ffe2a0':'#b5f2cb',line=gold?'#eebc67':'#8bd7bd';
     const rise=ease(clamp(t/.68,0,1));
     // Animated projected foundation ring and construction scaffold outline.
     if(!reduce){
       ctx.strokeStyle=line;ctx.lineWidth=2.2;ctx.beginPath();
       ctx.ellipse(x,y-4,20+40*rise,9+16*rise,0,0,Math.PI*2);ctx.stroke();
       ctx.lineWidth=1.6;ctx.strokeStyle=bright;
       const up=12+37*rise;
       ctx.beginPath();
       ctx.moveTo(x-17,y);ctx.lineTo(x-17,y-up);
       ctx.lineTo(x,y-up-13);ctx.lineTo(x+17,y-up);
       ctx.lineTo(x+17,y);ctx.stroke();
       ctx.beginPath();ctx.moveTo(x-17,y-up);ctx.lineTo(x+17,y-up);ctx.stroke();
       // 10 lightweight wood dust / golden upgrade glints, deterministic.
       for(let p=0;p<10;p++){
         const angle=p*2.39996+fx.seed,r=12+39*t+(p%3)*4;
         const px=x+Math.cos(angle)*r,py=y-Math.sin(angle)*r*.54-13-31*t;
         const radius=1+(p%3)*.45;
         ctx.fillStyle=p%2===0?bright:line;
         ctx.fillRect(px,py,radius*2,radius*2);
       }
     }
     const text=gold?fx.label+' · 강화 '+(fx.level??2)+'단계':'건설 완료 · '+fx.label;
     const size=gold?13:12;
     ctx.font='bold '+size+'px "Malgun Gothic",sans-serif';
     ctx.textAlign='center';ctx.textBaseline='middle';
     const maxWidth=clamp(ctx.measureText(text).width+25,104,246);
     const lx=clamp(x,maxWidth/2+7,w-maxWidth/2-7);
     const ly=clamp(y-62-21*rise,24,h-27);
     ctx.fillStyle='rgba(13,35,49,.94)';ctx.strokeStyle=line;ctx.lineWidth=1.3;
     ctx.beginPath();ctx.roundRect(lx-maxWidth/2,ly-14,maxWidth,28,8);
     ctx.fill();ctx.stroke();ctx.fillStyle=bright;ctx.fillText(text,lx,ly,maxWidth-12);
     ctx.restore();
   }
   canvas.dataset.rkPaints=String(Number(canvas.dataset.rkPaints||0)+1);
   canvas.hidden=active.length===0;
   if(active.length)frame=requestAnimationFrame(draw);
 };
 const show=(kind:Kind,x:number,z:number,label:string,level?:number)=>{
   if(!ctx)return;
   canvas.dataset.rkEvent=kind;
   canvas.dataset.rkSerial=String(1+Number(canvas.dataset.rkSerial||0));
   active.push({kind,x,z,label:label.slice(0,25),level,start:performance.now(),
     ttl:reduce?1050:(kind==='upgrade'?2550:1900),seed:active.length*.7});
   if(active.length>9)active.shift();
   canvas.hidden=false;
   // Paint the first visible frame synchronously: on heavy/mobile pages the
   // browser can defer RAF behind terrain/sprite work for a noticeable time.
   // Follow-up frames remain RAF-driven and stop when effects expire.
   if(!frame)draw(performance.now()+38);
 };
 canvas.hidden=true;
 return {
   built:(x:number,z:number,label:string)=>show('build',x,z,label),
   upgraded:(x:number,z:number,label:string,level:number)=>show('upgrade',x,z,label,level),
   count:()=>active.length
 };
}
