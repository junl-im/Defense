import * as THREE from 'three';
import { createCodexPreviewModel } from './premium-assets.js';
import { resolveDirectionalFrame } from './engine/directional-impostor.js';

const clamp = THREE.MathUtils.clamp;

export default class CodexViewer {
  constructor(canvas, { impostorTexture = null, onFrame = null } = {}) {
    if (!canvas) throw new Error('Codex preview canvas is missing.');
    this.canvas = canvas;
    this.onFrame = onFrame;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x090612);
    this.camera = new THREE.PerspectiveCamera(42, 1, .1, 60);
    this.camera.position.set(4.5, 3.2, 6.8);
    this.scene.add(new THREE.HemisphereLight(0xa9c9ff, 0x23132f, 2.25));
    const key = new THREE.DirectionalLight(0xffe3b4, 2.4); key.position.set(5, 8, 5); this.scene.add(key);
    const rim = new THREE.DirectionalLight(0x8edcff, 1.9); rim.position.set(-5, 4, -4); this.scene.add(rim);
    this.root = new THREE.Group(); this.scene.add(this.root);
    const floor = new THREE.Mesh(new THREE.CircleGeometry(3.4, 40), new THREE.MeshStandardMaterial({ color: 0x21172d, roughness: .92, metalness: .02 }));
    floor.rotation.x = -Math.PI / 2; floor.position.y = -.02; floor.receiveShadow = true; this.scene.add(floor);
    const ring = new THREE.Mesh(new THREE.RingGeometry(2.2, 2.32, 48), new THREE.MeshBasicMaterial({ color: 0x8cecff, transparent: true, opacity: .26, side: THREE.DoubleSide }));
    ring.rotation.x = -Math.PI / 2; ring.position.y = .012; this.scene.add(ring);
    this.clock = new THREE.Clock();
    this.active = false;
    this.state = 'idle';
    this.mode = 'model';
    this.rotationY = .4;
    this.zoom = 7.2;
    this.dragging = false;
    this.pointerX = 0;
    this.pointerY = 0;
    this.impostorTexture = impostorTexture;
    this.impostor = null;
    this.model = null;
    this.baseScale = 1;
    this.bindControls();
    this.resize();
  }

  bindControls() {
    this.canvas.addEventListener('pointerdown', (event) => {
      this.dragging = true; this.pointerX = event.clientX; this.pointerY = event.clientY;
      this.canvas.setPointerCapture?.(event.pointerId);
    });
    this.canvas.addEventListener('pointermove', (event) => {
      if (!this.dragging) return;
      const dx = event.clientX - this.pointerX;
      const dy = event.clientY - this.pointerY;
      this.pointerX = event.clientX; this.pointerY = event.clientY;
      this.rotationY += dx * .012;
      this.zoom = clamp(this.zoom + dy * .012, 4.6, 11.5);
    });
    const end = (event) => { this.dragging = false; this.canvas.releasePointerCapture?.(event.pointerId); };
    this.canvas.addEventListener('pointerup', end);
    this.canvas.addEventListener('pointercancel', end);
    this.canvas.addEventListener('wheel', (event) => { event.preventDefault(); this.zoom = clamp(this.zoom + event.deltaY * .006, 4.6, 11.5); }, { passive: false });
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    const width = Math.max(240, this.canvas.clientWidth || 560);
    const height = Math.max(220, this.canvas.clientHeight || 420);
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  setEntry(section, id, entry, context = {}) {
    this.disposeObject(this.model);
    this.disposeObject(this.impostor);
    this.model = createCodexPreviewModel(section, id, { ...entry, ...context }, 4);
    this.root.add(this.model);
    const box = new THREE.Box3().setFromObject(this.model);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    this.model.position.sub(center);
    this.model.position.y += size.y * .5;
    const max = Math.max(size.x, size.y, size.z, 1);
    this.baseScale = clamp(3.5 / max, .42, 1.6);
    this.model.scale.multiplyScalar(this.baseScale);
    this.model.userData.previewBaseY = this.model.position.y;
    this.rotationY = .42;
    this.zoom = section === 'boss' ? 8.7 : section === 'world' ? 8 : 6.8;
    this.state = 'idle';
    this.mode = 'model';
    if (section === 'guardian' && id === 'ember' && this.impostorTexture) this.createImpostor();
    this.updateVisibility();
    this.resize();
  }

  createImpostor() {
    const texture = this.impostorTexture.clone();
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(.25, 1 / 3);
    texture.offset.set(0, 2 / 3);
    texture.needsUpdate = true;
    const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, alphaTest: .035, depthWrite: false, side: THREE.DoubleSide });
    this.impostor = new THREE.Mesh(new THREE.PlaneGeometry(4.1, 4.1), material);
    this.impostor.position.y = 2.05;
    this.impostor.visible = false;
    this.impostor.userData.disposeMap = true;
    this.root.add(this.impostor);
  }

  setState(state) { this.state = ['idle', 'move', 'attack', 'skill'].includes(state) ? state : 'idle'; }
  setMode(mode) { this.mode = mode === 'impostor' && this.impostor ? 'impostor' : 'model'; this.updateVisibility(); }
  updateVisibility() { if (this.model) this.model.visible = this.mode === 'model'; if (this.impostor) this.impostor.visible = this.mode === 'impostor'; }
  setActive(active) { this.active = Boolean(active); if (this.active) { this.clock.getDelta(); this.animate(); } }

  animate = () => {
    if (!this.active) return;
    requestAnimationFrame(this.animate);
    const dt = Math.min(.05, this.clock.getDelta());
    this.update(dt);
    this.renderer.render(this.scene, this.camera);
  };

  update(dt) {
    const t = performance.now() * .001;
    const target = new THREE.Vector3(0, 1.75, 0);
    this.camera.position.set(Math.sin(this.rotationY) * this.zoom, 2.8 + Math.sin(this.rotationY * .55) * .35, Math.cos(this.rotationY) * this.zoom);
    this.camera.lookAt(target);
    if (this.model) {
      const baseY = this.model.userData.previewBaseY || 0;
      this.model.rotation.set(0, 0, 0);
      this.model.position.y = baseY;
      const parts = this.model.userData.parts || {};
      if (this.state === 'idle') {
        this.model.position.y = baseY + Math.sin(t * 2.5) * .045;
        this.model.rotation.z = Math.sin(t * 1.8) * .018;
      } else if (this.state === 'move') {
        this.model.position.y = baseY + Math.abs(Math.sin(t * 7)) * .08;
        this.model.rotation.z = Math.sin(t * 7) * .055;
      } else if (this.state === 'attack') {
        this.model.rotation.x = -Math.sin((t * 5) % Math.PI) * .16;
        if (parts.weapon) parts.weapon.rotation.y += dt * 4;
      } else if (this.state === 'skill') {
        this.model.scale.setScalar(this.baseScale * (1 + Math.sin(t * 6) * .035));
        if (parts.signature) parts.signature.rotation.y += dt * 2.8;
      }
      if (this.state !== 'skill') this.model.scale.setScalar(this.baseScale);
      if (parts.halo) parts.halo.rotation.z += dt * .75;
      if (parts.rankBeads) parts.rankBeads.rotation.y += dt * .6;
    }
    if (this.impostor?.visible) {
      const cameraYaw = Math.atan2(this.camera.position.x, this.camera.position.z);
      const frame = resolveDirectionalFrame(0, cameraYaw, 11);
      const col = frame % 4;
      const row = Math.floor(frame / 4);
      this.impostor.material.map.offset.set(col * .25, (2 - row) / 3);
      this.impostor.quaternion.copy(this.camera.quaternion);
      this.onFrame?.(frame);
    }
  }

  disposeObject(object) {
    if (!object) return;
    this.root.remove(object);
    object.traverse((node) => {
      node.geometry?.dispose();
      if (node.material) {
        const materials = Array.isArray(node.material) ? node.material : [node.material];
        materials.forEach((material) => { if (node.userData.disposeMap) material.map?.dispose(); material.dispose(); });
      }
    });
  }
}
