import * as THREE from 'three';
import { applyEnemyBodyEmissiveV151, resolveEnemyBodyMaterialsV151 } from './runtime/enemy-body-material-v151.js';

const TOON_GRADIENT = (() => {
  const data = new Uint8Array([48, 116, 188, 255]);
  const texture = new THREE.DataTexture(data, data.length, 1, THREE.RedFormat);
  texture.minFilter = THREE.NearestFilter;
  texture.magFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;
  return texture;
})();

const darken = (hex, factor = .34) => new THREE.Color(hex).multiplyScalar(factor).getHex();

function applyMoonToonRim(material, color, strength = .22) {
  const base = new THREE.Color(color);
  const rim = base.clone().lerp(new THREE.Color(0xb8e8ff), .62);
  material.userData.rimColor = rim;
  material.userData.rimStrength = strength;
  material.userData.renderStyle = 'sd-mobile-toon';
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uMoonRimColor = { value: rim };
    shader.uniforms.uMoonRimStrength = { value: strength };
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <common>',
      '#include <common>\nuniform vec3 uMoonRimColor;\nuniform float uMoonRimStrength;'
    ).replace(
      '#include <opaque_fragment>',
      'float moonRim = pow(1.0 - clamp(dot(normalize(normal), normalize(vViewPosition)), 0.0, 1.0), 2.15);\noutgoingLight += uMoonRimColor * smoothstep(0.28, 0.86, moonRim) * uMoonRimStrength;\n#include <opaque_fragment>'
    );
  };
  material.customProgramCacheKey = () => `sd-toon-rim-${rim.getHexString()}-${strength}`;
  return material;
}

const mat = (color, roughness = .72, metalness = .04, emissive = 0x000000, emissiveIntensity = 0) => {
  const material = new THREE.MeshToonMaterial({
    color,
    gradientMap: TOON_GRADIENT,
    emissive,
    emissiveIntensity
  });
  const materialBias = Math.max(0, Math.min(1, Number(metalness) || 0));
  material.userData.surfaceClass = materialBias > .25 ? 'weapon-or-lacquer' : roughness > .82 ? 'paper-or-cloth' : 'skin-or-painted';
  return applyMoonToonRim(material, color, materialBias > .25 ? .3 : .2);
};
const basic = (color, opacity = .72) => new THREE.MeshBasicMaterial({ color, transparent: true, opacity, depthWrite: false, side: THREE.DoubleSide });
const mesh = (geometry, material, x = 0, y = 0, z = 0) => {
  const value = new THREE.Mesh(geometry, material);
  value.position.set(x, y, z);
  value.castShadow = true;
  value.receiveShadow = true;
  return value;
};
const addPair = (group, source, x = .3) => {
  const left = source;
  left.position.x = -x;
  const right = source.clone();
  right.position.x = x;
  right.rotation.z *= -1;
  group.add(left, right);
  return [left, right];
};
const setPart = (group, key, object) => {
  if (!group.userData.parts) group.userData.parts = {};
  group.userData.parts[key] = object;
  return object;
};

function addFace(group, faceMaterial, eyeMaterial, scale = 1) {
  const head = mesh(new THREE.SphereGeometry(.43 * scale, 10, 7), faceMaterial, 0, 1.82 * scale, 0);
  head.scale.set(1.02, .98, .94);
  const eyeGeometry = new THREE.SphereGeometry(.055 * scale, 6, 4);
  const eye1 = mesh(eyeGeometry, eyeMaterial, -.15 * scale, 1.86 * scale, .397 * scale);
  const eye2 = eye1.clone(); eye2.position.x = .15 * scale;
  const browGeometry = new THREE.BoxGeometry(.22 * scale, .035 * scale, .035 * scale);
  const browMat = mat(0x3d2130, .9);
  const brow1 = mesh(browGeometry, browMat, -.15 * scale, 1.99 * scale, .405 * scale); brow1.rotation.z = .12;
  const brow2 = brow1.clone(); brow2.position.x = .15 * scale; brow2.rotation.z = -.12;
  group.add(head, eye1, eye2, brow1, brow2);
  return { head, eye1, eye2, brows: [brow1, brow2] };
}

function addHorns(group, material, scale = 1, tall = 1) {
  const horn = mesh(new THREE.ConeGeometry(.14 * scale, .55 * scale * tall, 7), material, 0, 2.28 * scale, -.02);
  horn.rotation.z = -.24;
  const pair = addPair(group, horn, .29 * scale);
  return pair;
}

function addFeet(group, material, scale = 1) {
  const foot = mesh(new THREE.SphereGeometry(.22 * scale, 7, 4), material, 0, .35 * scale, .06);
  foot.scale.set(1, .66, 1.45);
  return addPair(group, foot, .29 * scale);
}

function addTalisman(group, material, x, y, z, rotation = 0) {
  const paper = mesh(new THREE.PlaneGeometry(.25, .58, 1, 2), material, x, y, z);
  paper.rotation.y = rotation;
  paper.userData.baseRotationY = rotation;
  group.add(paper);
  return paper;
}

