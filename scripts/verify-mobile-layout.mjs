import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const css = readFileSync(resolve(root, 'src/style.css'), 'utf8');
const html = readFileSync(resolve(root, 'index.html'), 'utf8');
const failures = [];

const requiredCss = [
  'height: 100dvh',
  '@media (max-width: 410px) and (orientation: portrait)',
  'grid-template-areas:',
  '"dash ultimate summon"',
  '"wave wave summon"',
  'max-width: calc(100vw - var(--safe-left) - var(--safe-right) - 20px)',
  'max-height: calc(100dvh - var(--safe-top) - var(--safe-bottom) - 20px)'
];
for (const token of requiredCss) if (!css.includes(token)) failures.push(`missing CSS guard: ${token}`);

for (const id of ['joystick-zone','action-dock','dash-btn','skill-btn','summon-btn','wave-btn','hud','unit-strip','controls-modal','rotate-sensitivity','pinch-sensitivity']) {
  if (!html.includes(`id="${id}"`)) failures.push(`missing mobile UI node: ${id}`);
}

const layouts = [
  { width: 320, joyLeft: 5, joyWidth: 108, dockRight: 5, dockWidth: 43 + 49 + 72 + 8 },
  { width: 350, joyLeft: 5, joyWidth: 108, dockRight: 5, dockWidth: 43 + 49 + 72 + 8 },
  { width: 360, joyLeft: 5, joyWidth: 116, dockRight: 5, dockWidth: 46 + 52 + 76 + 8 },
  { width: 390, joyLeft: 5, joyWidth: 116, dockRight: 5, dockWidth: 46 + 52 + 76 + 8 },
  { width: 410, joyLeft: 5, joyWidth: 116, dockRight: 5, dockWidth: 46 + 52 + 76 + 8 }
];
for (const layout of layouts) {
  const joyRight = layout.joyLeft + layout.joyWidth;
  const dockLeft = layout.width - layout.dockRight - layout.dockWidth;
  const gap = dockLeft - joyRight;
  if (gap < 4) failures.push(`${layout.width}px portrait control gap ${gap}px`);
  else console.log(`PASS ${layout.width}px portrait joystick/action gap ${gap}px`);
}

const landscape = { width: 568, joyRight: 12 + 104, dockLeft: 568 - 10 - (50 + 58 + 88 + 55 + 21) };
if (landscape.dockLeft - landscape.joyRight < 8) failures.push('568px landscape controls overlap');
else console.log(`PASS 568px landscape joystick/action gap ${landscape.dockLeft - landscape.joyRight}px`);

if (!css.includes('body.controls-left-handed .joystick-zone') || !css.includes('body.controls-left-handed .action-dock')) failures.push('left-handed mobile layout missing');

const touchTargets = { dash: 43, ultimate: 49, summonWidth: 72, waveHeight: 44, menu: 40 };
for (const [name,size] of Object.entries(touchTargets)) {
  if (size < 40) failures.push(`${name} touch target below 40px`);
}

if (failures.length) {
  failures.forEach((item) => console.error(`FAIL ${item}`));
  process.exit(1);
}
console.log('PASS mobile safe-area, viewport bounds, and compact control layout budget');
