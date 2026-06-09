import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported, type Analytics } from "firebase/analytics";
import {
  getAuth,
  onAuthStateChanged,
  signInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  GoogleAuthProvider,
  updateProfile,
  type User,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  type DocumentData,
} from "firebase/firestore";

const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env ?? {};

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || "AIzaSyD0DWQWMSmGqYMAkJSZULmFmjsk7x8HRxE",
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || "web-game2.firebaseapp.com",
  projectId: env.VITE_FIREBASE_PROJECT_ID || "web-game2",
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || "web-game2.firebasestorage.app",
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "91491483724",
  appId: env.VITE_FIREBASE_APP_ID || "1:91491483724:web:0a3e02dcc4c8badd76b4e9",
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID || "G-SPYS3QERB5",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

let analyticsPromise: Promise<Analytics | null> | null = null;

export function initAnalytics(): Promise<Analytics | null> {
  if (!analyticsPromise) {
    analyticsPromise = isSupported()
      .then((supported) => (supported ? getAnalytics(app) : null))
      .catch(() => null);
  }

  return analyticsPromise;
}

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

export type TowerUpgradeKey =
  | "archerDamage"
  | "mageDamage"
  | "barracksHp"
  | "artillerySplash";

export type UserSave = {
  uid: string;
  nickname: string;
  stars: number;
  clearedStages: Record<
    string,
    {
      bestStars: number;
      bestScore: number;
      bestLives?: number;
      bestClearTimeMs?: number;
      updatedAt?: unknown;
    }
  >;
  upgrades: Record<TowerUpgradeKey, number>;
  createdAt?: unknown;
  updatedAt?: unknown;
};

export type LeaderboardEntry = {
  uid: string;
  nickname: string;
  score: number;
  lives: number;
  wave: number;
  clearTimeMs: number;
  updatedAt?: unknown;
};

export type StageClearPayload = {
  stageId: string;
  starsEarned: number;
  score: number;
  lives: number;
  wave: number;
  clearTimeMs: number;
};

function guestNameFromUid(uid: string): string {
  return `Guest${uid.slice(0, 5).toUpperCase()}`;
}