export function createPremiumGuardian(type, rank, config, rankConfig, { lowPower = false } = {}) {
  const group = new THREE.Group();
  const scale = 1 + (rank - 1) * .105;
  group.scale.setScalar(scale);
  const bodyMaterial = mat(config.color, .6, .06, config.color, rank >= 4 ? .32 : .08);
  const darkMaterial = mat(darken(config.color), .84, .04);
  const faceMaterial = mat(0xd8a17d, .72);
  const eyeMaterial = mat(rankConfig.color, .22, .04, rankConfig.glow, 3.1);
  const rankMaterial = mat(rankConfig.color, .32, .14, rankConfig.glow, rank >= 3 ? 2 : .65);
  const paperMaterial = mat(0xf0d59a, .82, 0, rankConfig.glow, .24);

  const body = mesh(new THREE.SphereGeometry(.58, 11, 8), bodyMaterial, 0, 1.03, 0);
  body.scale.set(1.02, 1.24, .88);
  group.add(body);
  const shoulders = new THREE.Group(); shoulders.position.y = 1.34; group.add(shoulders);
  const shoulder = mesh(new THREE.SphereGeometry(.19, 9, 6), darkMaterial, -.58, 0, 0); shoulder.scale.set(1.3, .75, 1);
  const shoulder2 = shoulder.clone(); shoulder2.position.x = .58; shoulders.add(shoulder, shoulder2);
  const armL = mesh(new THREE.CapsuleGeometry(.12, .58, 5, 9), bodyMaterial, -.57, .98, .02); armL.rotation.z = .16;
  const armR = armL.clone(); armR.position.x = .57; armR.rotation.z = -.22;
  const handL = mesh(new THREE.SphereGeometry(.14, 8, 6), faceMaterial, -.63, .63, .08);
  const handR = handL.clone(); handR.position.x = .65;
  const legL = mesh(new THREE.CapsuleGeometry(.145, .38, 5, 9), darkMaterial, -.25, .31, .03); legL.rotation.z = .04;
  const legR = legL.clone(); legR.position.x = .25; legR.rotation.z = -.04;
  const cloth = mesh(new THREE.BoxGeometry(.78, .68, .075, 2, 3, 1), bodyMaterial, 0, .72, -.34); cloth.rotation.x = -.12;
  const collar = mesh(new THREE.TorusGeometry(.42, .055, 7, 20, Math.PI * 1.55), rankMaterial, 0, 1.48, .02); collar.rotation.z = .78;
  const sash = mesh(new THREE.TorusGeometry(.47, .045, 7, 20), darkMaterial, 0, .91, 0); sash.rotation.x = Math.PI / 2;
  group.add(armL, armR, handL, handR, legL, legR, cloth, collar, sash);
  const face = addFace(group, faceMaterial, eyeMaterial);
  addHorns(group, rankMaterial, 1, type === 'thunder' ? 1.25 : 1);
  addFeet(group, darkMaterial);
  const hairCrest = mesh(new THREE.ConeGeometry(.15, .44, 8), darkMaterial, 0, 2.4, -.16); hairCrest.rotation.x = .28; group.add(hairCrest);

  let weapon = null;
  let signature = null;
  if (type === 'ember') {
    const handle = mesh(new THREE.CylinderGeometry(.055, .075, 1.45, 7), darkMaterial, .7, 1.17, .02); handle.rotation.z = -.4;
    const flame = mesh(new THREE.ConeGeometry(.28, .9, 8), rankMaterial, 1.0, 1.78, .02); flame.rotation.z = -.28;
    const inner = mesh(new THREE.ConeGeometry(.13, .58, 7), mat(0xffe58b, .28, .02, 0xffc25d, 3), 1.0, 1.7, .06); inner.rotation.z = -.28;
    group.add(handle, flame, inner); weapon = handle; signature = flame;
    addTalisman(group, paperMaterial, -.5, 1.25, .45, -.18);
  } else if (type === 'frost') {
    const staff = mesh(new THREE.CylinderGeometry(.055, .08, 1.75, 7), darkMaterial, .69, 1.28, 0); staff.rotation.z = -.16;
    const crystal = mesh(new THREE.OctahedronGeometry(.29, 1), rankMaterial, .82, 2.16, 0);
    const ring = mesh(new THREE.TorusGeometry(.42, .045, 6, 16), basic(rankConfig.color, .65), 0, 1.18, -.47); ring.rotation.x = Math.PI / 2;
    group.add(staff, crystal, ring); weapon = staff; signature = crystal;
  } else if (type === 'wind') {
    const brim = mesh(new THREE.CylinderGeometry(.86, .86, .075, 12), darkMaterial, 0, 2.18, 0);
    const hat = mesh(new THREE.ConeGeometry(.72, .48, 10), darkMaterial, 0, 2.43, 0);
    const bow = mesh(new THREE.TorusGeometry(.47, .055, 6, 18, Math.PI * 1.45), rankMaterial, .66, 1.28, .07); bow.rotation.z = -1.0;
    const string = mesh(new THREE.CylinderGeometry(.018, .018, .9, 5), paperMaterial, .77, 1.28, .09); string.rotation.z = -.14;
    group.add(brim, hat, bow, string); weapon = bow; signature = hat;
  } else if (type === 'stone') {
    const club = mesh(new THREE.CylinderGeometry(.19, .12, 1.38, 7), darkMaterial, .67, 1.21, .02); club.rotation.z = -.64;
    const clubTop = mesh(new THREE.DodecahedronGeometry(.37, 0), rankMaterial, 1.02, 1.68, .02);
    const belt = mesh(new THREE.TorusGeometry(.49, .075, 6, 14), darkMaterial, 0, .92, 0); belt.rotation.x = Math.PI / 2;
    group.add(club, clubTop, belt); weapon = club; signature = clubTop;
  } else if (type === 'bell') {
    const hood = mesh(new THREE.ConeGeometry(.72, .9, 10), darkMaterial, 0, 2.27, 0); hood.scale.y = .74;
    const handle = mesh(new THREE.CylinderGeometry(.045, .06, .72, 6), darkMaterial, .67, 1.38, .05); handle.rotation.z = -.28;
    const bell = mesh(new THREE.CylinderGeometry(.23, .38, .53, 9), rankMaterial, .78, 1.08, .05); bell.rotation.z = -.28;
    group.add(hood, handle, bell); weapon = handle; signature = bell;
    addTalisman(group, paperMaterial, -.43, 1.25, .45, -.22);
    addTalisman(group, paperMaterial, .1, .7, -.47, Math.PI);
  } else {
    const helm = mesh(new THREE.CylinderGeometry(.56, .66, .38, 8), darkMaterial, 0, 2.1, 0);
    const crest = mesh(new THREE.BoxGeometry(.16, .56, .16), rankMaterial, 0, 2.54, 0); crest.rotation.z = .12;
    const blade = mesh(new THREE.BoxGeometry(.15, 1.48, .19), rankMaterial, .68, 1.35, .04); blade.rotation.z = -.45;
    const guard = mesh(new THREE.BoxGeometry(.58, .12, .22), darkMaterial, .53, 1.68, .04); guard.rotation.z = -.45;
    group.add(helm, crest, blade, guard); weapon = blade; signature = crest;
  }

  const rankBeads = new THREE.Group();
  for (let i = 0; i < Math.min(rank, 5); i += 1) {
    const angle = Math.PI * .8 + i * .38;
    const bead = mesh(new THREE.SphereGeometry(.065, 6, 4), rankMaterial, Math.cos(angle) * .62, .78 + Math.sin(angle) * .18, .38);
    rankBeads.add(bead);
  }
  group.add(rankBeads);
  let aura = null;
  if (rank >= 2) {
    aura = mesh(new THREE.RingGeometry(.71 + rank * .04, .79 + rank * .04, 20), basic(rankConfig.color, .48), 0, .1, 0);
    aura.rotation.x = -Math.PI / 2; group.add(aura);
  }
  let halo = null;
  if (rank >= 4) {
    halo = mesh(new THREE.TorusGeometry(.67, .045, 7, 20), basic(rankConfig.color, .65), 0, 1.72, -.44);
    halo.rotation.x = Math.PI / 2; group.add(halo);
    if (!lowPower) { const light = new THREE.PointLight(rankConfig.color, .8 + rank * .16, 5.5, 2); light.position.y = 1.45; group.add(light); }
  }
  group.traverse((object) => { if (object.isMesh) object.userData.baseY = object.position.y; });
  group.userData = {
    ...group.userData, body, type, rank, baseY: .3, phase: Math.random() * Math.PI * 2,
    aura, assetTier: 'sd-toon-procedural', parts: {
      ...group.userData.parts, weapon, shoulders, signature, rankBeads, halo,
      head: face.head, armL, armR, legL, legR, cloth, shoulderL: shoulder, shoulderR: shoulder2
    }
  };
  return group;
}

