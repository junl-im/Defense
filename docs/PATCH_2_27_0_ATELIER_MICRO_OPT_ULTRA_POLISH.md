# v2.27.0 Atelier Micro-Opt Ultra Polish QA

## 목표

- 첫 시작/첫 탭 체감 지연을 다시 무겁게 만들지 않으면서 고퀄 원화풍 자산을 확장한다.
- 씬 전환 직후 에셋 스트리밍이 겹치는 구조를 완화한다.
- 전투 터치/건설 판정처럼 실제 플레이 체감에 연결되는 미세한 좌표 문제를 정리한다.

## 주요 변경

- `public/assets/ui/v2_27/` 신규 원화풍 아틀리에 에셋 194종 추가.
- PNG/WebP 세트 포함 총 388개 이미지 파일 추가.
- `PremiumIllustrationArtV227.ts` 추가.
  - 로그인/로비/월드맵/전투별 v2.27 아트 레이어 제공.
  - v2.27 에셋 번들을 같은 파일에서 export하여 점진 로더와 공유.
- `ProgressiveAssetLoader.ts` 개선.
  - v2.27 코어/갤러리 에셋 번들 연결.
  - 씬별 큐에 더해 전역 progressive art queue 추가.
  - `requestIdleCallback` 지원 환경에서는 idle 시점에 로딩 시작.
  - 첫 7초 동안은 병렬 다운로드를 1로 제한하여 첫 탭/초기 전환 경쟁 완화.
- 빠른 시작 후 Firebase background sync를 4.6초 늦춰 첫 전환 프레임과 충돌하지 않도록 조정.
- 로그인 Firebase bootstrap 지연을 3.2초에서 6.2초로 늘려 초기 화면 안정성을 우선.
- 로비/월드맵/전투 아트 로딩 지연값 재조정.
- 월드맵/전투 예열 로딩 지연값 상향으로 씬 전환 순간 부하 분산.
- BootScene WebP/fast boot skip 패턴에 `v2_27` 추가.
- 전투 건설 지점 대형 hit zone 좌표 전달 오류 수정.

## 성능 정책

- 기본 실행: 빠른 부팅 + v2.27 핵심 코어 에셋만 idle 스트리밍.
- 저사양 기기: 코어 에셋 수와 애니메이션 수 자동 축소.
- `?fullart` 또는 `?galleryart`: v2.27 갤러리 자산까지 감상/검수용으로 로드.
- 첫 탭 직후: Firebase/대량 아트 로딩을 바로 경쟁시키지 않음.

## 검증

```bash
npx tsc --noEmit --pretty false
```

통과.

`npm run build`는 현재 전달된 원본 `node_modules`의 Vite 실행 권한/Rolldown optional native binding 누락으로 막힐 수 있다. 이 경우 프로젝트 루트에서 `npm install` 후 다시 실행한다.
