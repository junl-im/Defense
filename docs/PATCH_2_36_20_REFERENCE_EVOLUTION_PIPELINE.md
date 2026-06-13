# v2.36.20 REFERENCE EVOLUTION PIPELINE

## 목표

v2.36.19에서 사용자 제공 고퀄 UI 시안 콜라주를 no-text crop 런타임 자산으로 인입했다. v2.36.20은 이 자산을 단순 연결이 아니라 계속 확장 가능한 게임 아트 파이프라인으로 진화시킨다.

핵심 원칙은 유지한다.

- 글씨, 버튼 문구, UI 라벨이 포함된 원본 영역은 런타임 에셋으로 쓰지 않는다.
- 첫 접속, 첫 탭, BootScene에는 새 고퀄 자산을 싣지 않는다.
- 전투 중 무거운 actor art 스트리밍은 금지한다.
- 저사양, Save-Data, 느린 네트워크, runtime lockdown에서는 자동 생략한다.
- 실패 시 기존 2.5D / 코드 기반 fallback이 즉시 유지된다.

## 추가 자산

새 폴더:

- `public/assets/reference/v2_36_20/thumbs/`
- `public/assets/reference/v2_36_20/reference_evolution_manifest_v2_36_20.json`
- `public/assets/reference/v2_36_20/reference_evolution_contact_sheet_no_text.png`

추가 thumbnail:

- 타워 6종
- 몬스터 8종
- 영웅 5종
- 스킬 6종

이 썸네일들은 v2.36.19의 no-text crop에서만 파생되었고, generated frame에도 문자/라벨을 넣지 않았다.

## 코드 파이프라인

새 파일:

- `src/game/ReferenceAssetEvolution.ts`

역할:

- 작은 no-text thumbnail tier를 별도 관리
- lobby/world/gallery/codex/battle phase별 지연 로드
- WebP 우선, PNG fallback
- Save-Data, slow network, runtime lockdown 자동 생략
- battle phase에서는 idle-safe 조건을 지킨 뒤 로드
- ready 이벤트로 UI를 다시 그릴 수 있게 연결

## 화면 연결

### 전투

- `GameScene`에 v2.36.20 thumbnail tier 지연 로드 추가
- 타워 건설 메뉴에 reference thumbnail 연결
- 스킬 버튼 아이콘에 v2.36.20 thumbnail 우선 연결
- reference/evolution ready 이벤트를 공통 refresh hook에 연결

### 로비 / 월드맵

- menu/world 체류 중 작은 thumbnail tier를 조용히 선로드
- 이후 도감/영웅 전당/전투로 이동하면 바로 고퀄 preview를 쓸 수 있다.

### 영웅 전당

- 영웅 카드 portrait가 준비되면 v2.36.20 no-text thumbnail로 갱신
- 기존 portrait 또는 도형 fallback은 그대로 유지

### 도감

- 타워 도감 카드에 no-text tower thumbnail 연결
- 적 도감 카드에 no-text monster thumbnail 연결
- thumbnail이 없으면 기존 circle/symbol fallback 유지

## 새 QA 옵션

- `?refevolution`
- `?evolvedref`
- `?assetpipeline`
- `?referencepipeline`
- `?refthumbs`
- `?norefevolution`
- `?noevolvedref`
- `?norefthumbs`
- `?legacyrefpipeline`

권장 비교:

1. 기본 주소
2. `?refevolution`
3. `?norefthumbs`
4. `?referenceart&refevolution`
5. 느린 네트워크/Save-Data 모바일에서 자동 생략 확인

## 검증

- `npm ci` 성공
- `npm run build` 성공
- 정적 dist `/` HTTP 200 확인
- v2.36.20 WebP thumbnail HTTP 200 확인

기존 Phaser/Firebase 대형 청크 경고는 남아 있지만 빌드 실패가 아니다.
