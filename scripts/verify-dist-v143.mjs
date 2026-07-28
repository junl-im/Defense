import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const dist = process.env.DIST_DIR ? path.resolve(process.env.DIST_DIR) : path.join(root, 'dist');

const collect = (dir, exts, out = []) => {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) collect(full, exts, out);
    else if (exts.some((ext) => entry.name.endsWith(ext))) out.push(full);
  }
  return out;
};

const normalizeCss = (value) => value
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/["']/g, '')
  .replace(/\s+/g, '')
  .toLowerCase();

const extractRuleBody = (css, selector) => {
  const start = css.indexOf(`${selector}{`);
  if (start < 0) return null;
  const bodyStart = start + selector.length + 1;
  const bodyEnd = css.indexOf('}', bodyStart);
  return bodyEnd < 0 ? null : css.slice(bodyStart, bodyEnd);
};

if (!fs.existsSync(path.join(dist, 'index.html'))) {
  throw new Error('dist/index.html missing');
}

const version = JSON.parse(fs.readFileSync(path.join(dist, 'version.json'), 'utf8'));
const patch = Number(String(version.releaseVersion || '').split('.')[2]);
if (!version.releaseVersion?.startsWith('1.0.') || !Number.isInteger(patch) || patch < 43 || version.buildId !== `b24.${patch}`) {
  throw new Error('v1.0.43+ dist identity mismatch');
}

const js = collect(dist, ['.js']).map((file) => fs.readFileSync(file, 'utf8')).join('\n');
const css = collect(dist, ['.css']).map((file) => fs.readFileSync(file, 'utf8')).join('\n');
const index = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');

if (!js.includes('DD-MOBILE-INPUT-RECOVERY-V143') || !js.includes('mobile-input-recovery-v143')) {
  throw new Error('v143 mobile input recovery runtime missing');
}

// Production CSS minifiers intentionally remove comments. Verify the deployed
// behavior contract instead of a source-only comment such as
// "finger-occlusion safety".
const normalizedCss = normalizeCss(css);
const summonSelector = '#summon-btn[data-summon-visibility-v143=enhanced]';
const summonRule = extractRuleBody(normalizedCss, summonSelector);
const summonLabelRule = extractRuleBody(normalizedCss, `${summonSelector}::before`);
const missingCssContracts = [];

if (!summonRule) {
  missingCssContracts.push('enhanced summon selector');
} else {
  for (const declaration of [
    'isolation:isolate',
    'overflow:visible',
    'touch-action:manipulation',
  ]) {
    if (!summonRule.includes(declaration)) missingCssContracts.push(declaration);
  }
  const transparentTapHighlight = [
    '-webkit-tap-highlight-color:transparent',
    '-webkit-tap-highlight-color:#0000',
    '-webkit-tap-highlight-color:#00000000',
    '-webkit-tap-highlight-color:rgba(0,0,0,0)'
  ].some((declaration) => summonRule.includes(declaration));
  if (!transparentTapHighlight) missingCssContracts.push('-webkit-tap-highlight-color:<transparent>');
}

if (!summonLabelRule) {
  missingCssContracts.push('summon label pseudo-element');
} else {
  for (const declaration of ['position:absolute', 'pointer-events:none']) {
    if (!summonLabelRule.includes(declaration)) missingCssContracts.push(declaration);
  }
  if (!summonLabelRule.includes('content:') || /content:(?:none|normal|;|$)/.test(summonLabelRule)) {
    missingCssContracts.push('non-empty summon label content');
  }
}

if (missingCssContracts.length > 0) {
  throw new Error(`v143 summon visibility CSS contract missing: ${missingCssContracts.join(', ')}`);
}

if (!index.includes('data-summon-visibility-v143="enhanced"')) {
  throw new Error('v143 summon visibility markup missing');
}
if (index.includes('수호대를 전장으로 부르는 중...') || index.includes('loading-wrap')) {
  throw new Error('legacy loading presentation returned');
}

console.log(`PASS v1.0.43+ dist contains mobile input recovery, summon finger-safety, and retired legacy loading under ${version.releaseVersion}`);
