# 도깨비 운빨 수호대 3D

모바일 브라우저에서 직접 전장을 뛰어다니며 엽전을 줍고, 랜덤 도깨비를 소환·합성하는 Three.js 기반 3D 액션 운빨 디펜스입니다.

현재 버전: **1.6.0 — 집중 명령, 안정된 위험 안내, 성장 요약**

## 핵심 플레이

`이동 → 자동 공격 → 엽전 수집 → 랜덤 소환 → 3개 자동 합성 → 집중 명령 → 5성 궁극 진화 → 보스 격파 → 혼불 성장`

## v1.6 주요 변경

- 오른쪽 도깨비 목록을 눌러 같은 종류·같은 별 수호대 전체에 7초 집중 명령
- 집중 명령 중 공격력 55%, 공격속도 약 61%, 5성 궁극 충전 속도 강화
- 집중 명령 공용 재사용 대기시간 18초
- 장판과 질주꾼에 고유 ID를 부여해 위험 안내 대상이 프레임마다 바뀌는 현상 방지
- 덜 급한 경고는 0.14초 유지 확인 후 전환하고, 사라진 경고는 0.2초 완충 표시
- 제목 화면에서 이번 판 시작 엽전·신목 체력·도깨비 피해를 바로 확인
- 혼불 보상과 영구 성장 비용을 초반 1단계는 빠르고 후반은 선택이 필요하도록 재조정
- PC에서는 `R` 키로 현재 최고 등급 도깨비에 집중 명령

## 실행

Node.js `20.19+` 또는 `22.12+` 권장입니다.

```bash
npm install
npm run verify
npm run dev
```

프로덕션 빌드:

```bash
npm run build
npm run preview
```

전체 ZIP에는 미리 빌드된 `dist/`가 포함됩니다.

## GitHub Pages 배포

- 저장소: `junl-im/Defense`
- Pages: `https://junl-im.github.io/Defense/`
- base path: `/Defense/`
- 자동 배포: `.github/workflows/deploy.yml`

패치 ZIP 내부 파일을 저장소 루트에 그대로 덮어쓴 뒤 GitHub Desktop에서 commit·push하면 Actions가 빌드하고 배포합니다.

배포 후 최초 확인 주소:

```text
https://junl-im.github.io/Defense/?fresh=1.6.0
```

## Firebase

- 프로젝트 ID: `web-game2`
- Auth Domain: `web-game2.firebaseapp.com`
- 랭킹 컬렉션: `dokkaebiScores`

Firebase 연결이 실패해도 로컬 저장으로 플레이할 수 있습니다.

## 주요 파일

```text
src/main.js                 Three.js 월드, 전투, 집중 명령, 위험 안내, 영구 성장
src/game-data.js            도깨비, 적, 시너지, 축복, 계약 데이터
src/sound-engine.js         Web Audio 절차형 효과음
src/style.css               모바일 HUD, 명령 상태, 위험 안내, 성장 화면
src/firebase.js             익명 로그인과 온라인 랭킹
public/sw.js                구버전 서비스워커 캐시 제거 스크립트
PROJECT_HANDOFF.md          전체 개발 기록과 다음 작업 인수인계
```

## 패치 ZIP 적용

패치 ZIP에는 변경된 프로젝트 파일만 상대 경로 그대로 들어 있습니다.

1. 패치 ZIP 안의 파일 전체를 GitHub 저장소 루트에 덮어씁니다.
2. `npm install`과 `npm run verify`를 실행합니다.
3. GitHub Desktop으로 commit 후 push합니다.

패치 ZIP에는 `dist/`, `node_modules`, 별도 안내 문서가 없습니다. GitHub Actions가 새 `dist/`를 생성합니다.
