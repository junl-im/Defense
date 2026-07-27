export const SUMMON_BUTTON_PRESENTATION_V142_ID = 'DD-SUMMON-BUTTON-PRESENTATION-V142';

export function resolveSummonButtonStateV142({ gold = 0, cost = 0, locked = false, tickets = 0 } = {}) {
  const safeGold = Math.max(0, Number(gold) || 0);
  const safeCost = Math.max(0, Number(cost) || 0);
  const safeTickets = Math.max(0, Math.floor(Number(tickets) || 0));
  const affordable = safeGold >= safeCost;
  const state = locked ? 'sealed' : affordable ? 'ready' : 'short';
  const disabled = locked || !affordable;
  const title = locked
    ? '강림 봉인 계약 중'
    : affordable
      ? `랜덤 도깨비 소환 · ${safeCost} 엽전`
      : `엽전 ${safeCost - safeGold}개가 더 필요합니다`;
  return Object.freeze({ state, disabled, affordable, locked: Boolean(locked), cost: safeCost, gold: safeGold, tickets: safeTickets, title });
}

export function syncSummonButtonPresentationV142(button, input = {}) {
  const presentation = resolveSummonButtonStateV142(input);
  if (!button) return presentation;
  button.dataset.summonStateV142 = presentation.state;
  button.dataset.summonAffordableV142 = presentation.affordable ? 'true' : 'false';
  button.dataset.summonTicketV142 = presentation.tickets > 0 ? 'true' : 'false';
  button.dataset.summonPresentation = SUMMON_BUTTON_PRESENTATION_V142_ID;
  button.setAttribute('aria-label', presentation.title);
  button.setAttribute('aria-disabled', presentation.disabled ? 'true' : 'false');
  button.title = presentation.title;
  return presentation;
}

export function triggerSummonButtonCastV142(button, schedule = (callback, delay) => setTimeout(callback, delay)) {
  if (!button || button.disabled) return false;
  button.classList.remove('summon-cast-v142');
  void button.offsetWidth;
  button.classList.add('summon-cast-v142');
  schedule(() => button.classList.remove('summon-cast-v142'), 520);
  return true;
}
