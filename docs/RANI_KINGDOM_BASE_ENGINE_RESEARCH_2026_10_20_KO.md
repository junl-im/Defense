# 라니킹덤 — 실제 완성형 오픈소스 기반 전면 전환 조사 (2026-10-20)

## 사용자 확정 목표
현재 라니킹덤 실게임은 커다란 HUD와 목록이 중심으로 느껴지고, 로우폴리 육각 게임 장면과 참고한 고화질 2.5D 왕국/성곽/항구/폭포 도시 그림 사이에 격차가 크다. **목표는 실제 왕국 월드를 주인공으로 한 시뮬레이션형 SLG**다. 옛 게임의 UI 스킨을 반복 수정하지 말고, 처음부터 완성된 게임 플레이 루프/카메라/건축/유닛/경로/렌더 구조를 갖춘 기본틀을 찾아 이식한다.

## 실사 후보 조사의 합격 기준
- 직접 플레이 가능한 실게임 및 출처 확인된 코드와 명시적 재사용 라이선스.
- 성·마을·공사 현장·건물·도로·유닛을 **게임 월드에 실제 그림으로** 렌더한다. HTML 카드·가짜 성 이미지·목록 UI는 불가.
- 마우스/터치·줌/드래그·건설·생산·부대·세이브 기능. 모바일은 별도 QA.
- GitHub Actions에서 재현 가능한 빌드/테스트. 현재 GitHub Pages(공개 주소)와 기존 16종 잠금 자산/기존 저장키를 사전 백업하고 무단 치환하지 않는다.
- 유저 원칙: SVG 아트 금지, 기존 홍보 시안 잘라 쓰기 금지, 필요한 왕궁/항구/건물은 각각 독립 원본 제작.

## 후보 비교 및 저작권·인프라 현실
| 원본 | 장점/용도 | 한계/라이선스 | 결정 |
| --- | --- | --- | --- |
| Fiefdom https://github.com/halvar20000/fiefdom | 브라우저 Vite/Three.js, 성채 건축·일꾼·병사·경제·공성전·카메라, Blender 공통 조명에서 렌더한 2.5D 독립 스프라이트; 현재 1.76.0 | AGPL-3.0-only, CC BY-SA 3.0 별도 0 A.D. 동작 자산. 클론 및 개작·네트워크 제공 시 소스 공개 등 의무. 해안/바다/선박 미지원, 사막 계열 미술을 청색 왕궁 스타일로 개선해야 함 | 우선 **독립 소스빌드·E2E 실사 검증** |
| The Free Game https://github.com/LucasMarquesShiva/the-free-game | 중세 3D/일꾼/도로/자원/병영, 브라우저 export, MIT 코드·CC BY 4.0 원본 아트 | Godot 4.7.2 export 도구필요, 모바일 품질 미완, 베타 | 차선 후보 |
| Unknown Horizons https://github.com/unknown-horizons/unknown-horizons | 완성도 높은 섬/선박/주택/자원/교역 2D 게임 | Python3+FIFE C++ + SDL 기반 데스크톱, GPLv2, GitHub Pages 단독 실행 불가 | 시각/게임 설계 참고만 |
| Widelands https://github.com/widelands/widelands | 오랜 기간 개발한 풍부한 정착/도로/물류/선박 | C++/SDL 데스크톱 및 GPLv2+; 일반 웹게임으로 바로 못 옮김 | 시스템 참고 |
| Fable Cities https://github.com/rawprogress/fable-cities | MIT Three.js 코드, 물/절벽/지형/카메라/조명·도로 | 현대 도시를 판타지로 전면 새 아트/규칙 제작해야 함 | 환경 렌더 기술 참고(라이선스 확인 후) |
| Selo Empire https://github.com/SeloSlav/medieval-settlement-threejs | 중세 고급 3D·강과 다리·중세 생산 모델 | MIT는 원본 **코드만**; 원본 미술/브랜드 재사용 금지, SpacetimeDB+Rust 서버 의존 | 코드 참조만, 아트 직접 가져오기 금지 |
| Cimulity https://github.com/zeikar/cimulity | MIT, 2.5D 맵/카메라/도로/시뮬, 브라우저 | 현대 도시 MVP, 전투·항구·왕국 아트 미완 | 후보 제외 |
| IsoCity https://github.com/amilich/isometric-city | MIT, 2D ISO 캔버스/트래픽/객체 상호작용 | 현대 빌딩/차량·NextJS 인프라, 중세 전환 폭 큼 | 엔진 참고 |
| Kingdom Architect https://github.com/trymnilsen/kingdomarchitect | 중세 브라우저/빌딩/영웅·ECS | **KASAL-1.0** 수정판·파생판 배포 제한, 전통적 오픈소스 아님 | 이식 제외 |
| Crown & Clan https://github.com/Sir-Teo/web-coc | 실제 게임 CoC형 건설·부대·레이드·반응형 UI | README에 **프로젝트 전체 재배포 허가 없음** 명시 | 복제/에셋 이식 제외 |
| Ironcrown https://github.com/fanaustinca/ironcrown | 순수 Canvas로 군사·해군·필드·월드 시스템 풍부 | LICENSE 파일 없음(코드/아트 재사용 허가 미확인), 그래픽은 전략 지도형 | 설계 참조만 |
| Age of Empires V https://github.com/aaditya-v-more/age-of-empires-v | 단일 HTML 오프라인 3D 중세 전략게임 | LICENSE 파일 없음, 실질 개작/배포 허가 미확인 | 복제 제외 |
| Freeciv-web https://github.com/freeciv/freeciv-web | 완성된 웹 2D/3D 4X·AI/멀티 | Java+Tomcat+Freeciv C 서버·AGPL, 왕국 건설 SLG보다는 Civilization식 턴제 | 후보 제외 |
| OpenSHC https://github.com/sourcehold/OpenSHC | Stronghold Crusader 원형 시스템 구현 노력 | 원본 정품 Stronghold 데이터 필요, 웹 단독 불가 | 후보 제외 |

