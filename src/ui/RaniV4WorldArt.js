// v4.0 — replace the LOOK of actual constructed buildings with the three
// approved original transparent WebP illustrations. Genuine world positions,
// game-side building records and original selection remain authoritative.
// The backing low-poly building is only hidden once art has loaded; failure
// restores the original model. Nothing here alters economy, tiles or saves.
import * as THREE from 'three';
import { RANI_PREPARED_ASSETS } from './RaniAssetRegistry.js';
import { events } from '../core/Events.js';
const ART=Object.freeze({
  market:RANI_PREPARED_ASSETS.market,
  trade_post:RANI_PREPARED_ASSETS.market,
  port:RANI_PREPARED_ASSETS.tradeShip,
  fishing_pier:RANI_PREPARED_ASSETS.tradeShip
});
const pos=new THREE.Vector3(),offset=new THREE.Vector3(),projected=new THREE.Vector3();
const flat=(v)=>Math.round(v*10)/10;
export function installRaniV4WorldArt(game){
  if(game.raniV4WorldArt)return game.raniV4WorldArt;
  const layer=document.createElement('div');
  layer.id='rani-v4-world-art';
  layer.setAttribute('aria-label','건설한 왕실 건물');
  document.body.appendChild(layer);
  const slots=new Map(),bound=[];
  let frameId=0,last=0,dirty=true;
  const clear=()=>{
    for(const item of slots.values()){
      if(item.visual?.group && item.didHide)item.visual.group.visible=true;
      item.button.remove();
    }
    slots.clear();
  };
  function refresh(){
    dirty=false;
    const seen=new Set();
    for(const cell of game.grid.cells.values()){
      if(cell.owner && cell.owner!=='player')continue;
      for(const rec of game.buildingSystem.buildingsOn(cell)){
        const art=ART[rec.id];
        if(!art||!rec.done||!rec.visual?.done||!rec.visual.group?.parent)continue;
        const key=cell.q+','+cell.r+':'+rec.slot+':'+rec.id;
        seen.add(key);
        let item=slots.get(key);
        if(item && item.visual!==rec.visual){
          if(item.visual?.group&&item.didHide)item.visual.group.visible=true;
          item.button.remove();slots.delete(key);item=null;
        }
        if(!item){
          const button=document.createElement('button');
          button.type='button';
          button.className='rani-v4-world-sprite';
          button.dataset.building=rec.id;
          button.setAttribute('aria-label',rec.id+' 건물 선택');
          button.title='실제 건설한 '+rec.id+' 선택';
          const img=document.createElement('img');
          img.alt='';img.draggable=false;img.decoding='async';
          img.src=art;
          button.appendChild(img);
          const newItem={button,img,visual:rec.visual,cell,loaded:false,didHide:false};
          img.addEventListener('load',()=>{
            newItem.loaded=img.naturalWidth>0;
            if(newItem.loaded)dirty=true;
          },{once:true});
          img.addEventListener('error',()=>{
            newItem.loaded=false;
            if(newItem.didHide&&newItem.visual?.group){
              newItem.visual.group.visible=true;newItem.didHide=false;
            }
            button.hidden=true;
          },{once:true});
          button.addEventListener('click',()=>{
            if(game.mode!=='village')return;
            // Real cell selection — building records and panel remain the
            // genuine BuildingSystem, never a mocked facade.
            game.selection.select(cell);
          });
          layer.appendChild(button);
          slots.set(key,newItem);
          item=newItem;
        }
        item.cell=cell;
      }
    }
    for(const [key,item] of slots)if(!seen.has(key)){
      if(item.didHide&&item.visual?.group)item.visual.group.visible=true;
      item.button.remove();slots.delete(key);
    }
  }
  function tick(now){
    frameId=requestAnimationFrame(tick);
    if(game.mode!=='village'){
      layer.hidden=true;
      // The original field renderer is untouched. Keep village 3D models
      // restored while outside the village.
      for(const item of slots.values())if(item.didHide&&item.visual?.group){
        item.visual.group.visible=true;item.didHide=false;
      }
      return;
    }
    layer.hidden=false;
    if(dirty||now-last>700){refresh();last=now;}
    const rect=game.canvas.getBoundingClientRect();
    const camera=game.camera;
    camera.updateMatrixWorld();
    for(const item of slots.values()){
      const group=item.visual?.group;
      if(!group||!item.loaded||!item.img.naturalWidth){item.button.hidden=true;continue;}
      group.getWorldPosition(pos);
      pos.y+=.2;
      projected.copy(pos).project(camera);
      // Hide sprites behind camera or outside the real 3D view.
      const visible=projected.z>-1 && projected.z<1 &&
        Math.abs(projected.x)<1.4&&Math.abs(projected.y)<1.4;
      if(!visible){item.button.hidden=true;continue;}
      item.button.hidden=false;
      if(!item.didHide){group.visible=false;item.didHide=true;}
      const x=rect.left+(projected.x+1)*rect.width/2;
      const y=rect.top+(-projected.y+1)*rect.height/2;
      offset.copy(pos).add(new THREE.Vector3(.65,0,0)).project(camera);
      const width=Math.max(52,Math.min(200,
        Math.abs(offset.x-projected.x)*rect.width*.94));
      item.button.style.width=flat(width)+'px';
      item.button.style.transform='translate3d('+
        flat(x-width*.5)+'px,'+flat(y-width*.69)+'px,0)';
      item.button.style.zIndex=String(Math.round((projected.y+1)*-1000+5000));
    }
  }
  function onChange(){dirty=true;}
  for(const event of ['buildings:changed','building:complete','tile:placed',
     'game:restart','territory:changed']){
    bound.push(events.on(event,onChange));
  }
  refresh();frameId=requestAnimationFrame(tick);
  const api={
    slots,refresh,
    dispose(){
      cancelAnimationFrame(frameId);
      for(const off of bound)off();
      clear();layer.remove();
      if(game.raniV4WorldArt===api)delete game.raniV4WorldArt;
    }
  };
  game.raniV4WorldArt=api;
  return api;
}
