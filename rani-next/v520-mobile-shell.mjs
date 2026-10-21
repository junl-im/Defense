// v5.20: no changes to Fiefdom game rules, persistence schema or 2.5D art.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
const root=path.resolve(process.argv[2]||'engines/fiefdom');
function edit(rel,from,to){
 const file=path.join(root,rel),src=fs.readFileSync(file,'utf8');
 assert.equal(src.split(from).length,2,'v5.20 source drift '+rel+' '+from.slice(0,92));
 fs.writeFileSync(file,src.replace(from,to));
}
fs.copyFileSync(path.join(import.meta.dirname,'v520-mobile-shell.ts'),path.join(root,'src/ui/raniMobileShell.ts'));
edit('src/ui/menu.ts',
"export function showMenu(): Promise<MenuChoice> {",
"export function showMenu(): Promise<MenuChoice> {\n  installRaniMobileShell();");

const menu=path.join(root,'src/ui/menu.ts'),menuSource=fs.readFileSync(menu,'utf8');
assert.equal(menuSource.includes('export function showMenu(): Promise<MenuChoice> {'),true);
assert.equal(menuSource.includes("import { installRaniMobileShell } from './raniMobileShell';"),false);
fs.writeFileSync(menu,"import { installRaniMobileShell } from './raniMobileShell';\n"+menuSource);
const main=path.join(root,'src/main.ts'),mainSource=fs.readFileSync(main,'utf8');
assert.equal(mainSource.includes("import { setRaniExitHandler } from './ui/raniMobileShell';"),false);
fs.writeFileSync(main,"import { setRaniExitHandler } from './ui/raniMobileShell';\n"+mainSource);
edit('src/main.ts',
"  if (restore) applySave(restore);",
[
"  setRaniExitHandler(()=>{",
"    // Never claim a safe exit without a verified v5.18 save.",
"    if(mp)return '멀티플레이 중에는 자동 종료할 수 없습니다. 일시정지 메뉴를 이용해 주세요.';",
"    const error=writeAutosave(snapshot());",
"    if(error)return error;",
"    location.reload(); // native initial title, all data kept",
"    return null;",
"  });",
"  if (restore) applySave(restore);"
].join('\n'));
edit('src/ui/menu.ts',
"    ver.prepend(rkVersionInfo);ver.append(rkVersionPanel);",
"    // v5.20: keep only the version text. The popup and button are not mounted.");
edit('src/ui/menu.ts',"version.textContent='v5.19';","version.textContent='v5.20';");
edit('src/ui/menu.ts',"rkBuildName.textContent='라니킹덤 · v5.19';","rkBuildName.textContent='라니킹덤 · v5.20';");
fs.appendFileSync(path.join(root,'public/rani/skin.css'),'\n'+fs.readFileSync(path.join(import.meta.dirname,'v520-game-shell.css'),'utf8'));
console.log('PASS v5.20 right drag/contextmenu off, native game exit confirmation, full-screen gesture, footer version text only');
