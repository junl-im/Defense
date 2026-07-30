import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const failures = [];
const check = (value, label) => { if (!value) failures.push(label); };

const policy = read('src/runtime/character-presentation-policy-v151.js');
const director = read('src/runtime/character-presentation-director-v151.js');
const material = read('src/engine/character-material-enhancer-v151.js');
const pipeline = read('src/engine/asset-pipeline.js');
const main = read('src/main.js');

check(policy.includes("id: 'DD-MODERN-CHARACTER-PRESENTATION-V151'") && policy.includes("version: '1.0.51'") && policy.includes('noNewFinalArtClaims: true'), 'v151 presentation policy and honest approval boundary');
check(policy.includes("rendererLayers: Object.freeze(['contact-shadow', 'depth-silhouette', 'key-light', 'action-rim', 'motion-afterimage'])"), 'v151 five-layer presentation model');
check(policy.includes('economy:') && policy.includes('balanced:') && policy.includes('cinematic:'), 'v151 quality tiers');
check(director.includes('extends CombatArtPolishDirectorV114'), 'v151 preserves v114 presentation lineage');
check(director.includes('characterContactShadowV151') && director.includes('characterDepthSilhouetteV151') && director.includes('characterKeyLightV151') && director.includes('characterMotionAfterimageV151'), 'v151 modern character layers');
check(director.includes('monsterSecondaryDistance') && director.includes('sustainedPressure') && director.includes('lodSuppressionsV151'), 'v151 density and distance LOD');
check(director.includes('premultipliedAlpha = true') && director.includes('map.anisotropy') && director.includes('textureSamplingUpgradesV151'), 'v151 transparent texture sampling hardening');
check(director.includes('finalCharacterArtApprovalsAddedV151: 0'), 'v151 does not overstate final character art approval');
check(material.includes("id: 'DD-CHARACTER-MATERIAL-ENHANCER-V151'") && material.includes('soft-pbr-rim-v151'), 'v151 PBR character material policy');
check(material.includes('material.onBeforeCompile') && material.includes('dokkaebiRimStrengthV151') && material.includes('customProgramCacheKey'), 'v151 soft rim shader integration');
check(material.includes('roughnessMin') && material.includes('metalnessMax') && material.includes('envMapIntensity') && material.includes('material.dithering = true'), 'v151 PBR material bounds');
check(pipeline.includes("from './character-material-enhancer-v151.js'") && pipeline.includes('applyCharacterMaterialEnhancementV151(root'), 'asset pipeline applies v151 character materials');
check(main.includes("import CharacterPresentationDirectorV151 from './runtime/character-presentation-director-v151.js'") && main.includes('new CharacterPresentationDirectorV151'), 'main uses v151 character presentation director');
check(!director.includes('<svg') && !material.includes('<svg'), 'v151 introduces no SVG surface');

if (failures.length) {
  failures.forEach((failure) => console.error(`FAIL ${failure}`));
  process.exit(1);
}
const evidenceDir = path.join(root, 'logs/qa/v151');
fs.mkdirSync(evidenceDir, { recursive: true });
fs.writeFileSync(path.join(evidenceDir, 'character-presentation-summary.json'), `${JSON.stringify({
  id: 'DD-CHARACTER-PRESENTATION-EVIDENCE-V151',
  releaseVersion: '1.0.51',
  passed: true,
  rendererLayers: ['contact-shadow', 'depth-silhouette', 'key-light', 'action-rim', 'motion-afterimage'],
  qualityTiers: ['economy', 'balanced', 'cinematic'],
  finalCharacterArtApprovalsAdded: 0,
  runtimeShaderCompilation: 'required-in-vite-ci'
}, null, 2)}\n`);
console.log('PASS v1.0.51 modern character PBR, grounding, silhouette depth, key light, afterimage, LOD, and honest asset approval contracts');
