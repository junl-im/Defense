# PROJECT HANDOFF — CURRENT v19.0.0

- Project: `DokkaebiLuckDefense3D_FULL_v19.0.0`
- Game: `19.0.0`
- Engine: `16.0.0`
- Save schema: `17`
- Patch: `Browser Reliability Lab`
- Art lock: `DD-ABSOLUTE-ART-BIBLE-2.0`

## Current runtime

- Three.js 0.185.1
- Vite 8.1.5
- 전투 GLB 19종
- v13 개별 스프라이트 415개
- v15 런타임 아틀라스 154프레임
- 런타임 수직 슬라이스 6/6
- 10웨이브 상태 시뮬레이션 10/10
- 최종 제작 아트 0/6
- 1,130개 생산 잠금 유지

## v19 reliability layer

- `src/runtime/browser-reliability-lab.js`
- `public/sw.js` 버전형 셸 캐시
- `public/browser-lab-v19.html`
- `scripts/run-browser-reliability-lab-v19.mjs`
- 부팅 시간·리소스 실패·Long Task·Heap·WebGL 컨텍스트 기록
- 페이지 숨김·BFCache·오프라인 전환 기록
- F7 즉시 표본, F6 전체 진단
- 공개 자동화 계약 `window.__DOKKAEBI_TEST_API__`

## Verification commands

```bash
npm run verify
npm run simulate:v1800
npm run build:static
node scripts/verify-static-dist.mjs
npm run browserlab:v1900
```

## Known limitations

- 컨테이너 Chromium에서 EGL/WebGL이 차단되면 Browser Lab은 셸·캐시·로컬 자산 계약까지만 실행한다.
- 실제 10웨이브 DOM 조작과 WebGL 화면 캡처는 GPU가 제공되는 브라우저 또는 실기기에서 수행해야 한다.
- 최종 신규 3D 영웅·몬스터·보스·환경은 아직 production-approved가 아니다.
## v19.0.0 CI atlas check hotfix

- Fixed GitHub Actions failure `ModuleNotFoundError: No module named 'PIL'`.
- v14/v15 atlas `--check` mode now uses the Python standard library only.
- Heavy image packages load only during intentional atlas regeneration.
- CI runs both checks with `python -S` before the full verification suite.
- Optional regeneration dependencies are listed in `requirements-atlas.txt`.


## v20.0.0 Visible Combat Rebuild

- 기준: v19.0.0 CI Hotfix
- 게임/에셋 리비전: 20.0.0
- 엔진: 17.0.0
- 세이브 스키마: 18
- 타이틀 마스코트와 반응형 배경은 `src/assets/title-v17/`를 계속 사용하며 v20 캐시 키를 적용합니다.
- `src/runtime/korean-language-guard.js`가 고립된 한자 아이콘의 화면 노출을 차단합니다.
- 신목 스케일 0.62, Scenic pitch 0.86입니다.
- 모바일에서는 비필수 상단 칩을 숨기고 조작 UI를 축소합니다.
