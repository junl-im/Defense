# PROJECT HANDOFF — RELEASE 1.0.3

- Project: `DokkaebiLuckDefense3D_FULL_v1.0.3`
- Public game version: `1.0.3`
- Legacy development lineage: `23.1.0`
- Build ID: `b24.3`
- Engine: `21.0.0`
- Save schema: `21`
- Patch: `State and Lifecycle Foundation`
- Base: `1.0.2 Code Health Foundation`
- Art lock: `DD-ABSOLUTE-ART-BIBLE-2.0`

## PERMANENT VERSION CONTRACT

1. 일반 기능·기술·성능·버그 수정은 `1.0.1 → 1.0.2 → ... → 1.0.109` 순서로 올린다.
2. 초대규모 시스템 개편에서만 `1.1.0`, `1.2.0`처럼 중간 번호를 올린다.
3. 과거 개발 계보 `23.1.0`은 회귀 검증용으로 보존한다.
4. 캐시·배포 순서는 공개 버전이 아니라 단조 증가 `buildId`로 관리한다.
5. 공개 버전, 내부 계보, 빌드 ID를 다시 하나의 값으로 합치지 않는다.

## PERMANENT CODE HEALTH CONTRACT

1. 참조 0건 파일도 과거 회귀 증거인지 확인하기 전에는 삭제하지 않는다.
2. 현재 실행 그래프 밖의 증거 모듈은 코드 건강 감사 허용 목록으로만 보존한다.
3. 최신 구현이 대체한 런타임 인스턴스·CSS·import는 제거한다.
4. 동일 내용의 정식 문서는 하나의 정본만 유지한다.
5. 예상치 못한 비활동 모듈, 사용하지 않는 import, 중복 문서, 깨진 패키지 명령은 검증 실패로 처리한다.
6. 코드 건강 감사 결과는 `logs/audits/` 아래에만 생성한다.

## PERMANENT NATIVE KEY CONTRACT

1. F1~F12를 게임 기능에 연결하거나 `preventDefault()`로 차단하지 않는다.
2. 게임 전역 액션 단축키를 추가하지 않는다.
3. 키보드 전역 입력은 WASD·방향키 이동에만 사용한다.
4. 스킬·소환·상호작용·진단·일시정지는 화면 버튼으로 실행한다.
5. 포커스된 버튼의 Enter·Space는 접근성 표준 동작으로 유지한다.
6. PC 타이틀은 마스코트와 접속 패널을 서로 다른 열에 배치한다.

## PERMANENT ROOT HYGIENE CONTRACT

1. 프로젝트 루트에는 실행·빌드·배포 핵심 파일과 `README.md`, `PROJECT_HANDOFF.md`만 허용한다.
2. 로그·감사 JSON·시뮬레이션 JSON·미리보기·ZIP·패치 관리 파일을 루트에 생성하지 않는다.
3. 검증·빌드 출력은 `logs/verify/`, `logs/build/`에 생성한다.
4. 시뮬레이션·자동 감사는 `logs/simulations/`, `logs/audits/`에 생성한다.
5. 패치 관리 파일은 `logs/patch/<version>/` 아래에만 둔다.
6. 과거 루트 패치 잔재는 `clean:obsolete`가 `logs/legacy-root-output/`으로 이동한다.
7. 전체 ZIP에는 생성 로그를 넣지 않고 `logs/README.md`만 유지한다.

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

## Required verification

```bash
npm run clean:obsolete
npm run hygiene:check
npm run audit:code:v102
npm run verify:release:v103
npm run verify
npm run simulate:v2300
npm run simulate:v2200
npm run simulate:v1800
npm run build:static
node scripts/verify-static-dist.mjs
npm run patch:prepare:v103
npm run patch:verify:v103
npm run hygiene:check
```

## Known limitations

- 컨테이너 Chromium GPU 제한으로 실제 WebGL 장시간 플레이는 수행하지 못했다.
- 실제 스마트폰 주소창·접근성 글꼴·폴더블 화면 QA가 남아 있다.
- 최종 제작 아트 승인은 0/6이며 대량 생산은 잠금 상태다.
