export const APP_STATE_MACHINE_V103_VERSION = '1.0.3';

export const APP_STATES_V103 = Object.freeze([
  'loading',
  'title',
  'playing',
  'paused',
  'choice',
  'blessing',
  'relic',
  'contract',
  'result'
]);

const STATE_SET = new Set(APP_STATES_V103);
const ALLOWED_TRANSITIONS = Object.freeze({
  loading: Object.freeze(['title', 'result']),
  title: Object.freeze(['playing', 'result']),
  playing: Object.freeze(['paused', 'choice', 'blessing', 'relic', 'contract', 'result', 'title']),
  paused: Object.freeze(['playing', 'result', 'title']),
  choice: Object.freeze(['playing', 'result', 'title']),
  blessing: Object.freeze(['playing', 'result', 'title']),
  relic: Object.freeze(['playing', 'result', 'title']),
  contract: Object.freeze(['playing', 'result', 'title']),
  result: Object.freeze(['playing', 'title'])
});

export class AppStateMachineV103 {
  constructor({ initial = 'loading', historyLimit = 64, onTransition = null } = {}) {
    if (!STATE_SET.has(initial)) throw new Error(`Unknown initial app state: ${initial}`);
    this.current = initial;
    this.previous = null;
    this.historyLimit = Math.max(8, Number(historyLimit) || 64);
    this.onTransition = typeof onTransition === 'function' ? onTransition : null;
    this.serial = 0;
    this.invalidTransitions = 0;
    this.history = [];
    this.record({ from: null, to: initial, source: 'constructor', valid: true });
  }

  canTransition(from, to) {
    if (!STATE_SET.has(to)) return false;
    if (from === to) return true;
    return Boolean(ALLOWED_TRANSITIONS[from]?.includes(to));
  }

  transition(next, { source = 'runtime', detail = null } = {}) {
    if (!STATE_SET.has(next)) throw new Error(`Unknown app state: ${next}`);
    const from = this.current;
    const valid = this.canTransition(from, next);
    if (!valid) this.invalidTransitions += 1;
    if (from === next) {
      this.record({ from, to: next, source, detail, valid, repeated: true });
      return Object.freeze({ changed: false, from, to: next, valid });
    }
    this.previous = from;
    this.current = next;
    const entry = this.record({ from, to: next, source, detail, valid });
    this.onTransition?.(entry);
    return Object.freeze({ changed: true, from, to: next, valid });
  }

  record({ from, to, source, detail = null, valid, repeated = false }) {
    const entry = Object.freeze({
      serial: ++this.serial,
      at: Date.now(),
      from,
      to,
      source,
      detail,
      valid: Boolean(valid),
      repeated: Boolean(repeated)
    });
    this.history.push(entry);
    if (this.history.length > this.historyLimit) this.history.splice(0, this.history.length - this.historyLimit);
    return entry;
  }

  get diagnostics() {
    return Object.freeze({
      version: APP_STATE_MACHINE_V103_VERSION,
      current: this.current,
      previous: this.previous,
      transitions: this.serial,
      invalidTransitions: this.invalidTransitions,
      recent: Object.freeze(this.history.slice(-12))
    });
  }
}

export default AppStateMachineV103;
