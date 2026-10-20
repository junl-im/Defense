import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=path.resolve(process.argv[2]||'engines/fiefdom');
const here=import.meta.dirname;
const file=p=>path.join(root,p);
function change(p,from,to){
 const s=fs.readFileSync(file(p),'utf8');
 assert.equal(s.split(from).length,2,'Upstream anchor changed '+p+' '+from.slice(0,95));
 fs.writeFileSync(file(p),s.replace(from,to));
}
fs.copyFileSync(path.join(here,'v53-radial.ts'),file('src/ui/raniWheel.ts'));
fs.appendFileSync(file('public/rani/skin.css'),'\n'+fs.readFileSync(path.join(here,'v53-wheel.css'),'utf8'));
change('src/game/state.ts',
 '  hp: number;\n  /**\n   * A drawbridge that is up.',
 '  hp: number;\n  /** Optional Rani defence level, defaults to 1 on old saves. */\n  lvl?: number;\n  /**\n   * A drawbridge that was raised.');
change('src/game/save.ts',
 '  held: Record<string, number>;\n  /** A drawbridge that was raised.',
 '  held: Record<string, number>;\n  /** Optional Rani defence level; old saves load as 1. */\n  lvl?: number;\n  /** A drawbridge that was raised.');
change('src/main.ts',
 "import { Hud } from './ui/hud';",
 "import { Hud } from './ui/hud';\nimport { createRaniWheel, type RaniTarget } from './ui/raniWheel';");
change('src/main.ts',
 '        n: b.name, x: b.x, z: b.z, staff: b.staff, hp: b.hp,',
 '        n: b.name, x: b.x, z: b.z, staff: b.staff, hp: b.hp,\n        lvl: b.lvl && b.lvl > 1 ? b.lvl : undefined,');
change('src/main.ts',
 '      b.hp = sb.hp;\n      b.held = { ...sb.held } as typeof b.held;',
 '      b.hp = sb.hp;\n      b.lvl = Math.max(1, Math.min(3, sb.lvl ?? 1));\n      b.held = { ...sb.held } as typeof b.held;');
const oldClick=[
'  /**',
'   * A bare click on a building. True if it meant something: a gatehouse is',
'   * shut or opened, a workshop with two products is flipped.',
'   */',
'  function clickBuildingAt(wx: number, wz: number): boolean {',
'    const b = buildingAt(Math.floor(wx), Math.floor(wz));',
'    if (!b) return false;',
"    if (b.name === 'gatehouse') { toggleGate(b); return true; }",
'    return toggleProduct(b);',
'  }'
].join('\n');
const newClick=fs.readFileSync(path.join(here,'v53-main-inline.ts'),'utf8').trimEnd();
change('src/main.ts',oldClick,newClick);
change('src/main.ts',
 "        demolish(b);\n        // Stays armed: clearing a misplaced row is several clicks, and Esc or",
 "        rkWheel.confirmRemoval(rkTarget(b));\n        // Stays armed: clearing a misplaced row is several clicks, and Esc or");
change('src/main.ts',
 "      } else {\n        state.notify('Nothing there to pull down', 'warn');\n      }\n      return;",
 "      } else {\n        const w=pickWorld(e.clientX,e.clientY);\n        const nature=rkNature(Math.floor(w.x),Math.floor(w.z));\n        if(nature)rkWheel.confirmRemoval(nature);\n        else state.notify('철거할 건물이나 자연물이 없습니다.','warn');\n      }\n      return;");
change('src/main.ts',
 "      if (army.selectAt(w.x, w.z, e.shiftKey)) return;",
 "      if (army.selectAt(w.x, w.z, e.shiftKey)) {rkWheel.close();return;}");
change('src/main.ts',
 "        if (army.selectAt(w.x, w.z, true, true)) return;",
 "        if (army.selectAt(w.x, w.z, true, true)) {rkWheel.close();return;}");
change('src/main.ts',
 '  hud.onSelect = () => refreshOverlay();',
 '  hud.onSelect = () => { refreshOverlay(); rkWheel.close(); };');
change('src/main.ts',
 '    state, workers, placement, terrain, iso, stepSim,',
 '    state, workers, placement, terrain, iso, stepSim, raniWheel:rkWheel,');
console.log('PASS Rani v5.3 contextual building wheel: real upgrades, protected demolition, save-compatible levels, scenery');
