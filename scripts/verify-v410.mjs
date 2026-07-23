import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const read = (path) => readFileSync(resolve(root, path), 'utf8');
const main = read('src/main.js');
const presentation = read('src/combat-presentation.js');
const html = read('index.html');
const css = read('src/style.css');
const failures = [];
const pass = (message) => console.log(`PASS ${message}`);
const check = (condition, message) => {
  if (condition) pass(message);
  else failures.push(message);
};

check(main.includes("from './combat-presentation.js'"), 'combat presentation module import');
check(main.includes('faceActorTowards(this.player.group, target.group.position, .92)'), 'player attack faces live target');
check(main.includes('attackFacingLock = .18') && main.includes('attackFacingLock > 0'), 'player attack direction lock during animation');
check(main.includes('faceActorTowards(unit.group, anticipationTarget.group.position, .34)') || main.includes('faceActorTowards(unit.group, anticipation.target.group.position, .34)'), 'guardian attack anticipation facing');
check(main.includes('faceActorTowards(enemy.group, new THREE.Vector3(0, 0, 0)'), 'enemy core attack facing');
check(main.includes('resolveAttackOrigin(this.player.group') && main.includes('resolveAttackOrigin(unit.group'), 'weapon socket attack origins');
check(main.includes('this.combatPresentation?.muzzle') && main.includes('this.combatPresentation?.impact'), 'muzzle and hit impact runtime integration');
check(main.includes('const impactScale = this.combatPresentation?.timeScale ?? 1'), 'hit stop time scale integration');
check(main.includes('beginAutoWaveCountdown(10)') && main.includes('updateAutoWaveCountdown(dt)'), '10 second automatic next-wave countdown');
check(main.includes("this.startWave({ auto: true })"), 'automatic wave launch');
check(main.includes("this.startWave({ manual: true })"), 'manual immediate wave override');
check(main.includes("ui.wave.classList.add('auto-countdown')"), 'auto-wave button presentation state');
check(html.includes('id="combat-impact-flash"'), 'combat impact screen flash layer');
check(html.includes('id="wave-btn-label"'), 'auto-wave accessible label');
check(css.includes('.wave-btn.auto-countdown::before') && css.includes('conic-gradient'), 'raster-free countdown ring styling');
check(css.includes('#combat-impact-flash.show.critical') && css.includes('#combat-impact-flash.show.heavy'), 'critical and heavy impact flash levels');
check(presentation.includes('STYLE_PRESETS') && presentation.includes("shape: 'crescent'") && presentation.includes("shape: 'quake'"), 'element-specific impact shape presets');
check(presentation.includes('this.maxEffects = lowPower ? 34 : 72'), 'mobile VFX effect budget');
check(presentation.includes('if (this.lowPower && duration < .03) return'), 'low-power hit-stop guard');
check(html.includes('id="auto-wave-panel"') && html.includes('id="auto-wave-panel-progress"'), 'premium auto-wave intermission panel');
check(main.includes("ui.autoWavePanel.classList.add('show')") && main.includes('ui.autoWavePanelProgress.style.width'), 'auto-wave panel runtime progress binding');
check(css.includes('.auto-wave-panel') && css.includes('premium-impact-slash'), 'premium combat and intermission visual system');
check(!presentation.includes('<svg') && !presentation.includes('.svg'), 'combat presentation contains no SVG');

if (failures.length) {
  console.error(`\nFAIL v4.1.0 combat presentation contract ${failures.length}건`);
  failures.forEach((failure, index) => console.error(`${index + 1}. ${failure}`));
  process.exit(1);
}

console.log('v4.1.0 combat direction, impact, and auto-wave contract verified');
