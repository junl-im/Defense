# TPS 자산 실사·확보 상태 — 2026-10-29

**프로젝트의 공식 코드/기획 폴더는 `BlockSurvivalTPS/` 하나다.** 기존 라니킹덤은 `archive/rani-kingdom-v539-20261029` 브랜치에서 보관하며, 현재 `main`의 배포 구성을 변경하지 않는다.

## 확인 가능한 취득 결과

### A. 4개 KayKit 원본 저장소의 고정 커밋 수집

- 입수/라이선스 검사: [Actions #40851957037](https://github.com/junl-im/Defense/actions/runs/40851957037) — **success** 확인
- 수집물: [검증 자산 아티팩트 #12887163429](https://github.com/junl-im/Defense/actions/runs/40851957037/artifacts/12887163429)
- ZIP 전송 크기: 4,543,207 bytes (약 4.54 MB), `sha256:3024a2b59dec91906884123bd0e0ca734ade5d693ac000ddde2f40c223dd651d`
- **만료 예정일: 2026-11-01 09:44 UTC.** GitHub Actions 아티팩트는 영구 보관본이 아니다. 이후 원본은 `source-lock.json`의 SHA가 고정된 4개 공식 GitHub 저장소에서 언제든 재수집한다.
- 자산 목록/원본 커밋: [source-lock.json](./source-lock.json), 검사/취득 도구: [acquire-open-assets.mjs](../tools/acquire-open-assets.mjs)
- 구성: KayKit Skeletons 해골 2종, Adventurers Knight 1종, Halloween 묘지 소품, Prototype 블록형 지형·상자. 아직 최종 좀비/생존자 디자인이 아님.
- **입수 성공 != 경량화 완료 != 게임에 실제 반영 완료**. 런타임 전용 GLB로 변환하고 애니메이션·콜라이더·모바일 텍스처를 검수할 것.

### B. 공식 Git Blob으로 잠근 소형 묘지 원본 3종 영구 보관

- 경로: [tps-next 자산 검수실](../../tps-next/assets/third_party/kaykit-halloween-1.0/)
- 묘비/울타리/고목 glTF + BIN + 공용 PNG + CC0 LICENSE.txt + PROVENANCE.json
- 8개 원본 파일 용량 합계 69,204 bytes (정확한 바이트는 파이프라인 검사 출력이 기준). 원본 Git SHA-1 40자 검증 후 **TPS 작업 브랜치에 영구 커밋**되어 3일 Actions 아티팩트와 다르다.
- 재수집·검사 도구: [acquire-seed.mjs](../../tps-next/tools/acquire-seed.mjs) / [단위테스트](../../tps-next/tools/acquire-seed.test.mjs)
- [자산 전용 CI #40851948846](https://github.com/junl-im/Defense/actions/runs/40851948846) 성공.
- `tps-next/`는 **원본 아카이브·출처 관리만 하는 격리된 자료실**이며 앞으로 플레이 코드를 두지 않는다. 전투/월드/조작 코드의 단일 작업 루트는 `BlockSurvivalTPS/`. 최종 채택분만 이관해 중복 런타임 파일을 만들지 않는다.

### C. 추가 확보 — 5번째 KayKit City Builder Bits 7개 도시 모델

- 입수/정적 검사: [Actions #40864857212](https://github.com/junl-im/Defense/actions/runs/40864857212) — **success**. 원본 Rani Kingdom 보존, 고정 SHA, 원 라이선스, SVG 금지 검사 통과.
- 새 원본: [KayKit-City-Builder-Bits-1.0](https://github.com/KayKit-Game-Assets/KayKit-City-Builder-Bits-1.0) `63976910ca04d16f0fc531b9c614244be8128713`, 저장소 `LICENSE.txt` CC0 직접 확인.
- 5개 공식 저장소·총 34개 선별 파일을 자동 취득하는 `source-lock.json`과 테스트를 적용. 이번 추가분은 7개 glTF 모델 + 종속 BIN + 텍스처: `building_A`, `car_police`, `road_straight`, `streetlight`, `dumpster`, `trash_A`, `trafficlight_A`.
- GitHub [검증 아티팩트 #12892738994](https://github.com/junl-im/Defense/actions/runs/40864857212/artifacts/12892738994): 4,620,133 bytes, GitHub 표기 SHA256 `4f538cc0077e74a36e62ef8ca8279c636a3ee2492933e9929e90c1d2ac0c4fd2`. **GitHub 보존 기한 2026-11-01 11:22 UTC**.
- [구글 드라이브 5팩 ZIP 영구 보관본](https://drive.google.com/file/d/1qDYe7rfrd97hQAivTX7pbeQLKpPuR5m4/view): 크기 **4,620,133 bytes**, 지정 폴더 소속 확인. Drive 자체 SHA256 해시를 재계산한 것은 아님.
- 앞서 저장한 **4팩 4.54MB ZIP은 삭제하지 않고** 동일 폴더에 유지. 서로 다른 수집 단계의 재현용 체크포인트.
- **검증/보관은 실제 게임 적용과 다름**: glTF→GLB, 종속 경로, 렌더링, 충돌·최적화·모바일 FPS 실측은 후속 작업.



### D. 6번째 공식 출처 — Kenney FPS Starter Kit의 CC0 **미디어만** 별도 확보

- 공식 원본 [KenneyNL/Starter-Kit-FPS](https://github.com/KenneyNL/Starter-Kit-FPS) @ `185fd2326d74a5cf858cffc616f87cf9696f9cc0` — 해당 README에 **2D sprite·3D model·sound effect CC0**로 명시. **프로그램 Godot 소스는 MIT**, 동봉 폰트는 별도 OFL이므로 이 팩에서 제외.
- 실제 추가 선택 **11개**: 총기 GLB 2, colormap PNG 1, 사격·적 공격·피격·사망 OGG 5, 조준점·피격 표시 PNG 3. SVG·Godot `.gd`·폰트·렌더 스크린샷은 수집하지 않음.
- **6개 출처, 45개 선별 파일**의 SHA 고정·라이선스 증빙·원본 보존 검사 [Actions #40867270379](https://github.com/junl-im/Defense/actions/runs/40867270379) **success**.
- [검증 GitHub 아티팩트 #12893428895](https://github.com/junl-im/Defense/actions/runs/40867270379/artifacts/12893428895) — 4,728,925 bytes, GitHub 표시 SHA256 `576b3d9da4bab9971600e1e0c8b70bc89375f0a1274715c78ddcef42db2a19b6`, 만료 2026-11-01 11:41 UTC.
- [6출처 검증 ZIP Google Drive 보관본](https://drive.google.com/file/d/176G5mIHrMu0h_lrmjn-tej-kIv_lXDV8/view) — Drive 실제 저장 크기 **4,728,925 bytes** 및 지정 폴더 소속 검증. Drive 저장물의 SHA256은 별도 재계산하지 않음.
- 이전 4팩/5팩 ZIP은 이력과 롤백용으로 모두 남김. 본 6출처가 현재 최신 선별 원본 묶음. **게임 런타임에 적용된 것은 아직 아님.**
- [Kenney Mini Characters](https://kenney.nl/assets/mini-characters) (애니메이션), [Kenney Blocky Characters](https://kenney.nl/assets/blocky-characters) (블록형), [Vuena Blocky Characters CC0](https://vuena.itch.io/blocky-characters-free-sample) (좀비 포함 8종·6클립) 추가 후보. 공식 ZIP은 **미확보**, 다운로드 파일 라이선스·리깅 품질을 검수해야 함.

## 공식 좀비·생존자 디자인의 1순위

1. [Quaternius Zombie Apocalypse Kit](https://quaternius.com/packs/zombieapocalypsekit.html) — **해당 팩 페이지에 CC0 표시**, 총 60 모델, 4 생존자/4 적/2 개/생존자당 애니메이션 20개. FBX, OBJ, glTF, Blend. 첫 검수 대상.
2. [Quaternius Toon Shooter Game Kit](https://quaternius.com/packs/toonshootergamekit.html) — **해당 팩 페이지에 CC0 표시**, 총 74 모델, 캐릭터 애니메이션 17개. 총격·캐릭터·환경 팩으로 보강.
3. **주의:** Quaternius가 2026년에 도입한 QAL 등 약관과 과거 **개별 CC0 팩 표기가 다를 수 있다.** 모델을 공개 저장소에 업로드하기 전에 실제 다운로드 파일의 라이선스·무료 Standard 여부·재배포 조건을 확인하고 근거를 기록. 링크만 있는 상태를 확보 완료로 표기하지 않는다.
4. [Kenney Survival Kit](https://kenney-assets.itch.io/survival-kit) — CC0, 모델 70+, ZIP 1.8MB 공식 안내. 구급상자·조합 소품 후보.
5. [Kenney Blaster Kit](https://kenney.nl/assets/blaster-kit) — CC0, 40개 모델. 임시 총기.
6. [Kenney Nature Kit](https://kenney.nl/assets/nature-kit) — CC0, 나무·바위 330개. 실제 게임에는 선별해 소량만 넣는다.
7. [Kenney Impact Sounds](https://kenney.nl/assets/impact-sounds) — CC0, 130효과음. 필요한 4~8개만 압축해 채택.

## 코드 소스 비교에서 추가 확보한 유용한 기술

- [PlayCanvas 정식 Third Person Controller](https://github.com/playcanvas/engine/blob/main/scripts/esm/third-person-controller.mjs): MIT 엔진 내 공식 코드. 카메라 추적, 충돌 회피, 키보드/마우스/터치/게임패드, 점프/질주, 애니메이션 이벤트 등을 참조 가능. **Rigidbody 등 의존성 검수 후** 채택. 단순 코드 복사보다는 필요한 부분만 버전 고정해 이식.
- [glTF-Transform](https://github.com/donmccurdy/glTF-Transform): MIT. 모델 검사, 텍스처 WebP/KTX2, 노드 병합, Meshopt 최적화. 원본 애니메이션이 사라지는지 확인하는 자동 검사가 필수.
- [greedy-mesher](https://github.com/mikolalysenko/greedy-mesher): MIT. 보이는 블록 면 병합에 사용 가능. MVP에 무제한 파괴/건설은 필요 없다.
- [Poly Haven](https://polyhaven.com/license): CC0. 8K HDRI 대신 작은 압축본만 검토.
- [Khronos glTF Sample Assets](https://github.com/KhronosGroup/glTF-Sample-Assets): **모델마다 개별 라이선스가 다름**. 샘플 전체를 자유 사용 게임 에셋으로 포함 금지.

## 개발로 넘어가기 전 품질 게이트

- 캐릭터 1종 + 좀비 2종의 GLB 로드, 걷기/피격/죽음 동작, 3인칭 카메라, 무기 손 부착, 사격 명중/회피/재장전 필수.
- 각 모델은 원본 SHA·라이선스·원본 용량·최적화 후 용량·애니메이션 목록·텍스처 용량·실측 평균 FPS를 기록.
- **목표이지 실측 성능 아님**: 처음 접속 3~8MB 이내, 모바일 30FPS, 데스크톱 60FPS, 최대 8~12 활성 적, 얇은 HUD.
- SVG 0개; 게임 메인/레거시 저장 키 분리, 원본 라니킹덤 아카이브 유지.
- 새로운 TPS를 공개 `/Defense/`에 게시하는 작업은 별도 검증/승인 단계. 현재 라니킹덤 공개 주소는 변경하지 않았다.

## 단일 기준 파일

- 우선 원본 아카이브/5개 공식 GitHub 저장소 수집 기준: `BlockSurvivalTPS/research/source-lock.json`
- 전체 후보 및 라이선스 조사 확장: `tps-next/research/SOURCE_REGISTRY.json` 및 `tps-next/research/OPEN_SOURCE_MASTER_KO.md`
- 게임 기획·코드·자산 통합 개발은 `BlockSurvivalTPS/`만 사용.
