import Phaser from "phaser";
import type { EnemyConfig, PathPoint } from "./types";
import { spawnDeathPoof, spawnFloatingText, spawnHitSpark, spawnImpactRing } from "./Effects";
import { playSfx } from "./AudioManager";
import { bossPatternCooldown, bossPatternLabel } from "./MegaSystems";

type EnemyMotion = "walk" | "attack" | "death";
type EnemyDirection = "down" | "side" | "up";

export class Enemy extends Phaser.GameObjects.Container {
  readonly config: EnemyConfig;
  hp: number;
  maxHp: number;
  pathIndex = 0;
  reachedGoal = false;
  dead = false;

  private bodyCircle: Phaser.GameObjects.Arc;
  private sprite?: Phaser.GameObjects.Sprite | Phaser.GameObjects.Image;
  private animatedSprite = false;
  private hpBar: Phaser.GameObjects.Rectangle;
  private hpBack: Phaser.GameObjects.Rectangle;
  private displayedHpRatio = 1;
  private targetHpRatio = 1;
  private blockedMs = 0;
  private slowUntil = 0;
  private slowFactor = 1;
  private poisonTimer?: Phaser.Time.TimerEvent;
  private aura?: Phaser.GameObjects.Arc;
  private currentMotion: EnemyMotion = "walk";
  private currentDirection: EnemyDirection = "down";
  private movingLeft = false;
  private deathStarted = false;
  private bossSkillCooldownMs = 1800;
  private bossShieldUntil = 0;
  private bossSpeedUntil = 0;
  private bossSpeedMultiplier = 1;

  constructor(
    scene: Phaser.Scene,
    config: EnemyConfig,
    private readonly path: PathPoint[],
  ) {
    super(scene, path[0].x, path[0].y);
    this.config = config;
    this.hp = config.hp;
    this.maxHp = config.hp;

    const scale = config.scale ?? 1;
    const shadow = scene.add.ellipse(
      0,
      config.flying ? 20 : 16,
      36 * scale,
      12 * scale,
      0x000000,
      config.flying ? 0.14 : 0.28,
    );
    const artKey = this.resolveV18EnemyArtKey(config.kind);
    if (artKey && scene.textures.exists(artKey)) {
      this.sprite = scene.add.image(0, config.flying ? -8 : -10, artKey);
      const targetHeight =
        (config.threat === "boss"
          ? 84
          : config.threat === "tank"
            ? 64
            : config.flying
              ? 56
              : 58) * scale;
      this.sprite.setDisplaySize(
        this.sprite.width * (targetHeight / Math.max(1, this.sprite.height)),
        targetHeight,
      );
    } else {
      const spriteKey = `enemy-${config.kind}`;
      if (scene.textures.exists(spriteKey)) {
        this.sprite = scene.add
          .sprite(0, 0, spriteKey, 0)
          .setScale(scale * 1.08);
        this.animatedSprite = true;
        this.playMotion("walk", "down", true);
      }
    }
    this.bodyCircle = scene.add
      .circle(
        0,
        0,
        (config.flying ? 10 : 12) * scale,
        config.color,
        this.sprite ? 0.0 : 1,
      )
      .setStrokeStyle(
        2,
        config.accentColor ?? 0x000000,
        this.sprite ? 0.0 : 0.65,
      );
    this.hpBack = scene.add
      .rectangle(0, -20 * scale, 28 * scale, 5, 0x2c1010, 1)
      .setOrigin(0.5);
    this.hpBar = scene.add
      .rectangle(0, -20 * scale, 28 * scale, 5, 0x1ee65b, 1)
      .setOrigin(0.5);

    const face = scene.add.circle(
      -4 * scale,
      -3 * scale,
      2.2 * scale,
      0x101010,
      1,
    );
    const face2 = scene.add.circle(
      4 * scale,
      -3 * scale,
      2.2 * scale,
      0x101010,
      1,
    );
    const healthGem = scene.add.circle(
      0,
      -13 * scale,
      2.5 * scale,
      this.threatGemColor(config),
      0.92,
    );
    const badge = this.makeBadge(config, scale);

    if (config.threat === "support") {
      this.aura = scene.add
        .circle(0, 0, 18 * scale, 0x5fe0cf, 0.1)
        .setStrokeStyle(1, 0x5fe0cf, 0.45);
      this.add([this.aura]);
    }

    if (this.sprite)
      this.add([
        shadow,
        this.sprite,
        this.bodyCircle,
        healthGem,
        this.hpBack,
        this.hpBar,
      ]);
    else
      this.add([
        shadow,
        this.bodyCircle,
        face,
        face2,
        healthGem,
        badge,
        this.hpBack,
        this.hpBar,
      ]);
    scene.add.existing(this);
    this.setDepth(config.flying ? 18 : 12);
  }

