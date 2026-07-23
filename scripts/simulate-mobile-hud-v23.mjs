import fs from 'node:fs';

const profiles = [
  { name: 'mobile-320', width: 320, height: 568, safeTop: 20, safeBottom: 16 },
  { name: 'mobile-360', width: 360, height: 640, safeTop: 24, safeBottom: 18 },
  { name: 'mobile-390', width: 390, height: 844, safeTop: 47, safeBottom: 34 },
  { name: 'mobile-430', width: 430, height: 932, safeTop: 47, safeBottom: 34 },
  { name: 'mobile-wide', width: 760, height: 1024, safeTop: 24, safeBottom: 20 },
  { name: 'landscape-667', width: 667, height: 375, safeTop: 0, safeBottom: 12 },
  { name: 'landscape-844', width: 844, height: 390, safeTop: 0, safeBottom: 12 }
];

const overlap = (a, b, gap = 4) => !(a.right + gap <= b.left || b.right + gap <= a.left || a.bottom + gap <= b.top || b.bottom + gap <= a.top);
const rect = (left, top, width, height) => ({ left, top, right: left + width, bottom: top + height, width, height });

function simulate(profile) {
  const { width, height, safeTop, safeBottom } = profile;
  const phone = width <= 820;
  const compact = width <= 430;
  const micro = width <= 360;
  const landscape = phone && width > height;
  const scale = micro ? 0.82 : compact ? 0.9 : landscape ? 0.88 : 1;
  const reserve = landscape ? 82 : micro ? 94 : compact ? 102 : 112;

  const hud = rect(5, safeTop + 4, width - 10, 43);
  const waveWidth = Math.min(width * 0.44, 164);
  const wave = rect((width - waveWidth) / 2, safeTop + (landscape ? 45 : 50), waveWidth, 29);
  const bossWidth = Math.min(width * 0.88, 390);
  const boss = rect((width - bossWidth) / 2, safeTop + (landscape ? 72 : 82), bossWidth, landscape ? 58 : 86);

  const joystickSize = (landscape ? 72 : micro ? 78 : 88) * scale;
  const joystick = rect(8, height - safeBottom - 8 - joystickSize, joystickSize, joystickSize);
  const actionWidth = (landscape ? 218 : micro ? 140 : 154) * scale;
  const actionHeight = (landscape ? 40 : micro ? 75 : 82) * scale;
  const actions = rect(width - 7 - actionWidth, height - safeBottom - 8 - actionHeight, actionWidth, actionHeight);

  const contextWidth = landscape ? Math.min(width * 0.42, 240) : Math.min(width * 0.72, 260);
  const contextHeight = 54;
  const contextBottom = safeBottom + (landscape ? 52 : reserve + 8);
  const context = rect((width - contextWidth) / 2, height - contextBottom - contextHeight, contextWidth, contextHeight);

  const critical = [
    ['joystick:actions', joystick, actions],
    ['joystick:context', joystick, context],
    ['actions:context', actions, context],
    ['hud:boss', hud, boss],
    ['boss:context', boss, context]
  ].filter(([, a, b]) => overlap(a, b)).map(([name]) => name);

  return {
    ...profile,
    phone,
    compact,
    micro,
    landscape,
    scale,
    reserve,
    criticalOverlaps: critical,
    pass: critical.length === 0,
    rectangles: { hud, wave, boss, joystick, actions, context }
  };
}

const results = profiles.map(simulate);
const report = {
  version: '23.0.0',
  contract: 'Quiet Screen mobile HUD reserved-lane geometry simulation',
  zoomButtonsPresent: false,
  profiles: results,
  summary: {
    testedProfiles: results.length,
    passedProfiles: results.filter((entry) => entry.pass).length,
    failedProfiles: results.filter((entry) => !entry.pass).length,
    contextLaneModes: ['recovery', 'wave', 'interact', 'danger']
  }
};
fs.writeFileSync('docs/MOBILE_UI_SIMULATION_v23.0.0.json', `${JSON.stringify(report, null, 2)}\n`);
for (const result of results) console.log(`${result.pass ? 'PASS' : 'FAIL'} ${result.name} overlaps=${result.criticalOverlaps.join(',') || 'none'}`);
if (report.summary.failedProfiles) process.exit(1);
console.log(`\nv23.0.0 mobile UI simulation passed ${report.summary.passedProfiles}/${report.summary.testedProfiles}`);
