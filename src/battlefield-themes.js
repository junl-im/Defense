const BASE_THEME = Object.freeze({
  background: 0x10091f, fog: 0x130b26, hemiSky: 0x858dff, hemiGround: 0x23142e,
  moonLight: 0xa9bdff, moon: 0xffe5a2, halo: 0xd9c5ff, portal: 0xb277ff,
  ground: 0x241933, ring: 0x51405f, inner: 0x34233d, wisp: 0x82e8ff, fogDensity: .024
});

export const BATTLEFIELD_THEMES = Object.freeze({
  default: BASE_THEME,
  harvest: Object.freeze({ ...BASE_THEME, background: 0x181020, fog: 0x261329, moon: 0xffd46d, halo: 0xffb45e, portal: 0xffc15e, ground: 0x30202a, ring: 0x6f4b48, wisp: 0xffdd87 }),
  blood: Object.freeze({ ...BASE_THEME, background: 0x19070e, fog: 0x2d0812, hemiSky: 0xff5f78, moonLight: 0xff6b75, moon: 0xff5c66, halo: 0xff233f, portal: 0xff3e62, ground: 0x2c1119, ring: 0x6c2535, inner: 0x3b111c, wisp: 0xff7990, fogDensity: .028 }),
  frost: Object.freeze({ ...BASE_THEME, background: 0x071522, fog: 0x0b2635, hemiSky: 0x92eaff, moonLight: 0xc8f6ff, moon: 0xd7fbff, halo: 0x73dfff, portal: 0x78e5ff, ground: 0x142a37, ring: 0x315a69, inner: 0x183746, wisp: 0xa4f5ff, fogDensity: .022 }),
  storm: Object.freeze({ ...BASE_THEME, background: 0x0b0c20, fog: 0x13152d, hemiSky: 0x8ca2ff, moonLight: 0xc6d1ff, moon: 0xe1e6ff, halo: 0x758cff, portal: 0x8aa1ff, ground: 0x1c1c35, ring: 0x454b77, wisp: 0xb1bdff, fogDensity: .026 }),
  eclipse: Object.freeze({ ...BASE_THEME, background: 0x05040b, fog: 0x110716, hemiSky: 0x9e68cf, moonLight: 0xa971d2, moon: 0x3b2947, halo: 0xd56eff, portal: 0xe65dff, ground: 0x17101d, ring: 0x4a2857, inner: 0x25102e, wisp: 0xdd79ff, fogDensity: .03 }),
  hunt: Object.freeze({ ...BASE_THEME, background: 0x160d09, fog: 0x2a150e, hemiSky: 0xffa568, moonLight: 0xffc07d, moon: 0xffa84f, halo: 0xff704f, portal: 0xff8a54, ground: 0x2d1b16, ring: 0x70412e, inner: 0x3b2119, wisp: 0xffbd72 }),
  ghost: Object.freeze({ ...BASE_THEME, background: 0x061a19, fog: 0x092b28, hemiSky: 0x61f5d4, moonLight: 0x91ffe4, moon: 0xb8ffe9, halo: 0x45f4c2, portal: 0x4df5c6, ground: 0x102d2a, ring: 0x2d7165, inner: 0x163e38, wisp: 0x7effdb, fogDensity: .027 }),
  dawn: Object.freeze({ ...BASE_THEME, background: 0x211022, fog: 0x3b1730, hemiSky: 0xffad8b, moonLight: 0xffc39e, moon: 0xffe1aa, halo: 0xff8bb1, portal: 0xff9f85, ground: 0x382032, ring: 0x82506a, inner: 0x49243a, wisp: 0xffc2a4, fogDensity: .021 })
});

export function getBattlefieldTheme(omenId = 'default') {
  return BATTLEFIELD_THEMES[omenId] || BATTLEFIELD_THEMES.default;
}
