/* Rani Kingdom v5.27 — native install prompt or platform-specific home shortcut.
   Does NOT change saving, login, game rules, or renderer.
   Chromium Android/desktop: beforeinstallprompt; iOS / others: short manual instructions.
*/
(()=>{
'use strict';
if(window.__rkInstallLoaded)return;window.__rkInstallLoaded=true;
let pending=null,button=null,dialog=null;
const root=()=>document.querySelector('#menu');
const standalone=()=>window.matchMedia?.('(display-mode: standalone)').matches===true||
                 window.navigator.standalone===true;
const isIOS=()=>/iPhone|iPad|iPod/i.test(navigator.userAgent)||
 /(Macintosh)/i.test(navigator.userAgent)&&navigator.maxTouchPoints>1;
const isAndroid=()=>/Android/i.test(navigator.userAgent);
const base=()=>new URL('./',document.baseURI);
const icon=()=>new URL('rani/icons/icon-64.png',base()).href;
const isSecure=()=>location.protocol==='https:'||location.hostname==='localhost'||location.hostname==='127.0.0.1';
function createGuide(){
 if(dialog)return dialog;
 dialog=document.createElement('section');
 dialog.id='rk-install-dialog';dialog.hidden=true;dialog.setAttribute('role','dialog');
 dialog.setAttribute('aria-modal','true');dialog.setAttribute('aria-labelledby','rk-install-title');
 const panel=document.createElement('div');panel.className='rk-install-panel';
 const heading=document.createElement('h2');heading.id='rk-install-title';
 heading.textContent='라니킹덤 바로가기';
 const image=document.createElement('img');image.src=icon();image.alt='라니킹덤 성곽·왕관 앱 아이콘';
 image.width=68;image.height=68;
 const description=document.createElement('p');
 description.id='rk-install-description';
 const buttons=document.createElement('div');buttons.className='rk-install-controls';
 const exit=document.createElement('button');exit.type='button';exit.textContent='닫기';
 exit.onclick=hide;
 const shortcut=document.createElement('button');shortcut.type='button';
 shortcut.textContent='PC 바로가기 파일';shortcut.className='rk-url-download';
 shortcut.onclick=()=>{
   const url=new URL('./',document.baseURI).href;
   const ico=new URL('rani/icons/favicon.ico',base()).href;
   const content='[InternetShortcut]\r\nURL='+url+'\r\nIconFile='+ico+'\r\nIconIndex=0\r\n';
   const blob=new Blob([content],{type:'application/octet-stream'});
   const href=URL.createObjectURL(blob);const anchor=document.createElement('a');
   anchor.href=href;anchor.download='라니킹덤.url';document.body.append(anchor);
   anchor.click();anchor.remove();setTimeout(()=>URL.revokeObjectURL(href),1200);
 };
 buttons.append(shortcut,exit);panel.append(image,heading,description,buttons);
 dialog.append(panel);document.body.append(dialog);
 dialog.addEventListener('click',event=>{if(event.target===dialog)hide();});
 document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!dialog.hidden)hide();});
 return dialog;
}
let focusBack=null;
function hide(){
 if(!dialog)return;dialog.hidden=true;
 if(focusBack?.isConnected)focusBack.focus();
}
function guide(){
 const d=createGuide();
 const p=d.querySelector('#rk-install-description');
 p.textContent=isIOS()
  ? 'Safari의 공유 버튼을 누른 뒤 「홈 화면에 추가」를 선택하세요. 홈 화면에서 라니킹덤 아이콘으로 실행할 수 있습니다.'
  : isAndroid()
  ? 'Chrome 메뉴(⋮)에서 「앱 설치」 또는 「홈 화면에 추가」를 선택하세요. 브라우저에 따라 메뉴 이름이 다를 수 있습니다.'
  : 'Chrome 또는 Edge의 주소창 설치 아이콘이나 메뉴에서 「앱 설치」 또는 「바로가기 만들기」를 선택하세요. 아래 PC 바로가기 파일을 받아서 실행해도 됩니다.';
 d.querySelector('.rk-url-download').hidden=isIOS()||isAndroid();
 focusBack=button;d.hidden=false;d.querySelector('button:not([hidden])')?.focus();
}
async function install(){
 if(standalone())return;
 if(pending){
   const prompt=pending;pending=null;
   try{await prompt.prompt();await prompt.userChoice;}catch{guide();}
   return;
 }
 guide();
}
function mount(){
 if(standalone())return;
 const first=document.querySelector('#rk-start-now');
 if(!first||document.getElementById('rk-install-shortcut'))return;
 const btn=document.createElement('button');
 btn.type='button';btn.id='rk-install-shortcut';btn.className='rk-install-shortcut';
 btn.setAttribute('aria-label','라니킹덤 홈 화면 바로가기 및 앱 설치');
 const img=document.createElement('img');img.src=icon();img.alt='';img.width=30;img.height=30;
 const text=document.createElement('span');text.textContent='앱 설치 · 바로가기';
 btn.append(img,text);btn.addEventListener('click',install);
 first.insertAdjacentElement('afterend',btn);button=btn;
}
window.addEventListener('beforeinstallprompt',event=>{
 event.preventDefault();pending=event;mount();
});
window.addEventListener('appinstalled',()=>{
 pending=null;if(button)button.hidden=true;hide();
});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});
else mount();
const watch=new MutationObserver(()=>{
 if(root()&&!standalone())mount();
});
watch.observe(document.documentElement,{subtree:true,childList:true});
if('serviceWorker'in navigator&&isSecure()){
 window.addEventListener('load',()=>{
  navigator.serviceWorker.register(new URL('rani-sw.js',base()).href,{scope:base().pathname})
   .catch(()=>{/* Browser shortcut still works without service worker. */});
 },{once:true});
}
})();