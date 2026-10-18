// ============================================================
// ConstructionPanel — active build queue with progress bars.
// Event-driven list; progress widths refresh only while jobs
// are running (called from Game loop).
// ============================================================
import { BUILDINGS, VILLAGE_UPGRADE } from '../config/BuildingConfig.js';
import { RESEARCH } from '../config/ResearchConfig.js';
import { events } from '../core/Events.js';
import { iconHtml } from './GameIcons.js';

function jobLabel(id) {
  if (id === 'village_upgrade') return { icon: VILLAGE_UPGRADE.icon, name: VILLAGE_UPGRADE.name };
  const def = BUILDINGS[id];
  return { icon: def?.icon || 'build', name: def?.name || id };
}

export class ConstructionPanel {
  constructor(game) {
    this.game = game;
    this._rows = new Map();
    this._buildDom();
    this._bindEvents();
    this.refresh();
  }

  _buildDom() {
    const root = document.createElement('aside');
    root.id = 'construction-panel';
    root.className = 'hud-side-panel construction-panel hidden';
    root.setAttribute('aria-label', '건설 대기열');
    root.innerHTML = `
      <h2 class="hud-panel-title">진행 중인 작업</h2>
      <div class="construction-list" id="construction-list"></div>`;
    document.body.appendChild(root);
    this.root = root;
    this.listEl = root.querySelector('#construction-list');
    this.listEl.addEventListener('click', (event) => {
      const button = event.target.closest('button[data-cancel-key]');
      if (!button || !this.listEl.contains(button)) return;
      if (!window.confirm('진행 중인 건설을 취소하시겠습니까? 자원의 80%가 반환됩니다.')) return;
      if (this.game.buildingSystem.cancelJob(button.dataset.cancelKey, button.dataset.cancelId)) {
        this.game.ui.toast('건설 취소 완료 · 사용 자원 80% 반환');
        this.refresh();
      }
    });
  }

  _bindEvents() {
    const toastStart = ({ id, time }) => {
      const { icon, name } = jobLabel(id);
      this.game.ui.toast(`${icon} ${name} 건설 시작 (${Math.round(time)}초)`);
      this.refresh();
    };

    events.on('build:started', toastStart);
    events.on('build:completed', () => this.refresh());
    events.on('build:cancelled', () => this.refresh());
    events.on('buildings:changed', () => this.refresh());
    events.on('research:started', ({ icon, name, time }) => {
      this.game.ui.toast(`${icon} ${name} 연구 시작 (${Math.round(time)}초)`);
      this.refresh();
    });
    events.on('research:completed', () => this.refresh());
    events.on('game:restart', () => this.refresh());
  }

  /** rebuild job rows from systems (event-driven) */
  refresh() {
    const jobs = this.game.buildingSystem?.activeJobs() || [];
    const research = this.game.researchSystem?.active;
    const hasWork = jobs.length > 0 || !!research;

    this.root.classList.toggle('hidden', !hasWork);
    if (!hasWork) {
      this.listEl.innerHTML = '';
      this._rows.clear();
      return;
    }

    const keys = new Set();
    let html = '';

    for (const j of jobs) {
      const id = `job-${j.key}-${j.id}`;
      keys.add(id);
      const pct = Math.round((1 - j.remaining / Math.max(j.total, 0.01)) * 100);
      html += `
        <div class="construction-row" data-row-id="${id}" data-tip="영토 좌표 ${j.q},${j.r}">
          <span class="construction-icon">${iconHtml(j.icon)}</span>
          <div class="construction-body">
            <span class="construction-name">${j.name} <small class="construction-state">${j.name.includes("(강화)") ? "강화 중" : "건설 중"}</small></span>
            <div class="hud-progress"><div class="hud-progress-fill construction-fill" style="width:${pct}%"></div></div>
          </div>
          <span class="construction-pct">${pct}%</span>
          <button type="button" class="construction-cancel" data-cancel-key="${j.key}" data-cancel-id="${j.id}" aria-label="${j.name} 건설 취소">취소</button>
        </div>`;
    }

    if (research) {
      const def = RESEARCH[research.id];
      const id = `job-research-${research.id}`;
      keys.add(id);
      const pct = Math.round((1 - research.remaining / Math.max(research.total, 0.01)) * 100);
      html += `
        <div class="construction-row" data-row-id="${id}">
          <span class="construction-icon">${iconHtml(def?.icon || 'research')}</span>
          <div class="construction-body">
            <span class="construction-name">${def?.name || research.id} <small class="construction-state">연구 중</small></span>
            <div class="hud-progress"><div class="hud-progress-fill construction-fill" style="width:${pct}%"></div></div>
          </div>
          <span class="construction-pct">${pct}%</span>
        </div>`;
    }

    this.listEl.innerHTML = html;
    this._rows.clear();
    for (const el of this.listEl.querySelectorAll('.construction-row')) {
      this._rows.set(el.dataset.rowId, el);
    }
  }

  /** smooth progress — only while panel visible */
  refreshProgress() {
    if (this.root.classList.contains('hidden')) return;

    for (const j of this.game.buildingSystem?.activeJobs() || []) {
      const id = `job-${j.key}-${j.id}`;
      const row = this._rows.get(id);
      if (!row) { this.refresh(); return; }
      const pct = Math.round((1 - j.remaining / Math.max(j.total, 0.01)) * 100);
      const fill = row.querySelector('.construction-fill');
      const label = row.querySelector('.construction-pct');
      if (fill) fill.style.width = pct + '%';
      if (label && label.textContent !== pct + '%') label.textContent = pct + '%';
    }

    const research = this.game.researchSystem?.active;
    if (research) {
      const id = `job-research-${research.id}`;
      const row = this._rows.get(id);
      if (!row) { this.refresh(); return; }
      const pct = Math.round((1 - research.remaining / Math.max(research.total, 0.01)) * 100);
      const fill = row.querySelector('.construction-fill');
      const label = row.querySelector('.construction-pct');
      if (fill) fill.style.width = pct + '%';
      if (label && label.textContent !== pct + '%') label.textContent = pct + '%';
    }
  }

  hasActiveWork() {
    return (this.game.buildingSystem?.activeJobs().length || 0) > 0
      || !!this.game.researchSystem?.active;
  }
}
