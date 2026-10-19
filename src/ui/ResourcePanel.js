// ============================================================
// ResourcePanel — complete gameplay HUD.
// Top bar: wood/stone/food/gold/population/stability
// Kingdom panel: tier, upgrade progress, upgrade button
// Territory panel: controlled tiles, borders, connected villages
// Event-driven — no per-frame value polling.
// ============================================================
import { events } from '../core/Events.js';
import { fmtCost } from '../config/BuildingConfig.js';
import { iconHtml, iconLabel } from './GameIcons.js';
import { RANI_PREPARED_ASSETS } from './RaniAssetRegistry.js';

const TOP_RES = [
  { key: 'wood', icon: 'wood', label: '목재' },
  { key: 'stone', icon: 'stone', label: '석재' },
  { key: 'food', icon: 'food', label: '식량' },
  { key: 'gold', icon: 'gold', label: '금화' },
  { key: 'influence', icon: 'influence', label: '영향력' },
];

const STABILITY_TIP =
  '<b>안정도</b> (0~100)<br>' +
  '생산 효율: 안정도 0일 때 60%, 100일 때 100%<br>' +
  '왕국 방어력에도 영향을 줍니다<br><br>' +
  '<b>기본 안정도 70을 향해 서서히 회복</b><br>' +
  '기아 (식량 5 미만): 초당 −0.35<br>' +
  '창고 초과: 자원별 초당 −0.08<br>' +
  '영토 빼앗김: −8 · 되찾음: +4';

function fmt(n) {
  if (n >= 1000) return (n / 1000).toFixed(1) + '천';
  return String(Math.floor(n));
}

function fmtRate(n) {
  const v = Math.round(n * 100) / 100;
  return (v >= 0 ? '+' : '') + v.toFixed(2);
}

export class ResourcePanel {
  constructor(game) {
    this.game = game;
    this._prevRes = {};
    this._buildDom();
    this._bindEvents();
    this.refresh();
  }

  _buildDom() {
    const root = document.createElement('div');
    root.id = 'gameplay-hud';
    root.className = 'ui-panel';
    root.setAttribute('aria-label', '왕국 정보');

    let topCells = '';
    for (const d of TOP_RES) {
      topCells += `
        <div class="hud-res-cell" data-res="${d.key}" data-tip="${d.label} 생산 속도">
          <span class="hud-res-icon">${iconHtml(d.icon)}</span>
          <span class="hud-res-val" id="hud-${d.key}">0</span>
          <span class="hud-res-rate" id="hud-${d.key}-rate">+0/s</span>
          <span class="hud-res-pop hidden" id="hud-${d.key}-pop"></span>
        </div>`;
    }

    root.innerHTML = `
      <div id="hud-top-bar" class="hud-bar">
        ${topCells}
        <div class="hud-res-cell hud-res-popcell" data-tip="전체 마을의 인구">
          <span class="hud-res-icon">${iconHtml('population')}</span>
          <span class="hud-res-val" id="hud-population">0</span>
        </div>
        <div class="hud-res-cell hud-res-stab" data-tip="${STABILITY_TIP}">
          <span class="hud-res-icon">${iconHtml('stability')}</span>
          <span class="hud-res-val" id="hud-stability">70</span>
          <div class="hud-stab-bar"><div class="hud-stab-fill" id="hud-stability-fill"></div></div>
        </div>
      </div>

      <div id="hud-kingdom-panel" class="hud-sub-panel">
        <div class="rani-royal-heading">
          <span class="rani-royal-header-frame" aria-hidden="true">
            <img class="rani-royal-header-art rani-raster-image"
                 src="${RANI_PREPARED_ASSETS.hudPanel}" alt=""
                 width="512" height="254" decoding="async" draggable="false" />
            <span class="rani-raster-fallback" hidden>♛</span>
          </span>
          <span class="rani-royal-heading-copy">
            <h2 class="hud-panel-title">왕국</h2>
            <span class="rani-royal-heading-caption" aria-hidden="true">ROYAL COURT</span>
          </span>
        </div>
        <div class="hud-kingdom-row">
          <span class="hud-tier-icon" id="hud-tier-icon"></span>
          <div class="hud-tier-body">
            <span class="hud-tier-name" id="hud-tier-name">정착지</span>
            <span class="hud-tier-next" id="hud-tier-next"></span>
            <span class="hud-storage" id="hud-storage" data-tip="자원 저장 한도">📦 0 / 140</span>
            <div class="hud-progress hidden" id="hud-tier-progress">
              <div class="hud-progress-fill" id="hud-tier-fill"></div>
            </div>
          </div>
          <button type="button" class="hud-upgrade-btn" id="hud-upgrade-btn"
            data-tip="조건을 충족하면 왕국 단계 승격">승격</button>
        </div>
      </div>

      <div id="hud-territory-panel" class="hud-sub-panel">
        <h2 class="hud-panel-title">영토 현황</h2>
        <div class="hud-territory-stats">
          <div class="hud-stat" data-tip="내가 소유한 영토">
            <span class="hud-stat-val" id="hud-tiles">0</span>
            <span class="hud-stat-label">영토</span>
          </div>
          <div class="hud-stat" data-tip="적에게 노출된 국경 영토">
            <span class="hud-stat-val" id="hud-borders">0</span>
            <span class="hud-stat-label">국경</span>
          </div>
          <div class="hud-stat" data-tip="도로로 연결된 마을">
            <span class="hud-stat-val" id="hud-villages">0</span>
            <span class="hud-stat-label">마을</span>
          </div>
          <div class="hud-stat" data-tip="현재 병력 / 최대 병력 · 병영에서 모집한 뒤 적 영토를 공격하세요">
            <span class="hud-stat-val" id="hud-army">0</span>
            <span class="hud-stat-label">병력</span>
          </div>
        </div>
      </div>`;

    document.body.appendChild(root);
    this.root = root;
    this.el = {
      population: root.querySelector('#hud-population'),
      stability: root.querySelector('#hud-stability'),
      stabilityFill: root.querySelector('#hud-stability-fill'),
      tierIcon: root.querySelector('#hud-tier-icon'),
      tierName: root.querySelector('#hud-tier-name'),
      tierNext: root.querySelector('#hud-tier-next'),
      storage: root.querySelector('#hud-storage'),
      tierProgress: root.querySelector('#hud-tier-progress'),
      tierFill: root.querySelector('#hud-tier-fill'),
      upgradeBtn: root.querySelector('#hud-upgrade-btn'),
      tiles: root.querySelector('#hud-tiles'),
      borders: root.querySelector('#hud-borders'),
      villages: root.querySelector('#hud-villages'),
      army: root.querySelector('#hud-army'),
    };
    for (const d of TOP_RES) {
      this.el[d.key] = root.querySelector(`#hud-${d.key}`);
      this.el[d.key + 'Rate'] = root.querySelector(`#hud-${d.key}-rate`);
      this.el[d.key + 'Pop'] = root.querySelector(`#hud-${d.key}-pop`);
    }

    this.el.upgradeBtn.addEventListener('click', () => {
      const prog = this.game.progressionSystem;
      const check = prog.canStartUpgrade();
      if (!check.ok) {
        this.game.ui.toast(check.reason || '아직 승격 조건을 충족하지 못했습니다');
        this.el.upgradeBtn.classList.add('shake');
        setTimeout(() => this.el.upgradeBtn.classList.remove('shake'), 400);
        return;
      }
      if (prog.startUpgrade()) {
        this.game.ui.toast(`⬆ ${prog.next.name}(으)로 승격 중…`);
      }
    });
  }

