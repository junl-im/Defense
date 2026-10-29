import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {validateRegistry} from '../tools/acquire-open-assets.mjs';
const source=JSON.parse(fs.readFileSync(new URL('../research/source-lock.json',import.meta.url),'utf8'));
test('all seven curated GitHub sources are pinned and CC0',()=>{
 const x=validateRegistry(source);
 assert.equal(x.repositories,7);
 assert.equal(x.license,'CC0-1.0');
 assert.equal(x.protectedArchive,'archive/rani-kingdom-v539-20261029');
 assert.equal(x.selectedFiles,52);
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

test('Kenney CC0 is scoped to models, sprites and sound, never Godot code or fonts',()=>{
 let d=structuredClone(source);
 const pack=d.packs.find(p=>p.id==='kenney-fps-media');
 pack.files.push('scripts/player.gd');
 assert.throws(()=>validateRegistry(d),/Unapproved asset type|Non-CC0 media/);
 d=structuredClone(source);d.packs.find(p=>p.id==='kenney-fps-media').licenseFile='LICENSE.md';
 assert.throws(()=>validateRegistry(d),/Non-CC0/);
});

test('Gobkit pinned CC0 GLBs exclude scripts, SVG and noncurated assets',()=>{
 let d=structuredClone(source);
 const g=d.packs.find(x=>x.id==='gobkit-free-lowpoly');
 assert.equal(g.commit,'4e73c68fa6e8ca9d948fcc0ce7215c830a022c3b');
 g.files.push('example/index.html');
 assert.throws(()=>validateRegistry(d));
 d=structuredClone(source);
 d.packs.find(x=>x.id==='gobkit-free-lowpoly').files.push('minion/minion-a02.glb');
 assert.throws(()=>validateRegistry(d),/Unapproved Gobkit model/);
 d=structuredClone(source);
 d.packs.find(x=>x.id==='gobkit-free-lowpoly').licenseFile='README.md';
 assert.throws(()=>validateRegistry(d),/Non-CC0/);
});
