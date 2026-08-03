const config = {
  apiKey: import.meta.env?.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env?.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env?.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env?.VITE_FIREBASE_MEASUREMENT_ID
};

const FIREBASE_VERSION = '12.16.0';
const FIREBASE_CDN_BASE = `https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}`;
export const ONLINE_SCORE_SCHEMA_VERSION = '5.1.0';

const enabled = Boolean(config.apiKey && config.projectId && config.appId);
let contextPromise = null;

const boundedInteger = (value, minimum, maximum, fallback = minimum) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(maximum, Math.max(minimum, Math.round(number)));
};

export function sanitizeOnlineScoreEntry(entry = {}) {
  const name = String(entry.name || '수호자').trim().slice(0, 12) || '수호자';
  return Object.freeze({
    name,
    score: boundedInteger(entry.score, 0, 99999999, 0),
    wave: boundedInteger(entry.wave, 0, 100, 0),
    kills: boundedInteger(entry.kills, 0, 100000, 0),
    maxRank: boundedInteger(entry.maxRank, 1, 5, 1),
    version: ONLINE_SCORE_SCHEMA_VERSION
  });
}

export function shouldPromoteOnlineScore(current, candidate) {
  if (!current || typeof current !== 'object') return true;
  return Number(candidate?.score || 0) > Number(current.score || 0);
}

async function getContext() {
  if (!enabled) return null;
  if (!contextPromise) {
    contextPromise = Promise.all([
      import(/* @vite-ignore */ `${FIREBASE_CDN_BASE}/firebase-app.js`),
      import(/* @vite-ignore */ `${FIREBASE_CDN_BASE}/firebase-auth.js`),
      import(/* @vite-ignore */ `${FIREBASE_CDN_BASE}/firebase-firestore.js`)
    ]).then(async ([appModule, authModule, firestoreModule]) => {
      const app = appModule.initializeApp(config);
      const auth = authModule.getAuth(app);
      await authModule.signInAnonymously(auth);
      return {
        auth,
        db: firestoreModule.getFirestore(app),
        firestore: firestoreModule
      };
    }).catch((error) => {
      contextPromise = null;
      console.warn('Firebase initialization failed:', error.message);
      return null;
    });
  }
  return contextPromise;
}

export function isFirebaseEnabled() {
  return enabled;
}

export async function submitOnlineScore(entry) {
  const context = await getContext();
  if (!context) return false;
  const { auth, db, firestore } = context;
  const uid = auth.currentUser?.uid;
  if (!uid) return false;
  const candidate = sanitizeOnlineScoreEntry(entry);
  const scoreRef = firestore.doc(db, 'dokkaebiScores', uid);
  await firestore.runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(scoreRef);
    const current = snapshot.exists() ? snapshot.data() : null;
    if (!shouldPromoteOnlineScore(current, candidate)) return;
    transaction.set(scoreRef, {
      uid,
      ...candidate,
      createdAt: current?.createdAt || firestore.serverTimestamp(),
      updatedAt: firestore.serverTimestamp()
    });
  });
  return true;
}

export async function loadOnlineScores() {
  const context = await getContext();
  if (!context) return [];
  const { db, firestore } = context;
  const scoresQuery = firestore.query(
    firestore.collection(db, 'dokkaebiScores'),
    firestore.orderBy('score', 'desc'),
    firestore.limit(10)
  );
  const snapshot = await firestore.getDocs(scoresQuery);
  return snapshot.docs.map((doc) => doc.data());
}
