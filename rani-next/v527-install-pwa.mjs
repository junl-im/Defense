// v5.27 — true installable Korean Rani PWA. Original game/saves untouched.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=path.resolve(process.argv[2]||'engines/fiefdom');
const project=path.resolve(import.meta.dirname,'..');
const p=rel=>path.join(root,rel);
const input=path.join(project,'assets/branding/rani-kingdom-app-icon.webp');
assert.ok(fs.existsSync(input)&&fs.statSync(input).size>2000,'Missing generated Rani icon');
const out=p('public/rani');
fs.mkdirSync(out,{recursive:true});
fs.copyFileSync(input,path.join(out,'rk_app_icon.webp'));
fs.copyFileSync(path.join(import.meta.dirname,'v527-app-install.js'),path.join(out,'app-install.js'));
fs.copyFileSync(path.join(import.meta.dirname,'v527-service-worker.js'),p('public/rani-sw.js'));
fs.appendFileSync(path.join(out,'skin.css'),'\n'+fs.readFileSync(path.join(import.meta.dirname,'v527-install.css'),'utf8'));
const manifest={
 name:'라니킹덤 — 왕국 전략게임',short_name:'라니킹덤',
 description:'성곽과 마을을 발전시키는 2.5D 왕국 전략게임',
 lang:'ko-KR',id:'/',start_url:'/',scope:'/',display:'standalone',
 orientation:'any',background_color:'#0c1e30',theme_color:'#17364e',
 categories:['games','strategy'],
 icons:[
  {src:'icons/icon-192.png',sizes:'192x192',type:'image/png',purpose:'any'},
  {src:'icons/icon-512.png',sizes:'512x512',type:'image/png',purpose:'any'},
  {src:'icons/icon-maskable-512.png',sizes:'512x512',type:'image/png',purpose:'maskable'}
 ],
 shortcuts:[{name:'왕국 시작',short_name:'게임 시작',description:'라니킹덤 플레이하기',
             url:'/',icons:[{src:'icons/icon-192.png',sizes:'192x192',type:'image/png'}]}]
};
fs.writeFileSync(path.join(out,'manifest.webmanifest'),JSON.stringify(manifest,null,2)+'\n');
const html=p('index.html');let s=fs.readFileSync(html,'utf8');
assert.ok(s.includes('</head>')&&s.includes('</body>')&&!s.includes('manifest.webmanifest'));
const links=[
  '<link rel="manifest" href="/rani/manifest.webmanifest">',
  '<link rel="icon" type="image/png" sizes="64x64" href="/rani/icons/icon-64.png">',
  '<link rel="icon" type="image/x-icon" href="/rani/icons/favicon.ico">',
  '<link rel="apple-touch-icon" sizes="180x180" href="/rani/icons/apple-touch-icon.png">',
  '<meta name="theme-color" content="#17364e">',
  '<meta name="application-name" content="라니킹덤">',
  '<meta name="apple-mobile-web-app-capable" content="yes">',
  '<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">'
].join('\n  ');
s=s.replace('</head>','  '+links+'\n  </head>');
s=s.replace('</body>','  <script defer src="/rani/app-install.js"></script>\n  </body>');
fs.writeFileSync(html,s);
const menu=p('src/ui/menu.ts');let ms=fs.readFileSync(menu,'utf8');
for(const [a,b] of [
 ["version.textContent='v5.26';","version.textContent='v5.27';"],
 ["rkBuildName.textContent='라니킹덤 · v5.26';","rkBuildName.textContent='라니킹덤 · v5.27';"]
]){
 assert.equal(ms.split(a).length,2,'v5.27 version drift '+a);ms=ms.replace(a,b);
}
fs.writeFileSync(menu,ms);
console.log('PASS v5.27 independent icon source, install button, PWA manifest and network-first worker');
