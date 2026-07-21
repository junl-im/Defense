export class ObjectPool {
  constructor({ create, reset = () => {}, initialSize = 0, maxSize = Infinity }) {
    if (typeof create !== 'function') throw new TypeError('ObjectPool create 함수가 필요합니다.');
    this.create = create;
    this.reset = reset;
    this.maxSize = maxSize;
    this.free = [];
    this.active = new Set();
    for (let i = 0; i < initialSize; i += 1) this.free.push(this.create());
  }

  acquire() {
    if (!this.free.length && this.active.size >= this.maxSize) return null;
    const item = this.free.pop() || this.create();
    this.active.add(item);
    return item;
  }

  release(item) {
    if (!this.active.delete(item)) return false;
    this.reset(item);
    if (this.free.length < this.maxSize) this.free.push(item);
    return true;
  }

  releaseAll() {
    [...this.active].forEach((item) => this.release(item));
  }

  get activeCount() {
    return this.active.size;
  }
}
