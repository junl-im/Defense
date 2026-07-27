import fs from 'node:fs';
import path from 'node:path';

function walk(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(absolute) : [absolute];
  });
}

function readTextFiles(files) {
  return files.map((file) => {
    try { return fs.readFileSync(file, 'utf8'); } catch { return ''; }
  }).join('\n');
}

function normalizeCss(text) {
  return text.replace(/\s+/g, '').toLowerCase();
}

export function verifyDistV134Foundation({ dist }) {
  if (!fs.existsSync(dist)) throw new Error('dist directory is missing');
  const requiredPublic = ['index.html', 'version.json', 'sw.js', 'static-bootstrap.js'];
  for (const relative of requiredPublic) {
    if (!fs.existsSync(path.join(dist, relative))) throw new Error(`v1.0.34 foundation missing dist/${relative}`);
  }

  const read = (relative) => fs.readFileSync(path.join(dist, relative), 'utf8');
  const version = JSON.parse(read('version.json'));
  const parts = String(version.releaseVersion || '').split('.').map(Number);
  const atLeastV134 = parts.length === 3 && parts.every(Number.isFinite)
    && (parts[0] > 1 || (parts[0] === 1 && (parts[1] > 0 || parts[2] >= 34)));
  if (!atLeastV134 || version.buildEpoch !== 24 || Number(version.buildRevision) < 34 || version.buildId !== `b24.${version.buildRevision}`) {
    throw new Error('v1.0.34 dist foundation identity mismatch');
  }
  const indexText = read('index.html');
  const revisionCandidates = [
    version.cacheRevision,
    `release-v1${String(version.buildRevision).padStart(2, '0')}-b24-${version.buildRevision}`,
    `${version.releaseVersion}-${version.buildId}`
  ].filter(Boolean);
  if (!revisionCandidates.some((candidate) => indexText.includes(candidate))
    || !read('sw.js').includes(`const RELEASE_VERSION = '${version.releaseVersion}';`)
    || !read('sw.js').includes(`const BUILD_ID = '${version.buildId}';`)) {
    throw new Error('current dist cache identity mismatch');
  }

  const staticMode = fs.existsSync(path.join(dist, 'src/bootstrap.js'));
  let runtimeText = '';
  let cssText = '';
  if (staticMode) {
    const requiredStatic = [
      'src/main.js',
      'src/style.css',
      'src/version-policy.js',
      'src/runtime/mobile-hud-director-v23.js'
    ];
    for (const relative of requiredStatic) {
      if (!fs.existsSync(path.join(dist, relative))) throw new Error(`v1.0.34 static foundation missing dist/${relative}`);
    }
    runtimeText = read('src/runtime/mobile-hud-director-v23.js');
    cssText = read('src/style.css');
    for (const marker of ['DD-MOBILE-HUD-RESILIENCE-V134', 'lateMountRecoveries', 'transitionEmergencyV23', '--mobile-visual-bottom-v23']) {
      if (!runtimeText.includes(marker)) throw new Error(`v1.0.34 static resilience marker missing: ${marker}`);
    }
    if (!cssText.includes('v1.0.34 Mobile HUD Resilience')) throw new Error('v1.0.34 static accessibility section missing');
  } else {
    const assetFiles = walk(path.join(dist, 'assets'));
    const jsFiles = assetFiles.filter((file) => file.endsWith('.js'));
    const cssFiles = assetFiles.filter((file) => file.endsWith('.css'));
    if (!jsFiles.length) throw new Error('v1.0.34 Vite JavaScript bundle is missing');
    if (!cssFiles.length) throw new Error('v1.0.34 Vite CSS bundle is missing');
    runtimeText = readTextFiles(jsFiles);
    cssText = readTextFiles(cssFiles);
    for (const marker of ['DD-MOBILE-HUD-STABILITY-V135', 'lateMountRecoveries', '--mobile-visual-bottom-v23', 'mobile-hud-v23-emergency']) {
      if (!runtimeText.includes(marker)) throw new Error(`v1.0.34 Vite resilience marker missing: ${marker}`);
    }
  }

  const compactCss = normalizeCss(cssText);
  for (const marker of ['--mobile-visual-bottom-v23', 'min-height:44px', ':focus-visible']) {
    if (!compactCss.includes(marker)) throw new Error(`v1.0.34 accessibility CSS marker missing: ${marker}`);
  }
  if (fs.existsSync(path.join(dist, 'COMPACT_PACKAGE_NOTE.txt')) || fs.existsSync(path.join(dist, 'REBUILD_DIST_WINDOWS.bat'))) {
    throw new Error('obsolete compact root file leaked into dist');
  }
  return Object.freeze({ mode: staticMode ? 'static' : 'vite', version });
}
