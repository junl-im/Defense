import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported as analyticsIsSupported } from 'firebase/analytics';
import {
  getAuth,
  signInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
  type User
} from 'firebase/auth';
import {
  doc,
  getDoc,
  getFirestore,
  limit,
  orderBy,
  query,
  collection,
  serverTimestamp,
  setDoc,
  getDocs
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analyticsPromise = analyticsIsSupported()
  .then((supported) => supported ? getAnalytics(app) : null)
  .catch(() => null);

export type PlayerSave = {
  nickname: string;
  stars: number;
  clearedStages: Record<string, { bestStars: number; bestScore: number }>;
  upgrades: Record<string, number>;
};

export type LeaderboardScore = {
  uid: string;
  nickname: string;
  score: number;
  stageId: string;
  lives: number;
  wave: number;
  clearTimeMs: number;
};

export function waitForUser(): Promise<User | null> {
  return new Promise((resolve) => {
    const unsub = onAuthStateChanged(auth, (user) => {
      unsub();
      resolve(user);
    });
  });
}

export async function completePendingRedirectSignIn(): Promise<User | null> {
  const result = await getRedirectResult(auth).catch(() => null);
  return result?.user ?? null;
}

export async function ensureAnonymousUser(): Promise<User> {
  const existing = await waitForUser();
  if (existing) return existing;
  const result = await signInAnonymously(auth);
  return result.user;
}

export async function loginWithEmail(email: string, password: string): Promise<User> {
  const result = await signInWithEmailAndPassword(auth, email.trim(), password);
  return result.user;
}

export async function registerWithEmail(email: string, password: string): Promise<User> {
  const result = await createUserWithEmailAndPassword(auth, email.trim(), password);
  return result.user;
}

export async function loginWithGoogle(): Promise<User | null> {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch {
    await signInWithRedirect(auth, provider);
    return null;
  }
}

export async function logout(): Promise<void> {
  await signOut(auth);
}

export function guestNickname(uid: string): string {
  return `Seed${uid.slice(0, 4).toUpperCase()}`;
}

export async function loadOrCreateSave(user: User): Promise<PlayerSave> {
  const ref = doc(db, 'users', user.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return snap.data() as PlayerSave;

  const save: PlayerSave = {
    nickname: user.displayName && user.displayName.trim().length >= 2 ? user.displayName.trim().slice(0, 16) : guestNickname(user.uid),
    stars: 0,
    clearedStages: {},
    upgrades: {
      archerDamage: 0,
      mageDamage: 0,
      barracksHp: 0,
      artillerySplash: 0
    }
  };

  await setDoc(ref, {
    ...save,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return save;
}

export async function updatePlayerSave(user: User, save: PlayerSave): Promise<void> {
  await setDoc(doc(db, 'users', user.uid), {
    ...save,
    updatedAt: serverTimestamp()
  }, { merge: true });
}

export async function saveStageClear(
  user: User,
  previous: PlayerSave,
  stageId: string,
  score: number,
  lives: number
): Promise<PlayerSave> {
  const oldStage = previous.clearedStages[stageId];
  const bestScore = Math.max(oldStage?.bestScore ?? 0, score);
  const earnedStars = lives >= 18 ? 3 : lives >= 10 ? 2 : 1;
  const bestStars = Math.max(oldStage?.bestStars ?? 0, earnedStars);
  const extraStars = Math.max(0, bestStars - (oldStage?.bestStars ?? 0));

  const next: PlayerSave = {
    ...previous,
    stars: Math.min(9999, previous.stars + extraStars),
    clearedStages: {
      ...previous.clearedStages,
      [stageId]: { bestStars, bestScore }
    }
  };

  await updatePlayerSave(user, next);
  return next;
}

export function dailyBoardId(stageId: string, now = new Date()): string {
  const y = now.getUTCFullYear();
  const m = `${now.getUTCMonth() + 1}`.padStart(2, '0');
  const d = `${now.getUTCDate()}`.padStart(2, '0');
  return `${y}${m}${d}_${stageId}`;
}

export async function submitLeaderboard(
  user: User,
  nickname: string,
  score: LeaderboardScore
): Promise<void> {
  const boardId = dailyBoardId(score.stageId);
  await setDoc(doc(db, 'leaderboards', boardId, 'scores', user.uid), {
    ...score,
    uid: user.uid,
    nickname,
    updatedAt: serverTimestamp()
  }, { merge: true });
}

export async function fetchLeaderboard(stageId: string): Promise<LeaderboardScore[]> {
  const boardId = dailyBoardId(stageId);
  const q = query(
    collection(db, 'leaderboards', boardId, 'scores'),
    orderBy('score', 'desc'),
    limit(20)
  );
  const snaps = await getDocs(q);
  return snaps.docs.map((x) => x.data() as LeaderboardScore);
}
