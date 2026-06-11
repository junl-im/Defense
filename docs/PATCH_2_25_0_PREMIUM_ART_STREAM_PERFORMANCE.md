# Kingdom Seed v2.25.0 Premium Art Stream Performance QA

## 목표

첫 화면 터치 후 다음 화면으로 넘어가는 지연을 줄이기 위해 시작 구조를 다시 정리했다. v2.25는 고퀄리티 원화풍 에셋을 크게 추가하되, 첫 부팅과 첫 탭에는 무거운 에셋/Firebase 네트워크를 기다리지 않는 구조를 우선한다.

## 핵심 구조 개선

- 빠른 시작 버튼은 Firebase 익명 로그인/Firestore 세이브 로드를 기다리지 않고 즉시 로컬 게스트 세션으로 진입한다.
- Firebase 서비스는 정적 import에서 동적 import로 전환해 첫 화면 진입 시 JS 파싱/초기화 부담을 줄였다.
- `localSave.ts`를 분리해 로컬 세이브/연구 메타/업그레이드 비용 계산을 Firebase 없이 사용할 수 있게 했다.
- 기존 v2.24 기본 프리미엄 에셋도 Boot 기본 로드에서 제외하고, 화면 진입 후 점진 로딩으로 전환했다.
- 신규 `ProgressiveAssetLoader.ts`를 추가해 화면별 원화풍 에셋을 `login`, `lobby`, `world`, `battle` 단위로 늦게 로드한다.
- `?fullart` 또는 `?galleryart`에서만 갤러리급 추가 에셋까지 로드한다.

## 디자인 개선

- v2.25 원화풍 UI/장식 에셋 122종 추가
- PNG/WebP 세트 포함 총 244개 신규 이미지 파일
- 투톤 스티커 느낌을 줄이고 다색 광원, 펄 질감, 금박 라인, 수채 브러시 노이즈를 적용
- 첫 화면, 로비, 월드맵, 전투 HUD에 고급 원화풍 레이어 추가

## 성능 정책

- 첫 접속: 최소 Boot + 로컬 세이브 즉시 진입
- 첫 화면: 기본 UI를 즉시 표시하고 v2.25 로그인 아트는 짧은 지연 후 점진 로드
- 로비/월드맵/전투: 해당 화면 진입 후 필요한 v2.25 핵심 에셋만 로드
- 저사양 기기: 장식 애니메이션과 갤러리 에셋 로드를 자동 축소
- 감상/디자인 QA: `?fullart` 또는 `?galleryart` 사용

## 검증

```bash
npx tsc --noEmit --pretty false
```

TypeScript 검증 통과.

`npm run build`는 원본 zip에 포함된 기존 `node_modules`의 Vite/Rolldown optional native binding 누락으로 실행되지 않았다. 코드 오류가 아니라 의존성 설치 문제이며, 실제 개발 환경에서는 `npm install` 후 빌드해야 한다.
