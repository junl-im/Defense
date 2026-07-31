import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '..');
const budget = JSON.parse(fs.readFileSync(path.join(root, 'docs/PERFORMANCE_GUARD_v1.0.48.json'), 'utf8'));
const audit = JSON.parse(fs.readFileSync(path.join(root, 'docs/generated/system-audit-v148.json'), 'utf8'));
const main = fs.readFileSync(path.join(root, 'src/main.js'), 'utf8');
const engine = fs.readFileSync(path.join(root, 'src/engine/mobile-engine.js'), 'utf8');
const scheduler = fs.readFileSync(path.join(root, 'src/engine/frame-budget-scheduler.js'), 'utf8');
const forwardTagV149Plus = /-v(?:149|150|151|152)\.js$/;
const walk = (dir, out = []) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
};
const sourceFiles = walk(path.join(root, 'src')).filter((file) => file.endsWith('.js'));
const forwardSourceFilesV149Plus = sourceFiles.filter((file) => forwardTagV149Plus.test(path.basename(file)));
const forwardSourceBytesV149Plus = forwardSourceFilesV149Plus.reduce((sum, file) => sum + fs.statSync(file).size, 0);
const forwardRuntimeBytesV149Plus = forwardSourceFilesV149Plus
  .filter((file) => file.startsWith(path.join(root, 'src/runtime') + path.sep))
  .reduce((sum, file) => sum + fs.statSync(file).size, 0);
const forwardEngineBytesV149Plus = forwardSourceFilesV149Plus
  .filter((file) => file.startsWith(path.join(root, 'src/engine') + path.sep))
  .reduce((sum, file) => sum + fs.statSync(file).size, 0);
const v148ScopedSourceBytes = audit.metrics.sourceBytes - forwardSourceBytesV149Plus;
const v148ScopedRuntimeBytes = audit.metrics.runtimeBytes - forwardRuntimeBytesV149Plus;
const v148ScopedEngineBytes = audit.metrics.engineBytes - forwardEngineBytesV149Plus;
const failures = [];
const check = (value, label) => { if (!value) failures.push(label); };
check(v148ScopedSourceBytes <= budget.maximum.sourceBytes, `v148-scoped source bytes ${v148ScopedSourceBytes}/${budget.maximum.sourceBytes} (excluded v149-v152 ${forwardSourceBytesV149Plus})`);
check(audit.metrics.mainBytes <= budget.maximum.mainBytes, `main bytes ${audit.metrics.mainBytes}/${budget.maximum.mainBytes}`);
check(v148ScopedEngineBytes <= budget.maximum.engineBytes, `v148-scoped engine bytes ${v148ScopedEngineBytes}/${budget.maximum.engineBytes} (excluded v149-v152 ${forwardEngineBytesV149Plus})`);
check(v148ScopedRuntimeBytes <= budget.maximum.runtimeBytes, `v148-scoped runtime bytes ${v148ScopedRuntimeBytes}/${budget.maximum.runtimeBytes} (excluded v149-v152 ${forwardRuntimeBytesV149Plus})`);
check(audit.metrics.setIntervalCalls === 0, 'setInterval calls must remain zero');
check(audit.checks.hiddenFrameSuspensionBeforeHeavyWork, 'hidden frame must suspend before heavy work');
check(main.includes('Math.min(.033, rawDt)'), 'frame delta clamp preserved');
check(main.includes("this.frameScheduler.shouldRun('render-stats'"), 'render stats remain cadence limited');
check(engine.includes('lowEndPixelRatio') && engine.includes('mobilePixelRatio') && engine.includes('desktopPixelRatio'), 'device pixel-ratio caps preserved');
check(scheduler.includes('state.skips += 1') && scheduler.includes('state.runs += 1'), 'frame scheduler run/skip accounting preserved');
if (failures.length) { failures.forEach((failure) => console.error(`FAIL v148 performance guard ${failure}`)); process.exit(1); }
console.log(`PASS v1.0.48 performance guard (source ${audit.metrics.sourceBytes}/${budget.maximum.sourceBytes}, main ${audit.metrics.mainBytes}/${budget.maximum.mainBytes})`);
