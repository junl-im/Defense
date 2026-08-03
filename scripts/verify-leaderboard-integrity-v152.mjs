import fs from 'node:fs';
import path from 'node:path';
import {
  ONLINE_SCORE_SCHEMA_VERSION,
  sanitizeOnlineScoreEntry,
  shouldPromoteOnlineScore
} from '../src/firebase.js';

const root = path.resolve(import.meta.dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const failures = [];
const check = (value, label) => { if (!value) failures.push(label); };

const hostile = sanitizeOnlineScoreEntry({
  name: '   <img src=x onerror=1>   ',
  score: Number.POSITIVE_INFINITY,
  wave: 999,
  kills: -50,
  maxRank: 99
});
check(hostile.name.length <= 12 && hostile.name.length > 0, 'nickname bounded to 1..12 characters');
check(hostile.score === 0, 'non-finite score normalized to zero');
check(hostile.wave === 100, 'wave clamped to Firestore rule maximum');
check(hostile.kills === 0, 'kills clamped to zero minimum');
check(hostile.maxRank === 5, 'rank clamped to maximum five');
check(hostile.version === ONLINE_SCORE_SCHEMA_VERSION, 'score schema version synchronized');
check(shouldPromoteOnlineScore(null, { score: 1 }), 'first score is accepted');
check(shouldPromoteOnlineScore({ score: 100 }, { score: 101 }), 'higher score is promoted');
check(!shouldPromoteOnlineScore({ score: 100 }, { score: 100 }), 'equal score does not rewrite document');
check(!shouldPromoteOnlineScore({ score: 100 }, { score: 99 }), 'lower score cannot replace best score');

const firebase = read('src/firebase.js');
const rules = read('firestore.rules');
check(!firebase.includes('firestore.addDoc('), 'unbounded addDoc score creation removed');
check(firebase.includes("firestore.doc(db, 'dokkaebiScores', uid)"), 'score document is bound to anonymous auth UID');
check(firebase.includes('firestore.runTransaction'), 'best-score update uses a transaction');
check(firebase.includes('current?.createdAt || firestore.serverTimestamp()'), 'created timestamp preserved after first write');
check(rules.includes('scoreId == request.auth.uid'), 'rules bind score document ID to auth UID');
check(rules.includes("'uid', 'name', 'score', 'wave', 'kills', 'maxRank', 'version', 'createdAt', 'updatedAt'"), 'rules enforce exact score schema');
check(rules.includes('request.resource.data.score >= resource.data.score'), 'rules reject best-score rollback');
check(rules.includes('request.resource.data.updatedAt == request.time'), 'rules require server timestamp on updates');
check(rules.includes('allow delete: if false;'), 'score deletion remains disabled');

if (failures.length) {
  console.error(`FAIL v1.0.52 R8 leaderboard integrity (${failures.length})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log('PASS v1.0.52 R8 leaderboard integrity: UID-bound single best score, bounded schema, monotonic transaction, and rules contract');
