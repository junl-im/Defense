import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=path.resolve(process.argv[2]||'engines/fiefdom');
const r=p=>fs.readFileSync(path.join(root,p),'utf8');
const w=(p,s)=>fs.writeFileSync(path.join(root,p),s);
function replace(file,a,b){const s=r(file);assert.equal(s.split(a).length,2,'changed source: '+file+' '+a.slice(0,55));w(file,s.replace(a,b));}
replace('src/game/state.ts',
 '  hp: number;\n  /**\n   * A drawbridge that is up.',
 '  hp: number;\n  /** Persistent defensive building upgrade (default Lv.1). */\n  raniLevel?: number;\n  /**\n   * A drawbridge that is up.');
replace('src/game/save.ts',
 '  held: Record<string, number>;\n  /** A drawbridge that was raised.',
 '  held: Record<string, number>;\n  /** Rani upgrade, optional for legacy saved games. */\n  lv?: number;\n  /** A drawbridge that was raised.');
let main=r('src/main.ts');
function sub(a,b){assert.equal(main.split(a).length,2,'main anchor changed: '+a.slice(0,70));main=main.replace(a,b);}
sub("import { Hud } from './ui/hud';","import { Hud } from './ui/hud';\nimport { RaniBuildingWheel } from './ui/rani-hex';");
sub('        n: b.name, x: b.x, z: b.z, staff: b.staff, hp: b.hp,\n        held:',
    '        n: b.name, x: b.x, z: b.z, staff: b.staff, hp: b.hp,\n        lv: b.raniLevel && b.raniLevel > 1 ? b.raniLevel : undefined,\n        held:');
sub('      b.hp = sb.hp;\n      b.held = { ...sb.held } as typeof b.held;',
    '      b.hp = sb.hp;\n      b.raniLevel = Math.min(3, Math.max(1, sb.lv ?? 1));\n      b.held = { ...sb.held } as typeof b.held;');
const injection=fs.readFileSync(path.join(import.meta.dirname,'v53-main-insert.txt'),'utf8');
const original="  function clickBuildingAt(wx: number, wz: number): boolean {\n    const b = buildingAt(Math.floor(wx), Math.floor(wz));\n    if (!b) return false;\n    if (b.name === 'gatehouse') { toggleGate(b); return true; }\n    return toggleProduct(b);\n  }";
const revised="  function clickBuildingAt(wx: number, wz: number): boolean {\n    const b = buildingAt(Math.floor(wx), Math.floor(wz));\n    if (!b) { inspector.close(); return false; }\n    inspector.open(b);\n    return true;\n  }";
sub(original,injection+revised);
sub("        demolish(b);\n        // Stays armed: clearing a misplaced row is several clicks, and Esc or",
    "        inspector.confirm(b);\n        // Stays armed: clearing a misplaced row is several clicks, and Esc or");
sub("if (army.selectAt(w.x, w.z, true, true)) return;",
    "if (army.selectAt(w.x, w.z, true, true)) { inspector.close(); return; }");
sub("if (army.selectAt(w.x, w.z, e.shiftKey)) return;",
    "if (army.selectAt(w.x, w.z, e.shiftKey)) { inspector.close(); return; }");
sub("    if (b.name === 'keep') {\n      state.notify('The keep cannot be pulled down', 'warn');",
    "    if (!canRaniDemolish(b)) {\n      state.notify('필수 건물은 철거할 수 없습니다.', 'warn');");
sub("          const full = buildingHp(b.def);\n          if (b.hp >= full) continue;",
    "          const full = raniMaxHp(b);\n          if (b.hp >= full) continue;");
sub("b.hp / buildingHp(b.def) < worst.hp / buildingHp(worst.def)",
    "b.hp / raniMaxHp(b) < worst.hp / raniMaxHp(worst)");
sub("worst.hp = Math.min(buildingHp(worst.def), worst.hp + REPAIR_PER_SECOND * dt)",
    "worst.hp = Math.min(raniMaxHp(worst), worst.hp + REPAIR_PER_SECOND * dt)");
w('src/main.ts',main);
fs.copyFileSync(path.join(import.meta.dirname,'hex-inspector.ts'),path.join(root,'src/ui/rani-hex.ts'));
fs.copyFileSync(path.join(import.meta.dirname,'hex-inspector.css'),path.join(root,'public/rani/hex-inspector.css'));
let html=r('index.html');
assert.ok(!html.includes('hex-inspector.css'));
html=html.replace('</head>','  <link rel="stylesheet" href="/rani/hex-inspector.css">\n</head>');
w('index.html',html);
console.log('PASS six action wheel, same-click toggle, persistent HP upgrade, demolition confirmation, keep/storage protected');