  _bindEvents() {
    events.on('resources:changed', ({ resources, rates }) => {
      this._onResources(resources, rates);
      this._refreshStorage();
      // keep the tier Upgrade button live: requirements (tiles, stability,
      // cost) change constantly, so its disabled state must follow
      this._refreshKingdom();
    });
    events.on('population:changed', () => this._refreshPopulation());
    events.on('stability:changed', () => this._refreshStability());
    events.on('progression:started', () => this._refreshKingdom());
    events.on('progression:completed', (p) => {
      if (!p.silent) this.game.ui.toast(`${iconLabel(p.icon)} 왕국이 ${p.name} 단계로 성장했습니다!`);
      this._refreshKingdom();
    });
    events.on('progression:denied', ({ reason }) => this.game.ui.toast(reason));
    events.on('territory:changed', () => this._refreshTerritory());
    events.on('territory:captured', () => this._refreshTerritory());
    events.on('territory:reclaimed', () => this._refreshTerritory());
    events.on('roads:changed', () => this._refreshTerritory());
    events.on('tile:placed', () => this._refreshTerritory());
    events.on('faction:tile-placed', () => this._refreshTerritory());
    events.on('buildings:changed', () => {
      const rs = this.game.resourceSystem;
      if (rs) this._onResources(rs.resources, rs.rates);
      this._refreshStorage();
      this._refreshArmy();
    });
    events.on('army:changed', () => this._refreshArmy());
  }

  _refreshArmy() {
    if (!this.el.army) return;
    const army = this.game.armySystem;
    if (!army) return;
    this.el.army.textContent = `${Math.round(army.strength)}/${Math.round(army.cap)}`;
  }

  refresh() {
    const rs = this.game.resourceSystem;
    if (rs) this._onResources(rs.resources, rs.rates);
    this._refreshPopulation();
    this._refreshStability();
    this._refreshKingdom();
    this._refreshTerritory();
    this._refreshArmy();
  }

