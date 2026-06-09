# Kingdom Seed v0.5 Patch

## 핵심 변경

- Stage 003: 그림자 늪지 추가
- 신규 적 3종 추가
  - 늪지 거미: 빠른 지상 러시형
  - 망령: 공중 판정 + 높은 마법 저항
  - 늪 트롤: 방어력 높은 탱커형
- 전투 손맛 강화
  - 궁수/마법사 투사체 애니메이션
  - 포탑 포탄 + 폭발 링 + 카메라 흔들림
  - 영웅/병사 타격 이펙트
  - 데미지 숫자 플로팅 텍스트
  - 적 사망 보상 팝업
  - 웨이브 시작 배너
  - 스킬/버튼 터치 피드백
- 월드맵 Stage 3 노드와 늪지 테마 추가

## 적용 방법

압축 해제 후 `kingdom-seed-v0.5-patch` 안의 파일을 기존 프로젝트 루트에 덮어쓰기.

추가/수정되는 주요 파일:

```txt
src/game/Effects.ts
src/game/types.ts
src/game/balance.ts
src/game/Enemy.ts
src/game/Tower.ts
src/game/Hero.ts
src/game/Soldier.ts
src/scenes/GameScene.ts
src/scenes/WorldMapScene.ts
```

## 확인

```bash
npm run build
```

성공하면 GitHub Desktop에서 commit/push.

권장 커밋 메시지:

```txt
Add stage 3 and combat feedback effects
```

배포 확인:

```txt
https://junl-im.github.io/Defense/?v=050
```
