// Korean, event-driven first-kingdom progression.
// Derived from existing game state: zero reward exploits and no save schema change.
import { events } from '../core/Events.js';

function countTerrain(game, type) {
  let count = 0;
  for (const cell of game.grid.cells.values()) {
    if (cell.tileType === type && (!cell.owner || cell.owner === 'player')) count++;
  }
  return count;
}

export const TUTORIAL_STEPS = Object.freeze([
  {
    id: 'first_land', title: '처음 영토 확장',
    description: '기존 마을 옆에 영토 1칸을 더 설치하세요.',
    panel: 'tiles',
    count: (game) => game.tilesPlaced,
    goal: 2, unit: '칸',
  },
  {
    id: 'forest', title: '목재 생산 기반',
    description: '건설 메뉴에서 숲을 선택하고 영토에 배치하세요.',
    panel: 'tiles',
    count: (game) => countTerrain(game, 'forest'),
    goal: 1, unit: '칸',
  },
  {
    id: 'field', title: '식량 생산 기반',
    description: '농경지를 1칸 배치해 주민들의 식량을 확보하세요.',
    panel: 'tiles',
    count: (game) => countTerrain(game, 'field'),
    goal: 1, unit: '칸',
  },
  {
    id: 'research', title: '첫 번째 연구',
    description: '연구소에서 농업 연구를 시작하세요.',
    panel: 'research',
    count: (game) => Number(game.researchSystem.isCompleted('agriculture') ||
      game.researchSystem.active?.id === 'agriculture'),
    goal: 1, unit: '회',
  },
  {
    id: 'eight_lands', title: '영토 8칸 달성',
    description: '영토를 넓히고 자원을 모아 다음 왕국 단계에 대비하세요.',
    panel: 'tiles',
    count: (game) => game.tilesPlaced,
    goal: 8, unit: '칸',
  },
  {
    id: 'promotion', title: '왕국 승격 시작',
    description: '왕국 정보에서 승격을 눌러 다음 단계로 성장하세요.',
    panel: 'info',
    count: (game) => Number(game.progressionSystem.upgrading || game.progressionSystem.tier >= 1),
    goal: 1, unit: '회',
  },
]);

export function tutorialProgress(game) {
  const index = TUTORIAL_STEPS.findIndex((step) => step.count(game) < step.goal);
  const finished = index === -1;
  const currentIndex = finished ? TUTORIAL_STEPS.length : index;
  const current = finished ? null : TUTORIAL_STEPS[index];
  return {
    finished, index: currentIndex, total: TUTORIAL_STEPS.length, current,
    value: current ? Math.min(current.count(game), current.goal) : 0,
  };
}

export class TutorialMissions {
  constructor(game) {
    this.game = game;
    this.collapsed = window.matchMedia('(max-width: 700px)').matches;
    this._build();
    const refresh = () => this.refresh();
    this.unsubscribers = [
      events.on('tile:placed', refresh),
      events.on('territory:changed', refresh),
      events.on('research:started', refresh),
      events.on('research:completed', refresh),
      events.on('progression:started', refresh),
      events.on('progression:completed', refresh),
      events.on('game:restart', () => queueMicrotask(refresh)),
    ];
    this.refresh();
  }

  _build() {
    const root = document.createElement('aside');
    root.id = 'slg-tutorial';
    root.className = 'slg-tutorial';
    root.setAttribute('aria-label', '초보 영주 성장 목표');
    root.innerHTML = `
      <header class="slg-tutorial-head">
        <span class="slg-tutorial-mark">📜</span>
        <strong>왕국 성장 길잡이</strong>
        <button type="button" class="slg-tutorial-fold" aria-label="목표 접기" aria-expanded="true">−</button>
      </header>
      <div class="slg-tutorial-body" aria-live="polite">
        <span class="slg-tutorial-count" id="slg-tutorial-count"></span>
        <h3 id="slg-tutorial-title"></h3>
        <p id="slg-tutorial-text"></p>
        <div class="slg-tutorial-progress" aria-label="현재 목표 진행률">
          <span id="slg-tutorial-bar"></span>
        </div>
        <div class="slg-tutorial-bottom">
          <small id="slg-tutorial-numbers"></small>
          <button id="slg-tutorial-go" type="button">바로가기 →</button>
        </div>
      </div>`;
    document.body.appendChild(root);
    this.root = root;
    this.fold = root.querySelector('.slg-tutorial-fold');
    if(this.collapsed) root.classList.add('slg-tutorial-collapsed');
    this.body = root.querySelector('.slg-tutorial-body');
    this.go = root.querySelector('#slg-tutorial-go');
    this.fold.setAttribute('aria-expanded',String(!this.collapsed));
    this.fold.addEventListener('click', () => this.setCollapsed(!this.collapsed));
    this.go.addEventListener('click', () => {
      const state = tutorialProgress(this.game);
      if (!state.current) return;
      const key = state.current.panel;
      if (window.matchMedia('(max-width: 700px)').matches) {
        document.querySelector('#slg-mobile-dock button[data-panel="' + key + '"]')?.click();
      } else if (key === 'info') {
        document.querySelector('#hud-upgrade-btn')?.focus();
      } else if (key === 'research') {
        document.querySelector('#research-panel .research-btn')?.focus();
      } else {
        document.querySelector('#tile-shop .tile-chip')?.focus();
      }
    });
  }

  setCollapsed(value) {
    this.collapsed = !!value;
    this.root.classList.toggle('slg-tutorial-collapsed', this.collapsed);
    this.fold.textContent = this.collapsed ? '+' : '−';
    this.fold.setAttribute('aria-expanded', String(!this.collapsed));
    this.fold.setAttribute('aria-label', this.collapsed ? '목표 펼치기' : '목표 접기');
  }

  refresh() {
    const state = tutorialProgress(this.game);
    this.root.dataset.step = state.current?.id || 'complete';
    this.root.querySelector('#slg-tutorial-count').textContent =
      state.finished ? '모든 기초 목표 완료' : `초보 목표 ${state.index + 1} / ${state.total}`;
    this.root.querySelector('#slg-tutorial-title').textContent =
      state.finished ? '왕국의 첫걸음 완성!' : state.current.title;
    this.root.querySelector('#slg-tutorial-text').textContent =
      state.finished ? '이제 자유롭게 영토를 확장하고 왕국을 발전시키세요.' : state.current.description;
    this.root.querySelector('#slg-tutorial-bar').style.width =
      state.finished ? '100%' : Math.min(100, state.value / state.current.goal * 100) + '%';
    this.root.querySelector('#slg-tutorial-numbers').textContent =
      state.finished ? '6개 목표 달성' : `${state.value} / ${state.current.goal} ${state.current.unit}`;
    this.go.hidden = state.finished;
    this.go.textContent = state.current?.panel === 'research' ? '연구 보기 →' :
      state.current?.panel === 'info' ? '왕국 보기 →' : '건설 보기 →';
  }
}
