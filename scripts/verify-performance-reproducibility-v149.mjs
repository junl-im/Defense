import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '..');
const budget = JSON.parse(fs.readFileSync(path.join(root, 'docs/PERFORMANCE_GUARD_v1.0.49.json'), 'utf8'));
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'docs/generated/build-input-manifest-v149.json'), 'utf8'));
const mainPath = path.join(root, 'src/main.js');
const mainBytes = fs.statSync(mainPath).size;
let sourceBytes = 0;
function walk(directory) { for (const name of fs.readdirSync(directory)) { const file = path.join(directory, name); const stat = fs.statSync(file); if (stat.isDirectory()) walk(file); else if (/\.(?:js|css)$/.test(name)) sourceBytes += stat.size; } }
walk(path.join(root, 'src'));
const runtimeFiles = fs.readdirSync(path.join(root, 'src/runtime')).filter((name) => /-v149\.js$/.test(name));
const runtimeBytes = runtimeFiles.reduce((sum, name) => sum + fs.statSync(path.join(root, 'src/runtime', name)).size, 0);
const regression = ((mainBytes - budget.baseline.mainBytes) / budget.baseline.mainBytes) * 100;
const failures = [];
const check = (value, label) => { if (!value) failures.push(label); };
check(budget.id === 'DD-PERFORMANCE-AND-REPRODUCIBILITY-GUARD-V149', 'performance budget identity');
check(mainBytes <= budget.limits.mainBytes, `main bytes ${mainBytes} > ${budget.limits.mainBytes}`);
check(regression <= budget.limits.mainRegressionPercent, `main regression ${regression.toFixed(3)}% > ${budget.limits.mainRegressionPercent}%`);
check(sourceBytes <= budget.limits.sourceJsCssBytes, `source bytes ${sourceBytes} > ${budget.limits.sourceJsCssBytes}`);
check(runtimeBytes <= budget.limits.v149RuntimeModuleBytes, `v149 runtime bytes ${runtimeBytes} > ${budget.limits.v149RuntimeModuleBytes}`);
check(runtimeFiles.length === 5, `v149 runtime module count ${runtimeFiles.length} != 5`);
check(manifest.algorithm === budget.requiredBuildInputAlgorithm && manifest.releaseVersion === '1.0.49' && /^[a-f0-9]{64}$/.test(manifest.aggregateSha256 || ''), 'build input manifest contract');
if (failures.length) { failures.forEach((failure) => console.error(`FAIL ${failure}`)); process.exit(1); }
console.log(`PASS v1.0.49 performance/reproducibility guard (main ${mainBytes} bytes, ${regression.toFixed(3)}%, source ${sourceBytes}, v149 runtime ${runtimeBytes})`);
