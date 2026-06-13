import Phaser from "phaser";
import { getDefenseUiFocusProfile } from "./DefenseUiFocusSystem";
import { lowPowerMode } from "./QualityManager";
import { isMobileRuntime, preferReducedMotion } from "./PerformanceMode";

type FlowTone = "ready" | "build" | "defend" | "upgrade" | "danger" | "done";

export type BattleActionFlowSnapshot = {
  waveRunning: boolean;
  waveIndex: number;
  totalWaves: number;
  nextWaveCountdownMs: number;
  enemiesAlive: number;
  towersBuilt: number;
  gold: number;
  lives: number;
  selectedTower: boolean;
  buildMenuOpen: boolean;
  ended: boolean;
  meteorReady?: boolean;
  mercenaryReady?: boolean;
  heroSkillReady?: boolean;
};

export type BattleActionFlowHandle = {
  update: (force?: boolean) => void;
  cue: (text: string, tone?: FlowTone) => void;
  destroy: () => void;
};

type Decision = {
  key: string;
  phase: string;
  title: string;
  detail: string;
  tone: FlowTone;
  visible: boolean;
  canPrimary: boolean;
};

type FlowOptions = {
  getSnapshot: () => BattleActionFlowSnapshot;
  onPrimaryAction?: () => void;
};

const FLOW_STORAGE_KEY = "ksDefenseActionFlow";
const TONE_COLOR: Record<FlowTone, number> = {
  ready: 0xffc86b,
  build: 0x78d7ff,
  defend: 0x8be878,
  upgrade: 0xcaa6ff,
  danger: 0xff7070,
  done: 0xffdf8b,
};

function query(): URLSearchParams {
  return new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
}

