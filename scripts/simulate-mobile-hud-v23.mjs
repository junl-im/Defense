import fs from 'node:fs';
import { generatedOutput } from './output-paths.mjs';
import { resolveMobileViewportV23 } from '../src/runtime/mobile-hud-director-v23.js';

const profiles = [
  { name: 'mobile-320', layoutWidth: 320, layoutHeight: 568, safeTop: 20, safeBottom: 16 },
  { name: 'mobile-360', layoutWidth: 360, layoutHeight: 640, safeTop: 24, safeBottom: 18 },
  { name: 'mobile-390-notch', layoutWidth: 390, layoutHeight: 844, safeTop: 47, safeBottom: 34 },
  { name: 'mobile-430-notch', layoutWidth: 430, layoutHeight: 932, safeTop: 47, safeBottom: 34 },
  { name: 'mobile-wide', layoutWidth: 760, layoutHeight: 1024, safeTop: 24, safeBottom: 20 },
  { name: 'mobile-390-keyboard', layoutWidth: 390, layoutHeight: 844, visualWidth: 390, visualHeight: 520, safeTop: 47, safeBottom: 34 },
  { name: 'mobile-430-keyboard', layoutWidth: 430, layoutHeight: 932, visualWidth: 430, visualHeight: 598, safeTop: 47, safeBottom: 34 },
  { name: 'landscape-667', layoutWidth: 667, layoutHeight: 375, safeTop: 0, safeBottom: 12 },
  { name: 'landscape-800', layoutWidth: 800, layoutHeight: 390, safeTop: 0, safeBottom: 12 },
  { name: 'landscape-800-offset', layoutWidth: 800, layoutHeight: 390, visualWidth: 756, visualHeight: 390, offsetLeft: 22, safeTop: 0, safeBottom: 12 }
];

const overlap = (a, b, gap = 4) => !(a.right + gap <= b.left || b.right + gap <= a.left || a.bottom + gap <= b.top || b.bottom + gap <= a.top);
const rect = (left, top, width, height) => ({ left, top, right: left + width, bottom: top + height, width, height });
const roundedRect = (value) => Object.fromEntries(Object.entries(value).map(([key, item]) => [key, Number(item.toFixed(2))]));

function simulate(rawProfile) {
  const profile = resolveMobileViewportV23({
    visualWidth: rawProfile.visualWidth || rawProfile.layoutWidth,
    visualHeight: rawProfile.visualHeight || rawProfile.layoutHeight,
    layoutWidth: rawProfile.layoutWidth,
    layoutHeight: rawProfile.layoutHeight,
    offsetLeft: rawProfile.offsetLeft || 0,
    offsetTop: rawProfile.offsetTop || 0
  });
  const { layoutWidth, layoutHeight, width, height, offsetLeft, offsetTop, offsetRight, offsetBottom, compact, micro, landscape, scale, controlReserve } = profile;
  const safeTop = rawProfile.safeTop || 0;
  const safeBottom = rawProfile.safeBottom || 0;

  const hud = rect(offsetLeft + 5, offsetTop + safeTop + 4, layoutWidth - offsetLeft - offsetRight - 10, 43);
  const waveWidth = Math.min(layoutWidth * (compact ? 0.44 : 0.44), compact ? 132 : 164);
  const wave = rect(offsetLeft + (width - waveWidth) / 2, offsetTop + safeTop + (landscape ? 45 : 50), waveWidth, 29);
  const bossWidth = Math.min(layoutWidth * (compact ? 0.95 : 0.92), 420);
  const boss = rect(offsetLeft + (width - bossWidth) / 2, offsetTop + safeTop + (landscape ? 76 : 88), bossWidth, landscape ? 58 : 86);

  const controlBottom = safeBottom + offsetBottom + 12;
  const joystickBase = landscape ? 92 : micro ? 102 : 118;
  const joystickSize = joystickBase * scale;
  const joystick = rect(offsetLeft + 10, layoutHeight - controlBottom - joystickSize, joystickSize, joystickSize);

  const actionBaseWidth = landscape ? 238 : micro ? 152 : 168;
  const actionBaseHeight = landscape ? 44 : micro ? 93 : 96;
  const actionWidth = actionBaseWidth * scale;
  const actionHeight = actionBaseHeight * scale;
  const actions = rect(layoutWidth - offsetRight - 9 - actionWidth, layoutHeight - controlBottom - actionHeight, actionWidth, actionHeight);

  const contextWidth = landscape ? Math.min(layoutWidth * 0.42, 240) : Math.min(layoutWidth * (micro ? 0.68 : 0.72), micro ? 220 : 260);
  const contextHeight = 54;
  const contextBottom = safeBottom + offsetBottom + (landscape ? 60 : controlReserve + 14);
  const visualCenter = offsetLeft + width / 2;
  const context = rect(visualCenter - contextWidth / 2, layoutHeight - contextBottom - contextHeight, contextWidth, contextHeight);

  const critical = [
    ['joystick:actions', joystick, actions],
    ['joystick:context', joystick, context],
    ['actions:context', actions, context],
    ['hud:boss', hud, boss],
    ['boss:context', boss, context]
  ].filter(([, a, b]) => overlap(a, b)).map(([name]) => name);

  const visibleBounds = rect(offsetLeft, offsetTop, width, height);
  const controls = { hud, wave, boss, joystick, actions, context };
  const clipped = Object.entries(controls)
    .filter(([, item]) => item.left < visibleBounds.left - 0.5 || item.right > visibleBounds.right + 0.5 || item.top < visibleBounds.top - 0.5 || item.bottom > visibleBounds.bottom + 0.5)
    .map(([name]) => name);

  return {
    name: rawProfile.name,
    safeTop,
    safeBottom,
    ...profile,
    criticalOverlaps: critical,
    clippedControls: clipped,
    pass: critical.length === 0 && clipped.length === 0,
    rectangles: Object.fromEntries(Object.entries(controls).map(([name, value]) => [name, roundedRect(value)]))
  };
}

const results = profiles.map(simulate);
const report = {
  id: 'DD-MOBILE-HUD-RESILIENCE-V134',
  version: '23.2.0',
  releaseVersion: '1.0.34',
  buildId: 'b24.34',
  contract: 'Dynamic mount, visual viewport, touch target and emergency hysteresis simulation',
  zoomButtonsPresent: false,
  profiles: results,
  summary: {
    testedProfiles: results.length,
    passedProfiles: results.filter((entry) => entry.pass).length,
    failedProfiles: results.filter((entry) => !entry.pass).length,
    keyboardProfiles: results.filter((entry) => entry.keyboard).length,
    offsetProfiles: results.filter((entry) => entry.offsetLeft || entry.offsetRight).length,
    contextLaneModes: ['recovery', 'wave', 'interact', 'danger']
  }
};
const output = generatedOutput({ category: 'simulations', filename: 'MOBILE_UI_SIMULATION_v23.latest.json', baseline: 'docs/MOBILE_UI_SIMULATION_v23.0.0.json' });
fs.writeFileSync(output, `${JSON.stringify(report, null, 2)}\n`);
for (const result of results) {
  const problems = [...result.criticalOverlaps, ...result.clippedControls.map((item) => `clipped:${item}`)];
  console.log(`${result.pass ? 'PASS' : 'FAIL'} ${result.name} issues=${problems.join(',') || 'none'}`);
}
if (report.summary.failedProfiles) process.exit(1);
console.log(`\nv23.2.0 mobile HUD resilience simulation passed ${report.summary.passedProfiles}/${report.summary.testedProfiles} -> ${output}`);
