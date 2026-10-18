// Progressive, opt-in CC0 models for COMPLETED player-built structures.
// Preserve the original Hexkingdom construction and economy logic as source of truth.
// Load each building type once, clone meshes with shared geometries, and fall back
// to the original 3D model until the replacement is successfully mounted.
import * as THREE from 'three';
import { events } from '../core/Events.js';

export const VILLAGE_ART_CATALOG = Object.freeze({
  farm: 'assets/quaternius/farm-second-age-3.gltf',
  market: 'assets/quaternius/market-first-age-3.gltf',
  barracks: 'assets/quaternius/barracks-first-age-3.gltf',
});
export function artBuildingKey(cellKey, rec) {
  return cellKey + '/' + rec.slot + '/' + rec.id;
}

export class VillageBuildingArt {
  constructor(game) {
    this.game = game;
    this.templates = new Map();
    this.pending = new Map();
    this.mounted = new Map();
    this.failed = new Set();
    events.on('buildings:changed', () => this.refresh());
    events.on('build:completed', () => this.refresh());
    events.on('game:restart', () => this.clear());
    // The normal restore path finishes before this renderer is constructed.
    this.refresh();
  }

  clear() {
    for (const entry of this.mounted.values()) this._remove(entry);
    this.mounted.clear();
  }

  _remove(entry) {
    entry.instance.parent?.remove(entry.instance);
    if (entry.original && entry.original.parent) entry.original.visible = true;
    // Geometry and materials belong to a shared template, not individual clones.
    // Never dispose the shared asset when an individual building is removed.
  }

  async _loadTemplate(id) {
    if (this.pending.has(id)) return this.pending.get(id);
    const url = VILLAGE_ART_CATALOG[id];
    if (!url || this.failed.has(id)) return null;
    const pending = (async () => {
      try {
        const { GLTFLoader } = await import(
          'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/GLTFLoader.js'
        );
        const asset = await new GLTFLoader().loadAsync(url);
        const scene = asset.scene;
        scene.updateMatrixWorld(true);
        const bounds = new THREE.Box3().setFromObject(scene);
        const size = bounds.getSize(new THREE.Vector3());
        if (!Number.isFinite(size.x) || !Number.isFinite(size.y) || !Number.isFinite(size.z) ||
            size.x <= 0 || size.y <= 0 || size.z <= 0) {
          throw new Error('3D 건축 모델 크기가 잘못되었습니다.');
        }
        this.templates.set(id, { scene, bounds, size });
      } catch (error) {
        this.failed.add(id);
        console.info('새 3D 건축 모델을 불러오지 못해 기존 건물 외형을 유지합니다.', id, error);
      } finally {
        this.pending.delete(id);
        this.refresh();
      }
    })();
    this.pending.set(id, pending);
    return pending;
  }

  _mount(key, cell, rec) {
    const t = this.templates.get(rec.id);
    const original = rec.visual?.group;
    if (!t || !cell.group || !original || !original.parent) return;
    const instance = t.scene.clone(true);
    // Original Hexkingdom places each manually-built structure at a stable,
    // seeded local scatter point. Use the same position; do not alter save data.
    const size = t.size, center = t.bounds.getCenter(new THREE.Vector3());
    const maxWidth = rec.id === 'market' ? 0.75 : 0.66;
    const factor = Math.min(maxWidth / size.x, maxWidth / size.z, 0.9 / size.y);
    instance.scale.setScalar(factor);
    instance.rotation.y = original.rotation.y;
    instance.position.set(
      original.position.x - center.x * factor,
      original.position.y - t.bounds.min.y * factor,
      original.position.z - center.z * factor
    );
    instance.traverse(node => {
      if (!node.isMesh) return;
      node.castShadow = true;
      node.receiveShadow = true;
    });
    instance.userData.raniUpgradedBuilding = rec.id;
    cell.group.add(instance);
    // Only hide the original after the replacement has attached successfully.
    original.visible = false;
    this.mounted.set(key, { instance, original, rec, cell });
  }

  refresh() {
    const wanted = new Map();
    for (const [tileKey, list] of this.game.buildingSystem.byCell) {
      const cell = this.game.grid.cells.get(tileKey);
      if (!cell || (cell.owner && cell.owner !== 'player')) continue;
      for (const rec of list) {
        if (!rec.done || !Object.hasOwn(VILLAGE_ART_CATALOG, rec.id)) continue;
        wanted.set(artBuildingKey(tileKey, rec), { cell, rec });
      }
    }
    for (const [key, entry] of this.mounted) {
      if (!wanted.has(key) || wanted.get(key).rec !== entry.rec ||
          entry.original !== entry.rec.visual?.group ||
          entry.cell.group !== entry.instance.parent) {
        this._remove(entry);
        this.mounted.delete(key);
      }
    }
    for (const [key, { cell, rec }] of wanted) {
      if (this.mounted.has(key)) continue;
      if (this.templates.has(rec.id)) this._mount(key, cell, rec);
      else if (!this.pending.has(rec.id) && !this.failed.has(rec.id)) this._loadTemplate(rec.id);
    }
  }
}
