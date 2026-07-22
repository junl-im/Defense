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

const enabled = Boolean(config.apiKey && config.projectId && config.appId);
let contextPromise = null;

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
  const { db, firestore } = context;
  await firestore.addDoc(firestore.collection(db, 'dokkaebiScores'), {
    name: String(entry.name || '수호자').slice(0, 12),
    score: Math.max(0, Number(entry.score) || 0),
    wave: Math.max(0, Number(entry.wave) || 0),
    kills: Math.max(0, Number(entry.kills) || 0),
    maxRank: Math.max(1, Math.min(5, Number(entry.maxRank) || 1)),
    version: '4.1.0',
    createdAt: firestore.serverTimestamp()
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
