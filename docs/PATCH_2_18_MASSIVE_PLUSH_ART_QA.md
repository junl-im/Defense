# v2.18.0 Massive Plush Kingdom Art Pass + Runtime QA Sweep

## 목표
- 작은 패치 단위 대신 한 번에 체감되는 대량 디자인 패치를 적용한다.
- v2.16/v2.17의 말랑 판타지 방향을 유지하면서, 로그인/로비/월드맵/전투에 신규 에셋 레이어를 추가한다.
- 기존 모바일 터치 영역과 텍스트는 유지하고, 장식 이미지만 분리해 덮어씌우는 구조를 강화한다.
- 메시지/이벤트 콜백처럼 장시간 플레이 시 누적될 수 있는 QA 리스크를 함께 정리한다.

## 추가 에셋
신규 경로: `public/assets/ui/v2_18/`

총 44종 PNG + WebP 세트, 합계 88개 파일을 추가했다.

### 공통 UI
- `plush_modal_frame_v2_18.png/webp`
- `nursery_header_ribbon_v2_18.png/webp`
- `scallop_button_gold_v2_18.png/webp`
- `scallop_button_blue_v2_18.png/webp`
- `scallop_button_pink_v2_18.png/webp`
- `toast_marshmallow_v2_18.png/webp`
- `progress_bead_v2_18.png/webp`

### 로그인 화면
- `login_cloud_arch_v2_18.png/webp`
- `login_stamp_quick_v2_18.png/webp`
- `login_stamp_google_v2_18.png/webp`
- `fairy_house_v2_18.png/webp`
- `slime_crown_v2_18.png/webp`
- `mail_heart_icon_v2_18.png/webp`
- `gmark_soft_icon_v2_18.png/webp`
- `settings_cog_soft_v2_18.png/webp`

### 로비
- `lobby_quest_scroll_v2_18.png/webp`
- `lobby_shop_awning_v2_18.png/webp`
- `resource_shell_coin_v2_18.png/webp`
- `resource_shell_gem_v2_18.png/webp`
- `resource_shell_heart_v2_18.png/webp`
- `gold_ticket_v2_18.png/webp`
- `blue_ticket_v2_18.png/webp`
- `mobile_thumb_hint_v2_18.png/webp`

### 월드맵
- `worldmap_preview_frame_v2_18.png/webp`
- `worldmap_path_bridge_v2_18.png/webp`
- `worldmap_node_crown_v2_18.png/webp`
- `worldmap_cloud_island_v2_18.png/webp`
- `selected_stage_glow_v2_18.png/webp`
- `locked_stage_padlock_v2_18.png/webp`

### 전투 HUD
- `battle_hud_lace_top_v2_18.png/webp`
- `battle_skill_tray_v2_18.png/webp`
- `battle_wave_flag_v2_18.png/webp`
- `battle_corner_leaf_v2_18.png/webp`
- `battle_spell_meteor_orb_v2_18.png/webp`
- `battle_spell_guard_orb_v2_18.png/webp`
- `battle_spell_hero_orb_v2_18.png/webp`

### 마스코트/스프레이
- `mascot_bunny_v2_18.png/webp`
- `mascot_puff_dragon_v2_18.png/webp`
- `fairy_wing_pair_v2_18.png/webp`
- `acorn_shield_v2_18.png/webp`
- `little_sword_badge_v2_18.png/webp`
- `tiny_star_spray_v2_18.png/webp`
- `tiny_heart_spray_v2_18.png/webp`
- `tiny_leaf_spray_v2_18.png/webp`

## 코드 변경

### `src/game/CuteFantasyArtV218.ts` 추가
- v2.18 전용 디자인 레이어를 신규 모듈로 분리했다.
- `addV218LoginArt`, `addV218LobbyArt`, `addV218WorldMapArt`, `addV218BattleArt`를 제공한다.
- 에셋이 누락되어도 fallback 패널을 반환하는 안전 구조를 포함했다.
- 장식 오브젝트는 클릭 가능한 객체가 아니므로 기존 터치 히트존을 침범하지 않는다.

### `src/scenes/BootScene.ts`
- `assets/ui/v2_18` 프리로드를 추가했다.
- WebP 최적화 정규식에 `v2_18` 경로를 포함했다.

### `src/scenes/MenuScene.ts`
- 로그인 패널 뒤 구름 아치, 상단 리본, 버튼 스탬프, 토끼/드래곤 마스코트를 추가했다.
- 유틸리티 아이콘 주변에 부드러운 메일/Google/설정 장식을 추가했다.
- 버전 칩을 `v2.18.0 MASSIVE CUTE ART QA`로 갱신했다.

### `src/scenes/MainMenuScene.ts`
- 로비 중앙에 퀘스트 스크롤과 신규 마스코트 레이어를 추가했다.
- 상단 재화 영역에 코인/보석/하트 쉘 장식을 추가했다.
- 하단 내비게이션에 티켓/말랑 버튼 장식을 덧입혔다.

### `src/scenes/WorldMapScene.ts`
- 스테이지 미리보기 패널 뒤에 신규 plush 프레임을 추가했다.
- 스테이지 노드에 선택 글로우, 왕관, 경로 브리지 장식을 추가했다.
- 잠긴 후반 노드에는 부드러운 자물쇠 장식을 얹었다.

### `src/scenes/GameScene.ts`
- 전투 상단 HUD에 레이스 장식을 추가했다.
- 스킬 독 아래에 신규 말랑 트레이와 스킬 오브 장식을 추가했다.
- 웨이브 정보 영역에 깃발형 장식과 전투 테마별 tint를 적용했다.
- 콤보 토스트 hide 타이머를 단일 소유로 변경해, 연속 처치 중 이전 타이머가 새 콤보 표시를 빨리 숨기는 문제를 완화했다.
- 보스 패턴 이벤트 리스너를 shutdown/destroy 시 명시적으로 해제해 씬 재시작/전환 QA 리스크를 줄였다.

### `package.json` / `package-lock.json`
- 버전을 `2.18.0`으로 갱신했다.

## QA 결과
- `npx tsc --noEmit --pretty false` 통과.
- `npm run build` 통과.
- Vite의 500KB 이상 chunk 경고는 Phaser/Firebase 단일 번들 구조에서 발생하는 기존 경고이며, 이번 패치로 인한 신규 빌드 오류는 아니다.

## 적용 방법
1. 이 zip을 프로젝트 루트에 그대로 덮어쓴다.
2. GitHub Desktop에서 변경 파일을 확인한다.
3. 필요하면 `npm install`을 한 번 실행한다.
4. `npm run dev` 또는 `npm run build`로 확인한다.
5. 이전 이미지가 남아 보이면 브라우저 강력 새로고침 또는 dev 서버 재시작을 한다.

## 다음 추천 대량 패치
- v2.19.0: 타워 4종 SD 외형/업그레이드 단계별 변신 에셋 연결.
- v2.20.0: 몬스터 SD 리마스터 + 웨이브 카드/보스 경고 연출 강화.
- v2.21.0: 결과 화면/보상 상자/출석 보상 화면을 말랑 왕국 스타일로 재작업.
