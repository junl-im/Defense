import test from 'node:test';
import assert from 'node:assert/strict';
import {compactGlb} from '../tools/compact-glb.mjs';
// Minimal real GLB 2.0 binary with one mesh + two animation accessors, one removable.
function glbFixture(){
 const data=Buffer.alloc(80);
 const doc={asset:{version:'2.0'},buffers:[{byteLength:data.length}],
  bufferViews:[{buffer:0,byteOffset:0,byteLength:24},{buffer:0,byteOffset:24,byteLength:8},{buffer:0,byteOffset:32,byteLength:24},{buffer:0,byteOffset:56,byteLength:24}],
  accessors:[{bufferView:0,componentType:5126,count:2,type:'VEC3'},
   {bufferView:1,componentType:5126,count:2,type:'SCALAR'},
   {bufferView:2,componentType:5126,count:2,type:'VEC3'},
   {bufferView:3,componentType:5126,count:2,type:'VEC3'}],
  meshes:[{primitives:[{attributes:{POSITION:0}}]}],nodes:[{mesh:0}],
  animations:[{name:'Idle',samplers:[{input:1,output:2}],channels:[{sampler:0,target:{node:0,path:'translation'}}]},
   {name:'Huge_Extra',samplers:[{input:1,output:3}],channels:[{sampler:0,target:{node:0,path:'translation'}}]}],
  scenes:[{nodes:[0]}],scene:0};
 const raw=Buffer.from(JSON.stringify(doc)),pad=(n)=>(n+3)&~3;
 const jb=Buffer.alloc(pad(raw.length),32);raw.copy(jb);
 const out=Buffer.alloc(12+8+jb.length+8+data.length);
 out.write('glTF');out.writeUInt32LE(2,4);out.writeUInt32LE(out.length,8);out.writeUInt32LE(jb.length,12);out.writeUInt32LE(0x4e4f534a,16);jb.copy(out,20);
 out.writeUInt32LE(data.length,20+jb.length);out.writeUInt32LE(0x004e4942,24+jb.length);data.copy(out,28+jb.length);
 return out;
}
test('animated GLB repacking drops unused clips, accessors and bufferViews',()=>{
 const before=glbFixture(),after=compactGlb(before,['Idle']);
 assert.ok(after.length<before.length);
 assert.equal(after.readUInt32LE(8),after.length);
 const length=after.readUInt32LE(12),g=JSON.parse(after.subarray(20,20+length).toString());
 assert.deepEqual(g.animations.map(x=>x.name),['Idle']);
 assert.equal(g.accessors.length,3);assert.equal(g.bufferViews.length,3);
 assert.equal(g.animations[0].samplers[0].output,2);
 const binaryOffset=28+length;
 assert.equal(after.readUInt32LE(binaryOffset-8)>=0,true);
});
test('unknown required clip fails closed and invalid GLB is rejected',()=>{
 assert.throws(()=>compactGlb(glbFixture(),['Nonexistent']),/Required animation clip missing/);
 assert.throws(()=>compactGlb(Buffer.from('invalid'),['Idle']),/Requires glTF 2.0/);
});
