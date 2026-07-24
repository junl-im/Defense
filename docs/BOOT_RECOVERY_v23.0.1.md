# Boot Recovery v23.0.1

## 확인된 원인

v23 정적 배포본은 Three.js 0.185.1을 jsDelivr 한 곳의 import map으로 불러왔다. CDN 연결이 차단되거나 느려지면 `src/main.js`가 평가되지 않으므로 시작 버튼 이벤트, 런타임 아틀라스, 전투 에셋 초기화가 모두 실행되지 않는다.

또한 Firebase 정적 헤더가 해시가 없는 `/src/*.js`와 `/src/*.css`까지 1년 immutable 캐시로 취급해, 정적 배포 시 새 코드와 이전 코드가 섞일 수 있었다.

## 수정

- Vite 진입점을 `src/bootstrap.js`로 분리
- 진입 모듈 import 실패를 한국어 부팅 오류 화면에 전달
- 시작 버튼은 게임 준비 이벤트 전까지 비활성화
- 정적 배포는 로컬 Three.js를 우선 사용
- 로컬 사본이 없을 때 jsDelivr, unpkg, esm.sh 순서로 복구
- 단일 CDN 하드코딩 import map 제거
- JS, CSS, 서비스 워커, 타이틀 이미지를 network-first로 변경
- 쿼리 문자열을 무시하던 이미지 캐시 동작 제거
- 타이틀 배경과 마스코트 캐시 리비전을 v23.0.1로 갱신
- Firebase의 `/src/**` immutable 캐시 제거

## 배포 권장

프로덕션은 다음 Vite 번들을 사용한다.

```bash
npm ci
npm run verify
npm run build
```

`npm run build:static`은 패키지 설치가 불가능한 환경을 위한 복구 배포다. node_modules에 Three.js가 있으면 로컬 vendor를 복사하며, 없으면 다중 CDN 복구 로더를 사용한다.
