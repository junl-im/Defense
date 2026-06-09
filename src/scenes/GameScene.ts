import Phaser from 'phaser';
import type { User } from 'firebase/auth';
import { ENEMIES, getStageConfig, TOWERS } from '../game/balance';
import type { PathPoint, StageConfig, TowerKind, WaveSpawn } from '../game/types';
import { Enemy } from '../game/Enemy';
import { Hero } from '../game/Hero';
import { Soldier } from '../game/Soldier';
import { Tower } from '../game/Tower';
import type { PlayerSave } from '../services/firebase';
import { fetchLeaderboard, saveStageClear, submitLeaderboard } from '../services/firebase';
import { pulseButton, shakeCamera, spawnBuildDust, spawnExplosionBurst, spawnImpactRing, spawnWaveBanner } from '../game/Effects';
import { isMuted, playMusic, playSfx, setMuted } from '../game/AudioManager';
import { requestGameFullscreen } from '../platform/WebShell';
import { getRelicBattleBonuses, modifierLabel, type DailyChallenge } from '../game/MegaSystems';
import { createQualityToggleButton, drawBattlePolish, installScenePerformanceWatch } from '../game/VisualPolish';

type CastingSpell = 'meteor' | 'mercenary' | undefined;

export class GameScene extends Phaser.Scene {
  user!: User;
  save!: PlayerSave;
  stage!: StageConfig;

  gold = 0;
  lives = 0;
  waveIndex = -1;
  enemies: Enemy[] = [];
  towers: Tower[] = [];
  mercenaries: Soldier[] = [];
  hero!: Hero;
  selectedTower?: Tower;
  selectedPanel?: Phaser.GameObjects.Container;
  settingRallyFor?: Tower;
  rallyReadyAt = 0;
  castingSpell: CastingSpell;
  waveRunning = false;
  startTime = 0;
  score = 0;
  ended = false;
  meteorCooldownMs = 0;
  mercenaryCooldownMs = 0;
  gameSpeed = 1;
  paused = false;
  pauseOverlay?: Phaser.GameObjects.Container;
  dailyChallenge?: DailyChallenge;
  relicBonuses = getRelicBattleBonuses();

  goldText!: Phaser.GameObjects.Text;
  livesText!: Phaser.GameObjects.Text;
  waveText!: Phaser.GameObjects.Text;
  stageText!: Phaser.GameObjects.Text;
  messageText!: Phaser.GameObjects.Text;
  meteorText!: Phaser.GameObjects.Text;
  mercenaryText!: Phaser.GameObjects.Text;
  heroSkillText!: Phaser.GameObjects.Text;
  speedText!: Phaser.GameObjects.Text;
  soundText!: Phaser.GameObjects.Text;

  constructor() {
    super('GameScene');
  }

  init(data: { user: User; save: PlayerSave; stageId?: string; dailyChallenge?: DailyChallenge }): void {
    this.user = data.user;
    this.save = data.save;
    this.stage = getStageConfig(data.stageId);
    this.dailyChallenge = data.dailyChallenge;
    this.relicBonuses = getRelicBattleBonuses();
    this.gold = this.stage.startGold + this.relicBonuses.startGoldBonus;
    if (this.dailyChallenge?.modifiers.includes('gold_rush')) this.gold = Math.round(this.gold * 1.25);
    this.lives = this.stage.maxLives;
    this.waveIndex = -1;
    this.enemies = [];
    this.towers = [];
    this.mercenaries = [];
    this.selectedTower = undefined;
    this.selectedPanel = undefined;
    this.settingRallyFor = undefined;
    this.castingSpell = undefined;
    this.waveRunning = false;
    this.score = 0;
    this.ended = false;
    this.meteorCooldownMs = 0;
    this.mercenaryCooldownMs = 0;
    this.gameSpeed = 1;
    this.paused = false;
  }

  create(): void {
    this.time.timeScale = 1;
    this.startTime = Date.now();
    this.drawMap();
    drawBattlePolish(this, this.stage.theme);
    installScenePerformanceWatch(this);
    this.createHud();
    this.createTowerSpots();
    this.hero = new Hero(this, this.stage.path[0].x + 120, this.stage.path[0].y - 35);
    if (this.dailyChallenge?.modifiers.includes('hero_trial')) this.hero.damage = Math.round(this.hero.damage * 1.35);
    this.hero.on('pointerdown', () => this.showMessage('영웅 레온 선택됨. 빈 맵 터치로 이동합니다.'));
    this.createSpells();
    this.createInputHandlers();
    playMusic(this, 'bgm_battle', 0.18);
    window.addEventListener('kingdom-seed:user-activated', () => playMusic(this, 'bgm_battle', 0.18), { once: true });
    this.showMessage(`${this.stage.title}: ${this.stage.tip}`);
    if (this.dailyChallenge) {
      this.time.delayedCall(520, () => this.showMessage(`일일 도전: ${this.dailyChallenge!.modifiers.map(modifierLabel).join(' / ')}`));
    }
    this.events.on('kingdom-seed:boss-pattern', (payload: { label: string; pattern: string }) => {
      this.showMessage(`보스 패턴 발동: ${payload.label} - ${payload.pattern}`);
      playMusic(this, 'bgm_boss', 0.22);
    });
  }

