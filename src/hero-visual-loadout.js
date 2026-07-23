import * as THREE from 'three';
import { getHeroClass } from './hero-classes.js';

const RELIC_VISUAL_PRIORITY = Object.freeze([
  'bloodMirror', 'spiritBlade', 'blueFlame', 'thunderCrown', 'eclipseMask', 'guardianKnot',
  'echoBell', 'brokenBell', 'spiritJar', 'moonPouch', 'fortuneSeal', 'foxShoes'
]);

const RELIC_VISUAL_LABELS = Object.freeze({
  bloodMirror: '혈월 대도', spiritBlade: '혼불 칼날', blueFlame: '청염 화로', thunderCrown: '뇌신 관',
  eclipseMask: '월식 가면', guardianKnot: '신목 결계', echoBell: '메아리 방울', brokenBell: '금 간 방울',
  spiritJar: '청혼 오라', moonPouch: '만월 엽전', fortuneSeal: '대박 부적', foxShoes: '여우비 잔광'
});

function material(color, emissive = color, intensity = .5, options = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    emissive,
    emissiveIntensity: intensity,
    roughness: options.roughness ?? .42,
    metalness: options.metalness ?? .12,
    transparent: Boolean(options.transparent),
    opacity: options.opacity ?? 1,
    depthWrite: options.depthWrite ?? true
  });
}

function basic(color, opacity = .8) {
  return new THREE.MeshBasicMaterial({ color, transparent: true, opacity, depthWrite: false, side: THREE.DoubleSide });
}

function mesh(geometry, mat, position = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1]) {
  const object = new THREE.Mesh(geometry, mat);
  object.position.set(...position);
  object.rotation.set(...rotation);
  object.scale.set(...scale);
  object.castShadow = true;
  return object;
}

function disposeAttachment(object) {
  object?.traverse?.((node) => {
    node.geometry?.dispose?.();
    const materials = Array.isArray(node.material) ? node.material : [node.material];
    materials.filter(Boolean).forEach((entry) => entry.dispose?.());
  });
  object?.removeFromParent?.();
}

function socketOf(group, key) {
  const parts = group?.userData?.parts || {};
  return key === 'weapon'
    ? parts.weaponSocket || group.getObjectByName('WeaponSocket') || group
    : parts.accessorySocket || group.getObjectByName('AccessorySocket') || group;
}

function setBaseWeaponVisibility(group, visible) {
  group?.traverse?.((node) => {
    if (!node.isMesh) return;
    if (/club|hammerhandle|hammerhead|staff|staffring|spiritorb/i.test(node.name || '')) node.visible = visible;
  });
}

function addBow(socket, color) {
  const kit = new THREE.Group();
  kit.name = 'HeroClassBowKit';
  const bowMat = material(0x6f3d22, color, .22, { roughness: .7 });
  const accent = material(color, color, 1.1, { roughness: .25 });
  const stringMat = basic(0xfff4d0, .9);
  const limbA = mesh(new THREE.TorusGeometry(.47, .055, 8, 30, Math.PI * .78), bowMat, [0, .06, 0], [0, Math.PI / 2, -.38]);
  const limbB = limbA.clone(); limbB.rotation.z = Math.PI + .38;
  const string = mesh(new THREE.CylinderGeometry(.012, .012, .86, 8), stringMat, [-.25, .05, 0], [0, 0, 0]);
  const arrow = mesh(new THREE.CylinderGeometry(.018, .018, .9, 8), accent, [.03, .05, .04], [0, 0, Math.PI / 2]);
  const head = mesh(new THREE.ConeGeometry(.07, .18, 8), accent, [.55, .05, .04], [0, 0, -Math.PI / 2]);
  kit.add(limbA, limbB, string, arrow, head);
  kit.position.set(.04, -.08, .1);
  kit.rotation.set(.05, -.2, -.1);
  socket.add(kit);
  return kit;
}

function addStaff(socket, color) {
  const kit = new THREE.Group();
  kit.name = 'HeroClassStaffKit';
  const wood = material(0x6d3e66, color, .2, { roughness: .72 });
  const glow = material(color, color, 1.5, { roughness: .2, metalness: .08 });
  const handle = mesh(new THREE.CylinderGeometry(.055, .07, 1.35, 12), wood, [0, .22, 0], [0, 0, -.1]);
  const ring = mesh(new THREE.TorusGeometry(.24, .04, 8, 24), glow, [0, .94, 0], [Math.PI / 2, 0, 0]);
  const orb = mesh(new THREE.SphereGeometry(.14, 16, 10), glow, [0, .94, 0]);
  kit.add(handle, ring, orb);
  kit.position.set(.04, -.5, .08);
  socket.add(kit);
  return kit;
}

