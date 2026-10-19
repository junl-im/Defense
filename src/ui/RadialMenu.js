// ============================================================
// RadialMenu — contextual action ring for the selected tile.
// Opens on 'selection:changed', anchored to the tile's projected
// screen position (updated only while open — one project() per
// frame, no scene scans). Actions are derived from
// BuildingConfig per tile type; unavailable actions render
// disabled with the reason in their tooltip. All gameplay goes
// through the EXISTING systems (BuildingSystem / TerritorySystem).
// ============================================================
import * as THREE from 'three';
import { axialToWorld } from '../grid/Hex.js';
import { TILE_H } from '../tiles/TileMeshBuilder.js';
import { BUILDINGS, VILLAGE_UPGRADE, MAX_BUILDINGS_PER_TILE, fmtCost } from '../config/BuildingConfig.js';
import { UNIT_TYPES, ATTACK_SUPPLY_COST } from '../config/EconomyConfig.js';
import { TILE_TYPES } from '../tiles/TileDefs.js';
import { events } from '../core/Events.js';
import { iconHtml, iconLabel } from './GameIcons.js';
import { buildPlans } from './QuickBuildPlans.js';

const RADIUS = 86; // px ring radius
const PAGE_SIZE = 5; // five actions plus one page-turn control
const RESOURCE_NAMES = {wood:'목재',stone:'석재',food:'식량',gold:'금화',influence:'영향력'};
export const SELECTION_IDLE_MS = 15_000; // actual user inactivity; never a building timer

const RES_ICONS = { wood: 'wood', stone: 'stone', food: 'food', gold: 'gold', influence: 'influence' };

/** production string keeping fractional rates */
function fmtProduction(prod) {
  return Object.entries(prod)
    .map(([k, v]) => `${iconLabel(RES_ICONS[k] || k)} +${v}`)
    .join(' · ');
}

export class RadialMenu {
  constructor(game) {
    this.game = game;
    this.cell = null;
    this.empty = null;
    this.emptyPage = 0;
    this.cellPage = 0;
    this.cellPages = 1;
    this.idleTimeoutMs = SELECTION_IDLE_MS;
    this.lastInteractionAt = performance.now();
    this._heldPointers = new Set();
    this.anchor = null;
    this.buildingId = null;
    this._worldPos = new THREE.Vector3();
    this._screen = new THREE.Vector3();

    this.root = document.createElement('div');
    this.root.id = 'radial-menu';
    this.root.className = 'hidden';
    this.root.setAttribute('role','group');
    this.root.setAttribute('aria-label','육각 건물 정보와 건설 메뉴');
    document.body.appendChild(this.root);
    this._blockedActivation=null;
    this._bindIdleActivity();
    // A *new* deliberate press on the actual menu is always legitimate.
    // Without this reset, a fast second tap on "건설" can share pointerId
    // with the opening gesture and be mistakenly discarded for 450ms.
    // The browser's ghost click has no pointerdown on the newly added menu.
    this.root.addEventListener('pointerdown',()=>{
      this._blockedActivation=null;
    },true);
    // Touch browsers dispatch a synthetic click AFTER pointerup. If pointerup
    // opens the ring under the finger, that click is re-targeted to the newly
    // mounted center 'close' button: the ring vanishes on every short tap.
    // Consume ONLY the click from the same pointer that opened the ring.
    this.root.addEventListener('click', e=>{
      const b=this._blockedActivation;
      if(!b||performance.now()>b.until)return;
      if(e.pointerId===b.pointerId){
        e.preventDefault();
        e.stopImmediatePropagation();
        this._blockedActivation=null;
      }
    },true);

    events.on('selection:changed', ({ cell, anchor, buildingId }) => {
      this.cell = cell;
      if(cell){this.empty=null;this.cellPage=0;}
      this.anchor = anchor?.isVector3 ? anchor.clone() : null;
      this.buildingId = buildingId || null;
      if (cell) {
        this._markActive();
        this._build(cell);
      } else if (!this.empty) this._hide();
    });
    // requirements can change while open (resources, research, construction)
    events.on('resources:changed', () => this._refreshDisabled());
    events.on('buildings:changed', () => { if (this.cell) this._build(this.cell); });
    events.on('research:completed', () => { if (this.cell) this._build(this.cell); else this.refreshEmpty(); });
    events.on('progression:completed',()=>this.refreshEmpty());
    events.on('army:changed', () => { if (this.cell) this._build(this.cell); });
  }

