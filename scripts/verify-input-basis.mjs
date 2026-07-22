const failures = [];
const dot = (a,b) => a.x*b.x + a.z*b.z;
const length = (a) => Math.hypot(a.x,a.z);
const normalize = (a) => { const l=length(a)||1; return {x:a.x/l,z:a.z/l}; };

for (const yaw of [0, Math.PI * .25, Math.PI * .5, Math.PI, Math.PI * 1.5, Math.PI * 1.85]) {
  const right = normalize({ x: Math.cos(yaw), z: -Math.sin(yaw) });
  const forward = normalize({ x: -Math.sin(yaw), z: -Math.cos(yaw) });
  const center = { x: 0, y: 0 };
  const projectBasis = (delta) => ({ x: dot(delta, right), y: dot(delta, forward) });
  const dPoint = projectBasis(right);
  const aPoint = projectBasis({ x: -right.x, z: -right.z });
  const wPoint = projectBasis(forward);
  const sPoint = projectBasis({ x: -forward.x, z: -forward.z });
  if (!(dPoint.x > center.x && aPoint.x < center.x)) failures.push(`yaw ${yaw.toFixed(3)}: A/D screen direction mismatch`);
  if (!(wPoint.y > center.y && sPoint.y < center.y)) failures.push(`yaw ${yaw.toFixed(3)}: W/S screen direction mismatch`);
  if (Math.abs(dot(right, forward)) > 1e-10) failures.push(`yaw ${yaw.toFixed(3)}: movement basis is not orthogonal`);
}

if (failures.length) {
  failures.forEach((item) => console.error(`FAIL ${item}`));
  process.exit(1);
}
console.log('PASS screen-basis W/A/S/D direction across camera yaw samples');
