import * as THREE from 'three';
import './style.css';
import { isFirebaseEnabled, loadOnlineScores, submitOnlineScore } from './firebase.js';

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const clamp = THREE.MathUtils.clamp;
const lerp = THREE.MathUtils.lerp;
const rand = (min, max) => min + Math.random() * (max - min);
const pick = (array) => array[Math.floor(Math.random() * array.length)];
const tempV = new THREE.Vector3();
const tempV2 = new THREE.Vector3();
const tempColor = new THREE.Color();

const ui = {
  canvas: $('#game-canvas'), loading: $('#loading'), title: $('#title-screen'), start: $('#start-btn'),
  how: $('#how-btn'), collection: $('#collection-btn'), howModal: $('#how-modal'), collectionModal: $('#collection-modal'),
  blessingModal: $('#blessing-modal'), blessingOptions: $('#blessing-options'), collectionGrid: $('#collection-grid'),
  hud: $('#hud'), hp: $('#hp-value'), gold: $('#gold-value'), waveLabel: $('#wave-label'), waveProgress: $('#wave-progress'),
  enemyCount: $('#enemy-count'), menu: $('#menu-btn'), sound: $('#sound-btn'), synergyPanel: $('#synergy-panel'),
  synergyToggle: $('#synergy-toggle'), synergyCount: $('#synergy-count'), synergyList: $('#synergy-list'),
  luckMeter: $('#luck-meter'), luckValue: $('#luck-value'), luckProgress: $('#luck-progress'), unitStrip: $('#unit-strip'),
  joystick: $('#joystick-zone'), joystickKnob: $('#joystick-knob'), lookZone: $('#look-zone'), actionDock: $('#action-dock'),
  dash: $('#dash-btn'), dashCooldown: $('#dash-cooldown'), skill: $('#skill-btn'), skillCooldown: $('#skill-cooldown'),
  summon: $('#summon-btn'), summonCost: $('#summon-cost'), wave: $('#wave-btn'), waveText: $('#wave-btn-text'),
  toast: $('#toast'), combo: $('#combo-banner'), comboText: $('#combo-text'), boss: $('#boss-banner'), bossName: $('#boss-name'),
  mission: $('#mission-banner'), missionKicker: $('#mission-kicker'), missionTitle: $('#mission-title'), missionCopy: $('#mission-copy'),
  bossHealth: $('#boss-health'), bossHealthName: $('#boss-health-name'), bossHealthValue: $('#boss-health-value'), bossHealthProgress: $('#boss-health-progress'),
  killChain: $('#kill-chain'), killChainValue: $('#kill-chain-value'), killChainBonus: $('#kill-chain-bonus'),
  combatTextRoot: $('#combat-text-root'), qualityBadge: $('#quality-badge'),
  damageFlash: $('#damage-flash'), pauseModal: $('#pause-modal'), resume: $('#resume-btn'), restart: $('#restart-btn'),
  titleBtn: $('#title-btn'), resultModal: $('#result-modal'), resultKicker: $('#result-kicker'), resultTitle: $('#result-title'),
  resultScore: $('#result-score'), resultKills: $('#result-kills'), resultRank: $('#result-rank'), resultUnits: $('#result-units'),
  playerName: $('#player-name'), saveScore: $('#save-score-btn'), resultRetry: $('#result-retry-btn'), leaderboard: $('#leaderboard')
};

const GAME_VERSION = '1.1.0';

const RANKS = [
  { name: '평범', stars: 1, mult: 1, color: 0xd8d3df, glow: 0x8d7f9b },
  { name: '희귀', stars: 2, mult: 2.15, color: 0x69dcff, glow: 0x3cbbe8 },
  { name: '영웅', stars: 3, mult: 4.7, color: 0xb983ff, glow: 0x8b4ee6 },
  { name: '전설', stars: 4, mult: 10.3, color: 0xffcf68, glow: 0xf09c38 },
  { name: '신화', stars: 5, mult: 23, color: 0xff759d, glow: 0xff3c76 }
];

const UNIT_TYPES = {
  ember: {
    name: '불씨 깨비', symbol: '🔥', element: '화염', color: 0xff704d, soft: '#6b2430',
    description: '빠른 도깨비불을 던집니다. 같은 적을 연속 공격할수록 강해집니다.',
    damage: 12, range: 9.2, cooldown: .68, projectileSpeed: 18, role: '연사'
  },
  frost: {
    name: '달서리 깨비', symbol: '❄', element: '달빛', color: 0x75e9ff, soft: '#1f516b',
    description: '적을 얼려 이동 속도를 낮추는 서리 구슬을 발사합니다.',
    damage: 9, range: 8.6, cooldown: .9, projectileSpeed: 15, slow: 2.2, role: '둔화'
  },
  wind: {
    name: '바람 갓깨비', symbol: '➶', element: '바람', color: 0x8ff3b2, soft: '#245a48',
    description: '가장 멀리 있는 적을 꿰뚫는 바람 화살을 날립니다.',
    damage: 16, range: 11.3, cooldown: 1.05, projectileSpeed: 23, pierce: 2, role: '저격'
  },
  stone: {
    name: '바위 몽둥깨비', symbol: '◆', element: '산', color: 0xe2b477, soft: '#60452c',
    description: '묵직한 바위를 떨어뜨려 넓은 범위의 적을 공격합니다.',
    damage: 25, range: 7.8, cooldown: 1.65, projectileSpeed: 11, splash: 2.6, role: '광역'
  },
  bell: {
    name: '방울 무당깨비', symbol: '✦', element: '혼령', color: 0xf6a6ff, soft: '#57215d',
    description: '혼령 파동이 주변 적 사이를 튕기며 연쇄 피해를 줍니다.',
    damage: 11, range: 8.8, cooldown: 1.15, projectileSpeed: 16, chain: 3, role: '연쇄'
  },
  thunder: {
    name: '번개 장군깨비', symbol: 'ϟ', element: '천둥', color: 0xffe45f, soft: '#665313',
    description: '느리지만 강력한 낙뢰로 단일 적을 처형합니다.',
    damage: 38, range: 9.5, cooldown: 1.85, projectileSpeed: 28, execute: .16, role: '처형'
  }
};

const UNIT_KEYS = Object.keys(UNIT_TYPES);

const ENEMY_TYPES = {
  imp: { name: '장난 요괴', hp: 44, speed: 2.8, damage: 5, reward: 7, color: 0xd75672, scale: .85 },
  runner: { name: '두억 질주꾼', hp: 30, speed: 4.25, damage: 4, reward: 7, color: 0xff8c5a, scale: .66 },
  brute: { name: '돌갑옷 귀수', hp: 118, speed: 1.65, damage: 11, reward: 13, color: 0x78628f, scale: 1.23 },
  shaman: { name: '저주 무당', hp: 72, speed: 2.15, damage: 7, reward: 11, color: 0x4f9eb2, scale: .95 },
  tiger: { name: '저승 호랑이', hp: 950, speed: 1.55, damage: 22, reward: 95, color: 0xff5578, scale: 2.05, boss: true },
  king: { name: '백귀 야행왕', hp: 2250, speed: 1.35, damage: 34, reward: 220, color: 0x7b3eff, scale: 2.55, boss: true }
};

const SYNERGIES = [
  { element: '화염', icon: '🔥', text: '도깨비 공격력 증가', thresholds: [2, 4], values: ['+15%', '+32%'] },
  { element: '달빛', icon: '☾', text: '대박 기운 획득 증가', thresholds: [2, 4], values: ['+30%', '+65%'] },
  { element: '바람', icon: '➶', text: '공격 속도 증가', thresholds: [2, 4], values: ['+12%', '+25%'] },
  { element: '산', icon: '◆', text: '신목 피해 감소', thresholds: [2, 4], values: ['-15%', '-30%'] },
  { element: '혼령', icon: '✦', text: '처치 엽전 보너스', thresholds: [2, 4], values: ['+18%', '+38%'] },
  { element: '천둥', icon: 'ϟ', text: '영웅 직접 공격 강화', thresholds: [2, 4], values: ['+25%', '+60%'] }
];

const BLESSINGS = [
  { id: 'bounty', icon: '🪙', name: '깨비 복주머니', desc: '적이 떨어뜨리는 엽전이 30% 증가합니다.', tag: '경제', apply: (g) => { g.mods.goldMultiplier *= 1.3; } },
  { id: 'magnet', icon: '🧲', name: '달빛 자석', desc: '엽전 획득 범위가 크게 증가하고 이동 속도가 8% 오릅니다.', tag: '수집', apply: (g) => { g.mods.pickupRadius += 2.6; g.mods.moveSpeed *= 1.08; } },
  { id: 'frenzy', icon: '⚔', name: '도깨비 난장', desc: '모든 도깨비의 공격 속도가 22% 증가합니다.', tag: '공격', apply: (g) => { g.mods.unitCooldown *= .78; } },
  { id: 'hero', icon: '🔥', name: '대장 깨비의 혼', desc: '플레이어의 기본 공격력이 65% 증가합니다.', tag: '액션', apply: (g) => { g.mods.heroDamage *= 1.65; } },
  { id: 'moonfire', icon: '☄', name: '푸른 귀화', desc: '도깨비불 난무의 재사용 시간이 35% 감소합니다.', tag: '스킬', apply: (g) => { g.mods.skillCooldown *= .65; } },
  { id: 'fortune', icon: '🎲', name: '왕대박 부적', desc: '대박 기운 획득량이 55% 증가합니다.', tag: '운빨', apply: (g) => { g.mods.luckGain *= 1.55; } },
  { id: 'roots', icon: '🌳', name: '천년 신목의 뿌리', desc: '신목 체력을 25 회복하고 받는 피해가 18% 감소합니다.', tag: '방어', apply: (g) => { g.coreHp = Math.min(g.coreMaxHp, g.coreHp + 25); g.mods.coreDamage *= .82; } },
  { id: 'discount', icon: '🏮', name: '야시장 흥정왕', desc: '이후 모든 소환 비용이 7 엽전 감소합니다.', tag: '경제', apply: (g) => { g.mods.summonDiscount += 7; } }
];

class SoundEngine {
  constructor() { this.ctx = null; this.enabled = true; }
  unlock() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) this.ctx = new AudioContextClass();
    }
    if (this.ctx?.state === 'suspended') this.ctx.resume();
  }
  tone(freq = 440, duration = .08, type = 'sine', volume = .03, slide = 0, delay = 0) {
    if (!this.enabled || !this.ctx) return;
    const now = this.ctx.currentTime + delay;
    const oscillator = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(Math.max(20, freq), now);
    if (slide) oscillator.frequency.exponentialRampToValueAtTime(Math.max(25, freq + slide), now + duration);
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(.0001, now + duration);
    oscillator.connect(gain).connect(this.ctx.destination);
    oscillator.start(now);
    oscillator.stop(now + duration + .02);
  }
  summon(rank) {
    this.tone(220 + rank * 65, .16, 'sine', .035, 380);
    this.tone(420 + rank * 90, .2, 'triangle', .025, 260, .08);
    if (rank >= 3) this.tone(760, .38, 'sine', .035, 520, .17);
  }
  merge(rank) {
    this.tone(180, .16, 'square', .03, 420);
    this.tone(440 + rank * 110, .28, 'sine', .045, 650, .1);
  }
  shoot(type) {
    const map = { ember: [480, 'triangle', 90], frost: [650, 'sine', -180], wind: [340, 'triangle', 220], stone: [90, 'sawtooth', -30], bell: [760, 'sine', 180], thunder: [120, 'square', 700], hero: [520, 'triangle', 130] };
    const [freq, wave, slide] = map[type] || map.hero;
    this.tone(freq, type === 'stone' ? .13 : .06, wave, type === 'thunder' ? .035 : .014, slide);
  }
  coin() { this.tone(760, .06, 'sine', .028, 330); }
  hit() { this.tone(105, .045, 'square', .012, -25); }
  skill() { this.tone(180, .5, 'sawtooth', .045, 920); this.tone(820, .35, 'sine', .03, -360, .08); }
  boss() { this.tone(62, .7, 'sawtooth', .065, -24); this.tone(110, .45, 'square', .035, -40, .12); }
  ui() { this.tone(480, .045, 'sine', .015, 80); }
  fail() { this.tone(190, .6, 'sawtooth', .045, -130); }
  win() { [440, 554, 660, 880].forEach((f, i) => this.tone(f, .23, 'sine', .038, 90, i * .11)); }
}

