const failures = [];
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const defaults = { pinch: 1, wheel: 1, min: 9.5, max: 22 };
const pinch = (start, delta, sensitivity = 1) => clamp(start + delta * .018 * sensitivity, defaults.min, defaults.max);
const wheel = (start, delta, sensitivity = 1) => clamp(start + delta * .006 * sensitivity, defaults.min, defaults.max);

if (!(pinch(15.5, -80) < 15.5)) failures.push('pinch outward must zoom in');
if (!(pinch(15.5, 80) > 15.5)) failures.push('pinch inward must zoom out');
if (!(wheel(15.5, -120) < 15.5)) failures.push('wheel up must zoom in');
if (!(wheel(15.5, 120) > 15.5)) failures.push('wheel down must zoom out');
if (pinch(9.5, -999) !== 9.5 || wheel(22, 999) !== 22) failures.push('zoom bounds clamp failed');

const collisionDistance = (target, yaw, pitch, distance, obstacle) => {
  const horizontal = Math.cos(pitch) * distance;
  const dx = Math.sin(yaw) * horizontal;
  const dy = Math.sin(pitch) * distance;
  const dz = Math.cos(yaw) * horizontal;
  const radius = obstacle.radius + .42;
  const ox = target.x - obstacle.x;
  const oz = target.z - obstacle.z;
  const a = dx * dx + dz * dz;
  const b = 2 * (ox * dx + oz * dz);
  const c = ox * ox + oz * oz - radius * radius;
  const disc = b * b - 4 * a * c;
  if (disc < 0 || c <= 0) return distance;
  const sqrt = Math.sqrt(disc);
  const roots = [(-b - sqrt)/(2*a),(-b + sqrt)/(2*a)].sort((l,r)=>l-r);
  const hit = roots.find((value)=>value>.06 && value<1);
  if (hit === undefined || target.y + dy * hit > obstacle.height + .55) return distance;
  return Math.max(5.6, distance * Math.max(.24, hit - .045));
};
const target = { x: 0, y: 1.35, z: 6 };
const blocked = collisionDistance(target, 0, .66, 15.5, { x: 0, z: 14, radius: 2.15, height: 6.7 });
const clear = collisionDistance(target, Math.PI / 2, .66, 15.5, { x: 0, z: 14, radius: 2.15, height: 6.7 });
if (!(blocked < 15.5)) failures.push('camera obstacle must shorten distance');
if (clear !== 15.5) failures.push('off-axis obstacle must not alter distance');

if (failures.length) {
  failures.forEach((item)=>console.error(`FAIL ${item}`));
  process.exit(1);
}
console.log('PASS pinch/wheel direction, zoom bounds, and camera obstacle clipping');
