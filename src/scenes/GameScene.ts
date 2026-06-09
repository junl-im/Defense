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

  goldText!: Phaser.GameObjects.Text;
  livesText!: Phaser.GameObjects.Text;
  waveText!: Phaser.GameObjects.Text;
  stageText!: Phaser.GameObjects.Text;
  messageText!: Phaser.GameObjects.Text;
  meteorText!: Phaser.GameObjects.Text;
  mercenaryText!: Phaser.GameObjects.Text;
  heroSkillText!: Phaser.GameObjects.Text;

  constructor() {
    super('GameScene');
  }

  init(data: { user: User; save: PlayerSave; stageId?: string }): void {
    this.user = data.user;
    this.save = data.save;
    this.stage = getStageConfig(data.stageId);
    this.gold = this.stage.startGold;
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
  }

  create(): void {
    this.startTime = Date.now();
    this.drawMap();
    this.createHud();
    this.createTowerSpots();
    this.hero = new Hero(this, this.stage.path[0].x + 120, this.stage.path[0].y - 35);
    this.hero.on('pointerdown', () => this.showMessage('영웅 레온 선택됨. 빈 맵 터치로 이동합니다.'));
    this.createSpells();
    this.createInputHandlers();
    this.showMessage(`${this.stage.title}: ${this.stage.tip}`);
  }

  update(_: number, delta: number): void {
    if (this.ended) return;
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
      else this.showMessage('웨이브 클리어! 조기 호출로 추가 골드 획득 가능');
    }

    this.refreshSpellHud();
  }

  private drawMap(): void {
    const theme = this.stage.theme;
    const sky = theme === 'forest' ? 0x142734 : 0x281a18;
    const ground = theme === 'forest' ? 0x203c2b : 0x6a3824;
    const ground2 = theme === 'forest' ? 0x2e5a35 : 0x8a5130;
    const pathEdge = theme === 'forest' ? 0x6b4f2d : 0x5b2f20;
    const pathMain = theme === 'forest' ? 0xb08a52 : 0xc2834e;

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
    else this.drawCanyonDetails();

    this.drawPath(pathEdge, 48);
    this.drawPath(pathMain, 30);
    this.drawPath(0xe8bd70, 4, 0.28);

    this.add.rectangle(480, 30, 960, 60, 0x0b1220, 0.9).setDepth(70);
    this.add.rectangle(480, 510, 960, 60, 0x0b1220, 0.82).setDepth(70);
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

    const waveButton = this.makeUiButton(840, 30, 184, 42, 0x9a3c2f, '조기 웨이브', 20, 80);
    waveButton.on('pointerdown', () => this.startNextWave(true));
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
      const price = this.add.text(bx, by + 25, `$${cfg.cost}`, { fontSize: '11px', color: '#ffffff', backgroundColor: '#00000099', padding: { x: 3, y: 1 } }).setOrigin(0.5);
      b.on('pointerdown', () => {
        if (this.gold < cfg.cost) {
          this.showMessage(`골드 부족: ${cfg.label} 필요 ${cfg.cost}`);
          menu.destroy();
          return;
        }
        this.gold -= cfg.cost;
        spot.disableInteractive().setVisible(false);
        glow.destroy();
        plus.destroy();
        const tower = new Tower(this, x, y, cfg);
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
    this.refreshHud();
    this.selectTower(tower);
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
      this.castingSpell = 'meteor';
      this.showMessage('메테오 지점을 터치하세요');
    });

    const mercenary = this.makeUiButton(260, 500, 160, 46, 0x2f4f35, '', 18, 80);
    this.mercenaryText = this.add.text(260, 500, '🛡️ 용병소환', { fontSize: '18px', color: '#fff', fontStyle: 'bold' }).setOrigin(0.5).setDepth(82);
    mercenary.on('pointerdown', () => {
      if (this.mercenaryCooldownMs > 0) return this.showMessage('용병소환 쿨타임 중');
      this.castingSpell = 'mercenary';
      this.showMessage('용병을 소환할 길 위를 터치하세요');
    });

    const heroSkill = this.makeUiButton(440, 500, 170, 46, 0x4f3d1f, '', 18, 80);
    this.heroSkillText = this.add.text(440, 500, '🦁 대지강타', { fontSize: '18px', color: '#fff', fontStyle: 'bold' }).setOrigin(0.5).setDepth(82);
    heroSkill.on('pointerdown', () => {
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
    this.meteorCooldownMs = 24000;
    const warning = this.add.circle(x, y, radius, 0xff3b2f, 0.14).setStrokeStyle(2, 0xfff0a3, 0.8).setDepth(50);
    this.tweens.add({ targets: warning, scale: 0.75, duration: 160, yoyo: true, onComplete: () => warning.destroy() });
    this.time.delayedCall(170, () => {
      const boom = this.add.circle(x, y, radius, 0xfff0a3, 0.35).setDepth(51);
      this.tweens.add({ targets: boom, scale: 1.5, alpha: 0, duration: 300, onComplete: () => boom.destroy() });
      this.enemies.forEach((enemy) => {
        if (!enemy.dead && Phaser.Math.Distance.Between(x, y, enemy.x, enemy.y) <= radius) enemy.receiveDamage(100, 'true');
      });
    });
  }

  private castMercenaries(x: number, y: number): void {
    this.mercenaryCooldownMs = 20000;
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

  private startNextWave(early: boolean): void {
    if (this.waveRunning) return;
    if (this.waveIndex >= this.stage.waves.length - 1) return;
    if (early && this.waveIndex >= 0) {
      const bonus = this.stage.id === 'stage_002' ? 30 : 25;
      this.gold += bonus;
      this.showMessage(`조기 호출 보너스 +$${bonus}`);
    }
    this.waveIndex += 1;
    this.waveRunning = true;
    this.refreshHud();
    this.spawnWave(this.stage.waves[this.waveIndex]);
  }

  private spawnWave(groups: WaveSpawn[]): void {
    let delay = 0;
    groups.forEach((group) => {
      for (let i = 0; i < group.count; i++) {
        this.time.delayedCall(delay, () => {
          const enemy = new Enemy(this, { ...ENEMIES[group.kind] }, this.stage.path);
          this.enemies.push(enemy);
        });
        delay += group.gapMs;
      }
      delay += group.delayAfterMs ?? 800;
    });
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
    this.add.rectangle(480, 270, 580, 320, 0x0b1220, 0.94).setDepth(92).setStrokeStyle(2, 0xff8080, 0.45);
    this.add.text(480, 180, 'DEFENSE FAILED', { fontSize: '40px', color: '#ff8080', fontStyle: 'bold' }).setOrigin(0.5).setDepth(93);
    this.add.text(480, 242, `${this.stage.title} / Wave ${this.waveIndex + 1} / Score ${this.score}`, { fontSize: '21px', color: '#ffffff' }).setOrigin(0.5).setDepth(93);
    const world = this.makeUiButton(370, 330, 180, 48, 0x284f39, '월드맵', 22, 93);
    world.on('pointerdown', () => this.scene.start('WorldMapScene', { user: this.user, save: this.save }));

    const retry = this.makeUiButton(590, 330, 180, 48, 0x24486b, '다시 도전', 22, 93);
    retry.on('pointerdown', () => this.scene.restart({ user: this.user, save: this.save, stageId: this.stage.id }));
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
    world.on('pointerdown', () => this.scene.start('WorldMapScene', { user: this.user, save: this.save }));

    const retry = this.makeUiButton(590, 420, 180, 48, 0x24486b, '다시 도전', 22, 93);
    retry.on('pointerdown', () => this.scene.restart({ user: this.user, save: this.save, stageId: this.stage.id }));
  }

  private makeUiButton(x: number, y: number, width: number, height: number, color: number, label: string, fontSize = 18, depth = 10): Phaser.GameObjects.Rectangle {
    const rect = this.add.rectangle(x, y, width, height, color, 1).setStrokeStyle(2, 0xfff1c2, 0.35).setInteractive({ useHandCursor: true }).setDepth(depth);
    if (label) this.add.text(x, y, label, { fontSize: `${fontSize}px`, color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5).setDepth(depth + 1);
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
