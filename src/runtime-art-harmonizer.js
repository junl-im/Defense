import * as THREE from 'three';
import { ART_STYLE_LOCK_ID } from './art-style-tokens.js';

export const RUNTIME_ART_HARMONIZER_VERSION = '1.0.0';

const ROLE_TUNING = Object.freeze({
  hero: Object.freeze({ saturation: 1.12, lightnessFloor: 0.28, emissive: 0.035 }),
  guardian: Object.freeze({ saturation: 1.1, lightnessFloor: 0.27, emissive: 0.03 }),
  monster: Object.freeze({ saturation: 1.05, lightnessFloor: 0.24, emissive: 0.018 }),
  boss: Object.freeze({ saturation: 1.08, lightnessFloor: 0.22, emissive: 0.028 }),
  environment: Object.freeze({ saturation: 1.04, lightnessFloor: 0.2, emissive: 0.01 }),
  default: Object.freeze({ saturation: 1.06, lightnessFloor: 0.23, emissive: 0.02 })
});

function harmonizeColor(color, tuning) {
  if (!color?.isColor) return;
  const hsl = { h: 0, s: 0, l: 0 };
  color.getHSL(hsl);
  color.setHSL(hsl.h, Math.min(1, hsl.s * tuning.saturation), Math.max(tuning.lightnessFloor, Math.min(0.82, hsl.l)));
}

function harmonizeMaterial(material, tuning) {
  if (!material) return;
  harmonizeColor(material.color, tuning);
  if ('roughness' in material) material.roughness = Math.max(0.4, Math.min(0.86, Number(material.roughness ?? 0.65)));
  if ('metalness' in material) material.metalness = Math.max(0, Math.min(0.58, Number(material.metalness ?? 0.08)));
  if (material.emissive?.isColor && material.color?.isColor) {
    material.emissive.copy(material.color).multiplyScalar(tuning.emissive);
    material.emissiveIntensity = Math.max(Number(material.emissiveIntensity || 0), 0.12);
  }
  material.shadowSide = THREE.FrontSide;
  material.userData ||= {};
  material.userData.dokkaebiStyleLock = ART_STYLE_LOCK_ID;
  material.userData.runtimeHarmonized = RUNTIME_ART_HARMONIZER_VERSION;
  material.needsUpdate = true;
}

export function applyRuntimeArtHarmonization(root, { role = 'default', lowPower = false } = {}) {
  const tuning = ROLE_TUNING[role] || ROLE_TUNING.default;
  let meshes = 0;
  let materials = 0;
  root?.traverse?.((object) => {
    if (!object.isMesh) return;
    meshes += 1;
    object.castShadow = !lowPower;
    object.receiveShadow = false;
    object.userData ||= {};
    object.userData.dokkaebiStyleLock = ART_STYLE_LOCK_ID;
    const list = Array.isArray(object.material) ? object.material : [object.material];
    for (const material of list.filter(Boolean)) {
      harmonizeMaterial(material, tuning);
      materials += 1;
    }
  });
  if (root) {
    root.userData ||= {};
    root.userData.runtimeArtHarmonizer = Object.freeze({ version: RUNTIME_ART_HARMONIZER_VERSION, role, meshes, materials });
  }
  return root;
}
