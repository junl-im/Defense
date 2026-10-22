// v5.26 — Translate values generated anew by the original HUD every game tick.
// State keys, saved records, gameplay rules, asset ownership all remain unchanged.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=path.resolve(process.argv[2]||'engines/fiefdom');
const file=path.join(root,'src/ui/hud.ts');
let s=fs.readFileSync(file,'utf8');
let edited=0;
function replaceOnce(from,to){
 assert.equal(s.split(from).length,2,'v5.26 HUD source mismatch: '+from.slice(0,100));
 s=s.replace(from,to);edited++;
}
replaceOnce(
 "      const drift = Math.abs(rate) < 0.05 ? 'steady'\n        : rate > 0 ? (now >= 100 ? 'at its best' : 'rising')\n        : (now <= 0 ? 'at rock bottom' : 'falling');",
 "      const drift = Math.abs(rate) < 0.05 ? '유지'\n        : rate > 0 ? (now >= 100 ? '최고' : '상승')\n        : (now <= 0 ? '최저' : '하락');"
);
replaceOnce(
 "        : \` — \${mins < 1 ? 'under a minute' : \`about \${Math.round(mins)} min\`}\`;",
 "        : \` · \${mins < 1 ? '1분 미만' : \`약 \${Math.round(mins)}분\`}\`;"
);
replaceOnce(
 "        \`<h4>Popularity — \${now}, \${drift}</h4>\${rows}\` +",
 "        \`<h4>민심 \${now} · \${drift}</h4>\${rows}\` +"
);
replaceOnce(
 "        (eta ? \`<div class=\"hint\">\${rate > 0 ? 'Reaching 100' : 'Reaching 0'}\${eta}</div>\` : '');",
 "        (eta ? \`<div class=\"hint\">\${rate > 0 ? '민심 100 도달 예상' : '민심 0 도달 예상'}\${eta}</div>\` : '');"
);
replaceOnce(
 "      if (!rows) rows = '<tr><td class=\"dim\" colspan=\"4\">nothing produced yet</td></tr>';",
 "      if (!rows) rows = '<tr><td class=\"dim\" colspan=\"4\">아직 생산 내역이 없습니다.</td></tr>';"
);
replaceOnce(
 "        (led.warm ? '' : '<div class=\"hint\">measuring…</div>');",
 "        (led.warm ? '' : '<div class=\"hint\">생산량 측정 중…</div>');"
);
replaceOnce(
 "        const why = !src ? \`Build \${(BUILDINGS[t.from]?.label ?? t.from).toLowerCase()} first\`",
 "        const why = !src ? \`\${BUILDINGS[t.from]?.label ?? t.from} 건설이 필요합니다.\`"
);
replaceOnce(
 "          : s.idle < 1 ? 'No idle peasant to take up arms'",
 "          : s.idle < 1 ? '모집할 여유 주민이 없습니다.'"
);
replaceOnce(
 "          : s.gold < t.gold ? 'Not enough gold'",
 "          : s.gold < t.gold ? '모집할 금이 부족합니다.'"
);
replaceOnce(
 "          : !s.canAfford(t.cost) ? 'Not enough materials'",
 "          : !s.canAfford(t.cost) ? '모집할 장비·자원이 부족합니다.'"
);
// Recruitment cost is displayed as a string, so it must use visible resource
// labels, NEVER a raw English singular/plural helper or gold shorthand "g".
replaceOnce(
 "        .map(([r, n]) => \`\${n} \${one(r as Resource, n ?? 0)}\`).join(' + ');",
 "        .map(([r, n]) => \`\${RESOURCE_LABELS[r as Resource]} \${n}개\`).join(' · ');"
);
replaceOnce(
 "      price.textContent = \`\${t.gold}g\${goods ? ' + ' + goods : ''}\`;",
 "      price.textContent = \`금 \${t.gold}\${goods ? ' · ' + goods : ''}\`;"
);
replaceOnce(
 "        ? 'Gold and materials, taken from the stockpile.'\n        : 'Gold, plus kit taken off the armoury rack.';",
 "        ? '금과 자재 창고의 재료를 소비합니다.'\n        : '금과 무기고의 장비를 소비합니다.';"
);
replaceOnce("const one = goodName;", ""); // avoid noUnusedLocals error
replaceOnce("RESOURCE_BAR, FOOD_RESOURCES, goodName,","RESOURCE_BAR, FOOD_RESOURCES,");
// Recruitment instructions are static DOM, but they explain disabled buttons.
replaceOnce(
 "    hint.innerHTML = 'Click a soldier to select · <b>Shift-drag</b> for a box ·<br>'\n                   + 'Double-click to take every one of that kind · Right-click to move ·<br>'\n                   + '<b>H</b> to hold ground (defensive) or attack again';",
 "    hint.innerHTML = '병사를 클릭하여 선택 · <b>Shift+드래그</b>로 범위 선택<br>'\n                   + '더블클릭하면 같은 병종 모두 선택 · <b>Ctrl+클릭</b>으로 이동 지시<br>'\n                   + '<b>H</b>로 위치 사수·공격 전환';"
);
replaceOnce(
 "      b.textContent = lvl.label;",
 "      b.textContent = ({Paused:'일시정지',Pause:'일시정지',Slow:'느림',Normal:'보통',Fast:'빠름'} as Record<string,string>)[lvl.label]||lvl.label;"
);
replaceOnce(
 "        ? \`\${lvl.label} — \${lvl.mult}x speed\`\n        : \`\${lvl.label} — the world stops, the camera does not (Space)\`;",
 "        ? \`게임 속도 \${lvl.mult}배\`\n        : '게임은 정지하지만 화면은 이동할 수 있습니다. (Space)';"
);
fs.writeFileSync(file,s);
console.log('PASS v5.26 native live popularity/production/recruitment UI in Korean',{edited});
