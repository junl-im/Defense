  function place(){
    if(!target)return;
    const p=callbacks.screen(target);
    const width=window.innerWidth,height=window.innerHeight;
    const phone=document.documentElement.classList.contains('phone');
    const pad=document.querySelector<HTMLElement>('#pad');
    const padBox=pad?.getBoundingClientRect();
    const padVisible=phone&&padBox&&padBox.height>10&&getComputedStyle(pad!).display!=='none';
    const bottomLimit=padVisible?padBox!.top-10:height-12;
    const topLimit=phone?Math.min(48,height*.12):14;
    const wheelHeight=266;
    const landscapeInfo=phone&&width>=610&&height<=560;
    const infoHeight=info.hidden||landscapeInfo?0:Math.min(132,Math.max(92,height*.23));
    const desiredTop=phone?Math.max(topLimit,p.y-190):p.y-170;
    const top=Math.max(topLimit,Math.min(Math.max(topLimit,bottomLimit-wheelHeight-infoHeight),desiredTop));
    let left=phone
      ? (landscapeInfo?Math.min(width-425,Math.max(169,p.x)):width/2)
      : Math.max(166,Math.min(width-166,p.x));
    const dock=document.querySelector<HTMLElement>('#rk-actions');
    if(!phone&&dock){
      const b=dock.getBoundingClientRect();
      const overlaps=left-160<b.right+8&&left+160>b.left-8&&
        top+266>b.top-6&&top<b.bottom+6;
      if(overlaps)left=Math.min(width-166,Math.max(left,b.right+178));
    }
    host.dataset.rkLayout=landscapeInfo?'side':'below';
    host.style.setProperty('--rk-anchor-left',left+'px');
    host.style.setProperty('--rk-anchor-top',(top+wheelHeight/2)+'px');
    host.style.left=left+'px';host.style.top=(top+wheelHeight/2)+'px';
  }