  _bindIdleActivity() {
    // Only real user input resets the countdown. Background simulation
    // updates/resources/build progress must NOT keep a selection open forever.
    const active=()=>Boolean(this.cell||this.empty);
    document.addEventListener('pointerdown',e=>{
      if (!active()) return;
      this._heldPointers.add(e.pointerId);
      this._markActive();
    },true);
    window.addEventListener('pointerup',e=>{
      this._heldPointers.delete(e.pointerId);
      if (active()) this._markActive();
    },true);
    window.addEventListener('pointercancel',e=>{
      this._heldPointers.delete(e.pointerId);
      if (active()) this._markActive();
    },true);
    document.addEventListener('pointermove',e=>{
      // Do not count idle mouse hover, only a genuine held mouse/touch drag.
      if (active() && e.buttons!==0) this._markActive();
    },true);
    document.addEventListener('wheel',()=>{
      if (active()) this._markActive();
    },{passive:true,capture:true});
    document.addEventListener('keydown',()=>{
      if (active()) this._markActive();
    },true);
    this.root.addEventListener('pointerenter',()=>{
      if (active()) this._markActive();
    });
    window.addEventListener('blur',()=>{
      this._heldPointers.clear();
      this._markActive();
    });
    document.addEventListener('visibilitychange',()=>{
      // Hidden tabs do not count as deliberate in-game inactivity.
      this._heldPointers.clear();
      this._markActive();
    });
    // Other HUD panels replace the contextual action ring rather than
    // leaving a stale floating building selection on top of them.
    document.addEventListener('rani:panel-opened',()=>{
      if(!active())return;
      if (this.empty) this.game.quickBuildMenu?.close();
      else this.game.selection?.clear();
    });
  }
  _markActive(){this.lastInteractionAt=performance.now();}
  /** Used by the frame loop and deterministic browser regression tests. */
  _expireIfIdle(now=performance.now()){
    if ((!this.cell && !this.empty) ||
        document.hidden || this._heldPointers.size ||
        this.game.mode==='world') return false;
    if(now-this.lastInteractionAt<this.idleTimeoutMs)return false;
    // Closing the view cannot cancel/pause any BuildingSystem or research job.
    if(this.empty)this.game.quickBuildMenu?.close();
    else this.game.selection?.clear();
    return true;
  }

  _hide() {
    this._heldPointers.clear();
    this.root.classList.add('hidden');
    this.root.innerHTML = '';
    this.anchor = null;
    this.buildingId = null;
    this._items = null;
  }

  // Called by the canvas pointerup immediately before opening a selected
  // building or blank-hex picker. Mouse and touch share PointerEvent click IDs.
  blockSyntheticActivation(pointerId) {
    this._blockedActivation={pointerId,until:performance.now()+450};
  }

  // Empty frontier hexes have exactly the same 3D action ring as buildings.
  // Six positions per page keep individual actions large enough for a finger.
  openEmpty(q,r) {
    if(!buildPlans(this.game,q,r).length)return false;
    this._markActive();
    this.cell=null;
    this.anchor=null;
    this.buildingId=null;
    this.empty={q,r};
    this.emptyPage=0;
    this._buildEmpty();
    return true;
  }
  closeEmpty() {
    if(!this.empty)return;
    this.empty=null;
    this.emptyPage=0;
    this._hide();
  }
  refreshEmpty(){if(this.empty)this._buildEmpty();}
  _emptyActions(){
    if(!this.empty)return [];
    const {q,r}=this.empty;
    const plans=buildPlans(this.game,q,r);
    const pages=Math.max(1,Math.ceil(plans.length/5));
    this.emptyPage=Math.min(this.emptyPage,pages-1);
    const slice=plans.slice(this.emptyPage*5,this.emptyPage*5+5);
    const actions=slice.map(plan=>({
      id:plan.id,
      icon:plan.building?(BUILDINGS[plan.building]?.icon||'build'):plan.type,
      label:plan.label,
      tip:'<b>'+plan.label+'</b><br>건설 비용: '+fmtCost(plan.cost)+
        (plan.reason?'<br><i class="tip-bad">'+plan.reason+'</i>':''),
      disabled:!plan.ok,
      closeAfter:true,
      run:()=>this.game.quickBuildMenu.applyPlan(q,r,plan.id)
    }));
    if(pages>1)actions.push({
      id:'next-page',icon:'build',label:'다음 '+(this.emptyPage+1)+'/'+pages,
      tip:'다른 지형 및 건설 선택지 보기',disabled:false,
      run:()=>{this.emptyPage=(this.emptyPage+1)%pages;this._buildEmpty();return false;}
    });
    return actions;
  }
  _buildEmpty(){
    if(!this.empty)return;
    const total=buildPlans(this.game,this.empty.q,this.empty.r).length;
    const count=Math.max(1,Math.ceil(total/5));
    this._renderRing(this._emptyActions(),'빈 땅',count>1?(this.emptyPage+1)+' / '+count:'건설 선택');
  }

