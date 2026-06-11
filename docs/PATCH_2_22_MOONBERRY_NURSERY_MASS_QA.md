# v2.22.0 Moonberry Nursery Massive Art QA

## 목표
- v2.21 누적 작업본 위에 문베리 보육실/달빛 정원 톤의 대량 아트 레이어를 추가합니다.
- 단순 장식 추가가 아니라 씬 전환, 지연 호출, 토스트/팝업 안정성을 함께 보강합니다.
- GitHub Desktop에서 덮어쓰기/커밋하기 쉬운 누적형 패치 구조를 유지합니다.

## 신규 에셋
- `public/assets/ui/v2_22/` 신규 PNG 91개 + WebP 91개, 총 182개 파일.
- 로그인: 문베리 타이틀, 퀼트 창문 프레임, 구름 지붕, 버튼 참, 올빼미/복숭아 드래곤 마스코트.
- 로비: 문베리 배너, 하단 퀼트 독, 재화 잼, 상점/우편/퀘스트/이벤트 아이콘, 신규 NPC 4종.
- 월드맵: 달빛 미리보기 프레임, 문베리 노드 링, 진주 루트, 잎 리본 루트, 보스 성문, 잠금/보상 장식.
- 전투: 상단 레이스, 하단 퀼트 스킬 독, 꽃 리본, 문베리 스킬 카드, 콤보/보스/안전/마나 장식.
- QA 토큰: 씬 생존, 터치, 메모리, WebP, 입력 보호, 성능 점검 아이콘.

## 코드 변경
- `CuteFantasyArtV222.ts` 추가.
- 로그인/로비/월드맵/전투 씬에 v2.22 장식 레이어 연결.
- 버전 라벨과 scene-ready 이벤트를 `2.22.0`으로 갱신.
- BootScene WebP 최적화 패턴에 `v2_22` 추가.
- BootScene의 중복 `battle-bg-stage_001` 이미지 로드 1건 정리.
- `SceneSafety.ts`에 게임 오브젝트/타이머 정리 헬퍼를 보강.
- `CombatRewards`, `PremiumDesignKit`, `TacticalDirector`, `GameScene`의 일부 직접 delayedCall을 safeDelayedCall로 교체해 씬 종료 후 콜백 실행 위험을 줄임.

## 검증
- `npx tsc --noEmit --pretty false` 통과.
- `npm run build` 통과.
- Vite의 500kB 이상 청크 경고는 기존 번들 크기 경고이며 실행 차단 오류는 아님.
