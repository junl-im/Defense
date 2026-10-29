# Block Survival TPS — 오픈소스 확장·실제 확보 MASTER (2026-10-29)

> 기준: 이 문서는 기존 OPEN_SOURCE_ASSET_MASTER_KO.md, ACQUISITION_STATUS_KO.md, source-lock.json을 보충한다. 원본 기록을 덮어쓰지 않는다. 참고/입수/런타임 적용을 반드시 구별한다.

## 1. 공식 프로젝트와 보존 정책

- GitHub: https://github.com/junl-im/Defense — 게임 코드 및 라이선스·출처 최종 이력 기준
- TPS 공식 작업 경로: BlockSurvivalTPS/ 한 곳. tps-next/는 과거 자산 원본 검증·출처 전용
- 보존된 라니킹덤: archive/rani-kingdom-v539-20261029
- 기존 main 및 https://junl-im.github.io/Defense/ 는 아직 라니킹덤. TPS 자동 교체 금지
- 사용자 창작 자산·신규 코드는 © 2026 곰같은여우, 서드파티 자산은 원 라이선스. 외부 자산을 사용자 독점 저작물로 오인시키지 않음
- SVG 금지. PNG/WebP/GLB/glTF의 선별 사용. 외부 게임의 고유 IP·에셋 무단 복사 금지

## 2. 실제 확보 완료 — 증거 있는 것만

| 분류 | 취득 실물 | 상태 | 영구성 |
| --- | --- | --- | --- |
| KayKit CC0 검증 ZIP | 4개 원본 저장소에서 해시·라이선스 확인해 선별한 4,543,207바이트 ZIP | GitHub Actions #40851957037 성공, 아티팩트 12887163429, SHA256 3024a2b59dec91906884123bd0e0ca734ade5d693ac000ddde2f40c223dd651d | GitHub 기한 11/1, Drive에도 별도 복제 완료 |
| KayKit Halloween 3종 | 묘비·고목·파손 울타리의 glTF/BIN/공유 PNG/CC0 고지 | TPS 브랜치 tps-next/assets/third_party/kaykit-halloween-1.0/에 원본 Git Blob 잠금 | GitHub 커밋 영구 보존 |
| 코드 후보 및 공식 다운로드 링크 | 출처·라이선스·HEAD SHA를 확인한 참조 목록 | 검토 완료, 소스 전체를 복제하거나 런타임에 넣지 않음 | 본 문서와 원본 링크로 재현 |

- Drive 별도 자료실: https://drive.google.com/drive/folders/1FkQmOXlwHuUWWoGAp4cmg2WB2tfvL6pt
- Drive 실물 ZIP: https://drive.google.com/file/d/1dyKI8ucFWQbKYKG-J1Cr8KBb9Col5AZC/view
- Drive 파일 크기 4,543,207바이트 확인. GitHub artifact SHA256과 Drive 자체 해시의 재계산까지 완료했다고 주장하지 않음.

## 3. 추가로 찾은 실전 오픈소스 코드 — 의존성·권리 확인 후 선별 이식

아래 HEAD는 2026-10-29 조사 시점 참고 커밋. 재사용 시 해당 커밋의 실제 코드/NOTICE를 읽고 필요한 기능만 전용 파일로 이식한다. 코드 MIT가 동봉 이미지·음악·모델의 사용권을 보증하지 않는다.

