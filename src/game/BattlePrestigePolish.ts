import Phaser from "phaser";
import { lowPowerMode } from "./QualityManager";
import type { EnemyConfig, StageConfig, TowerKind } from "./types";

export type VisibleGameObject = Phaser.GameObjects.GameObject & {
  setVisible: (visible: boolean) => VisibleGameObject;
};

function query(): URLSearchParams {
  return new URLSearchParams(
    typeof window !== "undefined" ? window.location.search : "",
  );
}

export function usePrestigeBattleLook(): boolean {
  const qs = query();
  return !qs.has("toydebug") && !qs.has("plainbattle") && !qs.has("flatbattle");
}

export function usePrestigeFallbackUnits(): boolean {
  const qs = query();
  if (!usePrestigeBattleLook()) return false;
  if (qs.has("legacyactors") || qs.has("oldactors")) return false;
  // Keep isolated icon QA modes visually honest. Those modes are for checking the generated art itself.
  if (qs.has("iconmock") || qs.has("stickerart")) return false;
  return true;
}

function tintMix(base: number, add: number, amount: number): number {
  const br = (base >> 16) & 0xff;
  const bg = (base >> 8) & 0xff;
  const bb = base & 0xff;
  const ar = (add >> 16) & 0xff;
  const ag = (add >> 8) & 0xff;
  const ab = add & 0xff;
  const r = Math.round(br + (ar - br) * amount);
  const g = Math.round(bg + (ag - bg) * amount);
  const b = Math.round(bb + (ab - bb) * amount);
  return (r << 16) | (g << 8) | b;
}

function themeGrade(theme: StageConfig["theme"]): {
  deep: number;
  accent: number;
  warm: number;
} {
  if (theme === "canyon")
    return { deep: 0x160b08, accent: 0xffb46b, warm: 0xffd19b };
  if (theme === "swamp")
    return { deep: 0x06120f, accent: 0x90ffd2, warm: 0xcaf8d0 };
  if (theme === "fortress")
    return { deep: 0x09070d, accent: 0xff755f, warm: 0xffc06c };
  return { deep: 0x06120c, accent: 0xb9f47d, warm: 0xffe0a0 };
}

/**
 * v2.36.9: a static color-grade pass. It is intentionally cheap: a few Graphics primitives,
 * no texture downloads, and no infinite tweens. It makes the default code/procedural battlefield
 * read closer to an illustrated 2.5D board before deferred art arrives.
 */
export function installBattlePrestigeLook(
  scene: Phaser.Scene,
  stage: StageConfig,
): void {
  if (!usePrestigeBattleLook()) return;
  const low = lowPowerMode();
  const grade = themeGrade(stage.theme);

  const lowerGrade = scene.add.graphics().setDepth(6.35);
  lowerGrade.fillStyle(grade.deep, low ? 0.08 : 0.12).fillRect(0, 66, 960, 410);
  lowerGrade
    .fillStyle(grade.accent, low ? 0.018 : 0.028)
    .fillEllipse(484, 284, 760, 268);
  lowerGrade
    .fillStyle(grade.warm, low ? 0.012 : 0.022)
    .fillEllipse(620, 158, 420, 118);

  const vignette = scene.add.graphics().setDepth(67.3);
  vignette.fillStyle(0x000000, low ? 0.16 : 0.22).fillRect(0, 0, 960, 54);
  vignette.fillStyle(0x000000, low ? 0.18 : 0.25).fillRect(0, 486, 960, 54);
  vignette.fillStyle(0x000000, low ? 0.1 : 0.16).fillRect(0, 54, 44, 432);
  vignette.fillStyle(0x000000, low ? 0.1 : 0.16).fillRect(916, 54, 44, 432);
  vignette.lineStyle(1, grade.warm, low ? 0.07 : 0.12);
  vignette.beginPath();
  vignette.moveTo(58, 72);
  vignette.lineTo(902, 72);
  vignette.strokePath();
  vignette.beginPath();
  vignette.moveTo(70, 472);
  vignette.lineTo(890, 472);
  vignette.strokePath();
}

