export type PolishIssue = {
  area: 'pc' | 'mobile' | 'combat' | 'worldmap' | 'ui' | 'performance';
  severity: 'low' | 'medium' | 'high';
  title: string;
  fix: string;
};

export const V40_POLISH_AUDIT: PolishIssue[] = [
  { area: 'pc', severity: 'high', title: 'PC fullscreen/rotation should never interrupt play', fix: 'Desktop CSS hard-disables portrait rotation and hides start-gate fullscreen prompts.' },
  { area: 'combat', severity: 'high', title: 'Wave and button state must not duplicate countdown text', fix: 'Use one command button as the only countdown source and keep wave panel numeric only.' },
  { area: 'ui', severity: 'medium', title: 'Clickable objects need premium affordance', fix: 'Button, tower-card, tooltip and currency-chip assets now share bevel/gold/rivet treatment.' },
  { area: 'mobile', severity: 'medium', title: 'Safe-area notches can cover panels', fix: 'Shell overlay padding now uses env(safe-area-inset-*) and utility safe frame was added.' },
  { area: 'performance', severity: 'medium', title: 'Heavy UI glow should not add layout cost', fix: 'All decorative glows are canvas assets or CSS background layers with pointer-events disabled.' },
];

export function getPolishSummary(): string {
  return V40_POLISH_AUDIT.map((item) => `[${item.severity.toUpperCase()}] ${item.area}: ${item.title}`).join('\n');
}