| 우선 | 오픈소스와 핀 SHA | 실제로 참고할 부분 | 권리/주의 |
| --- | --- | --- | --- |
| A | Thalvorn FPS/TPS: https://github.com/scaleto/Thalvorn-FPS-Shooter @ fb78fb8a5bcdd544b3720542bd6904653a605aea | 1인칭/3인칭 전환, 3D 카메라, 프로시저럴 지형, 기본 HUD, 이동/사격 | GitHub LICENSE MIT 확인, Babylon/WebSocket·멀티플레이 의존부는 초기 제외 |
| A | Dead Signal: https://github.com/bridge-mind/claude-opus-5.5-zombies-game @ 9805c3ef6297e8f518fdfb75f58a7af599334013 | 좀비 AI 상태기계, 고정 시뮬레이션, 탄약·리로드·히트스캔, 월드 AABB/그리드, Vite/TS 단위 테스트 | GitHub LICENSE MIT 확인, 기본 FPS·데스크톱 중심. TPS·모바일을 별도 설계 |
| A | SANDLINE: https://github.com/xilinnihao-afk/sandline-threejs-fps @ a68a2b0b62d49e8aca47d082a00ab12d5cdfa2ec | 모바일 이동 조이스틱, 드래그 조준/발사, 탭 확대 방지, 카메라 흔들림 분리, 봇 AI | GitHub LICENSE MIT 확인, 제3자 에셋은 별도·프로젝트 미포함 |
| B | Ashworth Station: https://github.com/AUAggy/ashworth-station @ 1c4ccbd0faa0e8d5e92d807b98df26469f2a8861 | 웹에서 15웨이브 좀비 생존, 마우스/터치 대응, 단일 HTML 부팅 | GitHub LICENSE MIT 확인. FPS 구조 전체 복사 금지, 필요한 웨이브 컨셉과 입력 예외만 참고 |
| B | Der Koloss CE: https://github.com/rishipr/der-koloss-ce @ 14641bbeb502c5e45a2aefaf9ebaac2118bbd237 | 충돌·카메라·발사 오클루전·성능 경계 자동 검증 27개 | 코드 MIT이나 NOTICE에 상용 게임 관련 비자유 노래 포함: 오디오/아트 일괄 반입 금지 |
| 제외 | threejs-fps-tps-starterkit-advanced: https://github.com/hugohamelcom/threejs-fps-tps-starterkit-advanced @ fae654e52eb18949f51dd0b8ac066938c3067317 | FPS/TPS 카메라 비교 아이디어 | README의 MIT 주장과 달리 저장소 LICENSE 파일이 404, 재사용 전 소유자 라이선스 확인 필수 |

기존 조사에 있는 PlayCanvas 공식 3인칭 컨트롤러는 MIT 엔진의 공식 예제이며, 카메라/충돌/키보드/터치/게임패드 설계의 1차 원본으로 유지: https://github.com/playcanvas/engine/blob/main/scripts/esm/third-person-controller.mjs

## 4. 캐릭터·좀비·총기·맵·UI·사운드 추가 탐색

| 자산 | 출처 | 권리 검증 | 확보 상태·적용 판단 |
| --- | --- | --- | --- |
| Kenney Animated Characters Survivors | https://kenney.nl/assets/animated-characters-survivors | 공식 페이지 CC0 | 아직 ZIP 미입수. 실제 좀비/생존자 애니메이션 첫 비교 A |
| Kenney Animated Characters Retro | https://kenney.nl/assets/animated-characters-retro | 공식 페이지 CC0 | 아직 미입수. 마크보다 한 단계 진화한 복고 블록 실루엣 A/B |
| Kenney Survival Kit | https://kenney.nl/assets/survival-kit | 공식 페이지 CC0, 2.0/80 파일 표시 | 기존 등록 갱신. 의료·보급 아이템용 선별 4종, 팩 전체 게임 반입 금지 |
| Quaternius Zombie Apocalypse Kit | https://quaternius.com/packs/zombieapocalypsekit.html | 해당 팩 페이지 CC0 표기, 2024년 60모델 | 미입수. 4 생존자·4 적·2개 모델, glTF·애니메이션 권리 증거와 실제 다운로드 ZIP 동봉 라이선스 재검수 |
| Quaternius Toon Shooter Kit | https://quaternius.com/packs/toonshootergamekit.html | 해당 팩 페이지 CC0 표기 | 미입수. 현대 총기·환경의 통일성 검토 |
| KayKit Skeletons/Adventurers/Halloween/Prototype | 공식 KayKit GitHub 4개, 정확한 잠금 source-lock.json | 저장소 LICENSE.txt CC0, 고정 커밋 | 실제 선별 ZIP과 일부 영구 Git blob 확보, 모델 최적화 미완료 |
| Kenney Nature, Blaster, UI, Impact | https://kenney.nl | 개별 공식 자산 페이지 CC0 | 기존 후보. 아직 실제 ZIP·런타임 검증 전 |
| glTF-Transform / meshoptimizer | https://github.com/donmccurdy/glTF-Transform / https://github.com/zeux/meshoptimizer | MIT | 모델 최적화 파이프라인 도구 후보. 원본과 파생본 분리 |

### 반드시 막을 라이선스 사고

