const BODY_NODE_NAMES_V151 = Object.freeze([
  'body', 'Body', 'torso', 'Torso', 'chest', 'Chest', 'pelvis', 'Pelvis', 'head', 'Head'
]);

function usableMaterialsV151(object) {
  const raw = Array.isArray(object?.material) ? object.material : [object?.material];
  return raw.filter((material) => material && typeof material === 'object');
}

function findNamedRenderableV151(group) {
  for (const name of BODY_NODE_NAMES_V151) {
    const candidate = group?.getObjectByName?.(name);
    if (candidate?.isMesh && usableMaterialsV151(candidate).length) return candidate;
  }
  return null;
}

function findFirstRenderableV151(group) {
  let candidate = null;
  group?.traverse?.((node) => {
    if (!candidate && node?.isMesh && usableMaterialsV151(node).length) candidate = node;
  });
  return candidate;
}

export function resolveEnemyBodyMaterialsV151(group) {
  if (!group?.userData) return Object.freeze({ body: null, materials: [], recovered: false, source: 'missing-group' });

  const cached = Array.isArray(group.userData.enemyBodyMaterialsV151)
    ? group.userData.enemyBodyMaterialsV151.filter((material) => material && typeof material === 'object')
    : [];
  if (cached.length) {
    return Object.freeze({
      body: group.userData.body || null,
      materials: cached,
      recovered: Boolean(group.userData.enemyBodyRecoveredV151),
      source: group.userData.enemyBodySourceV151 || 'cache'
    });
  }

  const declared = group.userData.body;
  const declaredMaterials = usableMaterialsV151(declared);
  let body = declaredMaterials.length ? declared : null;
  let source = body ? 'declared' : '';

  if (!body) {
    body = findNamedRenderableV151(group);
    source = body ? `named:${body.name || 'unnamed'}` : '';
  }
  if (!body) {
    body = findFirstRenderableV151(group);
    source = body ? `first-renderable:${body.name || 'unnamed'}` : 'unavailable';
  }

  const materials = usableMaterialsV151(body);
  const recovered = Boolean(body && body !== declared);
  if (body) group.userData.body = body;
  group.userData.enemyBodyMaterialsV151 = materials;
  group.userData.enemyBodyRecoveredV151 = recovered;
  group.userData.enemyBodySourceV151 = source;

  return Object.freeze({ body: body || null, materials, recovered, source });
}

export function applyEnemyBodyEmissiveV151(group, { color, intensity } = {}) {
  const resolved = resolveEnemyBodyMaterialsV151(group);
  for (const material of resolved.materials) {
    if (color !== undefined && color !== null) material.emissive?.set?.(color);
    if (Number.isFinite(intensity) && 'emissiveIntensity' in material) material.emissiveIntensity = intensity;
  }
  return resolved;
}

export function clearEnemyBodyMaterialCacheV151(group) {
  if (!group?.userData) return;
  delete group.userData.enemyBodyMaterialsV151;
  delete group.userData.enemyBodyRecoveredV151;
  delete group.userData.enemyBodySourceV151;
}

export const ENEMY_BODY_NODE_NAMES_V151 = BODY_NODE_NAMES_V151;
