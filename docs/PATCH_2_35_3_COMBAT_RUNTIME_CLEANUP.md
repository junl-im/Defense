# KingdomSeed v2.35.3 Combat Runtime Cleanup Patch

## 목적

v2.35.1~v2.35.2에서 추가한 전투 쥬스 연출을 유지하면서, 모바일 장기 플레이에서 누적될 수 있는 런타임 리스크를 줄이는 안정화 패치입니다.

## 핵심 수정

### 1. 사망 적 배열 정리 안정화

사망 애니메이션이 들어간 뒤, `Enemy.dead === true` 상태의 적이 `enemies` 배열에 남아 웨이브 종료 판정을 지연하거나 막을 수 있었습니다.

이번 패치에서는 킬/보상 판정을 즉시 처리한 뒤, 전투 로직 배열에서는 바로 제외합니다. 사망 페이드/먼지 연출은 씬에 남은 GameObject가 자체 트윈으로 끝까지 재생합니다.

### 2. Combat FX 예산 카운터 watchdog

투사체, 데미지 텍스트, 사망 파티클이 씬 전환이나 트윈 중단으로 `release()`를 호출하지 못하면 FX 예산이 점유된 채 남을 수 있습니다.

`CombatFxBudget.ts`에 종류별 최대 수명 watchdog을 추가해, onComplete가 누락되어도 자동으로 예산이 반환되도록 했습니다.

### 3. 씬 종료 시 FX 예산 리셋

`GameScene` shutdown/destroy 정리 단계에서 `resetCombatFxBudget(this)`를 호출해, 같은 씬이 재시작될 때 이전 전투의 FX active 카운터가 남지 않게 했습니다.

### 4. Enemy 타이머/트윈 정리

`Enemy.destroy()`에서 독 타이머와 주요 트윈을 정리합니다. 사망 연출 시작 시에도 피격/독 관련 잔여 트윈을 정리해, 사망 페이드 트윈과 충돌하지 않도록 했습니다.

### 5. 비활성 타겟 제외

포격 범위 피해와 장궁 보조 타겟 판정에서 이미 inactive 상태인 적을 제외합니다.

## 검증

```bash
npm run build
```

성공했습니다. TypeScript와 Vite production build 모두 통과했습니다.