function addTalismanFan(socket, color) {
  const kit = new THREE.Group();
  kit.name = 'HeroClassTalismanFanKit';
  const handleMat = material(0x5f3b25, color, .16, { roughness: .74 });
  const paperMat = material(0xffedb8, color, .42, { roughness: .62 });
  const inkMat = material(color, color, 1.2, { roughness: .28 });
  const handle = mesh(new THREE.CylinderGeometry(.045, .055, .88, 10), handleMat, [0, -.02, 0], [0, 0, -.08]);
  kit.add(handle);
  for (let index = 0; index < 5; index += 1) {
    const angle = (index - 2) * .22;
    const paper = mesh(new THREE.BoxGeometry(.22, .48, .025), paperMat, [Math.sin(angle) * .22, .48, Math.cos(angle) * .06], [0, 0, -angle]);
    const seal = mesh(new THREE.BoxGeometry(.055, .27, .032), inkMat, [0, 0, .018]);
    paper.add(seal);
    kit.add(paper);
  }
  kit.position.set(.02, -.34, .08);
  socket.add(kit);
  return kit;
}

function addRitualFan(socket, color) {
  const kit = new THREE.Group();
  kit.name = 'HeroClassRitualFanKit';
  const wood = material(0x7a4b35, color, .22, { roughness: .7 });
  const silk = material(0xffd6e6, color, .68, { roughness: .48 });
  const bellMat = material(0xffcf68, 0xffa83f, .9, { metalness: .38, roughness: .3 });
  const handle = mesh(new THREE.CylinderGeometry(.04, .055, .82, 10), wood, [0, -.08, 0], [0, 0, -.12]);
  const fan = mesh(new THREE.CylinderGeometry(.08, .38, .48, 14, 1, false, -Math.PI / 2, Math.PI), silk, [0, .42, 0], [Math.PI / 2, 0, 0]);
  kit.add(handle, fan);
  for (let index = 0; index < 3; index += 1) {
    const bell = mesh(new THREE.SphereGeometry(.055, 8, 6), bellMat, [(index - 1) * .16, .1, .04]);
    kit.add(bell);
  }
  kit.position.set(.02, -.28, .1);
  socket.add(kit);
  return kit;
}

function addClassAura(socket, classConfig) {
  const aura = new THREE.Group();
  aura.name = 'HeroClassAuraKit';
  const ring = mesh(new THREE.TorusGeometry(.58, .035, 8, 30), basic(classConfig.color, .46), [0, .04, 0], [Math.PI / 2, 0, 0]);
  const beadCount = classConfig.id === 'mage' ? 5 : classConfig.id === 'taoist' ? 4 : classConfig.id === 'shaman' ? 6 : classConfig.id === 'archer' ? 3 : 2;
  aura.add(ring);
  for (let index = 0; index < beadCount; index += 1) {
    const angle = index / beadCount * Math.PI * 2;
    aura.add(mesh(new THREE.SphereGeometry(.045, 8, 6), material(classConfig.color, classConfig.color, 1.4), [Math.cos(angle) * .58, .04, Math.sin(angle) * .58]));
  }
  aura.position.set(0, .12, -.1);
  socket.add(aura);
  return aura;
}

function tintClassMaterials(group, classConfig) {
  const tint = new THREE.Color(classConfig.color);
  group?.traverse?.((node) => {
    if (!node.isMesh || !node.material) return;
    const materials = Array.isArray(node.material) ? node.material : [node.material];
    materials.forEach((entry) => {
      if (!entry?.color || /eye|skin|wood/i.test(entry.name || '')) return;
      if (/robe|cloth|lacquer|gold/i.test(entry.name || '')) {
        entry.color.lerp(tint, classConfig.id === 'warrior' ? .08 : .28);
        if (entry.emissive) entry.emissive.lerp(tint, .38);
        entry.needsUpdate = true;
      }
    });
  });
}

