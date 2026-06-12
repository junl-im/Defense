# KingdomSeed v2.36.2 Premium Battle Presentation Patch

## 목표

v2.35.8~v2.35.9에서 검수용 아이콘/스티커 아트를 전투 본편에 과하게 연결하면서 생긴 `초딩게임`, `작고 조잡한 화면`, `스티커 목업 느낌`을 본 게임 기본값에서 더 확실히 제거한다.

이번 패치는 새 대용량 이미지를 추가하지 않는다. 첫 시작 속도와 런타임 안정성을 유지하면서, 전장 구도와 오브젝트 체급을 코드 레벨에서 키운다.

## 주요 변경

- `src/game/PremiumBattlePresentation.ts` 추가
  - 정적 전장 프레젠테이션 레이어
  - 큰 지형 음영, 경로 언더레이, 중앙 액션 포커스, 상하단 안전 커튼, 스테이지 크레스트 추가
  - 무한 파티클/대용량 텍스처 없음
  - `?flatbattle`, `?plainbattle`, `?toydebug`로 비활성화 가능

- `src/scenes/GameScene.ts`
  - `installPremiumBattlePresentation()`를 `drawMap()` 직후에 설치
  - 건설 패드 체급 확대
  - 기본 이모지 망치 대신 프리미엄 룬 표시
  - 터치 히트 영역 확대
  - `?oldspots`로 예전 건설 포인트 스타일 복구 가능

- `src/game/BattleArtMode.ts`
  - 기본 Actor Scale 1.18 → 1.22
  - 타워/몬스터/영웅 표시 높이 상향
  - 이미 로드된 기존 스프라이트/원화풍 에셋 우선 정책 유지

- `src/game/PremiumBattleComposition.ts`
  - ENTRY/CORE 영어 라벨을 한국어 전장 라벨로 변경
  - 저전력에서도 너무 작게 보이지 않도록 라벨 크기 소폭 상향

## 성능 원칙

- BootScene 첫 시작 경로에는 새 에셋을 추가하지 않음
- 전투 진입 후에도 새 이미지 다운로드 없음
- 정적 Graphics 중심
- 기본 반복 트윈 없음
- 기존 Combat FX Governor/Runtime Cleanup 구조 유지

## QA 옵션

- `?flatbattle` 또는 `?plainbattle` : 프리미엄 전장 레이어 끄기
- `?toydebug` : v2.36.2 프리미엄 presentation과 rune spot 비활성화
- `?oldspots` : 예전 망치형 건설 포인트 사용
- `?compactactors` : 전투 오브젝트 크기 축소
- `?largeactors` / `?cinematicactors` : 더 큰 actor scale 검수
- `?largespots` / `?cinematicspots` : 건설 포인트 더 크게 검수
