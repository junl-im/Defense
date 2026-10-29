import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {source, seedFiles, blobHash, safeExternalURI, verifyFile, auditSeed} from './acquire-seed.mjs';

test('official source is pinned and has explicit CC0 source license',()=>{
 assert.match(source.commit,/^[0-9a-f]{40}$/);
 assert.equal(source.license,'CC0-1.0');
 assert.equal(seedFiles.length,8);
 assert.ok(seedFiles.some(x=>x.to==='LICENSE.txt'));
 assert.ok(seedFiles.some(x=>x.to==='halloweenbits_texture.png'));
});
test('Git blob calculation matches canonical small test',()=>{
 assert.equal(blobHash(Buffer.from('hello\n')),'ce013625030ba8dba906f756967f9e9ca394464a');
});
test('reject corruption and unexpectedly changed file sizes',()=>{
 const x=seedFiles[0];
 assert.throws(()=>verifyFile(x,Buffer.alloc(x.size)),/origin SHA mismatch/);
 assert.throws(()=>verifyFile(x,Buffer.alloc(1)),/size mismatch/);
});
test('reject path traversal, remote resources and data URIs',()=>{
 for(const bad of ['../hack.bin','https://bad/a.bin','http://a.png','/etc/passwd','folder/name.bin','data:image/png;base64,AAAA','..\\evil','']){
  assert.equal(safeExternalURI(bad),false,bad);
 }
 assert.equal(safeExternalURI('gravestone.bin'),true);
 assert.equal(safeExternalURI('halloweenbits_texture.png'),true);
});
test('an empty, local acquisition folder is never reported as accepted',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'tps-license-test-'));
 try{const r=auditSeed(dir);assert.equal(r.ok,false);assert.equal(r.issues.length,seedFiles.length);}
 finally{fs.rmSync(dir,{recursive:true,force:true});}
});
test('the curated seed is small enough not to bloat the hosted game',()=>{
 assert.ok(seedFiles.reduce((sum,f)=>sum+f.size,0)<100*1024);
 assert.ok(seedFiles.every(x=>/^[0-9a-f]{40}$/.test(x.sha)&&x.size>0));
});
