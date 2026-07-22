import * as THREE from 'three';
import { clone as cloneSkinned } from 'three/addons/utils/SkeletonUtils.js';
import { selectAssetVariant } from './asset-catalog.js';

const ALLOWED_MODEL_EXTENSIONS = new Set(['glb', 'gltf']);
const ALLOWED_TEXTURE_EXTENSIONS = new Set(['png', 'webp', 'ktx2', 'jpg', 'jpeg']);
const MIP_FACTOR = 4 / 3;
const THREE_ADDON_CDN = 'https://cdn.jsdelivr.net/npm/three@0.185.1/examples/jsm/libs';

function extensionOf(url) {
  const clean = String(url || '').split(/[?#]/)[0].toLowerCase();
  return clean.includes('.') ? clean.split('.').pop() : '';
}

function bytesToMB(bytes) {
  return bytes / (1024 * 1024);
}

export class AssetPipeline {
  constructor(renderer, {
    qualityTier = 'high',
    textureBudgetMB = 192,
    baseUrl = import.meta.env?.BASE_URL || './',
    lowPower = false
  } = {}) {
    this.renderer = renderer;
    this.qualityTier = qualityTier;
    this.textureBudgetMB = textureBudgetMB;
    this.baseUrl = baseUrl;
    this.lowPower = lowPower;
    this.maxAnisotropy = Math.min(lowPower ? 2 : 4, renderer.capabilities.getMaxAnisotropy?.() || 1);
    this.cache = new Map();
    this.failures = [];
    this.instanceCounts = new Map();
    this.fallbackCounts = new Map();
    this.textureBytes = 0;
    this.manager = new THREE.LoadingManager();
    this.textureLoader = new THREE.TextureLoader(this.manager);
    this.dracoLoader = null;
    this.ktx2Loader = null;
    this.gltfLoader = null;
    this.modelLoaderPromise = null;
    this.ktx2LoaderPromise = null;
  }

  assertAllowed(url, kind = 'asset') {
    const extension = extensionOf(url);
    const allowed = kind === 'model' ? ALLOWED_MODEL_EXTENSIONS : ALLOWED_TEXTURE_EXTENSIONS;
    if (extension === 'svg') throw new Error('SVG assets are prohibited. Use GLB/GLTF or PNG/WebP/KTX2.');
    if (!allowed.has(extension)) throw new Error(`Unsupported ${kind} asset: ${url}`);
    return url;
  }

  async ensureKTX2Loader() {
    if (this.ktx2Loader) return this.ktx2Loader;
    if (!this.ktx2LoaderPromise) {
      this.ktx2LoaderPromise = import('three/addons/loaders/KTX2Loader.js').then(({ KTX2Loader }) => {
        this.ktx2Loader = new KTX2Loader(this.manager)
          .setTranscoderPath(`${THREE_ADDON_CDN}/basis/`)
          .setWorkerLimit(this.lowPower ? 1 : 2)
          .detectSupport(this.renderer);
        return this.ktx2Loader;
      });
    }
    return this.ktx2LoaderPromise;
  }

  async ensureModelLoaders({ draco = false, ktx2 = false } = {}) {
    if (!this.gltfLoader) {
      const { GLTFLoader } = await import('three/addons/loaders/GLTFLoader.js');
      this.gltfLoader = new GLTFLoader(this.manager);
    }
    if (draco && !this.dracoLoader) {
      const { DRACOLoader } = await import('three/addons/loaders/DRACOLoader.js');
      this.dracoLoader = new DRACOLoader(this.manager)
        .setDecoderPath(`${THREE_ADDON_CDN}/draco/gltf/`)
        .setWorkerLimit(this.lowPower ? 2 : 4);
      this.gltfLoader.setDRACOLoader(this.dracoLoader);
    }
    if (ktx2 && !this.ktx2Loader) {
      this.gltfLoader.setKTX2Loader(await this.ensureKTX2Loader());
    }
    return this.gltfLoader;
  }

  async warmDecoders(entries = []) {
    await this.renderer.init?.();
    const selected = entries.map((entry) => ({ entry, extension: extensionOf(selectAssetVariant(entry, this.qualityTier).url) }));
    const needsModels = selected.some(({ entry }) => entry.kind === 'model');
    const needsDraco = selected.some(({ entry }) => entry.kind === 'model' && entry.compression === 'draco');
    const needsKTX2 = selected.some(({ entry, extension }) => extension === 'ktx2' || entry.embeddedTextures === 'ktx2');
    if (needsModels) await this.ensureModelLoaders({ draco: needsDraco, ktx2: needsKTX2 });
    else if (needsKTX2) await this.ensureKTX2Loader();
    return {
      gltf: needsModels,
      draco: needsDraco,
      ktx2: needsKTX2,
      deferred: !needsModels && !needsKTX2,
      workerLimit: this.lowPower ? 2 : 4
    };
  }

  prepareTexture(texture, { color = true, repeat = false } = {}) {
    if (!texture?.isTexture) return texture;
    texture.colorSpace = color ? THREE.SRGBColorSpace : THREE.NoColorSpace;
    texture.anisotropy = this.maxAnisotropy;
    texture.wrapS = repeat ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;
    texture.wrapT = repeat ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;
    texture.generateMipmaps = true;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.needsUpdate = true;
    return texture;
  }

  prepareModel(root) {
    root?.traverse?.((object) => {
      if (!object.isMesh) return;
      object.castShadow = !this.lowPower;
      object.receiveShadow = false;
      object.frustumCulled = true;
      object.matrixAutoUpdate = true;
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      materials.filter(Boolean).forEach((material) => {
        for (const key of ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'emissiveMap', 'aoMap']) {
          if (material[key]) this.prepareTexture(material[key], { color: key === 'map' || key === 'emissiveMap' });
        }
      });
    });
    return root;
  }

  estimateTextureBytes(texture, entry = {}) {
    if (Number.isFinite(entry.estimatedBytes)) return entry.estimatedBytes;
    const image = texture?.image || texture?.source?.data;
    const width = image?.width || entry.sourceWidth || 0;
    const height = image?.height || entry.sourceHeight || 0;
    if (!width || !height) return 0;
    return Math.round(width * height * 4 * MIP_FACTOR);
  }

  registerTextureBudget(texture, entry) {
    const bytes = this.estimateTextureBytes(texture, entry);
    this.textureBytes += bytes;
    const budgetBytes = this.textureBudgetMB * 1024 * 1024;
    if (this.textureBytes > budgetBytes) {
      console.warn(`[AssetPipeline] texture budget exceeded: ${bytesToMB(this.textureBytes).toFixed(1)}MB / ${this.textureBudgetMB}MB`);
    }
    return bytes;
  }

  async loadTexture(entry, url) {
    this.assertAllowed(url, 'texture');
    const extension = extensionOf(url);
    const texture = extension === 'ktx2'
      ? await (await this.ensureKTX2Loader()).loadAsync(url)
      : await this.textureLoader.loadAsync(url);
    this.prepareTexture(texture, { color: entry.color !== false, repeat: Boolean(entry.repeat) });
    const bytes = this.registerTextureBudget(texture, entry);
    return { kind: 'texture', texture, bytes, url };
  }

  async loadModel(entry, url) {
    this.assertAllowed(url, 'model');
    const gltf = await (await this.ensureModelLoaders({ draco: entry.compression === 'draco', ktx2: entry.embeddedTextures === 'ktx2' })).loadAsync(url);
    this.prepareModel(gltf.scene);
    return {
      kind: 'model',
      scene: gltf.scene,
      animations: gltf.animations || [],
      cameras: gltf.cameras || [],
      parser: gltf.parser,
      metrics: {
        skins: gltf.parser?.json?.skins?.length || 0,
        animations: (gltf.animations || []).map((clip) => clip.name || 'unnamed'),
        materials: gltf.parser?.json?.materials?.length || 0,
        textures: gltf.parser?.json?.textures?.length || 0,
        images: gltf.parser?.json?.images?.length || 0,
        extras: gltf.parser?.json?.asset?.extras || gltf.parser?.json?.extras || {}
      },
      url
    };
  }

  async loadEntry(entry) {
    const selected = selectAssetVariant(entry, this.qualityTier);
    if (!selected.url) throw new Error(`Asset URL missing: ${entry.id}`);
    const loaded = entry.kind === 'model'
      ? await this.loadModel(entry, selected.url)
      : await this.loadTexture(entry, selected.url);
    const record = { ...loaded, id: entry.id, selectedTier: selected.tier, required: Boolean(entry.required), approval: entry.approval || null };
    if (entry.retain !== false) this.cache.set(entry.id, record);
    else if (record.texture) record.texture.dispose();
    return record;
  }

  async preload(entries = [], { onProgress } = {}) {
    const total = Math.max(1, entries.length);
    let completed = 0;
    const assets = new Map();
    const failures = [];
    const emit = (entry, status, detail = '') => {
      onProgress?.({
        completed,
        total,
        ratio: completed / total,
        id: entry?.id || '',
        label: entry?.label || entry?.id || '',
        status,
        detail
      });
    };

    for (const entry of entries) {
      emit(entry, 'loading');
      try {
        const record = await this.loadEntry(entry);
        assets.set(entry.id, record);
        completed += 1;
        emit(entry, 'ready', record.selectedTier);
      } catch (error) {
        const reason = error instanceof Error ? error.message : String(error);
        failures.push({ id: entry.id, required: Boolean(entry.required), reason });
        this.failures.push({ id: entry.id, reason });
        completed += 1;
        emit(entry, entry.required ? 'failed' : 'fallback', reason);
        if (entry.required && !entry.fallback) throw error;
      }
    }

    return {
      assets,
      failures,
      qualityTier: this.qualityTier,
      textureMemoryMB: bytesToMB(this.textureBytes),
      textureBudgetMB: this.textureBudgetMB
    };
  }

  get(id) {
    return this.cache.get(id) || null;
  }

  instantiateModel(id, fallbackFactory = null) {
    const record = this.get(id);
    if (record?.scene) {
      const instance = cloneSkinned(record.scene);
      instance.traverse?.((object) => {
        if (!object.isMesh) return;
        object.userData.assetSourceId = id;
        object.userData.sharedAssetGeometry = true;
        object.userData.assetApproval = record.approval || null;
      });
      instance.userData.assetApproval = record.approval || null;
      instance.userData.animations = record.animations || [];
      instance.userData.assetMetrics = record.metrics || null;
      this.instanceCounts.set(id, (this.instanceCounts.get(id) || 0) + 1);
      return instance;
    }
    if (typeof fallbackFactory === 'function') {
      const fallback = fallbackFactory();
      if (fallback) {
        fallback.userData.assetSourceId = id;
        fallback.userData.assetFallback = true;
        this.fallbackCounts.set(id, (this.fallbackCounts.get(id) || 0) + 1);
      }
      return fallback;
    }
    return null;
  }

  recordFallback(id) {
    if (!id) return;
    this.fallbackCounts.set(id, (this.fallbackCounts.get(id) || 0) + 1);
  }

  getModelStatus(id) {
    const record = this.get(id);
    const failure = [...this.failures].reverse().find((item) => item.id === id);
    return {
      id,
      loaded: Boolean(record?.scene),
      url: record?.url || '',
      selectedTier: record?.selectedTier || 'none',
      instances: this.instanceCounts.get(id) || 0,
      fallbacks: this.fallbackCounts.get(id) || 0,
      failure: failure?.reason || '',
      approval: record?.approval || null,
      metrics: record?.metrics || null
    };
  }

  getModelStatuses(ids = []) {
    return ids.map((id) => this.getModelStatus(id));
  }

  dispose() {
    for (const record of this.cache.values()) {
      if (record.texture) record.texture.dispose();
      record.scene?.traverse?.((object) => {
        if (!object.isMesh) return;
        object.geometry?.dispose?.();
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.filter(Boolean).forEach((material) => material.dispose?.());
      });
    }
    this.cache.clear();
    this.dracoLoader?.dispose();
    this.ktx2Loader?.dispose();
  }

  get diagnostics() {
    return {
      qualityTier: this.qualityTier,
      cachedAssets: this.cache.size,
      failedAssets: this.failures.length,
      modelInstances: Object.fromEntries(this.instanceCounts),
      modelFallbacks: Object.fromEntries(this.fallbackCounts),
      textureMemoryMB: Number(bytesToMB(this.textureBytes).toFixed(2)),
      textureBudgetMB: this.textureBudgetMB,
      anisotropy: this.maxAnisotropy,
      dracoWorkers: this.lowPower ? 2 : 4,
      ktx2Workers: this.lowPower ? 1 : 2
    };
  }
}

export const ASSET_POLICY = Object.freeze({
  models: [...ALLOWED_MODEL_EXTENSIONS],
  textures: [...ALLOWED_TEXTURE_EXTENSIONS],
  prohibited: ['svg'],
  recommended: ['glb', 'webp', 'ktx2']
});
