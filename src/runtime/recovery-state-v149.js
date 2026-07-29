const USER_COPY = Object.freeze({
  idle: Object.freeze({ title: '', detail: '' }),
  recovering: Object.freeze({ title: '자동 복구 중', detail: '전투 상태를 안전하게 복원하고 있습니다.' }),
  restored: Object.freeze({ title: '복구 완료', detail: '전투를 계속할 수 있습니다.' }),
  degraded: Object.freeze({ title: '안전 모드 전환', detail: '일부 효과를 줄이고 전투를 계속합니다.' })
});

function clean(value, max = 100) {
  return String(value ?? '').replace(/\s+/g, ' ').trim().slice(0, max);
}

export class RecoveryStateV149 {
  constructor({ maxDeveloperEvents = 32, now = Date.now } = {}) {
    this.maxDeveloperEvents = Math.max(8, Number(maxDeveloperEvents) || 32);
    this.now = typeof now === 'function' ? now : Date.now;
    this.state = 'idle';
    this.user = USER_COPY.idle;
    this.events = [];
    this.transitions = 0;
    this.recoveries = 0;
    this.failures = 0;
    this.lastSource = null;
  }

  transition(next, { source = 'runtime', detail = '', severity = 'recoverable' } = {}) {
    const target = USER_COPY[next] ? next : 'degraded';
    this.state = target;
    this.user = USER_COPY[target];
    this.transitions += 1;
    if (target === 'restored') this.recoveries += 1;
    if (target === 'degraded') this.failures += 1;
    this.lastSource = clean(source, 80);
    this.events.push(Object.freeze({
      at: new Date(Number(this.now()) || Date.now()).toISOString(),
      state: target,
      source: this.lastSource,
      detail: clean(detail, 180),
      severity: clean(severity, 24)
    }));
    while (this.events.length > this.maxDeveloperEvents) this.events.shift();
    return Object.freeze({ state: target, user: this.user, developer: this.events.at(-1) });
  }

  begin(source, detail = '') {
    return this.transition('recovering', { source, detail, severity: 'recoverable' });
  }

  restore(source, detail = '') {
    return this.transition('restored', { source, detail, severity: 'resolved' });
  }

  degrade(source, detail = '') {
    return this.transition('degraded', { source, detail, severity: 'degraded' });
  }

  clear() {
    this.state = 'idle';
    this.user = USER_COPY.idle;
    return Object.freeze({ state: this.state, user: this.user });
  }

  getUserMessage() {
    return Object.freeze({ state: this.state, ...this.user });
  }

  get diagnostics() {
    return Object.freeze({
      id: 'DD-RECOVERY-STATE-V149',
      state: this.state,
      transitions: this.transitions,
      recoveries: this.recoveries,
      failures: this.failures,
      retainedDeveloperEvents: this.events.length,
      maxDeveloperEvents: this.maxDeveloperEvents,
      lastSource: this.lastSource,
      lastEvent: this.events.at(-1) || null
    });
  }
}