  update(deltaMs: number): void {
    if (this.dead || this.reachedGoal) return;

    if (this.aura) this.aura.rotation += deltaMs / 450;
    this.updateBossPattern(deltaMs);
    this.updateHealthBar(deltaMs);
    if (this.config.flying)
      this.y += Math.sin(this.scene.time.now / 150) * 0.18;

    this.blockedMs = Math.max(0, this.blockedMs - deltaMs);
    if (this.blockedMs > 0) {
      this.playMotion("attack");
      return;
    }

    const target = this.path[this.pathIndex + 1];
    if (!target) {
      this.reachedGoal = true;
      return;
    }

    const speedModifier =
      (this.scene.time.now < this.slowUntil ? this.slowFactor : 1) *
      (this.scene.time.now < this.bossSpeedUntil
        ? this.bossSpeedMultiplier
        : 1);
    const dist = Phaser.Math.Distance.Between(
      this.x,
      this.y,
      target.x,
      target.y,
    );
    const step = (this.config.speed * speedModifier * deltaMs) / 1000;
    if (dist <= step) {
      this.setPosition(target.x, target.y);
      this.pathIndex += 1;
      if (this.pathIndex >= this.path.length - 1) this.reachedGoal = true;
      return;
    }

    const angle = Phaser.Math.Angle.Between(this.x, this.y, target.x, target.y);
    this.updateFacing(angle);
    this.playMotion("walk");
    this.x += Math.cos(angle) * step;
    this.y += Math.sin(angle) * step;
  }

  blockFor(ms: number): void {
    if (this.dead || this.config.flying) return;
    const wasFree = this.blockedMs <= 0;
    this.blockedMs = Math.max(this.blockedMs, ms);
    if (wasFree) this.playMotion("attack");
  }

  receiveSlow(factor: number, durationMs: number): void {
    if (this.dead) return;
    this.slowFactor = Phaser.Math.Clamp(factor, 0.15, 1);
    this.slowUntil = Math.max(this.slowUntil, this.scene.time.now + durationMs);
    this.bodyCircle.setStrokeStyle(3, 0x7cc7ff, 0.9);
    this.scene.time.delayedCall(durationMs, () => {
      if (this.active && this.scene.time.now >= this.slowUntil) {
        this.bodyCircle.setStrokeStyle(
          2,
          this.config.accentColor ?? 0x000000,
          0.65,
        );
      }
    });
  }

  receivePoison(totalDamage: number, durationMs = 3000): void {
    if (this.dead) return;
    this.poisonTimer?.remove(false);
    const ticks = 6;
    let tickCount = 0;
    this.bodyCircle.setStrokeStyle(3, 0x71ff70, 1);
    this.poisonTimer = this.scene.time.addEvent({
      delay: durationMs / ticks,
      repeat: ticks - 1,
      callback: () => {
        tickCount += 1;
        this.receiveDamage(totalDamage / ticks, "true");
        if (tickCount >= ticks && this.active)
          this.bodyCircle.setStrokeStyle(
            2,
            this.config.accentColor ?? 0x000000,
            0.65,
          );
      },
    });
  }

