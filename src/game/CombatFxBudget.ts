import type Phaser from "phaser";
import { lowPowerMode } from "./QualityManager";

export type CombatFxKind = "projectile" | "floatingText" | "particleBurst";

type CombatFxState = {
  active: Record<CombatFxKind, number>;
  skipped: Record<CombatFxKind, number>;
};

const sceneStates = new WeakMap<Phaser.Scene, CombatFxState>();
const guardedScenes = new WeakSet<Phaser.Scene>();

function makeState(): CombatFxState {
  return {
    active: {
      projectile: 0,
      floatingText: 0,
      particleBurst: 0,
    },
    skipped: {
      projectile: 0,
      floatingText: 0,
      particleBurst: 0,
    },
  };
}

function stateFor(scene: Phaser.Scene): CombatFxState {
  const existing = sceneStates.get(scene);
  if (existing) return existing;
  const created = makeState();
  sceneStates.set(scene, created);
  return created;
}

function capFor(kind: CombatFxKind): number {
  const low = lowPowerMode();
  if (kind === "projectile") return low ? 10 : 22;
  if (kind === "floatingText") return low ? 7 : 18;
  return low ? 6 : 14;
}

function autoReleaseMs(kind: CombatFxKind): number {
  // 트윈/타이머가 씬 전환, 일시정지, 강제 종료로 onComplete에 도달하지 못해도
  // FX 예산 카운터가 영구 점유되지 않도록 종류별 최대 수명을 둔다.
  if (kind === "projectile") return 2400;
  if (kind === "floatingText") return 1800;
  return 1200;
}

function installSceneResetGuard(scene: Phaser.Scene): void {
  if (guardedScenes.has(scene)) return;
  guardedScenes.add(scene);
  const reset = (): void => resetCombatFxBudget(scene);
  scene.events.once("shutdown", reset);
  scene.events.once("destroy", reset);
}

export function resetCombatFxBudget(scene: Phaser.Scene): void {
  const state = stateFor(scene);
  state.active.projectile = 0;
  state.active.floatingText = 0;
  state.active.particleBurst = 0;
}

export function tryAcquireCombatFx(
  scene: Phaser.Scene,
  kind: CombatFxKind,
  amount = 1,
): (() => void) | undefined {
  installSceneResetGuard(scene);
  const state = stateFor(scene);
  const cap = capFor(kind);
  if (state.active[kind] + amount > cap) {
    state.skipped[kind] += amount;
    if (state.skipped[kind] % 12 === 0 && typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("kingdom-seed:combat-fx-throttled", {
          detail: {
            kind,
            active: state.active[kind],
            cap,
            skipped: state.skipped[kind],
          },
        }),
      );
    }
    return undefined;
  }

  state.active[kind] += amount;
  let released = false;
  let watchdog: Phaser.Time.TimerEvent | undefined;
  const release = (): void => {
    if (released) return;
    released = true;
    watchdog?.remove(false);
    watchdog = undefined;
    state.active[kind] = Math.max(0, state.active[kind] - amount);
  };

  watchdog = scene.time.delayedCall(autoReleaseMs(kind), release);
  return release;
}

export function getCombatFxSnapshot(scene: Phaser.Scene): CombatFxState {
  const state = stateFor(scene);
  return {
    active: { ...state.active },
    skipped: { ...state.skipped },
  };
}
