# KingdomSeed v2.36.15 MASSIVE GRAPHIC FALLBACK

## 목표

v2.36.14에서 글자/버튼/패널의 시안성 안전망을 크게 올린 뒤, v2.36.15는 그래픽 쪽 대안책을 보강한다.

핵심 방향은 다음과 같다.

- 새 대용량 이미지를 기본 부팅에 추가하지 않는다.
- 2.5D 원화 에셋이 늦거나 생략되어도 코드 기반 화면이 장난감처럼 보이지 않게 한다.
- 저사양/Save-Data/느린 네트워크/런타임 락다운에서는 자동으로 안전한 그래픽 폴백을 사용한다.
- 여유 기기에서는 정적 그래픽 레이어를 조금 더 풍부하게 보여준다.
- 전투 중 무거운 아트 스트리밍 금지 정책은 유지한다.

## 주요 변경

### 1. PrestigeGraphicFallback 추가

새 파일 `src/game/PrestigeGraphicFallback.ts`를 추가했다.

역할:

- 모바일/저사양/약한 네트워크용 그래픽 폴백 프로필 계산
- 전투 맵에 정적 페인터리 레이어 추가
- 로그인/로비/월드맵/서브 화면에 공통 그래픽 보강 레이어 추가
- root class (`ks-graphic-fallback`, `ks-graphic-fallback-safe`, `ks-graphic-fallback-contrast`) 적용

### 2. 전투 그래픽 대안 보강

전투 화면에 다음 정적 레이어를 추가했다.

- 페인터리 백드롭
- 경로 주변 그림자/림라이트 보강
- 건설 지점 foundation ring 보강
- 시작/목표 게이트 실루엣 보강
- 저사양에서는 정적 레이어만 사용
- 여유 기기에서는 매우 가벼운 signal glint만 허용

### 3. 씬 전체 그래픽 톤 보강

다음 씬에 `installSceneGraphicFallback`을 적용했다.

- MenuScene
- MainMenuScene
- WorldMapScene
- LabScene
- ArtifactForgeScene
- CodexScene
- HeroHallScene
- MissionBoardScene
- MetaScene

각 씬은 기존 배경/정체성을 유지하되, 이미지가 약하거나 늦게 로드되어도 어두운 커맨드 톤, 림라이트, 프레임, 상하단 매트가 보이도록 보강했다.

### 4. 코드 기반 유닛 폴백 개선

`BattlePrestigePolish.ts`의 코드 기반 폴백 유닛을 추가 보강했다.

- 타워: 미니어처 백플레이트/크레스트 추가
- 몬스터: threat 실루엣 뒤쪽 실드/프레임 추가
- 보스/탱커/일반형 구분 강화
- 영웅: 망토, 검, 방패 실루엣 추가

원화 actor art가 생략되는 모바일 안전 모드에서도 원/삼각형 장난감 느낌을 줄이기 위한 조치다.

### 5. WebShell/CSS 그래픽 안전망

`src/style.css`에 그래픽 fallback root class 스타일을 추가했다.

- 일반 graphic fallback: 약한 채도/대비 보정
- safe fallback: canvas filter 비활성화
- contrast fallback: 외곽 대비 ring 보강

## 새 검수 옵션

- `?graphicfallback` : 그래픽 fallback 강제
- `?paintedfallback` : 페인터리 fallback 강제
- `?prestigegfx` : 프레스티지 그래픽 fallback 강제
- `?safegfx` : 안전 그래픽 fallback 강제
- `?fallbackgfx` : 약한 기기용 그래픽 대안 강제
- `?contrastgfx` : 고대비 그래픽 fallback 강제
- `?nographicfallback` : 그래픽 fallback 비활성화
- `?legacygfx` : 이전 그래픽 비교
- `?plainart` : 아트 보강 제거 비교

## 성능 정책

- 새 이미지/atlas/sound 없음
- 기본 부팅 에셋 증가 없음
- Firebase/PWA/오디오 지연 정책 유지
- 전투 중 무거운 아트 스트리밍 금지 유지
- 저사양/Save-Data/느린 네트워크에서는 정적 그래픽만 사용
- 무한 파티클 없음
- 여유 기기에서만 1개의 저비용 signal glint 허용

## 검증

- `npm ci` 통과
- `npm run build` 통과
- Vite preview `/` HTTP 200 확인