function addEnemyFace(group, config, bodyMaterial, darkMaterial, eyeMaterial, scale) {
  const body = mesh(new THREE.SphereGeometry(.56 * scale, 10, 7), bodyMaterial, 0, .95 * scale, 0); body.scale.set(1.02, 1.18, .9);
  const head = mesh(new THREE.SphereGeometry(.4 * scale, 9, 6), bodyMaterial, 0, 1.65 * scale, 0);
  const eyeGeometry = new THREE.SphereGeometry(.065 * scale, 6, 4);
  const eye1 = mesh(eyeGeometry, eyeMaterial, -.15 * scale, 1.71 * scale, .37 * scale);
  const eye2 = eye1.clone(); eye2.position.x = .15 * scale;
  const horn = mesh(new THREE.ConeGeometry(.14 * scale, .5 * scale, 6), darkMaterial, -.28 * scale, 2.05 * scale, 0); horn.rotation.z = -.28;
  const horn2 = horn.clone(); horn2.position.x = .28 * scale; horn2.rotation.z = .28;
  group.add(body, head, eye1, eye2, horn, horn2);
  return { body, head, high: [eye1, eye2, horn, horn2] };
}

export function createPremiumEnemy(type, config, { lowPower = false } = {}) {
  const group = new THREE.Group();
  const scale = config.scale;
  const bodyMaterial = mat(config.color, .7, .05, config.color, config.boss ? .24 : .02);
  const darkMaterial = mat(darken(config.color, .3), .84, .06);
  const eyeMaterial = mat(0xffe88c, .22, .03, config.boss ? config.color : 0xffa42d, 2.8);
  const boneMaterial = mat(0xd9c49e, .8, .03);
  const { body, head, high } = addEnemyFace(group, config, bodyMaterial, darkMaterial, eyeMaterial, scale);
  let shield = null;
  let weapon = null;
  let signature = null;
  const armL = mesh(new THREE.CapsuleGeometry(.11 * scale, .52 * scale, 4, 8), bodyMaterial, -.48 * scale, .98 * scale, .02); armL.rotation.z = .32;
  const armR = armL.clone(); armR.position.x = .48 * scale; armR.rotation.z = -.38;
  const legL = mesh(new THREE.CapsuleGeometry(.13 * scale, .42 * scale, 4, 8), darkMaterial, -.22 * scale, .3 * scale, .04); legL.rotation.z = .12;
  const legR = legL.clone(); legR.position.x = .22 * scale; legR.rotation.z = -.12;
  const cloth = mesh(new THREE.BoxGeometry(.72 * scale, .48 * scale, .06 * scale, 2, 2, 1), darkMaterial, 0, .58 * scale, -.31 * scale); cloth.rotation.x = -.16;
  const facePlate = mesh(new THREE.BoxGeometry(.54 * scale, .24 * scale, .055 * scale), boneMaterial, 0, 1.68 * scale, .39 * scale); facePlate.rotation.x = .03;
  group.add(armL, armR, legL, legR, cloth, facePlate);
  high.push(armL, armR, legL, legR, cloth, facePlate);

  if (type === 'imp') {
    const ear = mesh(new THREE.ConeGeometry(.16 * scale, .58 * scale, 5), darkMaterial, -.48 * scale, 1.72 * scale, 0); ear.rotation.z = -1.1;
    const ears = addPair(group, ear, .48 * scale); ears[1].rotation.z = 1.1;
    const tail = mesh(new THREE.TorusGeometry(.36 * scale, .06 * scale, 5, 14, Math.PI * 1.3), darkMaterial, -.18 * scale, .88 * scale, -.34 * scale); tail.rotation.y = Math.PI / 2;
    group.add(tail); high.push(...ears, tail); signature = tail;
  } else if (type === 'runner') {
    body.rotation.x = -.26; body.position.z = .12;
    const leg = mesh(new THREE.CylinderGeometry(.07, .1, .72, 6), darkMaterial, -.2, .3, .08); leg.rotation.z = .18;
    const legs = addPair(group, leg, .22); legs[1].rotation.z = -.18;
    const blade = mesh(new THREE.ConeGeometry(.1, .82, 6), boneMaterial, .48, .93, .18); blade.rotation.z = -.72;
    group.add(blade); high.push(...legs, blade); weapon = blade;
  } else if (type === 'brute') {
    body.scale.set(1.32, 1.0, 1.04);
    const armor = mesh(new THREE.DodecahedronGeometry(.67 * scale, 0), darkMaterial, 0, 1.02 * scale, 0); armor.scale.set(1.25, .78, .9);
    shield = mesh(new THREE.BoxGeometry(.98 * scale, 1.2 * scale, .18 * scale), mat(0xa999bd, .4, .32, 0x7c5e9e, .16), 0, 1.17 * scale, .75 * scale); shield.rotation.x = -.08;
    const knot = mesh(new THREE.TorusGeometry(.22 * scale, .05 * scale, 6, 12), boneMaterial, 0, 1.18 * scale, .87 * scale); knot.rotation.x = Math.PI / 2;
    group.add(armor, shield, knot); high.push(armor, shield, knot); signature = shield;
  } else if (type === 'shaman') {
    const hatBrim = mesh(new THREE.CylinderGeometry(.67 * scale, .67 * scale, .07 * scale, 10), darkMaterial, 0, 2.04 * scale, 0);
    const hat = mesh(new THREE.ConeGeometry(.54 * scale, .48 * scale, 8), darkMaterial, 0, 2.31 * scale, 0);
    const staff = mesh(new THREE.CylinderGeometry(.06, .085, 1.8, 7), darkMaterial, .62, 1.15, 0); staff.rotation.z = -.15;
    const gem = mesh(new THREE.OctahedronGeometry(.24, 0), eyeMaterial, .77, 2.03, 0);
    group.add(hatBrim, hat, staff, gem); high.push(hatBrim, hat, staff, gem); weapon = staff; signature = gem;
    addTalisman(group, mat(0xe8c987, .85, 0, config.color, .18), -.42, 1.05, .4, -.2);
  } else if (type === 'tiger') {
    body.scale.set(1.42, .92, 1.2); body.position.z = -.15;
    const muzzle = mesh(new THREE.SphereGeometry(.27 * scale, 8, 5), boneMaterial, 0, 1.61 * scale, .38 * scale); muzzle.scale.set(1.2, .62, .72);
    const mane = mesh(new THREE.TorusGeometry(.58 * scale, .16 * scale, 6, 18), darkMaterial, 0, 1.58 * scale, -.04); mane.rotation.x = Math.PI / 2;
    const paw = mesh(new THREE.SphereGeometry(.22 * scale, 7, 4), darkMaterial, -.5 * scale, .4 * scale, .3 * scale); paw.scale.set(1.3, .7, 1.5);
    const paws = addPair(group, paw, .5 * scale);
    const stripeMaterial = basic(0x2b1322, .8);
    for (let i = -1; i <= 1; i += 1) { const stripe = mesh(new THREE.PlaneGeometry(.12 * scale, .72 * scale), stripeMaterial, i * .28 * scale, 1.05 * scale, .62 * scale); stripe.rotation.z = i * .25; group.add(stripe); high.push(stripe); }
    group.add(muzzle, mane); high.push(muzzle, mane, ...paws); signature = mane;
  } else if (type === 'serpent') {
    // Build a raised coiling body that reads from the game camera.
    body.visible = false;
    for (let i = 0; i < 6; i += 1) {
      const radius = (.45 + i * .11) * scale;
      const coil = mesh(new THREE.TorusGeometry(radius, .095 * scale, 6, 18), i % 2 ? darkMaterial : bodyMaterial, 0, (.55 + i * .15) * scale, -.08 * i * scale);
      coil.rotation.x = Math.PI / 2; coil.rotation.z = i * .36; group.add(coil); high.push(coil);
    }
    const neck = mesh(new THREE.CylinderGeometry(.26 * scale, .38 * scale, 1.75 * scale, 9), bodyMaterial, 0, 1.85 * scale, 0); neck.rotation.z = -.08;
    const crest = mesh(new THREE.ConeGeometry(.5 * scale, .82 * scale, 7), eyeMaterial, 0, 2.78 * scale, -.08 * scale); crest.rotation.z = Math.PI;
    const moonRing = mesh(new THREE.TorusGeometry(.7 * scale, .055 * scale, 7, 20), basic(0x84ffe7, .7), 0, 2.22 * scale, -.45 * scale); moonRing.rotation.x = Math.PI / 2;
    group.add(neck, crest, moonRing); high.push(neck, crest, moonRing); body.visible = true; body.scale.set(.62, .62, .62); body.position.y = 2.55 * scale; signature = moonRing;
  } else if (type === 'king') {
    body.scale.set(1.15, 1.25, .92);
    const mask = mesh(new THREE.CylinderGeometry(.38 * scale, .44 * scale, .18 * scale, 8), boneMaterial, 0, 1.72 * scale, .42 * scale); mask.rotation.x = Math.PI / 2;
    const crown = mesh(new THREE.ConeGeometry(.75 * scale, .8 * scale, 7), eyeMaterial, 0, 2.55 * scale, 0);
    const shoulder = mesh(new THREE.DodecahedronGeometry(.31 * scale, 0), darkMaterial, -.72 * scale, 1.35 * scale, 0);
    const shoulders = addPair(group, shoulder, .72 * scale);
    const backRing = mesh(new THREE.TorusGeometry(.82 * scale, .07 * scale, 7, 22), basic(config.color, .7), 0, 1.58 * scale, -.45 * scale); backRing.rotation.x = Math.PI / 2;
    group.add(mask, crown, backRing); high.push(mask, crown, backRing, ...shoulders); signature = backRing;
  }

  const eliteAura = mesh(new THREE.RingGeometry(.74 * scale, .86 * scale, 20), basic(0xffffff, .7), 0, .08, 0);
  eliteAura.rotation.x = -Math.PI / 2; eliteAura.visible = false; group.add(eliteAura);
  if (config.boss && !lowPower) { const light = new THREE.PointLight(config.color, 1.25, 8, 2); light.position.y = 1.7 * scale; group.add(light); }
  group.traverse((object) => { if (object.isMesh) object.userData.baseY = object.position.y; });
  group.userData = {
    ...group.userData, body, baseColor: config.color, scale, phase: Math.random() * Math.PI * 2,
    isBoss: Boolean(config.boss), eliteAura, shield, lodState: 'high', lodHigh: high,
    assetTier: 'sd-toon-procedural', parts: {
      weapon, signature, shoulders: null, rankBeads: null, halo: signature,
      head, armL, armR, legL, legR, cloth
    }
  };
  return group;
}

