# v3.7 모바일 UI 스트레스 계약

## 단일 레이아웃 입력

`src/ui-layout-contract.js`가 폭, 높이, 안전 영역, 글자 배율, 보스 상태를 받아 하나의 계약을 만든다.

출력:

- 화면 프로필
- 자동 간소화 여부
- 좌우 레일 폭
- 조이스틱 크기
- 액션 도크 폭
- 하단 조작 간격
- 긴급 레이아웃 위험도

## 필수 스트레스 프로필

| 프로필 | 해상도 | 목적 |
|---|---:|---|
| iphone-se | 320×568 | 최소 세로 화면 |
| android-small | 360×640 | 작은 안드로이드 |
| iphone-modern | 390×844 | 노치·홈 인디케이터 |
| android-large | 430×932 | 큰 세로 화면 |
| landscape-short | 568×320 | 짧은 가로 화면 |
| large-text-small | 360×640 / 122% | 긴 한국어·큰 글자 |

모든 프로필은 조이스틱과 액션 도크 사이 16px 이상의 계약 간격을 요구한다.

## 런타임 방어

- `ResizeObserver`: 카드 내용과 글자 크기가 바뀌면 재측정
- `getBoundingClientRect`: 실제 레일 겹침 기록
- `scrollWidth/clientWidth`: 긴 한국어 문구 overflow 기록
- `ui-copy-tight`: 글자와 보조 설명 축약
- `ui-emergency-layout`: 시드, 초행 임무, 저우선 헤더를 우선 숨김
- 핵심 HP, 웨이브, 보스 의도, 조작 버튼은 숨기지 않음
- 모달은 visual viewport 높이 안에서 스크롤

성능 로그의 `diagnostics.hudLayout`에 충돌 쌍, overflow 수, 계산 계약이 포함된다.
