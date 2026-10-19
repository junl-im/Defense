// Rani Kingdom v3.2 — lifecycle for decorative street props derived from
// BuildingSystem, not from a parallel construction/save system.
import { cellKey } from '../grid/Hex.js';
import { BUILDINGS } from '../config/BuildingConfig.js';
import { events } from '../core/Events.js';
import { makeRoyalBuiltNeighborhood } from './RoyalBuiltNeighborhoodArt.js';

export class RoyalBuiltNeighborhoodSystem {
  constructor(game){
    this.game=game;
    this.entries=new Map();
    this.unsubscribe=[
      events.on('buildings:changed',()=>this.refresh()),
      // BuildingSystem marks done when production starts, but actual staged
      // ConstructionSystem reaches PHASE FOUR later. Furnish only then.
      events.on('building:complete',()=>this.refresh()),
      events.on('tile:placed',()=>this.refresh()),
      events.on('territory:changed',()=>this.refresh()),
      events.on('game:restart',()=>this.clear()),
    ];
    this.refresh(); // restore() completes before Game installs this renderer
  }
  _clearEntry(key){
    const e=this.entries.get(key);
    if(!e)return;
    if(e.mesh.parent)e.mesh.parent.remove(e.mesh);
    e.mesh.geometry.dispose();
    this.entries.delete(key);
  }
  clear(){
    for(const key of [...this.entries.keys()])this._clearEntry(key);
  }
  _completed(cell){
    const recs=this.game.buildingSystem.buildingsOn(cell);
    return recs.filter(b=>b.done===true && b.visual?.done===true &&
      !BUILDINGS[b.id]?.isRoad && b.pos &&
      Number.isFinite(b.pos.x)&&Number.isFinite(b.pos.z))
      .sort((a,b)=>(a.slot??0)-(b.slot??0));
  }
  refresh(){
    const found=new Set();
    for(const cell of this.game.grid.cells.values()){
      if(!cell.group||cell.owner&&cell.owner!=='player')continue;
      const key=cellKey(cell.q,cell.r);
      found.add(key);
      const recs=this._completed(cell);
      if(!recs.length){this._clearEntry(key);continue;}
      const signature=recs.map(b=>[b.id,b.slot,b.pos.x,b.pos.z].join(':')).join('|');
      const previous=this.entries.get(key);
      if(previous?.group===cell.group && previous.signature===signature)continue;
      this._clearEntry(key);
      const mesh=makeRoyalBuiltNeighborhood(cell,recs);
      if(!mesh)continue;
      cell.group.add(mesh);
      this.entries.set(key,{group:cell.group,signature,mesh});
    }
    for(const key of [...this.entries.keys()])if(!found.has(key))this._clearEntry(key);
  }
  dispose(){
    this.clear();
    for(const off of this.unsubscribe)off();
    this.unsubscribe.length=0;
  }
}
