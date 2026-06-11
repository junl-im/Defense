import { initializeApp } from "firebase/app";
import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  getAuth,
  getRedirectResult,
  GoogleAuthProvider,
  onAuthStateChanged,
  setPersistence,
  signInAnonymously,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  type User,
} from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  type DocumentData,
} from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey:
    import.meta.env.VITE_FIREBASE_API_KEY ||
    "AIzaSyD0DWQWMSmGqYMAkJSZULmFmjsk7x8HRxE",
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "web-game2.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "web-game2",
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
    "web-game2.firebasestorage.app",
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "91491483724",
  appId:
    import.meta.env.VITE_FIREBASE_APP_ID ||
    "1:91491483724:web:0a3e02dcc4c8badd76b4e9",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-SPYS3QERB5",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

void setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.warn("Firebase auth persistence failed:", error);
});

void isSupported()
  .then((supported) => {
    if (supported && firebaseConfig.measurementId) {
      getAnalytics(app);
    }
  })
  .catch(() => {
    // Analytics is optional. Ignore unsupported browser/runtime errors.
  });

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

export type LeaderboardScore = {
  uid?: string;
  nickname: string;
  score: number;
  lives: number;
  wave: number;
  clearTimeMs: number;
  stageId?: string;
  updatedAt?: unknown;
};

const defaultUpgrades: PlayerSave["upgrades"] = {
  archerDamage: 0,
  mageDamage: 0,
  barracksHp: 0,
  artillerySplash: 0,
};

type LocalSaveSnapshot = Omit<PlayerSave, "uid"> & { uid?: string };

type QuickStartSource = "remote" | "local-timeout" | "local-error";

const LOCAL_GUEST_UID_KEY = "kingdom-seed:local-guest-uid";
const LOCAL_SAVE_PREFIX = "kingdom-seed:local-save:";
const QUICK_START_TIMEOUT_MS = 650;

function canUseLocalStorage(): boolean {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function localSaveKey(uid: string): string {
  return `${LOCAL_SAVE_PREFIX}${uid}`;
}

function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  fallback: () => T | Promise<T>,
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return new Promise<T>((resolve) => {
    let settled = false;
    const finish = (value: T | Promise<T>): void => {
      if (settled) return;
      settled = true;
      if (timer !== undefined) clearTimeout(timer);
      void Promise.resolve(value).then(resolve);
    };
    timer = setTimeout(() => finish(fallback()), Math.max(1, timeoutMs));
    promise.then(finish).catch(() => finish(fallback()));
  });
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
    // Local persistence is a speed/fallback layer. Ignore quota/private-mode errors.
  }
}

