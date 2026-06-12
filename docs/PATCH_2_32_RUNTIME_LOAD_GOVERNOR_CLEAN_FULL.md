# PATCH 2.32.0 - Runtime Load Governor + Clean Full Package

## 목표
- v2.31의 모바일 엔진 안정화 위에 런타임 로딩 거버너를 추가한다.
- 네트워크가 약한 휴대폰에서 PWA/Firebase/오디오/프리미엄 아트 작업이 첫 진입과 전투 진입에 겹치지 않도록 막는다.
- 모바일 전투 UI와 터치 영역을 더 크게 조정한다.
- 이번 릴리스부터 `.git`, `node_modules`, `dist`를 제외한 정리 통파일을 같이 배포한다.

## 핵심 변경
- `RuntimeLoadGovernor.ts` 신규 추가
  - 첫 부팅 quiet window 동안 선택형 네트워크 작업 차단
  - 씬 전환 직후 선택형 아트/오디오/PWA 작업 지연
  - 메모리 압박, 프레임 lockdown, pagehide, offline 이벤트에 반응해 선택 작업 중단
- `ProgressiveAssetLoader.ts`
  - 런타임 거버너와 연동
  - 세션 단위 progressive art 예산 추가
  - 씬이 바뀌거나 lockdown이면 로딩 큐가 즉시 fail-soft 처리
  - loader timeout 정리 보강
- `AudioManager.ts`
  - 안전/lockdown 엔진에서 shoot/hit 같은 고빈도 효과음의 중간 다운로드 차단
  - 오디오 파일이 아직 없을 때 첫 진입/전투 순간 네트워크 로딩이 끼어드는 문제 완화
- `PwaRuntime.ts`
  - 서비스워커 등록도 런타임 거버너가 허락할 때만 진행
  - 느린 네트워크/초기 quiet window에서는 뒤로 미룸
- `RuntimeFrameGovernor.ts`
  - 긴 프레임 스톨 감지 강화
  - lockdown class 호환 보강
- 전투 UI/UX
  - 건설 지점 터치 영역 확대
  - 타워 터치 영역 확대
  - 건설 메뉴/타워 패널 확대
  - 작은 전투 글자 확대
  - 모바일 버튼 hit 영역 확대
- 전투 장식 최적화
  - 저전력 모드에서는 전투 장식 오브젝트 수 축소
  - 저전력 모드에서는 시네마틱 프레임 motes/tween 일부 비활성화
  - 클릭 burst/패널 glint 반복 애니메이션 축소

## 테스트 옵션
- 기본 주소: 권장 모바일 테스트
- `?quality=low`: 강제 저사양 모드
- `?resetperf`: 저장된 lockdown 초기화
- `?ultraart`: 고성능 기기에서만 고퀄 원화 스트리밍 테스트
- `?nosw`: 서비스워커 제외 테스트

## 패키징
- Patch zip: 변경 파일만 포함
- Clean full zip: 전체 소스 + assets 포함, `.git`, `node_modules`, `dist`, 임시 작업물 제외

## 검증
- `npx tsc --noEmit --pretty false` 통과
- 현재 컨테이너의 기존 `node_modules`는 Vite 실행 권한과 Rolldown optional native binding 문제가 있어 `npm run build`는 의존성 재설치 후 확인 필요
