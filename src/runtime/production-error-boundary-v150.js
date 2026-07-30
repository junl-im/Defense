function clean(value, limit = 180) {
  return String(value ?? '').replace(/\s+/g, ' ').trim().slice(0, limit);
}

const USER_VIEW = Object.freeze({
  title: '안전한 저장 지점으로 복구했습니다',
  detail: '저장된 진행 데이터는 보호되었습니다. 게임을 다시 시작하면 마지막 안전 지점에서 이어집니다.',
  action: '안전 지점에서 다시 시작'
});

export class ProductionErrorBoundaryV150 {
  constructor({ snapshots, now = Date.now, maxDeveloperEvents = 12, onPresent = null } = {}) {
    if (!snapshots || typeof snapshots.reconcile !== 'function') throw new TypeError('ProductionErrorBoundaryV150 requires atomic snapshots');
    this.snapshots = snapshots;
    this.now = typeof now === 'function' ? now : Date.now;
    this.maxDeveloperEvents = Math.max(4, Math.min(32, Number(maxDeveloperEvents) || 12));
    this.onPresent = typeof onPresent === 'function' ? onPresent : null;
    this.events = [];
    this.presentations = 0;
    this.reconciliations = 0;
  }

  capture(error, context = {}) {
    const reconciliation = this.snapshots.reconcile('production-error-boundary');
    if (reconciliation.ok) this.reconciliations += 1;
    const developer = Object.freeze({
      at: new Date(Number(this.now()) || Date.now()).toISOString(),
      source: clean(context.source, 80),
      state: clean(context.state, 32),
      wave: Math.max(0, Math.floor(Number(context.wave) || 0)),
      name: clean(error?.name || 'RuntimeError', 48),
      message: clean(error?.message || error || 'unknown runtime error', 180),
      snapshotId: clean(reconciliation.snapshotId, 96),
      restoredValues: Math.max(0, Number(reconciliation.values) || 0)
    });
    this.events.push(developer);
    while (this.events.length > this.maxDeveloperEvents) this.events.shift();
    const presentation = Object.freeze({
      id: 'DD-PRODUCTION-ERROR-BOUNDARY-V150',
      user: USER_VIEW,
      recovered: reconciliation.ok !== false,
      snapshotId: developer.snapshotId || '',
      developer
    });
    this.presentations += 1;
    this.onPresent?.(presentation);
    return presentation;
  }

  getUserView() {
    return USER_VIEW;
  }

  get diagnostics() {
    return Object.freeze({
      id: 'DD-PRODUCTION-ERROR-BOUNDARY-V150',
      presentations: this.presentations,
      reconciliations: this.reconciliations,
      retainedDeveloperEvents: this.events.length,
      maxDeveloperEvents: this.maxDeveloperEvents,
      lastEvent: this.events.at(-1) || null
    });
  }
}
