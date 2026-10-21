// v5.18 save durability: report genuine browser quota failures and add
// non-destructive portable save JSON export/import. Existing keys are unchanged.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
const root=path.resolve(process.argv[2]||'engines/fiefdom');
function edit(rel,before,after){
 const filename=path.join(root,rel),source=fs.readFileSync(filename,'utf8');
 assert.equal(source.split(before).length,2,'v5.18 source drift '+rel+' '+before.slice(0,85));
 fs.writeFileSync(filename,source.replace(before,after));
}
edit('src/game/backend.ts',
"    try { localStorage.setItem(key, value); } catch { /* mirror is best-effort */ }\n    if (serverUp) { cache.set(key, value); void push(key, value); }",
[
"    // Static GitHub Pages has NO server. Quota/security write failures must",
"    // propagate: otherwise the save UI falsely reports success.",
"    if(!serverUp){localStorage.setItem(key,value);return;}",
"    try {localStorage.setItem(key,value);} catch(e){",
"      console.warn('[store] server backed, local mirror unavailable',e);",
"    }",
"    cache.set(key,value);void push(key,value);"
].join('\n'));
edit('src/game/save.ts',
"    store.setItem(KEY(slot), JSON.stringify(save));\n    return null;",
[
"    const data=JSON.stringify(save);",
"    store.setItem(KEY(slot),data);",
"    // Verify the exact written bytes, not merely that setItem returned.",
"    // A silent error must never make a save appear successful.",
"    if(store.getItem(KEY(slot))!==data)return '저장 내용을 다시 읽을 수 없습니다. 저장 공간을 확인하세요.';",
"    return null;"
].join('\n'));
edit('src/ui/pause.ts',
"  savedWhen, AUTOSAVE_INTERVAL, type SaveGame,",
"  savedWhen, AUTOSAVE_INTERVAL, upgrade, type SaveGame,");
edit('src/ui/pause.ts',
"  box.appendChild(ver);",
[
"  if (!hooks.match) {",
"    const rkImport=document.createElement('div');",
"    rkImport.id='rk-save-transport';",
"    const rkCaption=document.createElement('p');",
"    rkCaption.textContent='브라우저를 바꾸기 전 세이브 파일을 백업하세요. 가져오기는 새 슬롯에만 저장됩니다.';",
"    const rkPick=document.createElement('input');",
"    rkPick.id='rk-save-import-input';rkPick.type='file';",
"    rkPick.accept='.json,application/json';rkPick.hidden=true;",
"    const rkImportButton=document.createElement('button');",
"    rkImportButton.id='rk-save-import';rkImportButton.type='button';",
"    rkImportButton.textContent='세이브 파일 가져오기';",
"    rkImportButton.onclick=()=>rkPick.click();",
"    rkImport.append(rkCaption,rkImportButton,rkPick);",
"    box.appendChild(rkImport);",
"    rkPick.addEventListener('change',async()=>{",
"      const file=rkPick.files?.[0];rkPick.value='';",
"      if(!file)return;",
"      try {",
"        if(file.size>12*1024*1024)throw Error('12MB를 초과하는 파일은 가져올 수 없습니다.');",
"        const input=JSON.parse(await file.text());",
"        const parsed=upgrade(input);",
"        if('error' in parsed)throw Error('지원하지 않는 저장 버전: '+parsed.error);",
"        const save=parsed.save;",
"        if(!save.map||typeof save.map.name!=='string'||",
"           !Array.isArray(save.buildings)||!Array.isArray(save.factions)||",
"           !Array.isArray(save.soldiers)||!Array.isArray(save.felled)||",
"           !save.stock||typeof save.stock!=='object'||",
"           typeof save.savedAt!=='number'||!Number.isFinite(save.savedAt))",
"          throw Error('저장 파일 구조가 올바르지 않습니다.');",
"        const target=freeSlot();",
"        const error=writeSlot(target,save);",
"        if(error)throw Error(error);",
"        say('세이브를 '+target+'번 새 슬롯으로 가져왔습니다.');",
"        render();",
"      } catch(e){say('가져오기 실패: '+(e instanceof Error?e.message:String(e)),true);}",
"    });",
"  }",
"  box.appendChild(ver);"
].join('\n'));
edit('src/ui/pause.ts',
"      row.appendChild(loadBtn);\n\n      // A delete that needs a second click",
[
"      row.appendChild(loadBtn);",
"      if(info.save){",
"        const exportBtn=document.createElement('button');",
"        exportBtn.type='button';exportBtn.className='rk-save-export';",
"        exportBtn.textContent='백업';",
"        exportBtn.onclick=()=>{",
"          const json=JSON.stringify(info.save);",
"          const file=new Blob([json],{type:'application/json'});",
"          const url=URL.createObjectURL(file);",
"          const a=document.createElement('a');",
"          a.href=url;a.download='rani-kingdom-save-'+info.slot+'.json';",
"          a.style.display='none';document.body.appendChild(a);a.click();a.remove();",
"          setTimeout(()=>URL.revokeObjectURL(url),30000);",
"          say('세이브 '+info.slot+'번 백업 파일을 만들었습니다.');",
"        };",
"        row.appendChild(exportBtn);",
"      }",
"",
"      // A delete that needs a second click"
].join('\n'));
edit('src/ui/pause.ts',
"      row.style.gridTemplateColumns = '1fr auto auto auto';",
"      row.style.gridTemplateColumns = info.save ? 'minmax(0,1fr) repeat(4,auto)' : 'minmax(0,1fr) repeat(3,auto)';");
edit('src/ui/pause.ts',
"      row.append(who, loadBtn);\n      slotsWrap.appendChild(row);",
[
"      const backup=document.createElement('button');",
"      backup.type='button';backup.className='rk-save-export';",
"      backup.textContent='백업';",
"      backup.onclick=()=>{",
"        const blob=new Blob([JSON.stringify(info.save)],{type:'application/json'});",
"        const url=URL.createObjectURL(blob);",
"        const a=document.createElement('a');a.href=url;",
"        a.download='rani-kingdom-save-'+info.slot+'.json';",
"        a.style.display='none';document.body.appendChild(a);a.click();a.remove();",
"        setTimeout(()=>URL.revokeObjectURL(url),30000);",
"        say('자동 저장 '+info.slot+' 백업 파일을 만들었습니다.');",
"      };",
"      row.append(who, loadBtn,backup);",
"      row.style.gridTemplateColumns='minmax(0,1fr) repeat(2,auto)';",
"      slotsWrap.appendChild(row);"
].join('\n'));
edit('src/ui/menu.ts',"version.textContent='v5.17';","version.textContent='v5.18';");
edit('src/ui/menu.ts',"rkBuildName.textContent='라니킹덤 · v5.17';","rkBuildName.textContent='라니킹덤 · v5.18';");
fs.appendFileSync(path.join(root,'public/rani/skin.css'),'\n'+fs.readFileSync(path.join(import.meta.dirname,'v518-save.css'),'utf8'));
console.log('PASS v5.18 static save verification, file backup and safe new-slot import');
