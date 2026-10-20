// Rani v5.4: direct entry to real world, original maps and save slots remain.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=path.resolve(process.argv[2]||'engines/fiefdom');
function modify(rel,from,to){
 const p=path.join(root,rel),source=fs.readFileSync(p,'utf8');
 assert.equal(source.split(from).length,2,'Upstream anchor changed '+rel+': '+from.slice(0,55));
 fs.writeFileSync(p,source.replace(from,to));
}
modify('src/ui/lords.ts',
 '  map: MapDef, difficulty: Difficulty, plan: SeatPlan | null = null,\n): Promise<LordSetup | null> {',
 '  map: MapDef, difficulty: Difficulty, plan: SeatPlan | null = null,\n  quickStart = false,\n): Promise<LordSetup | null> {');
modify('src/ui/lords.ts',
 '    draw();\n  });\n}\n',
 '    draw();\n    // Same terrain generator, validated seats and native begin handler.\n    if (quickStart && !plan && seats[0]) {\n      queueMicrotask(() => { if (root.isConnected) go.click(); });\n    }\n  });\n}\n');
modify('src/ui/menu.ts',
 "    const acts = document.createElement('div');\n    acts.className = 'acts';\n    acts.appendChild(go);\n    root.appendChild(acts);",
 "    const acts = document.createElement('div');\n    acts.className = 'acts';\n    const quick = document.createElement('button');\n    quick.id = 'rk-start-now';\n    quick.type = 'button';\n    quick.className = 'rk-start-now';\n    quick.textContent = '바로 왕국 시작';\n    quick.setAttribute('aria-label', '선택한 지도에서 바로 왕국 시작');\n    quick.onclick = async () => {\n      if (quick.disabled) return;\n      quick.disabled = true;\n      root.style.display = 'none';\n      try {\n        const setup = await lordScreen(chosen, readDifficulty(), null, true);\n        if (!setup) { root.style.display = ''; quick.disabled = false; return; }\n        store.setItem(DIFF_KEY, setup.difficulty);\n        leave();\n        resolve({kind:'play', map:chosen, setup});\n      } catch (err) {\n        root.style.display = '';\n        quick.disabled = false;\n        const warning = document.createElement('p');\n        warning.className = 'rk-start-warning';\n        warning.textContent = '빠른 시작에 실패했습니다. 영주 선택으로 진행해 주세요.';\n        acts.appendChild(warning);\n        console.error('Rani quickstart error', err);\n      }\n    };\n    go.classList.add('rk-manual-start');\n    acts.append(quick, go);\n    root.appendChild(acts);");
fs.appendFileSync(path.join(root,'public/rani/skin.css'),
 '\n'+fs.readFileSync(path.join(import.meta.dirname,'v54-world-first.css'),'utf8'));
console.log('PASS Rani v5.4: actual world quickstart plus preserved native configuration');