export function createPremiumSacredTree({ lowPower = false } = {}) {
  const group = new THREE.Group();
  const bark = mat(0x4b2b43, .9, .02);
  const barkLight = mat(0x72455d, .82, .03);
  const leaf = mat(0x75509b, .75, .03, 0x462268, .25);
  const leafLight = mat(0xa777c7, .68, .03, 0x70409a, .35);
  const gold = mat(0xc79a54, .42, .45, 0xffc86b, .36);
  const glow = mat(0x9af7ff, .2, .05, 0x52dfff, 3.2);
  const trunk = mesh(new THREE.CylinderGeometry(.86, 1.42, 5.2, 12), bark, 0, 2.6, 0); trunk.rotation.z = .04; group.add(trunk);
  const rootGeo = new THREE.ConeGeometry(.38, 3.4, 7);
  for (let i = 0; i < 8; i += 1) { const a = i * Math.PI * 2 / 8; const root = mesh(rootGeo, i % 2 ? bark : barkLight, Math.cos(a) * 1.1, .45, Math.sin(a) * 1.1); root.rotation.z = Math.PI / 2.7; root.rotation.y = -a; root.scale.set(1, 1 + (i % 3) * .16, .65); group.add(root); }
  const branchData = [[-1.35,4.4,0,-.72],[1.3,4.7,.1,.72],[-.72,5.35,-.3,-.38],[.72,5.58,.2,.38]];
  branchData.forEach(([x,y,z,r], index) => { const branch = mesh(new THREE.CylinderGeometry(.22,.45,3.25,8), index%2?barkLight:bark,x,y,z); branch.rotation.z=r; group.add(branch); });
  [[0,6.45,0,2.35],[-2,5.95,.2,1.55],[2,6.15,-.2,1.65],[-.72,7.7,-.2,1.42],[1.02,7.6,.4,1.38]].forEach(([x,y,z,s],i)=>{const crown=mesh(new THREE.IcosahedronGeometry(s,1),i%2?leafLight:leaf,x,y,z);crown.scale.y=.7;group.add(crown);});
  const coreOrb = mesh(new THREE.SphereGeometry(.5, 18, 12), glow, 0, 4.82, 1.04); group.add(coreOrb);
  const moonRing = mesh(new THREE.TorusGeometry(1.1,.08,8,28), basic(0xa9f7ff,.68),0,5.02,.2); moonRing.rotation.x=Math.PI/2;group.add(moonRing);
  // Sacred rope and paper charms.
  const rope = mesh(new THREE.TorusGeometry(1.12,.055,6,28,Math.PI*1.35),gold,0,4.18,.15);rope.rotation.x=Math.PI/2;rope.rotation.z=.5;group.add(rope);
  const paper=mat(0xf2d99f,.86,0,0xffd37a,.2);
  for(let i=0;i<5;i+=1){const a=-.7+i*.35;const charm=addTalisman(group,paper,Math.sin(a)*1.08,3.98+Math.cos(a)*.12,.67,0);charm.rotation.z=-a*.5;}
  if(!lowPower){const light=new THREE.PointLight(0x6ce6ff,1.3,13,2);light.position.set(0,5,0);group.add(light);}
  group.userData={orb:coreOrb,coreOrb,moonRing,hitPulse:0,parts:{signature:moonRing,halo:moonRing}};
  return group;
}


