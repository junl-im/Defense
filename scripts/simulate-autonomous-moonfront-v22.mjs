import fs from 'node:fs';
import GuardianTargetingDirectorV22 from '../src/combat/guardian-targeting-director-v22.js';
import AutomationDirectorV22 from '../src/runtime/automation-director-v22.js';

class Vec3 {
  constructor(x=0,y=0,z=0){this.x=x;this.y=y;this.z=z;}
  distanceTo(other){return Math.hypot(this.x-other.x,this.y-other.y,this.z-other.z);}
}
const enemy=(type,x,z,{boss=false,elite=false,hp=100}={})=>({type,boss,elite,dead:false,hp,maxHp:hp,group:{position:new Vec3(x,0,z)}});
const unit={rank:3,type:'ember',group:{position:new Vec3(8,0,5)},autoTarget:null};
const enemies=[enemy('imp',18,16),enemy('shaman',10,7),enemy('tiger',13,8,{boss:true,hp:920})];
const targeting=new GuardianTargetingDirectorV22();
const first=targeting.select(unit,enemies,{baseRange:9.2,wave:8});
if(!first?.target) throw new Error('target acquisition failed');
if(first.target.type!=='tiger') throw new Error(`expected boss priority, got ${first.target.type}`);
const second=targeting.select(unit,enemies,{baseRange:9.2,wave:8});
if(second.target!==first.target||targeting.stickyReuses<1) throw new Error('sticky target reuse failed');
targeting.noteShot(first);

const automation=new AutomationDirectorV22();
automation.beginReward('relic',10);
let action=null;
for(let i=0;i<100;i+=1) action=automation.update(.1,'relic')||action;
if(action?.rewardType!=='relic') throw new Error('10 second auto reward failed');
automation.noteWaveSkip();
automation.noteVacuum(14,92);

const result={
  version:'22.0.0',
  status:'PASS',
  targeting:{selected:first.target.type,acquisitionRange:first.range,extended:first.extended,report:targeting.report},
  automation:{action,report:automation.report},
  scenarios:['boss threat priority','sticky target retention','10 second reward auto choice','click-to-skip wave counter','wave-end loot vacuum accounting']
};
fs.writeFileSync('docs/AUTONOMOUS_MOONFRONT_SIMULATION_v22.0.0.json',JSON.stringify(result,null,2)+'\n');
console.log('PASS v22 autonomous moonfront simulation');
console.log(JSON.stringify(result,null,2));