export function createPrestigeTowerFallback(
  scene: Phaser.Scene,
  kind: TowerKind,
  accent: number,
  level = 1,
): VisibleGameObject[] {
  if (!usePrestigeFallbackUnits()) return [];
  const g = scene.add.graphics() as VisibleGameObject &
    Phaser.GameObjects.Graphics;
  const scale = level >= 3 ? 1.1 : level === 2 ? 1.05 : 1;
  const deep = tintMix(accent, 0x000000, 0.68);
  const mid = tintMix(accent, 0xffffff, 0.16);
  const light = tintMix(accent, 0xffe0a0, 0.36);

  g.fillStyle(0x000000, 0.28).fillEllipse(0, 22, 68 * scale, 22 * scale);
  g.fillStyle(0x1a1410, 0.96).fillRoundedRect(
    -28 * scale,
    -2 * scale,
    56 * scale,
    32 * scale,
    8 * scale,
  );
  g.fillStyle(tintMix(deep, 0x755b42, 0.22), 1).fillRoundedRect(
    -23 * scale,
    3 * scale,
    46 * scale,
    23 * scale,
    6 * scale,
  );
  g.lineStyle(2, 0xffddb0, 0.17).strokeRoundedRect(
    -24 * scale,
    2 * scale,
    48 * scale,
    25 * scale,
    7 * scale,
  );
  g.fillStyle(0xffffff, 0.07).fillRoundedRect(
    -18 * scale,
    1 * scale,
    36 * scale,
    7 * scale,
    3 * scale,
  );

  if (kind === "artillery") {
    g.fillStyle(0x15100d, 1).fillRoundedRect(
      -30 * scale,
      -20 * scale,
      60 * scale,
      24 * scale,
      7 * scale,
    );
    g.fillStyle(mid, 0.98).fillRoundedRect(
      -23 * scale,
      -24 * scale,
      52 * scale,
      12 * scale,
      5 * scale,
    );
    g.fillStyle(0x090909, 0.92).fillRoundedRect(
      5 * scale,
      -31 * scale,
      42 * scale,
      11 * scale,
      5 * scale,
    );
    g.fillStyle(light, 0.8).fillCircle(-15 * scale, -13 * scale, 6 * scale);
  } else if (kind === "barracks") {
    g.fillStyle(deep, 1).fillRoundedRect(
      -27 * scale,
      -28 * scale,
      54 * scale,
      30 * scale,
      8 * scale,
    );
    g.fillStyle(mid, 0.96).fillTriangle(
      -34 * scale,
      -22 * scale,
      0,
      -49 * scale,
      34 * scale,
      -22 * scale,
    );
    g.lineStyle(2, 0xfff0c8, 0.2).strokeTriangle(
      -34 * scale,
      -22 * scale,
      0,
      -49 * scale,
      34 * scale,
      -22 * scale,
    );
    g.fillStyle(0x0b0d13, 0.86).fillRoundedRect(
      -10 * scale,
      -19 * scale,
      20 * scale,
      23 * scale,
      4 * scale,
    );
  } else if (kind === "mage") {
    g.fillStyle(deep, 1).fillRoundedRect(
      -23 * scale,
      -34 * scale,
      46 * scale,
      40 * scale,
      10 * scale,
    );
    g.fillStyle(mid, 0.95).fillTriangle(
      -31 * scale,
      -26 * scale,
      0,
      -59 * scale,
      31 * scale,
      -26 * scale,
    );
    g.fillStyle(light, 0.88).fillCircle(0, -35 * scale, 10 * scale);
    g.lineStyle(2, light, 0.26).strokeCircle(0, -35 * scale, 15 * scale);
  } else {
    g.fillStyle(deep, 1).fillRoundedRect(
      -24 * scale,
      -32 * scale,
      48 * scale,
      38 * scale,
      9 * scale,
    );
    g.fillStyle(mid, 0.96).fillTriangle(
      -31 * scale,
      -25 * scale,
      0,
      -54 * scale,
      31 * scale,
      -25 * scale,
    );
    g.lineStyle(3, light, 0.72);
    g.beginPath();
    g.moveTo(0, -34 * scale);
    g.lineTo(18 * scale, -48 * scale);
    g.strokePath();
    g.fillStyle(light, 0.9).fillCircle(20 * scale, -50 * scale, 3.2 * scale);
  }

  g.lineStyle(1, 0xffffff, 0.1).strokeEllipse(
    0,
    20 * scale,
    62 * scale,
    19 * scale,
  );
  return [g];
}

