/* v5.33 — Korean recovery for graphics-context failure; no save or engine mutations. */
(()=>{'use strict';
if(window.__rkBootGuard)return;window.__rkBootGuard=true;
let reported=false;
const isGraphics=(text)=>/webgl.*context|context.*webgl|error creating webgl/i.test(String(text||''));
function show(){
 if(document.getElementById('rk-webgl-fallback'))return;
 const box=document.createElement('section');box.id='rk-webgl-fallback';
 box.setAttribute('role','alertdialog');box.setAttribute('aria-modal','true');
 box.setAttribute('aria-labelledby','rk-webgl-title');
 box.setAttribute('aria-describedby','rk-webgl-help');
 const panel=document.createElement('div');panel.className='rk-webgl-panel';
 const emblem=document.createElement('span');emblem.className='rk-webgl-emblem';emblem.textContent='♜';emblem.setAttribute('aria-hidden','true');
 const title=document.createElement('h2');title.id='rk-webgl-title';title.textContent='왕국 화면을 열 수 없어요';
 const help=document.createElement('p');help.id='rk-webgl-help';
 help.textContent='2.5D 그래픽을 시작하지 못했습니다. 브라우저의 그래픽 가속을 켜거나 Chrome·Edge 최신 버전 또는 다른 기기에서 다시 시도해 주세요.';
 const saved=document.createElement('p');saved.className='rk-webgl-detail';
 saved.textContent='진행 상황과 저장 데이터는 삭제하지 않았습니다.';
 const actions=document.createElement('div');actions.className='rk-webgl-actions';
 const retry=document.createElement('button');retry.type='button';retry.textContent='다시 시도';
 retry.addEventListener('click',()=>location.reload());actions.append(retry);
 if(location.pathname.startsWith('/Defense/')){
  const old=document.createElement('a');old.href=new URL('legacy/',document.baseURI).href;
  old.textContent='이전 게임 화면';old.title='별도 구버전 게임으로 이동합니다. 저장 방식은 다를 수 있습니다.';
  actions.append(old);
 }
 panel.append(emblem,title,help,saved,actions);box.append(panel);document.body.append(box);
 retry.focus({preventScroll:true});
}
function failure(event){
 const parts=[event&&event.message,event&&event.error&&event.error.message,
  event&&event.reason&&event.reason.message,typeof(event&&event.reason)==='string'?event.reason:''];
 if(reported||!parts.some(isGraphics))return;
 reported=true;
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',show,{once:true});
 else show();
}
window.addEventListener('error',failure,true);
window.addEventListener('unhandledrejection',failure);
})();