  receiveDamage(
    amount: number,
    damageType: "physical" | "magic" | "true" = "physical",
  ): void {
    if (this.dead) return;
    let finalDamage = amount;
    if (damageType === "physical") finalDamage *= 1 - this.config.armor;
    if (damageType === "magic") finalDamage *= 1 - this.config.magicResist;
    if (
      this.config.threat === "boss" &&
      this.scene.time.now < this.bossShieldUntil
    )
      finalDamage *= 0.55;

    finalDamage = Math.max(0, finalDamage);
    this.hp = Math.max(0, this.hp - finalDamage);
    this.targetHpRatio = Phaser.Math.Clamp(
      this.hp / Math.max(1, this.maxHp),
      0,
      1,
    );

    const isCritical =
      finalDamage >= Math.max(24, this.maxHp * 0.18) || damageType === "true";
    this.scene.events.emit("kingdom-seed:combat-text", {
      x: this.x,
      y: this.y - 24,
      amount: Math.round(finalDamage),
      damageType,
      critical: isCritical,
      enemyKind: this.config.kind,
    });
    if (isCritical) {
      this.scene.events.emit("kingdom-seed:critical-hit", {
        x: this.x,
        y: this.y,
        amount: Math.round(finalDamage),
        damageType,
        enemyKind: this.config.kind,
      });
    }

    spawnHitSpark(
      this.scene,
      this.x,
      this.y,
      damageType === "magic"
        ? 0xb88cff
        : damageType === "true"
          ? 0xfff1a6
          : 0xffdf9a,
    );
    playSfx(this.scene, damageType === "magic" ? "sfx_magic" : "sfx_hit");
    this.scene.tweens.add({
      targets: this.bodyCircle,
      scale: 1.22,
      duration: 55,
      yoyo: true,
    });
    this.playHitReaction(damageType);
    if (this.hp <= 0) {
      this.dead = true;
      this.poisonTimer?.remove(false);
      this.startDeathAnimation();
    }
  }

  private resolveV18EnemyArtKey(kind: string): string | undefined {
    const family: Record<string, string> = {
      goblin: "goblin",
      raider: "goblin",
      spider: "goblin",
      brute: "orc",
      orc: "orc",
      shield: "orc",
      shaman: "orc",
      ogre: "orc",
      troll: "orc",
      golem: "boar",
      abomination: "boar",
      titan: "boar",
      wolf: "wolf",
      hellhound: "wolf",
      nightmare: "wolf",
      bat: "bat",
      wasp: "bat",
      gargoyle: "bat",
      wyvern: "dragon",
      phoenix: "dragon",
      dragon: "dragon",
      skeleton: "skeleton",
      zombie: "skeleton",
      specter: "skeleton",
      cultist: "rogue",
      assassin: "rogue",
      warlock: "rogue",
      necromancer: "rogue",
      voidling: "rogue",
      voidPriest: "rogue",
      demonlord: "dragon",
      fireImp: "dragon",
      obsidianKnight: "skeleton",
    };
    const resolved = family[kind];
    return resolved ? `v1-enemy-art-${resolved}` : undefined;
  }

  private playHitReaction(damageType: "physical" | "magic" | "true"): void {
    const hitTint =
      damageType === "magic"
        ? 0xd9b8ff
        : damageType === "true"
          ? 0xfff1a6
          : 0xff6b5f;

    // 0.1초 안에 흰색 -> 붉은색 계열로 번쩍이는 피격 플래시.
    if (this.sprite) {
      this.sprite.setTint(0xffffff);
      this.scene.time.delayedCall(46, () => {
        if (this.sprite?.active) this.sprite.setTint(hitTint);
      });
      this.scene.time.delayedCall(112, () => {
        if (this.sprite?.active) this.sprite.clearTint();
      });
    }

    this.bodyCircle.setFillStyle(0xffffff, this.sprite ? 0.22 : 1);
    this.scene.time.delayedCall(46, () => {
      if (!this.bodyCircle.active) return;
      this.bodyCircle.setFillStyle(hitTint, this.sprite ? 0.18 : 1);
    });
    this.scene.time.delayedCall(112, () => {
      if (!this.bodyCircle.active) return;
      this.bodyCircle.setFillStyle(this.config.color, this.sprite ? 0.0 : 1);
    });

    const dir = this.movingLeft ? 1 : -1;
    const shakeTargets: Phaser.GameObjects.GameObject[] = this.sprite
      ? [this.sprite]
      : [this.bodyCircle];
    shakeTargets.forEach((target) => {
      this.scene.tweens.killTweensOf(target);
      this.scene.tweens.add({
        targets: target,
        x: { from: dir * 5, to: 0 },
        duration: 96,
        ease: "Back.easeOut",
      });
    });

    this.scene.tweens.add({
      targets: this,
      angle: this.x % 2 > 1 ? 2.5 : -2.5,
      duration: 48,
      yoyo: true,
      onComplete: () => this.setAngle(0),
    });
  }