  /** action list for a cell, derived from config + existing checks */
  _actionsFor(cell) {
    const bs = this.game.buildingSystem;
    const actions = [];

    // enemy tile → Reclaim (captured land, influence) and/or Attack (army)
    if (cell.owner && cell.owner !== 'player') {
      const terr = this.game.territorySystem;
      const army = this.game.armySystem;
      const key = `${cell.q},${cell.r}`;
      if (terr.captured.has(key)) {
        const cost = terr.reclaimCost;
        const affordable = (this.game.resourceSystem.resources.influence || 0) >= cost;
        actions.push({
          id: 'reclaim',
          icon: 'reclaim',
          label: '영토 회복',
          tip: `<b>영토 회복</b><br>비용: 영향력 ${cost}` +
            (affordable ? '' : '<br><i class="tip-bad">영향력이 부족합니다</i>'),
          disabled: !affordable,
          run: () => terr.reclaim(cell),
        });
      }
      if (army) {
        const check = army.canAttack(cell);
        const power = Math.round(army.strength);
        const defense = Math.round(army.defenseOf(cell));
        actions.push({
          id: 'attack',
          icon: 'sword',
          label: '공격',
          tip: `<b>영토 공격</b><br>내 병력: ${power} ⚔ 적 방어력 약 ${defense}` +
            `<br>보급 비용: ${fmtCost(ATTACK_SUPPLY_COST)} · 피해 발생 가능` +
            (check.ok ? '<br>승리하면 해당 영토를 차지합니다' : `<br><i class="tip-bad">${check.reason}</i>`),
          disabled: !check.ok,
          run: () => army.attack(cell),
        });
      }
      return actions;
    }

    // muster site → recruit units into the army
    const army = this.game.armySystem;
    if (army && army.isMusterSite(cell)) {
      for (const u of Object.values(UNIT_TYPES)) {
        const check = army.canRecruit(u.id);
        actions.push({
          id: `recruit_${u.id}`,
          icon: u.icon,
          label: u.name,
          tip: `<b>${u.name} 모집</b><br>${u.desc}` +
            `<br>모집 비용: ${fmtCost(u.cost)} · 전투력 +${u.strength}` +
            `<br>병력: ${Math.round(army.strength)} / 최대 ${Math.round(army.cap)}` +
            (check.ok ? '' : `<br><i class="tip-bad">${check.reason}</i>`),
          disabled: !check.ok,
          run: () => army.recruit(u.id, cell),
        });
      }
    }

    // manual village upgrade
    if (cell.tileType === 'village' && !bs.isVillageUpgraded(cell)) {
      const check = bs.canUpgradeVillage(cell);
      const inProgress = bs.isVillageUpgrading(cell);
      actions.push({
        id: 'village_upgrade',
        icon: VILLAGE_UPGRADE.icon,
        label: inProgress ? '승격 중…' : '승격',
        tip: `<b>${VILLAGE_UPGRADE.name}</b><br>${VILLAGE_UPGRADE.desc}` +
          `<br>비용: ${fmtCost(VILLAGE_UPGRADE.cost)} · ${VILLAGE_UPGRADE.buildTime}초` +
          `<br>조건: 인구 ${VILLAGE_UPGRADE.minPopulation}명 · 안정도 ${VILLAGE_UPGRADE.minStability} · 왕국 ${VILLAGE_UPGRADE.minTier + 1}단계 이상` +
          (check.ok || inProgress ? '' : `<br><i class="tip-bad">${check.reason}</i>`),
        disabled: !check.ok || inProgress,
        run: () => bs.upgradeVillage(cell),
        closeAfter: true,
      });
    }

    // in-place upgrades for completed buildings (tower chain)
    const rs = this.game.researchSystem;
    for (const b of bs.buildingsOn(cell)) {
      const cur = BUILDINGS[b.id];
      const target = cur?.upgradesTo ? BUILDINGS[cur.upgradesTo] : null;
      if (!target || (!b.done && !b.upgradeTo)) continue;
      // keep the wheel lean: reveal the upgrade once its research is done
      if (target.research && rs && !rs.isCompleted(target.research)) continue;
      const check = bs.canUpgradeBuilding(cell, b);
      actions.push({
        id: `upgrade_b${b.slot}`,
        icon: target.icon,
        label: b.upgradeTo ? '강화 중…' : `→ ${target.name}`,
        tip: `<b>시설 강화: ${cur.name} → ${target.name}</b><br>${target.desc}` +
          `<br>강화 비용: ${fmtCost(target.cost)} · ${Math.round(target.buildTime)}초` +
          (check.ok || b.upgradeTo ? '' : `<br><i class="tip-bad">${check.reason}</i>`),
        disabled: !check.ok || !!b.upgradeTo,
        run: () => bs.upgradeBuilding(cell, b),
        closeAfter: true,
      });
    }

    // buildings that fit this tile type
    const tileFull = bs.buildingsOn(cell).length >= MAX_BUILDINGS_PER_TILE;
    for (const def of Object.values(BUILDINGS)) {
      // Roads are removed from new village/world construction; legacy saves remain readable.
      if (def.isRoad) continue;
      if (!bs.fitsTile(def, cell)) continue;
      // keep the wheel lean: hide buildings whose research is not unlocked yet
      if (def.research && rs && !rs.isCompleted(def.research)) continue;
      const existing = bs.buildingsOn(cell).find((b) => b.id === def.id);
      // full tile: only show what is already built here (plus upgrades above)
      if (tileFull && !existing) continue;
      const check = bs.canBuild(cell, def.id);
      let label = def.name;
      if (existing) label = existing.done ? `${def.name} ✓` : '건설 중…';
      actions.push({
        id: def.id,
        icon: def.icon,
        label,
        tip: `<b>${def.name}</b><br>${def.desc}` +
          `<br>건설 비용: ${fmtCost(def.cost)} · ${Math.round(def.buildTime)}초` +
          (Object.keys(def.production).length
            ? `<br>생산량: ${fmtProduction(def.production)}/초` : '') +
          (def.capBonus ? `<br>저장 한도 +${def.capBonus}` : '') +
          (existing || check.ok ? '' : `<br><i class="tip-bad">${check.reason}</i>`),
        disabled: !!existing || !check.ok,
        run: () => bs.build(cell, def.id),
        closeAfter: true,
      });
    }
    return actions;
  }

