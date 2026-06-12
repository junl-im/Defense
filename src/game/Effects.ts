import Phaser from "phaser";
import {
  getRenderProfile,
  lowPowerMode,
  scaledDuration,
  scaledFxCount,
  scaledShake,
  shouldSpawnFx,
} from "./QualityManager";
import { tryAcquireCombatFx } from "./CombatFxBudget";
import { resolveProjectileTextureKey } from "./AssetMap";
import { fitIsolatedIcon, isCasualArtTextureKey } from "./CasualArtDirector";
import { projectileIconFootprint, projectileSpriteScale } from "./BattleArtMode";

export type ProjectileStyle = "arrow" | "magic" | "shell" | "slash" | "spark";

export function spawnFloatingText(
  scene: Phaser.Scene,
  x: number,
  y: number,
  text: string,
  color = "#ffffff",
  fontSize = 16,
): void {
  // 모바일 전투 중 텍스트는 프레임을 많이 잡아먹지 않도록 QualityManager의 FX 예산과
  // 동시 활성 개수 캡을 모두 통과시킨다. 많은 적에게 광역기가 들어가는 순간 텍스트가 폭주하는 것을 막는다.
  const release = tryAcquireCombatFx(scene, "floatingText");
  if (!release || !shouldSpawnFx(scene, 0.45)) {
    release?.();
    return;
  }

  const label = scene.add
    .text(x, y, text, {
      fontSize: `${fontSize}px`,
      color,
      fontStyle: "bold",
      fontFamily: "Pretendard, Noto Sans KR, Arial, sans-serif",
      stroke: "#08111f",
      strokeThickness: Math.max(3, Math.round(fontSize * 0.22)),
      shadow: { offsetX: 0, offsetY: 2, color: "#000000", blur: 2, fill: true },
    })
    .setOrigin(0.5)
    .setDepth(95)
    .setScale(0.68);

  // 캐주얼 게임 특유의 "톡 튀어나옴 -> 둥실 상승 -> 소멸" 2단 트윈.
  scene.tweens.add({
    targets: label,
    scale: 1.18,
    duration: scaledDuration(105),
    ease: "Back.easeOut",
    onComplete: () => {
      scene.tweens.add({
        targets: label,
        y: y - 38,
        x: x + Phaser.Math.Between(-8, 8),
        alpha: 0,
        scale: 0.96,
        duration: scaledDuration(560),
        ease: "Sine.easeOut",
        onComplete: () => {
          label.destroy();
          release();
        },
      });
    },
  });
}

export function spawnHitSpark(
  scene: Phaser.Scene,
  x: number,
  y: number,
  color = 0xfff1c2,
): void {
  if (!shouldSpawnFx(scene, 0.9)) return;
  const count = scaledFxCount(7, 2);
  for (let i = 0; i < count; i++) {
    const angle =
      (Math.PI * 2 * i) / count + Phaser.Math.FloatBetween(-0.22, 0.22);
    const dist = Phaser.Math.Between(14, 28);
    const spark = scene.add
      .rectangle(x, y, Phaser.Math.Between(4, 8), 2, color, 0.9)
      .setRotation(angle)
      .setDepth(60);
    scene.tweens.add({
      targets: spark,
      x: x + Math.cos(angle) * dist,
      y: y + Math.sin(angle) * dist,
      alpha: 0,
      duration: scaledDuration(230),
      ease: "Quad.easeOut",
      onComplete: () => spark.destroy(),
    });
  }
}

export function spawnImpactRing(
  scene: Phaser.Scene,
  x: number,
  y: number,
  radius: number,
  color = 0xfff1c2,
  alpha = 0.22,
  duration = 320,
): void {
  if (!shouldSpawnFx(scene, 0.7)) return;
  const ring = scene.add
    .circle(x, y, radius * 0.52, color, alpha)
    .setStrokeStyle(2, color, Math.min(0.8, alpha + 0.36))
    .setDepth(58);
  scene.tweens.add({
    targets: ring,
    scale: 1.75,
    alpha: 0,
    duration: scaledDuration(duration),
    ease: "Quad.easeOut",
    onComplete: () => ring.destroy(),
  });
}

export function spawnMuzzleFlash(
  scene: Phaser.Scene,
  x: number,
  y: number,
  color = 0xffffff,
): void {
  if (!shouldSpawnFx(scene, 0.45)) return;
  const flash = scene.add.star(x, y, 7, 3, 12, color, 0.86).setDepth(62);
  scene.tweens.add({
    targets: flash,
    scale: 1.55,
    alpha: 0,
    duration: scaledDuration(120),
    onComplete: () => flash.destroy(),
  });
}

