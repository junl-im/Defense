function geometryTriangles(geometry) {
  if (!geometry) return 0;
  if (geometry.index) return geometry.index.count / 3;
  return (geometry.attributes?.position?.count || 0) / 3;
}

export function countObjectTriangles(root) {
  let triangles = 0;
  root?.traverse?.((object) => {
    if (object.isMesh || object.isInstancedMesh) triangles += geometryTriangles(object.geometry);
  });
  return Math.round(triangles);
}

export class GeometryBudget {
  constructor(budgets, { strict = false } = {}) {
    this.budgets = budgets;
    this.strict = strict;
    this.records = new Map();
  }

  inspect(label, root, category) {
    const triangles = countObjectTriangles(root);
    const limit = this.budgets[category];
    const result = { label, category, triangles, limit, ok: !limit || triangles <= limit };
    this.records.set(label, result);
    if (!result.ok) {
      const message = `[GeometryBudget] ${label}: ${triangles} triangles > ${limit}`;
      if (this.strict) throw new Error(message);
      console.warn(message);
    }
    return result;
  }

  summary() {
    return [...this.records.values()];
  }
}