  private updateFacing(angle: number): void {
    const vx = Math.cos(angle);
    const vy = Math.sin(angle);
    this.movingLeft = vx < -0.05;
    if (Math.abs(vy) > Math.abs(vx) * 1.15) {
      this.currentDirection = vy < 0 ? "up" : "down";
    } else {
      this.currentDirection = "side";
    }
    if (this.sprite)
      this.sprite.setFlipX(this.currentDirection === "side" && this.movingLeft);
    else
      this.scaleX = this.movingLeft
        ? -Math.abs(this.scaleX)
        : Math.abs(this.scaleX);
  }

  private playMotion(
    motion: EnemyMotion,
    direction = this.currentDirection,
    force = false,
  ): void {
    if (!this.sprite || !this.animatedSprite) return;
    if (this.deathStarted && motion !== "death") return;
    if (
      !force &&
      this.currentMotion === motion &&
      this.currentDirection === direction
    )
      return;

    this.currentMotion = motion;
    this.currentDirection = direction;
    const directionalKey = `enemy-${this.config.kind}-${motion}-${direction}`;
    const fallbackKey = `enemy-${this.config.kind}-${motion}`;
    const key = this.scene.anims.exists(directionalKey)
      ? directionalKey
      : fallbackKey;
    if (this.scene.anims.exists(key))
      (this.sprite as Phaser.GameObjects.Sprite).play(key, true);
  }

  private startDeathAnimation(): void {
    if (this.deathStarted) return;
    this.deathStarted = true;
    this.spawnDeathPop();
    this.hpBack.setVisible(false);
    this.hpBar.setVisible(false);
    this.bodyCircle.setVisible(false);

    // 죽음도 즉시 제거하지 않고 아래로 가라앉으며 사라지게 만든다.
    // 컨테이너 전체를 짧게 페이드 처리하므로 전투 객체 수가 오래 쌓이지 않는다.
    this.scene.tweens.add({
      targets: this,
      y: this.y + 18,
      alpha: 0,
      scale: Math.max(0.45, this.scaleX * 0.62),
      duration: 360,
      ease: "Cubic.easeIn",
      onComplete: () => {
        if (this.active) this.destroy();
      },
    });

    if (this.sprite && this.animatedSprite) {
      this.sprite.clearTint();
      this.playMotion("death", this.currentDirection, true);
    }
  }

  private updateHealthBar(deltaMs: number): void {
    if (!this.hpBar.active || !this.hpBack.active) return;
    const smoothing = Phaser.Math.Clamp(deltaMs / 120, 0.08, 0.45);
    this.displayedHpRatio = Phaser.Math.Linear(
      this.displayedHpRatio,
      this.targetHpRatio,
      smoothing,
    );
    if (Math.abs(this.displayedHpRatio - this.targetHpRatio) < 0.004)
      this.displayedHpRatio = this.targetHpRatio;

    const barWidth = 28 * (this.config.scale ?? 1);
    const nextWidth = Math.max(1, barWidth * this.displayedHpRatio);
    this.hpBack.setPosition(0, -20 * (this.config.scale ?? 1));
    this.hpBar.setPosition(
      -(barWidth - nextWidth) * 0.5,
      -20 * (this.config.scale ?? 1),
    );
    this.hpBack.width = barWidth;
    this.hpBar.width = nextWidth;

    if (this.targetHpRatio < 0.36) this.hpBar.fillColor = 0xff6058;
    else if (this.targetHpRatio < 0.68) this.hpBar.fillColor = 0xffd36b;
    else this.hpBar.fillColor = 0x1ee65b;
  }

