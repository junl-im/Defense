# 도깨비 운빨 수호대 3D

모바일 웹용 Three.js 3D 액션 운빨 디펜스입니다.

- 게임 버전: **1.7.6**
- 엔진 버전: **1.0.2**
- 배포 주소: `https://junl-im.github.io/Defense/`
- Firebase 프로젝트: `web-game2`

## 실행

Node.js `20.19+` 또는 `22.12+` 환경에서 실행합니다.

```bash
npm ci
npm run verify
npm run dev
```

프로덕션 및 GitHub Pages 빌드:

```bash
npm run build
VITE_BASE_PATH=/Defense/ npm run build
```

## 엔진 1.0.3 핵심

- 모바일 실시간 그림자 비활성화와 InstancedMesh blob 그림자
- 기기별 pixel ratio 상한과 FPS 기반 동적 해상도
- 바위·등불·야시장 상점 InstancedMesh 배치
- 15개 소환 발판을 base/rune 두 드로우콜로 통합
- 파티클·투사체·엽전 ObjectPool 재사용
- 거리 기반 월드 청크 가시성 관리
- 도깨비 300 triangles, 적 500 triangles 자동 검사
- 외부 에셋용 TextureAtlas 기반 준비
- Firebase는 결과 저장에서만 1회 쓰기와 랭킹 1회 읽기

## 렌더 통계 HUD

개발 중 아래 주소로 접속하면 FPS, draw call, triangles, 메모리, 청크, 풀 사용량을 표시합니다.

```text
https://junl-im.github.io/Defense/?stats=1
```

PC에서는 `F3`으로 표시를 켜거나 끌 수 있습니다.

## 조작

- PC: W/A/S/D 또는 방향키
- 지형 짧은 클릭·터치: 실제 3D 바닥 좌표로 이동
- 드래그: 카메라 회전
- 모바일: 왼쪽 조이스틱과 지형 터치 이동
- Space: 질주
- Q: 광역기
- E: 소환
- R: 집중 명령
- F3: 엔진 통계 HUD

## 배포

패치 ZIP을 저장소 루트에 그대로 덮어쓰고 GitHub Desktop에서 commit·push합니다. GitHub Actions가 `/Defense/` 경로로 빌드합니다.

전체 ZIP에는 빌드된 `dist/`가 포함됩니다. 패치 ZIP에는 변경 파일만 포함되고 `dist/`와 `node_modules`는 포함하지 않습니다.

## 버전 규칙

- 작은 수정과 엔진 개선: `1.7.6 → 1.7.6 → 1.7.6`
- 기능 묶음 완성: `1.7.x → 1.8.0`
- 내부 엔진은 별도 버전 사용: 현재 `1.0.2`

대화가 끊긴 뒤 작업을 이어갈 때는 `PROJECT_HANDOFF.md`를 먼저 확인합니다.


## v1.7.6 / 엔진 1.0.3

- 적 모델을 종류별 ObjectPool로 재사용합니다.
- 적 geometry를 타입별 캐시로 공유해 웨이브 생성 비용과 GPU 메모리 중복을 줄였습니다.
- 원거리 일반 적은 눈·뿔·장비를 숨기는 경량 LOD로 전환됩니다.
- 타이틀 복귀와 재시작 시 적 풀 자산이 dispose되지 않도록 전용 EnemyPoolRoot를 사용합니다.


## v1.7.6 입력·모바일 UI 수정

- A/D를 카메라 행렬의 실제 화면 좌우축으로 계산해 반전 가능성을 제거했습니다.
- 320~430px 세로 화면과 낮은 가로 화면에서 조이스틱, 액션 버튼, 도깨비 목록이 겹치지 않도록 축소·재배치했습니다.
- iPhone 안전영역과 작은 화면 모달 높이를 보강했습니다.

## 그래픽 에셋 정책

SVG는 저장소와 런타임 모두 금지합니다. 3D 모델은 GLB/GLTF, 텍스처와 UI 이미지는 PNG/WebP/KTX2만 사용합니다. 모바일용 에셋은 LOD, 압축 텍스처, 아틀라스와 인스턴싱을 우선합니다.


## v1.7.6 / 엔진 1.0.5
모바일 왼쪽 정보 패널을 접을 수 있으며, 두 손가락 핀치와 PC 마우스 휠로 부드럽게 카메라 거리를 조절합니다.