class DokkaebiLuckDefense {
  constructor() {
    this.sound = new SoundEngine();
    this.clock = new THREE.Clock();
    this.lowPower = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);
    this.state = 'loading';
    this.previousState = 'title';
    this.elapsed = 0;
    this.shake = 0;
    this.cameraYaw = Math.PI * .25;
    this.cameraPitch = .66;
    this.cameraDistance = 15.5;
    this.pointerDown = null;
    this.lookPointer = null;
    this.toastTimer = null;
    this.bannerTimer = null;
    this.missionTimer = null;
    this.input = { x: 0, y: 0, keys: new Set() };
    this.killChain = 0;
    this.killChainTimer = 0;
    this.combatTextCount = 0;
    this.qualityScale = this.lowPower ? .9 : 1;
    this.qualitySampleTime = 0;
    this.qualityFrames = 0;
    this.qualityAdjusted = false;

    this.enemies = [];
    this.units = [];
    this.projectiles = [];
    this.coins = [];
    this.particles = [];
    this.wisps = [];
    this.unitPads = [];
    this.gates = [];

    this.initThree();
    this.bindUI();
    this.populateCollection();
    this.createWorld(true);
    this.state = 'title';
    this.animate();

    console.info(`[DokkaebiLuckDefense3D] v${GAME_VERSION}`);

