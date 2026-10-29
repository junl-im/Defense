# 블록 서바이벌 TPS — 오픈소스/지식자산 조사 MASTER v0.1

- 조사 기준일: 2026-10-29
- 정식 저장소: https://github.com/junl-im/Defense
- 기존 라니킹덤 보존: `archive/rani-kingdom-v539-20261029`
- 신작 개발 브랜치: `feature/block-survival-tps-v01-20261029`
- 실제 배포 주소는 승인된 새 메인 빌드 이후 기존 `/Defense/`를 사용함. 현재 라니킹덤 공식 URL을 변경하지 않음.
- 신작 원칙: 브라우저/무료/PC+모바일/키보드+마우스+터치/3인칭 카메라/몬스터&좀비/마크보다 매끄러운 스타일/극한 경량화/SVG 자산 금지.
- **현 단계는 자산·소스 확보 단계.** 전투 시스템 구현이나 TPS 공개 배포로 오해하지 말 것.

## 원칙과 소스 관리

1. 이미 검증된 라니킹덤 소스와 Pages 배포 구성, 리소스, 라이선스, 저장을 보존한다. 신작과 섞지 않는다.
2. 공식 배포자·공식 GitHub의 자산을 우선한다. 광고성 재업로드, Minecraft/상용 게임 추출물·도용 텍스처는 반입하지 않는다.
3. **소스 URL·원본 SHA/릴리스·라이선스 원문·다운로드 날짜·수정 이력**을 자산마다 기록. CC0를 주장하는 제3자 인용만으로 최종 승인하지 않는다.
4. 무료 보급판만 확보한다. Patreon SOURCE/EXTRA와 무료판을 섞거나, 돈을 낸 적 없는 자료를 포함하지 않는다.
5. 자산은 `tps-next/assets/third_party/` 별도 격리. 게임 빌드에 전량 포함하지 않고 테스트 통과한 소량만 `runtime/`으로 이동한다.
6. 소스 재배포 시 해당 오픈소스 라이선스의 표시·소스 제공·고지 조건을 준수한다. CC0 이외 파일에는 LICENSE/NOTICE가 필요할 수 있다. 자신의 창작 소스·원화와 제3자 소스를 분리한다.
7. SVG 사용 금지: UI는 PNG/WebP 자산 또는 CSS/텍스트; 3D 원본은 GLB/glTF, 텍스처는 WebP/PNG.

## 엔진 3개 비교 — 본격 통합 전 소형 벤치마크

| 엔진 | 공식 소스·라이선스 | 장점 | 주의점 | 잠정 우선순위 |
|---|---|---|---|---|
| PlayCanvas Engine | https://github.com/playcanvas/engine · MIT | 경량 웹엔진, WebGL2/WebGPU, 자체 공개 3인칭 컨트롤러가 키보드·터치·게임패드 대응 | 컨트롤러의 충돌 Rigidbody·자산 로더 의존성 확인, 엔진 전체 번들 포함 금지 | **1순위 검토** |
| Babylon.js | https://github.com/BabylonJS/Babylon.js · Apache-2.0 | 게임 프레임워크·애니메이션·충돌·조명·입력 기능 완성도 | 기본 패키지 전체 import·물리 엔진 결합 시 초기 전송량 증가; 트리쉐이킹 필요 | 2순위 |
| Three.js | https://github.com/mrdoob/three.js · MIT | 작은 맞춤형 렌더러 구성, 로우폴리/인스턴싱/셰이더 조정 용이 | 캐릭터 충돌·입력·카메라·NPC 전투를 추가 개발해야 함 | 2순위 경량 대안 |

PlayCanvas 공식 3인칭 컨트롤러: https://github.com/playcanvas/engine/blob/main/scripts/esm/third-person-controller.mjs

**아직 엔진 최종 확정 아님.** 같은 기본 맵, 같은 1명 플레이어+12 적, 720p 모바일 DPR 1, 그림자 OFF 기준으로 첫 입력까지의 로드시간, JS/GLB 전송량, draw call, 배터리·프레임을 비교한다. 기존 TPS/슈팅 완제품을 통째로 복사하지 않는다.

### 전투·AI·월드에 추가 검토할 소스

