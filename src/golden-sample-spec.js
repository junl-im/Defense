export const GOLDEN_SAMPLE_ASSET_ID = 'player-dokkaebi-warrior-golden-v1';
export const GOLDEN_SAMPLE_RIG_ID = 'DOKKAEBI-HUMANOID-RIG-1';
export const GOLDEN_SAMPLE_CLIPS = Object.freeze(['Idle', 'Walk', 'Run', 'Attack1', 'Attack2', 'Skill1', 'Skill2', 'Hit', 'Death', 'Victory', 'Spawn']);
export const GOLDEN_SAMPLE_SOCKETS = Object.freeze(['HelmetSocket', 'ShoulderSocket', 'WeaponSocket', 'AccessorySocket', 'BackSocket', 'FXSocket']);
export const GOLDEN_SAMPLE_TEXTURE_MAPS = Object.freeze(['BaseColor', 'Normal', 'ORM', 'Emissive']);
export const GOLDEN_SAMPLE_TECHNICAL_TARGET = Object.freeze({
  triangleRange: Object.freeze([6000, 10000]),
  skins: 1,
  clips: GOLDEN_SAMPLE_CLIPS,
  sockets: GOLDEN_SAMPLE_SOCKETS,
  textureMaps: GOLDEN_SAMPLE_TEXTURE_MAPS,
  authoredDirections: Object.freeze([0, 45, 90, 135, 180]),
  status: 'art-review'
});
