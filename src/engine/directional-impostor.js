const TAU = Math.PI * 2;

function normalizeAngle(angle) {
  return ((angle % TAU) + TAU) % TAU;
}

export function resolveDirectionalFrame(objectYaw = 0, cameraYaw = 0, directions = 11) {
  const count = Math.max(1, Math.floor(directions));
  const relative = normalizeAngle(cameraYaw - objectYaw);
  const step = TAU / count;
  return Math.floor((relative + step * .5) / step) % count;
}

export class DirectionalImpostorSelector {
  constructor({ directions = 11, hysteresis = .08 } = {}) {
    this.directions = Math.max(1, Math.floor(directions));
    this.hysteresis = Math.max(0, Math.min(.45, Number(hysteresis) || 0));
    this.frame = 0;
    this.initialized = false;
  }

  update(objectYaw = 0, cameraYaw = 0) {
    const next = resolveDirectionalFrame(objectYaw, cameraYaw, this.directions);
    if (!this.initialized) {
      this.frame = next;
      this.initialized = true;
      return this.frame;
    }
    if (next === this.frame) return this.frame;

    const step = TAU / this.directions;
    const center = this.frame * step;
    const relative = normalizeAngle(cameraYaw - objectYaw);
    const delta = Math.abs(Math.atan2(Math.sin(relative - center), Math.cos(relative - center)));
    if (delta > step * (.5 + this.hysteresis)) this.frame = next;
    return this.frame;
  }

  reset(frame = 0) {
    this.frame = ((Math.floor(frame) % this.directions) + this.directions) % this.directions;
    this.initialized = false;
  }
}
