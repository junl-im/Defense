// Progressive mobile navigation: preserves all upstream panels and game logic.
const sections = [
  ['map', '🏡', '마을'],
  ['tiles', '🏗️', '건설'],
  ['research', '📚', '연구'],
  ['factions', '⚔️', '세력'],
  ['info', '🏰', '왕국'],
];
function installMobileDock() {
  if (document.getElementById('slg-mobile-dock')) return;
  const nav = document.createElement('nav');
  nav.id = 'slg-mobile-dock';
  nav.setAttribute('aria-label', '모바일 게임 메뉴');
  function select(section) {
    document.body.dataset.activeSlgPanel = section;
    for (const button of nav.querySelectorAll('button[data-panel]')) {
      const active = button.dataset.panel === section;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    }
  }
  for (const [key, icon, text] of sections) {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.panel = key;
    button.setAttribute('aria-label', text);
    button.innerHTML = '<span aria-hidden="true">' + icon + '</span><small>' + text + '</small>';
    button.addEventListener('click', () => {
      const opened=document.body.dataset.activeSlgPanel;
      // Clicking the current menu again closes it, without losing the map.
      const next=key !== 'map' && opened === key ? 'map' : key;
      if(next!=='map')document.dispatchEvent(new Event('rani:panel-opened'));
      select(next);
    });
    nav.appendChild(button);
  }
  document.body.appendChild(nav);
  select('map');
  document.addEventListener('rani:map-focus',()=>select('map'));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && matchMedia('(max-width: 700px)').matches) select('map');
  });
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', installMobileDock);
} else {
  installMobileDock();
}
