import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {validateRegistry} from '../tools/acquire-open-assets.mjs';
const source=JSON.parse(fs.readFileSync(new URL('../research/source-lock.json',import.meta.url),'utf8'));
test('all four curated GitHub sources are pinned and CC0',()=>{
 const x=validateRegistry(source);
 assert.equal(x.repositories,4);
 assert.equal(x.license,'CC0-1.0');
 assert.equal(x.protectedArchive,'archive/rani-kingdom-v539-20261029');
 assert.ok(x.selectedFiles>=19);
});
test('reject accidental AGPL asset or unknown license',()=>{
 const d=structuredClone(source);d.packs[0].license='AGPL-3.0';
 assert.throws(()=>validateRegistry(d),/Non-CC0/);
});
test('reject unknown source, unsafely nested path, SVG',()=>{
 for(const change of [d=>d.packs[0].repository='unknown/unknown',
                       d=>d.packs[0].files.push('../../oops.png'),
                       d=>d.packs[0].files.push('status.svg')]){
  const d=structuredClone(source);change(d);assert.throws(()=>validateRegistry(d));
 }
});
test('glTF requires matching BIN and source identifiers may not repeat',()=>{
 let d=structuredClone(source);
 d.packs[2].files=d.packs[2].files.filter(x=>x!=='Assets/gltf/grave_A.bin');
 assert.throws(()=>validateRegistry(d),/Missing glTF BIN/);
 d=structuredClone(source);d.packs[1].id=d.packs[0].id;
 assert.throws(()=>validateRegistry(d),/Duplicate pack/);
});
