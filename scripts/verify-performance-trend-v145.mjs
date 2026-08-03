import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const root = path.resolve(import.meta.dirname, '..');
const baseline = JSON.parse(fs.readFileSync(path.join(root, 'docs/PERFORMANCE_BASELINE_v1.0.44.json'), 'utf8'));
const reportPath = path.join(root, 'logs/qa/v145/performance-trend-report.json');
const walk = (dir, out = []) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
};
const recordBuffers = (buffers) => ({
  count: buffers.length,
  rawBytes: buffers.reduce((sum, buffer) => sum + buffer.length, 0),
  gzipBytes: buffers.reduce((sum, buffer) => sum + zlib.gzipSync(buffer, { level: 9 }).length, 0)
});
const record = (files) => recordBuffers(files.map((file) => fs.readFileSync(file)));
const isolateForwardMainV152 = (input) => {
  let source = String(input || '');
  const adjustments = [];
  const replaceRequired = (before, after, label) => {
    if (!source.includes(before)) throw new Error(`v145 main isolation missing v152 segment: ${label}`);
    source = source.replace(before, after);
    adjustments.push(label);
  };
  const replaceOneOfRequired = (variants, after, label) => {
    const matches = variants.filter((before) => source.includes(before));
    if (matches.length !== 1) throw new Error(`v145 main isolation expected exactly one v152 segment for ${label}, actual ${matches.length}`);
    source = source.replace(matches[0], after);
    adjustments.push(label);
  };
  replaceRequired("// const GAME_VERSION = '1.0.52'; generated compatibility marker\n", '', 'generated identity compatibility marker');
  replaceRequired("import { GpuFrameTimerV152 } from './engine/gpu-frame-timer-v152.js';\n", '', 'GPU timer import');
  replaceRequired('    this.gpuFrameTimerV152 = null;\n', '', 'GPU timer lifecycle property');
  const disposedGuard = '      if (this.disposed) return null;\n';
  const guardCount = source.split(disposedGuard).length - 1;
  if (guardCount !== 4) throw new Error(`v145 main isolation expected 4 v152 deferred-load guards, actual ${guardCount}`);
  source = source.replaceAll(disposedGuard, '');
  adjustments.push('deferred asset disposal guards');
  replaceRequired('    this.gpuFrameTimerV152 = new GpuFrameTimerV152(this.renderer);\n', '', 'GPU timer initialization');
  replaceRequired("{ procedural: !(group.userData.animations?.length), actorCategory: 'hero', actorId: heroClass.id }", '{ procedural: !(group.userData.animations?.length) }', 'hero action metadata');
  replaceRequired("{ procedural: !(model.userData.animations?.length), actorCategory: 'guardian', actorId: type }", '{ procedural: !(model.userData.animations?.length) }', 'guardian action metadata');
  replaceRequired("{ procedural: !(group.userData.animations?.length), actorCategory: config.boss ? 'boss' : 'monster', actorId: type }", '{ procedural: !(group.userData.animations?.length) }', 'enemy action metadata');
  replaceRequired('      this.gpuFrameTimerV152,\n', '', 'GPU timer disposal');
  replaceRequired('    delete window.__DOKKAEBI_TEST_API__;\n    delete window.__DOKKAEBI_PUBLIC_API__;\n', '', 'disposed global API cleanup');
  replaceRequired(`    this.runSafe('combat-art-polish-v114', () => {
      const presentationStartedV152 = performance.now();
      this.combatVisualV112?.update(this.state === 'playing' ? gameDt : dt, this.camera, this.elapsed, { showHealth: this.state === 'playing' });
      this.combatVisualV112?.observePresentationCostV152?.({
        cpuMs: performance.now() - presentationStartedV152,
        frameMs: rawDt * 1000,
        source: 'character-presentation-update'
      });
    });`, "    this.runSafe('combat-art-polish-v114', () => this.combatVisualV112?.update(this.state === 'playing' ? gameDt : dt, this.camera, this.elapsed, { showHealth: this.state === 'playing' }));", 'character presentation CPU observation');
  replaceOneOfRequired([
    `    this.runSafe('renderer', () => {
      const gpuQueryStartedV152 = this.gpuFrameTimerV152?.beginFrame?.() || false;
      try {
        this.renderer.render(this.scene, this.camera);
        this.renderedFrameSerial += 1;
        this.flushRenderedFrameWaiters();
      } finally {
        if (gpuQueryStartedV152) this.gpuFrameTimerV152?.endFrame?.();
        const gpuSampleV152 = this.gpuFrameTimerV152?.poll?.();
        if (gpuSampleV152) this.combatVisualV112?.observePresentationCostV152?.({
          ...gpuSampleV152,
          frameMs: rawDt * 1000
        });
      }
    });`,
    `    this.runSafe('renderer', () => {
      const gpuQueryStartedV152 = this.gpuFrameTimerV152?.beginFrame?.() || false;
      try {
        this.renderer.render(this.scene, this.camera);
        this.renderedFrameSerial += 1;
        this.flushRenderedFrameWaiters();
      } finally {
        if (gpuQueryStartedV152) this.gpuFrameTimerV152?.endFrame?.();
        const gpuSampleV152 = this.gpuFrameTimerV152?.poll?.();
        if (gpuSampleV152) this.combatVisualV112?.observeWholeFrameCostV152?.({
          ...gpuSampleV152,
          frameMs: rawDt * 1000
        });
      }
    });`
  ], `    this.runSafe('renderer', () => {
      this.renderer.render(this.scene, this.camera);
      this.renderedFrameSerial += 1;
      this.flushRenderedFrameWaiters();
    });`, 'GPU timer query observation');
  replaceRequired('      gpuFrameTimerV152: this.gpuFrameTimerV152?.diagnostics || {},\n', '', 'GPU timer diagnostics');
  return { source, adjustments };
};
const FORWARD_RELEASE_MODULE_TAGS = new Set(['146', '147', '148', '149', '150', '151', '152']);
const forwardReleaseTag = (file) => /-v(\d+)\.js$/.exec(path.basename(file))?.[1] || '';
const isForwardReleaseAddition = (file) => FORWARD_RELEASE_MODULE_TAGS.has(forwardReleaseTag(file));
const v145SourceFiles = walk(path.join(root, 'src')).filter((file) => file.endsWith('.js') && !isForwardReleaseAddition(file));
const v145RuntimeFiles = walk(path.join(root, 'src/runtime')).filter((file) => file.endsWith('.js') && !isForwardReleaseAddition(file));
const mainSource = fs.readFileSync(path.join(root, 'src/main.js'), 'utf8');
const isolatedMainV152 = isolateForwardMainV152(mainSource);
const current = {
  mainJs: recordBuffers([Buffer.from(isolatedMainV152.source)]),
  styleCss: record([path.join(root, 'src/style.css')]),
  allSourceJs: record(v145SourceFiles),
  runtimeJs: record(v145RuntimeFiles),
  engineJs: record(walk(path.join(root, 'src/engine')).filter((file) => file.endsWith('.js') && !isForwardReleaseAddition(file)))
};
const percent = Number(baseline.maxRegressionPercent || 5);
const checks = {};
for (const [group, values] of Object.entries(current)) {
  const approved = baseline.metrics[group];
  if (!approved) throw new Error(`v145 baseline group missing: ${group}`);
  checks[group] = {};
  for (const metric of ['rawBytes', 'gzipBytes']) {
    const maximum = Math.floor(approved[metric] * (1 + percent / 100));
    const actual = values[metric];
    checks[group][metric] = {
      baseline: approved[metric],
      actual,
      delta: actual - approved[metric],
      deltaPercent: Math.round(((actual - approved[metric]) / Math.max(1, approved[metric])) * 10000) / 100,
      maximum,
      pass: actual <= maximum
    };
  }
}
const report = {
  id: 'DD-PERFORMANCE-TREND-V145',
  releaseVersion: '1.0.45',
  baseline: { id: baseline.id, releaseVersion: baseline.releaseVersion, buildId: baseline.buildId, maxRegressionPercent: percent },
  measurementScope: 'v1.0.45 source surface; later release modules are measured by their own release gate',
  excludedForwardModules: walk(path.join(root, 'src')).filter((file) => file.endsWith('.js') && isForwardReleaseAddition(file)).map((file) => path.relative(root, file).replaceAll('\\', '/')).sort(),
  forwardMainIsolation: {
    release: '1.0.52',
    sourceBytes: Buffer.byteLength(mainSource),
    isolatedBytes: Buffer.byteLength(isolatedMainV152.source),
    excludedBytes: Buffer.byteLength(mainSource) - Buffer.byteLength(isolatedMainV152.source),
    adjustments: isolatedMainV152.adjustments
  },
  current,
  checks,
  passed: Object.values(checks).every((group) => Object.values(group).every((check) => check.pass))
};
fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
if (!report.passed) {
  for (const [group, groupChecks] of Object.entries(checks)) {
    for (const [metric, check] of Object.entries(groupChecks)) {
      if (!check.pass) console.error(`FAIL v145 performance trend ${group}.${metric}: ${check.actual} > ${check.maximum} (${check.deltaPercent}%)`);
    }
  }
  process.exit(1);
}
console.log(`PASS v1.0.45 performance trend stays within ${percent}% of approved v1.0.44 source package`);
