# 도깨비 운빨 수호대 3D v1.1.0

모바일 브라우저에서 바로 실행되는 **3D 액션 + 랜덤 소환 + 자동 합성 디펜스**입니다.

이번 버전은 첫 3초의 인상과 전투 피드백을 강화했습니다. 게임을 시작하면 희귀 도깨비가 무료로 강림하고, 첫 웨이브가 자동 개방됩니다. 전투 중에는 보스 체력바, 연속 처치, 치명타 숫자, 무결점 웨이브 보너스와 모바일 진동 피드백이 표시됩니다.

## 핵심 플레이

1. 플레이어가 3D 달빛 야시장을 직접 이동합니다.
2. 사방에서 몰려오는 요괴를 플레이어와 도깨비가 자동 공격합니다.
3. 처치한 요괴가 떨어뜨린 엽전을 직접 주워야 합니다.
4. 엽전으로 6종 중 하나의 도깨비를 랜덤 소환합니다.
5. 같은 종류·같은 별의 도깨비 3개가 모이면 자동 합성됩니다.
6. 운이 나쁘면 `대박 기운`이 쌓이고, 100%에서 영웅 이상 소환이 보장됩니다.
7. 3웨이브마다 달의 축복을 선택합니다.
8. 5·10웨이브 보스를 포함한 총 10웨이브를 방어합니다.

## v1.1.0 주요 변경

- 첫 시작 시 2성 도깨비 무료 강림
- 첫 웨이브 자동 시작과 미션 시네마틱 배너
- 보스 전용 체력바
- 연속 처치 체인과 10연속 단위 엽전 보너스
- 치명타 확률과 3D 좌표 기반 전투 숫자
- 신목 무피해 웨이브의 `무결점` 보너스
- 소환·합성·보스·스킬·피격 진동 피드백
- 실시간 FPS에 따른 렌더 해상도 자동 하향
- 기존 `web-game2` Firebase 프로젝트 설정 반영
- 기존 Defense 데이터 규칙과 새 랭킹 규칙 병합
- GitHub Pages 자동 배포 워크플로 포함
- 누적 인수인계 문서와 패치 기록 추가

## 실행

Node.js 20.19 이상 또는 22.12 이상을 권장합니다.

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

미리 생성된 `dist/`가 포함됩니다. `file://`로 직접 열지 말고 정적 서버 또는 `npm run preview`를 사용하세요.

## 조작

### 모바일

- 왼쪽 원형 패드: 이동
- 화면 오른쪽 드래그: 카메라 회전
- `질주`: 짧은 고속 이동
- `도깨비불`: 주변 광역 공격
- `랜덤 소환`: 엽전으로 도깨비 소환
- `다음 습격`: 준비가 끝난 뒤 다음 웨이브 시작

### PC

- 이동: `WASD` 또는 방향키
- 질주: `Space`
- 도깨비불: `Q`
- 랜덤 소환: `E`
- 다음 웨이브: `Enter`
- 일시정지: `Esc`
- 카메라: 오른쪽 영역 드래그, 휠 확대·축소

## 기존 GitHub·Firebase 연결

기존 `Defense.zip`에서 확인한 연결 정보를 반영했습니다.

- Firebase 프로젝트 ID: `web-game2`
- Firebase Auth Domain: `web-game2.firebaseapp.com`
- Firebase 설정: `.env.production`
- Firebase 프로젝트 연결: `.firebaserc`
- 기존 GitHub Pages 기록: `junl-im.github.io/Defense`
- 기존 저장소로 추정되는 대상: `junl-im/Defense`
- GitHub Pages base path: `/Defense/`

GitHub 저장소 주소는 ZIP 안의 `.git` 정보가 아니라 기존 Pages 주소에서 역추론한 값입니다. GitHub Desktop에서 원격 저장소가 다르게 표시되면 GitHub Desktop의 실제 `origin`을 우선하세요.

## 권장 무료 배포 방식

### GitHub Pages: 게임 클라이언트

`.github/workflows/deploy.yml`이 `main` 브랜치 push 때 자동 빌드하고 Pages에 배포합니다. `.env.production`의 Firebase 웹 설정도 빌드에 포함됩니다.

### Firebase: 익명 로그인·Firestore 랭킹

Authentication에서 익명 로그인을 활성화하고 아래 명령으로 병합된 규칙만 먼저 배포하는 방식을 권장합니다.

```bash
npm install -g firebase-tools
firebase login
npm run deploy:rules
```

`npm run deploy`는 Firebase Hosting의 현재 콘텐츠를 이 게임으로 교체합니다. 기존 게임이 같은 Firebase Hosting을 사용 중이라면 먼저 백업하거나 GitHub Pages만 사용하세요.

새 게임의 랭킹 컬렉션은 기존 데이터와 분리된 `dokkaebiScores`입니다.

## GitHub Desktop 패치 적용

전체 ZIP을 사용할 때는 새 폴더에 풀고 GitHub Desktop에서 저장소를 추가합니다.

패치 ZIP을 사용할 때는 기존 프로젝트 루트에 **덮어쓰기**한 뒤 아래 순서로 확인합니다.

덮어쓰기 후 `DELETE_FILES_v1.1.0.txt`의 구버전 빌드 파일을 삭제하면 `dist/`도 깔끔하게 정리됩니다.

```bash
npm install
npm run verify
npm run build
```

패치 상세는 `APPLY_PATCH_v1.1.0.md`를 참고하세요.

## 프로젝트 구조

```text
├─ .github/workflows/deploy.yml  GitHub Pages 자동 배포
├─ scripts/verify-project.mjs    정적 연결·버전 검증
├─ src/
│  ├─ main.js                    게임 로직과 절차형 3D 에셋
│  ├─ style.css                  모바일 HUD와 전투 UI
│  └─ firebase.js                Firebase 온라인 랭킹
├─ public/                       PWA 파일
├─ dist/                         프로덕션 빌드 결과
├─ PROJECT_HANDOFF.md            다음 대화·개발자용 누적 인수인계
├─ PATCH_HISTORY.md              버전별 누적 변경 기록
├─ DEPLOYMENT_TARGETS.md         GitHub·Firebase 연결 기록
├─ firestore.rules               기존 Defense + 새 게임 병합 규칙
└─ QA_CHECKLIST.md               테스트 목록과 결과
```

## 성능 설계

- 모바일 기기는 초기 픽셀 비율과 파티클 수를 낮춥니다.
- 플레이 중 평균 FPS가 낮으면 렌더 해상도를 한 단계 더 낮춥니다.
- 심각한 저프레임에서는 동적 그림자를 끕니다.
- 전투 숫자는 저사양 기기에서 일부만 표시하고 DOM 개수를 제한합니다.
- Firebase 코드는 환경 설정이 있을 때만 동적으로 로드됩니다.
- 한 전장의 도깨비 슬롯은 15개로 제한됩니다.

## 현재 의도적 제한

- 계정 기반 영구 성장
- 장비·스킨·상점·광고·결제
- 여러 전장과 스토리
- 멀티플레이
- 실제 제작 음원과 GLTF 캐릭터 애니메이션
- 서버 권위형 치트 방지

향후 작업은 `PROJECT_HANDOFF.md`의 다음 패치 계획을 기준으로 이어갑니다.
