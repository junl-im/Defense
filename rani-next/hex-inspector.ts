import type { PlacedBuilding } from '../game/state';

/** Real 6-action building wheel. Native HTML/PNG/WebP/CSS, strictly no SVG. */
export interface RaniBuildingHooks {
  focus: (b: PlacedBuilding) => void;
  upgrade: (b: PlacedBuilding) => void;
  manage: (b: PlacedBuilding) => void;
  demolish: (b: PlacedBuilding) => void;
  getPoint: (b: PlacedBuilding) => [number, number];
  isPresent: (b: PlacedBuilding) => boolean;
  canDemolish: (b: PlacedBuilding) => boolean;
  upgradeCost: (b: PlacedBuilding) => { gold: number; stone: number } | null;
  maxHp: (b: PlacedBuilding) => number;
  isMatch: boolean;
}
export class RaniBuildingWheel {
  readonly root: HTMLDivElement;
  private card: HTMLDivElement;
  private modal: HTMLDivElement;
  private current: PlacedBuilding | null = null;
  private pending: PlacedBuilding | null = null;
  private anim = 0;
  private actionButtons = new Map<string, HTMLButtonElement>();
  constructor(private hooks: RaniBuildingHooks) {
    this.root = document.createElement('div');
    this.root.id = 'rani-hex';
    this.root.hidden = true;
    this.root.setAttribute('aria-label','건물 관리 메뉴');
    this.root.setAttribute('role','group');
    const ring=document.createElement('div');
    ring.className='rani-hex-ring';
    this.root.appendChild(ring);
    this.card=document.createElement('div');
    this.card.className='rani-hex-center';
    ring.appendChild(this.card);
    const actions=[
      ['info','정보','건물 설명 및 현재 상태'],
      ['upgrade','강화','석재와 금으로 건물 내구도 강화'],
      ['manage','관리','성문 열기·닫기 또는 작업 생산 품목 변경'],
      ['focus','이동','건물을 화면 중앙으로 이동'],
      ['demolish','철거','재확인 후 건물을 철거'],
      ['close','닫기','건물 메뉴 닫기'],
    ];
    actions.forEach(([key,label,title],i)=>{
      const button=document.createElement('button');
      button.type='button';button.className='rani-hex-action rani-hex-'+key;
      button.setAttribute('aria-label',label);button.title=title;
      button.textContent=label;
      button.dataset.action=key;
      button.dataset.index=String(i);
      ring.appendChild(button);
      this.actionButtons.set(key,button);
      button.addEventListener('click',e=>{
        e.preventDefault();e.stopPropagation();
        const b=this.current;
        if(!b||!this.hooks.isPresent(b)) {this.close();return;}
        if(key==='close'){this.close();return;}
        if(key==='info'){this.details();return;}
        if(key==='focus'){this.hooks.focus(b);this.details();return;}
        if(key==='upgrade'){this.hooks.upgrade(b);this.details();return;}
        if(key==='manage'){this.hooks.manage(b);this.details();return;}
        if(key==='demolish'){this.confirm(b);}
      });
    });
    this.modal=document.createElement('div');
    this.modal.id='rani-hex-confirm';this.modal.hidden=true;
    this.modal.setAttribute('role','dialog');this.modal.setAttribute('aria-modal','true');
    this.modal.setAttribute('aria-label','철거 확인');
    const panel=document.createElement('div');panel.className='rani-hex-confirm-panel';
    const heading=document.createElement('strong');heading.textContent='정말 철거하시겠습니까?';
    const copy=document.createElement('p');copy.className='rani-confirm-info';
    panel.append(heading,copy);
    const row=document.createElement('div');row.className='rani-confirm-actions';
    const cancel=document.createElement('button');cancel.type='button';cancel.textContent='취소';cancel.dataset.action='cancel';
    const yes=document.createElement('button');yes.type='button';yes.textContent='철거 확정';yes.dataset.action='confirm';
    row.append(cancel,yes);panel.append(row);this.modal.append(panel);
    cancel.addEventListener('click',()=>this.cancelConfirm());
    yes.addEventListener('click',()=>{
      const target=this.pending;
      this.cancelConfirm();
      if(target && this.hooks.isPresent(target) && this.hooks.canDemolish(target)){
        this.hooks.demolish(target);
        this.close();
      }
    });
    document.body.append(this.root,this.modal);
    document.addEventListener('keydown',ev=>{
      if(ev.key==='Escape' && !this.modal.hidden){ev.preventDefault();this.cancelConfirm();}
      else if(ev.key==='Escape' && !this.root.hidden){this.close();}
    });
  }
  open(b:PlacedBuilding):void {
    if(this.current===b && !this.root.hidden){this.close();return;}
    this.current=b;
    this.root.hidden=false;this.details();
    cancelAnimationFrame(this.anim);this.follow();
  }
  get selected():PlacedBuilding|null {return this.current;}
  close():void {
    this.cancelConfirm();
    this.root.hidden=true;this.current=null;
    cancelAnimationFrame(this.anim);
  }
  /** Global demolition tool uses this exact same non-destructive confirmation. */
  confirm(b:PlacedBuilding):void {
    if(!this.hooks.canDemolish(b))return;
    this.pending=b;
    this.modal.hidden=false;
    const info=this.modal.querySelector('.rani-confirm-info')!;
    info.textContent=b.def.label+'을(를) 철거합니다. 건축 자원 일부가 반환되며 되돌릴 수 없습니다.';
    const yes=this.modal.querySelector<HTMLButtonElement>('[data-action=confirm]');
    yes?.focus();
  }
  private cancelConfirm():void {this.pending=null;this.modal.hidden=true;}
  private details():void {
    const b=this.current;
    if(!b || !this.hooks.isPresent(b)){this.close();return;}
    // textContent only. Descriptions from content never become HTML.
    this.card.replaceChildren();
    const title=document.createElement('strong');title.textContent=b.def.label;
    const level=document.createElement('span');level.textContent='Lv.'+(b.raniLevel ?? 1);
    const state=document.createElement('small');
    state.textContent='내구도 '+Math.max(0,Math.floor(b.hp))+'/'+this.hooks.maxHp(b)
      +' · 작업자 '+b.staff+'/'+b.def.workers;
    const desc=document.createElement('p');
    desc.textContent=b.def.description ?? '왕국 시설';
    this.card.append(title,level,state,desc);
    const cost=this.hooks.upgradeCost(b);
    const upgrade=this.actionButtons.get('upgrade')!;
    upgrade.disabled= !cost || this.hooks.isMatch;
    upgrade.title=this.hooks.isMatch?'대전 중에는 강화할 수 없습니다.':
      cost?'금 '+cost.gold+' · 석재 '+cost.stone+'로 강화':'최대 강화 단계';
    const managed=this.actionButtons.get('manage')!;
    const manageOk=b.name==='gatehouse'|| !!b.def.alternate;
    managed.disabled=!manageOk;
    managed.title=b.name==='gatehouse'?'성문 열기/닫기':
      b.def.alternate?'생산품 변경':'관리 기능이 없는 시설입니다.';
    const demolish=this.actionButtons.get('demolish')!;
    demolish.disabled=!this.hooks.canDemolish(b);
    demolish.title=demolish.disabled?'필수 건물은 철거할 수 없습니다.':'확인 후 철거';
  }
  private follow=():void=>{
    const b=this.current;
    if(!b || this.root.hidden)return;
    if(!this.hooks.isPresent(b)){this.close();return;}
    const [x,y]=this.hooks.getPoint(b);
    // On small screens keep the entire six-action wheel visible.
    const width=Math.min(360,Math.max(280,window.innerWidth-16));
    const height=300;
    this.root.style.left=Math.round(Math.max(8,Math.min(window.innerWidth-width-8,x-width/2)))+'px';
    this.root.style.top=Math.round(Math.max(60,Math.min(window.innerHeight-height-8,y-height/2)))+'px';
    this.root.style.width=width+'px';
    this.anim=requestAnimationFrame(this.follow);
  }
}
