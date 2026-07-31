import {
  CHARACTER_ACTION_TIMING_V152,
  HERO_ACTION_TIMING_PROFILES_V152,
  getCharacterActionTimelineV152,
  resolveCharacterActionTimingV152
} from '../src/runtime/character-action-timing-v152.js';

const failures = [];
const check = (value, label) => { if (!value) failures.push(label); };
const ordered = (events) => events.every((event, index) => index === 0 || event.at >= events[index - 1].at);

check(CHARACTER_ACTION_TIMING_V152.version === '1.0.52' && CHARACTER_ACTION_TIMING_V152.buildId === 'b24.52', 'v152 timing identity');
check(CHARACTER_ACTION_TIMING_V152.eventModel === 'authored-absolute-seconds', 'absolute-second event model');
for (const heroClass of ['warrior', 'archer', 'mage', 'taoist', 'shaman']) {
  const profile = resolveCharacterActionTimingV152({ category: 'hero', actorId: heroClass });
  check(profile === HERO_ACTION_TIMING_PROFILES_V152[heroClass], `${heroClass} authored profile resolution`);
  for (const state of ['attack', 'skill', 'hit']) {
    const events = getCharacterActionTimelineV152(profile, state);
    check(events.length >= 3, `${heroClass} ${state} event density`);
    check(ordered(events), `${heroClass} ${state} event ordering`);
    check(events.every((event) => Number.isFinite(event.at) && event.at >= 0), `${heroClass} ${state} finite absolute times`);
    check(events.at(-1)?.name === 'complete', `${heroClass} ${state} complete marker`);
  }
}
check(resolveCharacterActionTimingV152({ category: 'hero', actorId: 'archer' }).attack.some((event) => event.name === 'release' && event.at === .23), 'archer release authored at 0.23s');
check(resolveCharacterActionTimingV152({ category: 'hero', actorId: 'mage' }).skill.some((event) => event.name === 'detonate' && event.at === .64), 'mage detonate authored at 0.64s');
check(resolveCharacterActionTimingV152({ category: 'boss' }).skill.some((event) => event.name === 'aftershock'), 'boss aftershock event');
check(getCharacterActionTimelineV152(null, 'idle').length === 0, 'non-action state safely resolves empty timeline');

if (failures.length) {
  failures.forEach((failure) => console.error(`FAIL ${failure}`));
  process.exit(1);
}
console.log('PASS v1.0.52 class-authored action timing profiles use ordered absolute-second events');