export function spawnProjectile(
  scene: Phaser.Scene,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  color: number,
  style: ProjectileStyle,
  duration: number,
  onImpact: () => void,
): void {
  const release = tryAcquireCombatFx(scene, "projectile");
  if (!release || !shouldSpawnFx(scene, style === "shell" ? 1.2 : 0.85)) {
    release?.();
    scene.time.delayedCall(Math.max(40, duration), onImpact);
    return;
  }

  const frameByStyle: Record<ProjectileStyle, number> = {
    arrow: 0,
    magic: 1,
    shell: 2,
    slash: 3,
    spark: 4,
  };

  // 원칙: 외부 이미지/스프라이트 에셋을 우선 사용한다.
  // 개발 중 에셋 누락 상황에서도 빌드와 플레이가 끊기지 않도록 매우 작은 도형 폴백만 남긴다.
  let projectile:
    | Phaser.GameObjects.Image
    | Phaser.GameObjects.Sprite
    | Phaser.GameObjects.Arc
    | Phaser.GameObjects.Rectangle
    | Phaser.GameObjects.Star
    | Phaser.GameObjects.Ellipse;
  const mappedProjectileKey = resolveProjectileTextureKey(scene, style);
  if (mappedProjectileKey) {
    projectile = scene.add.image(fromX, fromY, mappedProjectileKey);
    if (isCasualArtTextureKey(mappedProjectileKey)) {
      const footprint = projectileIconFootprint(style);
      fitIsolatedIcon(projectile, {
        maxWidth: footprint.maxWidth,
        maxHeight: footprint.maxHeight,
        minScale: 0.01,
        maxScale: 0.65,
      });
    } else {
      projectile.setScale(projectileSpriteScale(style));
    }
  } else if (scene.textures.exists("projectiles")) {
    projectile = scene.add
      .sprite(fromX, fromY, "projectiles", frameByStyle[style])
      .setScale(projectileSpriteScale(style));
  } else if (style === "arrow") {
    projectile = scene.add
      .rectangle(fromX, fromY, 22, 4, color, 1)
      .setStrokeStyle(1, 0x2b1808, 0.55);
  } else if (style === "shell") {
    projectile = scene.add
      .circle(fromX, fromY, 7, color, 1)
      .setStrokeStyle(2, 0x1a0e05, 0.55);
  } else if (style === "slash") {
    projectile = scene.add.ellipse(fromX, fromY, 22, 8, color, 0.82);
  } else if (style === "spark") {
    projectile = scene.add.star(fromX, fromY, 6, 3, 10, color, 0.92);
  } else {
    projectile = scene.add
      .circle(fromX, fromY, 7, color, 0.92)
      .setStrokeStyle(2, 0xffffff, 0.35);
  }

  const distance = Phaser.Math.Distance.Between(fromX, fromY, toX, toY);
  const arcHeight = Phaser.Math.Clamp(
    distance * (style === "shell" ? 0.26 : 0.18),
    18,
    style === "shell" ? 92 : 58,
  );
  const controlX = (fromX + toX) * 0.5;
  const controlY = Math.min(fromY, toY) - arcHeight;
  const travelMs = scaledDuration(duration);
  const angle = Phaser.Math.Angle.Between(fromX, fromY, toX, toY);

  projectile.setDepth(61);
  projectile.setRotation(angle);
  if ("setTint" in projectile && scene.textures.exists("projectiles")) {
    (projectile as Phaser.GameObjects.Sprite).setTint(color);
  }

  const profile = getRenderProfile();
  const extraProjectileFx = profile.tier !== "low";
  const glow = extraProjectileFx
    ? scene.add
        .circle(fromX, fromY, style === "shell" ? 13 : 10, color, 0.16)
        .setDepth(60)
        .setBlendMode(Phaser.BlendModes.ADD)
    : undefined;
  const trail = extraProjectileFx
    ? scene.add
        .ellipse(
          fromX - Math.cos(angle) * (style === "shell" ? 8 : 14),
          fromY - Math.sin(angle) * (style === "shell" ? 8 : 14),
          style === "shell" ? 22 : 34,
          style === "shell" ? 10 : 8,
          color,
          style === "magic" ? 0.2 : 0.14,
        )
        .setRotation(angle)
        .setDepth(59)
        .setBlendMode(Phaser.BlendModes.ADD)
    : undefined;
  const pin = extraProjectileFx
    ? scene.add
        .circle(
          fromX,
          fromY,
          style === "magic" ? 4 : 3,
          0xffffff,
          style === "shell" ? 0.18 : 0.34,
        )
        .setDepth(62)
        .setBlendMode(Phaser.BlendModes.ADD)
    : undefined;

  let previousX = fromX;
  let previousY = fromY;
  const driver = { t: 0 };

  if (trail) {
    scene.tweens.add({
      targets: trail,
      alpha: 0.03,
      scaleX: 0.55,
      scaleY: 0.7,
      duration: Math.max(80, travelMs * 0.92),
      ease: "Quad.easeOut",
    });
  }

  scene.tweens.add({
    targets: driver,
    t: 1,
    duration: travelMs,
    ease: style === "shell" ? "Quad.easeIn" : "Sine.easeInOut",
    onUpdate: () => {
      const t = Phaser.Math.Clamp(driver.t, 0, 1);
      const inv = 1 - t;
      const x = inv * inv * fromX + 2 * inv * t * controlX + t * t * toX;
      const y = inv * inv * fromY + 2 * inv * t * controlY + t * t * toY;
      const vx = x - previousX;
      const vy = y - previousY;
      const rot =
        Math.abs(vx) + Math.abs(vy) > 0.001 ? Math.atan2(vy, vx) : angle;
      projectile.setPosition(x, y);
      projectile.setRotation(rot);
      glow?.setPosition(x, y);
      pin?.setPosition(x, y);
      trail?.setPosition(
        x - Math.cos(rot) * (style === "shell" ? 8 : 14),
        y - Math.sin(rot) * (style === "shell" ? 8 : 14),
      );
      trail?.setRotation(rot);
      previousX = x;
      previousY = y;
    },
    onComplete: () => {
      projectile.destroy();
      glow?.destroy();
      pin?.destroy();
      trail?.destroy();
      release();
      onImpact();
    },
  });
}

