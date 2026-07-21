import * as THREE from 'three';

const failures = [];
const camera = new THREE.PerspectiveCamera(48, 16 / 9, 0.1, 100);
const target = new THREE.Vector3(0, 0.7, 0);
const pitch = 0.66;
const distance = 15.5;
const project = (point) => point.clone().project(camera);

for (const yaw of [0, Math.PI * 0.25, Math.PI * 0.5, Math.PI, Math.PI * 1.5, Math.PI * 1.85]) {
  const horizontal = Math.cos(pitch) * distance;
  camera.position.set(
    target.x + Math.sin(yaw) * horizontal,
    target.y + Math.sin(pitch) * distance,
    target.z + Math.cos(yaw) * horizontal
  );
  camera.lookAt(target);
  camera.updateMatrixWorld(true);

  const e = camera.matrixWorld.elements;
  const right = new THREE.Vector3(e[0], 0, e[2]).normalize();
  const forward = camera.getWorldDirection(new THREE.Vector3()).setY(0).normalize();
  const center = project(target);
  const dPoint = project(target.clone().addScaledVector(right, 1));
  const aPoint = project(target.clone().addScaledVector(right, -1));
  const wPoint = project(target.clone().addScaledVector(forward, 1));
  const sPoint = project(target.clone().addScaledVector(forward, -1));

  if (!(dPoint.x > center.x && aPoint.x < center.x)) {
    failures.push(`yaw ${yaw.toFixed(3)}: A/D screen direction mismatch`);
  }
  if (!(wPoint.y > center.y && sPoint.y < center.y)) {
    failures.push(`yaw ${yaw.toFixed(3)}: W/S screen direction mismatch`);
  }
  if (Math.abs(right.dot(forward)) > 1e-5) {
    failures.push(`yaw ${yaw.toFixed(3)}: movement basis is not orthogonal`);
  }
}

if (failures.length) {
  failures.forEach((item) => console.error(`FAIL ${item}`));
  process.exit(1);
}
console.log('PASS screen-basis W/A/S/D direction across camera yaw samples');