function getOrCreateLocalGuestUid(): string {
  if (canUseLocalStorage()) {
    const existing = window.localStorage.getItem(LOCAL_GUEST_UID_KEY);
    if (existing) return existing;
  }
  const random = Math.random().toString(36).slice(2, 10);
  const uid = `local_guest_${Date.now().toString(36)}_${random}`;
  if (canUseLocalStorage())
    window.localStorage.setItem(LOCAL_GUEST_UID_KEY, uid);
  return uid;
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

export async function ensureQuickStartSession(
  timeoutMs = QUICK_START_TIMEOUT_MS,
): Promise<{ user: User; save: PlayerSave; source: QuickStartSource }> {
  const fallback = (
    source: QuickStartSource,
  ): { user: User; save: PlayerSave; source: QuickStartSource } => {
    const user = makeLocalGuestUser();
    return { user, save: loadLocalSave(user), source };
  };

  return withTimeout(
    (async () => {
      const user = await ensureAnonymousUser();
      const save = await loadOrCreateSave(user, {
        timeoutMs,
        allowLocalFallback: true,
      });
      return { user, save, source: "remote" as const };
    })(),
    timeoutMs,
    () => fallback("local-timeout"),
  ).catch(() => fallback("local-error"));
}

export type UpgradeKey = keyof PlayerSave["upgrades"];

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

export function getUpgradeCost(
  key: UpgradeKey,
  currentLevel: number,
): number | null {
  const meta = UPGRADE_META[key];
  if (currentLevel >= meta.maxLevel) return null;
  return [1, 1, 2][currentLevel] ?? 3;
}

export async function purchasePermanentUpgrade(
  user: User,
  save: PlayerSave,
  key: UpgradeKey,
): Promise<PlayerSave> {
  const currentLevel = Number(save.upgrades[key] ?? 0);
  const cost = getUpgradeCost(key, currentLevel);
  if (cost === null) throw new Error("이미 최대 연구 레벨입니다.");
  if (save.stars < cost) throw new Error(`별이 부족합니다. 필요 별: ${cost}`);

  const nextSave: PlayerSave = {
    ...save,
    stars: save.stars - cost,
    upgrades: {
      ...save.upgrades,
      [key]: currentLevel + 1,
    },
    updatedAt: serverTimestamp(),
  };

  persistLocalSave(nextSave);
  if (isLocalGuestUser(user)) return nextSave;

  try {
    await setDoc(
      doc(db, "users", user.uid),
      {
        nickname: nextSave.nickname,
        stars: nextSave.stars,
        clearedStages: nextSave.clearedStages,
        upgrades: nextSave.upgrades,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
  } catch (error) {
    console.warn("Upgrade cloud save failed; kept local save:", error);
  }

  return nextSave;
}

function makeGuestName(user: User): string {
  return `Guest${user.uid.slice(0, 5).toUpperCase()}`;
}

function normalizeSave(user: User, data?: DocumentData): PlayerSave {
  return {
    uid: user.uid,
    nickname:
      typeof data?.nickname === "string" && data.nickname.trim().length > 0
        ? data.nickname
        : user.displayName || makeGuestName(user),
    stars: typeof data?.stars === "number" ? data.stars : 0,
    clearedStages:
      data?.clearedStages && typeof data.clearedStages === "object"
        ? (data.clearedStages as Record<string, ClearedStage>)
        : {},
    upgrades: {
      ...defaultUpgrades,
      ...(data?.upgrades && typeof data.upgrades === "object"
        ? data.upgrades
        : {}),
    },
    createdAt: data?.createdAt,
    updatedAt: data?.updatedAt,
  };
}

export async function completePendingRedirectSignIn(
  timeoutMs = 900,
): Promise<User | null> {
  try {
    const result = await withTimeout(
      getRedirectResult(auth),
      timeoutMs,
      () => null,
    );
    return result?.user ?? auth.currentUser;
  } catch (error) {
    console.warn("Google redirect sign-in failed:", error);
    return auth.currentUser;
  }
}

export async function waitForUser(timeoutMs = 900): Promise<User | null> {
  if (auth.currentUser) return auth.currentUser;

  return withTimeout(
    new Promise<User | null>((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe();
        resolve(user);
      });
    }),
    timeoutMs,
    () => null,
  );
}

export async function ensureAnonymousUser(): Promise<User> {
  if (auth.currentUser) return auth.currentUser;
  const credential = await signInAnonymously(auth);
  return credential.user;
}

export async function loginWithEmail(
  email: string,
  password: string,
): Promise<User> {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export async function registerWithEmail(
  email: string,
  password: string,
): Promise<User> {
  const credential = await createUserWithEmailAndPassword(
    auth,
    email,
    password,
  );
  return credential.user;
}

export async function loginWithGoogle(): Promise<User | null> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });

  try {
    const credential = await signInWithPopup(auth, provider);
    return credential.user;
  } catch (error) {
    console.warn("Google popup failed. Falling back to redirect:", error);
    await signInWithRedirect(auth, provider);
    return null;
  }
}

