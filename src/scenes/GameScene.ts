import Phaser from 'phaser';
import type { User } from 'firebase/auth';
import { ENEMIES, getStageConfig, TOWERS } from '../game/balance';
import type { EnemyKind, PathPoint, StageConfig, TowerKind, WaveSpawn } from '../game/types';
import { Enemy } from '../game/Enemy';
import { Hero } from '../game/Hero';
import { Soldier } from '../game/Soldier';
import { Tower } from '../game/Tower';
import type { PlayerSave } from '../services/firebase';
import { fetchLeaderboard, saveStageClear, submitLeaderboard } from '../services/firebase';
import { pulseButton, shakeCamera, spawnBuildDust, spawnExplosionBurst, spawnImpactRing, spawnWaveBanner } from '../game/Effects';
import { isMuted, playMusic, playSfx, setMuted } from '../game/AudioManager';
import { getRelicBattleBonuses, modifierLabel, type DailyChallenge } from '../game/MegaSystems';
import { createQualityToggleButton, drawBattlePolish, installScenePerformanceWatch } from '../game/VisualPolish';
import { addPremiumBattleObjects } from '../game/BattlefieldArt';
import { addBuildSpotPreview, addPremiumPlaque, drawCinematicCombatFrame } from '../game/PremiumUx';
import { getTowerMasteries, type TowerMasteryId } from '../game/TowerMastery';
import { getHeroBattleBonus, getSelectedHero } from '../game/HeroLoadout';
import { installBattleDirectorHud } from '../game/TacticalDirector';
import { renderWaveIntelPanel, showBossCutin } from '../game/PremiumCombatUi';
import { castHeroStompPremiumFx, castMercenaryGateFx, castPremiumMeteor, openBossArenaRift, showArcaneSurge, showBossArenaPattern } from '../game/SpellEffects';
import { applyBossPatternState } from '../game/BossPatternState';
import { computeBattleRewards, rankMedal, showRewardChestOverlay, showStageObjectiveBanner } from '../game/CombatRewards';
import { grantBattleRewardInventory } from '../game/ArtifactForge';
import { showChestOpeningCinematic } from '../game/PremiumRewardForgeUi';
import { addPremiumChestSpotlight, addPremiumPanelGlints, addTowerPanelSurface, installPremiumButtonFx, showBattleStartLoading, showPremiumChestCharge, showPremiumToast } from '../game/PremiumFlowUi';
import { addHitZoneDebug } from '../game/HitZoneDebug';
import { BATTLE_SAFE_BOTTOM, BATTLE_SAFE_LEFT, BATTLE_SAFE_RIGHT, BATTLE_SAFE_TOP, clampToBattlefield, installCombatVisualDirector, isBattlefieldPoint } from '../game/BattleVisualDirector';
import { addStageV26Decor, applyWaveEventOpening, mutateEnemyForWaveEvent, type WaveEventRuntime } from '../game/CampaignExpansionV26';
import { applyRunModifiersToEnemy, getRunStartAdjustments, getStageRunModifiers, getTowerAura, runModifierColor, runModifierSummary, type RunModifier } from '../game/RunModifiers';
import { createTacticalOrderState, pickTacticalOrderChoices, shouldOfferTacticalOrder, applyTacticalOrderChoice, renderTacticalOrderCard, tacticalOrderSummary, type TacticalOrderChoice, type TacticalOrderState } from '../game/TacticalOrdersV27';
import { battleContractDetailLines, battleContractHudLine, battleContractResultLines, createBattleContractState, createStageBattleContracts, recordBattleContractEvent, type BattleContractEvent, type BattleContractState } from '../game/BattleContractsV28';
import { applyEnemyAffixV29, enemyAffixFullLineV29, enemyAffixHudLineV29, NO_ENEMY_AFFIX_V29, pickEnemyAffixV29, type EnemyAffixRuntimeV29 } from '../game/EnemyAffixesV29';
import { capCombatDeltaV29, isLiteModeV29, mobileShortNumberV29, recommendTowerForWaveV29, towerRoleLineV29 } from '../game/MobileBattleAdvisorV29';
import { V210_BUILD_HIT, V210_BUILD_MENU, V210_TOWER_HIT, V210_TOWER_PANEL, addV210ToastPlate, installV210BattlePolish, shortMetricV210 } from '../game/MobilePolishV210';

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
  activeBuildMenu?: Phaser.GameObjects.Container;
  settingRallyFor?: Tower;
  rallyReadyAt = 0;
  castingSpell: CastingSpell;
  spellTargetPreview?: Phaser.GameObjects.Container;
  private spellTargetRadius = 0;
  private spellTargetLabel?: Phaser.GameObjects.Text;
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
  runModifiers: RunModifier[] = [];
  private runModifierText?: Phaser.GameObjects.Text;
  private synergyText?: Phaser.GameObjects.Text;
  private commandAuraLabel = '기본';

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
  waveButtonText!: Phaser.GameObjects.Text;
  wavePreviewText!: Phaser.GameObjects.Text;
  waveIntelPanel?: Phaser.GameObjects.Container;
  waveAutoTimer?: Phaser.Time.TimerEvent;
  nextWaveCountdownMs = 0;
  private pendingWaveSpawns = 0;
  private spawnEvents: Phaser.Time.TimerEvent[] = [];
  private waveClearedAt = 0;
  private killStreak = 0;
  private bestKillStreak = 0;
  private lastKillAt = 0;
  private totalKills = 0;
  private totalLeaks = 0;
  private objectiveText?: Phaser.GameObjects.Text;
  private comboText?: Phaser.GameObjects.Text;
  private directorText?: Phaser.GameObjects.Text;
  private tacticalHintCooldownMs = 0;
  private nextHudRefreshAt = 0;
  private nextSpellHudRefreshAt = 0;
  private activeWaveEvent?: WaveEventRuntime;
  private tacticalOrderState: TacticalOrderState = createTacticalOrderState();
  private tacticalOrderHudText?: Phaser.GameObjects.Text;
  private tacticalOrderDraft?: Phaser.GameObjects.Container;
  private battleContractState: BattleContractState = createBattleContractState();
  private battleContractHudText?: Phaser.GameObjects.Text;
  private battleContractDetailText?: Phaser.GameObjects.Text;
  private activeEnemyAffix: EnemyAffixRuntimeV29 = NO_ENEMY_AFFIX_V29;
  private enemyAffixText?: Phaser.GameObjects.Text;
  private combatAdvisorText?: Phaser.GameObjects.Text;
  private lagSpikeCount = 0;
  private lagNoticeAt = 0;

  constructor() {
    super('GameScene');
  }

  init(data: { user: User; save: PlayerSave; stageId?: string; dailyChallenge?: DailyChallenge }): void {
    this.user = data.user;
    this.save = data.save;
    this.stage = getStageConfig(data.stageId);
    this.dailyChallenge = data.dailyChallenge;
    this.relicBonuses = getRelicBattleBonuses();
    this.runModifiers = getStageRunModifiers(this.stage, data.user?.uid ?? 'guest');
    const heroBonus = getHeroBattleBonus();
    const runStart = getRunStartAdjustments(this.runModifiers);
    this.gold = this.stage.startGold + this.relicBonuses.startGoldBonus + heroBonus.startGold + runStart.gold;
    if (this.dailyChallenge?.modifiers.includes('gold_rush')) this.gold = Math.round(this.gold * 1.25);
    this.lives = this.stage.maxLives + heroBonus.extraLives + runStart.lives;
    this.waveIndex = -1;
    this.enemies = [];
    this.towers = [];
    this.mercenaries = [];
    this.selectedTower = undefined;
    this.selectedPanel = undefined;
    this.activeBuildMenu = undefined;
    this.settingRallyFor = undefined;
    this.castingSpell = undefined;
    this.spellTargetPreview = undefined;
    this.spellTargetRadius = 0;
    this.spellTargetLabel = undefined;
    this.waveRunning = false;
    this.score = 0;
    this.ended = false;
    this.meteorCooldownMs = 0;
    this.mercenaryCooldownMs = 0;
    this.gameSpeed = 1;
    this.paused = false;
    this.waveAutoTimer = undefined;
    this.nextWaveCountdownMs = 0;
    this.pendingWaveSpawns = 0;
    this.spawnEvents = [];
    this.waveClearedAt = 0;
    this.killStreak = 0;
    this.bestKillStreak = 0;
    this.lastKillAt = 0;
    this.totalKills = 0;
    this.totalLeaks = 0;
    this.tacticalHintCooldownMs = 0;
    this.nextHudRefreshAt = 0;
    this.nextSpellHudRefreshAt = 0;
    this.runModifierText = undefined;
    this.synergyText = undefined;
    this.commandAuraLabel = '기본';
    this.activeWaveEvent = undefined;
    this.tacticalOrderState = createTacticalOrderState();
    this.tacticalOrderHudText = undefined;
    this.tacticalOrderDraft = undefined;
    this.battleContractState = createStageBattleContracts(this.stage, data.user?.uid ?? 'guest');
    this.battleContractHudText = undefined;
    this.battleContractDetailText = undefined;
    this.activeEnemyAffix = NO_ENEMY_AFFIX_V29;
    this.enemyAffixText = undefined;
    this.combatAdvisorText = undefined;
    this.lagSpikeCount = 0;
    this.lagNoticeAt = 0;
  }

  create(): void {
    this.time.timeScale = 1;
    this.input.setTopOnly(true);
    this.startTime = Date.now();
    this.drawMap();
    installCombatVisualDirector(this, this.stage);
    addPremiumBattleObjects(this, this.stage);
    drawBattlePolish(this, this.stage.theme);
    drawCinematicCombatFrame(this, this.stage.theme);
    installV210BattlePolish(this);
    addStageV26Decor(this, this.stage);
    installScenePerformanceWatch(this);
    this.createHud();
    this.createRunModifierHud();
    this.createTacticalOrderHud();
    this.createBattleContractHud();
    this.createV29CombatAdvisorHud();
    this.createUiInputGuards();
    this.installSceneCleanup();
    showBattleStartLoading(this, this.stage.title, '전술 배치 · 공세 분석 · 지휘 HUD 전개');
    this.showRunModifierBanner();
    this.time.delayedCall(760, () => this.showTacticalOrderDraft('opening'));
    this.time.delayedCall(920, () => this.refreshV29AdvisorForNextWave());
    this.createTowerSpots();
    const selectedHero = getSelectedHero();
    installBattleDirectorHud(this, this.stage, selectedHero);
    this.hero = new Hero(this, this.stage.path[0].x + 120, this.stage.path[0].y - 35);
    this.hero.damage = Math.round(this.hero.damage * getHeroBattleBonus(selectedHero.id).heroDamage * this.tacticalOrderState.heroDamageMultiplier);
    if (this.dailyChallenge?.modifiers.includes('hero_trial')) this.hero.damage = Math.round(this.hero.damage * 1.35);
    this.hero.on('pointerdown', () => this.showMessage('영웅 레온 선택됨. 빈 맵 터치로 이동합니다.'));
    this.createSpells();
    this.createInputHandlers();
    playMusic(this, 'bgm_battle', 0.18);
    window.addEventListener('kingdom-seed:user-activated', () => playMusic(this, 'bgm_battle', 0.18), { once: true });
    this.showMessage(`${this.stage.title}: ${this.stage.tip}`);
    this.refreshObjectivePanel();
    showStageObjectiveBanner(this, this.stage);
    this.showTacticalHint('지휘 목표: 생명력 보존 · 빠른 클리어 · 고연속 처치');
    if (this.dailyChallenge) {
      this.time.delayedCall(520, () => this.showMessage(`일일 도전: ${this.dailyChallenge!.modifiers.map(modifierLabel).join(' / ')}`));
    }
    // v2.2: 첫 웨이브는 자동 카운트하지 않는다. 플레이어가 전투 시작 버튼을 눌러 개시한다.
    this.nextWaveCountdownMs = 0;
    this.updateWaveButton();
    this.events.on('kingdom-seed:boss-pattern', (payload: { label: string; pattern: string; kind?: EnemyKind; x?: number; y?: number }) => {
      this.showMessage(`보스 패턴 발동: ${payload.label} - ${payload.pattern}`);
      showBossArenaPattern(this, payload);
      applyBossPatternState(this, payload, this.towers, this.mercenaries, this.enemies);
      playMusic(this, 'bgm_boss', 0.22);
    });
  }

  update(_: number, delta: number): void {
    if (this.ended || this.paused) return;
    const safeDelta = capCombatDeltaV29(delta);
    this.trackV29FrameSpike(delta);
    this.meteorCooldownMs = Math.max(0, this.meteorCooldownMs - safeDelta);
    this.mercenaryCooldownMs = Math.max(0, this.mercenaryCooldownMs - safeDelta);
    this.tacticalHintCooldownMs = Math.max(0, this.tacticalHintCooldownMs - safeDelta);
    if (!this.waveRunning && this.waveAutoTimer && this.waveIndex < this.stage.waves.length - 1) {
      this.nextWaveCountdownMs = Math.max(0, this.nextWaveCountdownMs - safeDelta);
    }

    this.enemies.forEach((enemy) => enemy.update(safeDelta));
    this.towers.forEach((tower) => tower.update(safeDelta, this.enemies));
    this.hero.update(safeDelta, this.enemies);
    this.mercenaries = this.mercenaries.filter((soldier) => soldier.active);
    this.mercenaries.forEach((soldier) => soldier.update(safeDelta, this.enemies));

    let needsEnemyCompact = false;
    for (let i = this.enemies.length - 1; i >= 0; i -= 1) {
      const enemy = this.enemies[i];
      if (enemy.reachedGoal) {
        const leakAmount = enemy.config.threat === 'boss' ? 3 : 1;
        this.lives -= leakAmount;
        this.totalLeaks += leakAmount;
        this.recordBattleContract({ type: 'leak', amount: leakAmount });
        this.killStreak = 0;
        this.refreshObjectivePanel();
        enemy.destroy();
        enemy.dead = true;
        needsEnemyCompact = true;
        this.forceHudRefresh();
      } else if (enemy.dead && enemy.hp === 0) {
        this.registerKill(enemy);
        enemy.hp = -9999;
        needsEnemyCompact = true;
        this.forceHudRefresh();
      }
    }
    if (needsEnemyCompact) this.enemies = this.enemies.filter((e) => e.active && !e.reachedGoal);

    if (this.lives <= 0) {
      this.showGameOver();
      return;
    }

    if (this.waveRunning && this.pendingWaveSpawns <= 0 && this.enemies.length === 0) {
      this.waveRunning = false;
      this.waveClearedAt = this.time.now;
      if (this.waveIndex >= this.stage.waves.length - 1) void this.finishStage();
      else {
        playMusic(this, 'bgm_battle', 0.18);
        this.showMessage('방어 성공! 10초 후 다음 공격이 시작됩니다.');
        this.scheduleNextWave(10000, false);
        this.time.delayedCall(260, () => this.showTacticalOrderDraft('wave'));
      }
    }

    this.refreshSpellHudThrottled();
    this.refreshHudThrottled();
  }

  private drawMap(): void {
    const theme = this.stage.theme;
    const bgKey = `battle-bg-${this.stage.id}`;
    const pathEdge = theme === 'forest' ? 0x6b4f2d : theme === 'canyon' ? 0x5b2f20 : theme === 'swamp' ? 0x304136 : 0x161116;
    const pathMain = theme === 'forest' ? 0xb08a52 : theme === 'canyon' ? 0xc2834e : theme === 'swamp' ? 0x79816a : 0x7c6b5e;

    if (this.textures.exists(bgKey)) {
      this.add.image(480, 270, bgKey).setDisplaySize(960, 540).setDepth(0);
      if (this.textures.exists('ui-safe-area-overlay-v47')) {
        this.add.image(480, 270, 'ui-safe-area-overlay-v47').setDisplaySize(960, 540).setDepth(2).setAlpha(0.35);
      }
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
    if (this.textures.exists('v1-combat-top-hud')) {
      this.add.image(480, 27, 'v1-combat-top-hud').setDisplaySize(922, 52).setDepth(70);
    } else if (this.textures.exists('ui-hud-top-panel')) {
      this.add.image(480, 32, 'ui-hud-top-panel').setDisplaySize(960, 64).setDepth(70);
    } else {
      this.add.rectangle(480, 30, 960, 60, 0x0b1220, 0.9).setDepth(70);
    }

    if (this.textures.exists('v1-combat-bottom-dock')) {
      this.add.image(480, 506, 'v1-combat-bottom-dock').setDisplaySize(930, 66).setDepth(70);
    } else if (this.textures.exists('ui-hud-bottom-panel')) {
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
    const count = isLiteModeV29() ? (theme === 'swamp' ? 5 : 4) : (theme === 'swamp' ? 13 : 9);
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
    const statStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontSize: '11px',
      color: '#fff7d6',
      fontStyle: 'bold',
      shadow: { offsetX: 0, offsetY: 2, color: '#000000', blur: 1, fill: true }
    };

    const usingV1Hud = this.textures.exists('v1-combat-top-hud');
    const makeStat = (x: number, w: number, label: string, icon: string, accent: number): Phaser.GameObjects.Text => {
      if (!usingV1Hud) addPremiumPlaque(this, x, 31, w, 42, accent, 74);
      this.add.text(x - w / 2 + 10, 10, label, {
        fontSize: '7px', color: usingV1Hud ? '#dbe7ff' : '#c8b184', fontStyle: 'bold',
        shadow: { offsetX: 0, offsetY: 1, color: '#000000', blur: 1, fill: true }
      }).setDepth(79);
      this.add.text(x - w / 2 + 11, 28, icon, {
        fontSize: '13px', color: '#ffffff', fontStyle: 'bold',
        shadow: { offsetX: 0, offsetY: 1, color: '#000000', blur: 1, fill: true }
      }).setOrigin(0, 0.5).setDepth(79);
      return this.add.text(x - w / 2 + 32, 28, '', statStyle).setOrigin(0, 0.5).setDepth(80);
    };

    this.livesText = makeStat(50, 78, 'LIFE', '♥', 0xff7070);
    this.goldText = makeStat(140, 88, 'GOLD', '$', 0xf7d36b);
    this.waveText = makeStat(242, 96, 'WAVE', '◆', 0x9ad7ff);

    if (!usingV1Hud) addPremiumPlaque(this, 470, 28, 210, 36, 0x9dd08b, 74);
    this.add.text(370, 9, 'BATTLEFIELD', {
      fontSize: '9px', color: '#c8b184', fontStyle: 'bold',
      shadow: { offsetX: 0, offsetY: 1, color: '#000000', blur: 1, fill: true }
    }).setDepth(79);
    const stageLabel = `S${this.stage.number}  ${this.stage.title}`;
    this.stageText = this.add.text(470, 28, stageLabel, {
      fontSize: '11px', color: '#dbe7ff', fontStyle: 'bold',
      fixedWidth: 200,
      align: 'center',
      shadow: { offsetX: 0, offsetY: 2, color: '#000000', blur: 1, fill: true }
    }).setOrigin(0.5).setDepth(80);

    this.messageText = this.add.text(480, 72, '', {
      fontSize: '10px',
      color: '#fff7d6',
      backgroundColor: '#19100bcc',
      padding: { x: 10, y: 6 },
      shadow: { offsetX: 0, offsetY: 2, color: '#000000', blur: 1, fill: true }
    }).setOrigin(0.5).setVisible(false).setDepth(90);

    if (!this.textures.exists('v1-combat-bottom-dock')) addPremiumPlaque(this, 482, 462, 292, 42, 0x7b58ff, 74);
    this.objectiveText = this.add.text(482, 462, '', {
      fontSize: '8px', color: '#fff4c2', fontStyle: 'bold', align: 'center', fixedWidth: 276,
      shadow: { offsetX: 0, offsetY: 1, color: '#000000', blur: 1, fill: true }
    }).setOrigin(0.5).setDepth(83);
    this.comboText = this.add.text(342, 432, '', {
      fontSize: '15px', color: '#ffef9a', fontStyle: 'bold',
      shadow: { offsetX: 0, offsetY: 2, color: '#000000', blur: 2, fill: true }
    }).setOrigin(0.5).setDepth(92).setVisible(false);
    this.directorText = this.add.text(480, 118, '', {
      fontSize: '14px', color: '#dbe7ff', fontStyle: 'bold', backgroundColor: '#07101ecc',
      padding: { x: 14, y: 7 }, align: 'center',
      shadow: { offsetX: 0, offsetY: 2, color: '#000000', blur: 2, fill: true }
    }).setOrigin(0.5).setDepth(91).setVisible(false);

    const soundButton = this.makeUiButton(626, 27, 38, 28, 0x263c52, '', 18, 80);
    this.soundText = this.add.text(626, 27, isMuted() ? 'OFF' : 'ON', { fontSize: '11px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5).setDepth(82);
    soundButton.on('pointerdown', () => {
      const next = !isMuted();
      setMuted(next);
      this.soundText.setText(next ? 'OFF' : 'ON');
      if (!next) playSfx(this, 'sfx_click');
    });

    const waveButton = this.makeUiButton(724, 27, 116, 28, 0xa94732, '', 16, 80);
    this.waveButtonText = this.add.text(724, 27, '전투 시작', {
      fontSize: '12px', color: '#fff8cf', fontStyle: 'bold',
      shadow: { offsetX: 0, offsetY: 2, color: '#000000', blur: 1, fill: true }
    }).setOrigin(0.5).setDepth(82);
    waveButton.on('pointerdown', () => {
      pulseButton(this, waveButton);
      this.startNextWave(true);
    });

    const speedButton = this.makeUiButton(830, 27, 42, 28, 0x24486b, '', 16, 80);
    this.speedText = this.add.text(830, 27, '1x', { fontSize: '12px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5).setDepth(82);
    speedButton.on('pointerdown', () => {
      pulseButton(this, speedButton);
      this.toggleSpeed();
    });

    const pauseButton = this.makeUiButton(888, 27, 36, 28, 0x2f3440, 'Ⅱ', 14, 80);
    pauseButton.on('pointerdown', () => {
      pulseButton(this, pauseButton);
      playSfx(this, 'sfx_click');
      this.openPauseOverlay();
    });

    this.refreshHud();
  }

  private createRunModifierHud(): void {
    if (this.runModifiers.length === 0) return;
    const width = 160;
    const startX = 618;
    this.runModifiers.slice(0, 2).forEach((modifier, index) => {
      const x = startX + index * 168;
      if (this.textures.exists('v2-season-chip')) {
        this.add.image(x, 68, 'v2-season-chip').setDisplaySize(width, 36).setDepth(81).setAlpha(0.92);
      } else {
        this.add.rectangle(x, 68, width, 34, 0x071c3e, 0.68).setDepth(81).setStrokeStyle(1, runModifierColor(modifier.tone), 0.55);
      }
      this.add.text(x - 64, 68, modifier.shortLabel, {
        fontSize: '9px', color: '#fff7d6', fontStyle: 'bold',
        fontFamily: 'Pretendard, Noto Sans KR, Arial, sans-serif',
        stroke: '#12366d', strokeThickness: 2,
      }).setOrigin(0, 0.5).setDepth(82);
      this.add.text(x - 4, 68, modifier.label, {
        fontSize: '9px', color: '#dff4ff', fontStyle: 'bold',
        fontFamily: 'Pretendard, Noto Sans KR, Arial, sans-serif',
        fixedWidth: 94,
      }).setOrigin(0, 0.5).setDepth(82);
    });
    this.runModifierText = this.add.text(480, 91, '', {
      fontSize: '9px', color: '#eaffff', fontStyle: 'bold', align: 'center',
      fontFamily: 'Pretendard, Noto Sans KR, Arial, sans-serif',
      backgroundColor: '#07101e99', padding: { x: 8, y: 4 },
      fixedWidth: 520,
      shadow: { offsetX: 0, offsetY: 1, color: '#00152d', blur: 2, fill: true },
    }).setOrigin(0.5).setDepth(82).setAlpha(0.0);
    this.runModifierText.setText(runModifierSummary(this.runModifiers));
    this.tweens.add({ targets: this.runModifierText, alpha: 0.95, duration: 220, delay: 360, yoyo: true, hold: 1700, onComplete: () => this.runModifierText?.setAlpha(0) });

    if (this.textures.exists('v2-synergy-panel')) {
      this.add.image(182, 68, 'v2-synergy-panel').setDisplaySize(250, 42).setDepth(81).setAlpha(0.86);
    } else {
      this.add.rectangle(182, 68, 250, 40, 0x082a36, 0.68).setDepth(81).setStrokeStyle(1, 0x8be878, 0.44);
    }
    this.synergyText = this.add.text(182, 68, '시너지: 타워 조합 대기', {
      fontSize: '9px', color: '#eafff2', fontStyle: 'bold', align: 'center', fixedWidth: 228,
      fontFamily: 'Pretendard, Noto Sans KR, Arial, sans-serif',
      stroke: '#06382f', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(82);
    this.refreshArmySynergy();
  }

  private showRunModifierBanner(): void {
    if (this.runModifiers.length === 0) return;
    const text = this.runModifiers.map((modifier) => modifier.label).join('  /  ');
    this.time.delayedCall(620, () => {
      if (this.ended) return;
      this.showMessage(`작전 변수: ${text}`);
    });
  }

  private refreshArmySynergy(): void {
    if (!this.synergyText) return;
    const kinds = new Set(this.towers.filter((tower) => tower.active).map((tower) => tower.config.kind));
    const aura = getTowerAura(this.runModifiers);
    let damageMultiplier = aura.damageMultiplier;
    let fireRateMultiplier = aura.fireRateMultiplier;
    let label = aura.label;

    if (kinds.size >= 4) {
      damageMultiplier *= 1.08;
      fireRateMultiplier *= 0.94;
      label = '왕국 연합';
    } else if (kinds.size >= 3) {
      damageMultiplier *= 1.05;
      label = '삼각 전술';
    } else if (kinds.size >= 2) {
      damageMultiplier *= 1.025;
      label = '복합 방어';
    }

    damageMultiplier *= this.tacticalOrderState.towerDamageMultiplier;
    fireRateMultiplier *= this.tacticalOrderState.towerFireRateMultiplier;
    if (this.tacticalOrderState.chosen.length > 0 && label === '기본') label = '작전 지휘';
    this.commandAuraLabel = label;
    this.towers.forEach((tower) => tower.setCommandAura(damageMultiplier, fireRateMultiplier, label));
    const damageText = `${Math.round((damageMultiplier - 1) * 100)}%`;
    const speedText = fireRateMultiplier < 1 ? ` / 속도 +${Math.round((1 - fireRateMultiplier) * 100)}%` : '';
    this.synergyText.setText(kinds.size > 0 ? `시너지 ${label} · 화력 +${damageText}${speedText}` : '시너지: 타워 조합 대기');
  }




  private createV29CombatAdvisorHud(): void {
    const bgKey = this.textures.exists('v2-affix-chip-v29') ? 'v2-affix-chip-v29' : undefined;
    if (bgKey) this.add.image(472, 104, bgKey).setDisplaySize(330, 34).setDepth(81).setAlpha(0.82);
    else this.add.rectangle(472, 104, 330, 32, 0x07101e, 0.62).setDepth(81).setStrokeStyle(1, 0x8fdcff, 0.38);

    this.enemyAffixText = this.add.text(472, 99, enemyAffixHudLineV29(this.activeEnemyAffix), {
      fontSize: '9px', color: '#eaf6ff', fontStyle: 'bold', align: 'center', fixedWidth: 310,
      fontFamily: 'Pretendard, Noto Sans KR, Arial, sans-serif',
      stroke: '#05203d', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(82);

    this.combatAdvisorText = this.add.text(472, 112, '다음 공세 분석 대기', {
      fontSize: '8px', color: '#fff4c2', fontStyle: 'bold', align: 'center', fixedWidth: 310,
      fontFamily: 'Pretendard, Noto Sans KR, Arial, sans-serif',
      stroke: '#2b1605', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(82);
    this.refreshV29AdvisorForNextWave();
  }

  private refreshV29AffixHud(): void {
    this.enemyAffixText?.setText(enemyAffixHudLineV29(this.activeEnemyAffix));
    if (this.enemyAffixText) this.enemyAffixText.setColor(this.activeEnemyAffix.id === 'none' ? '#eaf6ff' : '#fff4c2');
  }

  private refreshV29AdvisorForNextWave(): void {
    if (!this.combatAdvisorText) return;
    if (this.waveIndex >= this.stage.waves.length - 1 && !this.waveRunning) {
      this.combatAdvisorText.setText('전투 완료');
      return;
    }
    const nextIndex = this.waveRunning ? this.waveIndex : Math.max(0, this.waveIndex + 1);
    const groups = this.stage.waves[nextIndex];
    if (!groups) return;
    const advisor = recommendTowerForWaveV29(groups, ENEMIES);
    this.combatAdvisorText.setText(`${advisor.title} · ${advisor.reason}`);
  }

  private trackV29FrameSpike(deltaMs: number): void {
    if (deltaMs < 95) {
      this.lagSpikeCount = Math.max(0, this.lagSpikeCount - 1);
      return;
    }
    this.lagSpikeCount += 1;
    if (this.lagSpikeCount >= 4 && this.time.now > this.lagNoticeAt) {
      this.lagNoticeAt = this.time.now + 12000;
      this.lagSpikeCount = 0;
      this.showMessage('프레임 스파이크 감지 · 시뮬레이션 점프 방지 적용 중');
    }
  }

  private createTacticalOrderHud(): void {
    const bg = this.textures.exists('v2-command-scroll-v27')
      ? this.add.image(778, 68, 'v2-command-scroll-v27').setDisplaySize(254, 42).setDepth(81).setAlpha(0.90)
      : this.add.rectangle(778, 68, 254, 38, 0x07101e, 0.70).setStrokeStyle(1, 0xffd56c, 0.42).setDepth(81);
    bg.setInteractive({ useHandCursor: true }).on('pointerdown', () => this.showTacticalOrderDraft('manual'));
    this.tacticalOrderHudText = this.add.text(778, 68, tacticalOrderSummary(this.tacticalOrderState), {
      fontFamily: 'Pretendard, Noto Sans KR, Arial, sans-serif',
      fontSize: '9px',
      fontStyle: 'bold',
      color: '#fff4c2',
      align: 'center',
      fixedWidth: 230,
      stroke: '#092247',
      strokeThickness: 2,
    }).setOrigin(0.5).setDepth(82);
  }

  private refreshTacticalOrderHud(): void {
    this.tacticalOrderHudText?.setText(tacticalOrderSummary(this.tacticalOrderState));
  }

  private createBattleContractHud(): void {
    const bg = this.textures.exists('v2-contract-chip')
      ? this.add.image(182, 108, 'v2-contract-chip').setDisplaySize(254, 44).setDepth(81).setAlpha(0.92)
      : this.add.rectangle(182, 108, 254, 42, 0x07101e, 0.74).setStrokeStyle(1, 0x7ce8ff, 0.42).setDepth(81);
    bg.setInteractive({ useHandCursor: true }).on('pointerdown', () => this.showBattleContractSummary());
    this.battleContractHudText = this.add.text(182, 103, battleContractHudLine(this.battleContractState), {
      fontFamily: 'Pretendard, Noto Sans KR, Arial, sans-serif',
      fontSize: '9px',
      fontStyle: 'bold',
      color: '#eaf8ff',
      align: 'center',
      fixedWidth: 230,
      stroke: '#061730',
      strokeThickness: 2,
    }).setOrigin(0.5).setDepth(82);
    this.battleContractDetailText = this.add.text(182, 120, battleContractDetailLines(this.battleContractState).join('   '), {
      fontFamily: 'Pretendard, Noto Sans KR, Arial, sans-serif',
      fontSize: '8px',
      fontStyle: 'bold',
      color: '#fff4c2',
      align: 'center',
      fixedWidth: 238,
      stroke: '#061730',
      strokeThickness: 2,
    }).setOrigin(0.5).setDepth(82);
  }

  private refreshBattleContractHud(): void {
    this.battleContractHudText?.setText(battleContractHudLine(this.battleContractState));
    this.battleContractDetailText?.setText(battleContractDetailLines(this.battleContractState).join('   '));
  }

  private showBattleContractSummary(): void {
    const lines = this.battleContractState.contracts
      .map((contract) => `${contract.completed ? '완료' : contract.failed ? '실패' : '진행'} · ${contract.title}  ${contract.progress}/${contract.goal}`)
      .join(' / ');
    this.showMessage(lines || '전장 계약 대기');
  }

  private recordBattleContract(event: BattleContractEvent): void {
    const completed = recordBattleContractEvent(this.battleContractState, event);
    completed.forEach((contract, index) => {
      this.gold += contract.rewardGold;
      this.time.delayedCall(index * 180, () => {
        if (!this.ended) this.showMessage(`전장 계약 완료: ${contract.shortTitle} +$${contract.rewardGold}`);
      });
    });
    if (completed.length > 0) {
      playSfx(this, 'sfx_reward');
      showPremiumToast(this, `전장 계약 ${completed.length}개 완료`, 'success');
      this.forceHudRefresh();
    } else {
      this.refreshBattleContractHud();
    }
  }

  private showTacticalOrderDraft(reason: 'opening' | 'wave' | 'manual'): void {
    if (this.ended || this.tacticalOrderDraft?.active) return;
    if (reason !== 'manual' && !shouldOfferTacticalOrder(this.tacticalOrderState, this.waveIndex, this.stage.waves.length)) return;
    if (reason === 'manual' && this.tacticalOrderState.chosen.length >= 4) {
      this.showMessage('이번 전투의 작전 카드는 모두 선택했습니다.');
      return;
    }

    const choices = pickTacticalOrderChoices(this.stage, this.user?.uid ?? 'guest', this.waveIndex, this.tacticalOrderState);
    if (choices.length === 0) return;

    const root = this.add.container(480, 270).setDepth(132);
    this.tacticalOrderDraft = root;
    const blocker = this.add.rectangle(0, 0, 960, 540, 0x020611, 0.48).setInteractive({ useHandCursor: false });
    const panel = this.textures.exists('v2-order-panel-v27')
      ? this.add.image(0, 4, 'v2-order-panel-v27').setDisplaySize(900, 310)
      : this.add.rectangle(0, 4, 900, 310, 0x07101e, 0.92).setStrokeStyle(3, 0xffd56c, 0.62);
    const title = this.add.text(0, -132, reason === 'opening' ? '오늘의 작전 명령 선택' : '전황 카드 선택', {
      fontFamily: 'Pretendard, Noto Sans KR, Arial, sans-serif',
      fontSize: '20px',
      fontStyle: 'bold',
      color: '#fff4c2',
      stroke: '#092247',
      strokeThickness: 4,
    }).setOrigin(0.5);
    const subtitle = this.add.text(0, -104, '모바일 전투 흐름에 맞춰 한 장을 골라 이번 전투를 강화하세요.', {
      fontFamily: 'Pretendard, Noto Sans KR, Arial, sans-serif',
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#dbe7ff',
    }).setOrigin(0.5);
    root.add([blocker, panel, title, subtitle]);

    choices.forEach((choice, index) => {
      const card = renderTacticalOrderCard(this, -276 + index * 276, 22, choice, () => this.pickTacticalOrder(choice));
      root.add(card);
    });

    const skip = this.add.text(0, 142, reason === 'manual' ? '닫기' : '이번에는 건너뛰기', {
      fontFamily: 'Pretendard, Noto Sans KR, Arial, sans-serif',
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#fff4c2',
      backgroundColor: '#07101ecc',
      padding: { x: 16, y: 7 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    skip.on('pointerdown', () => this.closeTacticalOrderDraft());
    root.add(skip);
    this.tweens.add({ targets: root, alpha: { from: 0, to: 1 }, scaleX: { from: 0.985, to: 1 }, scaleY: { from: 0.985, to: 1 }, duration: 180, ease: 'Sine.easeOut' });
  }

  private closeTacticalOrderDraft(): void {
    const draft = this.tacticalOrderDraft;
    this.tacticalOrderDraft = undefined;
    if (!draft?.active) return;
    this.tweens.add({ targets: draft, alpha: 0, y: draft.y - 8, duration: 150, ease: 'Sine.easeIn', onComplete: () => draft.destroy() });
  }

  private pickTacticalOrder(choice: TacticalOrderChoice): void {
    applyTacticalOrderChoice(this.tacticalOrderState, choice, this.waveIndex);
    const effects = choice.effects;
    if (effects.instantGold) this.gold += Math.round(effects.instantGold + this.stage.number * 6);
    if (effects.healLives) this.lives += effects.healLives;
    if (effects.cooldownReductionMs) this.reduceAllCooldowns(effects.cooldownReductionMs);
    if (effects.heroDamageMultiplier && this.hero) this.hero.damage = Math.round(this.hero.damage * effects.heroDamageMultiplier);
    if (effects.overdriveMs) this.towers.forEach((tower) => tower.activateOverdrive(effects.overdriveMs));
    this.refreshArmySynergy();
    this.forceHudRefresh();
    this.closeTacticalOrderDraft();
    this.showMessage(`${choice.title} 적용 · ${choice.tag}`);
    showPremiumToast(this, `${choice.title} 적용`, 'info');
  }

  private reduceAllCooldowns(amountMs: number): void {
    this.meteorCooldownMs = Math.max(0, this.meteorCooldownMs - amountMs);
    this.mercenaryCooldownMs = Math.max(0, this.mercenaryCooldownMs - amountMs);
    if (this.hero) this.hero.skillCooldownMs = Math.max(0, this.hero.skillCooldownMs - amountMs);
  }

  private getSafeMapPoint(x: number, y: number): { x: number; y: number } {
    // v4.7: keep build spots away from the top HUD, bottom dock, and phone safe areas.
    // This prevents top-edge tower menus from opening outside the screen.
    return {
      x: Phaser.Math.Clamp(x, Math.max(88, BATTLE_SAFE_LEFT + 56), Math.min(872, BATTLE_SAFE_RIGHT - 56)),
      y: Phaser.Math.Clamp(y, BATTLE_SAFE_TOP + 36, BATTLE_SAFE_BOTTOM - 32),
    };
  }

  private clampOverlayPosition(
    x: number,
    y: number,
    width: number,
    height: number,
    margin = 12,
    bottomReserve = 98
  ): { x: number; y: number } {
    const topReserve = BATTLE_SAFE_TOP - 8;
    const minX = width / 2 + margin;
    const maxX = 960 - width / 2 - margin;
    const minY = Math.max(height / 2 + margin, topReserve + height / 2);
    const maxY = 540 - bottomReserve - height / 2;
    const safeY = maxY < minY ? 270 : Phaser.Math.Clamp(y, minY, maxY);
    return {
      x: Phaser.Math.Clamp(x, minX, maxX),
      y: safeY,
    };
  }

  private installSceneCleanup(): void {
    const cleanup = (): void => {
      this.waveAutoTimer?.remove(false);
      this.waveAutoTimer = undefined;
      this.spawnEvents.forEach((event) => event.remove(false));
      this.spawnEvents = [];
      this.clearSpellTargetPreview();
      this.tacticalOrderDraft?.destroy();
      this.tacticalOrderDraft = undefined;
      this.destroyBuildMenu();
      this.destroySelectedPanel();
      this.input.off('pointermove');
      this.input.off('pointerdown');
      this.time.timeScale = 1;
    };
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, cleanup);
    this.events.once(Phaser.Scenes.Events.DESTROY, cleanup);
  }

  private createUiInputGuards(): void {
    const makeGuard = (x: number, y: number, width: number, height: number, label: string): void => {
      const guard = this.add.zone(x, y, width, height)
        .setDepth(73)
        .setInteractive({ useHandCursor: false });
      const debug = this.add.container(x, y).setDepth(96);
      addHitZoneDebug(this, debug, width, height, label, 0x6bd7ff, 9);
      guard.once('destroy', () => debug.destroy());
    };
    makeGuard(480, BATTLE_SAFE_TOP / 2, 960, BATTLE_SAFE_TOP, 'HUD safe zone');
    makeGuard(480, (540 + BATTLE_SAFE_BOTTOM) / 2, 960, 540 - BATTLE_SAFE_BOTTOM, 'skill dock safe zone');
  }

  private beginSpellTargeting(kind: Exclude<CastingSpell, undefined>, label: string, radius: number, color: number): void {
    this.clearSpellTargetPreview();
    this.castingSpell = kind;
    this.spellTargetRadius = radius;

    const preview = this.add.container(this.input.activePointer.x, this.input.activePointer.y).setDepth(89);
    const base = this.textures.exists('v1-target-reticle')
      ? this.add.image(0, 0, 'v1-target-reticle').setDisplaySize(radius * 2.3, radius * 2.3).setAlpha(0.82).setBlendMode(Phaser.BlendModes.ADD)
      : this.add.circle(0, 0, radius, color, 0.08).setStrokeStyle(2, color, 0.62);
    const fill = this.add.circle(0, 0, radius, color, kind === 'meteor' ? 0.06 : 0.035)
      .setStrokeStyle(2, color, 0.48)
      .setBlendMode(Phaser.BlendModes.ADD);
    const dot = this.add.circle(0, 0, 5, 0xffffff, 0.78).setStrokeStyle(2, color, 0.92);
    this.spellTargetLabel = this.add.text(0, -radius - 20, label, {
      fontSize: '13px', color: '#fff7d6', fontStyle: 'bold',
      backgroundColor: '#07101ecc', padding: { x: 8, y: 4 },
      fontFamily: 'Pretendard, Noto Sans KR, Arial, sans-serif',
      shadow: { offsetX: 0, offsetY: 2, color: '#000000', blur: 2, fill: true }
    }).setOrigin(0.5);
    preview.add([fill, base, dot, this.spellTargetLabel]);
    this.tweens.add({ targets: [fill, base], scale: 1.08, alpha: '+=0.12', duration: 620, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.spellTargetPreview = preview;
    this.updateSpellTargetPreview(this.input.activePointer);
    this.showMessage(label);
  }

  private updateSpellTargetPreview(pointer: Phaser.Input.Pointer): void {
    if (!this.spellTargetPreview?.active || !this.castingSpell) return;
    const safePoint = isBattlefieldPoint(pointer.x, pointer.y);
    const target = safePoint ? { x: pointer.x, y: pointer.y } : clampToBattlefield(pointer.x, pointer.y);
    this.spellTargetPreview.setPosition(target.x, target.y);
    this.spellTargetPreview.setAlpha(safePoint ? 1 : 0.50);
    this.spellTargetLabel?.setText(safePoint ? (this.castingSpell === 'meteor' ? '메테오 착탄 지점' : '용병 소환 지점') : '전장 안쪽으로 자동 보정');
  }

  private clearSpellTargetPreview(): void {
    this.spellTargetPreview?.destroy();
    this.spellTargetPreview = undefined;
    this.spellTargetLabel = undefined;
    this.spellTargetRadius = 0;
  }

  private createTowerSpots(): void {
    this.stage.spots.forEach((spot) => {
      const safe = this.getSafeMapPoint(spot.x, spot.y);
      this.createBuildSpot(safe.x, safe.y);
    });
  }

  private createBuildSpot(x: number, y: number, autoOpen = false): void {
    const shadow = this.add.ellipse(x + 3, y + 12, 58, 18, 0x000000, 0.24).setDepth(11);
    const rim = this.add.ellipse(x, y + 3, 54, 28, 0x3b2818, 0.92).setStrokeStyle(3, 0xffd36b, 0.36).setDepth(12);
    const stone = this.add.ellipse(x, y, 46, 23, 0x7b6b57, 0.96).setStrokeStyle(2, 0x2b1b12, 0.48).setDepth(13);
    const light = this.add.ellipse(x - 8, y - 5, 20, 6, 0xffe1a0, 0.22).setDepth(14);
    const hammer = this.add.text(x, y - 7, '⚒', { fontSize: '14px', color: '#fff4c2', fontStyle: 'bold' }).setOrigin(0.5).setDepth(15);
    const tagBg = this.add.rectangle(x, y + 24, 62, 18, 0x130d09, 0.78).setStrokeStyle(1, 0xffd36b, 0.35).setDepth(16);
    const tag = this.add.text(x, y + 24, '건설', { fontSize: '9px', color: '#ffefb4', fontStyle: 'bold' }).setOrigin(0.5).setDepth(17);
    const premiumPad = this.textures.exists('v1-build-spot')
      ? this.add.image(x, y + 1, 'v1-build-spot').setDisplaySize(58, 42).setDepth(13)
      : undefined;
    if (premiumPad) {
      shadow.setVisible(false);
      rim.setAlpha(0.001);
      stone.setAlpha(0.001);
      light.setVisible(false);
      hammer.setVisible(false);
      tagBg.setAlpha(0.58).setFillStyle(0x07101e, 0.58).setStrokeStyle(1, 0x8fdcff, 0.42);
      tag.setText('건설').setColor('#eaf6ff');
    }
    const premiumPreview = addBuildSpotPreview(this, x, y, 0xffd36b);
    premiumPreview.setScale(0.78);
    premiumPreview.setVisible(false);
    const largeHitZone = this.add.rectangle(x, y + 1, V210_BUILD_HIT.width, V210_BUILD_HIT.height, 0xffffff, 0.001)
      .setDepth(19)
      .setInteractive({ useHandCursor: true });
    const spotDebug = this.add.container(x, y + 2).setDepth(20);
    addHitZoneDebug(this, spotDebug, V210_BUILD_HIT.width, V210_BUILD_HIT.height, 'build spot', 0xffd56c, V210_BUILD_HIT.radius);
    const extras: Phaser.GameObjects.GameObject[] = [shadow, light, tagBg, tag, premiumPreview, largeHitZone, spotDebug, ...(premiumPad ? [premiumPad] : [])];

    stone.setInteractive({ useHandCursor: true });
    const handleOver = (): void => {
      rim.setStrokeStyle(4, 0xfff0a3, 0.78);
      tag.setText('타워 선택');
      premiumPreview.setVisible(true);
    };
    const handleOut = (): void => {
      rim.setStrokeStyle(3, 0xffd36b, 0.36);
      tag.setText(premiumPad ? '건설' : '건설 가능');
      premiumPreview.setVisible(false);
    };
    const handleOpen = (): void => this.openBuildMenu(x, y, stone, rim, hammer, extras);
    stone.on('pointerover', handleOver);
    stone.on('pointerout', handleOut);
    stone.on('pointerdown', handleOpen);
    largeHitZone.on('pointerover', handleOver);
    largeHitZone.on('pointerout', handleOut);
    largeHitZone.on('pointerdown', handleOpen);
    this.tweens.add({ targets: [rim, light], alpha: '+=0.14', duration: 900, yoyo: true, repeat: -1 });

    if (autoOpen) {
      this.time.delayedCall(80, () => {
        if (stone.active) this.openBuildMenu(x, y, stone, rim, hammer, extras);
      });
    }
  }

  private openBuildMenu(
    x: number,
    y: number,
    spot: Phaser.GameObjects.Ellipse,
    rim: Phaser.GameObjects.Ellipse,
    hammer: Phaser.GameObjects.Text,
    extras: Phaser.GameObjects.GameObject[] = []
  ): void {
    if (this.settingRallyFor && this.time.now >= this.rallyReadyAt) {
      this.settingRallyFor.setRallyPoint(x, y);
      this.settingRallyFor = undefined;
      this.showMessage('집결지 변경 완료');
      return;
    }

    this.clearSpellTargetPreview();
    this.castingSpell = undefined;
    this.destroySelectedPanel();
    this.destroyBuildMenu();
    const menuPos = this.clampOverlayPosition(x, y - 12, V210_BUILD_MENU.width, V210_BUILD_MENU.height, 8, 90);
    const menu = this.add.container(menuPos.x, menuPos.y).setDepth(58);
    this.activeBuildMenu = menu;
    menu.once('destroy', () => {
      if (this.activeBuildMenu === menu) this.activeBuildMenu = undefined;
    });
    if (Math.abs(menuPos.x - x) > 4 || Math.abs(menuPos.y - y) > 4) {
      const guide = this.add.line(0, 0, x - menuPos.x, y - menuPos.y, 0, -76, 0xffd36b, 0.42)
        .setLineWidth(2)
        .setAlpha(0.72);
      menu.add(guide);
    }
    const bg = this.textures.exists('v1-tower-build-menu')
      ? this.add.image(0, 0, 'v1-tower-build-menu').setDisplaySize(V210_BUILD_MENU.width, V210_BUILD_MENU.height)
      : this.textures.exists('ui-build-menu-frame-v47')
        ? this.add.image(0, 0, 'ui-build-menu-frame-v47').setDisplaySize(V210_BUILD_MENU.width, V210_BUILD_MENU.height)
        : this.add.rectangle(0, 0, V210_BUILD_MENU.width, V210_BUILD_MENU.height, 0x130d09, 0.94).setStrokeStyle(3, 0xffd36b, 0.58);
    const header = this.add.text(0, -60, '방어 시설 선택', {
      fontSize: '10px', color: '#fff8d2', fontStyle: 'bold',
      fontFamily: 'Pretendard, Noto Sans KR, NanumGothic, Arial, sans-serif',
      shadow: { offsetX: 0, offsetY: 2, color: '#001b45', blur: 2, fill: true }
    }).setOrigin(0.5);
    const nextGroups = this.stage.waves[Math.max(0, this.waveRunning ? this.waveIndex : this.waveIndex + 1)] ?? [];
    const buildAdvisor = recommendTowerForWaveV29(nextGroups, ENEMIES);
    const hint = this.add.text(0, -44, `${buildAdvisor.title} · ${towerRoleLineV29(buildAdvisor.recommendedTower)}`, {
      fontSize: '8px', color: '#355d96', fontStyle: 'bold',
      fontFamily: 'Pretendard, Noto Sans KR, Arial, sans-serif'
    }).setOrigin(0.5);
    menu.add([bg, header, hint]);

    const positions = [
      { kind: 'archer' as TowerKind, x: -54, y: -6 },
      { kind: 'mage' as TowerKind, x: 54, y: -6 },
      { kind: 'barracks' as TowerKind, x: -54, y: 35 },
      { kind: 'artillery' as TowerKind, x: 54, y: 35 },
    ];

    positions.forEach(({ kind, x: bx, y: by }) => {
      const cfg = TOWERS[kind];
      const cost = this.towerCost(kind, cfg.cost);
      const canBuy = this.gold >= cost;
      const card = this.textures.exists('v1-tower-build-card')
        ? this.add.image(bx, by, 'v1-tower-build-card').setDisplaySize(V210_BUILD_MENU.cardWidth, V210_BUILD_MENU.cardHeight).setInteractive({ useHandCursor: true })
        : this.add.rectangle(bx, by, V210_BUILD_MENU.cardWidth, V210_BUILD_MENU.cardHeight, canBuy ? 0x23170f : 0x2b2b2b, 0.98)
          .setStrokeStyle(2, canBuy ? cfg.color : 0x5b5b5b, canBuy ? 0.65 : 0.45)
          .setInteractive({ useHandCursor: true });
      card.setAlpha(canBuy ? 1 : 0.55);
      const roleIconKey = `ui-tower-role-${kind}-v45`;
      const roleIcon = this.textures.exists(roleIconKey)
        ? this.add.image(bx - 35, by - 3, roleIconKey).setDisplaySize(25, 25).setAlpha(canBuy ? 1 : 0.45)
        : undefined;
      const iconBack = roleIcon ? undefined : this.add.circle(bx - 35, by - 3, 12, cfg.color, canBuy ? 0.95 : 0.38).setStrokeStyle(2, 0xffffff, 0.18);
      const icon = roleIcon ? undefined : this.add.text(bx - 35, by - 5, this.towerSymbol(kind), { fontSize: '16px', color: '#101820', fontStyle: 'bold' }).setOrigin(0.5);
      const name = this.add.text(bx - 14, by - 12, cfg.label, {
        fontSize: '8px', color: canBuy ? '#fff4c2' : '#aaa', fontStyle: 'bold',
        fontFamily: 'Pretendard, Noto Sans KR, Arial, sans-serif',
        shadow: { offsetX: 0, offsetY: 2, color: '#000000', blur: 2, fill: true }
      }).setOrigin(0, 0.5);
      const role = this.add.text(bx - 14, by - 1, this.towerRole(kind), {
        fontSize: '7px', color: canBuy ? '#dbe7ff' : '#888', fontStyle: 'bold',
        fontFamily: 'Pretendard, Noto Sans KR, Arial, sans-serif',
      }).setOrigin(0, 0.5);
      const price = this.add.text(bx - 14, by + 10, `$${cost}`, {
        fontSize: '8px', color: canBuy ? '#f7d36b' : '#999', fontStyle: 'bold',
        fontFamily: 'Pretendard, Noto Sans KR, Arial, sans-serif',
        shadow: { offsetX: 0, offsetY: 1, color: '#000000', blur: 1, fill: true }
      }).setOrigin(0, 0.5);
      card.on('pointerover', () => { card.setScale(1.03); card.setAlpha(canBuy ? 1 : 0.66); });
      card.on('pointerout', () => { card.setScale(1); card.setAlpha(canBuy ? 1 : 0.55); });
      card.on('pointerdown', () => {
        if (this.gold < cost) {
          this.showMessage(`${cfg.label} 건설에는 $${cost}가 필요합니다.`);
          return;
        }
        this.gold -= cost;
        spot.disableInteractive().setVisible(false);
        rim.destroy();
        hammer.destroy();
        extras.forEach((item) => item.destroy());
        const tower = new Tower(this, x, y, cfg);
        playSfx(this, 'sfx_build');
        spawnBuildDust(this, x, y);
        tower.applyPermanentUpgrades(this.save.upgrades);
        if (kind === 'barracks') tower.spawnSoldiers();
        const towerClickRing = this.textures.exists('v2-tower-selection-ring')
          ? this.add.image(x, y + 2, 'v2-tower-selection-ring').setDisplaySize(72, 72).setDepth(21).setAlpha(0).setBlendMode(Phaser.BlendModes.ADD)
          : this.textures.exists('ui-tower-click-ring-v47')
            ? this.add.image(x, y + 2, 'ui-tower-click-ring-v47').setDisplaySize(148, 128).setDepth(21).setAlpha(0)
            : undefined;
        const towerHitHalo = this.add.zone(x, y + V210_TOWER_HIT.offsetY, V210_TOWER_HIT.width, V210_TOWER_HIT.height)
          .setDepth(76)
          .setInteractive({ useHandCursor: true });
        towerHitHalo.on('pointerover', () => {
          tower.setScale(1.025);
          towerClickRing?.setAlpha(0.92);
        });
        towerHitHalo.on('pointerout', () => {
          tower.setScale(1);
          towerClickRing?.setAlpha(0);
        });
        towerHitHalo.on('pointerdown', () => this.selectTower(tower));
        tower.once('destroy', () => {
          towerHitHalo.destroy();
          towerClickRing?.destroy();
        });
        tower.on('pointerdown', () => this.selectTower(tower));
        this.towers.push(tower);
        this.recordBattleContract({ type: 'build', towerKind: kind });
        this.refreshArmySynergy();
        menu.destroy();
        this.refreshHud();
        this.showMessage(`${cfg.label} 배치 완료 · ${this.towerRole(kind)}`);
      });
      const cardDebug = this.add.container(bx, by);
      addHitZoneDebug(this, cardDebug, V210_BUILD_MENU.cardWidth, V210_BUILD_MENU.cardHeight, cfg.label, canBuy ? cfg.color : 0x999999, 9);
      menu.add([card, ...(roleIcon ? [roleIcon] : []), ...(iconBack ? [iconBack] : []), ...(icon ? [icon] : []), name, role, price, cardDebug]);
    });

    const close = this.add.text(0, 58, '빈 곳 터치: 닫기', { fontSize: '8px', color: '#355d96', fontStyle: 'bold' }).setOrigin(0.5);
    menu.add(close);
    this.time.delayedCall(6500, () => menu.active && menu.destroy());
  }

  private towerCost(kind: TowerKind, baseCost: number): number {
    let cost = baseCost;
    if (this.dailyChallenge?.modifiers.includes('no_mage') && kind === 'mage') cost = Math.round(cost * 1.65);
    if (this.dailyChallenge?.modifiers.includes('iron_wall') && kind === 'mage') cost = Math.round(cost * 0.92);
    cost = Math.max(1, Math.round(cost * this.tacticalOrderState.costMultiplier));
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
    const hasMasteryChoices = tower.level >= 3 && tower.canChooseMastery();
    const panelHeight = hasMasteryChoices ? 272 : tower.config.kind === 'barracks' ? 232 : 214;
    const panelWidth = V210_TOWER_PANEL.width;
    const preferredX = tower.x < 500 ? tower.x + V210_TOWER_PANEL.compactOffset : tower.x - V210_TOWER_PANEL.compactOffset;
    const preferredY = tower.y + 12;
    const panelPos = this.clampOverlayPosition(preferredX, preferredY - 8, panelWidth, panelHeight + 26, 10, 92);
    const panel = this.add.container(panelPos.x, panelPos.y).setDepth(82);
    if (Math.abs(panelPos.x - preferredX) > 8 || Math.abs(panelPos.y - preferredY) > 8) {
      const clampedBadge = this.add.text(0, -panelHeight / 2 - 12, '화면 안쪽으로 자동 정렬', {
        fontSize: '8px', color: '#fff4c2', fontStyle: 'bold', backgroundColor: '#07101ecc', padding: { x: 6, y: 3 }
      }).setOrigin(0.5);
      panel.add(clampedBadge);
    }
    if (this.textures.exists('v1-tower-command-panel')) {
      panel.add(this.add.image(0, 0, 'v1-tower-command-panel').setDisplaySize(panelWidth, panelHeight + 12));
    } else {
      addTowerPanelSurface(this, panel, panelWidth, panelHeight, tower.config.color);
      addPremiumPanelGlints(this, panel, panelWidth, panelHeight);
    }

    const icon = this.add.circle(-126, -panelHeight / 2 + 26, 13, tower.config.color, 0.9)
      .setStrokeStyle(2, 0xfff1c2, 0.55);
    const symbol = this.add.text(-126, -panelHeight / 2 + 25, this.towerSymbol(tower.config.kind), {
      fontSize: '13px', color: '#101820', fontStyle: 'bold'
    }).setOrigin(0.5);
    const title = this.add.text(-106, -panelHeight / 2 + 12, `${tower.config.label}  Lv.${tower.level}`, {
      fontSize: '12px', color: '#fff1bf', fontStyle: 'bold',
      fontFamily: 'Pretendard, Noto Sans KR, NanumGothic, Arial, sans-serif',
      shadow: { offsetX: 0, offsetY: 3, color: '#000000', blur: 3, fill: true }
    });
    const role = this.add.text(-106, -panelHeight / 2 + 33, this.towerRole(tower.config.kind), {
      fontSize: '9px', color: '#d8c39a', fontStyle: 'bold'
    });

    const masteryLabel = tower.level >= 3 ? `전문화: ${tower.masteryLabel}` : `Lv.3 특수: ${tower.config.maxSkill}`;
    const masteryLine = this.add.text(-132, -panelHeight / 2 + 58, masteryLabel, {
      fontSize: '8px', color: tower.level >= 3 ? '#0d8f57' : '#295f9e', fontStyle: 'bold', fixedWidth: 254,
      fontFamily: 'Pretendard, Noto Sans KR, NanumGothic, Arial, sans-serif'
    });
    const modeLabel = tower.config.kind === 'barracks' ? '전선 유지 / 집결지 운용' : `타겟 정책: ${tower.targetModeLabel()}`;
    const mode = this.add.text(-132, -panelHeight / 2 + 75, modeLabel, { fontSize: '8px', color: '#295f9e', fontStyle: 'bold', fontFamily: 'Pretendard, Noto Sans KR, Arial, sans-serif' });
    const statBox = this.add.rectangle(0, -panelHeight / 2 + 100, 256, 30, 0x050914, 0.58)
      .setStrokeStyle(1, 0xffe9a0, 0.17);
    const stat = this.add.text(-121, -panelHeight / 2 + 92, this.towerStatLine(tower), {
      fontSize: '8px', color: this.textures.exists('v1-tower-command-panel') ? '#eaf6ff' : '#3f5578', fixedWidth: 242, wordWrap: { width: 242 }, fontFamily: 'Pretendard, Noto Sans KR, Arial, sans-serif'
    });
    panel.add([icon, symbol, title, role, masteryLine, mode, statBox, stat]);

    let actionY = -panelHeight / 2 + 124;
    if (hasMasteryChoices) {
      const header = this.add.text(-136, actionY - 13, '최종 진화 선택', { fontSize: '9px', color: '#f7d36b', fontStyle: 'bold' });
      panel.add(header);
      const choices = getTowerMasteries(tower.config.kind);
      choices.forEach((choice, index) => {
        const x = index === 0 ? -78 : 78;
        const y = actionY + 18;
        const canBuy = this.gold >= tower.masteryCost;
        const btn = this.makePanelButton(panel, x, y, 116, 26, canBuy ? choice.color : 0x333333, `${choice.shortLabel} $${tower.masteryCost}`);
        btn.on('pointerdown', () => this.chooseTowerMastery(choice.id));
        const desc = this.add.text(x, y + 31, choice.description, {
          fontSize: '8px', color: canBuy ? '#d8c39a' : '#888888', align: 'center', fixedWidth: 112, wordWrap: { width: 112 }
        }).setOrigin(0.5, 0);
        panel.add(desc);
      });
      actionY += 54;
    }

    const cost = tower.upgradeCost;
    const up = this.makePanelButton(panel, -64, actionY, 112, 26, cost ? 0x24486b : 0x333333, cost ? `업그레이드 $${cost}` : '최고 레벨');
    up.on('pointerdown', () => this.upgradeSelectedTower());

    const overdriveCost = this.towerOverdriveCost(tower);
    const overLabel = tower.isOverdriven ? `강화중 ${tower.overdriveRemainingSec}s` : `긴급 강화 $${overdriveCost}`;
    const over = this.makePanelButton(panel, 64, actionY, 112, 26, tower.isOverdriven ? 0x3a3a3a : 0x6a4a1f, overLabel);
    over.on('pointerdown', () => this.overdriveSelectedTower());

    if (tower.config.kind !== 'barracks') {
      const target = this.makePanelButton(panel, -64, actionY + 31, 112, 26, 0x3c355e, '타겟 변경');
      target.on('pointerdown', () => this.cycleSelectedTowerTarget());
      const guide = this.add.text(72, actionY + 33, '상황에 맞춰 선두/강적/공중 우선순위를 바꾸세요.', {
        fontSize: '8px', color: '#9eb6d8', fixedWidth: 112, wordWrap: { width: 112 }, align: 'center'
      }).setOrigin(0.5);
      panel.add(guide);
    } else {
      const rally = this.makePanelButton(panel, -64, actionY + 31, 112, 26, 0x3f5f2f, '집결지');
      rally.on('pointerdown', () => {
        this.settingRallyFor = tower;
        this.rallyReadyAt = this.time.now + 120;
        this.showMessage('집결지를 놓을 길 위를 터치하세요');
      });
      const reinforceCost = this.towerReinforceCost(tower);
      const reinforce = this.makePanelButton(panel, 64, actionY + 31, 112, 26, 0x2f5f58, `병력 보충 $${reinforceCost}`);
      reinforce.on('pointerdown', () => this.reinforceSelectedBarracks());
    }

    const sell = this.makePanelButton(panel, -64, actionY + 62, 112, 26, 0x693434, `철거 +$${tower.sellValue}`);
    sell.on('pointerdown', () => this.sellSelectedTower(false));

    const replace = this.makePanelButton(panel, 64, actionY + 62, 112, 26, 0x754928, '교체 건설');
    replace.on('pointerdown', () => this.sellSelectedTower(true));

    const close = this.makePanelButton(panel, 0, panelHeight / 2 - 16, 96, 23, 0x2f3440, '닫기');
    close.on('pointerdown', () => {
      tower.rangeCircle.setVisible(false);
      this.destroySelectedPanel();
      this.selectedTower = undefined;
    });

    panel.setAlpha(0).setScale(0.96);
    this.tweens.add({ targets: panel, alpha: 1, scale: 1, duration: 180, ease: 'Back.easeOut' });
    this.selectedPanel = panel;
  }

  private chooseTowerMastery(id: TowerMasteryId): void {
    const tower = this.selectedTower;
    if (!tower) return;
    if (!tower.canChooseMastery()) {
      this.showMessage('이 타워는 이미 최종 진화가 결정되었습니다.');
      return;
    }
    const cost = tower.masteryCost;
    if (this.gold < cost) {
      this.showMessage(`최종 진화에는 $${cost}가 필요합니다.`);
      return;
    }
    this.gold -= cost;
    if (tower.chooseMastery(id)) {
      playSfx(this, 'sfx_upgrade');
      this.refreshArmySynergy();
      this.refreshHud();
      this.selectTower(tower);
      this.showMessage(`${tower.masteryLabel} 완성! 전술 성능이 크게 변화합니다.`);
    }
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
      this.showMessage(`골드 부족: 업그레이드 필요 $${cost}`);
      return;
    }
    this.gold -= cost;
    tower.upgrade();
    spawnImpactRing(this, tower.x, tower.y, 48, tower.config.color, 0.2, 380);
    this.refreshArmySynergy();
    this.refreshHud();
    this.selectTower(tower);
    playSfx(this, 'sfx_upgrade');
    const upgradeMsg = tower.level >= 3 ? `${tower.config.maxSkill} 개방!` : `${tower.config.label} Lv.${tower.level}`;
    this.showMessage(upgradeMsg);
    showPremiumToast(this, upgradeMsg, 'success');
  }

  private sellSelectedTower(replace: boolean): void {
    const tower = this.selectedTower;
    if (!tower) return;
    const x = tower.x;
    const y = tower.y;
    const refund = tower.sellValue;
    this.gold += refund;
    this.towers = this.towers.filter((item) => item !== tower);
    this.refreshArmySynergy();
    this.destroySelectedPanel();
    this.selectedTower = undefined;
    tower.demolish();
    spawnBuildDust(this, x, y);
    spawnImpactRing(this, x, y, 42, 0xffd36b, 0.12, 360);
    playSfx(this, 'sfx_build');
    this.createBuildSpot(x, y, replace);
    this.refreshHud();
    const sellMsg = replace ? `교체 준비 완료 · 환급 +$${refund}` : `타워 철거 · 환급 +$${refund}`;
    this.showMessage(sellMsg);
    showPremiumToast(this, sellMsg, replace ? 'info' : 'warning');
  }

  private overdriveSelectedTower(): void {
    const tower = this.selectedTower;
    if (!tower) return;
    if (tower.isOverdriven) {
      this.showMessage(`이미 긴급 강화 중입니다 (${tower.overdriveRemainingSec}s)`);
      return;
    }
    const cost = this.towerOverdriveCost(tower);
    if (this.gold < cost) {
      this.showMessage(`긴급 강화에는 $${cost}가 필요합니다.`);
      return;
    }
    this.gold -= cost;
    tower.activateOverdrive(12000);
    spawnImpactRing(this, tower.x, tower.y, 62, tower.config.color, 0.18, 520);
    playSfx(this, 'sfx_upgrade');
    this.refreshHud();
    this.selectTower(tower);
    this.showMessage(`${tower.config.label} 긴급 강화! 12초 동안 화력 상승`);
  }

  private cycleSelectedTowerTarget(): void {
    const tower = this.selectedTower;
    if (!tower || tower.config.kind === 'barracks') return;
    tower.cycleTargetMode();
    spawnImpactRing(this, tower.x, tower.y, 42, tower.config.color, 0.1, 280);
    this.selectTower(tower);
    this.showMessage(`타겟 우선순위 변경: ${tower.targetModeLabel()}`);
  }

  private reinforceSelectedBarracks(): void {
    const tower = this.selectedTower;
    if (!tower || tower.config.kind !== 'barracks') return;
    const cost = this.towerReinforceCost(tower);
    if (this.gold < cost) {
      this.showMessage(`병력 보충에는 $${cost}가 필요합니다.`);
      return;
    }
    this.gold -= cost;
    tower.reinforceSoldiers();
    spawnImpactRing(this, tower.x, tower.y, 52, 0x7cc7ff, 0.12, 360);
    playSfx(this, 'sfx_build');
    this.refreshHud();
    this.selectTower(tower);
    this.showMessage('병영 병력 보충 완료');
  }

  private towerOverdriveCost(tower: Tower): number {
    return Math.round(48 + tower.level * 34 + this.stage.number * 7);
  }

  private towerReinforceCost(tower: Tower): number {
    return Math.round(36 + tower.level * 22 + this.stage.number * 5);
  }

  private towerStatLine(tower: Tower): string {
    if (tower.config.kind === 'barracks') {
      const maxSoldiers = tower.mastery === 'barracks_assault' ? 4 : 3;
      return `전선 유지 · 병사 ${tower.soldiers.length}/${maxSoldiers} · 철거 환급 $${tower.sellValue}`;
    }
    const splash = tower.currentSplashRadius ? ` · 폭발 ${Math.round(tower.currentSplashRadius)}` : '';
    return `피해 ${tower.currentDamage} · 사거리 ${Math.round(tower.currentRange)} · ${tower.targetModeLabel()}${splash}`;
  }

  private destroyBuildMenu(): void {
    this.activeBuildMenu?.destroy();
    this.activeBuildMenu = undefined;
  }

  private destroySelectedPanel(): void {
    this.selectedPanel?.destroy();
    this.selectedPanel = undefined;
  }

  private createSpells(): void {
    const useV1Dock = this.textures.exists('v1-combat-bottom-dock');
    const makeSpellHit = (x: number, y: number, w: number, h: number, fallbackColor: number): Phaser.GameObjects.GameObject => {
      if (useV1Dock) {
        return this.add.zone(x, y, w, h)
          .setDepth(84)
          .setInteractive({ useHandCursor: true });
      }
      return this.makeUiButton(x, y, w, h, fallbackColor, '', 18, 80);
    };

    const meteor = makeSpellHit(88, 504, 130, 38, 0x4f1f1f);
    if (!useV1Dock && this.textures.exists('ui-spell-meteor-card-v32')) this.add.image(88, 500, 'ui-spell-meteor-card-v32').setDisplaySize(150, 50).setDepth(81);
    this.meteorText = this.add.text(88, 504, '☄ 메테오', {
      fontSize: '11px', color: '#fff', fontStyle: 'bold',
      fontFamily: 'Pretendard, Noto Sans KR, NanumGothic, Arial, sans-serif',
      shadow: { offsetX: 0, offsetY: 2, color: '#000000', blur: 2, fill: true }
    }).setOrigin(0.5).setDepth(86);
    meteor.on('pointerdown', () => {
      if (this.meteorCooldownMs > 0) return this.showMessage('메테오 쿨타임 중');
      pulseButton(this, meteor);
      playSfx(this, 'sfx_click');
      this.beginSpellTargeting('meteor', '메테오 착탄 지점 선택', 82, 0xffd36b);
    });

    const mercenary = makeSpellHit(232, 504, 132, 38, 0x2f4f35);
    if (!useV1Dock && this.textures.exists('ui-spell-mercenary-card-v32')) this.add.image(238, 500, 'ui-spell-mercenary-card-v32').setDisplaySize(160, 50).setDepth(81);
    this.mercenaryText = this.add.text(232, 504, '🛡️ 용병', {
      fontSize: '11px', color: '#fff', fontStyle: 'bold',
      fontFamily: 'Pretendard, Noto Sans KR, NanumGothic, Arial, sans-serif',
      shadow: { offsetX: 0, offsetY: 2, color: '#000000', blur: 2, fill: true }
    }).setOrigin(0.5).setDepth(86);
    mercenary.on('pointerdown', () => {
      if (this.mercenaryCooldownMs > 0) return this.showMessage('용병소환 쿨타임 중');
      pulseButton(this, mercenary);
      playSfx(this, 'sfx_click');
      this.beginSpellTargeting('mercenary', '용병 소환 지점 선택', 36, 0x7cc7ff);
    });

    const heroSkill = makeSpellHit(376, 504, 132, 38, 0x4f3d1f);
    if (!useV1Dock && this.textures.exists('ui-spell-hero-card-v32')) this.add.image(392, 500, 'ui-spell-hero-card-v32').setDisplaySize(170, 50).setDepth(81);
    this.heroSkillText = this.add.text(376, 504, '🦁 강타', {
      fontSize: '11px', color: '#fff', fontStyle: 'bold',
      fontFamily: 'Pretendard, Noto Sans KR, NanumGothic, Arial, sans-serif',
      shadow: { offsetX: 0, offsetY: 2, color: '#000000', blur: 2, fill: true }
    }).setOrigin(0.5).setDepth(86);
    heroSkill.on('pointerdown', () => {
      pulseButton(this, heroSkill);
      playSfx(this, 'sfx_click');
      const ok = this.hero.castStomp(this.enemies);
      if (ok) {
        castHeroStompPremiumFx(this, this.hero.x, this.hero.y);
        this.recordBattleContract({ type: 'spell', spell: 'hero' });
      }
      this.showMessage(ok ? '대지강타!' : '영웅 스킬 쿨타임 중');
    });

    if (!useV1Dock) addPremiumPlaque(this, 746, 504, 356, 38, 0xf7d36b, 74);
    this.add.text(584, 486, '공세 정보', {
      fontSize: '10px', color: useV1Dock ? '#dbe7ff' : '#c8b184', fontStyle: 'bold',
      fontFamily: 'Pretendard, Noto Sans KR, Arial, sans-serif',
      shadow: { offsetX: 0, offsetY: 1, color: '#000000', blur: 1, fill: true }
    }).setDepth(86);
    this.wavePreviewText = this.add.text(916, 487, '', {
      fontSize: '10px', color: '#f7d36b', fontStyle: 'bold',
      fontFamily: 'Pretendard, Noto Sans KR, Arial, sans-serif',
      shadow: { offsetX: 0, offsetY: 1, color: '#000000', blur: 1, fill: true }
    }).setOrigin(1, 0).setDepth(86);
    this.waveIntelPanel = this.add.container(746, 514).setDepth(86);
    this.refreshWavePreview();
  }

  private createInputHandlers(): void {
    this.input.on('pointermove', (p: Phaser.Input.Pointer) => this.updateSpellTargetPreview(p));
    this.input.on('pointerdown', (p: Phaser.Input.Pointer, currentlyOver: Phaser.GameObjects.GameObject[]) => {
      if (currentlyOver.length > 0) return;
      if (!isBattlefieldPoint(p.x, p.y)) {
        if (this.castingSpell) this.showMessage('스킬은 전장 안쪽에만 사용할 수 있습니다.');
        return;
      }

      if (this.settingRallyFor && this.time.now >= this.rallyReadyAt) {
        this.settingRallyFor.setRallyPoint(p.x, p.y);
        this.settingRallyFor = undefined;
        this.showMessage('집결지 변경 완료');
        return;
      }

      if (this.castingSpell === 'meteor') {
        this.clearSpellTargetPreview();
        this.castMeteor(p.x, p.y);
        this.castingSpell = undefined;
        return;
      }

      if (this.castingSpell === 'mercenary') {
        this.clearSpellTargetPreview();
        this.castMercenaries(p.x, p.y);
        this.castingSpell = undefined;
        return;
      }

      if (this.activeBuildMenu?.active) {
        this.destroyBuildMenu();
        return;
      }

      if (this.selectedPanel?.active || this.selectedTower) {
        this.selectedTower?.rangeCircle.setVisible(false);
        this.destroySelectedPanel();
        this.selectedTower = undefined;
        return;
      }

      this.hero.moveToPoint(p.x, p.y);
    });
  }

  private castMeteor(x: number, y: number): void {
    const radius = 82;
    this.recordBattleContract({ type: 'spell', spell: 'meteor' });
    this.meteorCooldownMs = Math.round(24000 * this.relicBonuses.meteorCooldownMultiplier * (this.dailyChallenge?.modifiers.includes('meteor_storm') ? 0.72 : 1));
    castPremiumMeteor(this, x, y, radius, () => {
      spawnExplosionBurst(this, x, y, 1.45);
      spawnImpactRing(this, x, y, radius, 0xffd36b, 0.3, 420);
      shakeCamera(this, 0.006, 160);
      const meteorDamage = Math.round(112 * this.tacticalOrderState.meteorDamageMultiplier);
      this.enemies.forEach((enemy) => {
        if (!enemy.dead && Phaser.Math.Distance.Between(x, y, enemy.x, enemy.y) <= radius) enemy.receiveDamage(meteorDamage, 'true');
      });
    });
  }

  private castMercenaries(x: number, y: number): void {
    this.recordBattleContract({ type: 'spell', spell: 'mercenary' });
    this.mercenaryCooldownMs = 20000;
    playSfx(this, 'sfx_build');
    const summonCount = 2 + this.tacticalOrderState.mercenaryExtra;
    for (let i = 0; i < summonCount; i++) {
      const spread = (i - (summonCount - 1) / 2) * 16;
      const soldier = new Soldier(this, x + spread, y + (i % 2) * 12 - 6, x + spread, y + (i % 2) * 12 - 6, {
        color: 0xa6ffb0,
        damage: 9,
        maxHp: 55,
        blockMs: 300,
        expiresInMs: 15000
      });
      this.mercenaries.push(soldier);
    }
    castMercenaryGateFx(this, x, y);
    this.showMessage(`용병 ${summonCount}명 소환! 15초 동안 길막합니다`);
  }

  private refreshWavePreview(): void {
    if (!this.wavePreviewText) return;
    if (this.waveIndex >= this.stage.waves.length - 1 && !this.waveRunning) {
      this.wavePreviewText.setText('완료');
      renderWaveIntelPanel(this, this.waveIntelPanel, [], { completed: true });
      return;
    }
    if (this.waveRunning) {
      const current = this.stage.waves[this.waveIndex];
      this.wavePreviewText.setText(`W${this.waveIndex + 1} 전투중`);
      renderWaveIntelPanel(this, this.waveIntelPanel, current, { inCombat: true });
      return;
    }
    const nextIndex = Math.max(0, this.waveIndex + 1);
    const next = this.stage.waves[nextIndex];
    this.wavePreviewText.setText(`W${nextIndex + 1} 대기`);
    renderWaveIntelPanel(this, this.waveIntelPanel, next, { nextWaveNumber: nextIndex + 1 });
    this.refreshV29AdvisorForNextWave();
  }


  private refreshSpellHudThrottled(): void {
    if (this.time.now < this.nextSpellHudRefreshAt) return;
    this.nextSpellHudRefreshAt = this.time.now + 190;
    this.refreshSpellHud();
  }

  private refreshHudThrottled(): void {
    if (this.time.now < this.nextHudRefreshAt) return;
    this.nextHudRefreshAt = this.time.now + 220;
    this.refreshHud();
  }

  private forceHudRefresh(): void {
    this.nextHudRefreshAt = 0;
    this.nextSpellHudRefreshAt = 0;
    this.refreshHud();
    this.refreshSpellHud();
  }

  private refreshSpellHud(): void {
    this.meteorText.setText(this.meteorCooldownMs > 0 ? `☄ ${Math.ceil(this.meteorCooldownMs / 1000)}s` : '☄ 메테오');
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
    const bg = this.add.rectangle(0, 0, 430, 254, 0x0b1220, 0.95).setStrokeStyle(2, 0xf7d36b, 0.5);
    const title = this.add.text(0, -102, 'PAUSED', { fontSize: '30px', color: '#f7d36b', fontStyle: 'bold' }).setOrigin(0.5);
    const desc = this.add.text(0, -40, `${this.stage.title}
속도 ${this.gameSpeed}x / Wave ${Math.max(0, this.waveIndex + 1)}/${this.stage.waves.length}`, {
      fontSize: '14px', color: '#dbe7ff', align: 'center', lineSpacing: 8
    }).setOrigin(0.5);
    const quality = createQualityToggleButton(this, 0, 28);
    const resume = this.add.rectangle(-100, 74, 150, 40, 0x284f39, 1).setStrokeStyle(2, 0xffffff, 0.25).setInteractive({ useHandCursor: true });
    const resumeText = this.add.text(-115, 80, '계속하기', { fontSize: '16px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
    const world = this.add.rectangle(100, 74, 150, 40, 0x24486b, 1).setStrokeStyle(2, 0xffffff, 0.25).setInteractive({ useHandCursor: true });
    const worldText = this.add.text(115, 80, '월드맵', { fontSize: '16px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
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

  private scheduleNextWave(delayMs: number, initial = false): void {
    if (this.ended || this.paused) return;
    if (this.waveRunning) return;
    if (this.waveIndex >= this.stage.waves.length - 1) return;
    this.waveAutoTimer?.remove(false);
    this.nextWaveCountdownMs = delayMs;
    this.updateWaveButton();
    if (initial) this.showMessage('방어 성공! 다음 공격까지 10초. 준비됐다면 [진행]을 누르세요.');
    this.waveAutoTimer = this.time.delayedCall(delayMs, () => this.startNextWave(false));
  }

  private clearAutoWave(): void {
    this.waveAutoTimer?.remove(false);
    this.waveAutoTimer = undefined;
    this.nextWaveCountdownMs = 0;
    this.pendingWaveSpawns = 0;
    this.spawnEvents = [];
    this.waveClearedAt = 0;
    this.killStreak = 0;
    this.bestKillStreak = 0;
    this.lastKillAt = 0;
    this.totalKills = 0;
    this.totalLeaks = 0;
    this.tacticalHintCooldownMs = 0;
    this.nextHudRefreshAt = 0;
    this.nextSpellHudRefreshAt = 0;
    this.updateWaveButton();
    this.refreshWavePreview();
    if (!this.waveRunning) {
      this.activeEnemyAffix = NO_ENEMY_AFFIX_V29;
      this.refreshV29AffixHud();
    }
  }

  private updateWaveButton(): void {
    if (!this.waveButtonText) return;
    if (this.waveRunning) {
      this.waveButtonText.setText('진행중');
      return;
    }
    if (this.waveIndex >= this.stage.waves.length - 1) {
      this.waveButtonText.setText('완료');
      return;
    }
    if (this.waveIndex < 0) {
      this.waveButtonText.setText('전투 시작');
      return;
    }
    const sec = Math.ceil(this.nextWaveCountdownMs / 1000);
    this.waveButtonText.setText(sec > 0 ? `진행 ${sec}` : '진행 ▶');
  }

  private startNextWave(early: boolean): void {
    if (this.waveRunning) return;
    if (this.waveIndex >= this.stage.waves.length - 1) return;
    this.clearAutoWave();
    if (early && this.waveIndex >= 0) {
      const bonus = 20 + this.stage.number * 5;
      this.gold += bonus;
      this.recordBattleContract({ type: 'earlyWave' });
      this.showMessage(`선제 출격 보너스 +$${bonus}`);
    }
    this.waveIndex += 1;
    this.waveRunning = true;
    this.refreshHud();
    const waveNumber = this.waveIndex + 1;
    const waveGroups = this.stage.waves[this.waveIndex];
    this.activeEnemyAffix = pickEnemyAffixV29(this.stage, this.user?.uid ?? 'guest', this.waveIndex);
    this.refreshV29AffixHud();
    this.refreshV29AdvisorForNextWave();
    playSfx(this, 'sfx_wave');
    spawnWaveBanner(this, `WAVE ${waveNumber}`, this.describeWave(waveGroups));
    this.activeWaveEvent = applyWaveEventOpening(
      this,
      this.stage,
      this.waveIndex,
      this.towers,
      this.hero,
      (amount) => {
        this.gold += amount;
        this.forceHudRefresh();
        this.showMessage(`왕실 보급품 +$${amount}`);
      },
      (amountMs) => {
        this.reduceAllCooldowns(amountMs)
        this.forceHudRefresh();
      }
    );
    const bossGroup = waveGroups.find((group) => ENEMIES[group.kind].threat === 'boss');
    if (bossGroup) {
      playMusic(this, 'bgm_boss', 0.24);
      this.showBossWarning();
      openBossArenaRift(this, bossGroup.kind);
      showBossCutin(this, bossGroup.kind, this.describeWave(waveGroups));
    } else {
      playMusic(this, 'bgm_battle', 0.18);
    }
    if (this.activeEnemyAffix.id !== 'none') this.time.delayedCall(380, () => this.showMessage(enemyAffixFullLineV29(this.activeEnemyAffix)));
    this.showWaveTacticalHint(waveGroups);
    this.spawnWave(waveGroups);
  }

  private spawnWave(groups: WaveSpawn[]): void {
    this.spawnEvents.forEach((event) => event.remove(false));
    this.spawnEvents = [];
    this.pendingWaveSpawns = 0;

    let delay = 0;
    let globalSpawnIndex = 0;
    groups.forEach((group) => {
      const count = group.count + (this.dailyChallenge?.modifiers.includes('gold_rush') ? Math.max(1, Math.floor(group.count * 0.16)) : 0);
      const gap = Math.max(70, group.gapMs);
      this.pendingWaveSpawns += count;

      const spawnOne = (): void => {
        this.pendingWaveSpawns = Math.max(0, this.pendingWaveSpawns - 1);
        if (this.ended) return;
        globalSpawnIndex += 1;
        let cfg = mutateEnemyForWaveEvent({ ...ENEMIES[group.kind] }, this.activeWaveEvent);
        cfg = applyRunModifiersToEnemy(cfg, this.runModifiers, this.waveIndex + 1, globalSpawnIndex);
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
        cfg = applyEnemyAffixV29(cfg, this.activeEnemyAffix, globalSpawnIndex);
        const enemy = new Enemy(this, cfg, this.stage.path);
        this.enemies.push(enemy);
        spawnImpactRing(this, enemy.x, enemy.y, cfg.label.startsWith('정예') ? 24 : 18, enemy.config.accentColor ?? 0xffffff, cfg.label.startsWith('정예') ? 0.22 : 0.12, 260);
        if (cfg.label.startsWith('정예') && this.textures.exists('v2-elite-badge')) {
          const badge = this.add.image(enemy.x, enemy.y - 44, 'v2-elite-badge').setDisplaySize(34, 34).setDepth(74).setAlpha(0.95);
          this.tweens.add({ targets: badge, y: enemy.y - 60, alpha: 0, duration: 720, ease: 'Cubic.easeOut', onComplete: () => badge.destroy() });
        }
        if (cfg.threat === 'boss' || cfg.magicResist > 0.3) showArcaneSurge(this, enemy.x, enemy.y, enemy.config.accentColor ?? 0x8fdcff);
      };

      const opener = this.time.delayedCall(delay, () => {
        spawnOne();
        if (count > 1) {
          const stream = this.time.addEvent({ delay: gap, repeat: count - 2, callback: spawnOne });
          this.spawnEvents.push(stream);
        }
      });
      this.spawnEvents.push(opener);
      delay += gap * count + (group.delayAfterMs ?? 800);
    });
  }

  private describeWave(groups: WaveSpawn[]): string {
    return groups.map((group) => `${ENEMIES[group.kind].label} x${group.count}`).join('  /  ');
  }

  private refreshHud(): void {
    this.livesText.setText(`♥ ${this.lives}`);
    this.goldText.setText(`$ ${shortMetricV210(this.gold)}`);
    const waveNow = Math.max(0, this.waveIndex + 1);
    this.waveText.setText(`${waveNow}/${this.stage.waves.length}`);
    this.refreshWavePreview();
    this.updateWaveButton();
    this.refreshObjectivePanel();
    this.refreshTacticalOrderHud();
    this.refreshBattleContractHud();
  }

  private registerKill(enemy: Enemy): void {
    const now = this.time.now;
    this.killStreak = now - this.lastKillAt <= 2600 ? this.killStreak + 1 : 1;
    this.lastKillAt = now;
    this.bestKillStreak = Math.max(this.bestKillStreak, this.killStreak);
    this.totalKills += 1;
    this.recordBattleContract({
      type: 'kill',
      enemyKind: enemy.config.kind,
      threat: enemy.config.threat,
      flying: enemy.config.flying,
      armor: enemy.config.armor,
    });

    const threatBonus = enemy.config.threat === 'boss' ? 8 : enemy.config.threat === 'tank' ? 3 : 1;
    const streakBonus = this.killStreak >= 10 ? Math.min(14, Math.floor(this.killStreak / 5) * 2) : 0;
    const reward = enemy.config.reward + streakBonus;
    this.gold += reward;
    this.score += enemy.config.reward * 10 * threatBonus + this.lives * 2 + this.killStreak * 3;

    if (this.killStreak >= 5) {
      this.showComboToast(this.killStreak, streakBonus);
      this.recordBattleContract({ type: 'combo', streak: this.killStreak });
    }
    if (enemy.config.threat === 'boss') this.showTacticalHint('보스 격파! 남은 웨이브는 타워 교체/진화로 마무리하세요.');
  }

  private showComboToast(streak: number, goldBonus: number): void {
    if (!this.comboText) return;
    this.comboText.setText(`x${streak} 연속 처치${goldBonus > 0 ? `  +$${goldBonus}` : ''}`).setVisible(true).setAlpha(1).setScale(1);
    this.tweens.killTweensOf(this.comboText);
    this.tweens.add({ targets: this.comboText, y: 422, scale: 1.08, duration: 120, yoyo: true });
    this.time.delayedCall(980, () => this.comboText?.setVisible(false));
  }

  private refreshObjectivePanel(): void {
    if (!this.objectiveText) return;
    const lifeGoal = Math.max(1, Math.ceil(this.stage.maxLives * 0.75));
    const lifeOk = this.lives >= lifeGoal;
    const leakOk = this.totalLeaks === 0;
    const chainOk = this.bestKillStreak >= 20;
    const lifeMark = lifeOk ? '◆' : '◇';
    const leakMark = leakOk ? '◆' : '◇';
    const chainMark = chainOk ? '◆' : '◇';
    this.objectiveText.setText(`${lifeMark} 생명 ${lifeGoal}+   ${leakMark} 무누수   ${chainMark} 연속처치 20`);
  }

  private resultObjectiveLines(clearTimeMs: number): string[] {
    const lifeGoal = Math.max(1, Math.ceil(this.stage.maxLives * 0.75));
    const fastGoalMs = this.stage.waves.length * 58000;
    const result = [
      `${this.lives >= lifeGoal ? '★' : '☆'} 생명 ${lifeGoal}+`,
      `${this.totalLeaks === 0 ? '★' : '☆'} 무누수`,
      `${this.bestKillStreak >= 20 ? '★' : '☆'} 연속처치 ${this.bestKillStreak}`,
      `${clearTimeMs <= fastGoalMs ? '★' : '☆'} 빠른 클리어`,
    ];
    return result;
  }

  private showTacticalHint(text: string): void {
    if (!this.directorText || this.tacticalHintCooldownMs > 0) return;
    this.tacticalHintCooldownMs = 4200;
    this.directorText.setText(text).setVisible(true).setAlpha(0).setScale(0.96);
    this.tweens.add({ targets: this.directorText, alpha: 1, scale: 1, duration: 180, ease: 'Sine.easeOut' });
    this.time.delayedCall(2600, () => {
      if (!this.directorText?.active) return;
      this.tweens.add({ targets: this.directorText, alpha: 0, duration: 240, onComplete: () => this.directorText?.setVisible(false) });
    });
  }

  private showWaveTacticalHint(groups: WaveSpawn[]): void {
    const advisor = recommendTowerForWaveV29(groups, ENEMIES);
    if (this.waveIndex <= 1) this.showTacticalHint(`${advisor.title}: ${advisor.reason}`);
    const hasFlying = groups.some((group) => ENEMIES[group.kind].flying);
    const hasArmor = groups.some((group) => ENEMIES[group.kind].armor > 0.35);
    const hasMagic = groups.some((group) => ENEMIES[group.kind].magicResist > 0.35);
    const hasBoss = groups.some((group) => ENEMIES[group.kind].threat === 'boss');
    if (hasBoss) this.showTacticalHint('보스 공세: 긴급 강화와 최종 진화 스킬을 아끼지 마세요.');
    else if (hasFlying) this.showTacticalHint('공중 적 감지: 궁수/마법 타워를 선두 라인에 배치하세요.');
    else if (hasArmor) this.showTacticalHint('장갑 적 감지: 마법사와 저주 계열이 효율적입니다.');
    else if (hasMagic) this.showTacticalHint('마법 저항 적 감지: 포탑과 궁수 화력을 겹치세요.');
    else this.showTacticalHint('균형 공세: 병영으로 묶고 광역 타워로 정리하세요.');
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
    this.recordBattleContract({ type: 'finish', clearTimeMs });
    const finalScore = this.score + this.battleContractState.contractScoreEarned + this.lives * 500 + Math.max(0, 600000 - clearTimeMs) / 100 + this.stage.number * 1000;
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
      this.showResult(roundedScore, top, clearTimeMs);
    } catch (error) {
      console.error(error);
      this.showMessage('저장 실패: Firebase 설정/규칙을 확인하세요');
    }
  }

  private showResult(score: number, top: Array<{ nickname: string; score: number }>, clearTimeMs: number): void {
    const reward = computeBattleRewards({
      stage: this.stage,
      score,
      lives: this.lives,
      clearTimeMs,
      bestKillStreak: this.bestKillStreak,
      totalLeaks: this.totalLeaks,
    });

    if (this.textures.exists('ui-reward-stage-panel-v42')) this.add.image(480, 270, 'ui-reward-stage-panel-v42').setDisplaySize(760, 482).setDepth(92);
    else this.add.rectangle(480, 270, 720, 468, 0x070b13, 0.96).setDepth(92).setStrokeStyle(3, 0xf7d36b, 0.48);
    this.add.rectangle(480, 88, 690, 54, 0x2b1a0e, 0.92).setDepth(92).setStrokeStyle(2, 0xffef9a, 0.26);
    this.add.text(480, 86, 'STAGE CLEAR', {
      fontSize: '30px', color: '#f7d36b', fontStyle: 'bold',
      shadow: { offsetX: 0, offsetY: 4, color: '#000000', blur: 3, fill: true }
    }).setOrigin(0.5).setDepth(93);

    this.add.text(480, 137, `${this.stage.title}   SCORE ${score}   LIFE ${this.lives}`, {
      fontSize: '15px', color: '#ffffff', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(93);

    addPremiumChestSpotlight(this, 480, 214);
    const rewardBox = showRewardChestOverlay(this, 480, 214, reward);
    rewardBox.setDepth(94);

    const objectivePanel = this.add.rectangle(252, 333, 314, 126, 0x111927, 0.92)
      .setDepth(93).setStrokeStyle(2, 0x8fdcff, 0.26);
    const objectiveTitle = this.add.text(252, 282, '전술 목표 결과', {
      fontSize: '14px', color: '#dbe7ff', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(94);
    const contractLines = battleContractResultLines(this.battleContractState);
    const objectiveLines = this.add.text(252, 337, [...reward.lines.slice(0, 3), ...contractLines.slice(0, 3)].join('\n'), {
      fontSize: '14px', color: '#fff4c2', align: 'left', lineSpacing: 6,
      shadow: { offsetX: 0, offsetY: 1, color: '#000000', blur: 1, fill: true }
    }).setOrigin(0.5).setDepth(94);

    const leaderboardPanel = this.add.rectangle(708, 333, 314, 126, 0x111927, 0.92)
      .setDepth(93).setStrokeStyle(2, 0xf7d36b, 0.26);
    const leaderboardTitle = this.add.text(708, 282, '오늘의 명예의 전당', {
      fontSize: '14px', color: '#f7d36b', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(94);
    const lines = top.slice(0, 5).map((s, i) => `${rankMedal(i)} ${s.nickname}  ${s.score}`).join('\n');
    const leaderboardText = this.add.text(708, 337, lines || '아직 기록 없음', {
      fontSize: '14px', color: '#dbe7ff', align: 'left', lineSpacing: 6,
      shadow: { offsetX: 0, offsetY: 1, color: '#000000', blur: 1, fill: true }
    }).setOrigin(0.5).setDepth(94);

    let chestOpened = false;
    const openChest = this.makeUiButton(250, 464, 172, 48, 0x8a4f1f, '보상 열기', 21, 94);
    openChest.on('pointerdown', () => {
      if (chestOpened) return;
      chestOpened = true;
      openChest.setAlpha(0.45).disableInteractive();
      showPremiumChestCharge(this, 480, 214);
      const loot = grantBattleRewardInventory(this.user.uid, this.stage.id, reward);
      this.time.delayedCall(260, () => showChestOpeningCinematic(this, reward, loot));
    });

    const forge = this.makeUiButton(452, 464, 172, 48, 0x6b3f91, '유물 제작소', 20, 94);
    forge.on('pointerdown', () => { this.time.timeScale = 1; this.scene.start('ArtifactForgeScene', { user: this.user, save: this.save }); });

    const world = this.makeUiButton(654, 464, 150, 48, 0x284f39, '월드맵', 21, 94);
    world.on('pointerdown', () => { this.time.timeScale = 1; this.scene.start('WorldMapScene', { user: this.user, save: this.save }); });

    const retry = this.makeUiButton(812, 464, 150, 48, 0x24486b, '다시 도전', 20, 94);
    retry.on('pointerdown', () => { this.time.timeScale = 1; this.scene.restart({ user: this.user, save: this.save, stageId: this.stage.id }); });

    this.tweens.add({ targets: [objectivePanel, objectiveTitle, objectiveLines, leaderboardPanel, leaderboardTitle, leaderboardText], alpha: { from: 0, to: 1 }, y: '+=0', duration: 280, delay: 180 });
  }

  private buttonAssetForColor(color: number): string | undefined {
    const choose = (preferred: string, fallback: string): string => this.textures.exists(preferred) ? preferred : fallback;
    if (color === 0xa94732 || color === 0x4f1f1f || color === 0x693434) return choose('v1-combat-button-red-v18', 'v1-button-red');
    if (color === 0x6a4a1f || color === 0x4f3d1f || color === 0x754928 || color === 0xf7d36b) return choose('v1-combat-button-gold-v18', 'v1-button-gold');
    if (color === 0x2f4f35 || color === 0x3f5f2f || color === 0x2f5f58 || color === 0x284f39) return choose('v1-combat-button-green-v18', 'v1-button-green');
    if (color === 0x2f3440 || color === 0x333333) return 'v1-button-dark';
    return choose('v1-combat-button-blue-v18', 'v1-button-blue');
  }

  private makeUiButton(x: number, y: number, width: number, height: number, color: number, label: string, fontSize = 18, depth = 10): Phaser.GameObjects.Rectangle {
    const assetKey = this.buttonAssetForColor(color);
    const shadow = this.add.rectangle(x + 3, y + 5, width, height, 0x000000, 0.22).setDepth(depth - 1);
    const image = assetKey && this.textures.exists(assetKey)
      ? this.add.image(x, y, assetKey).setDisplaySize(width, height + 2).setDepth(depth)
      : undefined;
    const rect = this.add.rectangle(x, y, width, height, color, image ? 0.001 : 1)
      .setStrokeStyle(image ? 0 : 2, 0xfff1c2, image ? 0 : 0.42)
      .setInteractive({ useHandCursor: true })
      .setDepth(depth + 1);
    const shine = this.add.rectangle(x, y - height * 0.28, Math.max(8, width - 12), 4, 0xffffff, image ? 0 : 0.11).setDepth(depth + 2);
    const text = label ? this.add.text(x, y - 1, label, {
      fontSize: `${Math.max(8, fontSize - 1)}px`, color: '#ffffff', fontStyle: 'bold',
      fontFamily: 'Pretendard, Noto Sans KR, NanumGothic, Arial, sans-serif',
      shadow: { offsetX: 0, offsetY: 2, color: '#000000', blur: 1, fill: true }
    }).setOrigin(0.5).setDepth(depth + 3) : undefined;
    rect.on('pointerdown', () => playSfx(this, 'sfx_click'));
    installPremiumButtonFx(this, rect);
    rect.on('pointerover', () => {
      rect.setAlpha(0.9);
      image?.setScale(1.03);
      shine.setAlpha(image ? 0.16 : 0.2);
    });
    rect.on('pointerout', () => {
      rect.setAlpha(1);
      image?.setScale(1);
      shine.setAlpha(image ? 0 : 0.11);
    });
    rect.once('destroy', () => { shadow.destroy(); shine.destroy(); image?.destroy(); text?.destroy(); });
    return rect;
  }

  private makePanelButton(panel: Phaser.GameObjects.Container, x: number, y: number, width: number, height: number, color: number, label: string): Phaser.GameObjects.Rectangle {
    const assetKey = this.buttonAssetForColor(color);
    const shadow = this.add.rectangle(x + 2, y + 3, width, height, 0x000000, 0.22);
    const image = assetKey && this.textures.exists(assetKey)
      ? this.add.image(x, y, assetKey).setDisplaySize(width, height + 2)
      : undefined;
    const rect = this.add.rectangle(x, y, width, height, color, image ? 0.001 : 1)
      .setStrokeStyle(image ? 0 : 2, 0xfff1c2, image ? 0 : 0.36)
      .setInteractive({ useHandCursor: true });
    installPremiumButtonFx(this, rect);
    const shine = this.add.rectangle(x, y - height * 0.28, Math.max(8, width - 14), 3, 0xffffff, image ? 0 : 0.12);
    const text = this.add.text(x, y, label, {
      fontSize: '8px', color: '#ffffff', fontStyle: 'bold',
      fontFamily: 'Pretendard, Noto Sans KR, NanumGothic, Arial, sans-serif',
      shadow: { offsetX: 0, offsetY: 2, color: '#000000', blur: 1, fill: true }
    }).setOrigin(0.5);
    rect.on('pointerover', () => { rect.setAlpha(0.92); image?.setScale(1.015); shine.setAlpha(image ? 0.12 : 0.20); });
    rect.on('pointerout', () => { rect.setAlpha(1); image?.setScale(1); shine.setAlpha(image ? 0 : 0.12); });
    panel.add([shadow, ...(image ? [image] : []), rect, shine, text]);
    return rect;
  }

  private towerRole(kind: TowerKind): string {
    if (kind === 'archer') return '공중/빠른 적';
    if (kind === 'mage') return '중갑 카운터';
    if (kind === 'barracks') return '길막/전선 유지';
    return '광역 폭발';
  }

  private towerSymbol(kind: TowerKind): string {
    if (kind === 'archer') return '➶';
    if (kind === 'mage') return '✦';
    if (kind === 'barracks') return '♜';
    return '●';
  }
}
