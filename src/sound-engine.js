export default class SoundEngine {
  constructor() { this.ctx = null; this.enabled = true; }
  unlock() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) this.ctx = new AudioContextClass();
    }
    if (this.ctx?.state === 'suspended') this.ctx.resume();
  }
  tone(freq = 440, duration = .08, type = 'sine', volume = .03, slide = 0, delay = 0) {
    if (!this.enabled || !this.ctx) return;
    const now = this.ctx.currentTime + delay;
    const oscillator = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(Math.max(20, freq), now);
    if (slide) oscillator.frequency.exponentialRampToValueAtTime(Math.max(25, freq + slide), now + duration);
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(.0001, now + duration);
    oscillator.connect(gain).connect(this.ctx.destination);
    oscillator.start(now);
    oscillator.stop(now + duration + .02);
  }
  summon(rank) {
    this.tone(220 + rank * 65, .16, 'sine', .035, 380);
    this.tone(420 + rank * 90, .2, 'triangle', .025, 260, .08);
    if (rank >= 3) this.tone(760, .38, 'sine', .035, 520, .17);
  }
  merge(rank) {
    this.tone(180, .16, 'square', .03, 420);
    this.tone(440 + rank * 110, .28, 'sine', .045, 650, .1);
  }
  shoot(type) {
    const map = { ember: [480, 'triangle', 90], frost: [650, 'sine', -180], wind: [340, 'triangle', 220], stone: [90, 'sawtooth', -30], bell: [760, 'sine', 180], thunder: [120, 'square', 700], hero: [520, 'triangle', 130] };
    const [freq, wave, slide] = map[type] || map.hero;
    this.tone(freq, type === 'stone' ? .13 : .06, wave, type === 'thunder' ? .035 : .014, slide);
  }
  coin() { this.tone(760, .06, 'sine', .028, 330); }
  hit() { this.tone(105, .045, 'square', .012, -25); }
  skill() { this.tone(180, .5, 'sawtooth', .045, 920); this.tone(820, .35, 'sine', .03, -360, .08); }
  boss() { this.tone(62, .7, 'sawtooth', .065, -24); this.tone(110, .45, 'square', .035, -40, .12); }
  ui() { this.tone(480, .045, 'sine', .015, 80); }
  fail() { this.tone(190, .6, 'sawtooth', .045, -130); }
  win() { [440, 554, 660, 880].forEach((f, i) => this.tone(f, .23, 'sine', .038, 90, i * .11)); }
}
