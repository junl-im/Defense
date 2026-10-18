import assert from 'node:assert/strict';
import { validateBackup, importKingdom, undoImport, canUndoImport, exportKingdom, BEFORE_IMPORT_KEY } from '../src/systems/SaveBackups.js';
import { SAVE_KEY } from '../src/systems/SaveSystem.js';

const memory = new Map();
globalThis.localStorage = {
  getItem: (k) => memory.has(k) ? memory.get(k) : null,
  setItem: (k,v) => memory.set(k,String(v)),
  removeItem: (k) => memory.delete(k),
};
const snap = (count=1) => ({
  version:3,score:10,drawCount:2,worldSeed:123,tilesPlaced:count,
  cells:[{q:0,r:0,t:'village',v:1,rot:0,seed:123,age:0},
    ...(count===2?[{q:1,r:0,t:'forest',v:0,rot:0,seed:345,age:0}]:[])],
  next:{type:'forest',variant:0}, resources:{wood:42},citizens:{},
  progression:{tier:0},territory:{},factions:{},buildings:{},research:{},army:{}
});
const old=JSON.stringify(snap(1));
const current=JSON.stringify(snap(2));
assert.equal(validateBackup(old).tilesPlaced,1);
assert.equal(validateBackup(current).tilesPlaced,2);
for (const bad of ['', 'not json', JSON.stringify({...snap(),version:99}),
  JSON.stringify({...snap(),cells:[]}),
  JSON.stringify({...snap(),worldSeed:-1}),
  JSON.stringify({...snap(),cells:[snap().cells[0],snap().cells[0]]}),
  JSON.stringify({...snap(),cells:[{...snap().cells[0],t:'unknown'}]}),
  JSON.stringify({...snap(),cells:[{...snap().cells[0],q:14}]}),
  JSON.stringify(snap()).replace('"resources":{"wood":42}', '"resources":{"__proto__":{},"wood":42}')]) {
  assert.throws(()=>validateBackup(bad), 'should reject invalid import');
}
memory.set(SAVE_KEY,current);
assert.equal(canUndoImport(),false);
assert.throws(()=>importKingdom('broken json'));
assert.equal(memory.get(SAVE_KEY),current, 'invalid import must not alter save');
assert.equal(memory.get(BEFORE_IMPORT_KEY),undefined, 'invalid import must not write rollback');
const imported=importKingdom(old);
assert.equal(imported.tilesPlaced,1);
assert.equal(JSON.parse(memory.get(SAVE_KEY)).tilesPlaced,1);
assert.equal(memory.get(BEFORE_IMPORT_KEY),current);
assert(canUndoImport());
assert.equal(undoImport().tilesPlaced,2);
assert.equal(memory.get(SAVE_KEY),current);
assert.equal(canUndoImport(),false);
assert.equal(exportKingdom({saveSystem:{enabled:true,save:()=>{}}}),current);
console.log('PASS save backups: validation, rejected files, import, rollback, undo and export');