    window.setTimeout(() => {
      ui.loading.classList.remove('visible');
      ui.title.classList.add('visible');
    }, 850);
  }

  initThree() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: ui.canvas,
      antialias: !this.lowPower,
      powerPreference: 'high-performance',
      alpha: false
    });
    this.renderer.setPixelRatio(this.getRenderPixelRatio());
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.14;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x10091f);
    this.scene.fog = new THREE.FogExp2(0x130b26, .024);

    this.camera = new THREE.PerspectiveCamera(49, window.innerWidth / window.innerHeight, .1, 130);
    this.camera.position.set(11, 12, 14);

    this.hemiLight = new THREE.HemisphereLight(0x858dff, 0x23142e, 1.65);
    this.scene.add(this.hemiLight);
    this.moonLight = new THREE.DirectionalLight(0xa9bdff, 2.8);
    this.moonLight.position.set(-16, 26, 13);
    this.moonLight.castShadow = true;
    this.moonLight.shadow.mapSize.set(this.lowPower ? 512 : 1024, this.lowPower ? 512 : 1024);
    this.moonLight.shadow.camera.left = -34;
    this.moonLight.shadow.camera.right = 34;
    this.moonLight.shadow.camera.top = 34;
    this.moonLight.shadow.camera.bottom = -34;
    this.scene.add(this.moonLight);

    this.worldRoot = new THREE.Group();
    this.dynamicRoot = new THREE.Group();
    this.effectRoot = new THREE.Group();
    this.scene.add(this.worldRoot, this.dynamicRoot, this.effectRoot);

    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    window.addEventListener('resize', () => this.onResize());
  }

  bindUI() {
    ui.start.addEventListener('click', () => { this.sound.unlock(); this.sound.ui(); this.startRun(); });
    ui.how.addEventListener('click', () => this.showModal(ui.howModal));
    ui.collection.addEventListener('click', () => this.showModal(ui.collectionModal));
    $$('[data-close]').forEach((button) => button.addEventListener('click', () => this.hideModal($(`#${button.dataset.close}`))));
    ui.sound.addEventListener('click', () => {
      this.sound.enabled = !this.sound.enabled;
      ui.sound.textContent = this.sound.enabled ? '♪' : '×';
      if (this.sound.enabled) { this.sound.unlock(); this.sound.ui(); }
    });
    ui.menu.addEventListener('click', () => this.pauseGame());
    ui.resume.addEventListener('click', () => this.resumeGame());
    ui.restart.addEventListener('click', () => { this.hideModal(ui.pauseModal); this.startRun(); });
    ui.titleBtn.addEventListener('click', () => { this.hideModal(ui.pauseModal); this.returnToTitle(); });
    ui.resultRetry.addEventListener('click', () => { this.hideModal(ui.resultModal); this.startRun(); });
    ui.saveScore.addEventListener('click', () => this.saveScore());
    ui.summon.addEventListener('click', () => this.summonUnit());
    ui.wave.addEventListener('click', () => this.startWave());
    ui.dash.addEventListener('click', () => this.useDash());
    ui.skill.addEventListener('click', () => this.useHeroSkill());
    ui.synergyToggle.addEventListener('click', () => ui.synergyPanel.classList.toggle('collapsed'));

    this.setupJoystick();
    this.setupLookControls();

    window.addEventListener('keydown', (event) => {
      this.input.keys.add(event.code);
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.code)) event.preventDefault();
      if (event.code === 'Space') this.useDash();
      if (event.code === 'KeyQ') this.useHeroSkill();
      if (event.code === 'KeyE') this.summonUnit();
      if (event.code === 'Enter' && this.state === 'playing' && !this.waveActive) this.startWave();
      if (event.code === 'Escape') this.state === 'paused' ? this.resumeGame() : this.pauseGame();
    });
    window.addEventListener('keyup', (event) => this.input.keys.delete(event.code));
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.state === 'playing') this.pauseGame();
    });
  }

  setupJoystick() {
    let pointerId = null;
    const move = (event) => {
      if (event.pointerId !== pointerId) return;
      const rect = ui.joystick.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      let x = event.clientX - cx;
      let y = event.clientY - cy;
      const max = rect.width * .29;
      const length = Math.hypot(x, y) || 1;
      if (length > max) { x = x / length * max; y = y / length * max; }
      this.input.x = x / max;
      this.input.y = y / max;
      ui.joystickKnob.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
    };
    const end = (event) => {
      if (event.pointerId !== pointerId) return;
      pointerId = null;
      this.input.x = 0;
      this.input.y = 0;
      ui.joystickKnob.style.transform = 'translate(-50%, -50%)';
    };
    ui.joystick.addEventListener('pointerdown', (event) => {
      pointerId = event.pointerId;
      ui.joystick.setPointerCapture(pointerId);
      move(event);
    });
    ui.joystick.addEventListener('pointermove', move);
    ui.joystick.addEventListener('pointerup', end);
    ui.joystick.addEventListener('pointercancel', end);
  }

  setupLookControls() {
    ui.lookZone.addEventListener('pointerdown', (event) => {
      this.lookPointer = { id: event.pointerId, x: event.clientX, y: event.clientY };
      ui.lookZone.setPointerCapture(event.pointerId);
    });
    ui.lookZone.addEventListener('pointermove', (event) => {
      if (!this.lookPointer || this.lookPointer.id !== event.pointerId) return;
      const dx = event.clientX - this.lookPointer.x;
      const dy = event.clientY - this.lookPointer.y;
      this.cameraYaw -= dx * .006;
      this.cameraPitch = clamp(this.cameraPitch + dy * .004, .38, .9);
      this.lookPointer.x = event.clientX;
      this.lookPointer.y = event.clientY;
    });
    const end = (event) => { if (this.lookPointer?.id === event.pointerId) this.lookPointer = null; };
    ui.lookZone.addEventListener('pointerup', end);
    ui.lookZone.addEventListener('pointercancel', end);
    ui.canvas.addEventListener('wheel', (event) => {
      this.cameraDistance = clamp(this.cameraDistance + event.deltaY * .012, 11, 20);
    }, { passive: true });
  }

  showModal(element) {
    this.sound.ui();
    element.classList.add('visible');
    element.setAttribute('aria-hidden', 'false');
  }

  hideModal(element) {
    element.classList.remove('visible');
    element.setAttribute('aria-hidden', 'true');
  }

  haptic(pattern = 18) {
    if ('vibrate' in navigator) navigator.vibrate(pattern);
  }

  showMission(title, copy, kicker = 'MOON MARKET ALERT', duration = 1600) {
    clearTimeout(this.missionTimer);
    ui.missionKicker.textContent = kicker;
    ui.missionTitle.textContent = title;
    ui.missionCopy.textContent = copy;
    ui.mission.classList.remove('show');
    ui.mission.classList.remove('hidden');
    requestAnimationFrame(() => ui.mission.classList.add('show'));
    this.missionTimer = window.setTimeout(() => {
      ui.mission.classList.remove('show');
      window.setTimeout(() => ui.mission.classList.add('hidden'), 320);
    }, duration);
  }

  showCombatText(position, value, options = {}) {
    if (!ui.combatTextRoot || this.combatTextCount >= (this.lowPower ? 12 : 26)) return;
    if (this.lowPower && !options.crit && Math.random() > .42) return;
    const projected = position.clone().project(this.camera);
    if (projected.z < -1 || projected.z > 1) return;
    const x = (projected.x * .5 + .5) * window.innerWidth;
    const y = (-projected.y * .5 + .5) * window.innerHeight;
    const node = document.createElement('span');
    node.className = `combat-text${options.crit ? ' crit' : ''}${options.heal ? ' heal' : ''}`;
    node.textContent = options.label || Math.max(1, Math.round(value)).toLocaleString();
    node.style.left = `${x}px`;
    node.style.top = `${y}px`;
    ui.combatTextRoot.appendChild(node);
    this.combatTextCount += 1;
    window.setTimeout(() => {
      node.remove();
      this.combatTextCount = Math.max(0, this.combatTextCount - 1);
    }, 760);
  }

  populateCollection() {
    ui.collectionGrid.innerHTML = UNIT_KEYS.map((key) => {
      const unit = UNIT_TYPES[key];
      const hex = `#${unit.color.toString(16).padStart(6, '0')}`;
      return `<article class="collection-item" style="--unit-color:${hex};--unit-soft:${unit.soft};--unit-line:${hex}55">
        <div class="portrait">${unit.symbol}</div><b>${unit.name}</b><small>${unit.element} · ${unit.role}</small><p>${unit.description}</p>
      </article>`;
    }).join('');
  }

  createMaterial(color, roughness = .75, metalness = .05, emissive = 0x000000, emissiveIntensity = 0) {
    return new THREE.MeshStandardMaterial({ color, roughness, metalness, emissive, emissiveIntensity });
  }

  mesh(geometry, material, x = 0, y = 0, z = 0, cast = true, receive = true) {
    const item = new THREE.Mesh(geometry, material);
    item.position.set(x, y, z);
    item.castShadow = cast;
    item.receiveShadow = receive;
    return item;
  }

  clearWorld() {
    this.enemies.length = 0;
    this.units.length = 0;
    this.projectiles.length = 0;
    this.coins.length = 0;
    this.particles.length = 0;
    this.wisps.length = 0;
    this.unitPads.length = 0;
    this.gates.length = 0;
    this.disposeGroup(this.worldRoot);
    this.disposeGroup(this.dynamicRoot);
    this.disposeGroup(this.effectRoot);
  }

  disposeGroup(root) {
    while (root.children.length) {
      const child = root.children.pop();
      child.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => material.dispose());
        }
      });
    }
  }

  createWorld(titleMode = false) {
    this.clearWorld();
    this.scene.background.set(0x10091f);
    this.scene.fog.color.set(0x130b26);

    const groundMat = this.createMaterial(0x241933, .96);
    const ground = this.mesh(new THREE.CylinderGeometry(34, 35, 1.2, 64), groundMat, 0, -.65, 0, false, true);
    this.worldRoot.add(ground);

    const ringMat = this.createMaterial(0x51405f, .82);
    const ring = this.mesh(new THREE.RingGeometry(8.2, 12.5, 64), ringMat, 0, .015, 0, false, true);
    ring.rotation.x = -Math.PI / 2;
    this.worldRoot.add(ring);

    const inner = this.mesh(new THREE.CircleGeometry(7.8, 64), this.createMaterial(0x34233d, .9), 0, .025, 0, false, true);
    inner.rotation.x = -Math.PI / 2;
    this.worldRoot.add(inner);

    for (let i = 0; i < 28; i += 1) {
      const angle = i / 28 * Math.PI * 2;
      const radius = rand(13.5, 31.5);
      this.createRock(Math.cos(angle) * radius + rand(-1.2, 1.2), Math.sin(angle) * radius + rand(-1.2, 1.2), rand(.45, 1.1));
    }

    for (let i = 0; i < 16; i += 1) {
      const angle = i / 16 * Math.PI * 2;
      const radius = i % 2 ? 19.5 : 23.5;
      this.createLantern(Math.cos(angle) * radius, Math.sin(angle) * radius, angle + Math.PI / 2, i);
    }

    for (let i = 0; i < 8; i += 1) {
      const angle = i / 8 * Math.PI * 2 + Math.PI / 8;
      this.createMarketStall(Math.cos(angle) * 16.2, Math.sin(angle) * 16.2, angle + Math.PI / 2, i);
    }

    for (let i = 0; i < 4; i += 1) {
      const angle = i / 4 * Math.PI * 2;
      const gate = this.createGate(Math.cos(angle) * 28.5, Math.sin(angle) * 28.5, angle + Math.PI / 2, i);
      this.gates.push(gate);
    }

    for (let i = 0; i < 15; i += 1) {
      const angle = i / 15 * Math.PI * 2;
      const radius = 10.15;
      this.createUnitPad(Math.cos(angle) * radius, Math.sin(angle) * radius, angle, i);
    }

    this.core = this.createSacredTree();
    this.player = this.createHero();
    this.player.group.position.set(0, 0, 6.2);

    for (let i = 0; i < (this.lowPower ? 18 : 32); i += 1) this.createWisp();
    this.createMoon();

    if (titleMode) {
      const showcase = [
        ['ember', 2, 0], ['frost', 2, 3], ['wind', 3, 6], ['stone', 2, 9], ['bell', 3, 12]
      ];
      showcase.forEach(([type, rank, padIndex]) => this.createUnit(type, rank, this.unitPads[padIndex], true));
    }
  }

  createMoon() {
    const moon = this.mesh(new THREE.SphereGeometry(4.2, 32, 20), new THREE.MeshBasicMaterial({ color: 0xffe5a2 }), -28, 30, -48, false, false);
    this.worldRoot.add(moon);
    const halo = this.mesh(new THREE.SphereGeometry(5.4, 24, 16), new THREE.MeshBasicMaterial({ color: 0xd9c5ff, transparent: true, opacity: .08, side: THREE.BackSide }), -28, 30, -48, false, false);
    this.worldRoot.add(halo);
  }

  createRock(x, z, scale = 1) {
    const rock = this.mesh(new THREE.DodecahedronGeometry(.7 * scale, 0), this.createMaterial(0x45384d, 1), x, .35 * scale, z);
    rock.rotation.set(rand(-.3, .3), rand(0, Math.PI), rand(-.2, .2));
    this.worldRoot.add(rock);
  }

  createLantern(x, z, rotation, index) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    group.rotation.y = rotation;
    const wood = this.createMaterial(0x3a2029, .9);
    const warm = this.createMaterial(0xffbe58, .35, .05, 0xff7b28, 2.6);
    const post = this.mesh(new THREE.CylinderGeometry(.12, .15, 3.5, 7), wood, 0, 1.75, 0);
    const arm = this.mesh(new THREE.BoxGeometry(1.2, .13, .13), wood, .48, 3.32, 0);
    const lamp = this.mesh(new THREE.CylinderGeometry(.34, .27, .68, 8), warm, .91, 2.85, 0);
    group.add(post, arm, lamp);
    if (!this.lowPower && index % 2 === 0) {
      const light = new THREE.PointLight(0xff9c42, .65, 7, 2);
      light.position.set(.91, 2.85, 0);
      group.add(light);
    }
    this.worldRoot.add(group);
  }

  createMarketStall(x, z, rotation, variant) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    group.rotation.y = rotation;
    const wood = this.createMaterial(variant % 2 ? 0x432235 : 0x39283b, .9);
    const clothColors = [0x813c68, 0x365d73, 0x74463d, 0x4f467c];
    const cloth = this.createMaterial(clothColors[variant % clothColors.length], .83);
    const counter = this.mesh(new THREE.BoxGeometry(3.1, 1.05, 1.35), wood, 0, .53, 0);
    const roof = this.mesh(new THREE.BoxGeometry(3.5, .18, 1.8), cloth, 0, 2.65, -.05);
    roof.rotation.z = variant % 2 ? -.06 : .06;
    const pole1 = this.mesh(new THREE.BoxGeometry(.12, 2.2, .12), wood, -1.35, 1.65, .52);
    const pole2 = pole1.clone(); pole2.position.x = 1.35;
    group.add(counter, roof, pole1, pole2);
    for (let i = 0; i < 3; i += 1) {
      const jar = this.mesh(new THREE.SphereGeometry(.22 + i * .03, 9, 7), this.createMaterial([0xd87a62, 0x73a976, 0xc7a65e][i], .7), -.65 + i * .62, 1.2, -.18);
      group.add(jar);
    }
    this.worldRoot.add(group);
  }

  createGate(x, z, rotation, index) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    group.rotation.y = rotation;
    const stone = this.createMaterial(0x342541, .8);
    const glowColor = [0xff567f, 0x7d6cff, 0x56d7d0, 0xe09b52][index];
    const glow = this.createMaterial(glowColor, .35, .05, glowColor, 2.4);
    const left = this.mesh(new THREE.BoxGeometry(1.25, 5.1, 1.35), stone, -2.15, 2.55, 0);
    const right = left.clone(); right.position.x = 2.15;
    const top = this.mesh(new THREE.BoxGeometry(5.9, .8, 1.55), stone, 0, 5.05, 0);
    const horn1 = this.mesh(new THREE.ConeGeometry(.48, 1.7, 6), stone, -2.15, 5.8, 0); horn1.rotation.z = -.28;
    const horn2 = horn1.clone(); horn2.position.x = 2.15; horn2.rotation.z = .28;
    const portal = this.mesh(new THREE.PlaneGeometry(3.35, 4.05), new THREE.MeshBasicMaterial({ color: glowColor, transparent: true, opacity: .2, side: THREE.DoubleSide, depthWrite: false }), 0, 2.45, .05, false, false);
    const rune = this.mesh(new THREE.TorusGeometry(1.45, .08, 8, 32), glow, 0, 2.48, .14, false, false);
    group.add(left, right, top, horn1, horn2, portal, rune);
    group.userData = { portal, rune, index, baseColor: glowColor };
    this.worldRoot.add(group);
    return group;
  }

  createUnitPad(x, z, angle, index) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    const base = this.mesh(new THREE.CylinderGeometry(1.08, 1.2, .28, 8), this.createMaterial(0x44354d, .78), 0, .14, 0);
    const rune = this.mesh(new THREE.RingGeometry(.56, .78, 8), new THREE.MeshBasicMaterial({ color: 0x9a7bc1, transparent: true, opacity: .2, side: THREE.DoubleSide }), 0, .295, 0, false, false);
    rune.rotation.x = -Math.PI / 2;
    rune.rotation.z = angle;
    group.add(base, rune);
    group.userData = { index, occupied: false, rune };
    this.worldRoot.add(group);
    this.unitPads.push(group);
  }

  createSacredTree() {
    const group = new THREE.Group();
    const bark = this.createMaterial(0x4f2f45, .88);
    const leaf = this.createMaterial(0x8663b1, .75, .05, 0x4e2a7d, .28);
    const glow = this.createMaterial(0x90f2ff, .25, .05, 0x62d8ff, 3.2);
    const trunk = this.mesh(new THREE.CylinderGeometry(.9, 1.35, 5, 9), bark, 0, 2.5, 0);
    trunk.rotation.z = .04;
    group.add(trunk);
    const branches = [
      [-1.4, 4.4, 0, -.72], [1.3, 4.65, .1, .72], [-.7, 5.3, -.4, -.35], [.65, 5.55, .2, .35]
    ];
    branches.forEach(([x, y, z, rot]) => {
      const branch = this.mesh(new THREE.CylinderGeometry(.22, .42, 3.2, 7), bark, x, y, z);
      branch.rotation.z = rot;
      group.add(branch);
    });
    const canopies = [[0,6.4,0,2.4],[-2,5.9,.2,1.65],[2,6.1,-.2,1.75],[-.7,7.7,-.2,1.5],[1,7.6,.4,1.4]];
    canopies.forEach(([x,y,z,s]) => {
      const crown = this.mesh(new THREE.IcosahedronGeometry(s, 1), leaf, x, y, z);
      crown.scale.y = .72;
      group.add(crown);
    });
    const coreOrb = this.mesh(new THREE.SphereGeometry(.48, 18, 12), glow, 0, 4.8, 1.05);
    group.add(coreOrb);
    if (!this.lowPower) {
      const light = new THREE.PointLight(0x6ce6ff, 1.3, 13, 2);
      light.position.set(0, 5, 0);
      group.add(light);
    }
    group.userData = { orb: coreOrb, hitPulse: 0 };
    this.worldRoot.add(group);
    return group;
  }

  createHero() {
    const group = new THREE.Group();
    const bodyMat = this.createMaterial(0x4d2a68, .65);
    const skinMat = this.createMaterial(0xd39a7b, .75);
    const clothMat = this.createMaterial(0x242139, .7);
    const glowMat = this.createMaterial(0x6eeeff, .28, .1, 0x37d8ff, 3.4);
    const body = this.mesh(new THREE.SphereGeometry(.55, 12, 9), bodyMat, 0, 1.05, 0); body.scale.set(1, 1.25, .82);
    const head = this.mesh(new THREE.SphereGeometry(.43, 12, 9), skinMat, 0, 1.85, 0);
    const hat = this.mesh(new THREE.ConeGeometry(.72, .62, 12), clothMat, 0, 2.28, 0); hat.rotation.z = -.08;
    const brim = this.mesh(new THREE.CylinderGeometry(.78, .78, .08, 14), clothMat, 0, 2.04, 0);
    const horn1 = this.mesh(new THREE.ConeGeometry(.14, .5, 7), glowMat, -.26, 2.48, 0); horn1.rotation.z = -.24;
    const horn2 = horn1.clone(); horn2.position.x = .26; horn2.rotation.z = .24;
    const foot1 = this.mesh(new THREE.SphereGeometry(.22, 8, 6), clothMat, -.28, .35, .03); foot1.scale.set(1, .7, 1.35);
    const foot2 = foot1.clone(); foot2.position.x = .28;
    const flame = this.mesh(new THREE.SphereGeometry(.22, 10, 7), glowMat, .72, 1.25, .1);
    group.add(body, head, hat, brim, horn1, horn2, foot1, foot2, flame);
    group.traverse((object) => { if (object.isMesh) object.userData.baseY = object.position.y; });
    this.dynamicRoot.add(group);
    return { group, flame, attackCooldown: 0, dashCooldown: 0, skillCooldown: 0, dashTimer: 0, facing: new THREE.Vector3(0,0,-1) };
  }

  createWisp() {
    const color = Math.random() < .55 ? 0x75ecff : 0xb989ff;
    const mesh = this.mesh(new THREE.SphereGeometry(rand(.055,.11), 7, 5), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: rand(.35,.8) }), 0, 0, 0, false, false);
    const angle = rand(0, Math.PI * 2);
    const radius = rand(4, 31);
    mesh.position.set(Math.cos(angle) * radius, rand(.4, 6), Math.sin(angle) * radius);
    this.effectRoot.add(mesh);
    this.wisps.push({ mesh, angle, radius, speed: rand(.08,.22), phase: rand(0, Math.PI*2), baseY: mesh.position.y });
  }

  startRun() {
    this.runId = (this.runId || 0) + 1;
    const activeRunId = this.runId;
    ui.title.classList.remove('visible');
    this.hideModal(ui.resultModal);
    this.hideModal(ui.pauseModal);
    this.createWorld(false);
    this.state = 'playing';
    this.previousState = 'playing';
    this.currentWave = 0;
    this.maxWaves = 10;
    this.waveActive = false;
    this.spawnRemaining = 0;
    this.spawnTotal = 0;
    this.spawnTimer = 0;
    this.coreMaxHp = 100;
    this.coreHp = 100;
    this.gold = 70;
    this.score = 0;
    this.kills = 0;
    this.summonCount = 0;
    this.luck = 0;
    this.maxRank = 1;
    this.killChain = 0;
    this.killChainTimer = 0;
    this.qualitySampleTime = 0;
    this.qualityFrames = 0;
    this.blessingHistory = [];
    this.mods = {
      goldMultiplier: 1,
      pickupRadius: 1.65,
      moveSpeed: 1,
      unitDamage: 1,
      unitCooldown: 1,
      heroDamage: 1,
      skillCooldown: 1,
      luckGain: 1,
      coreDamage: 1,
      summonDiscount: 0
    };
    this.player.group.position.set(0, 0, 6.2);
    this.player.attackCooldown = 0;
    this.player.dashCooldown = 0;
    this.player.skillCooldown = 0;
    this.showGameUI(true);
    ui.bossHealth.classList.add('hidden');
    ui.killChain.classList.add('hidden');
    ui.saveScore.disabled = false;
    ui.saveScore.textContent = '기록 저장';
    this.updateSynergies();
    this.updateUnitStrip();
    this.updateHUD();
    this.showMission('달빛 장터를 지켜라', '첫 도깨비가 무료로 강림합니다.', 'NIGHT 01 · FIRST SUMMON', 1450);
    window.setTimeout(() => {
      if (this.runId === activeRunId && this.state === 'playing' && this.units.length === 0) {
        this.summonUnit({ free: true, guaranteedRank: 2, starter: true });
      }
    }, 520);
    window.setTimeout(() => {
      if (this.runId === activeRunId && this.state === 'playing' && !this.waveActive && this.currentWave === 0) {
        this.showMission('사방의 요괴문 개방', '직접 뛰어 엽전을 줍고 수호대를 늘리세요.', 'WAVE 01 · AUTO START', 1350);
        this.startWave();
      }
    }, 2450);
  }

  returnToTitle() {
    this.state = 'title';
    this.showGameUI(false);
    ui.bossHealth.classList.add('hidden');
    ui.killChain.classList.add('hidden');
    this.createWorld(true);
    ui.title.classList.add('visible');
  }

  showGameUI(show) {
    [ui.hud, ui.synergyPanel, ui.luckMeter, ui.unitStrip, ui.joystick, ui.actionDock].forEach((element) => element.classList.toggle('hidden', !show));
  }

  getSummonCost() {
    return Math.max(18, 30 + Math.floor(this.summonCount / 4) * 5 - this.mods.summonDiscount);
  }

  summonUnit(options = {}) {
    if (this.state !== 'playing') return;
    const cost = options.free ? 0 : this.getSummonCost();
    if (this.gold < cost) { this.showToast(`엽전이 ${cost - this.gold}개 부족합니다.`); return; }

    let pad = this.unitPads.find((item) => !item.userData.occupied);
    if (!pad) {
      const weakest = [...this.units].sort((a, b) => a.rank - b.rank || a.createdAt - b.createdAt)[0];
      if (!weakest) return;
      pad = weakest.pad;
      this.removeUnit(weakest, true);
      this.showToast('진형이 가득 차 가장 약한 도깨비가 환생했습니다.');
    }

    this.gold -= cost;
    if (!options.free) this.summonCount += 1;
    const rank = options.guaranteedRank || this.rollSummonRank();
    const type = pick(UNIT_KEYS);
    const unit = this.createUnit(type, rank, pad, false);
    this.sound.summon(rank);
    this.haptic(rank >= 3 ? [24, 35, 45] : 22);
    this.spawnSummonEffect(pad.position, RANKS[rank - 1].color, rank);
    const prefix = options.starter ? '무료 강림 · ' : '';
    this.showCombo(`${prefix}${RANKS[rank - 1].name} ${UNIT_TYPES[type].name}!`, rank >= 3 || options.starter ? 1450 : 900);
    this.score += rank * 35;
    this.maxRank = Math.max(this.maxRank, rank);
    this.autoMerge(type, rank);
    this.updateSynergies();
    this.updateUnitStrip();
    this.updateHUD();
    return unit;
  }

  rollSummonRank() {
    if (this.luck >= 100) {
      this.luck = 0;
      return Math.random() < .12 ? 4 : 3;
    }
    const roll = Math.random();
    let rank = 1;
    if (roll < .018) rank = 4;
    else if (roll < .105) rank = 3;
    else if (roll < .29) rank = 2;

    if (rank === 1) this.luck = Math.min(100, this.luck + 11 * this.mods.luckGain * this.getSynergyLuckMultiplier());
    else if (rank === 2) this.luck = Math.min(100, this.luck + 5 * this.mods.luckGain * this.getSynergyLuckMultiplier());
    else this.luck = Math.max(0, this.luck - 16);
    return rank;
  }

  createUnit(type, rank, pad, showcase = false) {
    const model = this.createDokkaebiModel(type, rank);
    model.position.copy(pad.position);
    model.position.y = .3;
    model.rotation.y = -Math.atan2(pad.position.z, pad.position.x) + Math.PI / 2;
    this.dynamicRoot.add(model);
    pad.userData.occupied = true;
    pad.userData.rune.material.opacity = .65;
    pad.userData.rune.material.color.set(RANKS[rank - 1].color);
    const unit = {
      id: crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`,
      type, rank, pad, group: model, cooldown: rand(0, .5), createdAt: this.elapsed,
      showcase, shotCount: 0, streakTarget: null, streak: 0
    };
    this.units.push(unit);
    return unit;
  }

  createDokkaebiModel(type, rank) {
    const config = UNIT_TYPES[type];
    const rankConfig = RANKS[rank - 1];
    const group = new THREE.Group();
    const scale = 1 + (rank - 1) * .115;
    group.scale.setScalar(scale);

    const bodyMat = this.createMaterial(config.color, .63, .04, config.color, rank >= 4 ? .35 : .08);
    const darkMat = this.createMaterial(tempColor.set(config.color).multiplyScalar(.35).getHex(), .82);
    const faceMat = this.createMaterial(0xd8a17d, .72);
    const eyeMat = this.createMaterial(rankConfig.color, .25, .05, rankConfig.glow, 3.2);
    const rankMat = this.createMaterial(rankConfig.color, .34, .12, rankConfig.glow, rank >= 3 ? 2.2 : .7);

    const body = this.mesh(new THREE.SphereGeometry(.55, 11, 8), bodyMat, 0, 1.05, 0); body.scale.set(1, 1.22, .88);
    const head = this.mesh(new THREE.SphereGeometry(.42, 11, 8), faceMat, 0, 1.78, 0);
    const eye1 = this.mesh(new THREE.SphereGeometry(.055, 7, 5), eyeMat, -.15, 1.84, .385, false, false);
    const eye2 = eye1.clone(); eye2.position.x = .15;
    const horn1 = this.mesh(new THREE.ConeGeometry(.14 + rank * .012, .48 + rank * .07, 7), rankMat, -.28, 2.2, -.02);
    horn1.rotation.z = -.24;
    const horn2 = horn1.clone(); horn2.position.x = .28; horn2.rotation.z = .24;
    const foot1 = this.mesh(new THREE.SphereGeometry(.2, 8, 6), darkMat, -.27, .37, .05); foot1.scale.set(1, .7, 1.35);
    const foot2 = foot1.clone(); foot2.position.x = .27;
    group.add(body, head, eye1, eye2, horn1, horn2, foot1, foot2);

    if (type === 'ember') {
      const flame = this.mesh(new THREE.ConeGeometry(.24, .75, 9), rankMat, .72, 1.28, .02); flame.rotation.z = -.35;
      group.add(flame);
    } else if (type === 'frost') {
      const staff = this.mesh(new THREE.CylinderGeometry(.055,.07,1.55,7), darkMat, .6,1.2,.02); staff.rotation.z = -.18;
      const crystal = this.mesh(new THREE.OctahedronGeometry(.22), rankMat, .74,1.96,.02);
      group.add(staff, crystal);
    } else if (type === 'wind') {
      const hat = this.mesh(new THREE.ConeGeometry(.75,.48,12), darkMat, 0,2.15,0); hat.scale.y=.68;
      const bow = this.mesh(new THREE.TorusGeometry(.43,.045,7,18,Math.PI*1.35), rankMat, .55,1.25,.1); bow.rotation.z=-.72;
      group.add(hat,bow);
    } else if (type === 'stone') {
      const club = this.mesh(new THREE.CylinderGeometry(.2,.12,1.3,7), darkMat, .65,1.25,.02); club.rotation.z=-.65;
      const clubTop = this.mesh(new THREE.DodecahedronGeometry(.34,0), rankMat, .98,1.7,.02);
      group.add(club,clubTop);
    } else if (type === 'bell') {
      const hood = this.mesh(new THREE.ConeGeometry(.7,.85,10), darkMat, 0,2.15,0); hood.scale.y=.75;
      const bell = this.mesh(new THREE.CylinderGeometry(.26,.4,.5,9), rankMat, .68,1.23,.05); bell.rotation.z=-.25;
      group.add(hood,bell);
    } else if (type === 'thunder') {
      const helm = this.mesh(new THREE.CylinderGeometry(.52,.62,.38,8), darkMat, 0,2.05,0);
      const blade = this.mesh(new THREE.BoxGeometry(.14,1.45,.18), rankMat, .65,1.35,.04); blade.rotation.z=-.45;
      group.add(helm,blade);
    }

    if (rank >= 2) {
      const ring = this.mesh(new THREE.TorusGeometry(.72 + rank*.04,.035 + rank*.009,7,24), new THREE.MeshBasicMaterial({ color: rankConfig.color, transparent:true, opacity:.5, depthWrite:false }),0,.42,0,false,false);
      ring.rotation.x = Math.PI/2;
      group.add(ring);
      group.userData.aura = ring;
    }
    if (rank >= 4 && !this.lowPower) {
      const light = new THREE.PointLight(rankConfig.color, .85 + rank*.2, 5.5, 2);
      light.position.y = 1.5;
      group.add(light);
    }
    group.userData = { ...group.userData, body, type, rank, baseY: .3, phase: rand(0, Math.PI*2) };
    return group;
  }

  autoMerge(type, rank) {
    if (rank >= 5) return;
    const matching = this.units.filter((unit) => unit.type === type && unit.rank === rank && !unit.showcase);
    if (matching.length < 3) return;
    const chosen = matching.slice(0, 3);
    const targetPad = chosen[0].pad;
    const center = targetPad.position.clone();
    chosen.forEach((unit) => this.removeUnit(unit, false));
    const merged = this.createUnit(type, rank + 1, targetPad, false);
    this.maxRank = Math.max(this.maxRank, rank + 1);
    this.score += (rank + 1) * 170;
    this.sound.merge(rank + 1);
    this.haptic(rank + 1 >= 4 ? [30, 35, 55, 45, 80] : [25, 30, 45]);
    this.spawnMergeEffect(center, RANKS[rank].color, rank + 1);
    this.showCombo(`${rank + 1}★ 자동 합성!`, 1400);
    this.shake = Math.max(this.shake, .3 + rank * .08);
    this.updateSynergies();
    this.updateUnitStrip();
    const mergeRunId = this.runId;
    window.setTimeout(() => { if (this.runId === mergeRunId) this.autoMerge(type, rank + 1); }, 120);
    return merged;
  }

  removeUnit(unit, recycle = false) {
    const index = this.units.indexOf(unit);
    if (index >= 0) this.units.splice(index, 1);
    unit.pad.userData.occupied = false;
    unit.pad.userData.rune.material.opacity = .2;
    unit.pad.userData.rune.material.color.set(0x9a7bc1);
    this.dynamicRoot.remove(unit.group);
    unit.group.traverse((object) => {
      object.geometry?.dispose();
      if (object.material) {
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach((material) => material.dispose());
      }
    });
    if (recycle) {
      const refund = 6 + unit.rank * 5;
      this.gold += refund;
      this.spawnParticles(unit.pad.position.clone().add(new THREE.Vector3(0,1,0)), 0xffd36b, 10, 2.6);
    }
  }

  startWave() {
    if (this.state !== 'playing' || this.waveActive || this.currentWave >= this.maxWaves) return;
    this.currentWave += 1;
    this.waveActive = true;
    this.waveStartHp = this.coreHp;
    const bossWave = this.currentWave === 5 || this.currentWave === 10;
    this.spawnRemaining = bossWave ? (this.currentWave === 5 ? 15 : 22) : 7 + this.currentWave * 3;
    this.spawnTotal = this.spawnRemaining;
    this.spawnTimer = .2;
    this.waveSpawned = 0;
    ui.wave.disabled = true;
    if (bossWave) {
      const bossType = this.currentWave === 5 ? 'tiger' : 'king';
      ui.bossName.textContent = ENEMY_TYPES[bossType].name;
      ui.boss.classList.remove('hidden');
      requestAnimationFrame(() => ui.boss.classList.add('show'));
      this.sound.boss();
      this.haptic([45, 40, 70]);
      window.setTimeout(() => ui.boss.classList.remove('show'), 1900);
      window.setTimeout(() => ui.boss.classList.add('hidden'), 2350);
    }
    this.showToast(`웨이브 ${this.currentWave} 시작! 사방의 요괴문을 확인하세요.`);
    this.updateHUD();
  }

  spawnEnemy() {
    let type = 'imp';
    const wave = this.currentWave;
    const progress = this.waveSpawned / Math.max(1, this.spawnTotal);
    if (wave === 5 && this.spawnRemaining === 1) type = 'tiger';
    else if (wave === 10 && this.spawnRemaining === 1) type = 'king';
    else {
      const roll = Math.random();
      if (wave >= 7 && roll < .22) type = 'shaman';
      else if (wave >= 4 && roll < .43) type = 'brute';
      else if (wave >= 2 && roll < .68) type = 'runner';
    }
    const gate = this.gates[(this.waveSpawned + Math.floor(Math.random() * 2)) % this.gates.length];
    const spawnPos = gate.position.clone();
    const perpendicular = new THREE.Vector3(-spawnPos.z, 0, spawnPos.x).normalize().multiplyScalar(rand(-2.2,2.2));
    spawnPos.add(perpendicular).multiplyScalar(.96);
    const enemy = this.createEnemy(type, spawnPos, progress);
    this.enemies.push(enemy);
    if (enemy.boss) {
      this.showMission(ENEMY_TYPES[type].name, '강력한 우두머리가 신목으로 돌진합니다.', 'BOSS HAS ENTERED', 1550);
      this.haptic([70, 45, 100]);
      this.updateBossHUD();
    }
    this.spawnRemaining -= 1;
    this.waveSpawned += 1;
  }

  createEnemy(type, position, progress = 0) {
    const config = ENEMY_TYPES[type];
    const waveScale = 1 + (this.currentWave - 1) * .19 + progress * .08;
    const group = this.createEnemyModel(type, config);
    group.position.copy(position);
    this.dynamicRoot.add(group);
    const hp = config.hp * waveScale;
    return {
      type, group, hp, maxHp: hp, speed: config.speed * (1 + Math.min(.22, this.currentWave * .012)),
      damage: config.damage * (1 + (this.currentWave - 1) * .1), reward: config.reward,
      slowTimer: 0, slowFactor: 1, attackTimer: 0, phase: rand(0, Math.PI*2), dead: false,
      boss: !!config.boss, specialTimer: config.boss ? 4.5 : 0, flash: 0
    };
  }

  createEnemyModel(type, config) {
    const group = new THREE.Group();
    const bodyMat = this.createMaterial(config.color, .72, .04, config.color, config.boss ? .24 : 0);
    const darkMat = this.createMaterial(tempColor.set(config.color).multiplyScalar(.32).getHex(), .82);
    const eyeMat = this.createMaterial(0xffe06f, .2, 0, 0xffa42d, 2.8);
    const scale = config.scale;
    const body = this.mesh(new THREE.SphereGeometry(.55 * scale, 11, 8), bodyMat, 0, .95 * scale, 0);
    body.scale.set(1, 1.17, .88);
    const head = this.mesh(new THREE.SphereGeometry(.4 * scale, 10, 8), bodyMat, 0, 1.63 * scale, 0);
    const eye1 = this.mesh(new THREE.SphereGeometry(.065 * scale, 6, 5), eyeMat, -.15*scale,1.7*scale,.365*scale,false,false);
    const eye2 = eye1.clone(); eye2.position.x = .15 * scale;
    const horn1 = this.mesh(new THREE.ConeGeometry(.13*scale,.48*scale,6), darkMat,-.27*scale,2.03*scale,0);
    horn1.rotation.z=-.28;
    const horn2=horn1.clone(); horn2.position.x=.27*scale; horn2.rotation.z=.28;
    group.add(body,head,eye1,eye2,horn1,horn2);
    if (type === 'runner') {
      const leg1=this.mesh(new THREE.CylinderGeometry(.08,.1,.65,6),darkMat,-.22,.34,0); leg1.rotation.z=.15;
      const leg2=leg1.clone();leg2.position.x=.22;leg2.rotation.z=-.15; group.add(leg1,leg2);
    }
    if (type === 'brute') {
      const armor=this.mesh(new THREE.DodecahedronGeometry(.67*scale,0),darkMat,0,1.02*scale,0);armor.scale.set(1.2,.8,.85);group.add(armor);
    }
    if (type === 'shaman') {
      const staff=this.mesh(new THREE.CylinderGeometry(.07,.09,1.8,7),darkMat,.63,1.15,0);staff.rotation.z=-.15;
      const gem=this.mesh(new THREE.OctahedronGeometry(.22),eyeMat,.77,2.03,0);group.add(staff,gem);
    }
    if (config.boss) {
      const mane=this.mesh(new THREE.TorusGeometry(.55*scale,.18*scale,8,18),darkMat,0,1.52*scale,-.08);mane.rotation.x=Math.PI/2;group.add(mane);
      const crown=this.mesh(new THREE.ConeGeometry(.72*scale,.65*scale,7),eyeMat,0,2.42*scale,0);group.add(crown);
      if (!this.lowPower) { const light=new THREE.PointLight(config.color,1.3,8,2);light.position.y=1.6*scale;group.add(light); }
    }
    group.userData={body,baseColor:config.color,scale,phase:rand(0,Math.PI*2)};
    return group;
  }

  updateWave(dt) {
    if (!this.waveActive) return;
    if (this.spawnRemaining > 0) {
      this.spawnTimer -= dt;
      if (this.spawnTimer <= 0) {
        this.spawnEnemy();
        const base = this.currentWave >= 8 ? .42 : .62;
        this.spawnTimer = base + Math.random() * .26;
      }
    } else if (this.enemies.length === 0) {
      this.completeWave();
    }
  }

  completeWave() {
    this.waveActive = false;
    const perfectBonus = this.coreHp >= this.waveStartHp - .01 ? 10 + this.currentWave * 2 : 0;
    const reward = 24 + this.currentWave * 7 + perfectBonus;
    this.gold += reward;
    this.score += this.currentWave * 250 + Math.round(this.coreHp * 8);
    this.showCombo(`웨이브 ${this.currentWave} 격파 · +${reward} 엽전${perfectBonus ? ' · 무결점!' : ''}`, 1600);
    if (perfectBonus) {
      this.score += perfectBonus * 25;
      this.haptic([18, 24, 42]);
    }
    if (this.currentWave >= this.maxWaves) {
      window.setTimeout(() => this.finishRun(true), 900);
      return;
    }
    if (this.currentWave % 3 === 0) {
      window.setTimeout(() => this.offerBlessing(), 700);
    } else {
      ui.wave.disabled = false;
      ui.waveText.textContent = `${this.currentWave + 1}`;
      this.showToast('전열을 정비하고 다음 습격을 시작하세요.');
    }
    this.updateHUD();
  }

  offerBlessing() {
    if (this.state !== 'playing') return;
    this.previousState = this.state;
    this.state = 'blessing';
    const available = BLESSINGS.filter((item) => !this.blessingHistory.includes(item.id));
    const pool = available.length >= 3 ? available : BLESSINGS;
    const options = [...pool].sort(() => Math.random() - .5).slice(0, 3);
    ui.blessingOptions.innerHTML = options.map((blessing) => `
      <button class="blessing-option" data-blessing="${blessing.id}"><span>${blessing.icon}</span><b>${blessing.name}</b><p>${blessing.desc}</p><small>${blessing.tag}</small></button>
    `).join('');
    ui.blessingOptions.querySelectorAll('[data-blessing]').forEach((button) => {
      button.addEventListener('click', () => this.selectBlessing(button.dataset.blessing), { once: true });
    });
    this.showModal(ui.blessingModal);
  }

  selectBlessing(id) {
    const blessing = BLESSINGS.find((item) => item.id === id);
    if (!blessing) return;
    blessing.apply(this);
    this.blessingHistory.push(id);
    this.hideModal(ui.blessingModal);
    this.state = 'playing';
    ui.wave.disabled = false;
    ui.waveText.textContent = `${this.currentWave + 1}`;
    this.sound.merge(2);
    this.showCombo(`${blessing.icon} ${blessing.name}`, 1500);
    this.updateHUD();
  }

  updatePlayer(dt) {
    if (!this.player) return;
    let x = this.input.x;
    let y = this.input.y;
    if (this.input.keys.has('KeyA') || this.input.keys.has('ArrowLeft')) x -= 1;
    if (this.input.keys.has('KeyD') || this.input.keys.has('ArrowRight')) x += 1;
    if (this.input.keys.has('KeyW') || this.input.keys.has('ArrowUp')) y -= 1;
    if (this.input.keys.has('KeyS') || this.input.keys.has('ArrowDown')) y += 1;
    const length = Math.hypot(x, y);
    const move = tempV.set(0,0,0);
    if (length > .05) {
      x /= Math.max(1,length); y /= Math.max(1,length);
      const forward = tempV2.set(-Math.sin(this.cameraYaw),0,-Math.cos(this.cameraYaw));
      const right = new THREE.Vector3(forward.z,0,-forward.x);
      move.addScaledVector(right,x).addScaledVector(forward,-y).normalize();
      this.player.facing.lerp(move,.22).normalize();
      const speed = 5.25 * this.mods.moveSpeed * (this.player.dashTimer > 0 ? 2.5 : 1);
      this.player.group.position.addScaledVector(move,speed*dt);
      const radius = this.player.group.position.length();
      if (radius > 25.5) this.player.group.position.multiplyScalar(25.5/radius);
      const targetRot = Math.atan2(move.x,move.z);
      this.player.group.rotation.y = this.lerpAngle(this.player.group.rotation.y,targetRot,1-Math.pow(.001,dt));
    }
    this.player.dashTimer = Math.max(0,this.player.dashTimer-dt);
    this.player.dashCooldown = Math.max(0,this.player.dashCooldown-dt);
    this.player.skillCooldown = Math.max(0,this.player.skillCooldown-dt);
    this.player.attackCooldown -= dt;

    const bob = Math.sin(this.elapsed * (length > .05 ? 11 : 4)) * (length > .05 ? .09 : .04);
    this.player.group.position.y = bob;
    this.player.flame.position.y = 1.25 + Math.sin(this.elapsed*7)*.12;
    this.player.flame.scale.setScalar(1 + Math.sin(this.elapsed*9)*.14);

    if (this.player.attackCooldown <= 0) {
      const target = this.findNearestEnemy(this.player.group.position,8.8);
      if (target) {
        this.player.attackCooldown = .54;
        const origin = this.player.group.position.clone().add(new THREE.Vector3(.55,1.35,0));
        const damage = (13 + this.currentWave*1.2) * this.mods.heroDamage * this.getThunderHeroMultiplier();
        this.fireProjectile({ kind:'hero', type:'hero', origin, target, damage, speed:20, color:0x69edff, radius:.16 });
        this.sound.shoot('hero');
      }
    }
  }

  useDash() {
    if (this.state !== 'playing' || this.player.dashCooldown > 0) return;
    this.player.dashCooldown = 4.2;
    this.player.dashTimer = .34;
    const direction = this.player.facing.clone();
    if (direction.lengthSq() < .1) direction.set(0,0,-1);
    this.player.group.position.addScaledVector(direction,1.1);
    this.spawnParticles(this.player.group.position.clone().add(new THREE.Vector3(0,.7,0)),0x8cecff,16,4.5);
    this.shake = Math.max(this.shake,.13);
    this.sound.tone(260,.12,'sawtooth',.025,520);
    this.haptic(14);
  }

  useHeroSkill() {
    if (this.state !== 'playing' || this.player.skillCooldown > 0) return;
    this.player.skillCooldown = 13 * this.mods.skillCooldown;
    this.sound.skill();
    this.haptic([25, 25, 65]);
    const center = this.player.group.position.clone();
    const damage = (72 + this.currentWave*10) * this.mods.heroDamage;
    this.spawnSkillEffect(center);
    this.enemies.slice().forEach((enemy) => {
      const distance = enemy.group.position.distanceTo(center);
      if (distance <= 8.2) this.damageEnemy(enemy,damage*(1-distance/13),'skill');
    });
    this.shake = Math.max(this.shake,.6);
    this.showCombo('도깨비불 난무!',1000);
  }

  updateUnits(dt) {
    const cooldownMult = this.mods.unitCooldown * this.getWindCooldownMultiplier();
    this.units.forEach((unit) => {
      const config = UNIT_TYPES[unit.type];
      unit.cooldown -= dt;
      const phase = unit.group.userData.phase;
      unit.group.position.y = .3 + Math.sin(this.elapsed*3.5+phase)*.06;
      unit.group.rotation.z = Math.sin(this.elapsed*2.1+phase)*.02;
      if (unit.group.userData.aura) unit.group.userData.aura.rotation.z += dt*(.7+unit.rank*.16);
      if (unit.showcase || this.state !== 'playing') return;
      if (unit.cooldown <= 0) {
        let target;
        if (unit.type === 'wind') target = this.findFarthestEnemyInRange(unit.group.position,config.range);
        else target = this.findNearestEnemy(unit.group.position,config.range);
        if (!target) return;
        const stats = this.getUnitStats(unit);
        unit.cooldown = stats.cooldown * cooldownMult;
        const direction = target.group.position.clone().sub(unit.group.position);
        const targetRot = Math.atan2(direction.x,direction.z);
        unit.group.rotation.y = this.lerpAngle(unit.group.rotation.y,targetRot,.65);
        const origin = unit.group.position.clone().add(new THREE.Vector3(0,1.55,0));
        this.fireProjectile({
          kind:'unit', type:unit.type, origin, target, damage:stats.damage, speed:config.projectileSpeed,
          color:config.color, radius:.11+unit.rank*.025, splash:config.splash ? config.splash*(1+unit.rank*.04):0,
          slow:config.slow ? config.slow+unit.rank*.12:0, chain:config.chain ? config.chain+Math.floor(unit.rank/3):0,
          pierce:config.pierce ? config.pierce+Math.floor(unit.rank/3):0, execute:config.execute || 0, owner:unit
        });
        this.sound.shoot(unit.type);
      }
    });
  }

  getUnitStats(unit) {
    const config = UNIT_TYPES[unit.type];
    const rank = RANKS[unit.rank-1];
    return { damage:config.damage*rank.mult*this.mods.unitDamage*this.getFireDamageMultiplier(), cooldown:config.cooldown };
  }

  fireProjectile(data) {
    const geometry = data.type === 'stone' ? new THREE.DodecahedronGeometry(data.radius*1.55,0) : data.type === 'wind' ? new THREE.ConeGeometry(data.radius*.65,data.radius*3.4,7) : new THREE.SphereGeometry(data.radius,8,6);
    const material = new THREE.MeshBasicMaterial({ color:data.color, transparent:true, opacity:.95 });
    const mesh = this.mesh(geometry,material,data.origin.x,data.origin.y,data.origin.z,false,false);
    if (data.type === 'wind') mesh.rotation.x = Math.PI/2;
    this.effectRoot.add(mesh);
    this.projectiles.push({ ...data, mesh, alive:true, hitTargets:new Set(), life:3.2 });
  }

  updateProjectiles(dt) {
    for (let i=this.projectiles.length-1;i>=0;i-=1) {
      const projectile=this.projectiles[i];
      projectile.life-=dt;
      if (!projectile.alive || projectile.life<=0 || !projectile.target || projectile.target.dead) {
        this.removeProjectile(projectile,i); continue;
      }
      const targetPos=projectile.target.group.position.clone().add(new THREE.Vector3(0,.9,0));
      const direction=targetPos.sub(projectile.mesh.position);
      const distance=direction.length();
      const step=projectile.speed*dt;
      if (distance<=step+.22) {
        this.resolveProjectileHit(projectile,projectile.target);
        if (projectile.pierce>0 && projectile.hitTargets.size<=projectile.pierce) {
          const next=this.findNearestEnemy(projectile.mesh.position,4.5,projectile.hitTargets);
          if (next) { projectile.target=next; continue; }
        }
        this.removeProjectile(projectile,i);
      } else {
        direction.normalize();
        projectile.mesh.position.addScaledVector(direction,step);
        projectile.mesh.lookAt(targetPos.add(direction));
        if (Math.random()<dt*15) this.spawnTinyParticle(projectile.mesh.position,projectile.color);
      }
    }
  }

  resolveProjectileHit(projectile,target) {
    if (!target || target.dead) return;
    projectile.hitTargets.add(target);
    let damage=projectile.damage;
    if (projectile.type==='ember' && projectile.owner) {
      if (projectile.owner.streakTarget===target) projectile.owner.streak=Math.min(6,projectile.owner.streak+1);
      else { projectile.owner.streakTarget=target;projectile.owner.streak=0; }
      damage*=1+projectile.owner.streak*.07;
    }
    if (projectile.execute && target.hp/target.maxHp<projectile.execute && !target.boss) damage=target.hp+1;
    this.damageEnemy(target,damage,projectile.type);
    if (projectile.slow) { target.slowTimer=Math.max(target.slowTimer,projectile.slow);target.slowFactor=.58; }
    if (projectile.splash) {
      this.enemies.slice().forEach((enemy)=>{
        if (enemy!==target && !enemy.dead && enemy.group.position.distanceTo(target.group.position)<=projectile.splash) this.damageEnemy(enemy,damage*.55,projectile.type);
      });
      this.spawnRing(target.group.position,projectile.color,projectile.splash);
    }
    if (projectile.chain) this.chainDamage(target,damage*.62,projectile.chain,projectile.color,new Set([target]));
    this.spawnParticles(target.group.position.clone().add(new THREE.Vector3(0,.8,0)),projectile.color,projectile.type==='stone'?10:5,projectile.type==='stone'?3.8:2.3);
  }

  chainDamage(source,damage,remaining,color,visited) {
    if (remaining<=0) return;
    const next=this.enemies.filter((enemy)=>!enemy.dead&&!visited.has(enemy)&&enemy.group.position.distanceTo(source.group.position)<4.2).sort((a,b)=>a.group.position.distanceTo(source.group.position)-b.group.position.distanceTo(source.group.position))[0];
    if (!next) return;
    visited.add(next);
    this.createLightningLine(source.group.position.clone().add(new THREE.Vector3(0,.8,0)),next.group.position.clone().add(new THREE.Vector3(0,.8,0)),color);
    this.damageEnemy(next,damage,'bell');
    this.chainDamage(next,damage*.78,remaining-1,color,visited);
  }

  removeProjectile(projectile,index=this.projectiles.indexOf(projectile)) {
    projectile.alive=false;
    if (index>=0) this.projectiles.splice(index,1);
    this.effectRoot.remove(projectile.mesh);
    projectile.mesh.geometry.dispose();projectile.mesh.material.dispose();
  }

  findNearestEnemy(position,range,exclude=new Set()) {
    let best=null;let bestDistance=range;
    this.enemies.forEach((enemy)=>{
      if (enemy.dead||exclude.has(enemy)) return;
      const distance=enemy.group.position.distanceTo(position);
      if (distance<bestDistance) { best=enemy;bestDistance=distance; }
    });
    return best;
  }

  findFarthestEnemyInRange(position,range) {
    let best=null;let bestDistance=0;
    this.enemies.forEach((enemy)=>{
      if (enemy.dead) return;
      const distance=enemy.group.position.distanceTo(position);
      if (distance<=range && distance>bestDistance) { best=enemy;bestDistance=distance; }
    });
    return best;
  }

  updateEnemies(dt) {
    for (let i=this.enemies.length-1;i>=0;i-=1) {
      const enemy=this.enemies[i];
      if (enemy.dead) continue;
      enemy.slowTimer=Math.max(0,enemy.slowTimer-dt);
      if (enemy.slowTimer<=0) enemy.slowFactor=lerp(enemy.slowFactor,1,dt*5);
      enemy.flash=Math.max(0,enemy.flash-dt);
      if (enemy.flash<=0) enemy.group.userData.body.material.emissiveIntensity=enemy.boss?.24:0;
      const position=enemy.group.position;
      const distance=position.length();
      if (distance>2.2) {
        const direction=tempV.set(-position.x,0,-position.z).normalize();
        let speed=enemy.speed*enemy.slowFactor;
        if (enemy.boss && enemy.specialTimer<.7) speed*=1.7;
        position.addScaledVector(direction,speed*dt);
        enemy.group.rotation.y=this.lerpAngle(enemy.group.rotation.y,Math.atan2(direction.x,direction.z),1-Math.pow(.002,dt));
        enemy.group.position.y=Math.sin(this.elapsed*(enemy.boss?4:7)+enemy.phase)*(.04*enemy.group.userData.scale);
      } else {
        enemy.attackTimer-=dt;
        if (enemy.attackTimer<=0) { enemy.attackTimer=enemy.boss?1.45:1;this.damageCore(enemy.damage); }
      }
      enemy.group.rotation.z=Math.sin(this.elapsed*5+enemy.phase)*.035;
      if (enemy.boss) {
        enemy.specialTimer-=dt;
        if (enemy.specialTimer<=0) {
          enemy.specialTimer=rand(4.3,6.1);
          this.bossRoar(enemy);
        }
      }
    }
  }

  bossRoar(enemy) {
    const pos=enemy.group.position.clone();
    this.spawnRing(pos,ENEMY_TYPES[enemy.type].color,5.5);
    this.spawnParticles(pos.clone().add(new THREE.Vector3(0,1.8,0)),ENEMY_TYPES[enemy.type].color,22,5.2);
    this.shake=Math.max(this.shake,.45);
    this.sound.boss();
    if (pos.distanceTo(this.player.group.position)<6) this.player.group.position.add(this.player.group.position.clone().sub(pos).normalize().multiplyScalar(2.2));
  }

  damageEnemy(enemy,amount,source='') {
    if (!enemy || enemy.dead) return;
    const critChance = source === 'hero' ? .12 : source === 'thunder' ? .18 : source === 'wind' ? .08 : .035;
    const crit = source !== 'skill' && Math.random() < critChance;
    if (crit) amount *= 1.75;
    enemy.hp-=amount;
    enemy.flash=.09;
    enemy.group.userData.body.material.emissive.set(0xffffff);
    enemy.group.userData.body.material.emissiveIntensity=1.6;
    this.showCombatText(enemy.group.position.clone().add(new THREE.Vector3(0, enemy.boss ? 3.1 : 1.8, 0)), amount, { crit });
    if (crit) this.haptic(10);
    this.sound.hit();
    if (enemy.hp<=0) this.killEnemy(enemy,source);
  }

  killEnemy(enemy,source) {
    if (enemy.dead) return;
    enemy.dead=true;
    const index=this.enemies.indexOf(enemy);
    if (index>=0) this.enemies.splice(index,1);
    this.dynamicRoot.remove(enemy.group);
    const color=ENEMY_TYPES[enemy.type].color;
    this.spawnParticles(enemy.group.position.clone().add(new THREE.Vector3(0,.8,0)),color,enemy.boss?35:12,enemy.boss?6:3.4);
    const reward=Math.max(2,Math.round(enemy.reward*this.mods.goldMultiplier*this.getSpiritGoldMultiplier()));
    this.dropCoins(enemy.group.position,reward,enemy.boss?9:Math.min(4,1+Math.floor(reward/7)));
    this.kills+=1;
    this.killChain = this.killChainTimer > 0 ? this.killChain + 1 : 1;
    this.killChainTimer = 1.85;
    const chainMultiplier = 1 + Math.min(.6, Math.max(0, this.killChain - 1) * .018);
    this.score+=Math.round(enemy.maxHp*(enemy.boss?3:1)*chainMultiplier);
    if (this.killChain >= 2) {
      ui.killChain.classList.remove('hidden');
      ui.killChainValue.textContent = `x${this.killChain}`;
      ui.killChainBonus.textContent = `점수 +${Math.round((chainMultiplier - 1) * 100)}%`;
    }
    if (this.killChain > 0 && this.killChain % 10 === 0) {
      const chainGold = 8 + Math.floor(this.killChain / 10) * 5;
      this.gold += chainGold;
      this.showCombo(`${this.killChain} 연속 처치 · +${chainGold} 엽전`, 1200);
      this.haptic([18, 22, 35]);
    }
    if (enemy.boss) {
      this.showCombo(`${ENEMY_TYPES[enemy.type].name} 격파!`,1800);
      this.shake=.85;
      this.haptic([65, 35, 85, 40, 120]);
      ui.bossHealth.classList.add('hidden');
    }
    enemy.group.traverse((object)=>{object.geometry?.dispose();if(object.material){const mats=Array.isArray(object.material)?object.material:[object.material];mats.forEach((m)=>m.dispose());}});
  }

  damageCore(amount) {
    const reduced=amount*this.mods.coreDamage*this.getMountainDamageMultiplier();
    this.coreHp=Math.max(0,this.coreHp-reduced);
    this.showCombatText(new THREE.Vector3(0, 5.8, 0), reduced, { label: `-${Math.ceil(reduced)}` });
    this.core.userData.hitPulse=.35;
    ui.damageFlash.classList.add('show');
    window.setTimeout(()=>ui.damageFlash.classList.remove('show'),100);
    this.shake=Math.max(this.shake,.25);
    this.haptic([25, 25, 35]);
    this.spawnParticles(new THREE.Vector3(0,4.7,1),0xff6688,10,3.5);
    if (this.coreHp<=0) this.finishRun(false);
    this.updateHUD();
  }

  dropCoins(position,total,count) {
    const each=Math.max(1,Math.round(total/count));
    for (let i=0;i<count;i+=1) {
      const mesh=this.mesh(new THREE.CylinderGeometry(.18,.18,.07,12),new THREE.MeshStandardMaterial({color:0xffd25e,emissive:0xd57c1d,emissiveIntensity:1.4,metalness:.45,roughness:.3}),position.x,position.y+.55,position.z,false,false);
      mesh.rotation.x=Math.PI/2;
      const velocity=new THREE.Vector3(rand(-2.3,2.3),rand(2.6,4.8),rand(-2.3,2.3));
      this.effectRoot.add(mesh);
      this.coins.push({mesh,value:i===count-1?Math.max(1,total-each*(count-1)):each,velocity,age:0,grounded:false,phase:rand(0,Math.PI*2)});
    }
  }

  updateCoins(dt) {
    for (let i=this.coins.length-1;i>=0;i-=1) {
      const coin=this.coins[i];coin.age+=dt;
      if (!coin.grounded) {
        coin.velocity.y-=10*dt;
        coin.mesh.position.addScaledVector(coin.velocity,dt);
        if (coin.mesh.position.y<=.25) {coin.mesh.position.y=.25;coin.velocity.set(0,0,0);coin.grounded=true;}
      } else {
        coin.mesh.position.y=.29+Math.sin(this.elapsed*5+coin.phase)*.08;
        coin.mesh.rotation.z+=dt*4;
      }
      const distance=coin.mesh.position.distanceTo(this.player.group.position);
      const pickup=this.mods.pickupRadius;
      if (distance<pickup+2.2 && coin.grounded) {
        const attraction=clamp((pickup+2.2-distance)/2.2,0,1);
        coin.mesh.position.lerp(this.player.group.position.clone().add(new THREE.Vector3(0,1,0)),dt*(5+attraction*12));
      }
      if (distance<pickup) {
        this.gold+=coin.value;
        this.score+=coin.value*2;
        this.sound.coin();
        this.spawnTinyParticle(coin.mesh.position,0xffd36b);
        this.effectRoot.remove(coin.mesh);coin.mesh.geometry.dispose();coin.mesh.material.dispose();this.coins.splice(i,1);
      } else if (coin.age>22) {
        this.effectRoot.remove(coin.mesh);coin.mesh.geometry.dispose();coin.mesh.material.dispose();this.coins.splice(i,1);
      }
    }
  }

  updateWorldEffects(dt) {
    this.wisps.forEach((wisp)=>{
      wisp.angle+=dt*wisp.speed;
      wisp.mesh.position.x=Math.cos(wisp.angle)*wisp.radius;
      wisp.mesh.position.z=Math.sin(wisp.angle)*wisp.radius;
      wisp.mesh.position.y=wisp.baseY+Math.sin(this.elapsed*1.8+wisp.phase)*.55;
      wisp.mesh.material.opacity=.3+(Math.sin(this.elapsed*2.7+wisp.phase)+1)*.23;
    });
    this.gates.forEach((gate,index)=>{
      gate.userData.rune.rotation.z+=dt*(index%2?.3:-.3);
      gate.userData.portal.material.opacity=.14+(Math.sin(this.elapsed*2+index)+1)*.06;
    });
    if (this.core) {
      this.core.userData.orb.scale.setScalar(1+Math.sin(this.elapsed*3)*.11+this.core.userData.hitPulse*.65);
      this.core.userData.hitPulse=Math.max(0,this.core.userData.hitPulse-dt*2.8);
    }
  }

  spawnParticles(position,color,count=8,speed=3) {
    const actual=this.lowPower?Math.ceil(count*.58):count;
    for (let i=0;i<actual;i+=1) {
      const size=rand(.045,.13);
      const mesh=this.mesh(new THREE.TetrahedronGeometry(size,0),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.95}),position.x+rand(-.25,.25),position.y+rand(-.2,.25),position.z+rand(-.25,.25),false,false);
      const velocity=new THREE.Vector3(rand(-1,1),rand(.1,1.25),rand(-1,1)).normalize().multiplyScalar(rand(speed*.45,speed));
      this.effectRoot.add(mesh);
      this.particles.push({mesh,velocity,life:rand(.35,.85),maxLife:1,gravity:rand(1.5,5)});
    }
  }

  spawnTinyParticle(position,color) {
    if (this.particles.length>(this.lowPower?90:180)) return;
    const mesh=this.mesh(new THREE.SphereGeometry(.035,5,4),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.7}),position.x,position.y,position.z,false,false);
    this.effectRoot.add(mesh);
    this.particles.push({mesh,velocity:new THREE.Vector3(rand(-.3,.3),rand(.1,.7),rand(-.3,.3)),life:.25,maxLife:.25,gravity:0});
  }

  updateParticles(dt) {
    for (let i=this.particles.length-1;i>=0;i-=1) {
      const particle=this.particles[i];
      particle.life-=dt;particle.velocity.y-=particle.gravity*dt;particle.mesh.position.addScaledVector(particle.velocity,dt);
      particle.mesh.material.opacity=clamp(particle.life/particle.maxLife,0,1);
      particle.mesh.scale.multiplyScalar(Math.max(.92,1-dt*1.7));
      if (particle.life<=0) {this.effectRoot.remove(particle.mesh);particle.mesh.geometry.dispose();particle.mesh.material.dispose();this.particles.splice(i,1);}
    }
  }

  spawnRing(position,color,radius) {
    const mesh=this.mesh(new THREE.RingGeometry(.5,.62,32),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.7,side:THREE.DoubleSide,depthWrite:false}),position.x,.09,position.z,false,false);
    mesh.rotation.x=-Math.PI/2;
    this.effectRoot.add(mesh);
    const start=this.elapsed;
    const animate=()=>{
      const t=(this.elapsed-start)/.42;
      if(t>=1){this.effectRoot.remove(mesh);mesh.geometry.dispose();mesh.material.dispose();return;}
      mesh.scale.setScalar(lerp(.3,radius,t));mesh.material.opacity=(1-t)*.65;requestAnimationFrame(animate);
    };animate();
  }

  spawnSummonEffect(position,color,rank) {
    this.spawnRing(position,color,2.2+rank*.25);
    this.spawnParticles(position.clone().add(new THREE.Vector3(0,1,0)),color,14+rank*4,3.5+rank*.45);
    const beam=this.mesh(new THREE.CylinderGeometry(.18,.55,5.5,12,1,true),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.32,side:THREE.DoubleSide,depthWrite:false}),position.x,2.8,position.z,false,false);
    this.effectRoot.add(beam);
    const start=this.elapsed;
    const animate=()=>{const t=(this.elapsed-start)/.45;if(t>=1){this.effectRoot.remove(beam);beam.geometry.dispose();beam.material.dispose();return;}beam.scale.x=beam.scale.z=1+t*.9;beam.material.opacity=(1-t)*.32;requestAnimationFrame(animate);};animate();
  }

  spawnMergeEffect(position,color,rank) {
    for(let i=0;i<3;i+=1)setTimeout(()=>this.spawnRing(position,color,2.4+i*.9),i*90);
    this.spawnParticles(position.clone().add(new THREE.Vector3(0,1.2,0)),color,24+rank*5,5.5);
  }

  spawnSkillEffect(position) {
    const color=0x6befff;
    for(let i=0;i<4;i+=1)setTimeout(()=>this.spawnRing(position,color,3+i*1.75),i*70);
    for(let i=0;i<18;i+=1){
      const angle=i/18*Math.PI*2;
      const start=position.clone().add(new THREE.Vector3(Math.cos(angle)*.5,1,Math.sin(angle)*.5));
      const end=position.clone().add(new THREE.Vector3(Math.cos(angle)*7,rand(.3,2),Math.sin(angle)*7));
      this.createLightningLine(start,end,color);
    }
    this.spawnParticles(position.clone().add(new THREE.Vector3(0,1,0)),color,36,7);
  }

  createLightningLine(start,end,color) {
    const points=[start.clone()];
    for(let i=1;i<5;i+=1){const t=i/5;points.push(start.clone().lerp(end,t).add(new THREE.Vector3(rand(-.25,.25),rand(-.2,.3),rand(-.25,.25))));}
    points.push(end.clone());
    const geometry=new THREE.BufferGeometry().setFromPoints(points);
    const material=new THREE.LineBasicMaterial({color,transparent:true,opacity:.9});
    const line=new THREE.Line(geometry,material);this.effectRoot.add(line);
    const born=this.elapsed;
    const fade=()=>{const t=(this.elapsed-born)/.16;if(t>=1){this.effectRoot.remove(line);geometry.dispose();material.dispose();return;}material.opacity=1-t;requestAnimationFrame(fade);};fade();
  }

  lerpAngle(a,b,t) { let diff=(b-a+Math.PI)%(Math.PI*2)-Math.PI;if(diff<-Math.PI)diff+=Math.PI*2;return a+diff*t; }

  updateCamera(dt) {
    if (!this.player) return;
    const target=this.player.group.position.clone().add(new THREE.Vector3(0,1.35,0));
    const horizontal=Math.cos(this.cameraPitch)*this.cameraDistance;
    const desired=new THREE.Vector3(
      target.x+Math.sin(this.cameraYaw)*horizontal,
      target.y+Math.sin(this.cameraPitch)*this.cameraDistance,
      target.z+Math.cos(this.cameraYaw)*horizontal
    );
    this.camera.position.lerp(desired,1-Math.pow(.0007,dt));
    const shakeAmount=this.shake*this.shake;
    if(shakeAmount>.001)this.camera.position.add(new THREE.Vector3(rand(-shakeAmount,shakeAmount),rand(-shakeAmount,shakeAmount),rand(-shakeAmount,shakeAmount)));
    this.shake=Math.max(0,this.shake-dt*1.9);
    this.camera.lookAt(target);
  }

  updateSynergies() {
    const counts={};
    this.units.filter((unit)=>!unit.showcase).forEach((unit)=>{const element=UNIT_TYPES[unit.type].element;counts[element]=(counts[element]||0)+1;});
    this.synergyCounts=counts;
    let active=0;
    ui.synergyList.innerHTML=SYNERGIES.map((synergy)=>{
      const count=counts[synergy.element]||0;
      const tier=count>=synergy.thresholds[1]?2:count>=synergy.thresholds[0]?1:0;
      if(tier)active+=1;
      const next=tier===2?'MAX':`${count}/${synergy.thresholds[tier]}`;
      const value=tier?synergy.values[tier-1]:synergy.values[0];
      return `<div class="synergy-row ${tier?'':'off'}"><span>${synergy.icon}</span><div><b>${synergy.element} 인연 ${tier?value:''}</b><small>${synergy.text} · ${next}</small></div></div>`;
    }).join('');
    ui.synergyCount.textContent=active;
  }

  getSynergyTier(element) { const count=this.synergyCounts?.[element]||0;return count>=4?2:count>=2?1:0; }
  getFireDamageMultiplier(){return [1,1.15,1.32][this.getSynergyTier('화염')];}
  getSynergyLuckMultiplier(){return [1,1.3,1.65][this.getSynergyTier('달빛')];}
  getWindCooldownMultiplier(){return [1,.88,.75][this.getSynergyTier('바람')];}
  getMountainDamageMultiplier(){return [1,.85,.7][this.getSynergyTier('산')];}
  getSpiritGoldMultiplier(){return [1,1.18,1.38][this.getSynergyTier('혼령')];}
  getThunderHeroMultiplier(){return [1,1.25,1.6][this.getSynergyTier('천둥')];}

  updateUnitStrip() {
    const groups={};
    this.units.filter((unit)=>!unit.showcase).forEach((unit)=>{const key=`${unit.type}-${unit.rank}`;groups[key]=(groups[key]||0)+1;});
    const entries=Object.entries(groups).sort((a,b)=>Number(b[0].split('-')[1])-Number(a[0].split('-')[1])).slice(0,6);
    ui.unitStrip.innerHTML=entries.map(([key,count])=>{
      const [type,rankString]=key.split('-');const rank=Number(rankString);const config=UNIT_TYPES[type];const color=`#${config.color.toString(16).padStart(6,'0')}`;
      return `<div class="unit-chip" style="--chip:${color}33"><span class="unit-face">${config.symbol}</span><div><b>${config.name}</b><small>${'★'.repeat(rank)}</small></div><b>×${count}</b></div>`;
    }).join('');
  }

  updateKillChain(dt) {
    if (this.killChainTimer <= 0) return;
    this.killChainTimer = Math.max(0, this.killChainTimer - dt);
    if (this.killChainTimer === 0) {
      this.killChain = 0;
      ui.killChain.classList.add('hidden');
    }
  }

  updateBossHUD() {
    const boss = this.enemies.find((enemy) => enemy.boss && !enemy.dead);
    if (!boss) {
      ui.bossHealth.classList.add('hidden');
      return;
    }
    const percent = clamp(boss.hp / boss.maxHp, 0, 1);
    ui.bossHealthName.textContent = ENEMY_TYPES[boss.type].name;
    ui.bossHealthValue.textContent = `${Math.ceil(percent * 100)}%`;
    ui.bossHealthProgress.style.width = `${percent * 100}%`;
    ui.bossHealth.classList.remove('hidden');
  }

  updateHUD() {
    if (!this.coreHp && this.coreHp!==0) return;
    ui.hp.textContent=Math.ceil(this.coreHp);
    ui.gold.textContent=Math.floor(this.gold);
    ui.waveLabel.textContent=this.currentWave?`WAVE ${this.currentWave} / ${this.maxWaves}`:'WAVE 준비';
    const alive=this.enemies.length;
    const progress=this.waveActive?1-(this.spawnRemaining+alive)/Math.max(1,this.spawnTotal*1.18):0;
    ui.waveProgress.style.width=`${clamp(progress*100,0,100)}%`;
    ui.enemyCount.textContent=this.waveActive?`남은 요괴 ${this.spawnRemaining+alive}`:`${this.currentWave+1}번째 습격 준비`;
    ui.luckValue.textContent=`${Math.floor(this.luck)}%`;
    ui.luckProgress.style.width=`${clamp(this.luck,0,100)}%`;
    ui.summonCost.textContent=this.getSummonCost();
    ui.summon.disabled=this.gold<this.getSummonCost();
    ui.dashCooldown.textContent=this.player?.dashCooldown>0?`${this.player.dashCooldown.toFixed(1)}s`:'준비';
    ui.skillCooldown.textContent=this.player?.skillCooldown>0?`${this.player.skillCooldown.toFixed(1)}s`:'준비';
    ui.dash.classList.toggle('cooling',this.player?.dashCooldown>0);
    ui.skill.classList.toggle('cooling',this.player?.skillCooldown>0);
    ui.wave.disabled=this.waveActive||this.currentWave>=this.maxWaves;
    ui.waveText.textContent=this.waveActive?'전투중':this.currentWave===0?'시작':`${this.currentWave+1}`;
    this.updateBossHUD();
  }

  showToast(message) {
    clearTimeout(this.toastTimer);
    ui.toast.textContent=message;
    ui.toast.classList.add('show');
    this.toastTimer=setTimeout(()=>ui.toast.classList.remove('show'),1800);
  }

  showCombo(message,duration=1100) {
    clearTimeout(this.bannerTimer);
    ui.comboText.textContent=message;
    ui.combo.classList.remove('hidden');
    requestAnimationFrame(()=>ui.combo.classList.add('show'));
    this.bannerTimer=setTimeout(()=>{ui.combo.classList.remove('show');setTimeout(()=>ui.combo.classList.add('hidden'),250);},duration);
  }

  pauseGame() {
    if (this.state!=='playing') return;
    this.previousState=this.state;this.state='paused';this.showModal(ui.pauseModal);
  }

  resumeGame() {
    if(this.state!=='paused')return;this.hideModal(ui.pauseModal);this.state='playing';this.clock.getDelta();
  }

  finishRun(won) {
    if(this.state==='result')return;
    this.state='result';this.waveActive=false;this.showGameUI(false);
    ui.bossHealth.classList.add('hidden');
    ui.killChain.classList.add('hidden');
    ui.mission.classList.remove('show');
    ui.mission.classList.add('hidden');
    won?this.sound.win():this.sound.fail();
    if(won)this.score+=5000+Math.round(this.coreHp*30);
    ui.resultKicker.textContent=won?'MOON MARKET SAVED':'THE TREE HAS FALLEN';
    ui.resultTitle.textContent=won?'달빛 장터 수호 성공!':'신목을 지키지 못했습니다';
    ui.resultScore.textContent=Math.round(this.score).toLocaleString();
    ui.resultKills.textContent=this.kills.toLocaleString();
    ui.resultRank.textContent=`${this.maxRank}★`;
    const summary={};
    this.units.filter((unit)=>!unit.showcase).forEach((unit)=>{summary[unit.type]=Math.max(summary[unit.type]||0,unit.rank);});
    ui.resultUnits.innerHTML=Object.entries(summary).map(([type,rank])=>`<span class="result-unit">${UNIT_TYPES[type].symbol} ${UNIT_TYPES[type].name} ${'★'.repeat(rank)}</span>`).join('')||'<span class="result-unit">소환 기록 없음</span>';
    this.renderLeaderboard(this.getLocalScores());
    window.setTimeout(()=>this.showModal(ui.resultModal),700);
  }

  getLocalScores() {
    try{return JSON.parse(localStorage.getItem('dokkaebi-luck-scores')||'[]');}catch{return[];}
  }

  async saveScore() {
    const name=(ui.playerName.value.trim()||'달빛 수호자').slice(0,12);
    const entry={name,score:Math.round(this.score),wave:this.currentWave,kills:this.kills,maxRank:this.maxRank,date:Date.now()};
    const local=[...this.getLocalScores(),entry].sort((a,b)=>b.score-a.score).slice(0,10);
    localStorage.setItem('dokkaebi-luck-scores',JSON.stringify(local));
    ui.saveScore.disabled=true;ui.saveScore.textContent='저장 완료';
    let scores=local;
    if(isFirebaseEnabled()) {
      try { await submitOnlineScore(entry);scores=await loadOnlineScores();this.showToast('온라인 달빛 명부에 기록했습니다.'); }
      catch { this.showToast('로컬 기록으로 저장했습니다.'); }
    } else this.showToast('기기에 기록을 저장했습니다.');
    this.renderLeaderboard(scores);
  }

  renderLeaderboard(scores) {
    const list=(scores||[]).slice(0,5);
    ui.leaderboard.innerHTML=`<h3>달빛 명부 TOP 5</h3>${list.length?list.map((entry,index)=>`<div class="rank-row"><span>${index+1}</span><span>${this.escapeHtml(entry.name)}</span><span>${Number(entry.score).toLocaleString()}</span></div>`).join(''):'<div class="rank-row"><span>–</span><span>첫 기록을 남겨보세요</span><span>0</span></div>'}`;
  }

  escapeHtml(value) {return String(value).replace(/[&<>'"]/g,(char)=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));}

  getRenderPixelRatio() {
    const ceiling = this.lowPower ? 1.25 : 1.65;
    return Math.min(window.devicePixelRatio || 1, ceiling) * this.qualityScale;
  }

  updateAdaptiveQuality(dt) {
    if (this.state !== 'playing') return;
    this.qualitySampleTime += dt;
    this.qualityFrames += 1;
    if (this.qualitySampleTime < 4.5) return;
    const fps = this.qualityFrames / Math.max(.001, this.qualitySampleTime);
    let nextScale = this.qualityScale;
    if (fps < 37 && this.qualityScale > .72) nextScale = .72;
    else if (fps < 49 && this.qualityScale > .84) nextScale = .84;
    if (nextScale < this.qualityScale) {
      this.qualityScale = nextScale;
      this.renderer.setPixelRatio(this.getRenderPixelRatio());
      if (nextScale <= .72) this.moonLight.castShadow = false;
      ui.qualityBadge.textContent = `모바일 최적화 ON · ${Math.round(fps)} FPS`;
      ui.qualityBadge.classList.remove('hidden');
      window.setTimeout(() => ui.qualityBadge.classList.add('hidden'), 2400);
      this.qualityAdjusted = true;
    }
    this.qualitySampleTime = 0;
    this.qualityFrames = 0;
  }

  onResize() {
    this.camera.aspect=window.innerWidth/window.innerHeight;this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth,window.innerHeight);
    this.renderer.setPixelRatio(this.getRenderPixelRatio());
  }

  animate() {
    requestAnimationFrame(()=>this.animate());
    const dt=Math.min(.033,this.clock.getDelta());
    this.elapsed+=dt;
    this.updateWorldEffects(dt);
    if(this.state==='playing') {
      this.updatePlayer(dt);this.updateWave(dt);this.updateEnemies(dt);this.updateUnits(dt);this.updateProjectiles(dt);this.updateCoins(dt);this.updateParticles(dt);this.updateKillChain(dt);this.updateAdaptiveQuality(dt);this.updateHUD();
    } else if(this.state==='title') {
      this.updateUnits(dt);this.updateParticles(dt);
      if(this.player){this.player.group.rotation.y+=dt*.18;this.player.group.position.y=Math.sin(this.elapsed*2.3)*.05;}
    } else {
      this.updateParticles(dt);
    }
    this.updateCamera(dt);
    this.renderer.render(this.scene,this.camera);
  }
}

new DokkaebiLuckDefense();

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
}
