# 곰같은여우 — BLOCK SURVIVAL TPS

**ALPHA 0.1 플레이 가능한 독립형 웹 TPS 시제품.** 기존 라니킹덤과 완전히 분리하여 개발합니다. 최신 검증 결과와 빌드는 [Actions](https://github.com/junl-im/Defense/actions/workflows/block-survival-preview.yml) 참조. 브라우저에서 PC·모바일 실제 게임플레이 및 FPS 실측은 별도 검증이 필요합니다.

## 보존 및 권리
- 게임 실행 파일: \`BlockSurvivalTPS/index.html\`, \`src/game.mjs\`, \`src/sim.mjs\`, \`style.css\`
- 작업 브랜치: \`feature/block-survival-tps-v01-20261029\` ([PR #90](https://github.com/junl-im/Defense/pull/90))
- 기존 라니킹덤 원본/배포: \`main\` 및 \`archive/rani-kingdom-v539-20261029\`. **덮어쓰거나 삭제하지 않습니다.**
- 자체 게임 코드·기획: © 2026 곰같은여우. Three.js MIT / Gobkit·KayKit·Kenney CC0 원 라이선스는 각각 원 저작자에게 속합니다.
- SVG 자산/아이콘 금지. PC/모바일 모두 스크롤 없는 단일 화면, 우클릭·드래그 금지.

## 첫 플레이 범위
폐허 도시 3D 지형/엄폐물, 블록 생존자, WASD 이동·마우스 카메라·좌클릭 사격, R 장전/Shift 질주/ESC 일시정지, 모바일 좌측 조이스틱+우측 시점·사격·장전·질주 버튼, 추적형 좀비·주자·특수몹, 체력·탄약·피격 표시·처치·웨이브·재시작. WebGL 렌더러가 실패하면 경고를 보여줍니다.

기본 3D 지형·캐릭터만으로 실행 가능. GLTFLoader를 통해 원본 SHA에 고정된 Gobkit 미니언과 Kenney 총기·KayKit 도시 소품을 **선택적으로** 다운로드하며 실패 시 기본 메시로 폴백. 애니메이션 해석은 [모델 실사 보고서](./research/MODEL_AUDIT_20261029_KO.md) 참조. **최종 인간형 좀비와 아트 퀄리티는 아직 미완료**입니다.

## 간단 실행
개발용 원본 (인터넷 필요, importmap과 CDN Three.js):
\`\`\`sh
cd BlockSurvivalTPS
python -m http.server 8000
# http://localhost:8000/
\`\`\`

외부 Three.js CDN을 포함하지 않는 **독립 빌드**:
\`\`\`sh
cd BlockSurvivalTPS
npm install
npm test
npm run build
cd dist
python -m http.server 8000
# http://localhost:8000/
\`\`\`
위의 GitHub Actions는 같은 빌드 후 \`block-survival-tps-playable-alpha-v01\` ZIP을 첨부합니다. 이를 다운로드·압축 해제한 뒤 \`START_HERE.txt\` 안내에 따라 로컬 서버를 실행할 수 있습니다. **CDN 없이 기본 게임 실행 가능**하며, 선택 원본 3D 모델은 인터넷이 연결될 때만 표시합니다.

## 현재 테스트와 제한
- [전투 규칙 자동 테스트](./tests/gameplay.test.mjs): 탄약·엄폐·체력·적 상한·웨이브 및 게임오버.
- [7개 CC0 원본 증빙](./research/source-lock.json) 및 [수집·라이선스 검사](./tools/acquire-open-assets.mjs): 7출처 52파일.
- [GitHub CI](../.github/workflows/block-survival-preview.yml): ES 모듈 구문 검사, 전투 테스트, 실제 번들 생성, 최소 정적 HTTP 응답, SVG 배제. 완료 상태는 실행 결과 확인 필요.
- AI는 단순 추적·가로막힘 시 X/Z 슬라이드 수준으로, 아직 경로탐색/정예 패턴 없음.
- 모바일 실기기 FPS/발열, 본 무기 장착·헤드샷·고급 애니메이션, 로컬/클라우드 세이브, 원본 사이트 전환은 **아직 구현·검증되지 않음**.
- 모바일 30FPS/PC 60FPS 및 초기 로딩 3–8MB는 **목표**일 뿐 실측 보장 없음.

## 자료
- [7개 공식 CC0 출처·취득 내역](./research/ACQUISITION_STATUS_KO.md)
- [실물 GLB 구조 분석](./research/MODEL_AUDIT_20261029_KO.md)
- [오픈소스 자료 연구](./research/OPEN_SOURCE_ASSET_MASTER_KO.md)