export function spawnWaveBanner(
  scene: Phaser.Scene,
  title: string,
  subtitle: string,
): void {
  if (lowPowerMode()) {
    const group = scene.add.container(480, 82).setDepth(98);
    const bg = scene.add
      .rectangle(0, 0, 560, 58, 0x07101e, 0.88)
      .setStrokeStyle(2, 0xf7d36b, 0.55);
    const topLine = scene.add
      .text(0, -10, title, {
        fontSize: "24px",
        color: "#fff1b7",
        fontStyle: "bold",
        fontFamily: "Pretendard, Noto Sans KR, Arial, sans-serif",
        stroke: "#061a45",
        strokeThickness: 4,
      })
      .setOrigin(0.5);
    const bottomLine = scene.add
      .text(0, 18, subtitle, {
        fontSize: "13px",
        color: "#e5f5ff",
        fontStyle: "bold",
        fontFamily: "Pretendard, Noto Sans KR, Arial, sans-serif",
        stroke: "#0a2a5d",
        strokeThickness: 2,
      })
      .setOrigin(0.5);
    group.add([bg, topLine, bottomLine]);
    scene.time.delayedCall(1050, () => group.destroy());
    return;
  }
  const group = scene.add.container(480, -76).setDepth(98);
  let frameObjects: Phaser.GameObjects.GameObject[];
  if (scene.textures.exists("v2-wave-banner-frame")) {
    const frame = scene.add
      .image(0, 0, "v2-wave-banner-frame")
      .setDisplaySize(720, 102);
    const gleam = scene.add
      .rectangle(-260, -24, 150, 6, 0xffffff, 0.16)
      .setRotation(-0.12)
      .setBlendMode(Phaser.BlendModes.ADD);
    frameObjects = [frame, gleam];
    scene.tweens.add({
      targets: gleam,
      x: 260,
      alpha: 0,
      duration: scaledDuration(760),
      delay: 220,
      ease: "Sine.easeOut",
    });
  } else {
    const shadow = scene.add.rectangle(0, 10, 660, 84, 0x000000, 0.28);
    const bg = scene.add
      .rectangle(0, 0, 640, 76, 0x0b1220, 0.94)
      .setStrokeStyle(3, 0xf7d36b, 0.62);
    const inner = scene.add
      .rectangle(0, 0, 618, 58, 0x263247, 0.18)
      .setStrokeStyle(1, 0xffffff, 0.12);
    const leftGem = scene.add.star(-304, 0, 6, 8, 18, 0xf7d36b, 0.82);
    const rightGem = scene.add.star(304, 0, 6, 8, 18, 0xf7d36b, 0.82);
    frameObjects = [shadow, bg, inner, leftGem, rightGem];
  }
  const topLine = scene.add
    .text(0, -14, title, {
      fontSize: "28px",
      color: "#fff1b7",
      fontStyle: "bold",
      fontFamily: "Pretendard, Noto Sans KR, Arial, sans-serif",
      stroke: "#061a45",
      strokeThickness: 5,
    })
    .setOrigin(0.5);
  const bottomLine = scene.add
    .text(0, 22, subtitle, {
      fontSize: "15px",
      color: "#e5f5ff",
      fontStyle: "bold",
      fontFamily: "Pretendard, Noto Sans KR, Arial, sans-serif",
      stroke: "#0a2a5d",
      strokeThickness: 3,
    })
    .setOrigin(0.5);
  group.add([...frameObjects, topLine, bottomLine]);

  scene.tweens.add({
    targets: group,
    y: 86,
    duration: scaledDuration(260),
    ease: "Back.easeOut",
  });
  scene.time.delayedCall(1450, () => {
    scene.tweens.add({
      targets: group,
      y: -90,
      alpha: 0,
      duration: scaledDuration(260),
      ease: "Quad.easeIn",
      onComplete: () => group.destroy(),
    });
  });
}

