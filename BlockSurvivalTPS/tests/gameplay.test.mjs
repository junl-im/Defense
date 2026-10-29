import test from 'node:test';
import assert from 'node:assert/strict';
import {newGame,start,pause,tick,shoot,reload,spawn,moveCircle,clearPath,COVER,MAX_ACTIVE,MAG_SIZE} from '../src/sim.mjs';

test('run starts in title and pausing stops progression',()=>{
 const s=newGame();assert.equal(s.status,'title');start(s);tick(s,0.04,{x:1});
 assert.ok(s.x>0);pause(s);const x=s.x;tick(s,0.04,{x:1});assert.equal(x,s.x);
});
test('player movement cannot enter static cover or leave arena',()=>{
 const c=COVER[0];let p=moveCircle(c.x-c.w/2-1,c.z,2,0);assert.ok(p.x<c.x-c.w/2);
 p=moveCircle(26,26,5,5);assert.ok(p.x<=26.48&&p.z<=26.48);
});
test('shots consume ammo, reject missing ammo and require cooldown',()=>{
 const s=newGame();start(s);s.enemies=[{id:1,x:0,z:-6,type:'zombie',radius:0.65,hp:45}];
 assert.equal(shoot(s,0,-1).killed,true);assert.equal(s.kills,1);
 assert.equal(shoot(s,0,-1).fired,false);tick(s,0.06);tick(s,0.06);tick(s,0.06);tick(s,0.06);
 assert.equal(shoot(s,1,0).fired,true);assert.equal(s.ammo,MAG_SIZE-2);
});
test('obstacles intercept cover-blocked shots',()=>{
 const s=newGame();start(s);const c=COVER[0];
 assert.equal(clearPath(c.x-10,c.z,c.x+10,c.z),false);
 s.x=c.x-10;s.z=c.z;s.enemies=[{id:1,x:c.x+9,z:c.z,radius:0.7,hp:80,type:'zombie'}];
 assert.equal(shoot(s,1,0).hit,false);assert.equal(s.enemies[0].hp,80);
});
test('reload consumes reserve once after countdown',()=>{
 const s=newGame();start(s);s.ammo=1;s.reserve=5;
 assert.equal(reload(s),true);tick(s,0.06);assert.equal(s.ammo,1);
 for(let i=0;i<24;i++)tick(s,0.06);
 assert.equal(s.ammo,6);assert.equal(s.reserve,0);assert.equal(reload(s),false);
});
test('enemy spawn is bounded and waves do not create unbounded active enemies',()=>{
 const s=newGame();start(s);for(let i=0;i<30;i++)spawn(s);
 assert.ok(s.enemies.filter(e=>e.hp>0).length<=MAX_ACTIVE);
});
test('enemies can hurt the player and game over is noninteractive',()=>{
 const s=newGame();start(s);s.waveLeft=0;
 s.enemies=[{id:1,x:0,z:0.9,radius:0.6,hp:200,speed:0,attackCD:0,type:'zombie',walk:0,hitTime:0,deadTime:0}];
 s.hp=5;tick(s,0.06);
 assert.equal(s.hp,0);assert.equal(s.status,'gameover');assert.equal(shoot(s,0,1).fired,false);
});

test('reticle feedback triggers only on real hits, not missed shots',()=>{
 const s=newGame();start(s);
 assert.equal(shoot(s,1,0).hit,false);assert.equal(s.hitMarker,0);
 for(let i=0;i<4;i++)tick(s,0.06);
 s.enemies=[{id:5,x:0,z:-6,type:'zombie',radius:0.7,hp:100,hitTime:0,walk:0,deadTime:0,speed:0,attackCD:1}];
 assert.equal(shoot(s,0,-1).hit,true);
 assert.ok(s.hitMarker>0);
 for(let i=0;i<5;i++)tick(s,0.06);
 assert.equal(s.hitMarker,0);
});
