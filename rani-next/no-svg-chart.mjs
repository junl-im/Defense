/** Replace original Fiefdom inline SVG history chart with raster Canvas2D. */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=path.resolve(process.argv[2]||'engines/fiefdom');
const file=path.join(root,'src/ui/hud.ts');
let s=fs.readFileSync(file,'utf8');
const old="box.insertAdjacentHTML('beforeend', this.chartSvg(data, spec.fill, spec.zero));";
assert.ok(s.includes(old),'SVG chart invocation moved unexpectedly');
s=s.replace(old,
"const canvas = this.el('canvas', box, 'cplot') as HTMLCanvasElement;\n      this.paintChart(canvas, data, spec.fill, spec.zero);");
const start=s.indexOf('  /** A multi-series SVG line chart');
const end=s.indexOf('  private buildStats(): void {',start);
assert.ok(start>0&&end>start,'Cannot identify original SVG function boundaries');
const method=fs.readFileSync(path.join(import.meta.dirname,'canvas-chart-method.txt'),'utf8');
assert.ok(method.includes('paintChart')&&method.includes('getContext'));
s=s.slice(0,start)+method+s.slice(end);
s=s.replace('#chart .csvg { display: block; height: 250px; }',
'#chart .cplot { display: block; width: 100%; height: auto; border-radius: 7px; }');
assert.ok(!/<svg\b|data:image\/svg\+xml|this\.chartSvg\(/i.test(s),'SVG remains in gameplay HUD');
fs.writeFileSync(file,s);
console.log('PASS resource history is rendered on Korean-labeled native Canvas2D without SVG');
