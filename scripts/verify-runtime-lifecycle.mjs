globalThis.window = { setTimeout, clearTimeout };
const { EventRegistry, TaskScope } = await import('../src/runtime-lifecycle.js');

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
  console.log(`PASS ${message}`);
};

const target = new EventTarget();
const events = new EventRegistry('test');
let calls = 0;
events.listen(target, 'ping', () => { calls += 1; }, {}, 'ping');
target.dispatchEvent(new Event('ping'));
assert(calls === 1, '등록 이벤트 1회 실행');
let duplicateRejected = false;
try { events.listen(target, 'ping', () => {}, {}, 'ping'); } catch { duplicateRejected = true; }
assert(duplicateRejected, '동일 키 중복 이벤트 등록 차단');
events.dispose();
target.dispatchEvent(new Event('ping'));
assert(calls === 1, 'dispose 후 이벤트 실행 차단');

const scope = new TaskScope('test');
const results = [];
scope.schedule(() => results.push('old'), 8, { key: 'named' });
scope.schedule(() => results.push('new'), 2, { key: 'named' });
await new Promise((resolve) => setTimeout(resolve, 15));
assert(results.join(',') === 'new', '이름 있는 지연 작업 최신 1개만 실행');
scope.schedule(() => results.push('cancelled'), 2);
scope.cancelAll();
await new Promise((resolve) => setTimeout(resolve, 8));
assert(!results.includes('cancelled'), '세대 취소 후 이전 작업 무효화');
console.log('Runtime lifecycle verification passed.');