## 이번 실제 준비: 원본 빌드 사전검증
독립 브랜치 `spike/rani-complete-isometric-base`에서 GitHub Actions `Evaluate Rani 2.5D Source Base (Fiefdom)` 수행.
- 업스트림 commit `8bb66ceeb5a8ec1f77ec899130090061c25078b3` 정확히 고정.
- 별도 Checkout -> LICENSE/서드파티/원본 파일 검사 -> `npm ci` -> `npm test` -> `npm run build` -> `dist` 아티팩트.
- **기존 Defense main의 GitHub Pages 배포, 세이브, 자산, SVG 보호, 경제/군사 코드 수정 없음.** 빌드 성공만으로 사용자가 원하는 디자인이 완성되었다고 말하지 않는다.

## 이식 전 필수 게이트
1. 별도 본판에서 실게임 로딩/건설/자원생산/배치/진행 저장/줌/터치/해상도 PC1440·1024 모바일390·320 자동 브라우저 실사 검증.
2. AGPL-3.0과 0 A.D. CC BY-SA 3.0 표기/배포소스 제공을 검증. 상용 독점 배포 계획과 충돌하면 Fiefdom은 코드 이식 금지하고 MIT+CC BY 후보(The Free Game)로 교체.
3. 2.5D 독립 자산 제작: 청색 왕궁·성벽/성문·주택·시장·병영·농장·항구·배·절벽·강/바다·폭포. 전용 Blender 카메라/조명 규격 단일화. 참고 시안 크롭 금지.
4. 실제 건설/진화/부대/항구/필드 기능이 작동할 때까지 기존 `main` 보존. 구 저장키 자동 포맷 교체 금지, 기존 16종 원본 에셋 백업 및 별도 이관 목록.
5. 합격한 원본에 한하여 브랜치 이식; 그 뒤 기능과 렌더/UI 최적화. 기존 로우폴리 패치의 끝없는 추가는 중단.