export function applyPremiumBossPhase(group, type, phase = 1) {
  if (!group) return group;
  const previous = group.userData.phaseVisual;
  if (previous) {
    group.remove(previous);
    previous.traverse((node) => {
      node.geometry?.dispose?.();
      if (node.material) {
        const materials = Array.isArray(node.material) ? node.material : [node.material];
        materials.forEach((material) => material.dispose?.());
      }
    });
  }
  group.userData.phaseVisual = null;
  group.userData.bossPhase = phase;
  applyEnemyBodyEmissiveV151(group, { intensity: phase > 1 ? .56 + phase * .16 : .24 });
  if (phase <= 1) return group;

  const visual = new THREE.Group();
  visual.name = `${type}-phase-${phase}`;
  const scale = group.userData.scale || 1;
  if (type === 'tiger') {
    const blood = basic(phase >= 2 ? 0xff5848 : 0xff976e, .78);
    const ring = mesh(new THREE.TorusGeometry(.94 * scale, .075 * scale, 7, 26), blood, 0, .24 * scale, 0);
    ring.rotation.x = Math.PI / 2;
    visual.add(ring);
    for (let index = 0; index < 7; index += 1) {
      const angle = -1.18 + index * .39;
      const spike = mesh(new THREE.ConeGeometry(.075 * scale, .62 * scale, 5), blood, Math.sin(angle) * .62 * scale, (1.65 + Math.cos(angle) * .36) * scale, -.36 * scale);
      spike.rotation.z = -angle * .82;
      visual.add(spike);
    }
    const eyeBand = mesh(new THREE.PlaneGeometry(.82 * scale, .13 * scale), basic(0xffd58b, .9), 0, 1.73 * scale, .47 * scale);
    visual.add(eyeBand);
  } else if (type === 'serpent') {
    const moon = basic(0x55f4cf, .7);
    for (let index = 0; index < 3; index += 1) {
      const ring = mesh(new THREE.TorusGeometry((.58 + index * .28) * scale, .045 * scale, 6, 22), moon, 0, (1.25 + index * .42) * scale, -.42 * scale);
      ring.rotation.x = Math.PI / 2;
      ring.rotation.z = index * .5;
      visual.add(ring);
    }
  } else if (type === 'king') {
    const color = phase >= 3 ? 0xff54dc : 0xab72ff;
    const royal = basic(color, .72);
    for (let index = 0; index < phase + 1; index += 1) {
      const angle = index / (phase + 1) * Math.PI * 2;
      const mask = mesh(new THREE.OctahedronGeometry(.19 * scale, 0), royal, Math.cos(angle) * 1.02 * scale, (1.45 + Math.sin(angle * 2) * .26) * scale, Math.sin(angle) * .55 * scale);
      visual.add(mask);
    }
    const crownRing = mesh(new THREE.TorusGeometry(.92 * scale, .06 * scale, 7, 24), royal, 0, 2.45 * scale, 0);
    crownRing.rotation.x = Math.PI / 2;
    visual.add(crownRing);
  }
  visual.traverse((node) => { if (node.isMesh) { node.castShadow = false; node.receiveShadow = false; } });
  group.add(visual);
  group.userData.phaseVisual = visual;
  return group;
}


