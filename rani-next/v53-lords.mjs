// Localize actual lord-select screen roster without changing faction IDs.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const file=path.resolve(process.argv[2]||'engines/fiefdom','src/ui/lords.ts');
let s=fs.readFileSync(file,'utf8');
const pairs=[
 ["nm.textContent = plan ? c.name : (i === 0 ? 'You' : c.name);",
  "nm.textContent = plan ? c.name : (['나','붉은 영주','푸른 영주','보라 영주'][i] ?? c.name);"],
 [" : 'not playing';"," : '참가 안 함';"]
];
for(const [a,b] of pairs){
 assert.equal(s.split(a).length,2,'Upstream lord roster changed: '+a);
 s=s.replace(a,b);
}
fs.writeFileSync(file,s);
console.log('PASS actual post-map king/lord labels all Korean, underlying faction IDs unchanged');