| 목적 | 소스·라이선스 | 활용 판단 |
|---|---|---|
| 월드 표면 메쉬 | https://github.com/mikolalysenko/greedy-mesher · MIT | 블록형 지형의 숨은 면 제거/인접 면 합치기. 자유 블록 설치는 MVP 제외 |
| 클립·모델 최적화 | https://github.com/donmccurdy/glTF-Transform · MIT | glTF 검사, 애니메이션 정리, 중복 노드·정점 정리, WebP/KTX2 변환 |
| 적 길찾기 | https://github.com/donmccurdy/three-pathfinding · MIT | Three.js 선택 시 검토. 첫 MVP는 장애물 작은 맵+그리드 A*를 직접 제작 가능 |
| 고급 충돌 | https://github.com/dimforge/rapier/tree/master/typescript · Apache-2.0 | 초기엔 보류. 첫 MVP는 캡슐·AABB 충돌/지면 높이로 시작. 성능 검증 후 도입 |
| 무한 월드 서버 | https://github.com/voxelize/voxelize · MIT | Rust 서버·WebSocket 기반. GitHub Pages만으로 완성되지 않음. 멀티플레이 전까지 제외 |
| 렌더 샘플 | https://github.com/KhronosGroup/glTF-Sample-Assets | **자산별 라이선스 다름**, 테스트 모델만 사용. 일괄 CC0로 취급 금지 |

## 공식 CC0 자산 — 제작 우선순위

### 최우선 — 비주얼 일관성을 주도할 팩

