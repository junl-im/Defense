# v2.21.0 Candy Kingdom Massive Art QA Patch

## 목적

v2.16~v2.20까지 쌓아온 귀엽고 말랑한 판타지 방향을 유지하면서, 이번에는 “캔디 왕국/사탕 정원” 톤으로 로그인·로비·월드맵·전투 화면을 더 풍성하게 확장한 누적형 대량 패치입니다. 동시에 지연 호출과 토스트 타이머 정리를 공통 유틸로 묶어 씬 전환 안정성을 더 끌어올렸습니다.

## 신규 에셋

- `public/assets/ui/v2_21/` 신규 PNG 71개
- 동일 파일명 WebP 71개
- 총 142개 신규 이미지 파일
- 주요군:
  - 캔디 왕국 로그인 타이틀, 별빛 창문 프레임, 구름/리본 장식
  - 판다 가드, 꽃사슴, 단풍 고슴도치, 구름 목동, 잼 펭귄 마스코트
  - 로비 재화 잼 배지, 컵케이크 상점, 우편 비둘기, 이벤트 반딧불 병
  - 월드맵 롤리팝 노드, 설탕줄 루트, 잎 스티치 루트, 쿠키 보스 게이트
  - 전투 캔디 레이스, 쿠션 스킬 독, 덩굴 리본, 캔디 스킬 카드/오브/콤보 장식
  - 미니 품질 토큰 8종으로 QA/모바일/성능 상태 장식 자산 확장

## 코드 변경

- `src/game/CuteFantasyArtV221.ts` 추가
  - `addV221LoginArt`
  - `addV221LobbyArt`
  - `addV221WorldMapArt`
  - `addV221BattleArt`
  - `addV221ToastFrame`
- `src/game/SceneSafety.ts` 추가
  - `safeDelayedCall`로 씬 비활성/종료 후 지연 콜백 실행을 차단
  - `clearTimer`로 타이머 제거 패턴을 통일
- `BootScene`에 v2.21 에셋 로딩 추가
- WebP 최적화 로더 대상에 `assets/ui/v2_21` 추가
- `MenuScene`, `MainMenuScene`, `WorldMapScene`, `GameScene`에 v2.21 장식 레이어 적용
- 버전 칩과 scene-ready 이벤트를 `2.21.0`으로 갱신

## QA 수정

- 로비와 월드맵 토스트 타이머를 `clearTimer`/`safeDelayedCall` 기반으로 정리했습니다.
- 로비와 월드맵 씬 종료 시 토스트 타이머와 토스트 tween을 정리하도록 보강했습니다.
- 로그인 화면의 scene-ready와 메인메뉴 전환 지연 호출을 안전 지연 호출로 교체했습니다.
- 전투 시작 지연 호출, 일일 도전 메시지, 전술 카드 호출, 웨이브 자동 진행, 적 affix 안내, 콤보/메시지/전술 힌트 hide timer를 안전 호출로 정리했습니다.
- 전투 자동 웨이브 정리 시 남아 있을 수 있는 spawn timer들을 제거해 다음 웨이브/씬 전환과 충돌하지 않게 보강했습니다.
- 보상 상자 오픈 연출 지연 호출이 씬 전환 후 실행되지 않도록 가드했습니다.

## 검증

```bash
npx tsc --noEmit --pretty false
npm run build
```

둘 다 통과했습니다. Vite 빌드에서는 기존과 동일하게 큰 번들 경고가 표시될 수 있습니다.

## 적용

프로젝트 루트에 압축을 풀어 그대로 덮어씁니다. `.git`, `node_modules`, `dist`는 패치 zip에 포함하지 않습니다.
