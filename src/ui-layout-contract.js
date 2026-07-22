export const UI_STRESS_PROFILES = Object.freeze([
  Object.freeze({ id: 'iphone-se', width: 320, height: 568, safeTop: 0, safeBottom: 0, textScale: 1 }),
  Object.freeze({ id: 'android-small', width: 360, height: 640, safeTop: 24, safeBottom: 16, textScale: 1 }),
  Object.freeze({ id: 'iphone-modern', width: 390, height: 844, safeTop: 47, safeBottom: 34, textScale: 1 }),
  Object.freeze({ id: 'android-large', width: 430, height: 932, safeTop: 32, safeBottom: 24, textScale: 1 }),
  Object.freeze({ id: 'landscape-short', width: 568, height: 320, safeTop: 0, safeBottom: 0, textScale: 1 }),
  Object.freeze({ id: 'large-text-small', width: 360, height: 640, safeTop: 24, safeBottom: 16, textScale: 1.22 })
]);

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export function resolveUiLayoutContract({ width, height, safeTop = 0, safeRight = 0, safeBottom = 0, safeLeft = 0, textScale = 1, bossActive = false } = {}) {
  const viewportWidth = Math.max(1, Number(width) || 1);
  const viewportHeight = Math.max(1, Number(height) || 1);
  const portrait = viewportHeight >= viewportWidth;
  const landscapePhone = !portrait && viewportHeight <= 560;
  const ultraNarrow = viewportWidth <= 340;
  const narrow = viewportWidth <= 390;
  const phone = viewportWidth <= 540;
  const short = viewportHeight <= 640;
  const largeText = textScale >= 1.15;
  const profile = landscapePhone
    ? 'landscape-phone'
    : ultraNarrow
      ? 'ultra-narrow'
      : narrow && short
        ? 'micro'
        : phone
          ? 'phone'
          : viewportWidth <= 920
            ? 'tablet'
            : 'standard';

  const edge = phone ? 5 : 10;
  const joystickSize = landscapePhone ? 94 : ultraNarrow ? 104 : narrow ? 110 : phone ? 116 : 134;
  const actionDockWidth = landscapePhone ? 280 : ultraNarrow ? 166 : narrow ? 174 : phone ? 180 : 372;
  const availableWidth = viewportWidth - safeLeft - safeRight - edge * 2;
  const controlGap = availableWidth - joystickSize - actionDockWidth;
  const densityScale = landscapePhone ? .84 : ultraNarrow ? .82 : narrow || short ? .88 : phone ? .94 : 1;
  const leftRailWidth = landscapePhone ? 126 : ultraNarrow ? 112 : narrow ? 120 : phone ? 132 : 190;
  const rightRailWidth = landscapePhone ? 106 : ultraNarrow ? 90 : narrow ? 96 : phone ? 106 : 164;
  const automaticMinimal = ultraNarrow || short || landscapePhone || largeText || bossActive;
  const emergencyRisk = controlGap < 16 || (bossActive && viewportHeight - safeTop - safeBottom < 620) || (largeText && ultraNarrow);

  return Object.freeze({
    profile,
    viewportWidth,
    viewportHeight,
    portrait,
    phone,
    narrow,
    ultraNarrow,
    short,
    landscapePhone,
    largeText,
    bossActive,
    automaticMinimal,
    emergencyRisk,
    densityScale,
    copyScale: clamp(1 / Math.max(1, textScale), .78, 1),
    leftRailWidth,
    rightRailWidth,
    joystickSize,
    actionDockWidth,
    controlGap,
    safeArea: Object.freeze({ top: safeTop, right: safeRight, bottom: safeBottom, left: safeLeft })
  });
}

export function validateUiStressProfile(profile, options = {}) {
  const contract = resolveUiLayoutContract({ ...profile, ...options });
  const failures = [];
  if (contract.controlGap < 16) failures.push(`control gap ${contract.controlGap}px`);
  if (contract.leftRailWidth + contract.rightRailWidth + 24 > contract.viewportWidth) failures.push('side rail width budget');
  if (contract.densityScale < .78) failures.push('density scale below readability floor');
  return Object.freeze({ profile: profile.id || 'custom', contract, failures, passed: failures.length === 0 });
}
