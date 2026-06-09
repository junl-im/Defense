import Phaser from 'phaser';
import type { User } from 'firebase/auth';
import { ENEMIES, MAX_LIVES, STAGE_ID, START_GOLD, TOWERS, WAVES } from '../game/balance';
import type { PathPoint, TowerKind, WaveSpawn } from '../game/types';
import { Enemy } from '../game/Enemy';
import { Hero } from '../game/Hero';
import { Soldier } from '../game/Soldier';
import { Tower } from '../game/Tower';
import type { PlayerSave } from '../services/firebase';
import { fetchLeaderboard, saveStageClear, submitLeaderboard } from '../services/firebase';

const PATH: PathPoint[] = [
  { x: -30, y: 285 },
  { x: 150, y: 285 },
  { x: 225, y: 165 },
  { x: 395, y: 165 },
  { x: 500, y: 365 },
  { x: 700, y: 365 },
  { x: 795, y: 220 },
  { x: 990, y: 220 }
];

const SPOTS: PathPoint[] = [
  { x: 165, y: 200 },
  { x: 290, y: 255 },
  { x: 410, y: 95 },
  { x: 530, y: 285 },
  { x: 645, y: 435 },
  { x: 790, y: 305 }
];

type CastingSpell = 'meteor' | 'mercenary' | undefined;

export class GameScene extends Phaser.Scene {
  user!: User;
  save!: PlayerSave;
  gold = START_GOLD;
  lives = MAX_LIVES;
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
  messageText!: Phaser.GameObjects.Text;
  meteorText!: Phaser.GameObjects.Text;
  mercenaryText!: Phaser.GameObjects.Text;
  heroSkillText!: Phaser.GameObjects.Text;

  constructor() {
    super('GameScene');
  }

  init(data: { user: User; save: PlayerSave }): void {
    this.user = data.user;
    this.save = data.save;
  }

  create(): void {
    this.startTime = Date.now();
    this.drawMap();
    this.createHud();
    this.createTowerSpots();
    this.hero = new Hero(this, 95, 360);
    this.hero.on('pointerdown', () => this.showMessage('영웅 레온 선택됨. 맵을 터치하면 이동합니다.'));
    this.createSpells();
    this.createInputHandlers();
    this.showMessage('타워 스팟을 눌러 건설하세요. 영웅은 빈 맵 터치로 이동!');
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
        this.lives -= 1;
        enemy.destroy();
        enemy.dead = true;
        this.refreshHud();
      } else if (enemy.dead && enemy.hp <= 0) {
        this.gold += enemy.config.reward;
        this.score += enemy.config.reward * 10 + this.lives * 2;
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
      if (this.waveIndex >= WAVES.length - 1) void this.finishStage();
      else this.showMessage('웨이브 클리어! 조기 호출로 추가 골드 획득 가능');
    }

