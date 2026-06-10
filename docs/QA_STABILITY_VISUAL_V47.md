# Kingdom Seed v4.7 Ingame Stability + Visual Patch

## 실제 개선 대상

- 타워 클릭 판정을 전체 타워 발자국 + 손가락 버퍼 영역으로 확대
- 건설 메뉴와 타워 패널이 상단/하단 UI 밖으로 밀리지 않도록 clamp 기준 강화
- 건설 가능 지점의 안전 영역을 더 안쪽으로 보정
- 첫 모바일 진입 시 빈 화면처럼 보이는 상황을 줄이기 위해 scene-ready 이벤트와 시작 게이트 fallback 추가
- 카카오/인앱 브라우저에서 의도치 않은 종료 팝업이 뜨는 것을 줄이기 위해 popstate guard 쿨다운 강화
- v4.7 전용 build menu frame, safe area overlay, tower click ring, dock, pointer FX 추가

## 적용 후 확인

1. 상단에 가까운 건설 지점을 눌러도 메뉴가 화면 밖으로 나가지 않는지 확인
2. 타워 몸통/하단/주변을 눌러도 선택되는지 확인
3. 모바일 첫 접속에서 빈 화면 대신 시작 게이트/로딩 문구가 보이는지 확인
4. 뒤로가기를 누르지 않았는데 종료창이 반복 표시되지 않는지 확인