  _onResources(resources, rates) {
    const bRates = this.game.buildingSystem?.productionRates() || {};
    for (const d of TOP_RES) {
      const val = resources[d.key] || 0;
      const prev = this._prevRes[d.key];
      if (prev !== undefined && val > prev + 0.4) {
        this._popGain(d.key, val - prev);
      }
      this._prevRes[d.key] = val;
      this.el[d.key].textContent = fmt(val);
      const rate = (rates[d.key] || 0) + (bRates[d.key] || 0);
      const rateEl = this.el[d.key + 'Rate'];
      rateEl.textContent = fmtRate(rate) + '/s';
      rateEl.classList.toggle('neg', rate < -0.001);
    }
  }

  _popGain(key, delta) {
    const pop = this.el[key + 'Pop'];
    if (!pop) return;
    pop.textContent = '+' + fmt(delta);
    pop.classList.remove('hidden');
    pop.classList.remove('gain-pop');
    void pop.offsetWidth;
    pop.classList.add('gain-pop');
    pop.onanimationend = () => pop.classList.add('hidden');
  }

  _refreshPopulation() {
    this.el.population.textContent = String(this.game.citizenSystem?.totalPopulation || 0);
  }

  _refreshStability() {
    const stab = Math.round(this.game.resourceSystem?.stability ?? 70);
    this.el.stability.textContent = String(stab);
    this.el.stabilityFill.style.width = stab + '%';
    this.el.stabilityFill.style.background =
      stab < 30 ? '#c0503a' : stab < 55 ? '#d9a84c' : '#7fae52';
  }

  _refreshKingdom() {
    const prog = this.game.progressionSystem;
    if (!prog) return;

    this.el.tierIcon.innerHTML = iconHtml(prog.current.icon);
    this.el.tierName.textContent = prog.current.name;

    if (prog.maxed) {
      this.el.tierNext.textContent = '최고 단계에 도달했습니다';
      this.el.tierProgress.classList.add('hidden');
      this.el.upgradeBtn.classList.add('hidden');
      this.el.upgradeBtn.disabled = true;
      this._refreshStorage();
      return;
    }

    const nxt = prog.next;
    const check = prog.canStartUpgrade();
    const reqs = prog.upgradeRequirements();
    const reqParts = [`영토 ${nxt.minTiles}개`, `안정도 ${nxt.minStability}`, fmtCost(nxt.upgradeCost)];
    this.el.tierNext.textContent = `→ ${nxt.name} (${reqParts.join(' · ')})`;
    this.el.upgradeBtn.classList.toggle('hidden', prog.upgrading);
    this.el.upgradeBtn.disabled = !check.ok && !prog.upgrading;
    this.el.upgradeBtn.classList.toggle('disabled', !check.ok && !prog.upgrading);
    const tipLines = reqs.map((r) =>
      `<span class="${r.ok ? 'tip-ok' : 'tip-bad'}">${r.ok ? '✓' : '✗'} ${r.label}</span>`
    ).join('<br>');
    this.el.upgradeBtn.setAttribute('data-tip',
      check.ok
        ? `${nxt.name} 단계로 승격 (${nxt.upgradeTime}초)`
        : `<b>승격 조건</b><br>${tipLines}`
    );

    if (prog.upgrading && nxt) {
      this.el.tierProgress.classList.remove('hidden');
      this._syncTierProgress();
    } else {
      this.el.tierProgress.classList.add('hidden');
    }
    this._refreshStorage();
  }

  _refreshStorage() {
    const rs = this.game.resourceSystem;
    if (!rs || !this.el.storage) return;
    const cap = rs.storageCap;
    const used = Math.max(
      rs.resources.wood || 0,
      rs.resources.stone || 0,
      rs.resources.food || 0,
      rs.resources.gold || 0,
      rs.resources.influence || 0,
    );
    this.el.storage.innerHTML = `${iconHtml('storage')} ${fmt(Math.round(used))} / ${fmt(cap)}`;
    this.el.storage.classList.toggle('storage-warn', used >= cap * 0.9);
  }

  _refreshTerritory() {
    const grid = this.game.grid;
    const terr = this.game.territorySystem;
    const roads = this.game.roadSystem;
    if (!grid) return;

    let controlled = 0;
    for (const cell of grid.cells.values()) {
      if (!cell.owner || cell.owner === 'player') controlled++;
    }
    this.el.tiles.textContent = String(controlled);
    this.el.borders.textContent = String(terr ? terr.playerBorderCells().length : 0);
    this.el.villages.textContent = String(roads?.connectedVillages ?? 0);
  }

  /** called from Game loop only while a tier upgrade is running */
  refreshProgress() {
    if (this.game.progressionSystem?.upgrading) this._syncTierProgress();
  }

  _syncTierProgress() {
    const prog = this.game.progressionSystem;
    if (!prog?.upgrading || !prog.next) return;
    const pct = Math.round((1 - prog.upgradeT / prog.next.upgradeTime) * 100);
    this.el.tierFill.style.width = pct + '%';
  }
}
