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
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ||
    "web-game2.firebaseapp.com",
  projectId:
    import.meta.env.VITE_FIREBASE_PROJECT_ID ||
    "web-game2",
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
    "web-game2.firebasestorage.app",
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ||
    "91491483724",
  appId:
    import.meta.env.VITE_FIREBASE_APP_ID ||
    "1:91491483724:web:0a3e02dcc4c8badd76b4e9",
  measurementId:
    import.meta.env.VITE_FIREBASE_MEASUREMENT_ID ||
    "G-SPYS3QERB5",
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



export type UpgradeKey = keyof PlayerSave["upgrades"];

export const UPGRADE_META: Record<UpgradeKey, { label: string; description: string; maxLevel: number }> = {
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

export function getUpgradeCost(key: UpgradeKey, currentLevel: number): number | null {
  const meta = UPGRADE_META[key];
  if (currentLevel >= meta.maxLevel) return null;
  return [1, 1, 2][currentLevel] ?? 3;
}

export async function purchasePermanentUpgrade(
  user: User,
  save: PlayerSave,
  key: UpgradeKey
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

  await setDoc(
    doc(db, "users", user.uid),
    {
      nickname: nextSave.nickname,
      stars: nextSave.stars,
      clearedStages: nextSave.clearedStages,
      upgrades: nextSave.upgrades,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

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

export async function completePendingRedirectSignIn(): Promise<User | null> {
  try {
    const result = await getRedirectResult(auth);
    return result?.user ?? auth.currentUser;
  } catch (error) {
    console.warn("Google redirect sign-in failed:", error);
    return auth.currentUser;
  }
}

export async function waitForUser(): Promise<User | null> {
  if (auth.currentUser) return auth.currentUser;

  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
}

export async function ensureAnonymousUser(): Promise<User> {
  if (auth.currentUser) return auth.currentUser;
  const credential = await signInAnonymously(auth);
  return credential.user;
}

export async function loginWithEmail(
  email: string,
  password: string
): Promise<User> {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export async function registerWithEmail(
  email: string,
  password: string
): Promise<User> {
  const credential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
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

export async function loadOrCreateSave(user: User): Promise<PlayerSave> {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    const save = normalizeSave(user, snap.data());
    await setDoc(
      ref,
      {
        nickname: save.nickname,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    return save;
  }

  const save = normalizeSave(user);
  await setDoc(ref, {
    nickname: save.nickname,
    stars: save.stars,
    clearedStages: save.clearedStages,
    upgrades: save.upgrades,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return save;
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
  livesArg?: number
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

  await setDoc(
    doc(db, "users", user.uid),
    {
      nickname: updatedSave.nickname,
      stars: updatedSave.stars,
      clearedStages: updatedSave.clearedStages,
      upgrades: updatedSave.upgrades,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

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
  maybeScoreData?: Partial<LeaderboardScore>
): Promise<void> {
  const nickname =
    typeof nicknameOrScoreData === "string"
      ? nicknameOrScoreData
      : user.displayName || makeGuestName(user);

  const scoreData =
    typeof nicknameOrScoreData === "string"
      ? maybeScoreData ?? {}
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

  const current = await getDoc(ref);
  if (current.exists()) {
    const prevScore = Number(current.data().score ?? 0);
    if (prevScore > nextScore.score) {
      return;
    }
  }

  await setDoc(ref, nextScore, { merge: true });
}

export async function fetchLeaderboard(
  stageId = "stage_001",
  maxResults = 20
): Promise<LeaderboardScore[]> {
  const boardId = todayBoardId(stageId);
  const q = query(
    collection(db, "leaderboards", boardId, "scores"),
    orderBy("score", "desc"),
    limit(maxResults)
  );

  const snap = await getDocs(q);
  return snap.docs.map((item) => {
    const data = item.data();
    return {
      uid: item.id,
      nickname:
        typeof data.nickname === "string" ? data.nickname : `Guest${item.id.slice(0, 5)}`,
      score: Number(data.score ?? 0),
      lives: Number(data.lives ?? 0),
      wave: Number(data.wave ?? 0),
      clearTimeMs: Number(data.clearTimeMs ?? 0),
      stageId: typeof data.stageId === "string" ? data.stageId : stageId,
      updatedAt: data.updatedAt,
    };
  });
}