  private updateBossPattern(deltaMs: number): void {
    if (this.config.threat !== "boss" || this.dead || this.reachedGoal) return;
    this.bossSkillCooldownMs -= deltaMs;
    if (this.bossSkillCooldownMs > 0) return;

    this.bossSkillCooldownMs =
      bossPatternCooldown(this.config.kind) + Phaser.Math.Between(-700, 900);
    this.scene.events.emit("kingdom-seed:boss-pattern", {
      kind: this.config.kind,
      label: this.config.label,
      pattern: bossPatternLabel(this.config.kind),
      x: this.x,
      y: this.y,
    });

    if (this.config.kind === "demonlord") {
      this.castBossShield(2500, 0xffb347);
      this.bossSpeedUntil = this.scene.time.now + 1800;
      this.bossSpeedMultiplier = 1.22;
      return;
    }

    if (this.config.kind === "dragon") {
      this.castBossRoar(0xff6b2a);
      this.bossSpeedUntil = this.scene.time.now + 2200;
      this.bossSpeedMultiplier = 1.35;
      return;
    }

    if (this.config.kind === "titan") {
      this.castBossHeal(0.065, 0x88e7ff);
      this.bossSpeedUntil = this.scene.time.now + 1400;
      this.bossSpeedMultiplier = 1.55;
      return;
    }

    if (this.config.kind === "phoenix") {
      this.castBossHeal(0.08, 0xffd36b);
      this.castBossRoar(0xffaa2a);
      return;
    }

    if (
      this.config.kind === "ogre" ||
      this.config.kind === "golem" ||
      this.config.kind === "abomination"
    ) {
      this.castBossRoar(this.config.accentColor ?? 0xfff1c2);
      this.castBossShield(1500, this.config.accentColor ?? 0xfff1c2);
      return;
    }

    this.castBossRoar(this.config.accentColor ?? 0xfff1c2);
  }

  private castBossShield(durationMs: number, color: number): void {
    this.bossShieldUntil = Math.max(
      this.bossShieldUntil,
      this.scene.time.now + durationMs,
    );
    spawnFloatingText(
      this.scene,
      this.x,
      this.y - 56,
      "보스 장막",
      "#fff1a6",
      18,
    );
    spawnImpactRing(
      this.scene,
      this.x,
      this.y,
      44 * (this.config.scale ?? 1),
      color,
      0.24,
      520,
    );
    const shield = this.scene.add
      .circle(this.x, this.y, 28 * (this.config.scale ?? 1), color, 0.12)
      .setStrokeStyle(3, color, 0.72)
      .setDepth(33);
    this.scene.tweens.add({
      targets: shield,
      scale: 1.65,
      alpha: 0,
      duration: durationMs,
      ease: "Sine.easeOut",
      onComplete: () => shield.destroy(),
    });
  }

  private castBossRoar(color: number): void {
    spawnFloatingText(
      this.scene,
      this.x,
      this.y - 56,
      bossPatternLabel(this.config.kind),
      "#ffdf9a",
      14,
    );
    spawnImpactRing(
      this.scene,
      this.x,
      this.y,
      64 * (this.config.scale ?? 1),
      color,
      0.22,
      620,
    );
    const wave = this.scene.add
      .circle(this.x, this.y, 38 * (this.config.scale ?? 1), color, 0.1)
      .setStrokeStyle(4, color, 0.58)
      .setDepth(34);
    this.scene.tweens.add({
      targets: wave,
      scale: 2.1,
      alpha: 0,
      duration: 420,
      ease: "Quad.easeOut",
      onComplete: () => wave.destroy(),
    });
    this.scene.cameras.main.shake(120, 0.0025);
  }

  private castBossHeal(ratio: number, color: number): void {
    const amount = Math.max(30, Math.round(this.maxHp * ratio));
    this.hp = Math.min(this.maxHp, this.hp + amount);
    this.targetHpRatio = Phaser.Math.Clamp(
      this.hp / Math.max(1, this.maxHp),
      0,
      1,
    );
    this.hpBar.fillColor = 0x1ee65b;
    spawnFloatingText(
      this.scene,
      this.x,
      this.y - 56,
      `회복 +${amount}`,
      "#71ff70",
      18,
    );
    spawnImpactRing(
      this.scene,
      this.x,
      this.y,
      48 * (this.config.scale ?? 1),
      color,
      0.16,
      540,
    );
  }

