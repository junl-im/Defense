# KingdomSeed v2.36.13 Mobile Readability Pass

## 목표

v2.36.9~v2.36.12에서 화면의 고급감과 톤을 올렸지만, 실제 모바일 화면에서는 글자와 버튼이 작고 얇아 보일 수 있었다. 이번 패치는 시각 장식보다 먼저 **시안성, 터치성, 전투 중 즉시 판독성**을 올리는 패스다.

## 핵심 원칙

- 첫 접속 속도와 Phaser/Firebase 지연 구조는 유지한다.
- 새 대용량 이미지, atlas, 사운드는 추가하지 않는다.
- 전투 중 무거운 아트 스트리밍 정책은 유지한다.
- 작은 텍스트와 버튼을 모바일 기준으로 보강하되 기존 레이아웃은 가능한 유지한다.
- 비교/QA를 위해 `?tinyui`, `?compactui`, `?legacyreadability` escape hatch를 제공한다.

## 주요 변경

### 1. 전역 모바일 가독성 유틸 추가

`src/game/MobileReadableUi.ts`를 추가했다.

- `readableFontSize()`
- `readableTextStyle()`
- `readableHitSize()`
- `improveReadableText()`
- `improveReadableTextTree()`
- `installSceneReadabilityPass()`

씬마다 흩어진 작은 텍스트를 안전하게 상향하고, 텍스트 stroke/shadow/resolution을 강화해 모바일 축소 렌더링에서도 잘 보이도록 한다.

### 2. 전투 HUD 가독성 보강

- 상단 생명/골드/웨이브 readout의 label/value 크기 증가
- 스테이지 배너와 하단 스킬 카드 라벨 크기 증가
- 전투 버튼 히트 영역 최소치를 상향
- 스킬 버튼/공세 정보/타워 선택 메뉴에 readability pass 적용
- 타워 선택/업그레이드/철거 패널의 작은 텍스트와 버튼 판독성 강화

### 3. 메뉴/월드맵/로그인 화면 가독성 보강

- 로그인 상태 텍스트와 버튼 라벨 크기 보정
- 로비 하단 주 버튼, 좌우 메뉴, 자원 표시 텍스트 최소 크기 보장
- 월드맵 OPERATION INTEL 패널의 스테이지 제목/설명/상태 글자 확대
- 월드맵 하단/상단 hotspot의 터치 영역 확대

### 4. 서브 씬 가독성 보강

- 연구소, 유물 제작, 영웅 전당, 임무 게시판, 도감, 메타 본부에 readability pass 적용
- 작은 설명문, 카드 제목, 보상 버튼, 하단 네비게이션 버튼의 최소 글자 크기와 stroke 강화
- 주요 버튼 hit area 최소값을 확대해 손가락 터치 실패를 줄임

## 성능 영향

- 이미지/사운드/atlas 추가 없음
- 정적 Text/Graphics 보정 중심
- tween, particle, streaming workload 추가 없음
- `setResolution`은 Text 선명도 보강 목적이며, 기존 텍스트 수를 폭증시키지 않는다.

## QA 체크리스트

1. 기본 접속 후 로그인 버튼 텍스트가 모바일에서 선명하게 보이는지 확인
2. 로비 하단 3개 큰 메뉴와 좌우 메뉴가 즉시 읽히는지 확인
3. 월드맵 우측 스테이지 정보와 시작 버튼이 손가락 크기로 눌리는지 확인
4. 전투 상단 생명/골드/웨이브/공세 시작 버튼이 축소되지 않는지 확인
5. 타워 건설 메뉴와 업그레이드 패널의 버튼 글자가 겹치지 않는지 확인
6. 연구소/도감/영웅/임무/유물 화면의 작은 설명문이 읽히는지 확인
7. 비교가 필요하면 `?tinyui` 또는 `?legacyreadability`로 기존 크기에 가깝게 확인

## 변경 파일

- `src/game/MobileReadableUi.ts`
- `src/game/BattleHudPrestige.ts`
- `src/scenes/GameScene.ts`
- `src/scenes/MenuScene.ts`
- `src/scenes/MainMenuScene.ts`
- `src/scenes/WorldMapScene.ts`
- `src/scenes/LabScene.ts`
- `src/scenes/ArtifactForgeScene.ts`
- `src/scenes/CodexScene.ts`
- `src/scenes/HeroHallScene.ts`
- `src/scenes/MissionBoardScene.ts`
- `src/scenes/MetaScene.ts`
- `src/runtime/Version.ts`
- `package.json`
- `package-lock.json`
- `index.html`
