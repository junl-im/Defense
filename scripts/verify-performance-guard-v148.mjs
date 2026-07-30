import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '..');
const budget = JSON.parse(fs.readFileSync(path.join(root, 'docs/PERFORMANCE_GUARD_v1.0.48.json'), 'utf8'));
const audit = JSON.parse(fs.readFileSync(path.join(root, 'docs/generated/system-audit-v148.json'), 'utf8'));
const main = fs.readFileSync(path.join(root, 'src/main.js'), 'utf8');
const engine = fs.readFileSync(path.join(root, 'src/engine/mobile-engine.js'), 'utf8');
const scheduler = fs.readFileSync(path.join(root, 'src/engine/frame-budget-scheduler.js'), 'utf8');
const forwardRuntimeBytesV150Plus = fs.readdirSync(path.join(root, 'src/runtime'))
  .filter((name) => /-v(?:150|151)\.js$/.test(name))
  .reduce((sum, name) => sum + fs.statSync(path.join(root, 'src/runtime', name)).size, 0);
const v148ScopedRuntimeBytes = audit.metrics.runtimeBytes - forwardRuntimeBytesV150Plus;
const forwardSourceBytesV151 = [
  'src/runtime/character-presentation-policy-v151.js',
  'src/runtime/character-presentation-director-v151.js',
  'src/engine/character-material-enhancer-v151.js'
].filter((file) => fs.existsSync(path.join(root, file))).reduce((sum, file) => sum + fs.statSync(path.join(root, file)).size, 0);
const v148ScopedSourceBytes = audit.metrics.sourceBytes - forwardSourceBytesV151;
const failures = [];
const check = (value, label) => { if (!value) failures.push(label); };
check(v148ScopedSourceBytes <= budget.maximum.sourceBytes, `v148-scoped source bytes ${v148ScopedSourceBytes}/${budget.maximum.sourceBytes} (excluded v151 ${forwardSourceBytesV151})`);
check(audit.metrics.mainBytes <= budget.maximum.mainBytes, `main bytes ${audit.metrics.mainBytes}/${budget.maximum.mainBytes}`);
check(audit.metrics.engineBytes <= budget.maximum.engineBytes, `engine bytes ${audit.metrics.engineBytes}/${budget.maximum.engineBytes}`);
check(v148ScopedRuntimeBytes <= budget.maximum.runtimeBytes, `v148-scoped runtime bytes ${v148ScopedRuntimeBytes}/${budget.maximum.runtimeBytes} (excluded v150-v151 ${forwardRuntimeBytesV150Plus})`);
check(audit.metrics.setIntervalCalls === 0, 'setInterval calls must remain zero');
check(audit.checks.hiddenFrameSuspensionBeforeHeavyWork, 'hidden frame must suspend before heavy work');
check(main.includes('Math.min(.033, rawDt)'), 'frame delta clamp preserved');
check(main.includes("this.frameScheduler.shouldRun('render-stats'"), 'render stats remain cadence limited');
check(engine.includes('lowEndPixelRatio') && engine.includes('mobilePixelRatio') && engine.includes('desktopPixelRatio'), 'device pixel-ratio caps preserved');
check(scheduler.includes('state.skips += 1') && scheduler.includes('state.runs += 1'), 'frame scheduler run/skip accounting preserved');
if (failures.length) { failures.forEach((failure) => console.error(`FAIL v148 performance guard ${failure}`)); process.exit(1); }
console.log(`PASS v1.0.48 performance guard (source ${audit.metrics.sourceBytes}/${budget.maximum.sourceBytes}, main ${audit.metrics.mainBytes}/${budget.maximum.mainBytes})`);