  update(_: number, delta: number): void {
    if (this.ended || this.paused) return;
    this.meteorCooldownMs = Math.max(0, this.meteorCooldownMs - delta);
    this.mercenaryCooldownMs = Math.max(0, this.mercenaryCooldownMs - delta);

    this.enemies.forEach((enemy) => enemy.update(delta));
    this.towers.forEach((tower) => tower.update(delta, this.enemies));
    this.hero.update(delta, this.enemies);
    this.mercenaries = this.mercenaries.filter((soldier) => soldier.active);
    this.mercenaries.forEach((soldier) => soldier.update(delta, this.enemies));

    for (const enemy of [...this.enemies]) {
      if (enemy.reachedGoal) {
        this.lives -= enemy.config.threat === 'boss' ? 3 : 1;
        enemy.destroy();
        enemy.dead = true;
        this.refreshHud();
      } else if (enemy.dead && enemy.hp <= 0) {
        this.gold += enemy.config.reward;
        const threatBonus = enemy.config.threat === 'boss' ? 8 : enemy.config.threat === 'tank' ? 3 : 1;
        this.score += enemy.config.reward * 10 * threatBonus + this.lives * 2;
        enemy.hp = -9999;
        this.refreshHud();
      }
    }
    this.enemies = this.enemies.filter((e) => e.active && !e.reachedGoal);

    if (this.lives <= 0) {
      this.showGameOver();
      return;
    }

    if (this.waveRunning && this.enemies.length === 0) {
      this.waveRunning = false;
      if (this.waveIndex >= this.stage.waves.length - 1) void this.finishStage();
      else {
        playMusic(this, 'bgm_battle', 0.18);
        this.showMessage('웨이브 클리어! 조기 호출로 추가 골드 획득 가능');
      }
    }

    this.refreshSpellHud();
  }

  private drawMap(): void {
    const theme = this.stage.theme;
    const bgKey = `battle-bg-${this.stage.id}`;
    const pathEdge = theme === 'forest' ? 0x6b4f2d : theme === 'canyon' ? 0x5b2f20 : theme === 'swamp' ? 0x304136 : 0x161116;
    const pathMain = theme === 'forest' ? 0xb08a52 : theme === 'canyon' ? 0xc2834e : theme === 'swamp' ? 0x79816a : 0x7c6b5e;

    if (this.textures.exists(bgKey)) {
      this.add.image(480, 270, bgKey).setDisplaySize(960, 540).setDepth(0);
      this.createAmbientMapFx();
      this.drawPath(0x17100a, 54, 0.36);
      this.drawPath(pathEdge, 44, 0.78);
      this.drawPath(pathMain, 29, 0.92);
      this.drawPath(0xfff0a3, 3, 0.24);
      this.drawMapVignette();
      this.drawHudChrome();
      return;
    }

    const sky = theme === 'forest' ? 0x142734 : theme === 'canyon' ? 0x281a18 : theme === 'swamp' ? 0x101922 : 0x15131a;
    const ground = theme === 'forest' ? 0x203c2b : theme === 'canyon' ? 0x6a3824 : theme === 'swamp' ? 0x1e352c : 0x2b2630;
    const ground2 = theme === 'forest' ? 0x2e5a35 : theme === 'canyon' ? 0x8a5130 : theme === 'swamp' ? 0x31483a : 0x40333a;

    this.add.rectangle(480, 270, 960, 540, sky, 1);

    const bg = this.add.graphics();
    bg.fillStyle(ground, 1).fillRect(0, 64, 960, 416);
    bg.fillStyle(ground2, 0.55);
    for (let i = 0; i < 16; i++) {
      const x = (i * 89 + 37) % 960;
      const y = 95 + ((i * 53) % 350);
      bg.fillEllipse(x, y, 120 + (i % 3) * 25, 50 + (i % 4) * 10);
    }

    if (theme === 'forest') this.drawForestDetails();
    else if (theme === 'canyon') this.drawCanyonDetails();
    else if (theme === 'swamp') this.drawSwampDetails();
    else this.drawFortressDetails();

    this.drawPath(pathEdge, 48);
    this.drawPath(pathMain, 30);
    this.drawPath(0xe8bd70, 4, 0.28);
    this.drawHudChrome();
  }

  private drawHudChrome(): void {
    if (this.textures.exists('ui-hud-top-panel')) {
      this.add.image(480, 32, 'ui-hud-top-panel').setDisplaySize(960, 64).setDepth(70);
    } else {
      this.add.rectangle(480, 30, 960, 60, 0x0b1220, 0.9).setDepth(70);
    }

    if (this.textures.exists('ui-hud-bottom-panel')) {
      this.add.image(480, 510, 'ui-hud-bottom-panel').setDisplaySize(960, 64).setDepth(70);
    } else {
      this.add.rectangle(480, 510, 960, 60, 0x0b1220, 0.82).setDepth(70);
    }
  }

  private drawMapVignette(): void {
    const shade = this.add.graphics().setDepth(3);
    shade.fillStyle(0x000000, 0.13).fillRect(0, 64, 960, 42);
    shade.fillStyle(0x000000, 0.16).fillRect(0, 438, 960, 42);
    shade.fillStyle(0x000000, 0.12).fillRect(0, 64, 42, 416);
    shade.fillStyle(0x000000, 0.12).fillRect(918, 64, 42, 416);
  }

