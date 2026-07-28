import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const css = read('src/style.css');
const runner = read('scripts/run-built-game-mobile-matrix-v144.mjs');
const failures = [];
const check = (value, message) => { if (!value) failures.push(message); };

check(
  /body\.mobile-hud-v23\s+#action-dock\s+button\s*\{[^}]*width\s*:\s*100%\s*!important/i.test(css),
  'mobile action buttons must be constrained to their grid tracks'
);
check(
  /body\.controls-left-handed\.dd-shell-mobile-v112\s+#action-dock\s*\{[^}]*right\s*:\s*auto\s*!important[^}]*left\s*:/is.test(css),
  'left-handed action dock must override shell right anchoring'
);
check(
  /body\.controls-left-handed\.dd-shell-mobile-v112\s+#joystick-zone\s*\{[^}]*left\s*:\s*auto\s*!important[^}]*right\s*:/is.test(css),
  'left-handed joystick must override shell left anchoring'
);
check(
  runner.includes("id: 'zoom-150'") && runner.includes('emulateMobile: false'),
  '150% zoom scenario must use browser page-scale emulation'
);
check(
  runner.includes('maximum-scale=5') && runner.includes('Emulation.setPageScaleFactor'),
  'zoom scenario must temporarily permit and apply page scale'
);
check(
  runner.includes('failedChecks') && runner.includes('DIAG v144'),
  'matrix failures must print failed checks and geometry diagnostics'
);

if (failures.length) {
  failures.forEach((failure) => console.error(`FAIL ${failure}`));
  process.exit(1);
}
console.log('PASS v1.0.44 mobile matrix regression contract');
