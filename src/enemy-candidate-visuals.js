import * as THREE from 'three';

function material(color, emissive = color, intensity = .35, options = {}) {
  return new THREE.MeshStandardMaterial({ color, emissive, emissiveIntensity: intensity, roughness: options.roughness ?? .58, metalness: options.metalness ?? .06, transparent: Boolean(options.transparent), opacity: options.opacity ?? 1, depthWrite: options.depthWrite ?? true, side: THREE.DoubleSide });
}

function mesh(geometry, mat, position = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1]) {
  const object = new THREE.Mesh(geometry, mat);
  object.position.set(...position); object.rotation.set(...rotation); object.scale.set(...scale); object.castShadow = true;
  return object;
}

function socket(group, key) {
  const parts = group?.userData?.parts || {};
  return key === 'weapon' ? parts.weaponSocket || group.getObjectByName('WeaponSocket') || group : parts.accessorySocket || group.getObjectByName('AccessorySocket') || group;
}

function tint(group, color, opacity = 1) {
  const target = new THREE.Color(color);
  group.traverse((node) => {
    if (!node.isMesh || !node.material) return;
    const materials = Array.isArray(node.material) ? node.material : [node.material];
    materials.forEach((entry) => {
      if (!entry?.color || /eye/i.test(entry.name || '')) return;
      entry.color.lerp(target, .42);
      if (entry.emissive) entry.emissive.lerp(target, .32);
      if (opacity < 1) { entry.transparent = true; entry.opacity = Math.min(entry.opacity ?? 1, opacity); entry.depthWrite = false; }
      entry.needsUpdate = true;
    });
  });
}

export function applyEnemyCandidateVisuals(group, type) {
  if (!group || !['ghost', 'skeleton', 'crow'].includes(type)) return group;
  const kit = new THREE.Group();
  kit.name = `EnemyCandidateKit:${type}`;
  if (type === 'ghost') {
    tint(group, 0x72d9ff, .78);
    const tail = mesh(new THREE.ConeGeometry(.42, 1.1, 16), material(0x6fe8ff, 0x6fe8ff, 1.1, { transparent: true, opacity: .58, depthWrite: false }), [0, .05, -.02], [Math.PI, 0, 0], [1, 1, .75]);
    const halo = mesh(new THREE.TorusGeometry(.72, .045, 8, 28), material(0xa780ff, 0x69edff, 1.2, { transparent: true, opacity: .72, depthWrite: false }), [0, 1.4, -.36], [Math.PI / 2, 0, 0]);
    kit.add(tail, halo);
  } else if (type === 'skeleton') {
    tint(group, 0xf1dfbf, 1);
    const shield = mesh(new THREE.CylinderGeometry(.38, .46, .12, 8), material(0x7e5c8e, 0xb983ff, .35, { metalness: .24 }), [-.02, .1, .12], [Math.PI / 2, 0, 0], [1, 1.18, 1]);
    const emblem = mesh(new THREE.TorusGeometry(.2, .035, 8, 18), material(0xffd978, 0xffb34d, .8, { metalness: .3 }), [-.02, .1, .19], [0, 0, 0]);
    shield.add(emblem); socket(group, 'weapon').add(shield); group.userData.enemyCandidateSocketAttachment = shield;
  } else if (type === 'crow') {
    tint(group, 0x7a48a8, 1);
    const wingMat = material(0x2a173e, 0xa35cff, .45, { roughness: .48 });
    const left = mesh(new THREE.ConeGeometry(.48, 1.2, 4), wingMat, [-.48, .32, -.12], [0, 0, .92], [.7, 1, .34]);
    const right = left.clone(); right.position.x = .48; right.rotation.z = -.92;
    const beak = mesh(new THREE.ConeGeometry(.1, .36, 6), material(0xffc94f, 0xff9b31, .25), [0, .62, .5], [Math.PI / 2, 0, 0]);
    kit.add(left, right, beak);
  }
  socket(group, 'accessory').add(kit);
  group.userData.enemyCandidateVisual = kit;
  return group;
}
