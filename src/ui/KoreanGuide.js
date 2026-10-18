// Korean first-play guide. Leaves game state, saves and timers untouched.
function mountGuide() {
  const trigger = document.getElementById('help-btn');
  if (!trigger || document.getElementById('ko-game-guide')) return;
  const overlay = document.createElement('div');
  overlay.id = 'ko-game-guide';
  overlay.className = 'ko-guide-overlay';
  overlay.hidden = true;
  overlay.innerHTML = `
    <section class="ko-guide-panel" role="dialog" aria-modal="true" aria-labelledby="ko-guide-title">
      <header class="ko-guide-head">
        <h2 id="ko-guide-title">라니킹덤 게임 방법</h2>
        <button type="button" class="ko-guide-close" aria-label="게임 방법 닫기">✕</button>
      </header>
      <p class="ko-guide-intro">한 칸의 마을에서 시작해 나만의 왕국을 키우세요.</p>
      <div class="ko-guide-step"><strong>1. 영토 확장</strong><span>PC에서는 오른쪽의 ‘영토 확장’, 모바일에서는 아래 ‘건설’을 누르세요. 지형을 고른 뒤 기존 땅 옆을 선택하면 설치됩니다.</span></div>
      <div class="ko-guide-step"><strong>2. 자원과 건축</strong><span>숲에서 목재, 농경지에서 식량을 얻습니다. 설치한 영토를 눌러 시설을 짓고 자원을 생산하세요.</span></div>
      <div class="ko-guide-step"><strong>3. 연구와 왕국 승격</strong><span>‘연구소’에서 기술을 배우고, 영토 수와 안정도를 높여 왕국 단계 ‘승격’을 진행하세요.</span></div>
      <div class="ko-guide-step"><strong>4. 병력과 세력전</strong><span>병영에서 병력을 모집하고 인접한 적 영토를 공격하세요. 전투 전 보급 자원도 확인하세요.</span></div>
      <div class="ko-guide-control"><b>PC 조작</b><span>마우스 휠 확대·축소 · 좌클릭/끌기 이동 · R 회전 · V 연결 변경 · Q/E 시점 회전 · 방향키 또는 W/A/S/D 지도 이동</span></div>
      <div class="ko-guide-control"><b>모바일 조작</b><span>화면 끌기 이동 · 두 손가락 확대·축소 · 아래 메뉴로 지도/건설/연구/세력/왕국 전환</span></div>
      <button type="button" class="ko-guide-start">왕국으로 돌아가기</button>
    </section>`;
  document.body.appendChild(overlay);
  const close = () => {overlay.hidden = true; trigger.focus();};
  const open = () => {overlay.hidden = false; overlay.querySelector('.ko-guide-close').focus();};
  trigger.addEventListener('click', open);
  overlay.querySelector('.ko-guide-close').addEventListener('click', close);
  overlay.querySelector('.ko-guide-start').addEventListener('click', close);
  overlay.addEventListener('click', (event) => {if(event.target === overlay)close();});
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !overlay.hidden) { event.preventDefault(); close(); }
  });
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mountGuide);
else mountGuide();
