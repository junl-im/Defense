# 블록 서바이벌 TPS — 오픈소스·3D 자산 실사 기준본 (2026-10-29)

**작업 단계: 원천 자료 조사 → 권리 확인 → 원본 취득·해시 잠금 → 최적화 검수. 게임 제작은 아직 시작 전.**

- 대상 저장소: `junl-im/Defense` — https://github.com/junl-im/Defense
- 라니킹덤 보존: `archive/rani-kingdom-v539-20261029` 브랜치. 기존 원본 `rani-next/`, `engines/`, `assets/rani/` 및 저장 포맷 보존.
- 이 조사 자료는 `BlockSurvivalTPS/research/`에만 저장. 공개 Pages 메인 게임 교체 작업은 아직 하지 않음.
- 목표: 로우폴리/블록 지형 + 조금 더 부드러운 캐릭터 + 3인칭 카메라 + 몬스터/좀비 + 온라인 의존 없는 무료 싱글플레이. **SVG 사용 금지.**
- 제작본 권리: 자체 제작 코드·디자인·캐릭터·고유 콘텐츠 © 2026 **곰같은여우**, 외부 오픈소스/CC0는 원 권리·라이선스 고지에 따라 별도 관리.

## 1. 후보 엔진 및 핵심 소스 실사

| 부품 | 원천(직접 주소) | 확인한 권리 | 채택 판단 |
|---|---|---|---|
| Three.js + glTF Loader + InstancedMesh | https://github.com/mrdoob/three.js | MIT | **P0**. 단순 렌더 루프, 기존 웹 개발 경험, 적은 의존성. 직접 TPS 카메라·충돌 구현 |
| PlayCanvas Engine | https://github.com/playcanvas/engine | MIT | **대안 A**. 모바일 최적화 및 WebGL2/WebGPU 이점. 실제 초기 다운로드 크기로 비교 |
| Babylon.js | https://github.com/BabylonJS/Babylon.js | Apache-2.0 | **대안 B**. 강력한 게임 기능, 처음엔 불필요한 런타임 증가에 주의 |
| Yuka Game AI | https://github.com/Mugen87/yuka | MIT | **P1**. 적 상태/추적/회피, 우선은 경량 상태 머신으로 시작 |
| Rapier JS | https://github.com/dimforge/rapier/tree/master/typescript | Apache-2.0 JS bindings | **P2**. 복잡한 물리/넘어짐이 필요할 때. 기존 rapier.js repo는 2026년 7월 아카이브됨 |
| three-mesh-bvh | https://github.com/gkjohnson/three-mesh-bvh | MIT | **P1**. 대형 지형 충돌·사격 Raycast 가속; 움직이는 뼈대에 정적 BVH 직접 적용 금지 |
| nipplejs | https://github.com/yoannmoinet/nipplejs | MIT | **P1**. 좌측 모바일 가상 조이스틱; 직접 구현 vs 번들 크기 비교 |
| gltfpack / meshoptimizer | https://github.com/zeux/meshoptimizer/tree/master/gltf | MIT | **P0**. GLB 폴리곤·애니메이션·모델 다운로드 압축 |
| KTX2 + Basis Universal | https://github.com/KhronosGroup/KTX-Software | Apache-2.0 및 개별 컴포넌트 조건 | **P1**. 모바일 GPU 메모리 절약, 처음엔 플랫 컬러/소형 팔레트 텍스처로 시작 |
| Node/Vite | https://vite.dev | MIT | **P0**. 순수 정적 웹 빌드, 서버 비용 0 |

## 2. 실제로 가져올 수 있는 3D 팩 — 명확한 CC0

**기본 원칙:** 저작권 공여 CC0 1.0 원본만 자동 수집. 게임에 바로 게시하지 않고 `acquired/` 임시 검수 폴더에 둔다. 정확한 원천 커밋·파일 목록은 [source-lock.json](./source-lock.json)이 기준.