  _build(cell) {
    const def = TILE_TYPES[cell.tileType];
    const towny = this.game.buildingSystem.isVillageUpgraded(cell);
    const pickedName = this.buildingId && BUILDINGS[this.buildingId]?.name;
    // Previously all unlocked actions were packed onto one circle. Research
    // can unlock >6 actions and cause untappable, overlapping mobile buttons.
    // Keep upgrades/current buildings ahead of optional construction choices.
    const existing = new Set(this.game.buildingSystem.buildingsOn(cell).map(b=>b.id));
    const all = this._actionsFor(cell).map((a,i)=>({
      ...a,order:i,priority:a.id.startsWith('upgrade_') || a.id==='village_upgrade' ? 0 :
        a.id.startsWith('recruit_') || existing.has(a.id) ? 1 :
        a.disabled ? 3 : 2
    })).sort((a,b)=>a.priority-b.priority||a.order-b.order);
    this.cellPages=Math.max(1,Math.ceil(all.length/PAGE_SIZE));
    this.cellPage=Math.min(this.cellPage,this.cellPages-1);
    const actions=all.slice(this.cellPage*PAGE_SIZE,this.cellPage*PAGE_SIZE+PAGE_SIZE);
    if(this.cellPages>1){
      actions.push({
        id:'next-cell-page',icon:'build',
        label:'다음 '+(this.cellPage+1)+'/'+this.cellPages,
        tip:'건물 건설·강화·모집의 다음 선택지 보기',
        disabled:false,
        run:()=>{
          this.cellPage=(this.cellPage+1)%this.cellPages;
          this._markActive();
          this._build(cell);
          return false;
        }
      });
    }
    this._renderRing(actions,pickedName || (towny ? '읍성' : (def ? def.name : cell.tileType)));
  }
  _renderRing(actions,title,subtitle='') {
    this.root.innerHTML = '';
    this._items = [];
    const center = document.createElement('div');
    center.className = 'radial-center';
    center.innerHTML =
      `<span class="radial-title">${title}</span>` +
      `<span class="radial-progress" id="radial-progress">${subtitle}</span>`;
    center.addEventListener('click', () => {
      if(this.empty)this.game.quickBuildMenu.close();
      else this.game.selection.clear();
    });
    center.setAttribute('data-tip', '15초 동안 조작이 없으면 자동 닫힘 · 눌러 닫기 (Esc)');
    center.setAttribute('role','button');
    center.setAttribute('tabindex','0');
    center.setAttribute('aria-label','육각 메뉴 닫기');
    center.addEventListener('keydown',e=>{
      if(e.key!=='Enter' && e.key!==' ')return;
      e.preventDefault();
      e.stopPropagation();
      if(this.empty)this.game.quickBuildMenu.close();
      else this.game.selection.clear();
    });
    this.root.appendChild(center);
    this._progressEl = center.querySelector('#radial-progress');

    const n = actions.length;
    actions.forEach((a, i) => {
      const btn = document.createElement('button');
      btn.className = 'radial-btn' + (a.disabled ? ' disabled' : '');
      btn.innerHTML = `<span class="radial-icon">${iconHtml(a.icon)}</span><span class="radial-label">${a.label}</span>`;
      btn.setAttribute('data-tip', a.tip);
      btn.dataset.actionId = a.id;
      btn.setAttribute('aria-label',a.label);
      btn.setAttribute('aria-disabled',String(!!a.disabled));
      if(a.id==='next-cell-page'||a.id==='next-page')btn.classList.add('radial-page-next');
      const angle = -Math.PI / 2 + (i / Math.max(n, 1)) * Math.PI * 2;
      btn.style.setProperty('--rx', `${Math.cos(angle) * RADIUS}px`);
      btn.style.setProperty('--ry', `${Math.sin(angle) * RADIUS}px`);
      btn.style.animationDelay = `${i * 0.03}s`;
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (btn.classList.contains('disabled')) return;
        const result = a.run();
        // A successful construction must keep its actual timer running, but
        // the contextual action menu should close without another click.
        if (a.closeAfter && result !== false) {
          if(this.empty)this.game.quickBuildMenu.close();
          else this.game.selection.clear();
        }
      });
      this.root.appendChild(btn);
      this._items.push({ action: a, btn });
    });

    this.root.classList.remove('hidden');
    this._place();
    this._refreshProgress();
  }

  /** re-evaluate disabled state without rebuilding DOM (smooth updates) */
  _refreshDisabled() {
    if ((!this.cell && !this.empty) || !this._items) return;
    const fresh = this.empty ? this._emptyActions() : this._actionsFor(this.cell);
    for (const item of this._items) {
      const a = fresh.find((x) => x.id === item.action.id);
      if (!a) continue;
      item.btn.classList.toggle('disabled', !!a.disabled);
      item.btn.setAttribute('aria-disabled',String(!!a.disabled));
      item.btn.setAttribute('data-tip', a.tip);
    }
  }

  /** Always project the ACTUAL selected building into viewport coordinates.
   * No CSS top override or offscreen clamp is permitted to shift its anchor.
   * Move the ACTIONS (not the selected-building marker) into the safe area.
   */
  _place() {
    if (!this.cell && !this.empty) return;
    if (this.anchor) this._worldPos.copy(this.anchor);
    else {
      const target=this.empty||this.cell;
      const { x, z } = axialToWorld(target.q, target.r);
      this._worldPos.set(x, TILE_H, z);
    }
    this.game.camera.updateMatrixWorld();
    this._screen.copy(this._worldPos).project(this.game.camera);
    const sx = (this._screen.x * 0.5 + 0.5) * window.innerWidth;
    const sy = (-this._screen.y * 0.5 + 0.5) * window.innerHeight;
    // Exact projected point. Even at the screen edge, never float a building's
    // information at a different/phantom hex.
    this.root.style.left = sx + 'px';
    this.root.style.top = sy + 'px';
    this.root.style.visibility = this._screen.z > -1 && this._screen.z < 1 ? 'visible' : 'hidden';
    const items=this._items||[];
    const n=items.length;
    if(!n)return;
    const mobile=window.innerWidth<=700;
    const left=35,right=window.innerWidth-35;
    const top=mobile?157:48,bottom=window.innerHeight-(mobile?85:42);
    const constrained=sx<left+125||sx>right-125||sy<top+125||sy>bottom-125;
    const toward=Math.atan2((top+bottom)/2-sy,(left+right)/2-sx);
    const span=constrained?Math.PI:Math.PI*2;
    const radius=constrained ? (mobile?123:124) : (mobile?86:RADIUS);
    items.forEach(({btn},i)=>{
      const angle=constrained?(toward-span/2+span*(i+.5)/n):(-Math.PI/2+span*i/n);
      let dx=Math.cos(angle)*radius,dy=Math.sin(angle)*radius;
      // Offscreen buttons can flip to the usable side without shifting the
      // label/marker from the selected building.
      const x=Math.max(left,Math.min(right,sx+dx));
      const y=Math.max(top,Math.min(bottom,sy+dy));
      btn.style.setProperty('--rx',(x-sx)+'px');
      btn.style.setProperty('--ry',(y-sy)+'px');
    });
  }

  /** construction progress of this tile's active works (center readout) */
  _refreshProgress() {
    if (!this.cell || !this._progressEl) return;
    const bs = this.game.buildingSystem;
    const parts = [];
    for (const b of bs.buildingsOn(this.cell)) {
      if (b.upgradeTo) {
        const pct = Math.round((1 - b.upRemaining / Math.max(b.upTotal, 0.01)) * 100);
        parts.push(`강화 ${pct}%`);
        continue;
      }
      if (b.done) continue;
      const pct = Math.round((1 - b.remaining / Math.max(b.total, 0.01)) * 100);
      parts.push(`${BUILDINGS[b.id]?.name || '시설'} 건설 ${pct}%`);
    }
    const key = `${this.cell.q},${this.cell.r}`;
    const up = bs.upgrading.get(key);
    if (up) {
      const pct = Math.round((1 - up.remaining / Math.max(up.total, 0.01)) * 100);
      parts.push(`승격 ${pct}%`);
    }
    // Show a useful building/tile summary when no construction is underway.
    // Full production details are available as an accessible native tooltip.
    let txt=parts.join(' ');
    const existing=bs.buildingsOn(this.cell);
    const chosen=this.buildingId ? existing.find(b=>b.id===this.buildingId) : null;
    if(!txt && chosen){
      const def=BUILDINGS[chosen.id];
      const production=Object.entries(def?.production||{}).filter(([,rate])=>rate>0);
      txt=production.length===1
        ? (RESOURCE_NAMES[production[0][0]]||production[0][0])+' +'+production[0][1]+'/초'
        : (chosen.done ? '완공' : '건설 중');
    }
    if(!txt)txt=existing.length
      ? '시설 '+existing.length+'/'+MAX_BUILDINGS_PER_TILE
      : '건설 가능';
    if (this._progressEl.textContent !== txt) this._progressEl.textContent = txt;
    if(this._progressEl.getAttribute('title')!==txt)this._progressEl.setAttribute('title',txt);
  }

  update() {
    if (!this.cell && !this.empty) return;
    if (this._expireIfIdle()) return;
    this._place();          // follows camera while open
    this._refreshProgress();
  }
}