export function pulseButton(
  scene: Phaser.Scene,
  target: Phaser.GameObjects.GameObject,
): void {
  scene.tweens.add({
    targets: target,
    scale: 1.06,
    duration: scaledDuration(90),
    yoyo: true,
    ease: "Quad.easeOut",
  });
}

export function shakeCamera(
  scene: Phaser.Scene,
  intensity = 0.004,
  duration = 120,
): void {
  const camera = scene.cameras.main;
  if (camera) camera.shake(scaledDuration(duration), scaledShake(intensity));
}

function spawnSheetFx(
  scene: Phaser.Scene,
  textureKey: string,
  animationKey: string,
  x: number,
  y: number,
  scale = 1,
  depth = 70,
  cost = 1,
): void {
  if (!scene.textures.exists(textureKey) || !shouldSpawnFx(scene, cost)) return;
  const fx = scene.add
    .sprite(x, y, textureKey, 0)
    .setScale(scale)
    .setDepth(depth);
  fx.play(animationKey);
  fx.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => fx.destroy());
}

export function spawnBuildDust(
  scene: Phaser.Scene,
  x: number,
  y: number,
): void {
  spawnSheetFx(
    scene,
    "fx-build-dust",
    "fx-build-dust-play",
    x,
    y + 8,
    1.12,
    68,
    1.3,
  );
  if (!shouldSpawnFx(scene, 0.8)) return;
  const count = scaledFxCount(8, 3);
  for (let i = 0; i < count; i++) {
    const angle = -Math.PI + (Math.PI * i) / Math.max(1, count - 1);
    const chip = scene.add
      .rectangle(x, y + 14, 6, 4, 0xc79c5a, 0.88)
      .setRotation(angle)
      .setDepth(67);
    scene.tweens.add({
      targets: chip,
      x: x + Math.cos(angle) * Phaser.Math.Between(20, 42),
      y: y + 14 + Math.sin(angle) * Phaser.Math.Between(8, 26),
      alpha: 0,
      duration: scaledDuration(380),
      ease: "Quad.easeOut",
      onComplete: () => chip.destroy(),
    });
  }
}

export function spawnUpgradeBurst(
  scene: Phaser.Scene,
  x: number,
  y: number,
  color = 0xffd36b,
): void {
  spawnSheetFx(
    scene,
    "fx-upgrade-burst",
    "fx-upgrade-burst-play",
    x,
    y - 4,
    1.2,
    72,
    1.5,
  );
  spawnImpactRing(scene, x, y - 2, 42, color, 0.18, 420);
  if (!shouldSpawnFx(scene, 1.1)) return;
  const count = scaledFxCount(10, 4);
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count;
    const gem = scene.add
      .polygon(x, y - 4, [0, -9, 7, 0, 0, 9, -7, 0], color, 0.86)
      .setDepth(73);
    scene.tweens.add({
      targets: gem,
      x: x + Math.cos(angle) * 44,
      y: y - 4 + Math.sin(angle) * 34,
      scale: 0.2,
      alpha: 0,
      duration: scaledDuration(470),
      ease: "Quad.easeOut",
      onComplete: () => gem.destroy(),
    });
  }
}