| 우선 | 원천/라이선스 | 실사 내용 | 적용 범위 | 주의 |
|---|---|---|---|---|
| **P0** | [KayKit Skeletons](https://github.com/KayKit-Game-Assets/KayKit-Character-Pack-Skeletons-1.0) / CC0 | 4종 GLB 각각 약 4.8MB, 애니메이션 및 공용 팔레트 | 좀비 AI 임시 적 2종 | 모델 그대로 출시 금지: 본래 좀비가 아닌 해골, 애니메이션·지오메트리·텍스처 최적화 필요 |
| **P0** | [KayKit Adventurers](https://github.com/KayKit-Game-Assets/KayKit-Character-Pack-Adventures-1.0) / CC0 | GLB 캐릭터 각각 약 3.6MB, 여러 캐릭터 동작 | 임시 플레이어 1종 | 현대 생존자 스타일에 맞는 별도 스킨·무기 필요 |
| **P0** | [KayKit Halloween Bits](https://github.com/KayKit-Game-Assets/KayKit-Halloween-Bits-1.0) / CC0 | 묘비·파손 울타리·고목·폐허 소품, glTF+BIN+PNG | 첫 맵 분위기·폐허 | 소스 .gltf를 .bin/.png 동봉해 사용 |
| **P0** | [KayKit Prototype Bits](https://github.com/KayKit-Game-Assets/KayKit-Prototype-Bits-1.0) / CC0 | 상자·드럼통·바닥/블록형 임시 조형 | 충돌·지형·파괴 소품 | 최종 게임에 프로토타입 격자 무늬가 남지 않도록 교체 |
| P1 | [Kenney Animated Survivors](https://kenney.nl/assets/animated-characters-survivors) / CC0 | 생존자/좀비 테마의 3D 애니메이션 팩 | 실제 첫 좀비, 플레이어 외형 | **가장 먼저 추가 조사할 모델**; 사이트 다운로드 절차와 FBX→GLB 변환 필요 |
| P1 | [Kenney Blocky Characters](https://kenney.nl/assets/blocky-characters) / CC0 | 블록형 인물 | 게임 미술 스타일 대조 | 최종 기준 캐릭터에 어울리는지 A/B 검수 |
| P1 | [Kenney Graveyard Kit](https://kenney.nl/assets/graveyard-kit) / CC0 | 90개 묘지·폐허 소품 | 첫 생존 맵 | KayKit와 미술 팔레트 불일치 여부 검증 |
| P1 | [Kenney Nature Kit](https://kenney.nl/assets/nature-kit) / CC0 | 나무·바위 약 330개 | 월드 주변 경관 | 상위 5~10개만 채택·반복 Instancing |
| P1 | [Kenney Survival Kit](https://kenney.nl/assets/survival-kit) / CC0 | 캠프/보급 소품 약 80개 | 치료·보급품·기지 | 소수만 화면에 적용 |
| P1 | [Kenney Blaster Kit](https://kenney.nl/assets/blaster-kit) / CC0 | 총기·발사체 3D (블라스터형) | 임시 무기 | 현대 총기 룩과 다르므로 잠정 |
| P2 | [Kenney City Kit Industrial](https://kenney.nl/assets/city-kit-industrial) / CC0 | 산업/공장 건물 3D | 두 번째 맵 | 첫 맵에서 건물 대량 추가 금지 |
| P2 | [Kenney Furniture Kit](https://kenney.nl/assets/furniture-kit) / CC0 | 가구 140종 | 실내 탐험 | 1차 공개에는 실내 진입 미구현 |
| P1 | [Poly Haven](https://polyhaven.com/license) / CC0 | HDRI·PBR·모델 | 하늘·재질 | 웹 화면에는 8K 원본 절대 직접 배포 금지 |
| P1 | [ambientCG](https://ambientcg.com/) / CC0 | PBR/지형 텍스처 | 지면·벽 | 소형 WebP/KTX2 전환 후 사용 |

## 3. 애니메이션·UI·효과음

| 구성 | 원천 | 이용 조건 | 검토 |
|---|---|---|---|
| 사격·재장전·이동·죽음 | [KayKit Character Animations](https://kaylousberg.com/game-assets/character-animations) | CC0 | P0. 133개 이상 세트; 해당 리그에서 필요한 5~8개만 추출 |
| 크로스헤어 | [Kenney Crosshair Pack](https://kenney.nl/assets/crosshair-pack) | CC0 | P0. **PNG만**, SVG는 제외 |
| 모바일 키 안내 | [Kenney Input Prompts](https://kenney.nl/assets/input-prompts) | CC0 | P1. PNG만 선택 |
| 총격·피격/환경음 | [Kenney Impact Sounds](https://kenney.nl/assets/impact-sounds) | CC0 | P0. WAV/OGG 개별 용량 검사 |
| 버튼·조작 | [Kenney Interface Sounds](https://kenney.nl/assets/interface-sounds) | CC0 | P0. OGG로 통합 |

## 4. **라이선스 위험: 무조건 자동 수집하지 않을 자료**

- [Quaternius Animated Zombie Pack](https://quaternius.com/packs/animatedzombie.html): 해당 오래된 팩 페이지에는 **CC0** 표시. 3D 좀비 최적 후보지만 FBX/BLEND를 GLB로 변환해야 하며 **정확히 취득한 버전의 CC0 증거를 함께 보관**할 것.
- [Quaternius Universal Animation Library](https://quaternius.com/packs/universalanimationlibrary.html): 개별 페이지 CC0. 무료 Standard에 포함되는 애니메이션 수와 유료 Source 구분 필요. 공개 소스 리포지터리에 유료 팩 재배포 금지.
- [Quaternius QAL v1.0](https://quaternius.com/license.html) (2026-08-28): 게임에서 사용은 허용하지만 자산만 독립된 팩으로 재배포하는 행위 제한. **사이트 전체를 CC0로 간주하지 말 것**. 기존 CC0 확보 팩은 별도 증거.
- Adobe Mixamo·Sketchfab·TurboSquid·Unity Asset Store: 일부가 무료여도 오픈소스/CC0 의미가 아님. 모델·애니메이션을 공개 저장소에 복사하려면 개별 계약 조건 검토 필요. 첫 단계 **자동 취득 제외**.
- Meshy / TRELLIS.2: AI 3D 생성 도구. 생성 비용·이용 조건·최종 파일의 배포 권리를 별도 검토한 뒤 부족한 현대형 좀비·총기·생존자 자산을 보강하는 후보. 기존 공개 모델을 무단 재학습/복제하지 않는다.
- 라니킹덤 Fiefdom 원본 AGPL-3.0 자산: **새 TPS에 소스·아트 직접 복사 금지**. 라니킹덤은 보관하고 독립 코드로 시작.

## 5. 모바일 성능·초기 개발 범위 (검증 목표, 실측 성능 아님)

- 1차 로딩 크기 **8MB 이하 목표**, 첫 실전 플레이까지 가능하면 3MB 이하. 모델은 게임 중 지연 로드 및 개별 압축, 최고 기록은 브라우저 로컬만.
- 맵 처음 48m × 48m 이내, 보행 가능한 3D 장면 한 개, 몬스터 동시 활성 **최대 8~12개**부터.
- 1차 판정 충돌체는 캡슐·상자로 단순화, 점프·엄폐·헤드샷을 섞기 전에 달리기·조준·사격부터.
- 지형은 모든 큐브를 별도 Mesh로 만들지 않음. **보이는 면만 생성, 청크 단위 결합, 먼 오브젝트 LOD/절두체 컬링**.
- 우선순위: 조작 지연/손가락 영역 > 프레임 안정성 > 깨끗한 블록형 그래픽 > 복잡한 AI/대형 맵.
- 그림자 512~1024 이하 1개 또는 낮에는 그림자 베이크, 모바일 DPR 1~1.25, 자동 화질/절전 모드.
- **GLB 원본과 최적화 결과는 별도 폴더**, 원본은 해시 잠금. `gltfpack`으로 모델·애니메이션을 줄이고 KTX2는 필요할 때만.
- 자동 검사 필수: PC 1280x720, 모바일 390x844, 844x390 및 320x568. 탭·마우스·가로 회전·초기 로딩·기기 GPU 메모리 확인.

## 6. 실제 자산 확보 절차

```bash
node BlockSurvivalTPS/tools/acquire-open-assets.mjs --check
node BlockSurvivalTPS/tools/acquire-open-assets.mjs --acquire /tmp/block-survival-cc0
```

위 스크립트는 GitHub 원본 커밋을 엄격히 잠그고, `LICENSE.txt`에서 CC0를 검사한 다음 **3종 캐릭터 + 7개 소품에 필요한 glTF/BIN/PNG 등 선택 파일만 격리 복사**한다. 해시·출처는 `PROVENANCE.json`에 기록. 첫 행동은 입수·저장이지 게임에 자동 적용이 아니다.

CI 작업 `.github/workflows/block-survival-asset-intake.yml`은 비게임 폴더의 안전한 별도 작업이다. 생성된 미검수 모델 파일은 **3일 보관하는 GitHub Actions 아티팩트**로 남고, 저작권 고지 없는 배포 또는 라니킹덤 파일 덮어쓰기를 하지 않는다.

## 7. 첫 프로토타입 실제 이식 판단

- **즉시 재활용 (P0)**: Three.js + 가벼운 TPS 컨트롤러 직접 구현, KayKit 선택 글로브 모델, 소품 7종, 원본 캐릭터 애니메이션 최소 5개.
- **1차 추가 (P1)**: Kenney 생존자/좀비 캐릭터, Kenney 블라스터 및 SFX, 머리 위 HP, 탄약, 적 3종, 웨이브 AI.
- **2차 보강 (P2)**: 커스텀 좀비·현대총기 3D, 대형 폐허 지형, 인벤토리/루팅, 날씨, 복잡한 물리.
- **초기 제외**: 광활한 오픈월드, 블록 무제한 파괴·배치, 멀티플레이 서버, 고비용 AI 동적 생성, 고해상도 HDRI 실시간 로드.

## 8. 보호 및 종료 조건

**라니킹덤은 삭제·변형하지 않는다.** 새 TPS 공개 전에는 별도 브랜치 검수 후 사용자 요청대로 `Defense` 메인 Pages를 전환한다. 캐시/서비스워커는 이후 전환할 때만 이름과 저장 키를 완전히 분리한다. **현재 게임 메인 주소는 기존 라니킹덤이다.**

**완료 판정:** (1) CC0 파일 메타와 커밋 고정 (2) 원본 파일 실제 CI 수집 (3) 출처·SHA 기록 (4) 디버그 빌드에선 무거운 원본 사용 금지 (5) PC/모바일 성능 측정 (6) 원본 왕국 복원 브랜치 보존.