export async function loadOrCreateSave(
  user: User,
  options: { timeoutMs?: number; allowLocalFallback?: boolean } = {},
): Promise<PlayerSave> {
  if (isLocalGuestUser(user)) return loadLocalSave(user);

  const fallbackSave = (): PlayerSave => {
    const save = loadLocalSave(user);
    persistLocalSave(save);
    return save;
  };

  try {
    const ref = doc(db, "users", user.uid);
    const readDoc = getDoc(ref);
    const snap = options.timeoutMs
      ? await withTimeout(readDoc, options.timeoutMs, () => null)
      : await readDoc;

    if (!snap) {
      if (options.allowLocalFallback) return fallbackSave();
      return fallbackSave();
    }

    if (snap.exists()) {
      const save = normalizeSave(user, snap.data());
      persistLocalSave(save);
      // Do not block the first menu transition on a harmless last-seen update.
      void setDoc(
        ref,
        {
          nickname: save.nickname,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      ).catch((error) => console.warn("Deferred save touch failed:", error));
      return save;
    }

    const save = normalizeSave(user);
    persistLocalSave(save);
    // Creating the first cloud save is now deferred so quick-start never waits on a slow network.
    void setDoc(ref, {
      nickname: save.nickname,
      stars: save.stars,
      clearedStages: save.clearedStages,
      upgrades: save.upgrades,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }).catch((error) => console.warn("Deferred save create failed:", error));

    return save;
  } catch (error) {
    console.warn("Cloud save load failed; using local fast-start save:", error);
    return fallbackSave();
  }
}

function calcStars(lives: number): number {
  if (lives >= 18) return 3;
  if (lives >= 10) return 2;
  return 1;
}

export async function saveStageClear(
  user: User,
  saveOrStageId: PlayerSave | string,
  stageIdOrScore?: string | number,
  scoreOrLives?: number,
  livesArg?: number,
): Promise<PlayerSave> {
  const currentSave =
    typeof saveOrStageId === "string"
      ? await loadOrCreateSave(user)
      : saveOrStageId;

  const stageId =
    typeof saveOrStageId === "string"
      ? saveOrStageId
      : typeof stageIdOrScore === "string"
        ? stageIdOrScore
        : "stage_001";

  const score =
    typeof saveOrStageId === "string"
      ? typeof stageIdOrScore === "number"
        ? stageIdOrScore
        : 0
      : typeof scoreOrLives === "number"
        ? scoreOrLives
        : 0;

  const lives =
    typeof saveOrStageId === "string"
      ? typeof scoreOrLives === "number"
        ? scoreOrLives
        : 0
      : typeof livesArg === "number"
        ? livesArg
        : 0;

  const previous = currentSave.clearedStages[stageId];
  const earnedStars = calcStars(lives);
  const previousBestStars = previous?.bestStars ?? 0;
  const additionalStars = Math.max(0, earnedStars - previousBestStars);

  const updatedStage: ClearedStage = {
    bestStars: Math.max(previousBestStars, earnedStars),
    bestScore: Math.max(previous?.bestScore ?? 0, score),
    bestLives: Math.max(previous?.bestLives ?? 0, lives),
    clearCount: (previous?.clearCount ?? 0) + 1,
    updatedAt: serverTimestamp(),
  };

  const updatedSave: PlayerSave = {
    ...currentSave,
    stars: currentSave.stars + additionalStars,
    clearedStages: {
      ...currentSave.clearedStages,
      [stageId]: updatedStage,
    },
    updatedAt: serverTimestamp(),
  };

  persistLocalSave(updatedSave);
  if (isLocalGuestUser(user)) return updatedSave;

  try {
    await setDoc(
      doc(db, "users", user.uid),
      {
        nickname: updatedSave.nickname,
        stars: updatedSave.stars,
        clearedStages: updatedSave.clearedStages,
        upgrades: updatedSave.upgrades,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
  } catch (error) {
    console.warn("Stage clear cloud save failed; kept local save:", error);
  }

  return updatedSave;
}

function todayBoardId(stageId = "stage_001"): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = `${now.getMonth() + 1}`.padStart(2, "0");
  const dd = `${now.getDate()}`.padStart(2, "0");
  return `${yyyy}${mm}${dd}_${stageId}`;
}

export async function submitLeaderboard(
  user: User,
  nicknameOrScoreData: string | Partial<LeaderboardScore>,
  maybeScoreData?: Partial<LeaderboardScore>,
): Promise<void> {
  if (isLocalGuestUser(user)) return;
  const nickname =
    typeof nicknameOrScoreData === "string"
      ? nicknameOrScoreData
      : user.displayName || makeGuestName(user);

  const scoreData =
    typeof nicknameOrScoreData === "string"
      ? (maybeScoreData ?? {})
      : nicknameOrScoreData;

  const stageId = scoreData.stageId ?? "stage_001";
  const boardId = todayBoardId(stageId);
  const ref = doc(db, "leaderboards", boardId, "scores", user.uid);

  const nextScore: LeaderboardScore = {
    uid: user.uid,
    nickname,
    score: Number(scoreData.score ?? 0),
    lives: Number(scoreData.lives ?? 0),
    wave: Number(scoreData.wave ?? 0),
    clearTimeMs: Number(scoreData.clearTimeMs ?? 0),
    stageId,
    updatedAt: serverTimestamp(),
  };

  try {
    const current = await getDoc(ref);
    if (current.exists()) {
      const prevScore = Number(current.data().score ?? 0);
      if (prevScore > nextScore.score) {
        return;
      }
    }

    await setDoc(ref, nextScore, { merge: true });
  } catch (error) {
    console.warn("Leaderboard submit skipped while offline/slow:", error);
  }
}

export async function fetchLeaderboard(
  stageId = "stage_001",
  maxResults = 20,
): Promise<LeaderboardScore[]> {
  const boardId = todayBoardId(stageId);
  const q = query(
    collection(db, "leaderboards", boardId, "scores"),
    orderBy("score", "desc"),
    limit(maxResults),
  );

  let snap;
  try {
    snap = await getDocs(q);
  } catch (error) {
    console.warn("Leaderboard fetch skipped while offline/slow:", error);
    return [];
  }
  return snap.docs.map((item) => {
    const data = item.data();
    return {
      uid: item.id,
      nickname:
        typeof data.nickname === "string"
          ? data.nickname
          : `Guest${item.id.slice(0, 5)}`,
      score: Number(data.score ?? 0),
      lives: Number(data.lives ?? 0),
      wave: Number(data.wave ?? 0),
      clearTimeMs: Number(data.clearTimeMs ?? 0),
      stageId: typeof data.stageId === "string" ? data.stageId : stageId,
      updatedAt: data.updatedAt,
    };
  });
}
