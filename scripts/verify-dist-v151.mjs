import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
const root = path.resolve(import.meta.dirname, '..');
const dist = process.env.DIST_DIR ? path.resolve(process.env.DIST_DIR) : path.join(root, 'dist');
const reportDir = path.join(root, 'logs/qa/v151');
const versionPath = path.join(dist, 'version.json');
if (!fs.existsSync(versionPath)) throw new Error('v151 dist/version.json missing');
const version = JSON.parse(fs.readFileSync(versionPath, 'utf8'));
const parsedPatch = Number(String(version.releaseVersion || '').split('.')[2]);
const expectedBuildId = `b24.${parsedPatch}`;
if (!Number.isInteger(parsedPatch) || parsedPatch < 51 || version.buildId !== expectedBuildId || version.cacheRevision !== `${version.releaseVersion}-${version.buildId}`) throw new Error('v1.0.51+ dist identity mismatch');
for (const required of ['index.html', 'assets/game.js', 'assets/game.css', 'sw.js', 'release-identity.generated.js']) if (!fs.existsSync(path.join(dist, required))) throw new Error(`v151 complete Vite dist missing: ${required}`);
if (fs.existsSync(path.join(dist, 'src')) || fs.existsSync(path.join(dist, 'STATIC_BUILD_NOTICE.txt'))) throw new Error('v151 requires bundled Vite output, not static fallback');
const gameJs = fs.readFileSync(path.join(dist, 'assets/game.js'), 'utf8');
for (const marker of [
  'DD-MODERN-CHARACTER-PRESENTATION-V151',
  'DD-CHARACTER-MATERIAL-ENHANCER-V151',
  'characterContactShadowV151',
  'characterDepthSilhouetteV151',
  'characterKeyLightV151',
  'characterMotionAfterimageV151',
  'DD-ATOMIC-SAVE-SNAPSHOT-V150'
]) if (!gameJs.includes(marker)) throw new Error(`v151 bundled runtime marker missing: ${marker}`);
if (/<svg\b|image\/svg\+xml/i.test(gameJs)) throw new Error('v151 character runtime introduced SVG surface');
const files = [];
const sha = (data) => createHash('sha256').update(data).digest('hex');
function walk(directory, relative = '') {
  for (const name of fs.readdirSync(directory).sort()) {
    const absolute = path.join(directory, name);
    const rel = relative ? `${relative}/${name}` : name;
    const stat = fs.statSync(absolute);
    if (stat.isDirectory()) walk(absolute, rel);
    else if (stat.isFile()) {
      const data = fs.readFileSync(absolute);
      files.push({ path: rel, bytes: data.length, sha256: sha(data) });
    }
  }
}
walk(dist);
files.sort((a, b) => a.path.localeCompare(b.path));
const report = {
  id: 'DD-VITE-DIST-MANIFEST-V151',
  releaseVersion: version.releaseVersion,
  buildId: version.buildId,
  fileCount: files.length,
  totalBytes: files.reduce((sum, file) => sum + file.bytes, 0),
  aggregateSha256: sha(Buffer.from(files.map((file) => `${file.path}\0${file.bytes}\0${file.sha256}`).join('\n'))),
  characterPresentationMarkers: 6,
  files
};
fs.mkdirSync(reportDir, { recursive: true });
fs.writeFileSync(path.join(reportDir, 'dist-build-manifest.json'), `${JSON.stringify(report, null, 2)}\n`);
for (const script of ['scripts/verify-character-presentation-v151.mjs', 'scripts/verify-v150-foundation-v151.mjs']) {
  const run = spawnSync(process.execPath, [path.join(root, script)], { cwd: root, env: process.env, encoding: 'utf8', timeout: 120000, maxBuffer: 32 * 1024 * 1024 });
  process.stdout.write(run.stdout || '');
  process.stderr.write(run.stderr || '');
  if (run.error || run.status !== 0) throw new Error(`v151 dist sub-verifier failed: ${script} (${run.error?.code || run.status})`);
}
console.log(`PASS v1.0.51+ complete Vite dist and modern character presentation markers (${report.fileCount} files)`);
