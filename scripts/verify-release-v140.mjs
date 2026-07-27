import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd(); const read=(p)=>fs.readFileSync(path.join(root,p),'utf8'); const json=(p)=>JSON.parse(read(p));
const hash=(f)=>createHash('sha256').update(fs.readFileSync(f)).digest('hex'); const failures=[]; const check=(x,m)=>{if(!x)failures.push(m)};
const pkg=json('package.json'), lock=json('package-lock.json'), version=json('public/version.json'), manifest=json('public/assets/ip-v13/asset-manifest-v13.json');
const patch=Number(String(pkg.version).split('.')[2]); const archive=path.join(root,'production/DokkaebiDefense/15_Source_Archives/ip-v13/sheets');
check(Number.isInteger(patch)&&patch>=40,'release remains v1.0.40+');
check(pkg.dokkaebi?.releaseVersion===pkg.version&&lock.version===pkg.version&&version.releaseVersion===pkg.version,'identity synchronized');
check(!fs.existsSync(path.join(root,'public/assets/ip-v13/sheets')),'public source sheets removed');
check(manifest.sheets?.length===10,'source sheet manifest coverage');
check(manifest.sheets.every((sheet)=>fs.existsSync(path.join(archive,sheet.file))&&hash(path.join(archive,sheet.file))===sheet.sha256),'production archive hashes');
check(read('scripts/clean-obsolete-assets.mjs').includes("'public/assets/ip-v13/sheets'"),'overlay cleanup contract');
check(read('scripts/generate-asset-sheets-v13.py').includes('15_Source_Archives/ip-v13/sheets'),'generator archive contract');
check(read('.github/workflows/deploy.yml').includes('npm run verify:dist:all'),'CI complete dist chain');
check(read('PROJECT_HANDOFF.md').includes('인수인계 내역 작성 필수'),'mandatory handoff contract');
for(const doc of ['docs/AUDIT_ASSET_BOUNDARY_v1.0.40.md','docs/PATCH_NOTES_v1.0.40.md','docs/PATCH_APPLY_v1.0.40.md'])check(fs.existsSync(path.join(root,doc)),`document ${doc}`);
if(failures.length){failures.forEach((x)=>console.error('FAIL '+x));process.exit(1)}
console.log(`PASS v1.0.40+ audit source-sheet boundary preserved under ${pkg.version}`);