  private createAmbientMapFx(): void {
    const theme = this.stage.theme;
    const color = theme === 'forest' ? 0xb7ff93 : theme === 'canyon' ? 0xffc16b : theme === 'swamp' ? 0xa8ffc4 : 0xff6b4d;
    const alpha = theme === 'fortress' ? 0.12 : 0.09;
    const count = theme === 'swamp' ? 13 : 9;
    for (let i = 0; i < count; i++) {
      const x = 55 + ((i * 103) % 850);
      const y = 92 + ((i * 67) % 340);
      if (this.nearPath(x, y, 58)) continue;
      const mote = this.add.circle(x, y, theme === 'swamp' ? 5 : 3, color, alpha).setDepth(5);
      this.tweens.add({
        targets: mote,
        y: y - Phaser.Math.Between(12, 28),
        x: x + Phaser.Math.Between(-14, 14),
        alpha: alpha * 0.2,
        duration: 1600 + i * 110,
        delay: i * 90,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }

  private drawPath(color: number, width: number, alpha = 1): void {
    const g = this.add.graphics().setDepth(4);
    g.lineStyle(width, color, alpha);
    g.beginPath();
    g.moveTo(this.stage.path[0].x, this.stage.path[0].y);
    this.stage.path.slice(1).forEach((p) => g.lineTo(p.x, p.y));
    g.strokePath();
  }

  private drawForestDetails(): void {
    for (let i = 0; i < 22; i++) {
      const x = (i * 47 + 29) % 940;
      const y = 80 + ((i * 71) % 390);
      if (this.nearPath(x, y, 54)) continue;
      this.add.circle(x, y, 16, 0x123c24, 1).setDepth(2);
      this.add.circle(x + 8, y - 8, 14, 0x1f6b38, 1).setDepth(2);
      this.add.rectangle(x, y + 18, 7, 18, 0x5a371c, 1).setDepth(1);
    }
    this.add.ellipse(55, 86, 170, 70, 0x294e7a, 0.45).setDepth(2);
    this.add.ellipse(80, 90, 120, 38, 0x5da6ce, 0.22).setDepth(3);
  }

  private drawCanyonDetails(): void {
    for (let i = 0; i < 20; i++) {
      const x = (i * 61 + 43) % 930;
      const y = 85 + ((i * 79) % 385);
      if (this.nearPath(x, y, 58)) continue;
      this.add.polygon(x, y, [0, -22, 24, 18, -18, 16], 0x8f5633, 1).setStrokeStyle(2, 0x3f2017, 0.35).setDepth(2);
      if (i % 4 === 0) this.add.circle(x + 20, y - 12, 6, 0xffd06b, 0.32).setDepth(3);
    }
    this.add.rectangle(850, 92, 180, 44, 0x38170f, 0.45).setDepth(2);
  }


  private drawSwampDetails(): void {
    for (let i = 0; i < 26; i++) {
      const x = (i * 67 + 39) % 930;
      const y = 78 + ((i * 61) % 390);
      if (this.nearPath(x, y, 56)) continue;
      this.add.ellipse(x, y, 54, 20, 0x0f231d, 0.5).setDepth(2);
      this.add.circle(x - 8, y - 3, 7, 0x5da77a, 0.42).setDepth(3);
      this.add.circle(x + 11, y + 2, 5, 0x89d68a, 0.28).setDepth(3);
      if (i % 5 === 0) this.add.circle(x + 16, y - 14, 5, 0xc2ff9a, 0.2).setDepth(4);
    }
    this.add.ellipse(92, 414, 165, 58, 0x0b1716, 0.5).setDepth(2);
    this.add.ellipse(112, 418, 112, 26, 0x6fb38c, 0.12).setDepth(3);
  }


  private drawFortressDetails(): void {
    this.add.rectangle(480, 96, 960, 64, 0x221820, 0.55).setDepth(2);
    for (let i = 0; i < 13; i++) {
      const x = 28 + i * 76;
      this.add.rectangle(x, 92, 44, 70, 0x3a3036, 1).setStrokeStyle(2, 0x0e0a0d, 0.35).setDepth(2);
      this.add.triangle(x, 42, -25, 28, 0, -14, 25, 28, 0x6c1f2a, 1).setDepth(3);
      if (i % 2 === 0) this.add.circle(x + 18, 122, 5, 0xff7a42, 0.36).setDepth(4);
    }
    for (let i = 0; i < 18; i++) {
      const x = (i * 73 + 55) % 930;
      const y = 150 + ((i * 89) % 330);
      if (this.nearPath(x, y, 62)) continue;
      this.add.rectangle(x, y, 54, 22, 0x3d342c, 0.95).setRotation((i % 5 - 2) * 0.08).setStrokeStyle(1, 0x0e0a0d, 0.35).setDepth(2);
      if (i % 3 === 0) this.add.circle(x + 24, y - 10, 7, 0xffb347, 0.18).setDepth(3);
    }
    this.add.circle(850, 112, 44, 0xff5a3d, 0.12).setStrokeStyle(2, 0xffb347, 0.2).setDepth(3);
  }

  private nearPath(x: number, y: number, threshold: number): boolean {
    for (const p of this.stage.path) {
      if (Phaser.Math.Distance.Between(x, y, p.x, p.y) < threshold) return true;
    }
    return false;
  }

  private createHud(): void {
    this.livesText = this.add.text(24, 18, '', { fontSize: '24px', color: '#ff8080', fontStyle: 'bold' }).setDepth(75);
    this.goldText = this.add.text(140, 18, '', { fontSize: '24px', color: '#f7d36b', fontStyle: 'bold' }).setDepth(75);
    this.waveText = this.add.text(280, 18, '', { fontSize: '24px', color: '#ffffff', fontStyle: 'bold' }).setDepth(75);
    this.stageText = this.add.text(480, 17, `STAGE ${this.stage.number}: ${this.stage.title}`, { fontSize: '21px', color: '#dbe7ff', fontStyle: 'bold' }).setOrigin(0.5, 0).setDepth(75);
    this.messageText = this.add.text(480, 82, '', {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#000000aa',
      padding: { x: 12, y: 7 }
    }).setOrigin(0.5).setVisible(false).setDepth(90);

    const waveButton = this.makeUiButton(762, 30, 150, 42, 0x9a3c2f, '조기 웨이브', 18, 80);
    waveButton.on('pointerdown', () => {
      pulseButton(this, waveButton);
      this.startNextWave(true);
    });

    const speedButton = this.makeUiButton(870, 30, 58, 42, 0x24486b, '', 16, 80);
    this.speedText = this.add.text(870, 30, '1x', { fontSize: '18px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5).setDepth(82);
    speedButton.on('pointerdown', () => {
      pulseButton(this, speedButton);
      this.toggleSpeed();
    });

    const pauseButton = this.makeUiButton(925, 30, 46, 42, 0x2f3440, 'Ⅱ', 20, 80);
    pauseButton.on('pointerdown', () => {
      pulseButton(this, pauseButton);
      playSfx(this, 'sfx_click');
      this.openPauseOverlay();
    });

    const fullscreenButton = this.makeUiButton(700, 30, 46, 42, 0x263c52, '⛶', 18, 80);
    fullscreenButton.on('pointerdown', () => {
      pulseButton(this, fullscreenButton);
      playSfx(this, 'sfx_click');
      void requestGameFullscreen();
    });

    const soundButton = this.makeUiButton(640, 30, 46, 42, 0x263c52, '', 18, 80);
    this.soundText = this.add.text(640, 30, isMuted() ? '🔇' : '🔊', { fontSize: '17px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5).setDepth(82);
    soundButton.on('pointerdown', () => {
      const next = !isMuted();
      setMuted(next);
      this.soundText.setText(next ? '🔇' : '🔊');
      if (!next) playSfx(this, 'sfx_click');
    });

    this.refreshHud();
  }

  private createTowerSpots(): void {
    this.stage.spots.forEach((spot) => {
      const glow = this.add.circle(spot.x, spot.y, 35, 0xf7d36b, 0.08).setDepth(12);
      const base = this.add.circle(spot.x, spot.y, 27, 0x3d3d3d, 0.85).setStrokeStyle(3, 0xf7d36b, 0.45).setDepth(13);
      const plus = this.add.text(spot.x, spot.y - 2, '+', { fontSize: '34px', color: '#fff4c2', fontStyle: 'bold' }).setOrigin(0.5).setDepth(14);
      base.setInteractive({ useHandCursor: true });
      base.on('pointerdown', () => this.openBuildMenu(spot.x, spot.y, base, glow, plus));
      this.tweens.add({ targets: glow, alpha: 0.17, duration: 900, yoyo: true, repeat: -1 });
    });
  }

  private openBuildMenu(x: number, y: number, spot: Phaser.GameObjects.Arc, glow: Phaser.GameObjects.Arc, plus: Phaser.GameObjects.Text): void {
    if (this.settingRallyFor && this.time.now >= this.rallyReadyAt) {
      this.settingRallyFor.setRallyPoint(x, y);
      this.settingRallyFor = undefined;
      this.showMessage('집결지 변경 완료');
      return;
    }

    this.destroySelectedPanel();
    const menu = this.add.container(x, y).setDepth(55);
    const center = this.add.circle(0, 0, 32, 0x0b1220, 0.9).setStrokeStyle(2, 0xf7d36b, 0.8);
    menu.add(center);
    const kinds: TowerKind[] = ['archer', 'mage', 'barracks', 'artillery'];
    kinds.forEach((kind, idx) => {
      const angle = -Math.PI / 2 + idx * (Math.PI * 2 / kinds.length);
      const bx = Math.cos(angle) * 68;
      const by = Math.sin(angle) * 68;
      const cfg = TOWERS[kind];
      const b = this.add.circle(bx, by, 30, cfg.color, 1).setStrokeStyle(3, 0xffffff, 0.7).setInteractive({ useHandCursor: true });
      const icon = this.add.text(bx, by - 4, this.towerSymbol(kind), { fontSize: '21px', color: '#101820', fontStyle: 'bold' }).setOrigin(0.5);
      const cost = this.towerCost(kind, cfg.cost);
      const price = this.add.text(bx, by + 25, `$${cost}`, { fontSize: '11px', color: '#ffffff', backgroundColor: '#00000099', padding: { x: 3, y: 1 } }).setOrigin(0.5);
      b.on('pointerdown', () => {
        if (this.gold < cost) {
          this.showMessage(`골드 부족: ${cfg.label} 필요 ${cost}`);
          menu.destroy();
          return;
        }
        this.gold -= cost;
        spot.disableInteractive().setVisible(false);
        glow.destroy();
        plus.destroy();
        const tower = new Tower(this, x, y, cfg);
        playSfx(this, 'sfx_build');
        spawnBuildDust(this, x, y);
        tower.applyPermanentUpgrades(this.save.upgrades);
        if (kind === 'barracks') tower.spawnSoldiers();
        tower.on('pointerdown', () => this.selectTower(tower));
        this.towers.push(tower);
        menu.destroy();
        this.refreshHud();
        this.showMessage(`${cfg.label} 건설 완료`);
      });
      menu.add([b, icon, price]);
    });

    this.time.delayedCall(3000, () => menu.active && menu.destroy());
  }


  private towerCost(kind: TowerKind, baseCost: number): number {
    let cost = baseCost;
    if (this.dailyChallenge?.modifiers.includes('no_mage') && kind === 'mage') cost = Math.round(cost * 1.65);
    if (this.dailyChallenge?.modifiers.includes('iron_wall') && kind === 'mage') cost = Math.round(cost * 0.92);
    return cost;
  }

  private selectTower(tower: Tower): void {
    this.selectedTower?.rangeCircle.setVisible(false);
    this.destroySelectedPanel();
    this.selectedTower = tower;
    tower.rangeCircle.setVisible(true);
    this.createTowerPanel(tower);
  }

  private createTowerPanel(tower: Tower): void {
    const panelHeight = tower.config.kind === 'barracks' ? 128 : 90;
    const panel = this.add.container(798, 434).setDepth(82);
    const bg = this.add.rectangle(0, 0, 292, panelHeight, 0x0b1220, 0.94).setStrokeStyle(2, 0xf7d36b, 0.55);
    const title = this.add.text(-130, -panelHeight / 2 + 14, `${tower.config.label} Lv.${tower.level}`, { fontSize: '18px', color: '#f7d36b', fontStyle: 'bold' });
    const skill = this.add.text(-130, -panelHeight / 2 + 40, tower.level >= 3 ? `특수 개방: ${tower.config.maxSkill}` : `Lv.3 특수: ${tower.config.maxSkill}`, { fontSize: '14px', color: '#dbe7ff' });
    panel.add([bg, title, skill]);

    const cost = tower.upgradeCost;
    const up = this.makePanelButton(panel, -58, panelHeight / 2 - 30, 138, 38, cost ? 0x24486b : 0x333333, cost ? `업그레이드 $${cost}` : '최고 레벨');
    up.on('pointerdown', () => this.upgradeSelectedTower());

    if (tower.config.kind === 'barracks') {
      const rally = this.makePanelButton(panel, 92, panelHeight / 2 - 30, 108, 38, 0x3f5f2f, '집결지');
      rally.on('pointerdown', () => {
        this.settingRallyFor = tower;
        this.rallyReadyAt = this.time.now + 120;
        this.showMessage('집결지를 놓을 길 위를 터치하세요');
      });
    }

    this.selectedPanel = panel;
  }

  private upgradeSelectedTower(): void {
    const tower = this.selectedTower;
    if (!tower) return;
    const cost = tower.upgradeCost;
    if (!cost) {
      this.showMessage('이미 최고 레벨입니다');
      return;
    }
    if (this.gold < cost) {
      this.showMessage(`골드 부족: 업그레이드 필요 ${cost}`);
      return;
    }
    this.gold -= cost;
    tower.upgrade();
    spawnImpactRing(this, tower.x, tower.y, 48, tower.config.color, 0.2, 380);
    this.refreshHud();
    this.selectTower(tower);
    playSfx(this, 'sfx_upgrade');
    this.showMessage(tower.level >= 3 ? `${tower.config.maxSkill} 개방!` : `${tower.config.label} Lv.${tower.level}`);
  }

  private destroySelectedPanel(): void {
    this.selectedPanel?.destroy();
    this.selectedPanel = undefined;
  }

  private createSpells(): void {
    const meteor = this.makeUiButton(96, 500, 150, 46, 0x4f1f1f, '', 18, 80);
    this.meteorText = this.add.text(96, 500, '⚡ 메테오', { fontSize: '19px', color: '#fff', fontStyle: 'bold' }).setOrigin(0.5).setDepth(82);
    meteor.on('pointerdown', () => {
      if (this.meteorCooldownMs > 0) return this.showMessage('메테오 쿨타임 중');
      pulseButton(this, meteor);
      playSfx(this, 'sfx_click');
      this.castingSpell = 'meteor';
      this.showMessage('메테오 지점을 터치하세요');
    });

    const mercenary = this.makeUiButton(260, 500, 160, 46, 0x2f4f35, '', 18, 80);
    this.mercenaryText = this.add.text(260, 500, '🛡️ 용병소환', { fontSize: '18px', color: '#fff', fontStyle: 'bold' }).setOrigin(0.5).setDepth(82);
    mercenary.on('pointerdown', () => {
      if (this.mercenaryCooldownMs > 0) return this.showMessage('용병소환 쿨타임 중');
      pulseButton(this, mercenary);
      playSfx(this, 'sfx_click');
      this.castingSpell = 'mercenary';
      this.showMessage('용병을 소환할 길 위를 터치하세요');
    });

    const heroSkill = this.makeUiButton(440, 500, 170, 46, 0x4f3d1f, '', 18, 80);
    this.heroSkillText = this.add.text(440, 500, '🦁 대지강타', { fontSize: '18px', color: '#fff', fontStyle: 'bold' }).setOrigin(0.5).setDepth(82);
    heroSkill.on('pointerdown', () => {
      pulseButton(this, heroSkill);
      playSfx(this, 'sfx_click');
      const ok = this.hero.castStomp(this.enemies);
      this.showMessage(ok ? '대지강타!' : '영웅 스킬 쿨타임 중');
    });
  }

  private createInputHandlers(): void {
    this.input.on('pointerdown', (p: Phaser.Input.Pointer, currentlyOver: Phaser.GameObjects.GameObject[]) => {
      if (currentlyOver.length > 0) return;
      if (p.y < 70 || p.y > 470) return;

      if (this.settingRallyFor && this.time.now >= this.rallyReadyAt) {
        this.settingRallyFor.setRallyPoint(p.x, p.y);
        this.settingRallyFor = undefined;
        this.showMessage('집결지 변경 완료');
        return;
      }

      if (this.castingSpell === 'meteor') {
        this.castMeteor(p.x, p.y);
        this.castingSpell = undefined;
        return;
      }

      if (this.castingSpell === 'mercenary') {
        this.castMercenaries(p.x, p.y);
        this.castingSpell = undefined;
        return;
      }

      this.hero.moveToPoint(p.x, p.y);
    });
  }

  private castMeteor(x: number, y: number): void {
    const radius = 78;
    this.meteorCooldownMs = Math.round(24000 * this.relicBonuses.meteorCooldownMultiplier * (this.dailyChallenge?.modifiers.includes('meteor_storm') ? 0.72 : 1));
    playSfx(this, 'sfx_explosion');
    const warning = this.add.circle(x, y, radius, 0xff3b2f, 0.14).setStrokeStyle(2, 0xfff0a3, 0.8).setDepth(50);
    this.tweens.add({ targets: warning, scale: 0.75, duration: 160, yoyo: true, onComplete: () => warning.destroy() });
    this.time.delayedCall(170, () => {
      const boom = this.add.circle(x, y, radius, 0xfff0a3, 0.35).setDepth(51);
      spawnExplosionBurst(this, x, y, 1.35);
      spawnImpactRing(this, x, y, radius, 0xffd36b, 0.3, 420);
      shakeCamera(this, 0.006, 160);
      this.tweens.add({ targets: boom, scale: 1.5, alpha: 0, duration: 300, onComplete: () => boom.destroy() });
      this.enemies.forEach((enemy) => {
        if (!enemy.dead && Phaser.Math.Distance.Between(x, y, enemy.x, enemy.y) <= radius) enemy.receiveDamage(100, 'true');
      });
    });
  }

  private castMercenaries(x: number, y: number): void {
    this.mercenaryCooldownMs = 20000;
    playSfx(this, 'sfx_build');
    for (let i = 0; i < 2; i++) {
      const soldier = new Soldier(this, x + i * 18 - 9, y + i * 18 - 9, x + i * 18 - 9, y + i * 18 - 9, {
        color: 0xa6ffb0,
        damage: 9,
        maxHp: 55,
        blockMs: 300,
        expiresInMs: 15000
      });
      this.mercenaries.push(soldier);
    }
    const pulse = this.add.circle(x, y, 34, 0xa6ffb0, 0.16).setDepth(50);
    this.tweens.add({ targets: pulse, scale: 1.6, alpha: 0, duration: 420, onComplete: () => pulse.destroy() });
    this.showMessage('용병 2명 소환! 15초 동안 길막합니다');
  }

  private refreshSpellHud(): void {
    this.meteorText.setText(this.meteorCooldownMs > 0 ? `⚡ ${Math.ceil(this.meteorCooldownMs / 1000)}s` : '⚡ 메테오');
    this.mercenaryText.setText(this.mercenaryCooldownMs > 0 ? `🛡️ ${Math.ceil(this.mercenaryCooldownMs / 1000)}s` : '🛡️ 용병소환');
    this.heroSkillText.setText(this.hero.skillCooldownMs > 0 ? `🦁 ${Math.ceil(this.hero.skillCooldownMs / 1000)}s` : '🦁 대지강타');
  }


  private toggleSpeed(): void {
    this.gameSpeed = this.gameSpeed === 1 ? 2 : 1;
    if (!this.paused) this.time.timeScale = this.gameSpeed;
    this.speedText?.setText(`${this.gameSpeed}x`);
    this.showMessage(this.gameSpeed === 2 ? '전투 속도 2배' : '전투 속도 1배');
  }

  private openPauseOverlay(): void {
    if (this.pauseOverlay?.active) return;
    this.paused = true;
    this.time.timeScale = 0;
    const panel = this.add.container(480, 270).setDepth(120);
    const bg = this.add.rectangle(0, 0, 500, 300, 0x0b1220, 0.95).setStrokeStyle(2, 0xf7d36b, 0.5);
    const title = this.add.text(0, -102, 'PAUSED', { fontSize: '42px', color: '#f7d36b', fontStyle: 'bold' }).setOrigin(0.5);
    const desc = this.add.text(0, -40, `${this.stage.title}
속도 ${this.gameSpeed}x / Wave ${Math.max(0, this.waveIndex + 1)}/${this.stage.waves.length}`, {
      fontSize: '20px', color: '#dbe7ff', align: 'center', lineSpacing: 8
    }).setOrigin(0.5);
    const quality = createQualityToggleButton(this, 0, 28);
    const resume = this.add.rectangle(-115, 80, 180, 48, 0x284f39, 1).setStrokeStyle(2, 0xffffff, 0.25).setInteractive({ useHandCursor: true });
    const resumeText = this.add.text(-115, 80, '계속하기', { fontSize: '22px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
    const world = this.add.rectangle(115, 80, 180, 48, 0x24486b, 1).setStrokeStyle(2, 0xffffff, 0.25).setInteractive({ useHandCursor: true });
    const worldText = this.add.text(115, 80, '월드맵', { fontSize: '22px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
    resume.on('pointerdown', () => this.closePauseOverlay());
    world.on('pointerdown', () => {
      this.time.timeScale = 1;
      this.scene.start('WorldMapScene', { user: this.user, save: this.save });
    });
    panel.add([bg, title, desc, quality, resume, resumeText, world, worldText]);
    this.pauseOverlay = panel;
  }

  private closePauseOverlay(): void {
    this.pauseOverlay?.destroy();
    this.pauseOverlay = undefined;
    this.paused = false;
    this.time.timeScale = this.gameSpeed;
  }

  private showBossWarning(): void {
    const warning = this.add.text(480, 118, '⚠ 보스 웨이브 접근 ⚠', {
      fontSize: '32px', color: '#ffb347', fontStyle: 'bold', backgroundColor: '#2b0f0faa', padding: { x: 18, y: 8 }
    }).setOrigin(0.5).setDepth(95);
    this.tweens.add({ targets: warning, scale: 1.08, duration: 180, yoyo: true, repeat: 3, onComplete: () => warning.destroy() });
  }

  private startNextWave(early: boolean): void {
    if (this.waveRunning) return;
    if (this.waveIndex >= this.stage.waves.length - 1) return;
    if (early && this.waveIndex >= 0) {
      const bonus = 20 + this.stage.number * 5;
      this.gold += bonus;
      this.showMessage(`조기 호출 보너스 +$${bonus}`);
    }
    this.waveIndex += 1;
    this.waveRunning = true;
    this.refreshHud();
    const waveNumber = this.waveIndex + 1;
    const waveGroups = this.stage.waves[this.waveIndex];
    playSfx(this, 'sfx_wave');
    spawnWaveBanner(this, `WAVE ${waveNumber}`, this.describeWave(waveGroups));
    if (waveGroups.some((group) => ENEMIES[group.kind].threat === 'boss')) {
      playMusic(this, 'bgm_boss', 0.24);
      this.showBossWarning();
    } else {
      playMusic(this, 'bgm_battle', 0.18);
    }
    this.spawnWave(waveGroups);
  }

  private spawnWave(groups: WaveSpawn[]): void {
    let delay = 0;
    groups.forEach((group) => {
      const count = group.count + (this.dailyChallenge?.modifiers.includes('gold_rush') ? Math.max(1, Math.floor(group.count * 0.16)) : 0);
      for (let i = 0; i < count; i++) {
        this.time.delayedCall(delay, () => {
          const cfg = { ...ENEMIES[group.kind] };
          if (this.dailyChallenge?.modifiers.includes('air_raid') && cfg.flying) {
            cfg.hp = Math.round(cfg.hp * 1.12);
            cfg.reward = Math.round(cfg.reward * 1.18);
          }
          if (this.dailyChallenge?.modifiers.includes('iron_wall') && (cfg.threat === 'tank' || cfg.threat === 'boss')) {
            cfg.armor = Math.min(0.78, cfg.armor + 0.12);
            cfg.hp = Math.round(cfg.hp * 1.08);
          }
          if (this.dailyChallenge?.modifiers.includes('boss_contract') && cfg.threat === 'boss') {
            cfg.hp = Math.round(cfg.hp * 1.16);
            cfg.reward = Math.round(cfg.reward * 1.25);
          }
          const enemy = new Enemy(this, cfg, this.stage.path);
          this.enemies.push(enemy);
          spawnImpactRing(this, enemy.x, enemy.y, 18, enemy.config.accentColor ?? 0xffffff, 0.12, 260);
        });
        delay += group.gapMs;
      }
      delay += group.delayAfterMs ?? 800;
    });
  }


  private describeWave(groups: WaveSpawn[]): string {
    return groups.map((group) => `${ENEMIES[group.kind].label} x${group.count}`).join('  /  ');
  }

  private refreshHud(): void {
    this.livesText.setText(`♥ ${this.lives}`);
    this.goldText.setText(`$ ${this.gold}`);
    this.waveText.setText(`WAVE ${Math.max(0, this.waveIndex + 1)}/${this.stage.waves.length}`);
  }

  private showMessage(text: string): void {
    this.messageText.setText(text).setVisible(true);
    this.time.delayedCall(1900, () => this.messageText.setVisible(false));
  }

  private showGameOver(): void {
    if (this.ended) return;
    this.ended = true;
    playSfx(this, 'sfx_lose');
    this.add.rectangle(480, 270, 580, 320, 0x0b1220, 0.94).setDepth(92).setStrokeStyle(2, 0xff8080, 0.45);
    this.add.text(480, 180, 'DEFENSE FAILED', { fontSize: '40px', color: '#ff8080', fontStyle: 'bold' }).setOrigin(0.5).setDepth(93);
    this.add.text(480, 242, `${this.stage.title} / Wave ${this.waveIndex + 1} / Score ${this.score}`, { fontSize: '21px', color: '#ffffff' }).setOrigin(0.5).setDepth(93);
    const world = this.makeUiButton(370, 330, 180, 48, 0x284f39, '월드맵', 22, 93);
    world.on('pointerdown', () => { this.time.timeScale = 1; this.scene.start('WorldMapScene', { user: this.user, save: this.save }); });

    const retry = this.makeUiButton(590, 330, 180, 48, 0x24486b, '다시 도전', 22, 93);
    retry.on('pointerdown', () => { this.time.timeScale = 1; this.scene.restart({ user: this.user, save: this.save, stageId: this.stage.id }); });
  }

  private async finishStage(): Promise<void> {
    if (this.ended) return;
    this.ended = true;
    const clearTimeMs = Date.now() - this.startTime;
    const finalScore = this.score + this.lives * 500 + Math.max(0, 600000 - clearTimeMs) / 100 + this.stage.number * 1000;
    const roundedScore = Math.floor(finalScore);

    try {
      this.save = await saveStageClear(this.user, this.save, this.stage.id, roundedScore, this.lives);
      await submitLeaderboard(this.user, this.save.nickname, {
        uid: this.user.uid,
        nickname: this.save.nickname,
        score: roundedScore,
        stageId: this.stage.id,
        lives: this.lives,
        wave: this.stage.waves.length,
        clearTimeMs
      });
      playSfx(this, 'sfx_win');
      const top = await fetchLeaderboard(this.stage.id);
      this.showResult(roundedScore, top);
    } catch (error) {
      console.error(error);
      this.showMessage('저장 실패: Firebase 설정/규칙을 확인하세요');
    }
  }

  private showResult(score: number, top: Array<{ nickname: string; score: number }>): void {
    this.add.rectangle(480, 270, 640, 430, 0x0b1220, 0.94).setDepth(92).setStrokeStyle(2, 0xf7d36b, 0.4);
    this.add.text(480, 98, 'STAGE CLEAR', { fontSize: '44px', color: '#f7d36b', fontStyle: 'bold' }).setOrigin(0.5).setDepth(93);
    this.add.text(480, 150, `${this.stage.title} / Score ${score} / Lives ${this.lives} / Stars ${this.save.stars}`, { fontSize: '21px', color: '#ffffff' }).setOrigin(0.5).setDepth(93);
    const lines = top.slice(0, 5).map((s, i) => `${i + 1}. ${s.nickname}  ${s.score}`).join('\n');
    this.add.text(480, 250, `오늘의 ${this.stage.title} 명예의 전당\n${lines || '아직 기록 없음'}`, { fontSize: '21px', color: '#dbe7ff', align: 'center' }).setOrigin(0.5).setDepth(93);
    const world = this.makeUiButton(370, 420, 180, 48, 0x284f39, '월드맵', 22, 93);
    world.on('pointerdown', () => { this.time.timeScale = 1; this.scene.start('WorldMapScene', { user: this.user, save: this.save }); });

    const retry = this.makeUiButton(590, 420, 180, 48, 0x24486b, '다시 도전', 22, 93);
    retry.on('pointerdown', () => { this.time.timeScale = 1; this.scene.restart({ user: this.user, save: this.save, stageId: this.stage.id }); });
  }

  private makeUiButton(x: number, y: number, width: number, height: number, color: number, label: string, fontSize = 18, depth = 10): Phaser.GameObjects.Rectangle {
    const rect = this.add.rectangle(x, y, width, height, color, 1).setStrokeStyle(2, 0xfff1c2, 0.35).setInteractive({ useHandCursor: true }).setDepth(depth);
    if (label) this.add.text(x, y, label, { fontSize: `${fontSize}px`, color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5).setDepth(depth + 1);
    rect.on('pointerdown', () => playSfx(this, 'sfx_click'));
    rect.on('pointerover', () => rect.setAlpha(0.86));
    rect.on('pointerout', () => rect.setAlpha(1));
    return rect;
  }

  private makePanelButton(panel: Phaser.GameObjects.Container, x: number, y: number, width: number, height: number, color: number, label: string): Phaser.GameObjects.Rectangle {
    const rect = this.add.rectangle(x, y, width, height, color, 1).setStrokeStyle(2, 0xffffff, 0.3).setInteractive({ useHandCursor: true });
    const text = this.add.text(x, y, label, { fontSize: '15px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
    panel.add([rect, text]);
    return rect;
  }

  private towerSymbol(kind: TowerKind): string {
    if (kind === 'archer') return '➶';
    if (kind === 'mage') return '✦';
    if (kind === 'barracks') return '♜';
    return '●';
  }
}
