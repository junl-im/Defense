# Kingdom Seed v2.30.0 Mobile Engine Optimization QA

## 목표

v2.30.0은 대용량 아트 추가보다 모바일 웹게임 런타임 구조를 우선 안정화하는 패치다. 첫 접속, 첫 탭, 로비 전환, 월드맵 전환, 전투 진입, 약한 네트워크, 저사양 모바일 GPU 상황에서 멈춤을 줄이는 것을 최우선으로 한다.

## 핵심 변경

- `MobileRuntimeEngine.ts` 추가
  - 모바일/저사양/느린 네트워크/데이터 절약 모드 감지
  - 안전 엔진, 균형 엔진, 프리미엄 아트 엔진 런타임 프로필 분리
  - 첫 9초 동안 아트/네트워크 경쟁을 줄이는 quiet boot budget 도입
  - 메모리 압박 이벤트와 visibility/pagehide 이벤트 연결
- `AssetMemoryManager.ts` 추가
  - 전투 진입 전 v2.16~v2.27 선택형 장식 텍스처를 정리
  - 프레임 스파이크/백그라운드/메모리 압박 시 선택형 텍스처 정리 이벤트 처리
- `ProgressiveAssetLoader.ts` 재조정
  - 기본 progressive art cap을 크게 축소
  - 기본 서비스 모드에서는 고퀄 아트 스트리밍 비활성화
  - `?ultraart`에서만 공격적인 프리미엄 아트 스트리밍 허용
  - `?fullart`는 감상용이어도 부팅 전체 선로드는 하지 않음
- `PerformanceMode.ts` 정책 강화
  - 모바일 기본값은 안전 엔진
  - 전투 중 premium static art 기본 금지
  - 프리로드는 `?ultraart` 또는 명시 플래그가 있을 때만 허용
- `AudioManager.ts` 최적화
  - 안전 엔진에서 반복 SFX 스팸을 제한
  - 느린 네트워크/데이터 절약 모드에서 BGM 볼륨과 로딩 부담 완화
- `BootScene.ts` 최적화
  - fast boot 병렬 다운로드를 더 보수적으로 제한
  - 첫 부팅에서 필요 없는 프리미엄/보상/갤러리 UI 이미지 추가 스킵
- `WebShell.ts` 보강
  - 첫 탭 직후 fullscreen/orientation 요청을 약간 늦춰 첫 전환 충돌 감소
  - 안전 엔진에서는 viewport resize burst를 줄임
- `PwaRuntime.ts` / `public/sw.js` 추가
  - 서비스 워커 등록을 첫 화면 이후 idle 시점으로 지연
  - 대용량 v2.24~v2.27 프리미엄 UI 폴더는 SW 런타임 캐시에서 제외
- `style.css`
  - 안전 엔진에서 canvas filter/탭 애니메이션 제거
  - 모바일 시작 카드 가독성 확대

## 운영 모드

- 기본 주소: 안전 엔진. 모바일/약한 네트워크 권장.
- `?quality=low`: 강제 절전 렌더.
- `?fast` 또는 `?lite`: 강제 빠른 시작.
- `?fullart`: 갤러리 확인용. 단, v2.30부터 부팅 선로드는 하지 않는다.
- `?ultraart`: 고성능 기기에서만 프리미엄 아트 스트리밍을 강하게 허용한다.
- `?fullpreload`: 부팅부터 선로드 비교용. 실서비스/휴대폰 테스트에서는 사용하지 않는다.
- `?nosw`: 서비스 워커 등록 비활성화.

## QA 체크리스트

1. 모바일 기본 주소에서 첫 탭 후 MenuScene 전환이 빠른지 확인.
2. 빠른 시작 버튼이 네트워크 없이 즉시 로비로 들어가는지 확인.
3. 로비에서 버튼/텍스트가 너무 작지 않은지 확인.
4. 월드맵 진입 시 검은 화면/멈춤이 없는지 확인.
5. 전투 진입 직후 5초 동안 멈춤이 줄었는지 확인.
6. 전투 중 프레임 스파이크 메시지가 뜨면 이후 더 심해지지 않는지 확인.
7. `?ultraart`는 고성능/와이파이 환경에서만 확인.

## 적용 방법

프로젝트 루트에 덮어씌운 뒤 GitHub Desktop에서 변경 사항을 확인한다. 기존 `node_modules` 문제로 빌드가 막히면 아래를 실행한다.

```bash
npm install
npm run build
```
