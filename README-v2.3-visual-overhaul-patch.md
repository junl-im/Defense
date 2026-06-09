# Kingdom Seed v2.3 Visual Overhaul Patch

## 목표
- PC에서는 전체화면/회전 개입 제거
- 모바일에서만 가로모드/전체화면 시도
- 조기 웨이브 문구를 `진행`으로 교체
- 웨이브가 10초 후 자동 진행되도록 변경
- 빈 건설지의 의미와 역할을 명확하게 표시
- 상단 HUD 겹침 개선
- 전투 배경, 타워, 몬스터를 2.5D 느낌으로 교체

## 적용 파일
- src/platform/WebShell.ts
- src/style.css
- src/scenes/GameScene.ts
- src/game/BattlefieldArt.ts
- src/game/Effects.ts
- src/game/QualityManager.ts
- src/game/VisualPolish.ts
- public/assets/maps/battle_stage_001.png ~ battle_stage_008.png
- public/assets/sprites/enemy_*.png
- public/assets/sprites/tower_*_lv*.png
- public/assets/ui/hud_top_panel.png
- public/assets/ui/hud_bottom_panel.png

## 적용 후 확인
```bash
npm run build
```

배포 확인:
```txt
https://junl-im.github.io/Defense/?v=230
```
