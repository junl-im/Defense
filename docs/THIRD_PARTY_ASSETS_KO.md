# 라니킹덤 — 검증된 외부 그래픽 자산 출처

## 실제 도입 (v0.7)
- **Quaternius / Ultimate Fantasy RTS** — **CC0 1.0**.
- 실제 사용 파일: `TownCenter_FirstAge_Level3.gltf` (원본 glTF, 내장 버퍼 포함).
- 라니킹덤 경로: `assets/quaternius/town-center-first-age-3.gltf`.
- 원본 파일 출처: `ranzevor/Latticefolk` 저장소의 `public/assets/quaternius/ultimate-fantasy-rts/TownCenter_FirstAge_Level3.gltf`.
- 모델 SHA: `ae12182cd676654d87b83c598fa997856438ac79` (Git blob SHA).
- 제작자: Quaternius. 원본 배포처 https://quaternius.com/packs/ultimatefantasyrts.html
- CC0 근거: https://www.patreon.com/quaternius/posts/ultimate-fantasy-71326249
- 원본 이용 안내: https://github.com/ranzevor/Latticefolk/blob/main/THIRD_PARTY_NOTICES.md
- Latticefolk MIT 라이선스의 자체 코드/게임 플레이를 가져온 것이 아니라, Quaternius의 CC0 glTF 자산 파일만 선정해 가져옴.
- 원본 MIT Hexkingdom의 전체 3D 건축·영토·전투 시스템을 절대 대체하지 않음.
- 레벨 2 이상 중심 건물에 한해 보조 고품질 모델을 추가. 파일 또는 외부 모듈 로딩 실패 시 기존 3D 모델을 계속 사용.
- glTF 모델은 1회 로드하고 씬에서 재사용. 레벨 변화에 따라 크기만 조정. 구버전 저장 파일과 경제 자료는 변경하지 않음.

## 보류 후보
- VibeWars (Apache-2.0): 지형 청크 병합/LOD 시스템은 기존 Three.js 장면의 성능 프로파일링 이후 독립적인 최적화 단계에 검토.
- Latticefolk (MIT + CC0 third-party assets): 주민 행동 스케줄/작업 큐는 통합이 필요한 저장/AI 정책이 정해진 후 선택.
- Crown & Clan: 저장소에 명시적인 라이선스가 없으면 소스와 리소스를 가져오지 않음.
- 3d.city: GPL 코어 존재, 전체 엔진의 MIT 게임 이식 제외.


## v0.8 — 건물 외형 선택 이식
- 제작자: Quaternius / Ultimate Fantasy RTS pack, **CC0**.
- 실제 파일: `assets/quaternius/farm-second-age-3.gltf` (Git blob c98159aa59420790c79ca8dae9fadfda0a505ff0), `market-first-age-3.gltf` (9a04f76b0a9ca31da46d304e0628ced42a07cccc), `barracks-first-age-3.gltf` (b87dd9628f4cbe61274dad358c7ead7a77948107).
- 출처: https://github.com/ranzevor/Latticefolk/tree/main/public/assets/quaternius/ultimate-fantasy-rts ; original credits: https://github.com/ranzevor/Latticefolk/blob/main/THIRD_PARTY_NOTICES.md
- 공식 원출처: https://quaternius.com/packs/ultimatefantasyrts.html
- 기존 건설·경제·저장 코드는 Hexkingdom 엔진을 유지. 완공한 농장·시장·병영에만 모델을 로드하고 새 모델이 부착된 후 원래 외형을 숨긴다.
- 종류별 1회 지연 로드 후 3D 인스턴스별 geometry/material 공유. 로딩 실패 시 기존 3D 모델 유지. 공사 취소·재접속·새 게임을 테스트한다.
