import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { UI_STRESS_PROFILES, validateUiStressProfile } from '../src/ui-layout-contract.js';

const root = resolve(import.meta.dirname, '..');
const read = (file) => readFileSync(resolve(root, file), 'utf8');
const manager = read('src/ui-layout-manager.js');
const css = read('src/style.css');
const main = read('src/main.js');
const failures = [];
const check = (condition, message) => condition ? console.log(`PASS ${message}`) : failures.push(message);

for (const profile of UI_STRESS_PROFILES) {
  const result = validateUiStressProfile(profile);
  check(result.passed, `${profile.id} layout contract · gap ${result.contract.controlGap}px · ${result.contract.profile}`);
}

check(manager.includes("from './ui-layout-contract.js'"), 'layout manager uses single contract module');
check(manager.includes('new ResizeObserver'), 'rail size changes trigger layout refresh');
check(manager.includes('auditTextOverflow()'), 'long Korean copy overflow audit');
check(manager.includes("classList.toggle('ui-emergency-layout'"), 'emergency collision fallback');
check(css.includes('max-height: calc(var(--viewport-height, 100dvh)'), 'modal viewport height safety');
check(css.includes('@media (max-width: 340px)'), 'ultra-narrow 320px layout');
check(css.includes('var(--ui-action-dock-width'), 'action dock width comes from layout contract');
check(css.includes('var(--ui-joystick-size'), 'joystick size comes from layout contract');
check(main.includes('this.hudLayout?.refresh({ width, height })'), 'visual viewport refresh connection');

if (failures.length) {
  failures.forEach((message) => console.error(`FAIL ${message}`));
  process.exit(1);
}
console.log('v3.7 UI stress contract verified');
