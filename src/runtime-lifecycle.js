const normalizeOptions = (options = {}) => {
  if (typeof options === 'boolean') return { capture: options };
  return { ...options };
};

export class EventRegistry {
  constructor(name = 'events') {
    this.name = name;
    this.bindings = [];
    this.keys = new Set();
    this.disposed = false;
  }

  listen(target, type, handler, options = {}, key = '') {
    if (this.disposed) throw new Error(`${this.name} registry is disposed.`);
    if (!target?.addEventListener || typeof handler !== 'function') {
      throw new TypeError(`${this.name} listener requires an EventTarget and function.`);
    }
    const normalized = normalizeOptions(options);
    const bindingKey = key ? `${type}:${key}` : '';
    if (bindingKey && this.keys.has(bindingKey)) {
      throw new Error(`Duplicate listener binding detected: ${this.name}:${bindingKey}`);
    }
    target.addEventListener(type, handler, normalized);
    const binding = { target, type, handler, options: normalized, key: bindingKey };
    this.bindings.push(binding);
    if (bindingKey) this.keys.add(bindingKey);
    return () => this.remove(binding);
  }

  remove(binding) {
    const index = this.bindings.indexOf(binding);
    if (index < 0) return false;
    binding.target.removeEventListener(binding.type, binding.handler, binding.options);
    this.bindings.splice(index, 1);
    if (binding.key) this.keys.delete(binding.key);
    return true;
  }

  dispose() {
    if (this.disposed) return;
    for (const binding of [...this.bindings]) this.remove(binding);
    this.disposed = true;
  }

  get diagnostics() {
    return { name: this.name, bindings: this.bindings.length, keyedBindings: this.keys.size };
  }
}

export class TaskScope {
  constructor(name = 'tasks') {
    this.name = name;
    this.generation = 0;
    this.tasks = new Map();
    this.namedTasks = new Map();
  }

  schedule(callback, delay = 0, { key = '', guard = null } = {}) {
    if (typeof callback !== 'function') throw new TypeError(`${this.name} task requires a callback.`);
    if (key) this.cancel(key);
    const generation = this.generation;
    let timer = 0;
    timer = window.setTimeout(() => {
      this.tasks.delete(timer);
      if (key && this.namedTasks.get(key) === timer) this.namedTasks.delete(key);
      if (generation !== this.generation) return;
      if (guard && !guard()) return;
      callback();
    }, Math.max(0, Number(delay) || 0));
    this.tasks.set(timer, { key, generation });
    if (key) this.namedTasks.set(key, timer);
    return timer;
  }

  cancel(keyOrTimer) {
    const timer = typeof keyOrTimer === 'string' ? this.namedTasks.get(keyOrTimer) : keyOrTimer;
    if (!timer || !this.tasks.has(timer)) return false;
    const task = this.tasks.get(timer);
    window.clearTimeout(timer);
    this.tasks.delete(timer);
    if (task.key && this.namedTasks.get(task.key) === timer) this.namedTasks.delete(task.key);
    return true;
  }

  cancelAll() {
    this.generation += 1;
    for (const timer of this.tasks.keys()) window.clearTimeout(timer);
    this.tasks.clear();
    this.namedTasks.clear();
  }

  get diagnostics() {
    return { name: this.name, generation: this.generation, pending: this.tasks.size, named: this.namedTasks.size };
  }
}

export class RuntimeLifecycle {
  constructor() {
    this.events = new EventRegistry('game');
    this.ui = new TaskScope('ui');
    this.run = new TaskScope('run');
    this.effects = new TaskScope('effects');
    this.system = new TaskScope('system');
  }

  beginRun() {
    this.run.cancelAll();
    this.effects.cancelAll();
  }

  endRun() {
    this.run.cancelAll();
    this.effects.cancelAll();
  }

  dispose() {
    this.events.dispose();
    this.ui.cancelAll();
    this.run.cancelAll();
    this.effects.cancelAll();
    this.system.cancelAll();
  }

  get diagnostics() {
    return {
      events: this.events.diagnostics,
      ui: this.ui.diagnostics,
      run: this.run.diagnostics,
      effects: this.effects.diagnostics,
      system: this.system.diagnostics
    };
  }
}
