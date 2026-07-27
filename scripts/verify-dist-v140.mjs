import fs from 'node:fs'; import path from 'node:path';
const root=process.cwd(), dist=process.env.DIST_DIR?path.resolve(process.env.DIST_DIR):path.join(root,'dist');
const p=path.join(dist,'version.json'); if(!fs.existsSync(p))throw new Error('dist/version.json missing'); const version=JSON.parse(fs.readFileSync(p,'utf8'));
const patch=Number(String(version.releaseVersion||'').split('.')[2]); if(!Number.isInteger(patch)||patch<40)throw new Error('v1.0.40+ dist foundation missing');
if(fs.existsSync(path.join(dist,'assets/ip-v13/sheets')))throw new Error('audit-only IP source sheets leaked into dist');
for(const rel of ['assets/ip-v13/asset-manifest-v13.json','assets/ip-v13/crops/heroes/heroes-r01-c01.png','assets/ip-v13/crops/ui/ui-r01-c01.png'])if(!fs.existsSync(path.join(dist,rel)))throw new Error(`runtime crop foundation missing: dist/${rel}`);
console.log(`PASS v1.0.40+ dist boundary preserved under ${version.releaseVersion}`);
