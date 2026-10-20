/**
 * Rani v5.2 shore pixel effect in the actual Three.js isometric
 * terrain shader. Water tiles adjacent to dry land get a shallow-water
 * luminous fringe, computed from source tile IDs. No collision, elevation,
 * pathfinding, save schema, images, SVG, extra geometry or new drawing layers.
 */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=path.resolve(process.argv[2]||'engines/fiefdom');
const file=path.join(root,'src/engine/terrain.ts');
let s=fs.readFileSync(file,'utf8');
function once(from,to){
 assert.equal(s.split(from).length,2,'Expected exactly one Fiefdom terrain source anchor: '+from.slice(0,80));
 s=s.replace(from,to);
}
// One per corner so the attribute matches standard per-tile vertices.
once('    const tints = new Float32Array(tiles * 4);',
 [
 '    const tints = new Float32Array(tiles * 4);',
 '    const shoreEdges = new Float32Array(tiles * 4 * 4);',
 ].join('\n'));
once("    this.geometry.setAttribute('aTint', new THREE.BufferAttribute(tints, 1));",
 [
 "    this.geometry.setAttribute('aTint', new THREE.BufferAttribute(tints, 1));",
 "    this.geometry.setAttribute('aShore', new THREE.BufferAttribute(shoreEdges, 4));"
 ].join('\n'));
once('        in vec2 aTile;', '        in vec2 aTile;\n        in vec4 aShore;');
once('        out vec2 vTile;', '        out vec2 vTile;\n        out vec4 vShore;');
once('          vTile = aTile;', '          vTile = aTile;\n          vShore = aShore;');
once('        in vec2 vTile;', '        in vec2 vTile;\n        in vec4 vShore;');
// Dynamic layer updates on map generation/hand-painted worlds, not only at startup.
once("    const layerArr = layers.array as Float32Array;",
 [
 "    const layerArr = layers.array as Float32Array;",
 "    const shoreAttr = this.geometry.getAttribute('aShore') as THREE.BufferAttribute;",
 "    const shoreArr = shoreAttr.array as Float32Array;",
 "    // The original atlas has four variants per ground kind, water is type 6.",
 "    // Read only the existing layer IDs. Do not reassign any saved terrain type.",
 "    const waterAt = (x: number, z: number) => x >= 0 && z >= 0",
 "      && x < width && z < height",
 "      && Math.floor(this.layer[z * width + x] / 4) === 6;"
 ].join('\n'));
once('        // one flat normal for the whole tile keeps the faceted, tiered look',
 [
 "        // Water-only contact with land, ordered west/east/north/south.",
 "        // A cliff/land tile is never tinted: only water pixels gain a fringe.",
 "        const water = waterAt(x,z);",
 "        const west = water && x > 0 && !waterAt(x-1,z) ? 1 : 0;",
 "        const east = water && x < width-1 && !waterAt(x+1,z) ? 1 : 0;",
 "        const north = water && z > 0 && !waterAt(x,z-1) ? 1 : 0;",
 "        const south = water && z < height-1 && !waterAt(x,z+1) ? 1 : 0;",
 "        for (let k = 0; k < 4; k++) {",
 "          const o = (v+k)*4;",
 "          shoreArr[o] = west; shoreArr[o+1] = east;",
 "          shoreArr[o+2] = north; shoreArr[o+3] = south;",
 "        }",
 "",
 "        // one flat normal for the whole tile keeps the faceted, tiered look"
 ].join('\n'));
once('    layers.needsUpdate = true;',
 '    layers.needsUpdate = true;\n    shoreAttr.needsUpdate = true;');
// Run after ordinary textured water shading, before build overlay tint.
once('          // In build mode, wash legal ground green and mute everything else, so',
 [
 "          // Rani actual shoreline: edge of the WATER tile only.",
 "          // Scaled land/water boundary remains unchanged for game logic.",
 "          if (dot(vShore, vec4(1.0)) > 0.0) {",
 "            vec2 within = clamp(vWorld.xz - vTile, vec2(0.0), vec2(1.0));",
 "            float edge = max(",
 "              max(vShore.x * (1.0-smoothstep(0.02,0.22,within.x)),",
 "                  vShore.y * (1.0-smoothstep(0.02,0.22,1.0-within.x))),",
 "              max(vShore.z * (1.0-smoothstep(0.02,0.22,within.y)),",
 "                  vShore.w * (1.0-smoothstep(0.02,0.22,1.0-within.y))));",
 "            float ripple = 0.86 + 0.14 * sin(vWorld.x*17.1+vWorld.z*14.9);",
 "            colour = mix(colour, colour * vec3(0.84,1.17,1.21)",
 "              + vec3(0.010,0.038,0.042), edge*0.42*ripple);",
 "          }",
 "",
 "          // In build mode, wash legal ground green and mute everything else, so"
 ].join('\n'));
assert.ok(!s.includes('<svg'));
fs.writeFileSync(file,s);
console.log('PASS Royal shoreline: GPU water-only edge tint, no path/build/save changes');
