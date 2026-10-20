# 라니킹덤 Next — 2.5D 실제 게임 개발판

## 무엇이 달라졌나
기존 `main`의 육각 로우폴리 SLG에 시안 이미지를 덮어씌우는 방법을 중단했습니다. 실제 건축/영지/병사/경제/카메라/저장을 보유한 **Fiefdom 1.76.0**의 게임 엔진을 별도 작업 트리에 복사해서 변환합니다. 원본 게임 엔진 출처: https://github.com/halvar20000/fiefdom (AGPL-3.0-only, SHA `8bb66ceeb5a8ec1f77ec899130090061c25078b3`).

이 브랜치의 변환 코드는 게임 복제본의 실제 데이터를 수정합니다.
- 실제 엔진의 기존 **해안(coast) 월드** 기본 선택. 원본 지도 시드와 건축 조건 불변
- 실제 2.5D 성채·성문·탑·성벽 7종 × 카메라 4방향, PNG 총 **28장** 청회색 왕궁 석조 톤 변환. 3D 입체 메시에는 이 색이 아직 미적용
- 실제 카메라 초기 줌 1 → 1.5. 기존 휠/핀치/회전/키보드 유지
- 원본 별도 제작 자원 아이콘 5종, 로고, 주택·시장·무역선 WebP를 원본 바이너리 변조 없이 읽기 전용 복사. 주택 이미지는 **시작 메뉴 일러스트**이며 실게임 건물 프레임에는 맞는 원본 게임 4방향 스프라이트 사용
- 원본 12개 실제 지도 목록을 시작 화면에서 접어두고 펼쳐 선택. 실제 영주 선택 및 게임 시작 동작은 그대로 실행
- 데스크톱 게임 화면의 실제 상세 정보·속도/세금/사운드/전체화면 패널을 작은 열기/닫기 버튼으로 제어. 모바일 기존 UI·터치 조작 미변경
- 원본 건축/이동/군사/자원 생산/일시정지/세이브 코드 변경 없음

## 실제 빌드
빌드 결과는 `main`이나 배포 주소에 올라가지 않습니다. [GitHub Actions: Build Rani Next 2.5D Playable World](https://github.com/junl-im/Defense/actions/workflows/build-rani-next-2p5d.yml) 를 실행하고 ZIP 아티팩트를 받습니다. ZIP 안은 HTTP(S) 웹 서버 루트로 서빙해야 하며, 로컬 파일 더블클릭은 사용하지 마세요. 이미지, CSS, 자원 경로가 루트 `/assets`, `/rani` 기준입니다.

로컬(Windows/Node 22/Python 3.12 권장)에서는 아래 명령으로 기존 코드 손상 없이 작업 브랜치 내 서브모듈의 **개발 체크아웃 사본**에서 실행합니다. 이미 같은 디렉터리에서 변환한 뒤 스크립트를 반복 실행하면 중복 패치 방지 검사로 중단됩니다.

```sh
git clone --recurse-submodules https://github.com/junl-im/Defense.git
cd Defense
git switch spike/rani-complete-isometric-base
git submodule update --init --recursive
npm ci --prefix engines/fiefdom
node rani-next/prepare.mjs engines/fiefdom
python -m pip install Pillow==11.3.0
python rani-next/recolor_world.py engines/fiefdom/public/assets/sprites
node rani-next/check.mjs engines/fiefdom
npm run build --prefix engines/fiefdom
npm run preview --prefix engines/fiefdom
```

## QA·상태
- Rani Next Playable Build Workflow: 소스 전환, 28장 실제 이미지 변환, 원본 빌드·유닛 테스트, Chromium 메뉴→영주→실제 게임 진입·4개 건물 건설·600초 진행, 스크린샷 자동 검증
- 추가 Rani 전용 크롬 검사: 실제 지도 변경 토글과 원래 선택 동작, 실게임 카메라 줌, 기존 정보창·설정창 토글, 진짜 자원 DOM 비교
- 미완료: 사용자 레퍼런스와 동일한 고해상도 왕궁·폭포·선박, 실제 항만/해전/동맹 시스템, 전체 UI 한국어, 모바일 실기기 FPS, 기존 v4.0 저장게임 → 신규 엔진 마이그레이션
- 추가 그래픽 에셋 확보 시 스프라이트시트 크롭 금지. 건물 종류마다 Blender 공통 카메라/태양으로 4방향 이미지 독립 렌더 후 공식 atlas `buildings.json` 앵커 갱신

## 저작권·배포
- 게임 원본 코드/원본 미술 자산: Fiefdom (AGPL-3.0-only), 수정 배포 및 네트워크 제공 시 해당 라이선스 의무 준수
- 일부 0 A.D. 파생 모션 스프라이트: CC BY-SA 3.0 별도 조건 및 표기
- `rani-next` 수정 스크립트·원본 엔진 소스 링크와 귀속 문서는 게임 빌드 안에도 제공
- Fiefdom 원본을 한국어로 이름만 바꿔 독립 상용 독점 프로젝트인 것처럼 오인시켜서는 안 됩니다.
- 기존 라니킹덤 원본 16종 및 `main` 세이브 시스템은 별도로 유지합니다. **미완성 개발판을 공개 본판에 병합하지 않습니다.**
