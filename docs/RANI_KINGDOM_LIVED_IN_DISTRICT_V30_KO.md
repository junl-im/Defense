# 라니킹덤 v3.0 — 실제 완공 건물 7종의 마을 생활 밀도 강화

## 사용자 고정 요구·보존
- 디자인 목표: 중세 왕실의 청색 지붕·금장·석조 거리·풍성한 거리 소품. 마을을 기존 Three.js **실제 본판**으로 유지하며 레퍼런스 이미지를 덮어씌우지 않는다.
- SVG 전면 금지. 기존 독립 PNG/변환 WebP 10종, 로고·지형 아틀라스·Quaternius GLTF 4종 등 **16개 승인 런타임 파일 지문** `assets/rani/asset-integrity-lock-v25.json` 그대로; 기존 원본 파일 덮어쓰지 않음.
- 기존 건축이 가능한 실제 건물의 `CivicFactory.js`와 `ConstructionSystem`의 4단계 건설 계약은 변경 없음. 건축 비용, 생산, 연구, 저장 키, 영토, 자동 이동, 실제 세력, 마을/필드, 퀘스트 전부 수정하지 않음.

## 이번에 실게임에 추가한 7개 시설
`src/rendering/RoyalLivedInDistrictArt.js` 하나의 모듈에 각 직업 고유의 입체 장식 생성, `makeRoyalLivedInDistrict(kind)` 함수로 연결. `CivicFactory.js`의 각 실제 건물 함수 내부 **완공 p4**에만 `p4.add(makeRoyalLivedInDistrict(kind))` 1회 삽입.

| 실제 시설 | 새 3D 입체 디테일 |
|---|---|
| 양봉장(`apiary`) | 왕실 길드 표식·울타리·꿀단지 3개·꽃·돌 진입로 |
| 제과점(`bakery`) | 앞마당 진열대·빵 3개·왕실 문장·가로등 2개·석판 진입로 |
| 마구간(`stable`) | 마구간 간판·편자 길·물통/건초·왕실 금장 처마, 기존 말·울타리 유지 |
| 사원(`temple`) | 청색 황금 문장·석판 입구·의식 촛불 2개·가로등 |
| 대학(`university`) | 외부 복도 석조 기둥·책 진열대·청금색 문장·석판 길 |
| 천문대(`observatory`) | 관측대 난간 8개·사방향 돌 표식·황금 천체 디테일, 기존 망원경·돔 유지 |
| 도서관(`library`) | 청색 서가/독서 진열·금장·진입 가로등 2개·책 색상·석판 길, 기존 두루마리 보존 |

- 신규 요소는 **기존 건물에만** 붙고, 별도의 가짜 건물/주택이 생기지 않으며 실제 미완공 상태에서도 표시되지 않는다.
- 재질은 기존 `Materials.js`의 `MATS.vcStatic` 및 `PALETTE` 왕실 색을 재사용하고, **건물당 vertex-color 병합 메시 1개**만 추가해 수십 개 소품을 그리는 별도 GPU 드로콜을 줄였다. `raycast=()=>{}`와 `userData.raniVisualOnly`로 선택 방해 방지. 기존 건물 렌더링과 건물별 독립 기능 보존.
- 기존 v2.8 무역선·항구, v2.9 본판 왕실 광장, v2.7 HUD, v2.6 수변, v2.4 필드, 전 건설·저장 기능 그대로 둔다.

## 증거 및 통과 기준
- `scripts/check-lived-in-district-v30.mjs`: 7종 실제 제작기와 완공 단계 1개 메시 부착, 기존 항구/주택/기존 16종 원본 지문 계약 유지, SVG·저장/경제 코드 개입 금지.
- `scripts/qa_lived_in_district_v30.py`: **1440×900 PC, 390×844 모바일, 320×700 소형 모바일** Chromium에서 실제 제작 함수 7종의 4단계 구조, 기존 메시·새 장식, 지오메트리/좌표 bounds, 타일 선택 방해 방지, **실제 ConstructionSystem 즉시 완공**, 마을 리로드와 원래 자원·세이브 구조 불변, 자산/HUD, JS 예외 없음 확인 및 스크린샷 저장.
- 이전 v0.1~v2.9 테스트와 PC/모바일 QA를 하나도 지우지 않고 연속 수행한다. 두 GitHub Actions 모두 성공 전 본판 병합 금지, 병합 후 GitHub Pages 공개 배포와 `main` 자체 Chromium QA 따로 확인.

## 구분·미완료
- 이 버전은 **건설이 완료된 기존 7개 업종 외관의 시각적 밀도**를 실제 본판에서 개선한 것이며, 레퍼런스에 묘사된 거대한 도시 전체를 자동으로 즉시 세운 것이 아니다. 기존 저장 파일에서 해당 건물이 없는 마을에는 해당 추가 요소가 보이지 않는 것이 정상.
- 새로운 2D 개별 투명 PNG 아이콘을 만든 것이 아니며, 원본 10종 이외의 임시 이모지 일부는 남아 있다. 건축물 대량 추가/NPC/파도/특수 시네마틱과 실제 Android/iOS 물리 기기 발열·GPU FPS 미측정 상태는 별도 과제.
- 원본 [Google Drive PNG+WebP 백업 ZIP](https://drive.google.com/file/d/17z3CxG084H009VspkNGYBaQMQDt9aXRf/view)와 기존 노션/드라이브 MASTER 연결 유지.