- Quaternius 신규 QAL v1.0 (2026-08-28)은 **기존 개별 CC0와 다른 조항**을 갖는다. 게임 속 사용은 가능해도 독립 자산 재배포 제한. 자료 취득 시 실제 팩 라이선스 스냅샷 기록 전에는 GitHub 공개 저장소에 게시 금지.
- glTF Sample Assets는 모델마다 개별 권리. FPS 프로젝트가 MIT여도 외부 상용 게임 음악, 로고, 도용 텍스처, 유료 폰트 및 캐릭터는 반입 금지.
- Kenney 페이지의 CC0라도 실제 ZIP 버전, 정식 출처, 개별 확장 파일을 체크한다.
- 기존 라니킹덤 Fiefdom/AGPL 원본 게임 코드 또는 아트를 신작에 무조건 혼합하지 않는다.

## 5. 실제 통합 전 실행 순서

- [x] 기존 라니킹덤 아카이브와 TPS 단일 코드 루트 확인
- [x] KayKit 선별 실물 원본 4.54MB 취득, GitHub SHA·라이선스 검사 성공
- [x] 만료 전 해당 ZIP Google Drive 별도 보관, 파일 크기 대조
- [x] 공식 코드 후보 추가 6종 GitHub MIT LICENSE / HEAD 비교 (1종 라이선스 불명, 1종 비자유 음악 포함 경고)
- [ ] 신규 Kenney/Quaternius 공식 무료 팩의 실제 다운로드 파일+라이선스 증빙 취득
- [ ] 캐릭터 1/좀비 2/소품 7종을 애니메이션·텍스처·폴리곤·용량 수치로 검증
- [ ] 선택한 런타임 GLB만 압축/분리 저장, 원본 ZIP은 자료실에 유지
- [ ] PlayCanvas/Three 동일 장면의 모바일 메모리·FPS·입력·초기 전송량 실제 비교
- [ ] 실전 TPS 전투 첫 수직 단면 및 PC/모바일 10회 플레이 QA
- [ ] 원본 라니킹덤을 손대지 않은 별도 프리뷰를 사용자에게 검토받고 마지막에 Pages 공개 전환

## 6. 다음 자산 입수 티켓

P0-1: Kenney Survivors/Retro 2개 ZIP 공식 무료판, CC0 증거, 1 캐릭터+2 좀비 애니메이션 실사.
P0-2: Quaternius Zombie Kit 1개 ZIP 실제 팩 고지·모델 60종 명세·상업/저장소 재배포 검수.
P0-3: KayKit 선별 ZIP 3 캐릭터를 GLB 경량화 후 원본 대비 크기, 걷기/공격/사망/총기 손 소켓 확인.
P0-4: Dead Signal AI·히트스캔 테스트와 SANDLINE 모바일 컨트롤 설계를 별도 비교 문서에 기록.
P1-1: Kenney Blaster/SFX/Nature/Survival 파일 10~20개만 우선 채택하고 총기/폭발/피격 볼륨 통일.
P1-2: 서버 없이 GitHub Pages 싱글플레이, 모델 수요량 정량 측정 후에만 추가 자산 확대.

**중간 단계의 출처 링크는 실제 게임 자산 확보 완료가 아니다.** 각 입수본은 원본 URL·버전·라이선스·해시·다운로드 시간·선택 파일·실제 게임 사용처가 기록될 때만 '확보'로 승격한다.

## 7. 2차 실제 확보 체크포인트 — 도시 7모델 포함 KayKit 5팩

