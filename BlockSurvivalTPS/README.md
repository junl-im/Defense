# 곰같은여우 — 라니블록 생존

**ALPHA 0.15 공식 게임명 ‘라니블록 생존’.** 방향별 피격·보행 모션·발자국 먼지·회피·재장전 HUD가 연동되는 경량 웹 TPS. 이전 라니킹덤은 `main`에서 정리했고 현재는 이 게임에 집중하여 개발·배포합니다. 최신 검증 결과와 빌드는 [Actions](https://github.com/junl-im/Defense/actions/workflows/block-survival-preview.yml) 참조. 브라우저에서 PC·모바일 실제 게임플레이 및 FPS 실측은 별도 검증이 필요합니다.

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
**더 간단한 실행:** 빌드 ZIP 안의 `라니블록_생존_바로실행.html`을 더블클릭하면 웹서버 설치 없이 기본 게임이 작동합니다. Chrome/Edge 같은 WebGL 지원 브라우저가 필요하며 7개 GLB는 빌드 ZIP에 포함되며 원본 파일을 못 찾으면 공식 저장소를 폴백합니다.

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

## v0.5 — 2026-10-30 도시 생존 전투 강화

- [실제 3D 폐허 디테일](./src/world-detail.mjs): 도로 균열, 잔해, 잡초, 녹슨 거리 소품, 외곽 폐차 배치. 대부분 인스턴싱으로 렌더링 호출 수 절감. 실제 이동 충돌을 가리지 않도록 격자 경계를 검사.
- [보급품 게임 규칙](./src/sim.mjs): 3킬마다 탄약 +18, 5킬마다 체력 +24 응급키트 드롭. 자동 줍기 반경, 18초 만료, 최대 12개 보급품. 체력이 가득 찼으면 응급키트 보관 가능.
- [피격·사격 연출](./src/game.mjs): 3D 탄도 궤적과 명중 섬광, 건물에 가려진 탄도는 실제 장면 벽까지 제한. 총구 FX 및 오리지널 Web Audio 단발 사격 효과.
- 오래된 중앙 안내 메시지는 3초 후 자동으로 사라져 한 화면의 전투 시야 확보. 모든 소품 및 버튼은 SVG 0개.
- [보급품 테스트](./tests/loot.test.mjs)와 PC/모바일 실제 Chromium WebGL 검증, 8출처·60 CC0 파일 원본 라이선스 검증을 기반으로 공개 반영. 현재 모델은 스타일화된 리깅 모델이며 실사형 그래픽은 별도 차기 작업.

## v0.6 — 경량 성능·군중 AI·반응형 전투

- [군중 충돌 회피](./src/sim.mjs): 살아 있는 최대 12마리의 좀비가 겹쳐서 한 덩어리로 보이지 않도록 반경 기반 분리. 기존 벽/엄폐물 충돌은 그대로 적용, 사망한 적은 군중 계산에서 제외.
- [적응형 해상도](./src/quality.mjs): 모바일·PC에서 FPS가 낮은 상태가 지속되면 렌더 해상도를 조금 줄이고, 성능이 회복되면 단계적으로 선명도를 복구. 즉시 변동을 억제해 화면 깜빡임 방지. 실제 기기 FPS 실측과 CPU 부하 최적화는 후속 작업.
- [사격 리깅 모션](./src/game.mjs): 연사 중 애니메이션이 프레임마다 Idle로 끊어지는 현상 줄임. 적이 사라질 때 애니메이션 믹서의 재생 상태를 정리하여 장시간 실행 시 불필요한 참조 감소.
- [모바일 가로 화면](./style.css): 낮은 높이 화면의 방향키·사격 버튼·HUD 간격 개선. [실제 Chromium 844×390 테스트](./tests/browser_qa.py) 추가.
- [회귀 테스트](./tests/performance-and-crowd.test.mjs): 군중 중첩·엄폐물 침범·사망한 적의 영향·최저 화질·회복 화질·일시정지 확인.
- 현대 생존자·좀비 CC0 모델 후보: Kenney Animated Characters Survivors. 공식 패키지는 FBX·PNG·SVG 혼합이므로 **라이선스 확인과 안전한 FBX→GLB 변환 및 SVG 제거 검증 전까지 게임에 포함하지 않음**.

## v0.7 — Kenney 현대 생존자·좀비 원본 FBX의 게임용 GLB 직접 변환

- 공식 [Kenney Animated Characters Survivors](https://kenney.nl/assets/animated-characters-survivors) CC0 자산을 Kenney 저자가 직접 공유한 [OpenGameArt 공식 게시물](https://opengameart.org/content/animated-characters-1)에서 원본 다운로드. 해당 ZIP SHA256 `9cc53e82c941781f26aa8fb39d40887cf14b1d74cca2d10ccc6e7c140a68f820` 고정.
- [Blender 원본 변환 파이프라인](./tools/convert-modern-blender.py)으로 기존 FBX 리깅 58뼈·메쉬 826폴리곤·PNG 컬러 스킨을 손상 없이 변환. `modernHero.glb` 272,284B, `modernZombie.glb` 292,052B, `modernRunner.glb` 274,008B, 각각 Idle·Run·Jump 3개 애니메이션. 배포 전에 각 GLB SHA256과 스킨·애니메이션 무결성을 검증.
- [검증된 바이너리와 출처](./runtime/PROVENANCE_MODERN.json)만 GitHub 저장, SVG 원본은 추출·배포하지 않음. 총 모델 12종 중 신형 3종을 게임에 우선 로드, 이전 KayKit 캐릭터는 로딩 장애 시 폴백.
- 오른손 `RightHand` 본에 Kenney 블라스터를 연결. 달리기·대기 애니메이션과 총 발사 시 짧은 반동을 연결. 신형 Kenney 팩 자체에는 총 사격·피격·사망 전용 클립이 없으므로 이 세 동작은 간단한 절차적 효과로 보완하며, 향후 새 동작 제작 예정.
- 기존 v0.6 좀비 군중 AI, A* 우회·보급품·PC/모바일 가로세로 HUD, 자동 렌더 품질을 모두 유지.

## v0.8 — 현대 생존자·좀비의 자체 절차적 전투 동작

- [애니메이션 계산기](./src/combat-pose.mjs): 원본 Kenney 팩이 제공하지 않는 동작에 대해 **독자적인 절차적 전투 연출**을 추가. 기존 FBX 애니메이션을 실제 사격·사망 클립인 것처럼 표기하지 않음.
- [리깅 캐릭터 연결](./src/game.mjs): 사격 직후 오른손의 총 반동, 재장전 중간에 총을 낮추는 효과, 양팔 견착 자세, 좀비 피격 순간 상체 흔들림·공격 시 전방 기울임·사망 시 부드러운 넘어짐.
- 상태 계산은 프레임 시간보다 시뮬레이션 속성 `shotFlash`·`reloadTime`·`hitTime`·`deadTime`에 의존. 이전 Kenney CC0 현대 모델 3종, 구 KayKit 폴백, 12 GLB, SVG 금지 유지.
- [회귀 테스트](./tests/combat-pose.test.mjs): 사격 이후 복구·장전 중간 동작·이상 입력·좀비 피격·사망/공격·상태 해제를 자동 검증. [브라우저 QA](./tests/browser_qa.py)에서 현대 리깅 및 전투 파이프라인 로딩 추가 확인.
- 휴대전화 실제 GPU FPS/발열은 미측정. 소프트웨어 WebGL CI 결과만으로 실기기 성능을 보증하지 않음.

## v0.9 — 공격 예고·타격 판정·피격 이펙트 연동

- [sim.mjs](./src/sim.mjs): 좀비 접근 후 즉시 체력 감소하는 문제를 변경. 근접 공격에 0.36초 예고, 타격 1회, 1.05초 후속 쿨다운 부여. 예고 도중 회피하거나 벽으로 시야가 차단되면 타격 취소.
- 원본 3종 현대 생존자/좀비 GLB를 유지하면서 [combat-pose.mjs](./src/combat-pose.mjs)의 공격 동작을 `attackWindup` / `attackPulse`와 동기화. 애니메이션과 실제 체력 감소 프레임 연결.
- [game.mjs](./src/game.mjs): 총알 명중 시 재사용 3D 파편, 적 처치 시 황금색 파편, 실제 피해 발생 시 카메라 소폭 흔들림/화면 빨강, 사격 명중과 처치 연속 보너스, 재장전·피격·경고 관련 WebAudio 효과 연결.
- UI는 SVG 없이 CSS 텍스트만으로 처치 점수/연속 콤보와 공격 경고 표시. 모바일에서는 경고가 버튼을 가리지 않도록 위치 조절. 시각 효과와 오디오 이벤트는 최대 32건 큐로 제한하고 소스 렌더링은 재사용.
- 처치 후 5.2초 동안 추가 처치하면 연속 점수 상승(최대 +100 보너스). 단위 시험에서 피격 타이밍, 회피 취소, 벽 충돌, 정지, 처치 중 공격 취소, 콤보 만료를 검사.
- Kenney·KayKit·Gobkit CC0 12 GLB / Three.js MIT 그대로, SVG 0개. Chrome SwiftShader PC/모바일 회귀 테스트를 진행하며 실기기 GPU 장시간 FPS는 별도 검사 대상.

## v0.10 — 공격 패턴 다양화, 위험표시, 폭발 상호작용

- 종류별 공격이 실제로 구분된다: 러너(준비 0.24초·9 피해·회복 0.84초), 일반 좀비(준비 0.36초·12 피해·회복 1.05초), 미니언/브루트(준비 0.56초·17 피해·회복 1.42초). 각 타입 준비·타격 거리는 별도. 가까이 있는 적의 **지면 경고 링**이 실제 공격 준비 시간에 맞춰 줄어든다.
- [sim.mjs](./src/sim.mjs): 총으로 쏴서 터뜨리는 드럼통 3개, 거리 4.25의 폭발 범위, 135 데미지(적), 근거리 플레이어는 최대 22 피해, 건물 뒤 엄폐 시 폭발 피해 제외. 폭발 사슬 반응은 반복 폭발되지 않도록 처리하고 재시작 시 원상 복원.
- [game.mjs](./src/game.mjs): 원형 드럼통 자체 Three.js 로우폴리 모델·3개 재사용 폭발 효과·충격/깊은 효과음·모바일 짧은 진동(지원 시). 고정 구조물과 지형을 관통하는 명중/폭발은 판정하지 않음.
- [combat-pose.mjs](./src/combat-pose.mjs): 러너·일반·브루트의 각각의 공격 준비 시간과 상체 움직임을 실제 판정과 맞춤. [단위 회귀](./tests/v010-combat.test.mjs)와 PC·모바일 브라우저 3종 QA 추가.
- 원본 라니킹덤 브랜치 보존, 12종 CC0 런타임 GLB 그대로, SVG 0개, 무료 브라우저 플레이 유지.

## v0.11 — 사격 모드와 전투 연동 세부 강화

- 정밀 모드: 사격 간격 0.19초, 일반 적 피해 46, 러너 피해 55, 드럼통 피해 46. 속사 모드: 사격 간격 0.105초, 일반 적 피해 27, 러너 피해 31, 드럼통 피해 27. **기존 총기 1종의 두 사격 모드**로 구현하며 무기 모델 2개가 추가된 것처럼 주장하지 않음.
- PC: 1 정밀·2 속사·Q 전환. 모바일: 상단 작은 모드 버튼으로 동일 기능. 현재 공용 탄창 12발·예비 탄약 유지, 재장전 완료와 처치 점수 기존 규칙 유지.
- 정밀 사격은 더 강한 총성과 카메라 반동, 속사 사격은 낮은 발사음·작은 카메라 반동으로 구분. 시뮬레이션 실제 shotCooldown, 피해량과 화면 피드백 모두 같은 모드 사용.
- 폭발 후 지면을 따라 퍼지는 추가 충격파 원형 메쉬 3개를 미리 만들어 재사용. SVG 없음, 원본 12개 CC0 GLB 유지.

## v0.12 — 액션·피격·잔해 추가 및 재장전 HUD

- 탄피 배출: 성공적으로 총알 발사한 순간 오른쪽으로 황동 탄피 1개, 낙하·바닥 반발 표시. 저폴리 CylinderGeometry 12개 재사용, 외부 자산 없음.
- 폭발 잔해: 실제 폭발 이벤트 좌표에서 작은 다면체 조각 12개, 중력/회전/크기 감쇠. 최대 24개 순환 재사용. 폭발 피해는 기존 엄폐/반경 판정만 따름.
- 방향별 피격: 총알 방향과 폭발 중심에서 밀려나는 방향을 기록, GLB 좀비 상체 앞뒤·좌우 기울임 반영.
- 공격 저지: 공격 준비 중 유효 명중 시 공격 1회 취소, 0.48초 이상 재진입 지연. 적당 1.35초 저지 면역을 주어 속사 무한 경직 방지. 탄약/피해량 규칙은 유지.
- 재장전 HUD: 탄약 하단에 1.35초 기준 진행률/퍼센트 표기, 일시정지 중 진행하지 않음.
- 전부 기존 Three.js 저폴리/CSS 원본 효과, SVG 0개, CC0 GLB 12종 유지.

## v0.15 — 2026-10-30 라니블록 생존 게임명 확정·발걸음 디테일

- 공식 표기 **라니블록 생존**, 브라우저 제목, SNS 메타 제목, 첫 화면 한글 로고, 웹 실행 안내 파일을 통일.
- 기존 BlockSurvivalTPS/ 개발 폴더와 https://junl-im.github.io/Defense/ 배포 주소를 유지해 링크·기존 배포 이력을 보호.
- 실제 캐릭터 이동 중 대퇴골 보행 위상에 맞춰 밟는 발마다 작은 돌먼지 2개를 재활용 입자 풀에서 표시. 정지·벽 충돌·아직 걷지 않는 경우 먼지 없음.
- [v0.15 발걸음 테스트](./tests/v015-footstep.test.mjs)와 PC 실제 이동 중 파티클 생성 브라우저 검증을 추가. SVG 사용 금지 및 Kenney/KayKit 원본 라이선스 유지.
