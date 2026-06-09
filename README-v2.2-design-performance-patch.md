# Kingdom Seed v2.2 - Design Detail & Performance Patch

적용 기준: v2.1 commercial systems 패치 이후.

## 포함 내용

- PC 화면 회전 재점검: 데스크톱은 브라우저 창이 세로로 좁아져도 회전하지 않음
- 모바일 세로 화면에서만 CSS 회전 fallback 유지
- 자동 품질 프로파일: 절전 / 균형 / 고품질
- deviceMemory, CPU core, DPR, 모바일 여부를 기준으로 초기 품질 자동 결정
- 전투 중 FPS 저하가 이어지면 자동으로 품질을 낮춤
- 일시정지 패널에서 품질 수동 변경 가능
- 이펙트 예산 시스템 추가: 한 프레임/1초에 과도한 파티클 생성 방지
- 투사체, 타격, 폭발, 사망, 업그레이드 이펙트에 비용 제한 적용
- 스테이지별 전투 화면 비네트/코너 장식/광선/부유 파티클 추가
- `?perf` URL 파라미터로 FPS/품질 디버그 표시

## 적용 파일

```txt
src/main.ts
src/style.css
src/platform/WebShell.ts
src/game/QualityManager.ts
src/game/VisualPolish.ts
src/game/Effects.ts
src/scenes/GameScene.ts
docs/PERFORMANCE_POLISH_V22.md
```

## 테스트

```bash
npm run build
```

배포 후 확인:

```txt
https://junl-im.github.io/Defense/?v=220
```

FPS/품질 디버그:

```txt
https://junl-im.github.io/Defense/?v=220&perf
```
