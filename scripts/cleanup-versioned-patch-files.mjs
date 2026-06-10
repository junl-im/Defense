import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const patterns = [
  /^README-v\d+(?:\.\d+)*.*\.md$/i,
  /^kingdom-seed-v\d+(?:\.\d+)*.*\.md$/i,
];
const docPatterns = [
  /_V\d+(?:_\d+)?\.md$/i,
  /-v\d+(?:\.\d+)*.*\.md$/i,
  /^asset-manifest-v\d+(?:\.\d+)*\.json$/i,
];

function removeIfMatches(dir, matchers) {
  if (!fs.existsSync(dir)) return 0;
  let count = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) continue;
    if (matchers.some((p) => p.test(entry.name))) {
      fs.rmSync(full, { force: true });
      count += 1;
      console.log('removed', path.relative(root, full));
    }
  }
  return count;
}

let removed = 0;
removed += removeIfMatches(root, patterns);
removed += removeIfMatches(path.join(root, 'docs'), docPatterns);
console.log(`cleanup complete: ${removed} old versioned patch files removed`);
