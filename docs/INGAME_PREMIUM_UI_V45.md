# Kingdom Seed v4.5 Ingame Premium UI Patch

v4.5는 v4.3/v4.4에서 만든 프리미엄 비주얼 에셋을 인게임 핵심 UI에 연결하기 위한 패치입니다.

## 추가된 것

- 타워 패널 프리미엄 프레임
- 타워 액션 버튼 6종
- 타워 능력치 바
- 최종 진화 패널
- 보상 상자 개봉 패널/FX
- 몬스터 인텔 카드 패널
- 전투 시작 브리핑 패널
- PremiumTowerPanelV45
- PremiumRewardChestV45
- PremiumMonsterIntelV45

## 다음 통합 포인트

GameScene의 기존 타워 선택 패널을 `PremiumTowerPanelV45`로 교체하면 됩니다.

예시:

```ts
const panel = new PremiumTowerPanelV45(this);
panel.show(480, 320, {
  title: '아처 타워',
  role: '공중/고속 적 대응',
  level: 2,
  damage: 48,
  range: 165,
  cooldown: 1.1,
  actions: {
    upgrade: () => this.upgradeSelectedTower(),
    sell: () => this.sellSelectedTower(),
    swap: () => this.openReplacementMenu(),
  },
});
```

보상 화면은 `PremiumRewardChestV45`, 웨이브 프리뷰는 `PremiumMonsterIntelV45`로 점진 교체하세요.
