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
    const existing = window.localStorage.getItem(LOCAL_GUEST_UID_KEY);
    if (existing) return existing;
  }
  const random = Math.random().toString(36).slice(2, 10);
  const uid = `local_guest_${Date.now().toString(36)}_${random}`;
  if (canUseLocalStorage()) window.localStorage.setItem(LOCAL_GUEST_UID_KEY, uid);
  return uid;
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
        ? data.nickname
        : makeGuestName(user),
    stars: typeof data?.stars === "number" ? data.stars : 0,
    clearedStages:
      data?.clearedStages && typeof data.clearedStages === "object"
        ? (data.clearedStages as Record<string, ClearedStage>)
        : {},
    upgrades: {
      ...defaultUpgrades,
      ...(data?.upgrades && typeof data.upgrades === "object"
        ? (data.upgrades as Partial<PlayerSave["upgrades"]>)
        : {}),
    },
    createdAt: data?.createdAt,
    updatedAt: data?.updatedAt,
  };
}

export function loadLocalSave(user: User): PlayerSave {
  const stored = readJson<LocalSaveSnapshot>(localSaveKey(user.uid));
  return normalizeSave(user, stored);
}

export function persistLocalSave(save: PlayerSave): void {
  writeJson(localSaveKey(save.uid), {
    uid: save.uid,
    nickname: save.nickname,
    stars: save.stars,
    clearedStages: save.clearedStages,
    upgrades: save.upgrades,
    createdAt: save.createdAt ?? Date.now(),
    updatedAt: Date.now(),
  });
}

export function createInstantLocalSession(): InstantLocalSession {
  const user = makeLocalGuestUser();
  const save = loadLocalSave(user);
  persistLocalSave(save);
  return { user, save, source: "instant-local" };
}

export function getUpgradeCost(
  key: UpgradeKey,
  currentLevel: number,
): number | null {
  const meta = UPGRADE_META[key];
  if (currentLevel >= meta.maxLevel) return null;
  return [1, 1, 2][currentLevel] ?? 3;
}
