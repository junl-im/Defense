import * as THREE from 'three';

export const CHARACTER_MATERIAL_ENHANCER_V151 = Object.freeze({
  id: 'DD-CHARACTER-MATERIAL-ENHANCER-V151',
  version: '1.0.51',
  shader: 'soft-pbr-rim-v151',
  roles: Object.freeze(['hero', 'guardian', 'monster', 'boss'])
});

const ROLE_PROFILE = Object.freeze({
  hero: Object.freeze({ roughnessMin: .34, roughnessMax: .68, metalnessMax: .46, env: 1.12, rim: .16, rimColor: 0x91dfff, emissive: .10 }),
  guardian: Object.freeze({ roughnessMin: .36, roughnessMax: .72, metalnessMax: .42, env: 1.06, rim: .13, rimColor: 0xffd783, emissive: .085 }),
  monster: Object.freeze({ roughnessMin: .42, roughnessMax: .80, metalnessMax: .28, env: .92, rim: .07, rimColor: 0xb88cff, emissive: .045 }),
  boss: Object.freeze({ roughnessMin: .34, roughnessMax: .72, metalnessMax: .50, env: 1.08, rim: .15, rimColor: 0xff806b, emissive: .09 })
});

const clamp = (value, min, max) => Math.max(min, Math.min(max, Number(value) || 0));

function installSoftRimShader(material, profile, lowPower) {
  if (lowPower || material.userData?.characterRimShaderV151 || !material.isMeshStandardMaterial) return false;
  const previous = material.onBeforeCompile;
  material.onBeforeCompile = (shader, renderer) => {
    previous?.(shader, renderer);
    shader.uniforms.dokkaebiRimColorV151 = { value: new THREE.Color(profile.rimColor) };
    shader.uniforms.dokkaebiRimStrengthV151 = { value: profile.rim };
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <common>',
      '#include <common>\nuniform vec3 dokkaebiRimColorV151;\nuniform float dokkaebiRimStrengthV151;'
    ).replace(
      '#include <dithering_fragment>',
      'float dokkaebiRimV151 = pow(1.0 - clamp(abs(dot(normalize(normal), normalize(vViewPosition))), 0.0, 1.0), 2.35);\ngl_FragColor.rgb += dokkaebiRimColorV151 * dokkaebiRimV151 * dokkaebiRimStrengthV151;\n#include <dithering_fragment>'
    );
    material.userData.characterRimUniformsV151 = shader.uniforms;
  };
  const previousKey = material.customProgramCacheKey?.bind(material);
  material.customProgramCacheKey = () => `${previousKey?.() || material.type}:dokkaebi-soft-rim-v151:${profile.rim}:${profile.rimColor.toString(16)}`;
  material.userData.characterRimShaderV151 = true;
  return true;
}

export function applyCharacterMaterialEnhancementV151(root, { role = 'default', lowPower = false } = {}) {
  const profile = ROLE_PROFILE[role];
  if (!profile || !root) return Object.freeze({ id: CHARACTER_MATERIAL_ENHANCER_V151.id, applied: false, role, meshes: 0, materials: 0, shaders: 0 });
  let meshes = 0;
  let materials = 0;
  let shaders = 0;
  root.traverse?.((object) => {
    if (!object.isMesh) return;
    meshes += 1;
    object.castShadow = !lowPower;
    object.receiveShadow = false;
    const list = Array.isArray(object.material) ? object.material : [object.material];
    for (const material of list.filter(Boolean)) {
      material.userData ||= {};
      if ('roughness' in material) material.roughness = clamp(material.roughness ?? .62, profile.roughnessMin, profile.roughnessMax);
      if ('metalness' in material) material.metalness = clamp(material.metalness ?? .08, 0, profile.metalnessMax);
      if ('envMapIntensity' in material) material.envMapIntensity = Math.max(Number(material.envMapIntensity || 0), lowPower ? .72 : profile.env);
      if (material.emissive?.isColor && material.color?.isColor) {
        const hasAuthoredEmissiveMap = Boolean(material.emissiveMap);
        const hasAuthoredEmissiveColor = material.emissive.getHex() !== 0x000000;
        const authoredEmissiveIntensity = Math.max(0, Number(material.emissiveIntensity || 0));
        if (!hasAuthoredEmissiveMap && !hasAuthoredEmissiveColor && authoredEmissiveIntensity <= 0) {
          material.emissive.copy(material.color).multiplyScalar(profile.emissive);
          material.emissiveIntensity = lowPower ? .08 : .18;
          material.userData.characterEmissiveSeededV152 = true;
        } else {
          material.userData.characterEmissivePreservedV152 = true;
        }
      }
      material.dithering = true;
      material.shadowSide = THREE.FrontSide;
      material.userData.characterMaterialV151 = Object.freeze({ role, lowPower, profile: CHARACTER_MATERIAL_ENHANCER_V151.shader });
      if (installSoftRimShader(material, profile, lowPower)) shaders += 1;
      material.needsUpdate = true;
      materials += 1;
    }
  });
  const diagnostics = Object.freeze({ id: CHARACTER_MATERIAL_ENHANCER_V151.id, applied: true, role, lowPower, meshes, materials, shaders });
  root.userData ||= {};
  root.userData.characterMaterialEnhancerV151 = diagnostics;
  return diagnostics;
}
