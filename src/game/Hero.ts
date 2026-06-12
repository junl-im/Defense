import Phaser from 'phaser';
import { Enemy } from './Enemy';
import { shakeCamera, spawnHitSpark, spawnImpactRing, spawnMuzzleFlash } from './Effects';
import { playSfx } from './AudioManager';
import { CASUAL_ART_KEYS, resolveHeroTextureKey } from './AssetMap';
import { fitIsolatedIcon, isCasualArtTextureKey, makeStickerBackplate } from './CasualArtDirector';
import { heroDisplayHeight } from './BattleArtMode';

export class Hero extends Phaser.GameObjects.Container {
  hp = 220;
  maxHp = 220;
  damage = 22;
  attackCooldownMs = 0;
  skillCooldownMs = 0;
  private destination?: Phaser.Math.Vector2;
  private bodyCircle: Phaser.GameObjects.Arc;
  private skillRing: Phaser.GameObjects.Arc;
  private sprite?: Phaser.GameObjects.Sprite | Phaser.GameObjects.Image;
  private artBackplate?: Phaser.GameObjects.Ellipse;
  private animatedSprite = false;
  private currentMotion: 'idle' | 'move' | 'attack' = 'idle';

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    const shadow = scene.add.ellipse(0, 13, 24, 8, 0x000000, 0.24);
    const heroTextureKey = resolveHeroTextureKey(scene);
    if (heroTextureKey === 'hero-knight') {
      this.sprite = scene.add.sprite(0, -6, 'hero-knight', 0).setScale(heroDisplayHeight() / 32);
      this.animatedSprite = true;
      this.playMotion('idle');
    } else if (heroTextureKey) {
      const casual = isCasualArtTextureKey(heroTextureKey);
      if (casual) {
        this.artBackplate = makeStickerBackplate(scene, 0, -8, 48, 58, {
          fill: 0xfff8e8,
          stroke: 0x5f4630,
          alpha: 0.82,
          strokeAlpha: 0.24,
        });
      }
      this.sprite = scene.add.image(
        0,
        heroTextureKey === CASUAL_ART_KEYS.heroSeedKnight ? -9 : -7,
        heroTextureKey,
      );
      // v2.35.9: DALL-E 결과물이 1024px이어도 게임 내 영웅 발자국은 항상 같은 크기로 보정한다.
      const targetHeight = heroTextureKey === CASUAL_ART_KEYS.heroSeedKnight ? heroDisplayHeight() : heroDisplayHeight();
      if (casual) {
        fitIsolatedIcon(this.sprite, {
          maxWidth: 58,
          maxHeight: targetHeight,
          y: heroTextureKey === CASUAL_ART_KEYS.heroSeedKnight ? -9 : -7,
          minScale: 0.02,
          maxScale: 1.1,
        });
      } else {
        this.sprite.setDisplaySize(this.sprite.width * (targetHeight / Math.max(1, this.sprite.height)), targetHeight);
      }
    }
    this.bodyCircle = scene.add.circle(0, 0, 12, 0xf7d36b, this.sprite ? 0 : 1).setStrokeStyle(3, 0xffffff, this.sprite ? 0 : 0.35);
    const helm = scene.add.triangle(0, -7, -8, 0, 8, 0, 0, -14, 0xd2d8e8, this.sprite ? 0 : 1);
    this.skillRing = scene.add.circle(0, 0, 38, 0xfff0a3, 0.07).setStrokeStyle(1, 0xfff0a3, 0.25).setVisible(false);
    const visuals: Phaser.GameObjects.GameObject[] = [this.skillRing, shadow, this.bodyCircle, helm];
    if (this.artBackplate) visuals.push(this.artBackplate);
    if (this.sprite) visuals.push(this.sprite);
    this.add(visuals);
    scene.add.existing(this);
    this.setDepth(26);
    this.setSize(36, 48);
    this.setInteractive(new Phaser.Geom.Circle(0, -4, 20), Phaser.Geom.Circle.Contains);
  }

  update(deltaMs: number, enemies: Enemy[]): void {
    this.attackCooldownMs = Math.max(0, this.attackCooldownMs - deltaMs);
    this.skillCooldownMs = Math.max(0, this.skillCooldownMs - deltaMs);

    const target = enemies.find((enemy) => !enemy.dead && !enemy.reachedGoal && !enemy.config.flying && Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y) <= 38);
    if (target) {
      this.destination = undefined;
      this.facePoint(target.x);
      target.blockFor(260);
      if (this.attackCooldownMs <= 0) {
        this.swingAt(target);
        this.attackCooldownMs = 560;
      }
      return;
    }

    if (!this.destination) {
      this.playMotion('idle');
      return;
    }

    const d = Phaser.Math.Distance.Between(this.x, this.y, this.destination.x, this.destination.y);
    if (d <= 4) {
      this.destination = undefined;
      this.playMotion('idle');
      return;
    }
    const angle = Phaser.Math.Angle.Between(this.x, this.y, this.destination.x, this.destination.y);
    const speed = 148;
    this.x += Math.cos(angle) * speed * deltaMs / 1000;
    this.y += Math.sin(angle) * speed * deltaMs / 1000;
    this.facePoint(this.destination.x);
    this.playMotion('move');
  }

  moveToPoint(x: number, y: number): void {
    this.destination = new Phaser.Math.Vector2(x, y);
    const flag = this.scene.add.circle(x, y, 7, 0xf7d36b, 0.7).setDepth(25);
    spawnImpactRing(this.scene, x, y, 16, 0xf7d36b, 0.16, 360);
    this.scene.tweens.add({ targets: flag, scale: 2, alpha: 0, duration: 360, onComplete: () => flag.destroy() });
  }

  castStomp(enemies: Enemy[]): boolean {
    if (this.skillCooldownMs > 0) return false;
    this.skillCooldownMs = 18000;
    this.destination = undefined;
    this.playAttackAnimation();
    this.skillRing.setVisible(true);
    this.scene.tweens.add({ targets: this.skillRing, scale: 1.8, alpha: 0, duration: 360, onComplete: () => {
      this.skillRing.setScale(1).setAlpha(1).setVisible(false);
    }});

    spawnImpactRing(this.scene, this.x, this.y, 78, 0xfff0a3, 0.24, 430);
    shakeCamera(this.scene, 0.004, 130);
    playSfx(this.scene, 'sfx_explosion');
    enemies.forEach((enemy) => {
      if (!enemy.dead && !enemy.reachedGoal && Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y) <= 78) {
        enemy.receiveDamage(45, 'true');
        enemy.blockFor(1000);
      }
    });
    return true;
  }

  private swingAt(target: Enemy): void {
    this.playAttackAnimation();
    target.receiveDamage(this.damage, 'physical');
    spawnMuzzleFlash(this.scene, this.x + (target.x >= this.x ? 11 : -11), this.y - 4, 0xfff1c2);
    spawnHitSpark(this.scene, target.x, target.y, 0xfff1c2);
    playSfx(this.scene, 'sfx_hit');
    const dir = target.x >= this.x ? 1 : -1;
    if (this.sprite) {
      this.sprite.x = dir * 4;
      this.scene.tweens.add({ targets: this.sprite, x: 0, duration: 105, ease: 'Back.easeOut' });
    }
    this.scene.tweens.add({ targets: this.bodyCircle, scale: 1.18, duration: 80, yoyo: true });
  }

  private playAttackAnimation(): void {
    this.currentMotion = 'attack';
    if (!this.sprite) return;
    if (!this.animatedSprite) {
      this.scene.tweens.add({ targets: this.sprite, scaleX: this.sprite.scaleX * 1.08, scaleY: this.sprite.scaleY * 1.08, duration: 90, yoyo: true, ease: 'Back.easeOut' });
      this.scene.time.delayedCall(170, () => { this.currentMotion = 'idle'; });
      return;
    }
    (this.sprite as Phaser.GameObjects.Sprite).play('hero-attack', true);
    (this.sprite as Phaser.GameObjects.Sprite).once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      this.currentMotion = 'idle';
      this.playMotion('idle');
    });
  }

  private playMotion(motion: 'idle' | 'move'): void {
    if (!this.sprite || this.currentMotion === 'attack') return;
    if (this.currentMotion === motion) return;
    this.currentMotion = motion;
    if (!this.animatedSprite) return;
    (this.sprite as Phaser.GameObjects.Sprite).play(motion === 'move' ? 'hero-move' : 'hero-idle', true);
  }

  private facePoint(x: number): void {
    if (!this.sprite) return;
    if (Math.abs(x - this.x) < 2) return;
    this.sprite.setFlipX(x < this.x);
  }
}