function applyStylizedPbrRim(material, color, strength = .12) {
  const rim = new THREE.Color(color || 0xb8e8ff).lerp(new THREE.Color(0xb8e8ff), .7);
  material.userData.rimColor = rim;
  material.userData.rimStrength = strength;
  material.userData.renderStyle = 'aaa-casual-stylized-pbr';
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uMoonRimColor = { value: rim };
    shader.uniforms.uMoonRimStrength = { value: strength };
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <common>',
      '#include <common>\nuniform vec3 uMoonRimColor;\nuniform float uMoonRimStrength;'
    ).replace(
      '#include <opaque_fragment>',
      'float moonRim = pow(1.0 - clamp(dot(normalize(normal), normalize(vViewPosition)), 0.0, 1.0), 3.0);\noutgoingLight += uMoonRimColor * smoothstep(0.45, 0.92, moonRim) * uMoonRimStrength;\n#include <opaque_fragment>'
    );
  };
  material.customProgramCacheKey = () => `aaa-sd-pbr-rim-${rim.getHexString()}-${strength}`;
  return material;
}

function preserveAuthoredStylizedPbrMaterial(source) {
  const material = source.clone();
  material.roughness = Math.max(.42, Math.min(.92, material.roughness ?? .72));
  material.metalness = Math.max(0, Math.min(.58, material.metalness ?? .05));
  material.envMapIntensity = Math.min(.65, material.envMapIntensity ?? .45);
  material.userData.sourceMaterial = source.name || 'unnamed';
  material.userData.productionApproved = true;
  applyStylizedPbrRim(material, source.color?.clone?.() || 0xb8e8ff, .11);
  material.needsUpdate = true;
  return material;
}

