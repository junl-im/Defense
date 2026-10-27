import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {inspectDirectory,inspectGlb,assetCatalog} from './asset-intake.mjs';
const mk=()=>fs.mkdtempSync(path.join(os.tmpdir(),'rani-3d-'));
const scene=()=>({
 asset:{version:'2.0'},meshes:[{primitives:[{attributes:{POSITION:0},indices:1}]}],
 nodes:[{mesh:0}],scenes:[{nodes:[0]}],scene:0,
 accessors:[{bufferView:0,componentType:5126,count:3,type:'VEC3'},{bufferView:1,componentType:5123,count:3,type:'SCALAR'}],
 buffers:[{byteLength:44}],
 bufferViews:[{buffer:0,byteLength:36,byteOffset:0},{buffer:0,byteLength:6,byteOffset:36}]
});
const rights=()=>({generator:'Meshy',creator:'test',source_url:'https://example.com/model',
 license_url:'https://example.com/license',usage_rights:'testing',verified_by:'test',approved_for_game:true});
function make(dir,id,doc=scene()){
 const json=Buffer.from(JSON.stringify(doc));
 const padded=Buffer.alloc(Math.ceil(json.length/4)*4,32);json.copy(padded);
 const bin=Buffer.alloc(44);
 const out=Buffer.alloc(12+8+padded.length+8+bin.length);
 out.write('glTF',0,'ascii');out.writeUInt32LE(2,4);out.writeUInt32LE(out.length,8);
 out.writeUInt32LE(padded.length,12);out.writeUInt32LE(0x4e4f534a,16);padded.copy(out,20);
 const off=20+padded.length;
 out.writeUInt32LE(bin.length,off);out.writeUInt32LE(0x004e4942,off+4);bin.copy(out,off+8);
 fs.writeFileSync(path.join(dir,id+'.glb'),out);
 return path.join(dir,id+'.glb');
}
test('12개 자산 등록',()=>assert.equal(Object.keys(assetCatalog).length,12));
test('정상 GLB와 사용권 문서 반입; 원본 변경 금지',()=>{
 const dir=mk();try{
  const file=make(dir,'keep');fs.writeFileSync(path.join(dir,'keep.license.json'),JSON.stringify(rights()));
  const orig=fs.readFileSync(file);
  const result=inspectDirectory(dir);
  assert.equal(result.summary.metadataPassed,1);assert.equal(result.summary.rejected,0);
  assert.equal(result.summary.missing.length,11);assert.deepEqual(fs.readFileSync(file),orig);
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
test('사용권 누락 거부',()=>{
 const dir=mk();try{
  make(dir,'house');const r=inspectDirectory(dir);
  assert.equal(r.summary.rejected,1);assert.match(r.items[0].issues.join(','),/사용권/);
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
test('외부 텍스처 거부',()=>{
 const dir=mk();try{
  const file=make(dir,'tower',{...scene(),images:[{uri:'https://example.com/x.png'}]});
  assert.match(inspectGlb(file).issues.join(','),/외부 이미지/);
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
test('손상된 헤더 및 청크 거부',()=>{
 const dir=mk();try{
  const file=path.join(dir,'wall.glb');fs.writeFileSync(file,'broken');
  assert.ok(inspectGlb(file).issues.length);
  make(dir,'wall');const b=fs.readFileSync(file);b.writeUInt32LE(9999,12);fs.writeFileSync(file,b);
  assert.match(inspectGlb(file).issues.join(','),/청크 길이/);
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
test('미등록 ID와 외부 바이너리 참조 거부',()=>{
 const dir=mk();try{
  make(dir,'alien',{...scene(),buffers:[{uri:'other.bin',byteLength:44}]});
  fs.writeFileSync(path.join(dir,'alien.license.json'),JSON.stringify(rights()));
  const r=inspectDirectory(dir).items[0];assert.equal(r.status,'reject');
  assert.match(r.issues.join(','),/미등록|외부/);
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
