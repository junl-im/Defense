import { GOLDEN_SAMPLE_CLIPS, GOLDEN_SAMPLE_RIG_ID, GOLDEN_SAMPLE_SOCKETS, GOLDEN_SAMPLE_TEXTURE_MAPS } from './golden-sample-spec.js';

export const RIGGED_ENEMY_CANDIDATES = Object.freeze({
  brute: Object.freeze({
    assetId: 'monster-brute-sd-toon',
    displayName: '돌갑옷 귀수',
    role: 'melee',
    triangleRange: Object.freeze([5000, 9000]),
    requiredClips: GOLDEN_SAMPLE_CLIPS,
    requiredSockets: GOLDEN_SAMPLE_SOCKETS,
    requiredTextureMaps: GOLDEN_SAMPLE_TEXTURE_MAPS,
    rigId: GOLDEN_SAMPLE_RIG_ID,
    status: 'art-review'
  }),
  shaman: Object.freeze({
    assetId: 'monster-shaman-sd-toon',
    displayName: '저주 무당',
    role: 'ranged',
    triangleRange: Object.freeze([5000, 9000]),
    requiredClips: GOLDEN_SAMPLE_CLIPS,
    requiredSockets: GOLDEN_SAMPLE_SOCKETS,
    requiredTextureMaps: GOLDEN_SAMPLE_TEXTURE_MAPS,
    rigId: GOLDEN_SAMPLE_RIG_ID,
    status: 'art-review'
  })
});

export const RIGGED_ENEMY_CANDIDATE_IDS = Object.freeze(
  Object.values(RIGGED_ENEMY_CANDIDATES).map((entry) => entry.assetId)
);
