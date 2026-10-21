// v5.14 title-only viewport layout and actionable bottom version info.
// Runs after v5.13, preserving region/lord decisions and all raster artwork.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=path.resolve(process.argv[2]||'engines/fiefdom');
function change(rel,before,after){
  const file=path.join(root,rel),src=fs.readFileSync(file,'utf8');
  assert.equal(src.split(before).length,2,'v5.14 source drift '+rel+': '+before.slice(0,75));
  fs.writeFileSync(file,src.replace(before,after));
}
change('src/ui/menu.ts',
"    root.classList.add('rk-title-v57');",
[
"    root.classList.add('rk-title-v57');",
"    // A genuine bottom-of-screen version-info control (not passive tiny text).",
"    // Existing .rk-public-version stays intact for regression checks.",
"    const rkVersionInfo=document.createElement('button');",
"    rkVersionInfo.id='rk-version-info-toggle';rkVersionInfo.type='button';",
"    rkVersionInfo.textContent='버전 정보';",
"    rkVersionInfo.setAttribute('aria-controls','rk-version-info-panel');",
"    rkVersionInfo.setAttribute('aria-expanded','false');",
"    const rkVersionPanel=document.createElement('section');",
"    rkVersionPanel.id='rk-version-info-panel';",
"    rkVersionPanel.hidden=true;",
"    rkVersionPanel.setAttribute('aria-label','버전 정보');",
"    const rkBuildName=document.createElement('strong');",
"    rkBuildName.textContent='라니킹덤 · v5.14';",
"    const rkBuildDetails=document.createElement('p');",
"    rkBuildDetails.textContent='모바일 첫 화면 맞춤 배치 · 버전 정보 최하단 정렬 · 실제 2.5D 왕국';",
"    const rkAttribution=document.createElement('a');",
"    rkAttribution.textContent='원본 및 저작권 정보';",
"    rkAttribution.href='/Defense/SOURCE-AND-ATTRIBUTION.txt';",
"    rkAttribution.target='_blank';rkAttribution.rel='noopener noreferrer';",
"    rkVersionPanel.append(rkBuildName,rkBuildDetails,rkAttribution);",
"    ver.prepend(rkVersionInfo);ver.append(rkVersionPanel);",
"    const rkCloseVersion=()=>{",
"      rkVersionPanel.hidden=true;",
"      rkVersionInfo.setAttribute('aria-expanded','false');",
"    };",
"    rkVersionInfo.addEventListener('click',()=>{",
"      const opening=rkVersionPanel.hidden;",
"      rkVersionPanel.hidden=!opening;",
"      rkVersionInfo.setAttribute('aria-expanded',String(opening));",
"    });",
"    root.addEventListener('pointerdown',event=>{",
"      const node=event.target as Node;",
"      if(!ver.contains(node))rkCloseVersion();",
"    });",
"    root.addEventListener('keydown',event=>{",
"      if(event.key==='Escape'&&!rkVersionPanel.hidden){rkCloseVersion();rkVersionInfo.focus();}",
"    });"
].join('\n'));
change('src/ui/menu.ts',"version.textContent='v5.13';","version.textContent='v5.14';");
fs.appendFileSync(path.join(root,'public/rani/skin.css'),'\n'+fs.readFileSync(path.join(import.meta.dirname,'v514-title-fit.css'),'utf8'));
console.log('PASS v5.14 viewport-first title and bottom interactive version info');