function todayBoardId(stageId: string, date = new Date()): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}${mm}${dd}_${stageId}`;
}

function normalizeSave(uid: string, raw?: DocumentData): UserSave {
  return {
    uid,
    nickname: typeof raw?.nickname === "string" ? raw.nickname : guestNameFromUid(uid),
    stars: typeof raw?.stars === "number" ? raw.stars : 0,
    clearedStages: raw?.clearedStages && typeof raw.clearedStages === "object" ? raw.clearedStages : {},
    upgrades: {
      archerDamage: Number(raw?.upgrades?.archerDamage ?? 0),
      mageDamage: Number(raw?.upgrades?.mageDamage ?? 0),
      barracksHp: Number(raw?.upgrades?.barracksHp ?? 0),
      artillerySplash: Number(raw?.upgrades?.artillerySplash ?? 0),
    },
    createdAt: raw?.createdAt,
    updatedAt: raw?.updatedAt,
  };
}

export function waitForAuthReady(): Promise<User | null> {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
}

export async function ensureAnonymousUser(): Promise<User> {
  const current = auth.currentUser ?? (await waitForAuthReady());

  if (current) {
    return current;
  }

  const credential = await signInAnonymously(auth);
  return credential.user;
}

export async function registerWithEmail(
  email: string,
  password: string,
  nickname?: string,
): Promise<User> {
  const credential = await createUserWithEmailAndPassword(auth, email, password);

  if (nickname?.trim()) {
    await updateProfile(credential.user, { displayName: nickname.trim() });
  }

  await loadOrCreateSave(credential.user);
  return credential.user;
}

export async function loginWithEmail(email: string, password: string): Promise<User> {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  await loadOrCreateSave(credential.user);
  return credential.user;
}

export async function loginWithGoogle(): Promise<User | null> {
  try {
    const credential = await signInWithPopup(auth, googleProvider);
    await loadOrCreateSave(credential.user);
    return credential.user;
  } catch (error) {
    const code = (error as { code?: string }).code;

    if (
      code === "auth/popup-blocked" ||
      code === "auth/popup-closed-by-user" ||
      code === "auth/cancelled-popup-request" ||
      code === "auth/operation-not-supported-in-this-environment"
    ) {
      await signInWithRedirect(auth, googleProvider);
      return null;
    }

    throw error;
  }
}

export async function loadOrCreateSave(user: User): Promise<UserSave> {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    return normalizeSave(user.uid, snap.data());
  }

  const save: UserSave = {
    uid: user.uid,
    nickname: user.displayName || guestNameFromUid(user.uid),
    stars: 0,
    clearedStages: {},
    upgrades: {
      archerDamage: 0,
      mageDamage: 0,
      barracksHp: 0,
      artillerySplash: 0,
    },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(ref, save);
  return save;
}

export async function updateNickname(user: User, nickname: string): Promise<void> {
  const cleaned = nickname.trim().slice(0, 16);

  if (!cleaned) {
    throw new Error("닉네임을 입력하세요.");
  }

  await updateProfile(user, { displayName: cleaned });
  await setDoc(
    doc(db, "users", user.uid),
    {
      nickname: cleaned,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function saveStageClear(user: User, payload: StageClearPayload): Promise<UserSave> {
  const currentSave = await loadOrCreateSave(user);
  const previous = currentSave.clearedStages[payload.stageId];

  const bestScore = Math.max(previous?.bestScore ?? 0, payload.score);
  const bestStars = Math.max(previous?.bestStars ?? 0, payload.starsEarned);
  const earnedNewStars = Math.max(0, bestStars - (previous?.bestStars ?? 0));
  const nextStars = currentSave.stars + earnedNewStars;

  const nextSavePatch = {
    stars: nextStars,
    [`clearedStages.${payload.stageId}`]: {
      bestStars,
      bestScore,
      bestLives: Math.max(previous?.bestLives ?? 0, payload.lives),
      bestClearTimeMs: previous?.bestClearTimeMs
        ? Math.min(previous.bestClearTimeMs, payload.clearTimeMs)
        : payload.clearTimeMs,
      updatedAt: serverTimestamp(),
    },
    updatedAt: serverTimestamp(),
  };

  await updateDoc(doc(db, "users", user.uid), nextSavePatch);

  await submitLeaderboard(user, {
    stageId: payload.stageId,
    score: payload.score,
    lives: payload.lives,
    wave: payload.wave,
    clearTimeMs: payload.clearTimeMs,
  });

  return loadOrCreateSave(user);
}

export async function spendStarsForUpgrade(
  user: User,
  key: TowerUpgradeKey,
  cost: number,
): Promise<UserSave> {
  const save = await loadOrCreateSave(user);

  if (save.stars < cost) {
    throw new Error("별이 부족합니다.");
  }

  const currentLevel = save.upgrades[key] ?? 0;

  await updateDoc(doc(db, "users", user.uid), {
    stars: save.stars - cost,
    [`upgrades.${key}`]: currentLevel + 1,
    updatedAt: serverTimestamp(),
  });

  return loadOrCreateSave(user);
}

export async function submitLeaderboard(
  user: User,
  payload: {
    stageId: string;
    score: number;
    lives: number;
    wave: number;
    clearTimeMs: number;
  },
): Promise<void> {
  const boardId = todayBoardId(payload.stageId);
  const scoreRef = doc(db, "leaderboards", boardId, "scores", user.uid);
  const prev = await getDoc(scoreRef);
  const prevScore = prev.exists() ? Number(prev.data().score ?? 0) : 0;

  if (payload.score < prevScore) {
    return;
  }

  await setDoc(scoreRef, {
    uid: user.uid,
    nickname: user.displayName || guestNameFromUid(user.uid),
    score: payload.score,
    lives: payload.lives,
    wave: payload.wave,
    clearTimeMs: payload.clearTimeMs,
    updatedAt: serverTimestamp(),
  });
}

export async function fetchLeaderboard(
  stageId: string,
  maxResults = 20,
): Promise<LeaderboardEntry[]> {
  const boardId = todayBoardId(stageId);
  const scoresRef = collection(db, "leaderboards", boardId, "scores");
  const q = query(scoresRef, orderBy("score", "desc"), limit(maxResults));
  const snap = await getDocs(q);

  return snap.docs.map((scoreDoc) => {
    const data = scoreDoc.data();

    return {
      uid: String(data.uid ?? scoreDoc.id),
      nickname: String(data.nickname ?? "Guest"),
      score: Number(data.score ?? 0),
      lives: Number(data.lives ?? 0),
      wave: Number(data.wave ?? 0),
      clearTimeMs: Number(data.clearTimeMs ?? 0),
      updatedAt: data.updatedAt,
    };
  });
}
