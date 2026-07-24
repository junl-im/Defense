export const NATIVE_INPUT_POLICY_VERSION = '23.1.0';
export const GLOBAL_GAME_SHORTCUTS_ENABLED = false;
export const MOVEMENT_CODES = Object.freeze([
  'KeyW', 'KeyA', 'KeyS', 'KeyD',
  'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'
]);
const movementSet = new Set(MOVEMENT_CODES);
export const isMovementCode = (code) => movementSet.has(code);