1. [Quaternius Zombie Apocalypse Kit](https://quaternius.com/packs/zombieapocalypsekit.html) — 공식 페이지 CC0/60 모델/플레이어 4종·적 4종·개 2종·캐릭터당 20개 애니메이션. glTF/FBX/OBJ/Blend. 유일한 생존자+좀비의 통일된 기본 아트로 우선 검토.
2. [Quaternius Toon Shooter Game Kit](https://quaternius.com/packs/toonshootergamekit.html) — CC0/74 모델/캐릭터 17개 애니메이션. 좀비 팩과 섞을 경우 키·색감·스케일/본 구조 확인.
3. [KayKit Skeletons](https://github.com/KayKit-Game-Assets/KayKit-Character-Pack-Skeletons-1.0) — CC0 LICENSE.txt/무료 4개 리깅 캐릭터·90개 이상 애니메이션·단일 텍스처 아틀라스. **원본 GLB 1개당 대략 4.7~4.9MB**이므로 원본 그대로 모바일 제공 금지, 최적화+필요 클립만 추출.
4. [KayKit Halloween Bits](https://github.com/KayKit-Game-Assets/KayKit-Halloween-Bits-1.0) — CC0/60개 이상 묘지·울타리·고목. **원본 3개 묘지 소품(gltf+bin+공용 png) 8개 파일**을 GitHub SHA로 고정해 자동 반입 가능하도록 별도 스크립트 마련.
5. [Kenney Survival Kit](https://kenney-assets.itch.io/survival-kit) — CC0/70개 이상 생존 소품/glTF; 공식 페이지는 ZIP 1.8MB 표기. 의약품·도구·상자 선별.
6. [Kenney Blaster Kit](https://kenney.nl/assets/blaster-kit) — CC0/40 모델. 총기 외형·탄약/상자 후보.
7. [Kenney Nature Kit](https://kenney.nl/assets/nature-kit) — CC0/330 모델. 풀숲·나무·바위는 5~10종만 선별해 인스턴싱.
8. [Kenney Impact Sounds](https://kenney.nl/assets/impact-sounds) — CC0/130개. 피격/총탄/발걸음/소품 충돌에 적합한 파일만 압축 선별.

### 보조 자료

- KayKit Adventurers CC0/4인·75개 애니메이션: https://github.com/KayKit-Game-Assets/KayKit-Character-Pack-Adventures-1.0 (판타지 색감이라 최종 아트 보류)
- Quaternius Animated Zombie CC0/2모델·FBX/OBJ/Blend: https://quaternius.com/packs/animatedzombie.html (GLB 변환 필요)
- Quaternius Animated Guns CC0/6모델·FBX/OBJ/Blend: https://quaternius.com/packs/animatedguns.html
- Kenney UI Pack CC0/430 이미지: https://kenney.nl/assets/ui-pack (게임 전용 개별 PNG/WebP 버튼 우선)
- Poly Haven 텍스처/HDRI/모델 CC0: https://polyhaven.com/license (저해상도/단순 톤만 활용)

**팩 전체 다운로드와 게임 반입은 다른 단계다.** 웹 사이트가 직접 제공하는 ZIP은 수동 다운로드나 별도 승인된 경로가 필요할 수 있다. URL을 기록했다는 사실만으로 다운로드/게임 적용 완료를 주장하지 않는다.

## 실제 반입 작업 상태

| 대상 | 작업 | 현재 |
|---|---|---|
| KayKit Halloween 소품 세트 3종 | 고정 커밋+Git blob SHA+라이선스 기준으로 복원 | **자동 반입 도구 작성**. CI 다운로드·커밋은 실제 실행 후 확인 |
| Quaternius Zombie Kit | 공식 라이선스·모델 구성 조사 | **사용권 확인**, 대용량 원본 다운로드/애니메이션 검수는 미완료 |
| Kenney 생존/총기/자연/효과음 | 공식 CC0 확인·활용 부위 선정 | **사용권 확인**, 원본 다운로드·파일 선택은 미완료 |
| 엔진 | 3종 라이선스·구성 비교, 컨트롤러 원본 확인 | **이식 가능성 검토**, MVP 엔진 미확정 |

## V0.1 생존 TPS 범위

- 1개 숲·폐허 경계 지형, 1개 3인칭 캐릭터, 2개 무기(권총·라이플), 2개 적(느린 좀비·빠른 좀비), 1개 드랍 아이템(응급키트).
- 실제 총격: 히트스캔 명중 판정 + 총탄 흔적/피격 효과(간단 파티클) + 탄약/장전.
- AI: 탐지·추적·회피·공격·피격·사망, 비가시/원거리 적의 AI 주기 축소.
- PC: WASD, 마우스 이동/조준/사격, Shift 달리기, Space 점프, R 장전.
- 모바일: 왼손 이동 패드, 오른손 카메라 조작, 엄지로 조준/사격, 큰 점프·장전 버튼, 전체화면 및 안전영역 반영.
- HUD: 체력·탄약·현재 웨이브·일시정지. 리소스 채집·제작·무한 월드·PvP·멀티플레이는 제외.
- 저장: 설정/진행도/최고 웨이브만 localStorage; 기존 라니킹덤 저장 키는 절대 접근하지 않음.
- 초보 튜토리얼: 이동→시선 돌리기→첫 좀비 처치→회복, 4단계만.

## 경량화 검수 수치 (프로젝트 목표, 실측값 아님)

- 초기 화면 표시 리소스 전송량: 최대 5MB 우선 목표, 첫 플레이까지 총 12~20MB 상한 목표. 파일 크기/캐시 실측 후 조정.
- 모바일은 **30FPS 목표**, 데스크톱은 60FPS 목표 (저사양 기기는 성능 정책에 따라 자동 절전).
- 모바일 동적 렌더 비율 기본 1, 성능 측정 후 1.25 상한. 절전/균형/선명 수동 설정.
- 첫 맵 1개/동시 활성 좀비 8~12마리/카메라 밖 업데이트 축소/보이는 지형 3~5 청크, 그림자 0~1개.
- 캐릭터와 적을 매 프레임 생성/삭제하지 말고 오브젝트 풀. 렌더 호출 수와 네트워크 요청 수를 기록.
- 모든 모델의 glTF 유효성, 리깅/걷기/공격/사망 애니메이션/무기 손 소켓 검증. 원본 형식 유지+용량 최적화 파생본 별도 생성.
- 모바일 실제 Chromium 성능 프로파일 검증 없이는 '몇 % 가벼워졌다'고 주장하지 않음.

## 다음 개발 진입 조건

1. KayKit 3개 소품의 원본/텍스처/CC0/LICENSE가 검증되고 변조 없는 반입 결과가 저장돼 있어야 함.
2. Quaternius 60 모델 팩은 샘플 캐릭터/좀비의 애니메이션 명칭과 본 구조, 실제 GLB 파일 크기를 조사.
3. PlayCanvas와 Babylon.js 또는 Three.js 중 단순한 동일 TPS 장면으로 로드/입력/FPS 비교.
4. 우선 카메라·입력·1맵·적 2종·사격을 프로토타입으로 만든 뒤 확장.
5. 기존 `Defense` Pages를 TPS로 전환하기 전에 라니킹덤 아카이브 복원 가능 여부와 TPS 브라우저 QA·모바일 QA를 모두 검증.

**저작권:** © 2026 곰같은여우 — 이 프로젝트에서 새로 제작한 코드·설정·자산에 관한 권리는 해당 창작자에게 귀속. 단, 외부 CC0/오픈소스 자산과 외부 엔진의 권리는 각 원 라이선스가 적용되며, 사용자가 그 자산의 독점적 권리를 취득하는 것은 아님.
