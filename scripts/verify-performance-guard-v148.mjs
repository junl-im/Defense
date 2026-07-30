import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '..');
const budget = JSON.parse(fs.readFileSync(path.join(root, 'docs/PERFORMANCE_GUARD_v1.0.48.json'), 'utf8'));
const audit = JSON.parse(fs.readFileSync(path.join(root, 'docs/generated/system-audit-v148.json'), 'utf8'));
const main = fs.readFileSync(path.join(root, 'src/main.js'), 'utf8');
const engine = fs.readFileSync(path.join(root, 'src/engine/mobile-engine.js'), 'utf8');
const scheduler = fs.readFileSync(path.join(root, 'src/engine/frame-budget-scheduler.js'), 'utf8');
const forwardRuntimeBytesV150 = fs.readdirSync(path.join(root, 'src/runtime'))
  .filter((name) => /-v150\.js$/.test(name))
  .reduce((sum, name) => sum + fs.statSync(path.join(root, 'src/runtime', name)).size, 0);
const v148ScopedRuntimeBytes = audit.metrics.runtimeBytes - forwardRuntimeBytesV150;
const failures = [];
const check = (value, label) => { if (!value) failures.push(label); };
check(audit.metrics.sourceBytes <= budget.maximum.sourceBytes, `source bytes ${audit.metrics.sourceBytes}/${budget.maximum.sourceBytes}`);
check(audit.metrics.mainBytes <= budget.maximum.mainBytes, `main bytes ${audit.metrics.mainBytes}/${budget.maximum.mainBytes}`);
check(audit.metrics.engineBytes <= budget.maximum.engineBytes, `engine bytes ${audit.metrics.engineBytes}/${budget.maximum.engineBytes}`);
check(v148ScopedRuntimeBytes <= budget.maximum.runtimeBytes, `v148-scoped runtime bytes ${v148ScopedRuntimeBytes}/${budget.maximum.runtimeBytes} (excluded v150 ${forwardRuntimeBytesV150})`);
check(audit.metrics.setIntervalCalls === 0, 'setInterval calls must remain zero');
check(audit.checks.hiddenFrameSuspensionBeforeHeavyWork, 'hidden frame must suspend before heavy work');
check(main.includes('Math.min(.033, rawDt)'), 'frame delta clamp preserved');
check(main.includes("this.frameScheduler.shouldRun('render-stats'"), 'render stats remain cadence limited');
check(engine.includes('lowEndPixelRatio') && engine.includes('mobilePixelRatio') && engine.includes('desktopPixelRatio'), 'device pixel-ratio caps preserved');
check(scheduler.includes('state.skips += 1') && scheduler.includes('state.runs += 1'), 'frame scheduler run/skip accounting preserved');
if (failures.length) { failures.forEach((failure) => console.error(`FAIL v148 performance guard ${failure}`)); process.exit(1); }
console.log(`PASS v1.0.48 performance guard (source ${audit.metrics.sourceBytes}/${budget.maximum.sourceBytes}, main ${audit.metrics.mainBytes}/${budget.maximum.mainBytes})`);
