const ACTIVE_STATES = new Set(['playing', 'paused', 'blessing', 'relic', 'contract', 'choice']);

export class RunStateCoordinatorV149 {
  constructor({ initial = 'loading', maxTransitions = 64 } = {}) {
    this.current = String(initial || 'loading');
    this.maxTransitions = Math.max(16, Number(maxTransitions) || 64);
    this.transitions = [];
    this.invalidTransitions = 0;
    this.runStarts = 0;
    this.runFinishes = 0;
    this.pauseCount = 0;
    this.resumeCount = 0;
  }

  observe(entry = {}) {
    const from = String(entry.from ?? this.current);
    const to = String(entry.to ?? this.current);
    const valid = entry.valid !== false;
    if (!valid) this.invalidTransitions += 1;
    if (!ACTIVE_STATES.has(from) && to === 'playing') this.runStarts += 1;
    if (ACTIVE_STATES.has(from) && to === 'result') this.runFinishes += 1;
    if (from === 'playing' && to === 'paused') this.pauseCount += 1;
    if (from === 'paused' && to === 'playing') this.resumeCount += 1;
    this.current = to;
    this.transitions.push(Object.freeze({ from, to, valid, source: String(entry.source || entry.meta?.source || 'runtime').slice(0, 60) }));
    while (this.transitions.length > this.maxTransitions) this.transitions.shift();
    return this.transitions.at(-1);
  }

  get diagnostics() {
    return Object.freeze({
      id: 'DD-RUN-STATE-COORDINATOR-V149',
      current: this.current,
      retainedTransitions: this.transitions.length,
      maxTransitions: this.maxTransitions,
      invalidTransitions: this.invalidTransitions,
      runStarts: this.runStarts,
      runFinishes: this.runFinishes,
      pauseCount: this.pauseCount,
      resumeCount: this.resumeCount,
      lastTransition: this.transitions.at(-1) || null
    });
  }
}