function upgradeImportedMaterial(source) {
  if (!source) return source;
  const base = source.color?.clone?.() || new THREE.Color(0x8f7bb4);
  const emissive = source.emissive?.clone?.() || new THREE.Color(0x000000);
  const toon = new THREE.MeshToonMaterial({
    name: source.name || 'SDToonMaterial',
    color: base,
    map: source.map || null,
    alphaMap: source.alphaMap || null,
    emissive,
    emissiveMap: source.emissiveMap || null,
    emissiveIntensity: Math.min(2.2, source.emissiveIntensity ?? .8),
    transparent: Boolean(source.transparent),
    opacity: source.opacity ?? 1,
    alphaTest: source.alphaTest ?? 0,
    side: source.side ?? THREE.FrontSide,
    vertexColors: Boolean(source.vertexColors),
    gradientMap: TOON_GRADIENT
  });
  const previousMetalness = source.metalness || 0;
  applyMoonToonRim(toon, base, previousMetalness > .25 ? .32 : .22);
  toon.userData.sourceMaterial = source.name || 'unnamed';
  toon.needsUpdate = true;
  return toon;
}

function findImportedPart(root, name) {
  let result = null;
  root?.traverse?.((node) => { if (!result && node.name === name) result = node; });
  return result;
}

function findImportedPartAny(root, names = []) {
  for (const name of names) {
    const result = findImportedPart(root, name);
    if (result) return result;
  }
  return null;
}

function prepareImportedRoot(root) {
  const approvalStatus = root?.userData?.assetApproval?.status;
  const authoredPbr = approvalStatus === 'production-approved' || approvalStatus === 'art-review';
  root.traverse((node) => {
    if (!node.isMesh) return;
    node.castShadow = true;
    node.receiveShadow = true;
    const materials = Array.isArray(node.material) ? node.material : [node.material];
    const upgraded = materials.map((material) => authoredPbr ? preserveAuthoredStylizedPbrMaterial(material) : upgradeImportedMaterial(material));
    node.material = Array.isArray(node.material) ? upgraded : upgraded[0];
    node.userData.baseY = node.position.y;
  });
  root.userData.renderProfile = authoredPbr ? 'aaa-casual-stylized-pbr-review' : 'prototype-toon-fallback';
  return root;
}

function importedPartMap(root) {
  const shoulderRig = new THREE.Group();
  shoulderRig.name = 'shoulderRig';
  const signature = findImportedPartAny(root, ['signature', 'MoonHalo', 'AccessorySocket', 'halo']);
  return {
    weapon: findImportedPartAny(root, ['weapon', 'Club', 'WeaponSocket']),
    signature,
    halo: findImportedPartAny(root, ['halo', 'MoonHalo', 'AccessorySocket']) || signature,
    head: findImportedPartAny(root, ['head', 'Head']),
    armL: findImportedPartAny(root, ['armL', 'Arm_L']),
    armR: findImportedPartAny(root, ['armR', 'Arm_R']),
    legL: findImportedPartAny(root, ['legL', 'Leg_L', 'frontLeg0']),
    legR: findImportedPartAny(root, ['legR', 'Leg_R', 'frontLeg1']),
    cloth: findImportedPartAny(root, ['cloth', 'Body', 'Pelvis']),
    shoulderL: findImportedPartAny(root, ['shoulderL', 'Arm_L']),
    shoulderR: findImportedPartAny(root, ['shoulderR', 'Arm_R']),
    weaponSocket: findImportedPartAny(root, ['WeaponSocket', 'weaponSocket']),
    accessorySocket: findImportedPartAny(root, ['AccessorySocket', 'accessorySocket']),
    shoulders: shoulderRig,
    rankBeads: null
  };
}

