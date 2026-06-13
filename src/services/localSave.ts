import type { User } from "firebase/auth";

export type ClearedStage = {
  bestStars: number;
  bestScore: number;
  bestLives: number;
  clearCount: number;
  updatedAt?: unknown;
};

export type PlayerSave = {
  uid: string;
  nickname: string;
  stars: number;
  clearedStages: Record<string, ClearedStage>;
  upgrades: {
    archerDamage: number;
    mageDamage: number;
    barracksHp: number;
    artillerySplash: number;
  };
  createdAt?: unknown;
  updatedAt?: unknown;
};

export type UpgradeKey = keyof PlayerSave["upgrades"];

type LocalSaveSnapshot = Omit<PlayerSave, "uid"> & { uid?: string };

type SaveLike = {
  nickname?: unknown;
  stars?: unknown;
  clearedStages?: unknown;
  upgrades?: unknown;
  createdAt?: unknown;
  updatedAt?: unknown;
};

export type InstantLocalSession = {
  user: User;
  save: PlayerSave;
  source: "instant-local";
};

const defaultUpgrades: PlayerSave["upgrades"] = {
  archerDamage: 0,
  mageDamage: 0,
  barracksHp: 0,
  artillerySplash: 0,
};

const LOCAL_GUEST_UID_KEY = "kingdom-seed:local-guest-uid";
const LOCAL_SAVE_PREFIX = "kingdom-seed:local-save:";

export const UPGRADE_META: Record<
  UpgradeKey,
  { label: string; description: string; maxLevel: number }
> = {
  archerDamage: {
    label: "궁수 피해 연구",
    description: "궁수 탑의 기본 피해량이 레벨당 8% 증가합니다.",
    maxLevel: 3,
  },
  mageDamage: {
    label: "마법 관통 연구",
    description: "마법사 탑의 기본 피해량이 레벨당 10% 증가합니다.",
    maxLevel: 3,
  },
  barracksHp: {
    label: "병영 방패 연구",
    description: "병영 병사의 체력이 레벨당 20 증가합니다.",
    maxLevel: 3,
  },
  artillerySplash: {
    label: "포탑 화약 연구",
    description: "포탑의 폭발 범위가 레벨당 6 증가합니다.",
    maxLevel: 3,
  },
};

function canUseLocalStorage(): boolean {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function localSaveKey(uid: string): string {
  return `${LOCAL_SAVE_PREFIX}${uid}`;
}

function readJson<T>(key: string): T | undefined {
  if (!canUseLocalStorage()) return undefined;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : undefined;
  } catch {
    return undefined;
  }
}

function writeJson(key: string, value: unknown): void {
  if (!canUseLocalStorage()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Local persistence is the zero-network fast path. Ignore quota/private-mode errors.
  }
}

function getOrCreateLocalGuestUid(): string {
  if (canUseLocalStorage()) {
    try {
      const existing = window.localStorage.getItem(LOCAL_GUEST_UID_KEY);
      if (existing) return existing;
    } catch {
      // private mode / embedded browser storage denial: fall through to memory-only uid
    }
  }
  const random = Math.random().toString(36).slice(2, 10);
  const uid = `local_guest_${Date.now().toString(36)}_${random}`;
  if (canUseLocalStorage()) {
    try {
      window.localStorage.setItem(LOCAL_GUEST_UID_KEY, uid);
    } catch {
      // Storage compatibility mode: the guest can still play this session.
    }
  }
  return uid;
}


function clampInt(value: unknown, fallback: number, min: number, max: number): number {
  const numeric = typeof value === "number" && Number.isFinite(value) ? value : fallback;
  return Math.max(min, Math.min(max, Math.round(numeric)));
}

function normalizeClearedStage(value: unknown): ClearedStage {
  const raw = value && typeof value === "object" ? (value as Partial<ClearedStage>) : {};
  return {
    bestStars: clampInt(raw.bestStars, 0, 0, 3),
    bestScore: clampInt(raw.bestScore, 0, 0, 9999999),
    bestLives: clampInt(raw.bestLives, 0, 0, 99),
    clearCount: clampInt(raw.clearCount, 0, 0, 9999),
    updatedAt: raw.updatedAt,
  };
}

function normalizeClearedStages(value: unknown): Record<string, ClearedStage> {
  if (!value || typeof value !== "object") return {};
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .filter(([stageId]) => /^stage_\d{3}$/.test(stageId))
      .map(([stageId, stage]) => [stageId, normalizeClearedStage(stage)]),
  );
}

function normalizeUpgradeLevels(value: unknown): PlayerSave["upgrades"] {
  const raw = value && typeof value === "object" ? (value as Partial<PlayerSave["upgrades"]>) : {};
  return {
    archerDamage: clampInt(raw.archerDamage, defaultUpgrades.archerDamage, 0, UPGRADE_META.archerDamage.maxLevel),
    mageDamage: clampInt(raw.mageDamage, defaultUpgrades.mageDamage, 0, UPGRADE_META.mageDamage.maxLevel),
    barracksHp: clampInt(raw.barracksHp, defaultUpgrades.barracksHp, 0, UPGRADE_META.barracksHp.maxLevel),
    artillerySplash: clampInt(raw.artillerySplash, defaultUpgrades.artillerySplash, 0, UPGRADE_META.artillerySplash.maxLevel),
  };
}