function readStorage(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function useDefenseActionFlow(): boolean {
  const qs = query();
  if (
    qs.has("noactionflow") ||
    qs.has("nodecisionflow") ||
    qs.has("legacyactionflow") ||
    qs.has("maximalui") ||
    qs.has("fullhud") ||
    qs.has("toydebug")
  ) {
    return false;
  }
  if (qs.has("actionflow") || qs.has("decisionflow") || qs.has("gameflow") || qs.has("playflow")) return true;
  if (readStorage(FLOW_STORAGE_KEY) === "off") return false;
  return getDefenseUiFocusProfile().enabled;
}

function compactNumber(value: number): string {
  if (value >= 1000) return `${Math.floor(value / 100) / 10}k`;
  return `${value}`;
}

function decide(snapshot: BattleActionFlowSnapshot): Decision {
  const waveNow = Math.max(0, snapshot.waveIndex + 1);
  const sec = Math.ceil(snapshot.nextWaveCountdownMs / 1000);
  const lowLives = snapshot.lives <= 5;
  const nextIsBoss = snapshot.totalWaves > 0 && snapshot.waveIndex + 2 >= snapshot.totalWaves;

  if (snapshot.ended) {
    return {
      key: "done",
      phase: "DEBRIEF",
      title: "결과 확인",
      detail: "보상과 다음 성장 루프를 확인하세요",
      tone: "done",
      visible: false,
      canPrimary: false,
    };
  }

  if (lowLives && snapshot.waveRunning) {
    return {
      key: `danger-${snapshot.lives}-${snapshot.enemiesAlive}`,
      phase: "DANGER",
      title: "방어선 위험",
      detail: `생명 ${snapshot.lives} · 병영/영웅/스킬로 새는 길목 차단`,
      tone: "danger",
      visible: true,
      canPrimary: false,
    };
  }

  if (snapshot.buildMenuOpen) {
    return {
      key: `build-menu-${snapshot.gold}`,
      phase: "BUILD",
      title: "타워 선택",
      detail: `현재 골드 ${compactNumber(snapshot.gold)} · 역할이 겹치지 않게 배치`,
      tone: "build",
      visible: true,
      canPrimary: false,
    };
  }

  if (snapshot.towersBuilt <= 0) {
    return {
      key: "first-build",
      phase: "STEP 1",
      title: "첫 타워 배치",
      detail: "빈 건설 지점을 눌러 길목을 막으세요",
      tone: "build",
      visible: true,
      canPrimary: false,
    };
  }

  if (!snapshot.waveRunning && snapshot.waveIndex < 0) {
    return {
      key: "first-start",
      phase: "STEP 2",
      title: "공세 시작",
      detail: "기본 방어선 준비 완료 · 눌러서 첫 웨이브 개시",
      tone: "ready",
      visible: true,
      canPrimary: true,
    };
  }

  if (snapshot.waveRunning) {
    const readySpell = snapshot.meteorReady || snapshot.mercenaryReady || snapshot.heroSkillReady;
    return {
      key: `defend-${waveNow}-${snapshot.enemiesAlive}-${readySpell ? "spell" : "hold"}`,
      phase: `WAVE ${waveNow}`,
      title: readySpell ? "스킬 사용 가능" : "방어 중",
      detail: readySpell
        ? `적 ${snapshot.enemiesAlive} · 위기 지점에 스킬을 쓰세요`
        : `적 ${snapshot.enemiesAlive} · 전장은 가리고 HUD는 최소화`,
      tone: readySpell ? "upgrade" : "defend",
      visible: lowLives || readySpell || query().has("actionflowdebug"),
      canPrimary: false,
    };
  }

  if (snapshot.waveIndex >= snapshot.totalWaves - 1) {
    return {
      key: "clear-ready",
      phase: "CLEAR",
      title: "전장 정리",
      detail: "남은 보상과 결과 화면으로 이동합니다",
      tone: "done",
      visible: false,
      canPrimary: false,
    };
  }

  const phase = nextIsBoss ? "BOSS PREP" : `NEXT ${waveNow + 1}`;
  const title = snapshot.selectedTower ? "강화 후 진행" : nextIsBoss ? "보스 대비" : "정비 후 진행";
  const detail = sec > 0
    ? `${sec}초 후 자동 공세 · 타워 선택/업그레이드 또는 즉시 진행`
    : "준비 완료 · 눌러서 다음 공세를 앞당기세요";
  return {
    key: `idle-${waveNow}-${sec}-${snapshot.selectedTower ? "selected" : "none"}-${nextIsBoss ? "boss" : "wave"}`,
    phase,
    title,
    detail,
    tone: nextIsBoss ? "danger" : snapshot.selectedTower ? "upgrade" : "ready",
    visible: true,
    canPrimary: true,
  };
}

export function installBattleActionFlow(scene: Phaser.Scene, options: FlowOptions): BattleActionFlowHandle | undefined {
  if (!useDefenseActionFlow()) return undefined;

  const profile = getDefenseUiFocusProfile();
  const root = scene.add.container(480, 116).setName("ks-defense-action-flow").setDepth(96.2);
  const bg = scene.add.graphics();
  const phase = scene.add
    .text(-144, 0, "STEP", {
      fontFamily: "Pretendard, Noto Sans KR, NanumGothic, Arial, sans-serif",
      fontSize: profile.mode === "essential" ? "13px" : "12px",
      fontStyle: "900",
      color: "#08101e",
      align: "center",
      fixedWidth: 74,
    })
    .setOrigin(0.5);
  const title = scene.add
    .text(-96, -8, "", {
      fontFamily: "Pretendard, Noto Sans KR, NanumGothic, Arial, sans-serif",
      fontSize: profile.mode === "essential" ? "17px" : isMobileRuntime() ? "16px" : "15px",
      fontStyle: "900",
      color: "#fff6ce",
      stroke: "#020611",
      strokeThickness: 3,
      fixedWidth: 258,
    })
    .setOrigin(0, 0.5);
  const detail = scene.add
    .text(-96, 10, "", {
      fontFamily: "Pretendard, Noto Sans KR, NanumGothic, Arial, sans-serif",
      fontSize: profile.mode === "essential" ? "13px" : "12px",
      fontStyle: "700",
      color: "#dbe7ff",
      stroke: "#020611",
      strokeThickness: 2,
      fixedWidth: 270,
    })
    .setOrigin(0, 0.5);
  const hot = scene.add.zone(0, 0, 374, 52).setInteractive({ useHandCursor: true });
  root.add([bg, phase, title, detail, hot]);
  root.setVisible(false).setAlpha(0);

  let lastKey = "";
  let lastUpdateAt = -9999;
  let currentDecision: Decision | undefined;
  let flashTimer: Phaser.Time.TimerEvent | undefined;

  const redraw = (decision: Decision): void => {
    currentDecision = decision;
    const color = TONE_COLOR[decision.tone];
    bg.clear();
    bg.fillStyle(0x020713, profile.mode === "essential" ? 0.94 : 0.82).fillRoundedRect(-187, -26, 374, 52, 18);
    bg.lineStyle(2, color, decision.canPrimary ? 0.74 : 0.48).strokeRoundedRect(-187, -26, 374, 52, 18);
    bg.fillStyle(color, decision.canPrimary ? 0.96 : 0.74).fillRoundedRect(-180, -18, 76, 36, 13);
    bg.fillStyle(0xffffff, 0.08).fillRoundedRect(-94, -21, 270, 7, 4);
    bg.fillStyle(color, 0.36).fillRoundedRect(-94, -21, Math.min(270, 52 + decision.phase.length * 10), 7, 4);
    bg.lineStyle(1, 0xffffff, 0.12).lineBetween(-86, 21, 170, 21);
    phase.setText(decision.phase);
    title.setText(decision.title);
    detail.setText(decision.detail);
    root.setVisible(decision.visible);
    root.setAlpha(decision.visible ? 0.96 : 0);
    hot.disableInteractive();
    if (decision.canPrimary && decision.visible) hot.setInteractive({ useHandCursor: true });
  };

  const update = (force = false): void => {
    if (!scene.scene.isActive(scene.scene.key)) return;
    const now = scene.time.now;
    if (!force && now - lastUpdateAt < 180) return;
    lastUpdateAt = now;
    const decision = decide(options.getSnapshot());
    if (!force && decision.key === lastKey) return;
    lastKey = decision.key;
    redraw(decision);
    if (decision.visible && !preferReducedMotion() && !lowPowerMode()) {
      scene.tweens.killTweensOf(root);
      root.setScale(0.98);
      scene.tweens.add({ targets: root, scale: 1, duration: 160, ease: "Cubic.easeOut" });
    }
  };

  const cue = (text: string, tone: FlowTone = "ready"): void => {
    if (!scene.scene.isActive(scene.scene.key)) return;
    const decision: Decision = {
      key: `cue-${text}`,
      phase: tone === "danger" ? "ALERT" : "TIP",
      title: text.length > 18 ? text.slice(0, 18) : text,
      detail: text.length > 18 ? text.slice(18, 62) : "",
      tone,
      visible: true,
      canPrimary: false,
    };
    redraw(decision);
    flashTimer?.remove(false);
    flashTimer = scene.time.delayedCall(1800, () => update(true));
  };

  hot.on("pointerdown", () => {
    if (!currentDecision?.canPrimary) return;
    options.onPrimaryAction?.();
    cue("공세를 시작합니다", "ready");
  });

  update(true);
  scene.time.delayedCall(240, () => update(true));
  const destroy = (): void => {
    flashTimer?.remove(false);
    root.destroy();
  };
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, destroy);
  scene.events.once(Phaser.Scenes.Events.DESTROY, destroy);
  return { update, cue, destroy };
}

export function compactBattleMessageForActionFlow(text: string): { text: string; tone: FlowTone; suppressCenter?: boolean } | undefined {
  if (!useDefenseActionFlow()) return undefined;
  if (/프레임|절전|위험|돌파|보스/.test(text)) return { text, tone: "danger" };
  if (/배치 완료|업그레이드|강화|진화|병력 보충/.test(text)) return { text, tone: "upgrade" };
  if (/골드 부족|쿨타임|필요합니다/.test(text)) return { text, tone: "danger" };
  if (/지휘 목표|작전 변수|일일 도전|시너지/.test(text)) return { text, tone: "defend", suppressCenter: true };
  return undefined;
}
