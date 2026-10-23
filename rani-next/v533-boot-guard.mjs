// v5.33 — guard the real WebGL renderer failure without modifying game state.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=path.resolve(process.argv[2]||'engines/fiefdom');
const p=rel=>path.join(root,rel);
fs.copyFileSync(path.join(import.meta.dirname,'v533-boot-guard.js'),p('public/rani/v533-boot-guard.js'));
const html=p('index.html'),src=fs.readFileSync(html,'utf8'),anchor='  </head>';
assert.equal(src.split(anchor).length,2,'v5.33 HTML head anchor drift');
assert.ok(!src.includes('v533-boot-guard.js'),'v5.33 guard duplicate');
fs.writeFileSync(html,src.replace(anchor,'    <script src="/rani/v533-boot-guard.js"></script>\n'+anchor));
fs.appendFileSync(p('public/rani/skin.css'),'\n'+fs.readFileSync(path.join(import.meta.dirname,'v533-boot-guard.css'),'utf8'));
console.log('PASS v5.33 Korean graphics recovery dialog wired before game module');
