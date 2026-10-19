# 라니킹덤 v2.2 — 기존 제작 애셋 100% 승계 및 독립형 UI 팩

## 사용자 확정 원칙
- **이전에 만든 자산 전면 재사용, 삭제/무단 덮어쓰기 금지.** 원본 파일은 동일 품질로 보관, 별도 용량 최적화된 배포판만 게임에 적용한다.
- 이미지/아이콘/패널/건물/배는 **하나씩 독립 제작한 PNG를 원본으로 유지**. 기존 시트를 억지로 잘라서 보정하지 않는다.
- 게임 내 **SVG 전면 금지**. JPG/PNG/WebP 이미지, 기존 Three.js/GLTF 실물 3D 메시는 정상 허용.
- 시각 방향: 사용자가 확정한 중세 판타지 왕국 레퍼런스 이미지, 청색 지붕·왕관·금장 목재 HUD·석조 도로·울창한 숲·항구. PC/모바일 동일 톤.
- **자산 확보와 실제 적용 여부를 구분**한다. 기존 3D 건물을 준비된 2D 컷으로 무리하게 덮어 이미지처럼 오해시키지 않는다.

## 현재 확인된 기존 실제 GitHub 보관 자산 (모두 유지)
- `assets/branding/rani-kingdom-logo.webp` — 독립 황금 왕국 로고
- `assets/terrain/rani-terrain-atlas.webp` — 예전 단계 확보 지형 11종(아틀라스이며 새 개별 PNG와 별도로 그대로 유지)
- `assets/quaternius/*.gltf` — 원본 3D 건물 4종
- `src/rendering/RoyalWorldArt.js` — 마을·밀밭·성채 3D 장식
- `src/rendering/RoyalInfrastructureArt.js` — 도로·성벽·성문·항구 3D 장식
- `src/rendering/RoyalDistrictArt.js` — 주택 5종·시장·병영·장인 공방 3D 장식

## 이번에 새로 GitHub에 저장한 10종
**5종 즉시 적용** (각각 독립된 1254px 투명 PNG 원본, 게임용 192px 투명 WebP)
| 자산 | 배포 파일 | 적용 |
|---|---|---|
| 금화/왕관 동전 | `assets/rani/ui/icons/rk_icon_resource_gold_v001.webp` | ResourcePanel 금화 |
| 목재 장작 | `assets/rani/ui/icons/rk_icon_resource_wood_v001.webp` | ResourcePanel 목재 |
| 석재 자원 | `assets/rani/ui/icons/rk_icon_resource_stone_v001.webp` | ResourcePanel 석재 |
| 황금 밀단 | `assets/rani/ui/icons/rk_icon_resource_food_v001.webp` | ResourcePanel 식량 |
| 왕국 인구 | `assets/rani/ui/icons/rk_icon_resource_population_v001.webp` | ResourcePanel 인구 |

**5종 자산 확보, 사용 대기** (이미 GitHub에 바이너리로 보존, 256~512px 경량 배포본)
- `assets/rani/ui/buttons/rk_btn_royal_primary_v001.webp`: 독립 금장 목재 버튼 원본.
- `assets/rani/ui/panels/rk_panel_royal_hud_v001.webp`: 독립 금장 목재 HUD 프레임.
- `assets/rani/buildings/housing/rk_building_house_a_v001.webp`: 독립 청색 지붕 주택 콘셉트.
- `assets/rani/buildings/economy/rk_building_market_v001.webp`: 독립 중세 시장.
- `assets/rani/harbor/ships/rk_ship_trade_v001.webp`: 독립 왕국 무역선.

## 소스 적용·원본 규격
- `assets/rani/manifest-v22.json`: 파일 경로/용도/상태/용량/보존 대상/후속 애셋 목록. 프로젝트 에셋 관리의 정식 인덱스.
- `src/ui/RaniAssetRegistry.js`: 실제 파일 경로와 기존 보존 목록을 한 곳에서 관리.
- `src/ui/GameIcons.js`: 기존 이모지 자원 5종을 `<img alt="" draggable="false">`로 교체. 이미지가 깨지면 기존 이모지를 보여주는 안전한 fallback. 다른 아이콘은 개별 PNG가 준비될 때까지 임시 원본 로직 유지.
- `css/rani-raster-assets-v22.css`: 1440px PC/390px 모바일/320px 모바일에서 아이콘 크기 및 금장 중복 배경 조정. 원래 HUD 자원·점수·건설 UI와 동일 데이터 바인딩 유지.
- 원본 PNG 10개와 최적화 WebP 10개 및 MANIFEST/README를 별도 ZIP으로 제공. **원본 PNG 자체는 수 MB라서 Github 배포 저장소에는 경량 WebP만, 원본 10종은 사용자 다운로드 패키지로 제공.**

## 품질·회귀
- `scripts/check-rani-assets-v22.mjs`: 10종 각각 RIFF/WEBP 헤더, 독립 경로, 등록 경로, 실제 크기, 기존 타이틀/지형/4 GLTF/3 로얄 3D 모듈 보존, SVG 파일/인라인 태그 금지.
- `scripts/qa_rani_assets_v22.py`: PC 1440×900, 모바일 390×844 및 소형 320×700에서 실제 자원 5종 이미지 로딩/투명 WebP 각각 다른 src/기존 3D 마을 표시 확인, 한 이미지 차단 때 이모지 대체 표시 확인, 기존 콘솔 오류 검사.
- 모든 원본 건축·경제·연구·세력·저장·3D 필드/마을·드래그 UI 검증 유지.

## 다음 생산 목록 (별도 개별 생성만)
1. 영향력·안정도·연구·건설·업그레이드·군사·외교·지도·퀘스트·설정 등 아이콘 (각 128/256px 투명 PNG)
2. 금장 버튼 기본/호버/눌림/비활성 **독립 이미지 4상태** 및 비율 변형 방지 9-slice 가능 프레임
3. 건물별 독립 아이소메트릭 청색 지붕 주택 4종, 농장·성채·병영·풍차·대장간·항구.
4. 성벽/성문/도로 교차로/석판광장/부두/선박/파도·해안 각각 독립 이미지 및 실제 Three.js 맵과 레이어 전환 규칙.

참고: AI로 만들어진 정리용 자산 시트 이미지는 **게임 배포/분할 소스로 사용하지 않음**. 새 애셋은 기존 개별 생성 파일을 그대로 승계한다.
