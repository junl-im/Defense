export const APP_STATE_SURFACE_V141_ID = 'DD-APP-STATE-SURFACE-V141';

const KNOWN_STATES = Object.freeze([
  'loading', 'title', 'playing', 'paused', 'choice', 'blessing', 'relic', 'contract', 'result'
]);

export function syncAppStateSurfaceV141(body, state = 'loading') {
  if (!body?.classList || !body?.dataset) return Object.freeze({ state, interactive: false, applied: false });
  const normalized = KNOWN_STATES.includes(state) ? state : 'loading';
  const interactive = normalized === 'playing';
  body.dataset.appState = normalized;
  body.dataset.mapTouchReadyV141 = interactive ? 'true' : 'false';
  body.classList.toggle('playing', interactive);
  for (const name of KNOWN_STATES) body.classList.toggle(`app-state-${name}-v141`, name === normalized);
  if (!interactive) body.classList.remove('run-entry-pending-v141');
  return Object.freeze({ state: normalized, interactive, applied: true, id: APP_STATE_SURFACE_V141_ID });
}

export default syncAppStateSurfaceV141;
