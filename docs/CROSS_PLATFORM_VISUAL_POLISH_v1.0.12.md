# Cross-Platform Visual Polish Contract — v1.0.12

## 목적

동일한 전투 세계를 유지하면서 PC와 모바일에서 각각 읽기 쉬운 정보 구조와 조작 구조를 제공한다. 모바일 화면을 PC HUD의 축소판으로 만들지 않는다.

## 런타임 분류

| 셸 | 기준 | 핵심 구성 |
|---|---|---|
| PC | 폭 1180px 이상 | 상단 전술 바, 중앙 액션 랙, 조이스틱 미표시 |
| Tablet | 비모바일이며 폭 1180px 미만 | 중간 정보 밀도, 화면 양 끝 입력 분리 |
| Mobile | 폭 820px 이하 또는 coarse pointer 980px 이하 | 엄지 영역 기반 조이스틱·액션 독립 배치 |

세로·가로 및 높이 680px 이하의 컴팩트 모드는 셸 분류와 별도로 적용한다.

## 겹침 검사

`CrossPlatformShellV112`는 HUD, 보스 HP, 상태 레일, 미터 레일, 좌우 패널, 조이스틱, 액션 독, 상호작용 버튼의 실제 화면 사각형을 검사한다. 허용하지 않은 겹침이 발견되면 `dd-shell-overlap-safe-v112`를 적용해 부가 정보의 크기와 점유율을 낮춘다.

## 시각 자산 규격

- 타이틀 배경 중심 안전영역을 PC·모바일에 각각 지정한다.
- 투명 마스코트는 premultiplied resize로 밝은 경계 번짐을 억제한다.
- PC와 모바일 배경은 같은 키 아트를 억지로 자르지 않고 별도 원본 비율을 사용한다.
- 저사양용 Lite 자산을 별도로 제공한다.
- SVG 런타임 자산은 사용하지 않는다.

## 진단 계약

브라우저 전역 진단:

```text
window.__DOKKAEBI_CROSS_PLATFORM_SHELL_V112__
window.__DOKKAEBI_CROSS_PLATFORM_SHELL_V112_REPORT__
```

필수 값:

```json
{
  "version": "1.0.12",
  "shellSeparated": true,
  "sharedScaleOnly": false,
  "overlapCount": 0,
  "healthy": true
}
```

`overlapCount`는 실제 화면 상태에 따라 달라질 수 있으며 0이 아닌 경우 안전 셸이 자동 적용된다.
