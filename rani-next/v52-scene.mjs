/**
 * Rani v5.2: biome art at actual isometric draw calls.
 * Change tree species only for the new Rani coast. No changed occupancy,
 * collision, game economies, historical map IDs or save schema.
 */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=path.resolve(process.argv[2]||'engines/fiefdom');
const file=path.join(root,'src/main.ts');
let src=fs.readFileSync(file,'utf8');
const oldScatter="    if (name) {\n      decorations.push({ name, x: t.x, z: t.z, alive: true, regrowAt: 0, claimedBy: null });";
assert.equal(src.split(oldScatter).length,2,'Original scatter code shifted');
const newScatter=[
 "    // Rani coast: woodland rather than inland desert palms. The number",
 "    // of occupied tiles and all game pathfinding are unchanged.",
 "    if (chosen.id === 'rani_coast' && name === 'palm') {",
 "      const leaf = hash2(t.x * 19 + 61, t.z * 23 + 7);",
 "      name = leaf < 0.55 ? 'oak' : 'olive_tree';",
 "    }",
 "    if (name) {",
 "      decorations.push({ name, x: t.x, z: t.z, alive: true, regrowAt: 0, claimedBy: null });"
].join('\n');
src=src.replace(oldScatter,newScatter);
const oldDraw="    for (const t of decorations) if (t.alive) push(t.name, t.x, t.z, 1, 1);";
assert.equal(src.split(oldDraw).length,2,'Original sprite world draw code shifted');
const newDraw=[
 "    // True GPU 2.5D sprite tint, keyed to coordinates and species.",
 "    // No render-loop random calls, extra scene nodes, fake SVG or HUD art.",
 "    const royalFoliageTint = (name: string, x: number, z: number):",
 "        [number, number, number] | undefined => {",
 "      if (name !== 'oak' && name !== 'olive_tree' && name !== 'palm'",
 "          && name !== 'bush' && name !== 'dead_tree') return undefined;",
 "      const salt = name === 'oak' ? 113 : name === 'olive_tree' ? 193",
 "        : name === 'palm' ? 277 : name === 'bush' ? 359 : 439;",
 "      const hash = (Math.imul(x + 1, 92837111)",
 "        ^ Math.imul(z + 1, 689287499) ^ salt) >>> 0;",
 "      const palette: [number, number, number][] = [",
 "        [0.93, 1.02, 0.94], [1.05, 1.04, 0.95],",
 "        [0.96, 0.95, 1.02], [1.04, 1.06, 1.00],",
 "        [0.94, 1.00, 1.06]",
 "      ];",
 "      return palette[hash % palette.length];",
 "    };",
 "    for (const t of decorations) if (t.alive)",
 "      push(t.name, t.x, t.z, 1, 1,",
 "        royalFoliageTint(t.name, t.x, t.z));"
].join('\n');
src=src.replace(oldDraw,newDraw);
// Additional screen-QA copy: these are runtime status *display strings*,
// never a save key, worker state, or simulation identifier.
for (const [oldCopy,ko] of [
  ["'no worker'", "'작업자 없음'"],
  ['short ${want - b.staff}', '작업자 ${want - b.staff}명 부족'],
  ["'Autosaved.'", "'자동 저장 완료.'"],
  ['Autosave failed: ${err}', '자동 저장 실패: ${err}']
]) {
  assert.ok(src.includes(oldCopy),'Missing original status message: '+oldCopy);
  src=src.replace(oldCopy,ko);
}

fs.writeFileSync(file,src);
console.log('PASS Rani v5.2: seeded woodland and per-tree native sprite GPU tint');
