export const CHARACTER_ACTION_TIMING_V152 = Object.freeze({
  id: 'DD-CHARACTER-ACTION-TIMING-V152',
  version: '1.0.52',
  buildId: 'b24.52',
  eventModel: 'authored-absolute-seconds',
  durationGuardId: 'DD-AUTHORED-DURATION-GUARD-V152',
  states: Object.freeze(['attack', 'skill', 'hit'])
});

const marker = (name, at, envelope = {}) => Object.freeze({
  name,
  at: Math.max(0, Number(at) || 0),
  attack: Math.max(0, Number(envelope.attack) || 0),
  skill: Math.max(0, Number(envelope.skill) || 0),
  hit: Math.max(0, Number(envelope.hit) || 0),
  trail: Math.max(0, Number(envelope.trail) || 0)
});

const timeline = (events) => Object.freeze(events.map((event) => marker(event.name, event.at, event)));
const profile = ({ attack, skill, hit }) => Object.freeze({
  attack: timeline(attack),
  skill: timeline(skill),
  hit: timeline(hit)
});

const DEFAULT_PROFILE = profile({
  attack: [
    { name: 'windup', at: 0.00, attack: .20, trail: .10 },
    { name: 'impact', at: .15, attack: 1.00, trail: 1.00 },
    { name: 'recover', at: .28, attack: .42, trail: .28 },
    { name: 'complete', at: .42 }
  ],
  skill: [
    { name: 'charge', at: 0.00, skill: .28, trail: .08 },
    { name: 'release', at: .31, skill: 1.00, trail: 1.00 },
    { name: 'recover', at: .55, skill: .46, trail: .26 },
    { name: 'complete', at: .76 }
  ],
  hit: [
    { name: 'impact', at: 0.00, hit: 1.00, trail: .34 },
    { name: 'recover', at: .10, hit: .42 },
    { name: 'complete', at: .22 }
  ]
});

export const HERO_ACTION_TIMING_PROFILES_V152 = Object.freeze({
  warrior: profile({
    attack: [
      { name: 'windup', at: 0.00, attack: .24, trail: .12 },
      { name: 'impact', at: .12, attack: 1.00, trail: 1.00 },
      { name: 'recover', at: .24, attack: .48, trail: .32 },
      { name: 'complete', at: .38 }
    ],
    skill: [
      { name: 'charge', at: 0.00, skill: .32, trail: .12 },
      { name: 'release', at: .27, skill: 1.00, trail: 1.00 },
      { name: 'echo', at: .42, skill: .72, trail: .66 },
      { name: 'recover', at: .61, skill: .36, trail: .20 },
      { name: 'complete', at: .82 }
    ],
    hit: DEFAULT_PROFILE.hit
  }),
  archer: profile({
    attack: [
      { name: 'draw', at: 0.00, attack: .18, trail: .04 },
      { name: 'release', at: .23, attack: 1.00, trail: .78 },
      { name: 'recover', at: .34, attack: .34, trail: .16 },
      { name: 'complete', at: .48 }
    ],
    skill: [
      { name: 'aim', at: 0.00, skill: .26, trail: .04 },
      { name: 'volley-start', at: .30, skill: .92, trail: .72 },
      { name: 'volley-peak', at: .48, skill: 1.00, trail: 1.00 },
      { name: 'recover', at: .70, skill: .32, trail: .14 },
      { name: 'complete', at: .88 }
    ],
    hit: DEFAULT_PROFILE.hit
  }),
  mage: profile({
    attack: [
      { name: 'channel', at: 0.00, attack: .28, trail: .05 },
      { name: 'release', at: .31, attack: 1.00, trail: .62 },
      { name: 'recover', at: .48, attack: .36, trail: .12 },
      { name: 'complete', at: .62 }
    ],
    skill: [
      { name: 'sigil-open', at: 0.00, skill: .34, trail: .10 },
      { name: 'channel-peak', at: .38, skill: .72, trail: .42 },
      { name: 'detonate', at: .64, skill: 1.00, trail: 1.00 },
      { name: 'recover', at: .86, skill: .38, trail: .18 },
      { name: 'complete', at: 1.08 }
    ],
    hit: DEFAULT_PROFILE.hit
  }),
  taoist: profile({
    attack: [
      { name: 'seal-ready', at: 0.00, attack: .22, trail: .06 },
      { name: 'seal-cast', at: .22, attack: 1.00, trail: .82 },
      { name: 'recover', at: .39, attack: .42, trail: .18 },
      { name: 'complete', at: .55 }
    ],
    skill: [
      { name: 'formation-open', at: 0.00, skill: .30, trail: .08 },
      { name: 'chain-bind', at: .35, skill: .76, trail: .50 },
      { name: 'seal-impact', at: .58, skill: 1.00, trail: .92 },
      { name: 'recover', at: .82, skill: .40, trail: .18 },
      { name: 'complete', at: 1.02 }
    ],
    hit: DEFAULT_PROFILE.hit
  }),
  shaman: profile({
    attack: [
      { name: 'bell-ready', at: 0.00, attack: .20, trail: .06 },
      { name: 'bell-impact', at: .27, attack: 1.00, trail: .70 },
      { name: 'recover', at: .43, attack: .36, trail: .16 },
      { name: 'complete', at: .59 }
    ],
    skill: [
      { name: 'ritual-open', at: 0.00, skill: .30, trail: .06 },
      { name: 'spirit-call', at: .42, skill: .68, trail: .36 },
      { name: 'healing-peak', at: .76, skill: 1.00, trail: .86 },
      { name: 'recover', at: 1.02, skill: .44, trail: .16 },
      { name: 'complete', at: 1.24 }
    ],
    hit: DEFAULT_PROFILE.hit
  })
});

