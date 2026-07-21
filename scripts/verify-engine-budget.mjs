import * as THREE from 'three';
import { countObjectTriangles } from '../src/engine/geometry-budget.js';
import { MOBILE_ENGINE_CONFIG } from '../src/engine/engine-config.js';

const failures = [];
const check = (label, root, limit) => {
  const triangles = countObjectTriangles(root);
  if (triangles > limit) failures.push(`${label}: ${triangles} > ${limit}`);
  else console.log(`PASS ${label}: ${triangles}/${limit} triangles`);
};
const mesh = (geometry) => new THREE.Mesh(geometry, new THREE.MeshBasicMaterial());
const unitBase = (rank = 5) => {
  const group = new THREE.Group();
  group.add(
    mesh(new THREE.SphereGeometry(.55,7,5)), mesh(new THREE.SphereGeometry(.42,7,5)),
    mesh(new THREE.SphereGeometry(.055,5,3)), mesh(new THREE.SphereGeometry(.055,5,3)),
    mesh(new THREE.ConeGeometry(.14 + rank*.012,.48 + rank*.07,5)), mesh(new THREE.ConeGeometry(.14 + rank*.012,.48 + rank*.07,5)),
    mesh(new THREE.SphereGeometry(.2,5,3)), mesh(new THREE.SphereGeometry(.2,5,3)),
    mesh(new THREE.RingGeometry(.68 + rank*.04,.76 + rank*.04,14))
  );
  return group;
};
const unitAccessories = {
  ember: [new THREE.ConeGeometry(.24,.75,6)],
  frost: [new THREE.CylinderGeometry(.055,.07,1.55,6), new THREE.OctahedronGeometry(.22)],
  wind: [new THREE.ConeGeometry(.75,.48,8), new THREE.RingGeometry(.34,.43,10,1,0,Math.PI*1.35)],
  stone: [new THREE.CylinderGeometry(.2,.12,1.3,6), new THREE.DodecahedronGeometry(.34,0)],
  bell: [new THREE.ConeGeometry(.7,.85,8), new THREE.CylinderGeometry(.26,.4,.5,7)],
  thunder: [new THREE.CylinderGeometry(.52,.62,.38,6), new THREE.BoxGeometry(.14,1.45,.18)]
};
for (const [type, geometries] of Object.entries(unitAccessories)) {
  const group = unitBase();
  geometries.forEach((geometry) => group.add(mesh(geometry)));
  check(`unit ${type}`, group, MOBILE_ENGINE_CONFIG.budgets.unitTriangles);
}
const enemyBase = () => {
  const group = new THREE.Group();
  group.add(
    mesh(new THREE.SphereGeometry(.55,8,6)), mesh(new THREE.SphereGeometry(.4,7,5)),
    mesh(new THREE.SphereGeometry(.065,5,3)), mesh(new THREE.SphereGeometry(.065,5,3)),
    mesh(new THREE.ConeGeometry(.13,.48,5)), mesh(new THREE.ConeGeometry(.13,.48,5))
  );
  return group;
};
const enemyAccessories = {
  grunt: [],
  runner: [new THREE.CylinderGeometry(.08,.1,.65,5), new THREE.CylinderGeometry(.08,.1,.65,5)],
  brute: [new THREE.DodecahedronGeometry(.67,0), new THREE.BoxGeometry(.95,1.2,.17)],
  shaman: [new THREE.CylinderGeometry(.07,.09,1.8,6), new THREE.OctahedronGeometry(.22)],
  boss: [new THREE.TorusGeometry(.55,.18,5,12), new THREE.ConeGeometry(.72,.65,6)]
};
for (const [type, geometries] of Object.entries(enemyAccessories)) {
  const group = enemyBase();
  geometries.forEach((geometry) => group.add(mesh(geometry)));
  check(`enemy ${type}`, group, MOBILE_ENGINE_CONFIG.budgets.enemyTriangles);
}
if (failures.length) {
  failures.forEach((failure) => console.error(`FAIL ${failure}`));
  process.exit(1);
}
console.log('엔진 폴리곤 예산 검증 완료');
