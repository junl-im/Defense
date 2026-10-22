/** v5.30 — Layout only. Keep original action callbacks and native build bar.
 * Avoid the onboarding card, market/controls and screen edges without duplicating
 * or moving any construction button. No per-frame DOM observers.
 */
export function installRaniDockLayout(dock:HTMLElement):void{
  const desktop=()=>!document.documentElement.classList.contains('phone')&&
    !document.documentElement.classList.contains('touch');
  let previous=12;
  const colliders=['#rk-first-steps','#rk-guide-toggle','#rk-harbor-panel',
    '#rk-harbor-toggle','#rightcol','#stats','#rk-strategy-card'];
  function visible(el:Element|null):el is HTMLElement{
    if(!(el instanceof HTMLElement))return false;
    if(el.hidden||getComputedStyle(el).visibility==='hidden'||
       getComputedStyle(el).display==='none'||getComputedStyle(el).opacity==='0')return false;
    const r=el.getBoundingClientRect();return r.width>1&&r.height>1;
  }
  function intersect(a:DOMRect,b:DOMRect):number{
    const w=Math.max(0,Math.min(a.right,b.right)-Math.max(a.left,b.left));
    const h=Math.max(0,Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top));
    return w*h;
  }
  function reflow(){
    if(!dock.isConnected||!desktop())return;
    const width=window.innerWidth;
    const pad=width<900?7:12;
    const bounds=dock.getBoundingClientRect();
    if(bounds.height<=0||bounds.width<=0)return;
    const boxes=colliders.map(id=>document.querySelector(id))
      .filter(visible).map(el=>el.getBoundingClientRect());
    const intro=document.querySelector('#rk-first-steps');
    const introRect=visible(intro)?intro.getBoundingClientRect():null;
    const candidates=[pad,
      introRect?introRect.right+10:pad,
      Math.max(pad,Math.round(width*.34)),
      Math.max(pad,Math.round((width-bounds.width)/2)),
      Math.max(pad,width-bounds.width-pad)];
    let best=pad,penalty=Infinity;
    for(const x of [...new Set(candidates.map(n=>Math.max(pad,Math.min(width-bounds.width-pad,Math.round(n)))))]){
      if(!Number.isFinite(x))continue;
      const projected=new DOMRect(x,bounds.y,bounds.width,bounds.height);
      // UI panels are hard collisions; distance from left is only a weak tie-break.
      const cost=boxes.reduce((sum,box)=>sum+intersect(projected,box),0)*2+
                 Math.abs(x-pad)*.04+(x===previous?-2:0);
      if(cost<penalty){penalty=cost;best=x;}
    }
    if(Math.abs(previous-best)>.5){
      previous=best;
      dock.style.setProperty('--rk-v530-dock-x',best+'px');
    }
    dock.dataset.rkCollisionFree=String(penalty<100);
    dock.dataset.rkLayout='one-dock';
  }
  let handle=0;
  function queue(){
    if(handle)return;
    handle=requestAnimationFrame(()=>{handle=0;reflow();});
  }
  // Observe only the dock; no mutation polling of live game world or HUD.
  const ro=new ResizeObserver(queue);ro.observe(dock);
  window.addEventListener('resize',queue,{passive:true});
  window.addEventListener('orientationchange',queue,{passive:true});
  dock.addEventListener('click',queue,{passive:true});
  const timer=window.setInterval(queue,1700); // onboarding and market appear later
  const stop=()=>{window.clearInterval(timer);ro.disconnect();window.cancelAnimationFrame(handle);};
  window.addEventListener('pagehide',stop,{once:true});
  queue();
}