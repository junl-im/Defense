  // Level 1 defaults preserve every existing or older game save.
  const rkLevel = (b: PlacedBuilding) => Math.max(1, Math.min(3,b.lvl ?? 1));
  const rkMaxHp = (b: PlacedBuilding, level=rkLevel(b)) =>
    Math.round(buildingHp(b.def) * (1 + 0.30 * (level-1)));
  const rkCost = (b: PlacedBuilding, repair=false) => {
    const area=b.def.footprint[0] * b.def.footprint[1];
    if(repair) {
      const lost=Math.max(0,rkMaxHp(b)-b.hp);
      return {stone:Math.ceil(lost/24), wood:Math.ceil(lost/31)};
    }
    const stage=rkLevel(b);
    return {stone:Math.max(4,Math.ceil(area*(3+stage*2))),
            wood:Math.max(3,Math.ceil(area*(2+stage*2)))};
  };
  const rkCostText=(c:{stone:number;wood:number})=>'석재 '+c.stone+' · 목재 '+c.wood;
  const rkCanSpend=(c:{stone:number;wood:number})=>
    state.stock.stone>=c.stone && state.stock.wood>=c.wood;
  const rkSpend=(c:{stone:number;wood:number})=>{
    state.stock.stone-=c.stone;state.stock.wood-=c.wood;
  };
  const rkProtected=(b: PlacedBuilding):string=>{
    if(b.name==='keep') return '영주성은 철거할 수 없습니다.';
    for(const name of ['stockpile','granary']){
      if(b.name===name && state.buildings.filter(x=>x.name===name).length<=1)
        return '마지막 필수 저장 시설은 철거할 수 없습니다.';
    }
    return '';
  };
  const rkTarget=(b: PlacedBuilding):RaniTarget=>({
    key:'building:'+b.id,name:b.name,label:b.def.label,
    x:b.x+b.def.footprint[0]/2,z:b.z+b.def.footprint[1]/2,building:b
  });
  const rkNature=(x:number,z:number):RaniTarget|null=>{
    const i=decorations.findIndex(t=>t.alive&&t.x===x&&t.z===z);
    if(i<0)return null;
    const t=decorations[i];
    const names:Record<string,string>={oak:'참나무',olive_tree:'올리브나무',
      palm:'야자수',dead_tree:'고목',bush:'덤불',rock:'바위'};
    return {key:'nature:'+i,name:t.name,label:names[t.name]||'자연물',
      x:t.x+0.5,z:t.z+0.5,decorationIndex:i};
  };
  const rkWheel=createRaniWheel({
    exists(t){
      if(t.building)return state.buildings.includes(t.building);
      const d=t.decorationIndex===undefined?null:decorations[t.decorationIndex];
      return !!d?.alive;
    },
    screen(t){
      const [x,y]=iso.worldToScreen(t.x,terrain.heightAt(t.x,t.z),t.z);
      return {x,y};
    },
    status(t){
      const b=t.building;
      if(!b){
        return {detail:'왕국의 자연물입니다. 확인 후 제거할 수 있습니다.',
          level:1,hp:0,maxHp:0,workers:0,capacity:0,upgradeCost:'해당 없음',
          repairCost:'해당 없음',canUpgrade:false,canRepair:false,canManage:false,
          manageLabel:'관리',removable:!mp,
          reason:mp?'대전에서는 자연물 제거를 지원하지 않습니다.':''};
      }
      const level=rkLevel(b),maxHp=rkMaxHp(b),protect=rkProtected(b);
      return {detail:b.def.description||'왕국 건물',level,hp:b.hp,maxHp,
        workers:b.staff,capacity:b.def.workers,
        upgradeCost:level<3?rkCostText(rkCost(b)):'최고 단계',
        repairCost:b.hp<maxHp?rkCostText(rkCost(b,true)):'손상 없음',
        canUpgrade:!mp&&level<3,canRepair:!mp&&b.hp<maxHp,
        canManage:b.name==='gatehouse'||!!b.def.alternate,
        manageLabel:b.name==='gatehouse'?(b.raised?'성문 열기':'성문 닫기'):
          b.def.alternate?'생산 변경':'관리',
        removable:!protect,reason:protect};
    },
    upgrade(t){
      const b=t.building;
      if(!b||mp)return {ok:false,message:'해당 건물은 강화할 수 없습니다.'};
      const level=rkLevel(b);
      if(level>=3)return {ok:false,message:'이미 최고 강화 단계입니다.'};
      const cost=rkCost(b);
      if(!rkCanSpend(cost))return {ok:false,message:'강화 자원이 부족합니다. '+rkCostText(cost)};
      const before=rkMaxHp(b);
      rkSpend(cost);b.lvl=level+1;b.hp+=rkMaxHp(b)-before;
      state.notify(b.def.label+' 강화 '+b.lvl+'단계 완료','info');
      return {ok:true,message:'강화 완료 · 내구도 상한 증가'};
    },
    repair(t){
      const b=t.building;
      if(!b||mp)return {ok:false,message:'해당 건물은 수리할 수 없습니다.'};
      const max=rkMaxHp(b);
      if(b.hp>=max)return {ok:false,message:'이미 내구도가 가득 찼습니다.'};
      const cost=rkCost(b,true);
      if(!rkCanSpend(cost))return {ok:false,message:'수리 자원이 부족합니다. '+rkCostText(cost)};
      rkSpend(cost);b.hp=max;
      state.notify(b.def.label+' 수리 완료','info');
      return {ok:true,message:'수리 완료 · 내구도 회복'};
    },
    manage(t){
      const b=t.building;
      if(!b)return {ok:false,message:'관리할 수 없습니다.'};
      if(b.name==='gatehouse'){
        toggleGate(b);return {ok:true,message:b.raised?'성문을 닫았습니다.':'성문을 열었습니다.'};
      }
      if(toggleProduct(b))return {ok:true,message:'생산 품목을 변경했습니다.'};
      return {ok:false,message:'이 건물은 별도 관리 기능이 없습니다.'};
    },
    build(){
      const ui=document.getElementById('ui');
      const native=document.getElementById('rani-build-toggle') as HTMLButtonElement|null;
      if(native&&ui&&!ui.classList.contains('rani-build-open'))native.click();
      hud.toggleBuild();
    },
    remove(t){
      if(t.building){
        const b=t.building,reason=rkProtected(b);
        if(reason)return {ok:false,message:reason};
        const ok=demolish(b);
        return {ok,message:ok?b.def.label+' 철거 완료':'철거할 수 없습니다.'};
      }
      if(mp)return {ok:false,message:'대전에서 자연물 제거는 지원하지 않습니다.'};
      const i=t.decorationIndex;
      if(i===undefined)return {ok:false,message:'자연물 정보가 없습니다.'};
      const d=decorations[i];
      if(!d||!d.alive)return {ok:false,message:'이미 제거된 자연물입니다.'};
      // Reuse the original terrain obstacle and saved felled-tree index.
      for(const w of workers.workers) if(w.claim===i)w.claim=null;
      d.claimedBy=null;d.alive=false;d.regrowAt=1e12;
      markScatter(d.x,d.z,false);regrowing.push(i);staticDirty=true;
      state.notify(t.label+' 제거 완료','info');
      return {ok:true,message:t.label+' 제거 완료'};
    }
  });
  function clickBuildingAt(wx:number,wz:number):boolean{
    const tx=Math.floor(wx),tz=Math.floor(wz);
    const b=buildingAt(tx,tz);
    if(b){rkWheel.toggle(rkTarget(b));return true;}
    const nature=rkNature(tx,tz);
    if(nature){rkWheel.toggle(nature);return true;}
    rkWheel.close();return false;
  }
