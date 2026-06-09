# v2.1 상용형 메타 시스템 설계

## 1. PC / 모바일 화면 정책

기존 v0.7~v1.2 웹쉘은 세로 화면일 때 `#game`을 회전시키는 방식이었고, PC 브라우저도 창 비율이 세로로 잡히면 회전될 수 있었습니다.

v2.1은 다음 기준으로 변경했습니다.

```txt
PC
- 전체화면 진입 시도
- 방향 고정 시도 없음
- CSS 회전 없음

Mobile
- 전체화면 진입 시도
- landscape lock 시도
- 모바일 세로 화면일 때만 CSS 90도 회전 fallback
```

적용 클래스:

```txt
is-desktop
is-mobile-webview
is-landscape
is-portrait
needs-portrait-rotation
```

회전 CSS는 `html.needs-portrait-rotation #game`에서만 작동합니다.

## 2. 유물 장착 시스템

`MegaSystems.ts`의 `MetaState`를 localStorage에 저장합니다.

```txt
ownedRelics
equippedRelics
claimedAchievements
claimedDailyKeys
honor
```

현재 유물은 12종이며, 최대 3개를 장착합니다.

대표 효과:

```txt
참나무 장궁: 궁수 피해 +12%, 공격 간격 5% 감소
비전 핵: 마법사 피해 +15%
대장의 깃발: 병영 병사 체력 +30, 피해 +8%
천둥 화약: 포탑 폭발 범위 +12
상단 계약서: 시작 골드 +60
태양석 부적: 메테오 쿨타임 감소
왕가의 인장: 시작 골드 +100, 병영 체력 +25
```

전투 반영 위치:

```txt
Tower.ts
- currentDamage
- currentFireRateMs
- currentSplashRadius
- soldierOptions

GameScene.ts
- 시작 골드
- 메테오 쿨타임
- 일일 도전 modifier
```

## 3. 일일 도전

매일 날짜 기반 seed로 같은 스테이지와 modifier가 생성됩니다.

```txt
gold_rush
no_mage
air_raid
iron_wall
meteor_storm
hero_trial
boss_contract
```

`MetaScene`에서 도전 시작 시 `GameScene`으로 dailyChallenge payload를 넘깁니다.

## 4. 업적 보상

업적은 `PlayerSave.clearedStages`와 `MetaState`를 조합해 평가합니다.

예시:

```txt
첫 승리
완벽한 방어
숲길 수호자
관문 돌파
화산 돌파자
공허 절단자
왕국의 수호자
유물 수집가
전설의 지휘관
```

보상은 명예와 유물 해금으로 구성했습니다.

## 5. 보스 고유 패턴

`Enemy.ts`에 보스 자체 패턴을 넣었습니다.

```txt
demonlord: 지옥 장막
dragon: 화염 포효
titan: 공허 회복/돌진
phoenix: 재점화
ogre/golem/abomination: 지진 강타
```

보스 패턴은 시각 효과, 메시지 이벤트, 보호막, 회복, 속도 증가로 구성되어 서버 비용 없이 클라이언트에서 처리됩니다.

## 6. 다음 확장 방향

- 일일 도전 클리어 시에만 reward claim 가능하도록 결과 연동
- 유물 등급별 강화/분해
- 업적 보상 Firestore 저장
- 보스별 전용 컷신과 체력바
- 스테이지별 modifier preview
