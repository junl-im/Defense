# 곰같은여우 — BLOCK SURVIVAL TPS

**ALPHA 0.4 실제 리깅 모델을 적용한 웹 TPS 시제품.** 이전 라니킹덤은 `main`에서 정리했고 현재는 이 게임에 집중하여 개발·배포합니다. 최신 검증 결과와 빌드는 [Actions](https://github.com/junl-im/Defense/actions/workflows/block-survival-preview.yml) 참조. 브라우저에서 PC·모바일 실제 게임플레이 및 FPS 실측은 별도 검증이 필요합니다.

## 보존 및 권리
- 게임 실행 파일: \`BlockSurvivalTPS/index.html\`, \`src/game.mjs\`, \`src/sim.mjs\`, \`style.css\`
- 신규 개발 브랜치: `feature/block-survival-tps-v02-post-cutover-20261029`. 이전 [PR #90](https://github.com/junl-im/Defense/pull/90)은 병합하지 않고 종료
- 라니킹덤 원본은 `archive/rani-kingdom-v539-20261029`에 백업. `main`과 GitHub Pages는 TPS로 전환했으며 구형 소스·워크플로는 제거
- 자체 게임 코드·기획: © 2026 곰같은여우. Three.js MIT / Gobkit·KayKit·Kenney CC0 원 라이선스는 각각 원 저작자에게 속합니다.
- SVG 자산/아이콘 금지. PC/모바일 모두 스크롤 없는 단일 화면, 우클릭·드래그 금지.

## 첫 플레이 범위
폐허 도시 3D 지형/엄폐물, 블록 생존자, WASD 이동·마우스 카메라·좌클릭 사격, R 장전/Shift 질주/ESC 일시정지, 모바일 좌측 조이스틱+우측 시점·사격·장전·질주 버튼, 추적형 좀비·주자·특수몹, 체력·탄약·피격 표시·처치·웨이브·재시작. WebGL 렌더러가 실패하면 경고를 보여줍니다.

기본 3D 지형·캐릭터만으로 실행 가능. **빌드시 원본 SHA에 고정된 Gobkit 미니언·박쥐, Kenney 총기, KayKit Dungeon 파손벽·상자·드럼통·적재상자 7개 GLB를 실제 빌드에 포함**해 외부 CDN 의존성을 줄였습니다. GLB 로드 실패 시 기본 블록 메시로 폴백. 애니메이션 해석은 [모델 실사 보고서](./research/MODEL_AUDIT_20261029_KO.md) 참조. **최종 인간형 좀비와 아트 퀄리티는 아직 미완료**입니다.

## 간단 실행
개발용 원본 (인터넷 필요, importmap과 CDN Three.js):
\`\`\`sh
cd BlockSurvivalTPS
python -m http.server 8000
# http://localhost:8000/
\`\`\`

외부 Three.js CDN을 포함하지 않는 **독립 빌드**:
\`\`\`sh
cd BlockSurvivalTPS
npm install
npm test
npm run build
cd dist
python -m http.server 8000
# http://localhost:8000/
\`\`\`
**더 간단한 실행:** 빌드 ZIP 안의 `BLOCK_SURVIVAL_TPS_바로실행.html`을 더블클릭하면 웹서버 설치 없이 기본 게임이 작동합니다. Chrome/Edge 같은 WebGL 지원 브라우저가 필요하며 7개 GLB는 빌드 ZIP에 포함되며 원본 파일을 못 찾으면 공식 저장소를 폴백합니다.

위의 GitHub Actions는 같은 빌드 후 \`block-survival-tps-playable-alpha-v01\` ZIP을 첨부합니다. 이를 다운로드·압축 해제한 뒤 \`START_HERE.txt\` 안내에 따라 로컬 서버를 실행할 수 있습니다. **CDN 없이 기본 게임 실행 가능**하며, 선택 원본 3D 모델은 인터넷이 연결될 때만 표시합니다.

## 현재 테스트와 제한
- [전투 규칙 자동 테스트](./tests/gameplay.test.mjs): 탄약·엄폐·체력·적 상한·웨이브 및 게임오버.
- [8개 CC0 원본 증빙](./research/source-lock.json) 및 [수집·라이선스 검사](./tools/acquire-open-assets.mjs): 8출처 60파일.
- [GitHub CI](../.github/workflows/block-survival-preview.yml): ES 모듈 구문 검사, 전투 테스트, 실제 번들 생성, 최소 정적 HTTP 응답, SVG 배제. 완료 상태는 실행 결과 확인 필요.
- AI는 단순 추적·가로막힘 시 X/Z 슬라이드 수준으로, 아직 경로탐색/정예 패턴 없음.
- 모바일 실기기 FPS/발열, 무기 손 장착·헤드샷·고급 애니메이션, 로컬/클라우드 세이브는 **아직 구현·검증되지 않음**. GitHub Pages 배포는 완료
- 모바일 30FPS/PC 60FPS 및 초기 로딩 3–8MB는 **목표**일 뿐 실측 보장 없음.

## 자료
- [8개 공식 CC0 출처·취득 내역](./research/ACQUISITION_STATUS_KO.md)
- [실물 GLB 구조 분석](./research/MODEL_AUDIT_20261029_KO.md)
- [오픈소스 자료 연구](./research/OPEN_SOURCE_ASSET_MASTER_KO.md)

## 2026-10-30 공개 전환 기준

- [TPS 공개 플레이](https://junl-im.github.io/Defense/) / [배포 Actions #40904114915](https://github.com/junl-im/Defense/actions/runs/40904114915) 성공
- [8출처 60개 CC0 ZIP](https://drive.google.com/file/d/1PSCD6B5_5fV4-0T6AAla6452lsZTDqxB/view) / [7개 GLB 포함 실행 ZIP](https://drive.google.com/file/d/1ZeOdVjeQRfJpv5HZonvWl4uQwAvEN_ih/view)
- 기존 라니킹덤 전체는 archive 브랜치에서만 복원 가능. 실제 PC/모바일 3D 렌더링·FPS 실측은 여전히 QA 필요.

## v0.3 — 2026-10-30 장애물 우회·조준·브라우저 실전 검증

- [경량 A* 경로탐색](./src/navigation.mjs): 경량 그리드, 캐싱, 벽·장애물 통과 방지, 재탐색. [회귀 테스트](./tests/navigation.test.mjs) 통과.
- 실제 카메라 중앙 조준점에서 조준 방향을 계산하고 시야가 열려 있는 적에게만 소범위 조준 보정. PC 마우스·모바일 터치 공통.
- 350~390px 좁은 모바일 화면에서 체력·탄약·웨이브 HUD 충돌 방지 및 터치 버튼 크기 개선.
- [Chromium 브라우저 QA](../../.github/workflows/block-survival-browser-qa.yml) — WebGL, 1280×720 데스크톱 마우스 사격, 390×844 모바일 터치 사격, HUD 중첩·스크롤 여부, 스크린샷·실행 오류 검사.
- [브라우저 QA 성공](https://github.com/junl-im/Defense/actions/runs/40963580690): PC/모바일 사격 시 탄약 12→11, 모바일 페이지 스크롤 0, HUD 겹침 0. 실제 소프트웨어 렌더러에서 프레임 성능은 낮을 수 있으므로 모바일 실기기 GPU FPS를 대표하지 않음.
- **한계:** A*는 정적 장애물용. 이동형 문·차량, 좀비 간 군중 회피, 현대적 캐릭터·자연스러운 리그 애니메이션은 다음 패치. 실기기 발열과 웹브라우저 다양성은 별도 QA 필요.

## v0.4 — 생존자·언데드 실제 3D 애니메이션 및 경량화

- [KayKit Adventurers](https://github.com/KayKit-Game-Assets) 리깅된 Knight 모델을 생존자 임시 모델로 사용. Idle, Walking_A, Running_A, 1H_Ranged_Shoot, 1H_Ranged_Reload, Hit_A 클립 6종만 보존. 시대·현대 생존자 아트는 아직 대체 모델 단계.
- KayKit Skeletons의 리깅된 Skeleton_Minion을 기본 좀비의 임시 언데드 모델로 사용. Idle_Combat, Walking_D_Skeletons, Running_A, Unarmed_Melee_Attack_Punch_A, Death_A, Hit_A 클립 6종만 사용. 기존 Gobkit minion은 개별 특별 몬스터로 유지.
- [자체 GLB 클립 경량화 도구](./tools/compact-glb.mjs)로 메쉬·스킨·이미지·선택 애니메이션의 참조만 남겨 모델 크기 절감. 모든 런타임 GLB SHA256 PROVENANCE 기록.
- Kenney blaster는 손뼈 `handslot.r`에 장착. 모델이 실패할 경우 종전 블록형 생존자·언데드 메시로 폴백.
- v0.3의 A* 우회 AI, 조준 및 모바일 HUD 검증은 유지. v0.4 공개 반영 전에 실제 Chrome WebGL 브라우저에서 모델·애니메이션 로딩 검증.

### v0.4 자동 검증

- [실물 GLB·Three.js 빌드 #40967123760](https://github.com/junl-im/Defense/actions/runs/40967123760): SUCCESS
- [Chromium WebGL·PC·모바일 #40967123674](https://github.com/junl-im/Defense/actions/runs/40967123674): SUCCESS. Knight와 언데드 GLB 실제 로딩, 사격, 한 화면 UI 검증. 소프트웨어 렌더러 FPS는 기기 GPU 성능 지표가 아님
- [공식 CC0 8개 출처 #40967123635](https://github.com/junl-im/Defense/actions/runs/40967123635): SUCCESS
- 압축형 Knight 3,659,532→630,020바이트, Skeleton_Minion 4,814,296→611,076바이트. 모두 필수 애니메이션 6종 보존, 전체 빌드 9 GLB 포함
- 현재 캐릭터는 CC0 판타지 아트 기반 임시 생존자·언데드 대역이며 현대식 최종 스타일은 아님
