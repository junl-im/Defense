import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const removePatterns = [
  /^README-v\d/i,
  /^README-v\d.*\.md$/i,
];

const docsRemovePatterns = [
  /_V\d+\.md$/i,
  /^asset-manifest-v\d+\.json$/i,
  /^VISUAL_DIRECTION_V\d+\.md$/i,
  /^VISUAL_INTEGRATION_V\d+\.md$/i,
  /^INGAME_PREMIUM_UI_V\d+\.md$/i,
  /^COMPACT_LOGIN_VISUAL_V\d+\.md$/i,
];

let removed = 0;
for (const entry of fs.readdirSync(root)) {
  if (removePatterns.some((pattern) => pattern.test(entry))) {
    fs.rmSync(path.join(root, entry), { force: true, recursive: true });
    removed += 1;
  }
}

const docs = path.join(root, 'docs');
if (fs.existsSync(docs)) {
  for (const entry of fs.readdirSync(docs)) {
    if (docsRemovePatterns.some((pattern) => pattern.test(entry))) {
      fs.rmSync(path.join(docs, entry), { force: true, recursive: true });
      removed += 1;
    }
  }
}

console.log(`Cleaned ${removed} old versioned patch files.`);
