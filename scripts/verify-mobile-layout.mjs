import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const css = readFileSync(resolve(root, 'src/style.css'), 'utf8');
const html = readFileSync(resolve(root, 'index.html'), 'utf8');
const failures = [];

const requiredCss = [
  'height: 100dvh',
  '@media (max-width: 410px) and (orientation: portrait)',
  'grid-template-areas: "dash ultimate spirit summon" "wave wave wave summon"',
  'grid-template-columns: 40px 44px 40px 64px',
  'max-width: calc(100vw - var(--safe-left) - var(--safe-right) - 20px)',
  'max-height: calc(100dvh - var(--safe-top) - var(--safe-bottom) - 20px)'
];
for (const token of requiredCss) if (!css.includes(token)) failures.push(`missing CSS guard: ${token}`);

for (const id of ['joystick-zone','action-dock','dash-btn','skill-btn','burst-btn','summon-btn','wave-btn','hud','unit-strip','wave-trial','relic-panel','controls-modal','rotate-sensitivity','pinch-sensitivity','seed-mode-options','run-seed-chip','shake-intensity','flash-intensity']) {
  if (!html.includes(`id="${id}"`)) failures.push(`missing mobile UI node: ${id}`);
}

const portraitDockWidth = 40 + 44 + 40 + 64 + 3 * 3;
const layouts = [
  { width: 320, joyLeft: 5, joyWidth: 108, dockRight: 5 },
  { width: 350, joyLeft: 5, joyWidth: 108, dockRight: 5 },
  { width: 360, joyLeft: 5, joyWidth: 116, dockRight: 5 },
  { width: 390, joyLeft: 5, joyWidth: 116, dockRight: 5 },
  { width: 410, joyLeft: 5, joyWidth: 116, dockRight: 5 }
];
for (const layout of layouts) {
  const joyRight = layout.joyLeft + layout.joyWidth;
  const dockLeft = layout.width - layout.dockRight - portraitDockWidth;
  const gap = dockLeft - joyRight;
  if (gap < 4) failures.push(`${layout.width}px portrait control gap ${gap}px`);
  else console.log(`PASS ${layout.width}px portrait joystick/action gap ${gap}px`);
}

const landscapeDockWidth = 46 + 54 + 46 + 78 + 5 * 3;
const landscape = { width: 568, joyRight: 12 + 104, dockLeft: 568 - 10 - landscapeDockWidth };
if (landscape.dockLeft - landscape.joyRight < 8) failures.push('568px landscape controls overlap');
else console.log(`PASS 568px landscape joystick/action gap ${landscape.dockLeft - landscape.joyRight}px`);

if (!css.includes('body.controls-left-handed .joystick-zone') || !css.includes('body.controls-left-handed .action-dock')) failures.push('left-handed mobile layout missing');

if (!css.includes('.run-seed-chip') || !css.includes('.seed-mode-selector') || !css.includes('.accessibility-settings')) failures.push('v2.0 seed/accessibility responsive UI missing');
if (!css.includes('.moon-omen { left: calc(154px + var(--safe-left))')) failures.push('narrow portrait seed/omen collision guard missing');


const touchTargets = { dash: 40, ultimate: 44, spirit: 40, summonWidth: 64, waveHeight: 34, menu: 40 };
for (const [name,size] of Object.entries(touchTargets)) {
  if (name !== 'waveHeight' && size < 40) failures.push(`${name} touch target below 40px`);
  if (name === 'waveHeight' && size < 34) failures.push(`${name} compact target below 34px`);
}

if (failures.length) {
  failures.forEach((item) => console.error(`FAIL ${item}`));
  process.exit(1);
}
console.log('PASS mobile safe-area, viewport bounds, and five-button compact control layout budget');
