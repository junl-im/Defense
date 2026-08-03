import { GpuFrameTimerV152 } from '../src/engine/gpu-frame-timer-v152.js';

const assert = (value, message) => { if (!value) throw new Error(message); };

class FakeCanvas {
  constructor() { this.listeners = new Map(); }
  addEventListener(type, handler) { if (!this.listeners.has(type)) this.listeners.set(type, new Set()); this.listeners.get(type).add(handler); }
  removeEventListener(type, handler) { this.listeners.get(type)?.delete(handler); }
  dispatch(type) { for (const handler of this.listeners.get(type) || []) handler({ type }); }
}

class FakeGl {
  constructor({ supported = true, result = 2_000_000 } = {}) {
    this.supported = supported;
    this.result = result;
    this.disjoint = false;
    this.available = true;
    this.throwOnPoll = false;
    this.QUERY_RESULT_AVAILABLE = 'available';
    this.QUERY_RESULT = 'result';
    this.created = 0;
    this.deleted = 0;
  }
  getExtension(name) { return this.supported && name === 'EXT_disjoint_timer_query_webgl2' ? { TIME_ELAPSED_EXT: 'elapsed', GPU_DISJOINT_EXT: 'disjoint' } : null; }
  createQuery() { return { id: ++this.created }; }
  beginQuery() {}
  endQuery() {}
  deleteQuery() { this.deleted += 1; }
  getParameter() { return this.disjoint; }
  getQueryParameter(_query, field) {
    if (this.throwOnPoll) throw new Error('stale WebGL query');
    if (field === this.QUERY_RESULT_AVAILABLE) return this.available;
    if (field === this.QUERY_RESULT) return this.result;
    return null;
  }
}

const canvas = new FakeCanvas();
let currentGl = new FakeGl();
const renderer = { domElement: canvas, getContext: () => currentGl };
const timer = new GpuFrameTimerV152(renderer, { maxPending: 2 });
assert(timer.diagnostics.supported, 'supported WebGL2 timer query must initialize');
assert(timer.beginFrame() && timer.endFrame(), 'normal query begin/end must succeed');
const normal = timer.poll();
assert(normal?.gpuMs === 2 && normal.source === 'whole-frame-gpu', 'normal query must return scoped milliseconds');

currentGl.available = false;
for (let index = 0; index < 3; index += 1) { assert(timer.beginFrame() && timer.endFrame(), 'overflow fixture query must enqueue'); }
assert(timer.diagnostics.pending === 2 && timer.diagnostics.overflowDrops === 1, 'pending query queue must be bounded');
currentGl.available = true;
currentGl.disjoint = true;
assert(timer.poll() === null, 'disjoint result must be discarded');
assert(timer.diagnostics.pending === 0 && timer.diagnostics.disjointDrops === 2, 'disjoint state must clear all stale pending queries');
currentGl.disjoint = false;

assert(timer.beginFrame() && timer.endFrame(), 'query before context loss must enqueue');
canvas.dispatch('webglcontextlost');
assert(timer.diagnostics.suspended && !timer.diagnostics.supported && timer.diagnostics.pending === 0, 'context loss must suspend and clear stale queries');
assert(!timer.beginFrame(), 'suspended timer must not begin queries');
currentGl = new FakeGl({ result: 3_500_000 });
canvas.dispatch('webglcontextrestored');
assert(timer.diagnostics.supported && !timer.diagnostics.suspended && timer.diagnostics.contextRestores === 1, 'context restore must reacquire extension and resume');
assert(timer.beginFrame() && timer.endFrame() && timer.poll()?.gpuMs === 3.5, 'restored context must produce fresh query samples');

assert(timer.beginFrame() && timer.endFrame(), 'poll error fixture must enqueue');
currentGl.throwOnPoll = true;
assert(timer.poll() === null && timer.diagnostics.queryErrors === 1 && !timer.diagnostics.supported, 'stale query exception must fail closed without escaping');
currentGl.throwOnPoll = false;
assert(timer.rebindContext('manual-recovery'), 'manual rebind must recover after query failure');

const unsupported = new GpuFrameTimerV152({ domElement: new FakeCanvas(), getContext: () => new FakeGl({ supported: false }) });
assert(!unsupported.diagnostics.supported && !unsupported.beginFrame(), 'unsupported extension must remain a safe no-op');
unsupported.dispose();

timer.dispose();
const restoresBeforeDispose = timer.diagnostics.contextRestores;
canvas.dispatch('webglcontextrestored');
assert(timer.diagnostics.disposed && timer.diagnostics.contextRestores === restoresBeforeDispose, 'disposed timer must detach context listeners');

console.log('PASS v1.0.52 R9 GPU timer handles unsupported, overflow, disjoint, query error, context loss, restore, and disposal');