    this.refreshSpellHud();
  }

  private drawMap(): void {
    const g = this.add.graphics();
    g.fillStyle(0x203c2b, 1).fillRect(0, 0, 960, 540);
    g.lineStyle(44, 0x8a6b3f, 1);
    g.beginPath();
    g.moveTo(PATH[0].x, PATH[0].y);
    PATH.slice(1).forEach((p) => g.lineTo(p.x, p.y));
    g.strokePath();
    g.lineStyle(26, 0xb08a52, 1);
    g.beginPath();
    g.moveTo(PATH[0].x, PATH[0].y);
    PATH.slice(1).forEach((p) => g.lineTo(p.x, p.y));
    g.strokePath();

    this.add.text(30, 500, 'Stage 001: 숲길 방어전', { fontSize: '18px', color: '#dbe7ff' });
  }

  private createHud(): void {
    this.add.rectangle(480, 30, 960, 60, 0x0b1220, 0.88);
    this.add.rectangle(480, 510, 960, 60, 0x0b1220, 0.78);
    this.livesText = this.add.text(24, 18, '', { fontSize: '24px', color: '#ff8080' });
    this.goldText = this.add.text(140, 18, '', { fontSize: '24px', color: '#f7d36b' });
    this.waveText = this.add.text(280, 18, '', { fontSize: '24px', color: '#ffffff' });
    this.messageText = this.add.text(480, 70, '', {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#00000099',
      padding: { x: 10, y: 6 }
    }).setOrigin(0.5).setVisible(false).setDepth(80);

    const waveButton = this.add.rectangle(840, 30, 180, 42, 0x9a3c2f, 1).setStrokeStyle(2, 0xffd0aa).setInteractive({ useHandCursor: true });
    this.add.text(840, 30, '조기 웨이브', { fontSize: '20px', color: '#ffffff' }).setOrigin(0.5);
    waveButton.on('pointerdown', () => this.startNextWave(true));
    this.refreshHud();
  }

  private createTowerSpots(): void {
    SPOTS.forEach((spot) => {
      const circle = this.add.circle(spot.x, spot.y, 25, 0xffffff, 0.18).setStrokeStyle(2, 0xffffff, 0.5);
      this.add.text(spot.x, spot.y, '+', { fontSize: '34px', color: '#ffffff' }).setOrigin(0.5);
      circle.setInteractive({ useHandCursor: true });
      circle.on('pointerdown', () => this.openBuildMenu(spot.x, spot.y, circle));
    });
  }

  private openBuildMenu(x: number, y: number, spot: Phaser.GameObjects.Arc): void {
    if (this.settingRallyFor && this.time.now >= this.rallyReadyAt) {
      this.settingRallyFor.setRallyPoint(x, y);
      this.settingRallyFor = undefined;
      this.showMessage('집결지 변경 완료');
      return;
    }

    this.destroySelectedPanel();
    const menu = this.add.container(x, y).setDepth(35);
    const kinds: TowerKind[] = ['archer', 'mage', 'barracks', 'artillery'];
    kinds.forEach((kind, idx) => {
      const angle = -Math.PI / 2 + idx * (Math.PI * 2 / kinds.length);
      const bx = Math.cos(angle) * 62;
      const by = Math.sin(angle) * 62;
      const cfg = TOWERS[kind];
      const b = this.add.circle(bx, by, 27, cfg.color, 1).setStrokeStyle(2, 0xffffff).setInteractive({ useHandCursor: true });
      const t = this.add.text(bx, by - 2, cfg.label[0], { fontSize: '18px', color: '#101820', fontStyle: 'bold' }).setOrigin(0.5);
      const price = this.add.text(bx, by + 23, `$${cfg.cost}`, { fontSize: '11px', color: '#ffffff', backgroundColor: '#00000088' }).setOrigin(0.5);
      b.on('pointerdown', () => {
        if (this.gold < cfg.cost) {
          this.showMessage(`골드 부족: ${cfg.label} 필요 ${cfg.cost}`);
          menu.destroy();
          return;
        }
        this.gold -= cfg.cost;
        spot.disableInteractive().setVisible(false);
        const tower = new Tower(this, x, y, cfg);
        if (kind === 'barracks') tower.spawnSoldiers();
        tower.on('pointerdown', () => this.selectTower(tower));
        this.towers.push(tower);
        menu.destroy();
        this.refreshHud();
        this.showMessage(`${cfg.label} 건설 완료`);
      });
      menu.add([b, t, price]);
    });

    this.time.delayedCall(2800, () => menu.active && menu.destroy());
  }

  private selectTower(tower: Tower): void {
    this.selectedTower?.rangeCircle.setVisible(false);
    this.destroySelectedPanel();
    this.selectedTower = tower;
    tower.rangeCircle.setVisible(true);
    this.createTowerPanel(tower);
  }

  private createTowerPanel(tower: Tower): void {
    const panel = this.add.container(800, 438).setDepth(60);
    const bg = this.add.rectangle(0, 0, 286, tower.config.kind === 'barracks' ? 126 : 82, 0x0b1220, 0.93).setStrokeStyle(2, 0x7cc7ff, 0.65);
    const title = this.add.text(-128, -42, `${tower.config.label} Lv.${tower.level}`, { fontSize: '18px', color: '#f7d36b', fontStyle: 'bold' });
    const skill = this.add.text(-128, -18, tower.level >= 3 ? `특수: ${tower.config.maxSkill}` : `Lv.3 특수: ${tower.config.maxSkill}`, { fontSize: '14px', color: '#dbe7ff' });
    panel.add([bg, title, skill]);

    const cost = tower.upgradeCost;
    const up = this.add.rectangle(-56, 30, 138, 38, cost ? 0x24486b : 0x333333, 1).setStrokeStyle(2, 0xffffff, 0.3).setInteractive({ useHandCursor: true });
    const upText = this.add.text(-56, 30, cost ? `업그레이드 $${cost}` : '최고 레벨', { fontSize: '15px', color: '#ffffff' }).setOrigin(0.5);
    up.on('pointerdown', () => this.upgradeSelectedTower());
    panel.add([up, upText]);

    if (tower.config.kind === 'barracks') {
      const rally = this.add.rectangle(92, 30, 108, 38, 0x3f5f2f, 1).setStrokeStyle(2, 0xffffff, 0.3).setInteractive({ useHandCursor: true });
      const rallyText = this.add.text(92, 30, '집결지', { fontSize: '15px', color: '#ffffff' }).setOrigin(0.5);
      rally.on('pointerdown', () => {
        this.settingRallyFor = tower;
        this.rallyReadyAt = this.time.now + 120;
        this.showMessage('집결지를 놓을 길 위를 터치하세요');
      });
      panel.add([rally, rallyText]);
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
    const meteor = this.add.rectangle(96, 500, 150, 46, 0x4f1f1f, 1).setStrokeStyle(2, 0xff7777).setInteractive({ useHandCursor: true });
    this.meteorText = this.add.text(96, 500, '⚡ 메테오', { fontSize: '19px', color: '#fff' }).setOrigin(0.5);
    meteor.on('pointerdown', () => {
      if (this.meteorCooldownMs > 0) return this.showMessage('메테오 쿨타임 중');
      this.castingSpell = 'meteor';
      this.showMessage('메테오 지점을 터치하세요');
    });

    const mercenary = this.add.rectangle(260, 500, 160, 46, 0x2f4f35, 1).setStrokeStyle(2, 0xa6ffb0).setInteractive({ useHandCursor: true });
    this.mercenaryText = this.add.text(260, 500, '🛡️ 용병소환', { fontSize: '18px', color: '#fff' }).setOrigin(0.5);
    mercenary.on('pointerdown', () => {
      if (this.mercenaryCooldownMs > 0) return this.showMessage('용병소환 쿨타임 중');
      this.castingSpell = 'mercenary';
      this.showMessage('용병을 소환할 길 위를 터치하세요');
    });

    const heroSkill = this.add.rectangle(440, 500, 170, 46, 0x4f3d1f, 1).setStrokeStyle(2, 0xffe0a3).setInteractive({ useHandCursor: true });
    this.heroSkillText = this.add.text(440, 500, '🦁 대지강타', { fontSize: '18px', color: '#fff' }).setOrigin(0.5);
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

      this.hero.moveTo(p.x, p.y);
    });
  }

  private castMeteor(x: number, y: number): void {
    const radius = 76;
    this.meteorCooldownMs = 24000;
    const boom = this.add.circle(x, y, radius, 0xfff0a3, 0.35).setDepth(30);
    this.tweens.add({ targets: boom, scale: 1.5, alpha: 0, duration: 300, onComplete: () => boom.destroy() });
    this.enemies.forEach((enemy) => {
      if (!enemy.dead && Phaser.Math.Distance.Between(x, y, enemy.x, enemy.y) <= radius) {
        enemy.receiveDamage(95, 'true');
      }
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
    this.add.circle(x, y, 34, 0xa6ffb0, 0.16).setDepth(20);
    this.showMessage('용병 2명 소환! 15초 동안 길막합니다');
  }

  private refreshSpellHud(): void {
    this.meteorText.setText(this.meteorCooldownMs > 0 ? `⚡ ${Math.ceil(this.meteorCooldownMs / 1000)}s` : '⚡ 메테오');
    this.mercenaryText.setText(this.mercenaryCooldownMs > 0 ? `🛡️ ${Math.ceil(this.mercenaryCooldownMs / 1000)}s` : '🛡️ 용병소환');
    this.heroSkillText.setText(this.hero.skillCooldownMs > 0 ? `🦁 ${Math.ceil(this.hero.skillCooldownMs / 1000)}s` : '🦁 대지강타');
  }

  private startNextWave(early: boolean): void {
    if (this.waveRunning) return;
    if (this.waveIndex >= WAVES.length - 1) return;
    if (early && this.waveIndex >= 0) this.gold += 25;
    this.waveIndex += 1;
    this.waveRunning = true;
    this.refreshHud();
    this.spawnWave(WAVES[this.waveIndex]);
  }

  private spawnWave(groups: WaveSpawn[]): void {
    let delay = 0;
    groups.forEach((group) => {
      for (let i = 0; i < group.count; i++) {
        this.time.delayedCall(delay, () => {
          const enemy = new Enemy(this, { ...ENEMIES[group.kind] }, PATH);
          this.enemies.push(enemy);
        });
        delay += group.gapMs;
      }
      delay += 800;
    });
  }

  private refreshHud(): void {
    this.livesText.setText(`♥ ${this.lives}`);
    this.goldText.setText(`$ ${this.gold}`);
    this.waveText.setText(`WAVE ${Math.max(0, this.waveIndex + 1)}/${WAVES.length}`);
  }

  private showMessage(text: string): void {
    this.messageText.setText(text).setVisible(true);
    this.time.delayedCall(1800, () => this.messageText.setVisible(false));
  }

  private showGameOver(): void {
    if (this.ended) return;
    this.ended = true;
    this.add.rectangle(480, 270, 560, 310, 0x0b1220, 0.94).setDepth(90);
    this.add.text(480, 185, 'DEFENSE FAILED', { fontSize: '40px', color: '#ff8080', fontStyle: 'bold' }).setOrigin(0.5).setDepth(91);
    this.add.text(480, 245, `Wave ${this.waveIndex + 1} / Score ${this.score}`, { fontSize: '22px', color: '#ffffff' }).setOrigin(0.5).setDepth(91);
    const retry = this.add.rectangle(480, 330, 180, 48, 0x24486b, 1).setStrokeStyle(2, 0x7cc7ff).setInteractive({ useHandCursor: true }).setDepth(91);
    this.add.text(480, 330, '다시 도전', { fontSize: '22px', color: '#ffffff' }).setOrigin(0.5).setDepth(92);
    retry.on('pointerdown', () => this.scene.restart({ user: this.user, save: this.save }));
  }

  private async finishStage(): Promise<void> {
    if (this.ended) return;
    this.ended = true;
    const clearTimeMs = Date.now() - this.startTime;
    const finalScore = this.score + this.lives * 500 + Math.max(0, 600000 - clearTimeMs) / 100;
    const roundedScore = Math.floor(finalScore);

    try {
      this.save = await saveStageClear(this.user, this.save, STAGE_ID, roundedScore, this.lives);
      await submitLeaderboard(this.user, this.save.nickname, {
        uid: this.user.uid,
        nickname: this.save.nickname,
        score: roundedScore,
        stageId: STAGE_ID,
        lives: this.lives,
        wave: WAVES.length,
        clearTimeMs
      });
      const top = await fetchLeaderboard(STAGE_ID);
      this.showResult(roundedScore, top);
    } catch (error) {
      console.error(error);
      this.showMessage('저장 실패: Firebase 설정/규칙을 확인하세요');
    }
  }

  private showResult(score: number, top: Array<{ nickname: string; score: number }>): void {
    this.add.rectangle(480, 270, 620, 420, 0x0b1220, 0.94).setDepth(50);
    this.add.text(480, 105, 'STAGE CLEAR', { fontSize: '44px', color: '#f7d36b', fontStyle: 'bold' }).setOrigin(0.5).setDepth(51);
    this.add.text(480, 160, `Score ${score} / Lives ${this.lives} / Stars ${this.save.stars}`, { fontSize: '24px', color: '#ffffff' }).setOrigin(0.5).setDepth(51);
    const lines = top.slice(0, 5).map((s, i) => `${i + 1}. ${s.nickname}  ${s.score}`).join('\n');
    this.add.text(480, 250, `오늘의 명예의 전당\n${lines || '아직 기록 없음'}`, { fontSize: '22px', color: '#dbe7ff', align: 'center' }).setOrigin(0.5).setDepth(51);
    const retry = this.add.rectangle(480, 420, 180, 48, 0x24486b, 1).setStrokeStyle(2, 0x7cc7ff).setInteractive({ useHandCursor: true }).setDepth(51);
    this.add.text(480, 420, '다시 도전', { fontSize: '22px', color: '#ffffff' }).setOrigin(0.5).setDepth(52);
    retry.on('pointerdown', () => this.scene.restart({ user: this.user, save: this.save }));
  }
}
