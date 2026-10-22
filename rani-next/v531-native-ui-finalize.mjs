// v5.31: complete native Korean controls; retire obsolete CSS selectors.
// Source edits only: no simulation, serialization, IDs, raster files or saves touched.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
const root=path.resolve(process.argv[2]||'engines/fiefdom'),f=p=>path.join(root,p);
function replaceOne(file,from,to) {
 const filename=f(file),src=fs.readFileSync(filename,'utf8');
 assert.equal(src.split(from).length,2,'v5.31 source drift '+file+': '+from.slice(0,98));
 fs.writeFileSync(filename,src.replace(from,to));
}
replaceOne('src/ui/hud.ts',
 "        fsBtn.textContent = on ? 'Leave fullscreen' : 'Fullscreen';",
 "        fsBtn.textContent = on ? '전체 화면 종료' : '전체 화면';");
replaceOne('src/ui/hud.ts',
 "        esBtn.textContent = this.edgeScroll\n          ? 'Edge scrolling: on' : 'Edge scrolling: off';",
 "        esBtn.textContent = this.edgeScroll\n          ? '가장자리 스크롤 켜짐' : '가장자리 스크롤 꺼짐';");
replaceOne('src/ui/hud.ts',
 "      hd.querySelector('.tw')!.textContent = off ? 'show' : 'hide';",
 "      hd.querySelector('.tw')!.textContent = off ? '펼치기' : '접기';");
replaceOne('src/ui/hud.ts',
 "    rallyHint.textContent = 'New troops gather at the flag. '\n                          + 'Plant it on the map, or on the barracks to clear it.';",
 "    rallyHint.textContent = '새 병사는 집결 깃발로 이동합니다. 지도에서 위치를 선택하고 병영을 누르면 해제됩니다.';");
replaceOne('src/ui/hud.ts',
 "        const l = label.toLowerCase();\n        w2.textContent = `Build ${/^[aeiou]/.test(l) ? 'an' : 'a'} ${l} first.`;",
 "        w2.textContent = label + ' 건설 후 병사를 모집할 수 있습니다.';");
replaceOne('src/ui/hud.ts',
 "        b.textContent = kind === 'buy' ? 'Buy' : 'Sell';",
 "        b.textContent = kind === 'buy' ? '구매' : '판매';");
replaceOne('src/ui/hud.ts',
 "      buy.title = `Buy one now for ${price[0]} gold`;",
 "      buy.title = `자원 1개 즉시 구매 · 금 ${price[0]}`;");
replaceOne('src/ui/hud.ts',
 "      sell.title = `Sell one now for ${price[1]} gold`;",
 "      sell.title = `자원 1개 즉시 판매 · 금 ${price[1]}`;");
replaceOne('src/main.ts',
 "        state.notify('Patrol: right-click the far end of their beat', 'info');",
 "        state.notify('순찰할 끝 위치를 Ctrl+왼쪽 클릭으로 지정하세요.', 'info');");
// Preserve old native hidden DOM target for E2E while preventing a second visible Build control.
const begin=String.raw`
/* v5.31: never show the obsolete v5.1 trigger as a duplicate control.
   The legacy element remains in the DOM for existing hotkey/test compatibility. */
#rani-build-toggle {
  display:none!important;visibility:hidden!important;pointer-events:none!important
}
html:not(.phone):not(.touch) #rk-actions .rk-action-row button,
html.phone #pad .rk-touch-actions button {
  appearance:none;border:1px solid #d2ad76!important;border-radius:9px!important;
  background:linear-gradient(150deg,#4f7183,#1d374d 78%)!important;
  color:#ffedc8!important;text-shadow:0 1px 2px #06131d!important;
  box-shadow:inset 0 1px 0 #ffffff36,0 3px 10px #0008!important;
  font:800 12px/1.2 'Malgun Gothic','Apple SD Gothic Neo',sans-serif!important;
  transition:filter .12s ease,transform .12s ease,border-color .12s ease
}
html:not(.phone):not(.touch) #rk-actions #rk-build-toggle,
html.phone #pad .rk-touch-actions #rk-touch-build {
  background:linear-gradient(155deg,#e1b978,#956b38 65%,#664a2d)!important;
  border-color:#ffe0a3!important;color:#fff9e4!important
}
html:not(.phone):not(.touch) #rk-actions #rk-build-toggle[aria-expanded=true],
html.phone #pad #rk-touch-build.on {
  background:linear-gradient(150deg,#f3d69d,#bc914b)!important;
  color:#142c3d!important;box-shadow:0 0 0 2px #ffdf9f9e,0 2px 12px #0008!important
}
html:not(.phone):not(.touch) #rk-actions button:active,
html.phone #pad .rk-touch-actions button:active {transform:translateY(1px);filter:brightness(1.16)}
html:not(.phone):not(.touch) #rk-actions button:focus-visible,
html.phone #pad .rk-touch-actions button:focus-visible {outline:2px solid #fff1b5!important;outline-offset:2px}
html.phone #pad .rk-touch-actions {margin-left:auto;flex-wrap:nowrap}
html.phone #pad .rk-touch-actions button {white-space:nowrap}
#rk-quick-build button,#buildbar button,#buildmenu button,
#rk-hex-confirm button,#rk-first-steps button,#rk-harbor-panel button,
#rk-strategy-card button,.sheet button,#controls button {
  border-radius:8px;border-color:#bca075;color:#f7e5c2;
  -webkit-tap-highlight-color:transparent;touch-action:manipulation
}
#rk-quick-build button:disabled,#buildmenu button:disabled,
#controls button:disabled {opacity:.5;cursor:not-allowed}
@media(prefers-reduced-motion:reduce) {
  #rk-actions button,#pad button,#buildmenu button,#rk-quick-build button {transition:none!important}
}
`;
fs.appendFileSync(f('public/rani/skin.css'),'\n'+begin);
// Expose the effective final release marker in the title + footer.
replaceOne('src/ui/menu.ts',"version.textContent='v5.30';","version.textContent='v5.31';");
replaceOne('src/ui/menu.ts',"rkBuildName.textContent='라니킹덤 · v5.30';","rkBuildName.textContent='라니킹덤 · v5.31';");
console.log('PASS v5.31 native Korean dynamic controls, final unified button skin, legacy button hidden');