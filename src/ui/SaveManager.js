import { exportKingdom, importKingdom, validateBackup, undoImport, canUndoImport, MAX_BACKUP_BYTES } from '../systems/SaveBackups.js';

export class SaveManager {
  constructor(game) {
    this.game=game;
    this.button=document.getElementById('save-manager-btn');
    if(!this.button) throw new Error('저장 관리 버튼이 없습니다.');
    const root=document.createElement('div');
    root.id='save-manager-overlay';
    root.className='save-manager-overlay';
    root.hidden=true;
    root.innerHTML=[
      '<section class="save-manager-dialog" role="dialog" aria-modal="true" aria-labelledby="save-manager-title">',
      '<header class="save-manager-head"><h2 id="save-manager-title">왕국 저장 관리</h2>',
      '<button class="save-manager-close" type="button" aria-label="닫기">✕</button></header>',
      '<p>내 왕국을 파일로 보관하거나, 백업 파일로 복원합니다.</p>',
      '<div class="save-manager-actions">',
      '<button type="button" id="save-export">⬇ 현재 왕국 백업</button>',
      '<button type="button" id="save-import">⬆ 백업 파일 복원</button>',
      '<button type="button" id="save-undo">↶ 이전 왕국 되돌리기</button>',
      '</div>',
      '<input id="save-import-file" type="file" accept=".json,application/json" hidden aria-label="왕국 백업 파일 선택" />',
      '<p class="save-manager-note">현재 왕국은 복원 전에 임시 보관됩니다. 파일은 내 기기에서만 처리되고 서버로 전송되지 않습니다.</p>',
      '</section>'
    ].join('');
    document.body.appendChild(root);
    this.root=root;
    this.chooser=root.querySelector('#save-import-file');
    this.undoButton=root.querySelector('#save-undo');
    this.button.addEventListener('click',()=>this.open());
    root.querySelector('.save-manager-close').addEventListener('click',()=>this.close());
    root.addEventListener('click',(e)=>{if(e.target===root)this.close();});
    document.addEventListener('keydown',(e)=>{if(e.key==='Escape'&&!root.hidden){e.preventDefault();this.close();}});
    root.querySelector('#save-export').addEventListener('click',()=>this.export());
    root.querySelector('#save-import').addEventListener('click',()=>this.chooser.click());
    this.chooser.addEventListener('change',()=>this.importFile());
    this.undoButton.addEventListener('click',()=>this.undo());
  }
  open() {
    this.undoButton.disabled=!canUndoImport();
    this.root.hidden=false;
    this.root.querySelector('.save-manager-close').focus();
  }
  close() {this.root.hidden=true;this.button.focus();}
  message(s) {this.game.ui.toast(s,3500);}
  export() {
    try {
      const raw=exportKingdom(this.game);
      const url=URL.createObjectURL(new Blob([raw],{type:'application/json;charset=utf-8'}));
      const a=document.createElement('a');
      a.href=url;
      a.download='왕국전략-저장-'+new Date().toISOString().slice(0,10)+'.json';
      document.body.appendChild(a);a.click();a.remove();
      setTimeout(()=>URL.revokeObjectURL(url),30000);
      this.message('왕국 백업 파일을 만들었습니다.');
    } catch(err) {this.message(err.message||'백업 실패');}
  }
  async importFile() {
    const file=this.chooser.files?.[0];
    this.chooser.value='';
    if(!file)return;
    if(file.size>MAX_BACKUP_BYTES){this.message('파일은 2MB 이하여야 합니다.');return;}
    try {
      const text=await file.text();
      const data=validateBackup(text);
      if(!window.confirm('현재 왕국을 영토 '+data.tilesPlaced+'칸의 백업으로 교체하시겠습니까?\n복원 전 기록은 되돌릴 수 있도록 보관합니다.'))return;
      importKingdom(text);
      location.reload();
    } catch(err){this.message('복원 실패: '+(err.message||'올바르지 않은 파일'));}
  }
  undo() {
    if(!window.confirm('복원 전 왕국으로 되돌리시겠습니까?'))return;
    try{undoImport();location.reload();}
    catch(err){this.message(err.message||'되돌리기 실패');}
  }
}
