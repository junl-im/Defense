// v5.23: Korean notifications and building hover at native generation points,
// with a single desktop construction/menu cluster. No economy/save changes.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=path.resolve(process.argv[2]||'engines/fiefdom');
const p=rel=>path.join(root,rel);
function patch(rel,from,to){
 const file=p(rel),s=fs.readFileSync(file,'utf8');
 assert.equal(s.split(from).length,2,'v5.23 source drift: '+rel+' '+from.slice(0,85));
 fs.writeFileSync(file,s.replace(from,to));
}
function prepend(rel,imp){
 const file=p(rel),s=fs.readFileSync(file,'utf8');
 assert.ok(!s.includes(imp),'duplicate import '+rel);
 fs.writeFileSync(file,imp+s);
}
fs.copyFileSync(path.join(import.meta.dirname,'v523-native-korean.ts'),p('src/ui/raniKoreanText.ts'));
prepend('src/game/state.ts',"import { raniKoText } from '../ui/raniKoreanText';\n");
prepend('src/ui/hud.ts',"import { raniKoText, raniKoTooltip } from './raniKoreanText';\n");
prepend('src/main.ts',"import { raniKoText } from './ui/raniKoreanText';\n");
patch('src/game/state.ts',
 "    const last = this.notices[this.notices.length - 1];",
 "    text = raniKoText(text); // Korean for both notices and spoken messages\n    const last = this.notices[this.notices.length - 1];");
patch('src/ui/hud.ts',
 "          .map(([r, n]) => \`\${n} \${r}\`).join(', ') || 'free';",
 "          .map(([r, n]) => \`\${RESOURCE_LABELS[r as Resource]||r} \${n}\`).join(' · ') || '무료';");
patch('src/ui/hud.ts',
 "          b.title += '\\nTurns: press , or . with it in hand';",
 "          b.title += '\\n배치 중 , 또는 . 키로 건물 방향 전환';");
patch('src/ui/hud.ts',
 "      const html = \`<div class=\"t\${foe ? ' foe' : ''}\">\${title}</div>\`",
 "      const html = \`<div class=\"t\${foe ? ' foe' : ''}\">\${raniKoText(title)}</div>\`");
patch('src/ui/hud.ts',
 "               + (sub ? \`<div class=\"s\">\${sub}</div>\` : '');",
 "               + (sub ? \`<div class=\"s\">\${raniKoTooltip(sub)}</div>\` : '');");
patch('src/ui/hud.ts',"    this.ghost.textContent = text;",
 "    this.ghost.textContent = raniKoText(text);");
patch('src/ui/hud.ts',
 "      if (el.textContent !== it.text) el.textContent = it.text;",
 "      const ko=raniKoText(it.text);if (el.textContent !== ko) el.textContent = ko;");
patch('src/main.ts',
 "          rkQuickNote.textContent=def.label+' · 현재 설치 불가: '+real.reason;",
 "          rkQuickNote.textContent=def.label+' · 현재 설치 불가: '+raniKoText(real.reason);");
patch('src/ui/menu.ts',"version.textContent='v5.22';","version.textContent='v5.23';");
patch('src/ui/menu.ts',"rkBuildName.textContent='라니킹덤 · v5.22';",
 "rkBuildName.textContent='라니킹덤 · v5.23';");
// Move the native #buildwrap instead of recreating building/category buttons.
// Desktop: stats remain at upper left, one compact dock at lower left.
// Phone/tablet touch pad keeps the existing build/pause handlers.
const dock = [
 "  if(!isTouchUi()){",
 "    const buildWrap=document.querySelector<HTMLElement>('#buildwrap');",
 "    const left=document.querySelector<HTMLElement>('#leftcol');",
 "    if(buildWrap&&left){",
 "      const dock=document.createElement('section');dock.id='rk-actions';",
 "      dock.dataset.open='false';dock.setAttribute('aria-label','건설과 메뉴 조작');",
 "      const row=document.createElement('div');row.className='rk-action-row';",
 "      const construct=document.createElement('button');construct.type='button';",
 "      construct.id='rk-build-toggle';construct.textContent='건설';",
 "      construct.setAttribute('aria-controls','buildwrap');construct.setAttribute('aria-expanded','false');",
 "      const menu=document.createElement('button');menu.type='button';",
 "      menu.id='rk-pause-toggle';menu.textContent='메뉴';",
 "      const shut=()=>{dock.dataset.open='false';construct.setAttribute('aria-expanded','false');hud.openCategory(null);};",
 "      construct.onclick=()=>{const open=dock.dataset.open!=='true';",
 "        if(open){dock.dataset.open='true';construct.setAttribute('aria-expanded','true');hud.toggleBuild();}",
 "        else shut();",
 "      };",
 "      menu.onclick=()=>openPause();",
 "      row.append(construct,menu);dock.append(buildWrap,row);left.append(dock);",
 "      buildWrap.addEventListener('click',event=>{",
 "        if((event.target as HTMLElement).closest('#buildmenu button[data-name]'))shut();",
 "      });",
 "      document.addEventListener('keydown',event=>{",
 "        if(event.key.toLowerCase()!=='b'||event.ctrlKey||event.altKey)return;",
 "        const el=event.target as HTMLElement;",
 "        if(el.closest('input,textarea,select,[contenteditable=true]'))return;",
 "        const open=dock.dataset.open!=='true';dock.dataset.open=String(open);",
 "        construct.setAttribute('aria-expanded',String(open));",
 "      });",
 "    }",
 "  }"
].join('\n');
patch('src/main.ts',"  const hud = new Hud(state, placement);",
 "  const hud = new Hud(state, placement);\n"+dock);
// Source-truth name/cost hover labels include raw native resource keys otherwise.
patch('src/main.ts',"        text: want - b.staff === want ? 'no worker' : \`short \${want - b.staff}\`,",
 "        text: want - b.staff === want ? '일꾼 없음' : \`일꾼 \${want - b.staff}명 부족\`,");
fs.appendFileSync(p('public/rani/skin.css'),
 '\n'+fs.readFileSync(path.join(import.meta.dirname,'v523-one-side-dock.css'),'utf8'));
console.log('PASS v5.23 source Korean notices/build button/world tooltip + one-side controls');
