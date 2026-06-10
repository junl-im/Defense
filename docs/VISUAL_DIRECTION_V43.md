# Kingdom Seed v4.3 Premium Visual Asset Foundation

이번 패치는 사용자가 제공한 두 장의 프리미엄 스타일 레퍼런스를 기준으로 만든 에셋 중심 대규모 패치입니다.

## 디자인 방향

- 밝고 선명한 애니메이션풍 왕국 판타지
- 흰색/블루/골드 UI 프레임
- 2.5D 전장 배경
- 카드형 월드맵과 고급 HUD
- 몬스터/타워 실루엣 구분 강화

## 적용 방식

대부분 기존 파일명으로 덮어쓰는 에셋 교체형입니다.

- `public/assets/ui/title_background.png`
- `public/assets/maps/battle_stage_001.png` ~ `008`
- `public/assets/maps/stage_card_001.png` ~ `008`
- `public/assets/sprites/enemy_*.png`
- `public/assets/sprites/tower_*_lv*.png`

## 다음 단계 추천

1. MenuScene에서 `title_logo_v43.png`와 새 버튼 이미지를 명시적으로 배치
2. WorldMapScene에서 stage card frame과 카드 썸네일을 연결
3. GameScene 타워 메뉴를 `button_gold_v43.png`, `panel_premium_v43.png` 기반으로 교체
4. MonsterIntel UI에 `enemy_portrait_*.png`와 `monster_trait_*.png` 연결
5. 보상/유물/상자 UI를 `reward_chest_*_v43.png` 기준으로 리워크