export function applyHeroClassVisuals(group, classId) {
  if (!group) return null;
  for (const attachment of group.userData.classVisualAttachments || []) disposeAttachment(attachment);
  group.userData.classVisualAttachments = [];
  const config = getHeroClass(classId);
  const weaponSocket = socketOf(group, 'weapon');
  const accessorySocket = socketOf(group, 'accessory');
  setBaseWeaponVisibility(group, config.id === 'warrior');
  if (config.id === 'archer') group.userData.classVisualAttachments.push(addBow(weaponSocket, config.color));
  if (config.id === 'mage') group.userData.classVisualAttachments.push(addStaff(weaponSocket, config.color));
  if (config.id === 'taoist') group.userData.classVisualAttachments.push(addTalismanFan(weaponSocket, config.color));
  if (config.id === 'shaman') group.userData.classVisualAttachments.push(addRitualFan(weaponSocket, config.color));
  group.userData.classVisualAttachments.push(addClassAura(accessorySocket, config));
  tintClassMaterials(group, config);
  group.userData.heroClassId = config.id;
  return config;
}

function addRelicBlade(socket, cursed = false) {
  const kit = new THREE.Group();
  kit.name = 'RelicBladeVisual';
  const color = cursed ? 0xff466f : 0x69edff;
  const blade = mesh(new THREE.BoxGeometry(.09, .82, .07), material(color, color, 1.8, { metalness: .34, roughness: .2 }), [.08, .15, .02], [0, 0, -.28]);
  const guard = mesh(new THREE.TorusGeometry(.14, .035, 8, 20), material(0xffcf68, 0xffa83f, .7, { metalness: .42 }), [.08, -.25, .02], [Math.PI / 2, 0, 0]);
  kit.add(blade, guard);
  socket.add(kit);
  return kit;
}

function addRelicHalo(socket, color, broken = false) {
  const kit = new THREE.Group();
  kit.name = 'RelicHaloVisual';
  const ring = mesh(new THREE.TorusGeometry(.72, .055, 8, broken ? 18 : 32, broken ? Math.PI * 1.55 : Math.PI * 2), basic(color, .68), [0, .16, 0], [Math.PI / 2, 0, 0]);
  kit.add(ring);
  socket.add(kit);
  return kit;
}

function addRelicCrown(socket, color) {
  const kit = new THREE.Group();
  kit.name = 'RelicCrownVisual';
  const mat = material(color, color, 1.15, { metalness: .36, roughness: .28 });
  const crown = mesh(new THREE.CylinderGeometry(.28, .34, .12, 8), mat, [0, .64, .03]);
  for (let index = 0; index < 5; index += 1) {
    const angle = index / 5 * Math.PI * 2;
    crown.add(mesh(new THREE.ConeGeometry(.06, .2, 6), mat, [Math.cos(angle) * .24, .13, Math.sin(angle) * .24]));
  }
  kit.add(crown);
  socket.add(kit);
  return kit;
}

export function applyRelicVisuals(group, relicIds = []) {
  if (!group) return Object.freeze({ ids: [], labels: [] });
  for (const attachment of group.userData.relicVisualAttachments || []) disposeAttachment(attachment);
  group.userData.relicVisualAttachments = [];
  const selected = RELIC_VISUAL_PRIORITY.filter((id) => relicIds.includes(id)).slice(0, 3);
  const weaponSocket = socketOf(group, 'weapon');
  const accessorySocket = socketOf(group, 'accessory');
  if (selected.includes('bloodMirror')) group.userData.relicVisualAttachments.push(addRelicBlade(weaponSocket, true));
  else if (selected.includes('spiritBlade')) group.userData.relicVisualAttachments.push(addRelicBlade(weaponSocket, false));
  if (selected.includes('thunderCrown')) group.userData.relicVisualAttachments.push(addRelicCrown(accessorySocket, 0xffe45f));
  else if (selected.includes('eclipseMask')) group.userData.relicVisualAttachments.push(addRelicCrown(accessorySocket, 0xe067ff));
  if (selected.includes('brokenBell')) group.userData.relicVisualAttachments.push(addRelicHalo(accessorySocket, 0xff5f8f, true));
  else if (selected.some((id) => ['blueFlame', 'echoBell', 'spiritJar'].includes(id))) group.userData.relicVisualAttachments.push(addRelicHalo(accessorySocket, 0x69edff));
  else if (selected.includes('guardianKnot')) group.userData.relicVisualAttachments.push(addRelicHalo(accessorySocket, 0xffd978));
  const labels = selected.map((id) => RELIC_VISUAL_LABELS[id]).filter(Boolean);
  group.userData.relicVisualIds = selected;
  return Object.freeze({ ids: selected, labels });
}