const CATEGORY_PROFILES = Object.freeze({
  hero: DEFAULT_PROFILE,
  guardian: profile({
    attack: [
      { name: 'windup', at: 0.00, attack: .18, trail: .08 },
      { name: 'impact', at: .14, attack: 1.00, trail: .86 },
      { name: 'recover', at: .27, attack: .40, trail: .22 },
      { name: 'complete', at: .40 }
    ],
    skill: DEFAULT_PROFILE.skill,
    hit: DEFAULT_PROFILE.hit
  }),
  monster: profile({
    attack: [
      { name: 'windup', at: 0.00, attack: .16, trail: .04 },
      { name: 'impact', at: .18, attack: .82, trail: .46 },
      { name: 'recover', at: .31, attack: .28, trail: .10 },
      { name: 'complete', at: .44 }
    ],
    skill: DEFAULT_PROFILE.skill,
    hit: DEFAULT_PROFILE.hit
  }),
  boss: profile({
    attack: [
      { name: 'windup', at: 0.00, attack: .28, trail: .10 },
      { name: 'impact', at: .26, attack: 1.00, trail: .92 },
      { name: 'aftershock', at: .43, attack: .72, trail: .62 },
      { name: 'recover', at: .68, attack: .36, trail: .16 },
      { name: 'complete', at: .92 }
    ],
    skill: [
      { name: 'telegraph', at: 0.00, skill: .30, trail: .05 },
      { name: 'charge', at: .46, skill: .68, trail: .32 },
      { name: 'release', at: .82, skill: 1.00, trail: 1.00 },
      { name: 'aftershock', at: 1.04, skill: .74, trail: .58 },
      { name: 'recover', at: 1.30, skill: .34, trail: .12 },
      { name: 'complete', at: 1.54 }
    ],
    hit: DEFAULT_PROFILE.hit
  }),
  default: DEFAULT_PROFILE
});

export function resolveCharacterActionTimingV152({ category = 'default', actorId = '' } = {}) {
  if (category === 'hero' && HERO_ACTION_TIMING_PROFILES_V152[actorId]) return HERO_ACTION_TIMING_PROFILES_V152[actorId];
  return CATEGORY_PROFILES[category] || CATEGORY_PROFILES.default;
}

export function getCharacterActionTimelineV152(profileValue, state = 'idle') {
  const selected = profileValue?.[state];
  return Array.isArray(selected) ? selected : Object.freeze([]);
}
