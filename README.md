# 도깨비 운빨 수호대 3D

모바일 웹용 Three.js 3D 액션 운빨 디펜스입니다.

- 게임 버전: **1.7.8**
- 엔진 버전: **1.0.7**
- 배포 주소: `https://junl-im.github.io/Defense/`
- Firebase 프로젝트: `web-game2`

## 실행

```bash
npm ci
npm run verify
npm run dev
```

GitHub Pages 빌드:

```bash
VITE_BASE_PATH=/Defense/ npm run build
```

## 조작

- PC 이동: W/A/S/D 또는 방향키
- PC 카메라: 마우스 드래그 회전, 휠 줌
- 모바일 이동: 가상 조이스틱 또는 지형 짧은 터치
- 모바일 카메라: 한 손가락 드래그 회전, 두 손가락 핀치 줌
- Space: 질주
- Q: 광역기
- E: 소환
- R: 집중 명령
- F3: 엔진 통계 HUD

## v1.7.8 / 엔진 1.0.7

- GLB/GLTF 모델 로더와 Draco 압축 지원
- KTX2 GPU 압축 텍스처 지원
- 압축 로더는 실제 에셋이 필요할 때만 동적으로 내려받음
- LOW/MEDIUM/HIGH 기기별 에셋 변형 자동 선택
- 로딩 단계와 진행률을 실제 부팅 흐름에 연결
- 에셋 실패 시 절차형 기본 모델로 대체할 수 있는 슬롯 제공
- 저사양 64MB, 모바일 96MB, 데스크톱 192MB 텍스처 예산
- 빌드 검증에서 래스터 텍스처 해상도와 예상 GPU 메모리 검사
- 타이틀 화면에 1600×900 WebP 키아트 적용

현재 플레이어·도깨비·적은 기존 절차형 모델을 유지합니다. 외부 고품질 GLB가 등록되면 에셋 카탈로그의 기기별 변형을 통해 자동 교체되며, 파일이 없거나 로드에 실패하면 기존 모델로 안전하게 복귀합니다.

## 모바일 엔진 원칙

- 실시간 그림자 비활성화, InstancedMesh blob 그림자 사용
- 도깨비 300 triangles, 일반 적 500 triangles 이하
- 바위·등불·상점·소환 발판 InstancedMesh
- 파티클·투사체·엽전·적 모델 ObjectPool
- 거리 기반 LOD와 월드 청크 가시성
- SVG 금지, GLB/GLTF 및 PNG/WebP/KTX2만 허용
- Firebase는 게임 루프에서 호출하지 않고 결과 저장 시에만 사용

## 배포

패치 ZIP을 저장소 루트에 그대로 덮어쓰고 commit·push합니다. 전체 ZIP에는 `/Defense/` 기준으로 빌드된 `dist/`가 포함되며 패치 ZIP에는 변경 파일만 포함됩니다.

다음 작업은 `PROJECT_HANDOFF.md`의 마지막 항목부터 이어갑니다.
