import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
const root = path.resolve(import.meta.dirname, '..');
const baseline = JSON.parse(fs.readFileSync(path.join(root, 'docs/PERFORMANCE_BASELINE_v1.0.45_DIST.json'), 'utf8'));
const run = spawnSync(process.execPath, [path.join(root, 'scripts/verify-dist-budget-v144.mjs')], { cwd:root, env:process.env, encoding:'utf8', timeout:60000 });
process.stdout.write(run.stdout||''); process.stderr.write(run.stderr||''); if(run.status!==0)process.exit(run.status||1);
const measured = JSON.parse(fs.readFileSync(path.join(root, 'logs/qa/v144/dist-budget-report.json'), 'utf8'));
const actual = { initialJsGzipBytes:measured.initial.js.gzipBytes, initialCssGzipBytes:measured.initial.css.gzipBytes, initialRequests:measured.initial.requests, initialTextureUploadBytes:measured.initial.textures.estimatedUploadBytes };
const envelope = { initialJsGzipBytes:measured.thresholds.maxInitialJsGzipBytes, initialCssGzipBytes:measured.thresholds.maxInitialCssGzipBytes, initialRequests:measured.thresholds.maxInitialRequests, initialTextureUploadBytes:measured.thresholds.maxInitialTextureUploadBytes };
const approved = baseline.approvedMeasurements; const percent=Number(baseline.maxRegressionPercent||5); const checks={};
for(const key of Object.keys(actual)){const basis=approved?.[key];const exact=Number.isFinite(basis);const maximum=exact?Math.floor(basis*(1+percent/100)):envelope[key];checks[key]={actual:actual[key],baseline:exact?basis:null,maximum,mode:exact?'approved-v145-measurement':'provisional-v144-envelope',pass:actual[key]<=maximum};}
const report={id:'DD-DIST-TREND-V147',releaseVersion:'1.0.47',baselineStatus:baseline.measurementStatus,measuredBuild:{releaseVersion:measured.releaseVersion,buildId:measured.buildId},actual,checks,passed:Object.values(checks).every((entry)=>entry.pass)};
const out=path.join(root,'logs/qa/v147/dist-trend-report.json');fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,`${JSON.stringify(report,null,2)}\n`);
if(!report.passed){for(const [key,value] of Object.entries(checks))if(!value.pass)console.error(`FAIL v147 dist trend ${key}: ${value.actual} > ${value.maximum}`);process.exit(1);}console.log(`PASS v1.0.47 Vite dist trend (${checks.initialJsGzipBytes.mode})`);