  private makeBadge(
    config: EnemyConfig,
    scale: number,
  ): Phaser.GameObjects.GameObject {
    if (config.flying) {
      const wing = this.scene.add.triangle(
        0,
        1 * scale,
        -17 * scale,
        -6 * scale,
        0,
        0,
        17 * scale,
        -6 * scale,
        config.accentColor ?? 0xffffff,
        0.55,
      );
      return wing;
    }
    if (config.kind === "shield") {
      return this.scene.add
        .rectangle(0, 5 * scale, 16 * scale, 13 * scale, 0xd8e0ef, 0.85)
        .setStrokeStyle(1, 0x39424d);
    }
    if (config.kind === "shaman") {
      return this.scene.add.star(
        0,
        8 * scale,
        5,
        4 * scale,
        9 * scale,
        0x99fff2,
        0.8,
      );
    }
    if (config.kind === "ogre") {
      return this.scene.add.rectangle(
        0,
        7 * scale,
        20 * scale,
        6 * scale,
        0x2d1710,
        0.8,
      );
    }
    if (config.kind === "spider") {
      return this.scene.add.rectangle(
        0,
        6 * scale,
        24 * scale,
        3 * scale,
        0x101010,
        0.55,
      );
    }
    if (config.kind === "specter") {
      return this.scene.add
        .circle(0, 7 * scale, 9 * scale, 0xd6edff, 0.25)
        .setStrokeStyle(1, 0xd6edff, 0.7);
    }
    if (config.kind === "troll") {
      return this.scene.add
        .rectangle(7 * scale, 7 * scale, 15 * scale, 5 * scale, 0x2d1710, 0.9)
        .setRotation(-0.35);
    }
    if (config.kind === "raider") {
      return this.scene.add.triangle(
        0,
        8 * scale,
        -8 * scale,
        5 * scale,
        8 * scale,
        5 * scale,
        0,
        15 * scale,
        0xd45656,
        0.9,
      );
    }
    if (config.kind === "gargoyle") {
      return this.scene.add.triangle(
        0,
        2 * scale,
        -22 * scale,
        -4 * scale,
        0,
        2 * scale,
        22 * scale,
        -4 * scale,
        0x29303a,
        0.6,
      );
    }
    if (config.kind === "warlock") {
      return this.scene.add.star(
        0,
        8 * scale,
        6,
        4 * scale,
        11 * scale,
        0xf06fff,
        0.75,
      );
    }
    if (config.kind === "golem") {
      return this.scene.add
        .rectangle(0, 8 * scale, 24 * scale, 10 * scale, 0x3d342c, 0.9)
        .setStrokeStyle(1, 0xffd36b, 0.25);
    }
    if (config.kind === "demonlord") {
      return this.scene.add.triangle(
        0,
        -4 * scale,
        -18 * scale,
        -16 * scale,
        0,
        -4 * scale,
        18 * scale,
        -16 * scale,
        0xffb347,
        0.85,
      );
    }
    return this.scene.add.circle(
      0,
      8 * scale,
      3 * scale,
      config.accentColor ?? 0xffffff,
      0.7,
    );
  }

  private spawnDeathPop(): void {
    spawnDeathPoof(
      this.scene,
      this.x,
      this.y,
      Math.max(0.9, this.config.scale ?? 1),
    );
    spawnImpactRing(
      this.scene,
      this.x,
      this.y,
      16 * (this.config.scale ?? 1),
      this.config.accentColor ?? 0xfff1c2,
      0.26,
      360,
    );
    const pop = this.scene.add
      .circle(this.x, this.y, 12 * (this.config.scale ?? 1), 0xfff1c2, 0.25)
      .setDepth(35);
    this.scene.tweens.add({
      targets: pop,
      scale: 2.0,
      alpha: 0,
      duration: 220,
      onComplete: () => pop.destroy(),
    });
    spawnFloatingText(
      this.scene,
      this.x,
      this.y - 34,
      `+$${this.config.reward}`,
      "#f7d36b",
      16,
    );
  }

  private threatGemColor(config: EnemyConfig): number {
    if (config.threat === "boss") return 0xff4d4d;
    if (config.threat === "tank") return 0xffb347;
    if (config.threat === "flying") return 0x7cc7ff;
    if (config.threat === "support") return 0x99fff2;
    if (config.threat === "fast") return 0xffffff;
    return 0x71ff70;
  }
}
