import Phaser from "phaser";
import type { PathPoint, StageConfig, WaveSpawn } from "./types";

const FALLBACK_PATH: PathPoint[] = [
  { x: 42, y: 270 },
  { x: 240, y: 270 },
  { x: 480, y: 250 },
  { x: 720, y: 292 },
  { x: 918, y: 292 },
];

const FALLBACK_SPOTS: PathPoint[] = [
  { x: 220, y: 180 },
  { x: 382, y: 350 },
  { x: 560, y: 170 },
  { x: 720, y: 382 },
];

function finiteNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function clampPoint(point: PathPoint | undefined, fallback: PathPoint): PathPoint {
  return {
    x: Phaser.Math.Clamp(finiteNumber(point?.x, fallback.x), 28, 932),
    y: Phaser.Math.Clamp(finiteNumber(point?.y, fallback.y), 76, 462),
  };
}

function sanitizePoints(points: PathPoint[] | undefined, fallback: PathPoint[], minCount: number): PathPoint[] {
  const source = Array.isArray(points) && points.length >= minCount ? points : fallback;
  return source.map((point, index) => clampPoint(point, fallback[index % fallback.length]));
}

function sanitizeWaveSpawn(spawn: WaveSpawn): WaveSpawn {
  return {
    ...spawn,
    count: Math.max(1, Math.min(160, Math.round(finiteNumber(spawn.count, 1)))),
    gapMs: Math.max(80, Math.min(6000, Math.round(finiteNumber(spawn.gapMs, 900)))),
    delayAfterMs:
      spawn.delayAfterMs === undefined
        ? undefined
        : Math.max(0, Math.min(20000, Math.round(finiteNumber(spawn.delayAfterMs, 0)))),
  };
}

function sanitizeWaves(waves: WaveSpawn[][]): WaveSpawn[][] {
  if (!Array.isArray(waves) || waves.length === 0) return [[{ kind: "goblin", count: 6, gapMs: 850 }]];
  return waves.map((wave) =>
    Array.isArray(wave) && wave.length > 0
      ? wave.map(sanitizeWaveSpawn)
      : [{ kind: "goblin", count: 4, gapMs: 900 }],
  );
}

function samePoint(a: PathPoint, b: PathPoint): boolean {
  return a.x === b.x && a.y === b.y;
}

function samePointList(a: PathPoint[], b: PathPoint[]): boolean {
  return a.length === b.length && a.every((point, index) => samePoint(point, b[index]));
}

function sameWaves(a: WaveSpawn[][], b: WaveSpawn[][]): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function ensurePlayableStageConfig(scene: Phaser.Scene, stage: StageConfig): StageConfig {
  const path = sanitizePoints(stage.path, FALLBACK_PATH, 2);
  const spots = sanitizePoints(stage.spots, FALLBACK_SPOTS, 1);
  const waves = sanitizeWaves(stage.waves);
  const changed =
    !samePointList(path, stage.path) ||
    !samePointList(spots, stage.spots) ||
    !sameWaves(waves, stage.waves) ||
    !Number.isFinite(stage.startGold) ||
    !Number.isFinite(stage.maxLives);

  if (!changed) return stage;

  const safeStage: StageConfig = {
    ...stage,
    startGold: Math.max(0, Math.min(9999, Math.round(finiteNumber(stage.startGold, 280)))),
    maxLives: Math.max(1, Math.min(99, Math.round(finiteNumber(stage.maxLives, 20)))),
    path,
    spots,
    waves,
  };

  scene.events.emit("kingdom-seed:stage-integrity-repaired", { stageId: stage.id });
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("kingdom-seed:stage-integrity-repaired", {
        detail: { stageId: stage.id, scene: scene.scene.key },
      }),
    );
  }
  return safeStage;
}