export function spawnDeathPoof(
  scene: Phaser.Scene,
  x: number,
  y: number,
  scale = 1,
): void {
  // 기본 사망 연출은 스프라이트 시트 기반으로 처리하여 전투 중 draw call과 CPU 코스트를 낮춘다.
  const release = tryAcquireCombatFx(scene, "particleBurst");
  if (!release) return;
  scene.time.delayedCall(scaledDuration(520), release);
  spawnSheetFx(
    scene,
    "fx-death-poof",
    "fx-death-poof-play",
    x,
    y,
    scale,
    76,
    1.2,
  );

  if (!shouldSpawnFx(scene, 0.75)) return;
  const dustCount = scaledFxCount(6, 2);
  for (let i = 0; i < dustCount; i += 1) {
    const angle =
      -Math.PI * 0.9 + (Math.PI * 1.8 * i) / Math.max(1, dustCount - 1);
    const dust = scene.textures.exists("ui-particles")
      ? scene.add
          .sprite(x, y + 5, "ui-particles", i % 4)
          .setScale(0.38 * scale)
          .setDepth(75)
      : scene.add.circle(x, y + 5, 3.5 * scale, 0xd8c2a3, 0.72).setDepth(75);
    dust.setAlpha(0.72);
    scene.tweens.add({
      targets: dust,
      x: x + Math.cos(angle) * Phaser.Math.Between(18, 38) * scale,
      y: y + 8 + Math.sin(angle) * Phaser.Math.Between(8, 22) * scale,
      alpha: 0,
      scale: 0.12 * scale,
      duration: scaledDuration(360),
      ease: "Quad.easeOut",
      onComplete: () => dust.destroy(),
    });
  }
}

export function spawnExplosionBurst(
  scene: Phaser.Scene,
  x: number,
  y: number,
  scale = 1,
): void {
  spawnSheetFx(
    scene,
    "fx-explosion-burst",
    "fx-explosion-burst-play",
    x,
    y,
    scale,
    78,
    1.8,
  );
}

export function spawnTowerSkillCutIn(
  scene: Phaser.Scene,
  towerKind: string,
  towerLabel: string,
  skillName: string,
  color = 0xffd36b,
): void {
  const width = 960;
  const group = scene.add.container(-width, 270).setDepth(140);
  const veil = scene.add.rectangle(width / 2, 0, width, 540, 0x000000, 0.38);
  const slash = scene.add
    .polygon(
      width / 2,
      0,
      [0, -84, 760, -132, 880, 0, 760, 132, 0, 84],
      color,
      0.92,
    )
    .setStrokeStyle(4, 0xfff1c2, 0.6);
  const dark = scene.add
    .polygon(
      width / 2,
      0,
      [20, -66, 720, -108, 816, 0, 720, 108, 20, 66],
      0x0b1220,
      0.92,
    )
    .setStrokeStyle(2, 0xffffff, 0.16);
  const title = scene.add
    .text(445, -34, towerLabel, {
      fontSize: "28px",
      color: "#fff4c2",
      fontStyle: "bold",
      stroke: "#2a1007",
      strokeThickness: 5,
    })
    .setOrigin(0, 0.5);
  const skill = scene.add
    .text(445, 18, skillName, {
      fontSize: "42px",
      color: "#ffffff",
      fontStyle: "bold",
      stroke: "#000000",
      strokeThickness: 6,
    })
    .setOrigin(0, 0.5);
  const badge = scene.add
    .circle(365, 0, 54, 0xfff1c2, 0.18)
    .setStrokeStyle(3, 0xfff1c2, 0.85);
  const textureKey = `tower-${towerKind}-lv3`;
  let icon: Phaser.GameObjects.GameObject;
  if (scene.textures.exists(textureKey)) {
    icon = scene.add.image(365, 0, textureKey).setScale(1.5);
  } else {
    icon = scene.add
      .star(365, 0, 7, 18, 46, color, 0.9)
      .setStrokeStyle(2, 0xfff1c2, 0.8);
  }
  const lineTop = scene.add.rectangle(515, -74, 380, 3, 0xfff1c2, 0.65);
  const lineBottom = scene.add.rectangle(515, 74, 380, 3, 0xfff1c2, 0.65);
  group.add([
    veil,
    slash,
    dark,
    badge,
    icon,
    title,
    skill,
    lineTop,
    lineBottom,
  ]);

  scene.tweens.add({
    targets: group,
    x: 0,
    duration: scaledDuration(210),
    ease: "Cubic.easeOut",
    onComplete: () => {
      scene.time.delayedCall(720, () => {
        scene.tweens.add({
          targets: group,
          x: width,
          alpha: 0,
          duration: scaledDuration(230),
          ease: "Cubic.easeIn",
          onComplete: () => group.destroy(),
        });
      });
    },
  });

  scene.tweens.add({
    targets: icon,
    scale: "+=0.18",
    duration: scaledDuration(240),
    yoyo: true,
    repeat: 2,
  });
  scene.cameras.main?.shake(scaledDuration(120), scaledShake(0.0025));
}