export function prepareImportedGuardian(root, type, rank, config, rankConfig, { lowPower = false } = {}) {
  prepareImportedRoot(root);
  const group = new THREE.Group();
  group.name = `SDToonGuardian:${type}`;
  group.add(root);
  root.scale.setScalar(.94);
  const scale = 1 + (rank - 1) * .105;
  group.scale.setScalar(scale);
  const rankMaterial = mat(rankConfig.color, .28, .38, rankConfig.glow, rank >= 3 ? 1.8 : .55);
  const aura = rank >= 2 ? mesh(new THREE.RingGeometry(.72 + rank * .045, .81 + rank * .045, 28), basic(rankConfig.color, .42), 0, .08, 0) : null;
  if (aura) { aura.rotation.x = -Math.PI / 2; group.add(aura); }
  const rankBeads = new THREE.Group();
  rankBeads.name = 'rankBeads';
  for (let i = 0; i < Math.min(rank, 5); i += 1) {
    const angle = Math.PI * .75 + i * .4;
    rankBeads.add(mesh(new THREE.SphereGeometry(.055, 8, 5), rankMaterial, Math.cos(angle) * .66, .8 + Math.sin(angle) * .18, .4));
  }
  group.add(rankBeads);
  const parts = importedPartMap(root);
  parts.rankBeads = rankBeads;
  if (parts.signature) parts.signature.userData.baseY = parts.signature.position.y;
  if (rank >= 4 && !lowPower) {
    const light = new THREE.PointLight(rankConfig.color, .75 + rank * .12, 5.5, 2);
    light.position.y = 1.5;
    group.add(light);
  }
  group.userData = {
    body: findImportedPartAny(root, ['body', 'Body', 'torso', 'Torso', 'chest', 'Chest']), type, rank, baseY: .3, phase: Math.random() * Math.PI * 2,
    aura, parts, animations: root.userData.animations || [], assetMetrics: root.userData.assetMetrics || null,
    assetTier: root.userData.renderProfile || 'prototype-toon-fallback', assetId: root.userData.assetSourceId || `guardian-${type}-sd-toon`
  };
  resolveEnemyBodyMaterialsV151(group);
  return group;
}

export function prepareImportedEnemy(root, type, config, { lowPower = false } = {}) {
  prepareImportedRoot(root);
  const group = new THREE.Group();
  group.name = `SDToonEnemy:${type}`;
  group.add(root);
  const importedScale = type === 'tiger' ? .9 : .96;
  root.scale.setScalar(importedScale * (config.scale || 1));
  const eliteAura = mesh(new THREE.RingGeometry(.78 * (config.scale || 1), .9 * (config.scale || 1), 26), basic(0xffffff, .68), 0, .08, 0);
  eliteAura.rotation.x = -Math.PI / 2;
  eliteAura.visible = false;
  group.add(eliteAura);
  const parts = importedPartMap(root);
  if (parts.signature) parts.signature.userData.baseY = parts.signature.position.y;
  if (config.boss && !lowPower) {
    const light = new THREE.PointLight(config.color, 1.15, 8.5, 2);
    light.position.y = 1.8 * (config.scale || 1);
    group.add(light);
  }
  const body = findImportedPartAny(root, ['body', 'Body', 'torso', 'Torso', 'chest', 'Chest', 'pelvis', 'Pelvis']);
  group.userData = {
    body, baseColor: config.color, scale: config.scale || 1, phase: Math.random() * Math.PI * 2,
    isBoss: Boolean(config.boss), eliteAura, shield: null, lodState: 'high', lodHigh: [], parts,
    animations: root.userData.animations || [], assetMetrics: root.userData.assetMetrics || null,
    assetTier: root.userData.renderProfile || 'prototype-toon-fallback', assetId: root.userData.assetSourceId || `${config.boss ? 'boss' : 'monster'}-${type}-sd-toon`
  };
  resolveEnemyBodyMaterialsV151(group);
  return group;
}

export function createCodexPreviewModel(section, id, data, rank = 4) {
  if (section === 'guardian') {
    const config = data?.config || { color: data?.color || 0xff704d };
    const rankConfig = data?.rankConfig || { color: 0xffcf68, glow: 0xf09c38 };
    return createPremiumGuardian(id, rank, config, rankConfig);
  }
  if (section === 'monster' || section === 'boss') {
    const config = data?.config || { color: data?.color || 0xd75672, scale: section === 'boss' ? 1.7 : .9, boss: section === 'boss' };
    const model = createPremiumEnemy(id, config);
    if (section === 'boss') applyPremiumBossPhase(model, id, data?.bossPhase || 1);
    return model;
  }
  if (section === 'world' && id === 'sacred-tree') return createPremiumSacredTree();
  const group = new THREE.Group();
  const color = data?.color || 0xb995ff;
  const main = mat(color, .48, .1, color, .65);
  if (section === 'effect') {
    const orb = mesh(new THREE.SphereGeometry(.62, 16, 10), main, 0, 1.2, 0);
    const ring = mesh(new THREE.TorusGeometry(1,.08,8,24), basic(color,.7),0,1.2,0);ring.rotation.x=Math.PI/2;
    group.add(orb,ring);group.userData.parts={signature:ring,halo:ring};
  } else {
    const base = mesh(new THREE.CylinderGeometry(.9,1.05,.35,10),mat(0x4c3658,.8),0,.18,0);
    const body = id === 'monster-gate'
      ? mesh(new THREE.TorusGeometry(1.15,.22,8,20,Math.PI),main,0,1.15,0)
      : mesh(new THREE.BoxGeometry(1.65,1.6,1.25),main,0,1.0,0);
    group.add(base,body);group.userData.parts={signature:body};
  }
  return group;
}
