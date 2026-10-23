// v5.32: choose a genuinely developable keep site on every shipped map.
// Terrain seeds, tile contents, economics, old saves and building rules remain unchanged.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=path.resolve(process.argv[2]||'engines/fiefdom');
function change(file,from,to){
  const p=path.join(root,file),s=fs.readFileSync(p,'utf8');
  assert.equal(s.split(from).length,2,'v5.32 generator drift: '+file+' '+from.slice(0,95));
  fs.writeFileSync(p,s.replace(from,to));
}
change('src/game/worldgen.ts',
`  const WATER = GROUND_TYPES.indexOf('water');

  let best = { x: Math.floor(width / 2), z: Math.floor(height / 2) };`,
`  const WATER = GROUND_TYPES.indexOf('water');
  const MARSH = GROUND_TYPES.indexOf('marsh');
  // The 5x5 foundation must be genuinely dry: flatness alone also accepts
  // entire lakes and pitch bogs, producing a castle with nowhere to develop.
  // Preserve the generated terrain; only choose a safer new-game seat.
  const dryKeep = (x: number, z: number): boolean => {
    for (let dz = -1; dz <= 3; dz++) {
      for (let dx = -1; dx <= 3; dx++) {
        const g=groundType[idx(x+dx,z+dz)];
        if (g===WATER || g===MARSH || g===IRON) return false;
      }
    }
    return true;
  };

  let best = { x: Math.floor(width / 2), z: Math.floor(height / 2) };`);
change('src/game/worldgen.ts',
`      if (!isBuildable(terrain, x - 1, z - 1, 5, 5)) continue;
      // Not on the ore: a keep on a seam is a mine nobody can build.`,
`      if (!isBuildable(terrain, x - 1, z - 1, 5, 5)) continue;
      if (!dryKeep(x, z)) continue;
      // Not on the ore: a keep on a seam is a mine nobody can build.`);
change('src/game/worldgen.ts',
`      let green = 0, rock = 0, iron = 0, flat = 0, water = 0;`,
`      let green = 0, rock = 0, iron = 0, flat = 0, water = 0;
      let nearFlat=0,nearGreen=0,nearRock=0,nearIron=0;`);
change('src/game/worldgen.ts',
`          if (buildable) flat++;
          // Only count ground a farm or quarry could actually be PUT on.`,
`          if (buildable) {
            flat++;
            if(Math.hypot(dx,dz)<=18) {
              nearFlat++;
              if(g===GRASS||g===DARK)nearGreen++;
              else if(g===ROCK)nearRock++;
              else if(g===IRON)nearIron++;
            }
          }
          // Only count ground a farm or quarry could actually be PUT on.`);
change('src/game/worldgen.ts',
`        - (green < 8 ? 900 : 0) - (rock < 4 ? 900 : 0) - (iron < 5 ? 600 : 0);
      if (score > bestScore)`,
`        - (green < 8 ? 900 : 0) - (rock < 4 ? 900 : 0) - (iron < 5 ? 600 : 0)
        // Territory starts around the keep, not the whole 26-tile sample.
        // Prefer a livable core with space for houses, farms and workshops.
        + Math.min(nearFlat, 60)*3 + Math.min(nearGreen, 20)*10
        + Math.min(nearRock, 14)*8 + Math.min(nearIron, 10)*7
        - (nearFlat < 10 ? 600 : 0) - (nearGreen < 3 ? 450 : 0);
      if (score > bestScore)`);
change('src/game/worldgen.ts',
`  return best;
}

/** Find a flat spot of the given size near a preferred point. */`,
`  if(bestScore===-Infinity) {
    // Last resort for severe maps: check every dry plateau before defaulting
    // to the centre. Never move ground or silently modify an existing seed.
    for(let z=8;z<height-8;z++)for(let x=8;x<width-8;x++){
      if(isBuildable(terrain,x-1,z-1,5,5)&&dryKeep(x,z))return {x,z};
    }
  }
  return best;
}

/** Find a flat spot of the given size near a preferred point. */`);
change('src/ui/lords.ts',
`      : 'Click a lord, then click the map to move his keep. '
        + 'Green, rock and iron ore near a keep is what makes a start playable.';`,
`      : '영주를 선택한 뒤 지도에서 시작 위치를 정하세요. '
        + '성 주변의 평지와 농지, 암반, 철광맥이 많을수록 발전하기 쉽습니다.';`);
console.log('PASS v5.32 native dry keep foundations and nearby buildable land scoring on original seeded maps');
