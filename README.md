# 도깨비 운빨 수호대 3D

모바일 웹용 Three.js 3D 액션 운빨 디펜스입니다.

- 게임 버전: **1.7.1**
- 엔진 버전: **1.0.0**
- 배포 주소: `https://junl-im.github.io/Defense/`
- Firebase 프로젝트: `web-game2`

## 실행

Node.js `20.19+` 또는 `22.12+` 환경에서 실행합니다.

```bash
npm ci
npm run verify
npm run dev
```

프로덕션 빌드:

```bash
npm run build
npm run preview
```

GitHub Pages 경로 빌드:

```bash
VITE_BASE_PATH=/Defense/ npm run build
```

## 엔진 구조

```text
src/engine/mobile-engine.js          렌더러, 기기 감지, 동적 해상도
src/engine/engine-config.js          모바일 품질과 성능 예산
src/engine/performance-monitor.js    FPS 표본과 품질 단계 조절
src/engine/instance-batch.js         InstancedMesh 배치
src/engine/blob-shadow-system.js     단일 드로우콜 가짜 그림자
src/engine/object-pool.js            파티클·효과 재사용 풀
src/engine/geometry-budget.js        삼각형 수 검사
src/engine/texture-atlas.js          향후 에셋 아틀라스 지원
src/engine/world-chunk-manager.js    오픈월드 청크 표시 기반
```

## 모바일 필수 설정

- 모바일 실시간 그림자 비활성화
- 플레이어·도깨비·적 그림자는 InstancedMesh blob 그림자로 대체
- 저사양 안티앨리어싱 비활성화
- 기기별 pixel ratio 상한 적용
- FPS가 낮으면 렌더 해상도 자동 하향
- 바위·등불·야시장 상점 InstancedMesh 배치
- 파티클 ObjectPool 재사용
- 도깨비 최대 300 triangles
- 적 최대 500 triangles
- Firebase는 결과 저장 시 1회 쓰고 명부를 1회 읽음

현재 월드는 절차형 단색 재질이 중심이라 텍스처 이미지가 거의 없습니다. 외부 모델과 텍스처를 도입할 때는 `TextureAtlas` 모듈을 사용해 종류별 개별 이미지를 만들지 않고 한 장의 아틀라스로 묶습니다.

## 조작

- PC: W/A/S/D 또는 방향키
- 지형 짧은 클릭·터치: 해당 3D 좌표로 이동
- 드래그: 카메라 회전
- 모바일: 왼쪽 조이스틱과 지형 터치 이동
- Space: 질주
- Q: 광역기
- E: 소환
- R: 집중 명령

## 배포

패치 ZIP을 저장소 루트에 그대로 덮어쓰고 GitHub Desktop에서 commit·push합니다. GitHub Actions가 `/Defense/` 경로로 빌드합니다.

전체 ZIP에는 빌드된 `dist/`가 포함됩니다. 패치 ZIP에는 변경 파일만 들어 있고 `dist/`와 `node_modules`는 포함하지 않습니다.

## 버전 규칙

- 작은 수정과 엔진 개선: `1.7.1 → 1.7.2 → 1.7.3`
- 기능 묶음 완성: `1.7.x → 1.8.0`
- 내부 엔진은 별도 버전 사용: 현재 `1.0.0`

대화가 끊긴 뒤 작업을 이어갈 때는 `PROJECT_HANDOFF.md`를 먼저 확인합니다.
