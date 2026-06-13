# KingdomSeed v2.36.30 QUALITY CHECK CONTROL PANEL

## 목적

v2.36.29에서 모바일 뒤로가기와 UI audit을 안정화한 뒤, 이번 패치는 디자인 체크 / 시스템 체크 / 기능 체크를 한 번에 확인하는 QA 점검 체계를 추가한다.

## 핵심 변경

- `QualityCheckDirector.ts` 추가
- 모든 `installSceneReadabilityPass` 적용 씬에 자동 설치
- 기본 모드에서는 조용히 `kingdom-seed:quality-check` 이벤트와 `window.__KINGDOM_SEED_LAST_QUALITY_CHECK__`만 갱신
- 검수 옵션을 켜면 게임 내부에 QA 패널 표시
- WebShell 뒤로가기 가드 상태를 `window.__KINGDOM_SEED_BACK_GUARD_STATUS__()`로 노출

## 체크 범위

### 디자인 체크

- 작은 글자 개수
- 작은 터치 영역 개수
- 텍스트 겹침 위험
- UI 밀도 모드(clean/focus/essential)
- readability root class
- high contrast fallback 준비 상태

### 시스템 체크

- viewport 크기
- 모바일 back guard arm 상태
- scene navigation bridge 상태
- localStorage 저장 가능 여부
- 네트워크/save-data 신호
- 메모리/코어 기반 약한 기기 신호
- emergency/safe fallback 상태

### 기능 체크

- reference thumbnail 로드 상태
- reference actor art 로드 상태
- reward pipeline asset 로드 상태
- action flow 사용 가능 상태
- 저장된 UI/디자인/시안성 토글 상태

## 새 검수 옵션

- `?qualitycheck`
- `?designcheck`
- `?systemcheck`
- `?featurecheck`
- `?checkpanel`
- `?qapanel`
- `?qahealth`
- `?noqualitycheck`
- `?legacyqualitycheck`

## 추천 점검 URL

- `/`
- `/?qualitycheck`
- `/?designcheck&systemcheck&featurecheck`
- `/?qualitycheck&navqa`
- `/?qualitycheck&referenceart&refevolution&rewardpipeline`

## 안전 정책

- BootScene 프리로드 증가 없음
- 새 이미지/atlas/sound 없음
- 기본 모드에서는 화면 표시 없이 이벤트만 발행
- QA 패널은 query flag가 있을 때만 표시
- 점검 실패는 게임 진행을 막지 않음
- 기존 UI audit / 뒤로가기 guard / reference fallback 흐름 유지