- GitHub 취득 검증: https://github.com/junl-im/Defense/actions/runs/40864857212 — `success`, 5개 공식 GitHub CC0 원본 저장소, 총 34개 선별 파일, 보존된 Rani Kingdom 및 SVG 0개 QA 통과.
- 신규 팩 출처: https://github.com/KayKit-Game-Assets/KayKit-City-Builder-Bits-1.0 @ `63976910ca04d16f0fc531b9c614244be8128713` — 소스 저장소 `LICENSE.txt` CC0 확인.
- 7개 도심 모델 `building_A`, `car_police`, `road_straight`, `streetlight`, `dumpster`, `trash_A`, `trafficlight_A`; 각각 glTF/BIN, 공유 텍스처 PNG를 종속 파일로 함께 확보. 골격을 갖춘 첫 도시·엄폐 장면 후보이며 플레이 장면 적용 이전 상태.
- 신규 GitHub 아티팩트 12892738994, **4,620,133 bytes**, GitHub 표시 SHA256 `4f538cc0077e74a36e62ef8ca8279c636a3ee2492933e9929e90c1d2ac0c4fd2`; 2026-11-01 11:22 UTC 만료 예정.
- 별도 Drive 장기 보관 ZIP: https://drive.google.com/file/d/1qDYe7rfrd97hQAivTX7pbeQLKpPuR5m4/view — metadata 크기 **4,620,133 bytes** 및 전용 폴더 소속 확인. Drive SHA256 해시 자체 계산은 아직 안 함.
- 첫 4팩 https://drive.google.com/file/d/1dyKI8ucFWQbKYKG-J1Cr8KBb9Col5AZC/view 은 비교 이력으로 보존. 둘은 버전이 다른 검증 ZIP이며 중복 파일을 런타임에 두 벌 넣지 않음.
- 이 시점 `source-lock.json`, 취득 스크립트, 레지스트리 테스트, Actions 5팩 검사를 갱신하여 성공. 다음에는 **Kenney/Quaternius 공식 배포 파일의 권리 포함 원본 확보 → 1 생존자·2 좀비 애니메이션/무기 실사 → 실제 GLB 경량화** 순서.
- 관련 노션 MASTER: https://app.notion.com/p/408fff243ec9818fb23dd6134fda816a
- Google Docs 협업 기준본: https://docs.google.com/document/d/1RkaKR5uoOXD6cDf5yq8tMjpg3aiLSghlc9J5KoIHDWo/edit


## 8. 3차 실제 확보 체크포인트 — Kenney 미디어를 더해 6출처 45파일

- Kenney 제작자 공식 [FPS Starter Kit](https://github.com/KenneyNL/Starter-Kit-FPS) @ `185fd2326d74a5cf858cffc616f87cf9696f9cc0`; README는 코드 MIT, **2D/3D/효과음 미디어 CC0**로 범위를 따로 명시. 폰트 OFL, Godot `.gd` 코드, Vector/SVG는 선별 외.
- 정확한 11개 신규 선별 파일: `models/blaster.glb`, `models/blaster-repeater.glb`, `models/Textures/colormap.png`, `sounds/{blaster,blaster_repeater,enemy_attack,enemy_hurt,enemy_destroy}.ogg`, `sprites/{crosshair,crosshair-repeater,hit}.png`. 복합 저작권 범위를 코드 검증으로 강제.
- 6개 공인 GitHub 원본·45개 파일 취득: https://github.com/junl-im/Defense/actions/runs/40867270379 — `success`; `source-lock.json` 6 소스 SHA 고정.
- GitHub artifact `12893428895` / **4,728,925 bytes** / artifact SHA256 `576b3d9da4bab9971600e1e0c8b70bc89375f0a1274715c78ddcef42db2a19b6` / 만료 2026-11-01 11:41 UTC.
- **[최신 6출처·45파일 ZIP Google Drive](https://drive.google.com/file/d/176G5mIHrMu0h_lrmjn-tej-kIv_lXDV8/view)** — 저장 크기 **4,728,925 bytes** 일치, 전용 폴더 소속 확인. Google Drive 자체 SHA256은 미재계산. 구형 [4팩](https://drive.google.com/file/d/1dyKI8ucFWQbKYKG-J1Cr8KBb9Col5AZC/view)·[5팩](https://drive.google.com/file/d/1qDYe7rfrd97hQAivTX7pbeQLKpPuR5m4/view)도 함께 보관.
- **애니메이션 후보 재평가**: Kenney [Mini Characters](https://kenney.nl/assets/mini-characters) 공식 CC0·애니메이션; [Blocky Characters](https://kenney.nl/assets/blocky-characters) 공식 CC0·블록 스타일; [Vuena 무료 블록 캐릭터](https://vuena.itch.io/blocky-characters-free-sample) CC0 표시·8종 중 좀비 포함/6 클립. 현재는 링크와 스펙 조사까지이며 원본 ZIP 미취득.
- **개발 순서**: 최신 ZIP 속 총기/OGG/PNG 실제 렌더·청취·지연 실사, 좀비/생존자 다운로드 팩 원본 획득과 라이선스 확정, 캐릭터 IK/손 소켓/애니메이션 상용 웹 GLB 최적화, 모바일 실측.
- **주의**: 연구·취득/검증 성공은 게임에서 작동했다는 뜻이 아님. 기존 main의 라니킹덤은 미변경.