function makeGuestName(user: Pick<User, "uid" | "displayName">): string {
  return user.displayName || `Guest${user.uid.slice(0, 5).toUpperCase()}`;
}

export function makeLocalGuestUser(): User {
  const uid = getOrCreateLocalGuestUid();
  return {
    uid,
    displayName: `Guest${uid.slice(-5).toUpperCase()}`,
    isAnonymous: true,
    email: null,
  } as User;
}

export function isLocalGuestUser(
  user: Pick<User, "uid"> | null | undefined,
): boolean {
  return Boolean(user?.uid?.startsWith("local_guest_"));
}

export function normalizeSave(user: User, data?: SaveLike): PlayerSave {
  return {
    uid: user.uid,
    nickname:
      typeof data?.nickname === "string" && data.nickname.trim().length > 0
        ? data.nickname.trim().slice(0, 24)
        : makeGuestName(user),
    stars: clampInt(data?.stars, 0, 0, 99999),
    clearedStages: normalizeClearedStages(data?.clearedStages),
    upgrades: normalizeUpgradeLevels(data?.upgrades),
    createdAt: data?.createdAt,
    updatedAt: data?.updatedAt,
  };
}

export function loadLocalSave(user: User): PlayerSave {
  const stored = readJson<LocalSaveSnapshot>(localSaveKey(user.uid));
  return normalizeSave(user, stored);
}

export function persistLocalSave(save: PlayerSave): void {
  const safeSave: PlayerSave = {
    ...save,
    nickname: String(save.nickname || "Commander").trim().slice(0, 24),
    stars: clampInt(save.stars, 0, 0, 99999),
    clearedStages: normalizeClearedStages(save.clearedStages),
    upgrades: normalizeUpgradeLevels(save.upgrades),
  };
  writeJson(localSaveKey(safeSave.uid), {
    uid: safeSave.uid,
    nickname: safeSave.nickname,
    stars: safeSave.stars,
    clearedStages: safeSave.clearedStages,
    upgrades: safeSave.upgrades,
    createdAt: safeSave.createdAt ?? Date.now(),
    updatedAt: Date.now(),
    schemaVersion: 2,
  });
}

export function createInstantLocalSession(): InstantLocalSession {
  const user = makeLocalGuestUser();
  const save = loadLocalSave(user);
  persistLocalSave(save);
  return { user, save, source: "instant-local" };
}


export function calcStageClearStars(lives: number): number {
  if (lives >= 18) return 3;
  if (lives >= 10) return 2;
  return 1;
}

export function completeLocalStageClear(
  user: User,
  currentSave: PlayerSave,
  stageId: string,
  score: number,
  lives: number,
): PlayerSave {
  const safeStageId = /^stage_\d{3}$/.test(stageId) ? stageId : "stage_001";
  const previous = currentSave.clearedStages[safeStageId];
  const earnedStars = calcStageClearStars(lives);
  const previousBestStars = previous?.bestStars ?? 0;
  const additionalStars = Math.max(0, earnedStars - previousBestStars);
  const nextSave: PlayerSave = {
    ...currentSave,
    uid: currentSave.uid || user.uid,
    nickname: currentSave.nickname || makeGuestName(user),
    stars: clampInt(currentSave.stars + additionalStars, currentSave.stars, 0, 99999),
    clearedStages: {
      ...currentSave.clearedStages,
      [safeStageId]: {
        bestStars: Math.max(previousBestStars, earnedStars),
        bestScore: Math.max(previous?.bestScore ?? 0, clampInt(score, 0, 0, 9999999)),
        bestLives: Math.max(previous?.bestLives ?? 0, clampInt(lives, 0, 0, 99)),
        clearCount: clampInt((previous?.clearCount ?? 0) + 1, 1, 1, 9999),
        updatedAt: Date.now(),
      },
    },
    updatedAt: Date.now(),
  };
  persistLocalSave(nextSave);
  return loadLocalSave(user);
}

export function purchaseLocalPermanentUpgrade(
  user: User,
  save: PlayerSave,
  key: UpgradeKey,
): PlayerSave {
  const currentLevel = Number(save.upgrades[key] ?? 0);
  const cost = getUpgradeCost(key, currentLevel);
  if (cost === null) throw new Error("이미 최대 연구 레벨입니다.");
  if (save.stars < cost) throw new Error(`별이 부족합니다. 필요 별: ${cost}`);
  const nextSave: PlayerSave = {
    ...save,
    uid: save.uid || user.uid,
    stars: clampInt(save.stars - cost, save.stars, 0, 99999),
    upgrades: {
      ...save.upgrades,
      [key]: currentLevel + 1,
    },
    updatedAt: Date.now(),
  };
  persistLocalSave(nextSave);
  return loadLocalSave(user);
}

export function getUpgradeCost(
  key: UpgradeKey,
  currentLevel: number,
): number | null {
  const meta = UPGRADE_META[key];
  if (currentLevel >= meta.maxLevel) return null;
  return [1, 1, 2][currentLevel] ?? 3;
}
