# PROJECT HANDOFF — CURRENT v23.1.0

- Project: `DokkaebiLuckDefense3D_FULL_v23.1.0`
- Game: `23.1.0`
- Engine: `21.0.0`
- Save schema: `21`
- Patch: `Native Input Shell`
- Base: `v23.0.1 Boot Recovery`
- Art lock: `DD-ABSOLUTE-ART-BIBLE-2.0`



## PERMANENT NATIVE KEY CONTRACT

1. F1~F12를 게임 기능에 연결하거나 `preventDefault()`로 차단하지 않는다.
2. 게임 전역 액션 단축키를 추가하지 않는다.
3. 키보드 전역 입력은 WASD·방향키 이동에만 사용한다.
4. 스킬·소환·상호작용·진단·일시정지는 화면 버튼으로 실행한다.
5. 포커스된 버튼의 Enter·Space는 접근성 표준 동작이므로 유지한다.
6. 새 전역 키 단축키가 발견되면 `verify:v2310`이 실패해야 한다.
7. PC 타이틀은 마스코트와 접속 패널을 서로 다른 열에 배치한다.

## PERMANENT ROOT HYGIENE CONTRACT

이 규칙은 모든 후속 패치에서 변경 없이 상속한다.

1. 프로젝트 루트에는 실행·빌드·배포 핵심 파일과 `README.md`, `PROJECT_HANDOFF.md`만 허용한다.
2. 루트에 임의의 `.log`, 감사 JSON, 시뮬레이션 JSON, 미리보기 이미지, ZIP, 백업 파일을 생성하지 않는다.
3. 검증·빌드 출력은 `logs/verify/`, `logs/build/`에만 생성한다.
4. 시뮬레이션·자동 감사는 `logs/simulations/`, `logs/audits/`에만 생성한다.
5. 패치 manifest, 적용 안내, 파일 목록, 패치 검증 결과는 반드시 `logs/patch/<version>/` 아래에 넣는다. 패치 ZIP 최상위에 관리 파일을 두지 않는다.
6. `docs/`는 정식 문서와 승인된 기준선 전용이다. 일반 검증이 `docs/`를 덮어쓰면 안 된다.
7. 기준선 갱신은 리뷰 후 `--refresh-baseline`을 명시한 경우에만 허용한다.
8. 신규 루트 파일·디렉터리는 `scripts/verify-root-hygiene.mjs` 허용 목록 변경과 구조 문서 리뷰 없이는 추가하지 않는다.
9. 패치 diff 생성 전과 깨끗한 기준본 적용 후 모두 `npm run hygiene:check`를 실행한다.
10. 전체 ZIP과 패치 ZIP에는 임시 로그를 넣지 않는다. `logs/README.md`만 전체본에 유지한다.

상세 계약: `docs/PROJECT_STRUCTURE_RULES_v1.0.md`

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

## Structure commands

```bash
npm run hygiene:check
npm run hygiene:organize
npm run verify:logged
npm run build:logged
```

## Release verification

```bash
npm run verify
npm run simulate:v2300
npm run simulate:v2200
npm run simulate:v1800
npm run build:static
node scripts/verify-static-dist.mjs
npm run hygiene:check
```

## Known limitations

- 컨테이너 Chromium의 GPU 제한으로 실제 WebGL 장시간 플레이는 수행하지 못했다.
- 실기기 모바일 주소창, 접근성 글꼴, 폴더블 화면 QA가 남아 있다.
- 최종 제작 아트 승인은 0/6이며 대량 생산은 잠금 상태다.