export function createPrestigeEnemyFallback(
  scene: Phaser.Scene,
  config: EnemyConfig,
  displayHeight: number,
): VisibleGameObject[] {
  if (!usePrestigeFallbackUnits()) return [];
  const g = scene.add.graphics() as VisibleGameObject &
    Phaser.GameObjects.Graphics;
  const scale = Math.max(0.78, Math.min(1.85, displayHeight / 74));
  const accent = config.accentColor ?? config.color;
  const deep = tintMix(config.color, 0x000000, 0.54);
  const mid = tintMix(config.color, 0xffffff, 0.12);
  const rim = tintMix(accent, 0xffe0a0, 0.22);
  const boss = config.threat === "boss";
  const tank = config.threat === "tank" || boss;
  const flying = config.flying || config.threat === "flying";

  g.fillStyle(0x000000, flying ? 0.16 : 0.3).fillEllipse(
    0,
    flying ? 23 * scale : 19 * scale,
    (tank ? 58 : 44) * scale,
    (tank ? 17 : 13) * scale,
  );
  if (flying) {
    g.fillStyle(deep, 0.88).fillTriangle(
      -36 * scale,
      -10 * scale,
      -5 * scale,
      -24 * scale,
      -8 * scale,
      4 * scale,
    );
    g.fillStyle(deep, 0.88).fillTriangle(
      36 * scale,
      -10 * scale,
      5 * scale,
      -24 * scale,
      8 * scale,
      4 * scale,
    );
    g.lineStyle(2, rim, 0.22).strokeTriangle(
      -36 * scale,
      -10 * scale,
      -5 * scale,
      -24 * scale,
      -8 * scale,
      4 * scale,
    );
    g.lineStyle(2, rim, 0.22).strokeTriangle(
      36 * scale,
      -10 * scale,
      5 * scale,
      -24 * scale,
      8 * scale,
      4 * scale,
    );
  }

  if (boss) {
    g.fillStyle(0x10090c, 1).fillEllipse(0, -6 * scale, 50 * scale, 66 * scale);
    g.fillStyle(deep, 1).fillEllipse(0, -11 * scale, 42 * scale, 58 * scale);
    g.fillStyle(mid, 0.92).fillRoundedRect(
      -22 * scale,
      -38 * scale,
      44 * scale,
      20 * scale,
      8 * scale,
    );
    g.fillStyle(rim, 0.78).fillTriangle(
      -24 * scale,
      -36 * scale,
      -11 * scale,
      -55 * scale,
      -2 * scale,
      -34 * scale,
    );
    g.fillStyle(rim, 0.78).fillTriangle(
      24 * scale,
      -36 * scale,
      11 * scale,
      -55 * scale,
      2 * scale,
      -34 * scale,
    );
  } else if (tank) {
    g.fillStyle(0x100c0a, 1).fillRoundedRect(
      -25 * scale,
      -33 * scale,
      50 * scale,
      58 * scale,
      16 * scale,
    );
    g.fillStyle(deep, 1).fillRoundedRect(
      -20 * scale,
      -28 * scale,
      40 * scale,
      49 * scale,
      13 * scale,
    );
    g.fillStyle(mid, 0.75).fillRoundedRect(
      -18 * scale,
      -28 * scale,
      36 * scale,
      12 * scale,
      5 * scale,
    );
  } else {
    g.fillStyle(0x100c0b, 0.98).fillEllipse(
      0,
      -7 * scale,
      37 * scale,
      49 * scale,
    );
    g.fillStyle(deep, 1).fillEllipse(0, -10 * scale, 31 * scale, 42 * scale);
    g.fillStyle(mid, 0.76).fillEllipse(
      -5 * scale,
      -22 * scale,
      15 * scale,
      11 * scale,
    );
  }

  g.fillStyle(rim, boss ? 0.9 : 0.74).fillCircle(
    0,
    -23 * scale,
    (boss ? 5.2 : 3.8) * scale,
  );
  g.lineStyle(2, rim, boss ? 0.34 : 0.22).strokeEllipse(
    0,
    -9 * scale,
    (tank ? 42 : 34) * scale,
    (tank ? 58 : 46) * scale,
  );
  g.fillStyle(0xffffff, 0.1).fillEllipse(
    -7 * scale,
    -23 * scale,
    12 * scale,
    9 * scale,
  );
  return [g];
}

export function createPrestigeHeroFallback(
  scene: Phaser.Scene,
): VisibleGameObject[] {
  if (!usePrestigeFallbackUnits()) return [];
  const g = scene.add.graphics() as VisibleGameObject &
    Phaser.GameObjects.Graphics;
  g.fillStyle(0x000000, 0.26).fillEllipse(0, 18, 42, 13);
  g.fillStyle(0x1c2432, 1).fillRoundedRect(-15, -29, 30, 48, 10);
  g.fillStyle(0x33405a, 0.96).fillRoundedRect(-11, -25, 22, 36, 8);
  g.fillStyle(0xd7dde8, 0.96).fillTriangle(-14, -22, 0, -43, 14, -22);
  g.lineStyle(2, 0xfff0b0, 0.34).strokeTriangle(-14, -22, 0, -43, 14, -22);
  g.fillStyle(0xffd66d, 0.9).fillCircle(0, -16, 4.5);
  g.lineStyle(2, 0xffd66d, 0.24).strokeEllipse(0, -8, 35, 48);
  g.fillStyle(0xffffff, 0.09).fillRoundedRect(-7, -25, 10, 31, 5);
  return [g];
}
