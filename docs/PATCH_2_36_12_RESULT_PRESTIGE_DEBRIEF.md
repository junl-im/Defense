# KingdomSeed v2.36.12 RESULT PRESTIGE DEBRIEF

## 목적

v2.36.9~v2.36.11에서 전투 오브젝트, 전투 HUD, 로그인/로비/월드맵 톤을 순서대로 올렸지만, 승리/패배 결과 화면은 여전히 기존 보상 팝업 구조가 강해서 상용 게임의 작전 보고 화면처럼 보이지 않았다.

v2.36.12는 전투가 끝나는 순간의 품질 인상을 높이기 위해 결과 화면을 프레스티지 디브리프 스타일로 보강한다. 새 대용량 이미지는 추가하지 않고, 정적 Phaser Graphics/Text 기반으로만 처리한다.

## 변경 요약

- `BattleResultPrestige.ts` 추가
  - 결과 화면 전용 프레스티지 백드롭
  - 작전 디브리프 헤더
  - 점수/생명/클리어 시간/최고 연속 처치 메트릭 카드
  - 보상/랭킹 패널 프레임
  - emoji medal 대신 `RANK 01` 형식의 랭킹 라벨
- 스테이지 클리어 화면 개선
  - `STAGE CLEAR` 단일 팝업에서 `OPERATION DEBRIEF / MISSION CLEAR` 톤으로 변경
  - 점수/생명/시간/체인 정보를 상단 카드로 분리
  - 보상/전술 목표/랭킹 패널의 프레임 일관성 강화
  - `★ / ☆` 중심 결과 텍스트는 프레스티지 모드에서 `PASS / OPEN / FAIL` 라벨로 완화
- 패배 화면 개선
  - 단순 실패 팝업에서 `DEFENSE FAILED` 디브리프 화면으로 변경
  - 최종 점수, 잔여 생명, 최고 체인 표시
  - 재도전 유도 문구를 전술 리포트 톤으로 변경
- 버튼 라벨 개선
  - 보상 열기 → 보급 개봉
  - 유물 제작소 → 유물 제작
  - 월드맵 → 작전 복귀
  - 다시 도전 → 재도전
- escape hatch 유지
  - `?plainresult`
  - `?legacyresult`
  - `?toydebug`

## 성능 정책

- 새 이미지, 새 atlas, 새 사운드 없음
- 기본 부팅 에셋 증가 없음
- Firebase/PWA/오디오 지연 처리 변경 없음
- 전투 중 아트 스트리밍 정책 변경 없음
- low power / reduced motion에서는 결과 화면 스캔라인 효과를 줄이거나 생략

## 검증

- `npm ci` 통과
- `npm run build` 통과
- Vite preview `/` HTTP 200 smoke check 통과
