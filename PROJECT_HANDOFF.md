# PROJECT HANDOFF — 도깨비 운빨 수호대 3D

이 문서는 대화가 끊기거나 다른 개발자가 이어받아도 즉시 작업을 계속할 수 있도록 매 패치마다 누적 갱신하는 단일 인수인계 문서입니다.

마지막 갱신: 2026-07-20
현재 버전: 1.1.0
프로젝트 폴더명: `DokkaebiLuckDefense3D_v1.1.0`

---

## 1. 사용자 요구와 작업 방식

사용자는 모바일 웹에서 감탄이 나오는 3D 게임을 원합니다. AAA급 사실성보다 가볍고 화려한 3D, 짧고 강한 핵심 재미, 무료 GitHub/Firebase 배포를 우선합니다.

선호 게임 감성:

- 도깨비 키우기류
- 운빨존많겜류 랜덤 소환·합성
- 3D 공간을 직접 돌아다니는 액션
- 짧은 시간 안에 성장과 잭팟이 크게 보이는 구조

반드시 지킬 산출물 규칙:

1. 매 패치마다 전체 프로젝트 ZIP을 제공한다.
2. 매 패치마다 변경 파일만 담은 패치 ZIP을 별도로 제공한다.
3. 이 `PROJECT_HANDOFF.md`를 매번 갱신한다.
4. `PATCH_HISTORY.md`에 누적 변경 기록을 남긴다.
5. 결과 답변에서 다운로드 파일은 맨 아래에 배치한다.
6. 파일 링크 아래에는 다음 패치 예상 라인을 적는다.
7. ZIP에 `node_modules`를 포함하지 않는다.
8. 미리 빌드된 `dist/`는 전체 ZIP에 포함한다.
9. 패치 ZIP은 기존 프로젝트 루트에 그대로 덮어쓸 수 있는 구조로 만든다.
10. 삭제 파일이 있다면 패치 문서에 명시한다.

---

## 2. 프로젝트 탄생 배경

### 기존 Defense.zip 분석

기존 2D/Phaser 디펜스 프로젝트는 기능과 에셋이 과도하게 누적되어 중심 재미가 흐려졌습니다.

확인된 문제:

- 전체 약 550MB, node_modules 제외 약 249MB
- 이미지 약 3,300개
- 버전명이 붙은 에셋 약 2,885개
- 소스 약 37,700줄
- `GameScene.ts` 약 4,789줄
- 여러 아트 방향과 폴백 시스템이 동시에 잔존
- 패치가 패치를 부르는 구조

재사용하기로 한 것:

- 전투 데이터 개념
- 웨이브 개념
- 로컬 저장 우선 구조
- Firebase 익명 로그인과 랭킹 구조
- 모바일 저사양 대응 개념

버리기로 한 것:

- 기존 Phaser 렌더링
- 대량 이미지 에셋
- 복잡한 로그인·메뉴·월드맵·상점 흐름
- 여러 미술 방향을 동시에 유지하는 구조

상세 분석 원본: `DEFENSE_REVERSE_ENGINEERING.md`는 상위 작업 자료에 존재했으며 프로젝트 ZIP에는 포함하지 않았습니다.

---

## 3. 현재 게임의 한 줄 정의

3D 달빛 야시장을 직접 뛰어다니며 엽전을 줍고, 랜덤 도깨비를 소환·합성해 사방의 요괴를 막는 8~10분 액션 운빨 디펜스.

핵심 루프:

`이동 → 자동 공격 → 엽전 직접 수집 → 랜덤 소환 → 3개 자동 합성 → 인연 완성 → 축복 선택 → 보스 격파`

절대 흔들지 않을 핵심:

- 플레이어가 직접 움직여야 한다.
- 골드는 바닥에 떨어지고 직접 주워야 한다.
- 소환은 랜덤이며 실패 운이 대박 기운으로 누적된다.
- 동일 종류·동일 별 3개는 자동 합성된다.
- 메뉴보다 전투 한 판의 밀도를 우선한다.

---

## 4. 기술 스택

- Three.js `0.185.1`
- Firebase Web SDK `12.16.0`
- Vite `8.1.5`
- Vanilla JavaScript ES modules
- HTML/CSS HUD
- Web Audio API 절차형 효과음
- PWA manifest + service worker
- Firebase Authentication 익명 로그인
- Cloud Firestore 랭킹
- GitHub Actions + GitHub Pages

Node 권장:

- Node.js `20.19+` 또는 `22.12+`

주요 명령:

```bash
npm install
npm run verify
npm run dev
npm run build
npm run preview
npm run deploy:rules
npm run deploy
```

---

## 5. 현재 구현 상태

### 전장

- 달빛 야시장 단일 전장
- 중앙 신목
- 사방의 요괴문
- 절차형 등불, 시장 좌판, 바위, 달, 도깨비불
- 외부 텍스처·GLTF 없이 코드로 생성

### 플레이어

- 모바일 조이스틱 이동
- 오른쪽 드래그 카메라
- 자동 기본 공격
- 질주
- 도깨비불 난무 광역기

### 도깨비 6종

- 불씨 깨비: 연속 공격
- 달서리 깨비: 둔화
- 바람 갓깨비: 관통
- 바위 몽둥깨비: 범위 공격
- 방울 무당깨비: 연쇄 공격
- 번개 장군깨비: 처형

### 성장

- 1성~5성
- 동일 종류·동일 별 3개 자동 합성
- 별에 따라 크기·뿔·오라·빛·투사체 강화
- 슬롯 15개
- 슬롯이 가득 차면 가장 약한 도깨비 환생

### 운빨

- 랜덤 소환
- 낮은 등급일수록 대박 기운 증가
- 100%에서 영웅 이상 보장
- 6개 인연 시너지
- 8개 달의 축복

### 적과 웨이브

- 일반 적 4종
- 보스 2종
- 총 10웨이브
- 5웨이브 저승 호랑이
- 10웨이브 백귀 야행왕

### v1.1 전투 피드백

- 첫 2성 도깨비 무료 강림
- 첫 웨이브 자동 시작
- 미션 시네마틱 배너
- 보스 전용 체력바
- 연속 처치 체인
- 10연속 단위 엽전 보너스
- 치명타
- 3D 위치 기반 전투 숫자
- 무결점 웨이브 보너스
- 모바일 진동 피드백
- 평균 FPS 기반 동적 렌더 해상도 하향

---

## 6. 현재 밸런스 핵심값

파일: `src/main.js`

- 시작 골드: 70
- 첫 무료 소환: 2성 보장
- 기본 소환 비용: 30
- 4회 소환마다 비용 +5
- 최소 소환 비용: 18
- 최대 웨이브: 10
- 신목 체력: 100
- 플레이어 기본 사거리: 8.8
- 질주 재사용: 4.2초
- 광역기 기본 재사용: 13초
- 체인 유지 시간: 1.85초
- 10연속 처치마다 추가 엽전
- 무피해 웨이브 추가 보너스: `10 + wave * 2`

소환 확률 기본:

- 4성 약 1.8%
- 3성 약 8.7%
- 2성 약 18.5%
- 나머지 1성
- 대박 기운 100%: 3성 보장, 12% 확률로 4성

이 값들은 실제 기기 플레이 후 조정 대상입니다.

---

## 7. 파일 구조와 역할

```text
index.html
  전체 화면 DOM, HUD, 모달, 신규 전투 UI

src/main.js
  Three.js 초기화, 월드 생성, 전투, 웨이브, 소환, 합성, UI 갱신

src/style.css
  모바일 HUD, 모달, 전투 숫자, 보스 체력바, 체인 UI

src/firebase.js
  Firebase 익명 인증, dokkaebiScores 쓰기·읽기

public/sw.js
  PWA 캐시. 버전 패치마다 CACHE 문자열 갱신 필요

firestore.rules
  기존 Defense 규칙 + dokkaebiScores 규칙 병합

.github/workflows/deploy.yml
  GitHub Pages 자동 빌드 및 배포. base path `/Defense/`

scripts/verify-project.mjs
  DOM ID, 버전, 필수 파일 정적 검증

PROJECT_HANDOFF.md
  가장 먼저 읽어야 하는 누적 인수인계

PATCH_HISTORY.md
  패치별 변경 내역
```

`src/main.js`가 현재 약 1,700줄대로 성장하고 있습니다. 2,500줄 전에 다음 모듈 분리를 고려해야 합니다.

권장 분리 후보:

- `src/game/data.js`: 유닛, 적, 축복, 시너지 데이터
- `src/game/audio.js`: SoundEngine
- `src/game/effects.js`: 파티클, 링, 전투 숫자
- `src/game/firebase.js`: 현재 파일 유지 가능

단, 재미 검증 전에는 과도한 구조 개편을 하지 않습니다.

---

## 8. GitHub·Firebase 연결 기록

### Firebase

기존 `Defense.zip`에서 직접 확인:

- 프로젝트 ID: `web-game2`
- Auth Domain: `web-game2.firebaseapp.com`
- Storage Bucket: `web-game2.firebasestorage.app`
- 설정 파일: `.env.production`
- Firebase CLI 연결: `.firebaserc`

새 게임 랭킹 컬렉션:

- `dokkaebiScores`

기존 Defense에서 사용하는 경로:

- `users`
- `leaderboards/{boardId}/scores/{uid}`
- `dailySeeds`

`firestore.rules`는 위 기존 경로를 보존한 병합본입니다.

### GitHub

기존 문서에서 확인한 Pages 주소:

- `https://junl-im.github.io/Defense/`

예상 저장소:

- `https://github.com/junl-im/Defense`

주의:

- ZIP에 `.git`이 없어서 저장소 URL은 Pages 주소로 역추론했습니다.
- GitHub Desktop에 실제 origin이 다르면 실제 origin을 우선합니다.
- Pages base path는 `/Defense/`입니다.

### 권장 배포

- 게임 정적 파일: GitHub Pages
- 인증·랭킹: Firebase
- Firebase Hosting은 기존 콘텐츠 교체 가능성이 있으므로 선택 사용

---

## 9. v1.0.0 기록

최초 세로 슬라이스에서 구현:

- 전장 1개
- 플레이어 직접 이동
- 골드 직접 수집
- 도깨비 6종
- 자동 합성
- 인연 6종
- 축복 8종
- 적 4종, 보스 2종
- 10웨이브
- 로컬·Firebase 랭킹
- PWA

산출물명:

- `DokkaebiLuckDefense3D_v1.zip`

---

## 10. v1.1.0 기록

목표:

- 첫 3초의 인상 강화
- 전투 손맛 강화
- 기존 GitHub/Firebase 연결 반영
- 패치 전달 체계와 인수인계 체계 확립

추가:

- 무료 2성 강림
- 첫 웨이브 자동 시작
- 미션 배너
- 보스 HP UI
- 연속 처치
- 치명타·전투 숫자
- 무결점 보너스
- 진동
- 적응형 렌더 품질
- GitHub Actions
- Firebase 병합 규칙
- 검증 스크립트
- 누적 문서

산출물 규칙:

- 전체 ZIP: `DokkaebiLuckDefense3D_FULL_v1.1.0.zip`
- 패치 ZIP: `DokkaebiLuckDefense3D_PATCH_v1.1.0.zip`
- 각 ZIP SHA-256 파일

---

## 11. 검증 상태

자동 완료:

- `npm ci`
- `npm run build`
- `node --check src/main.js`
- `node --check src/firebase.js`
- DOM ID 연결 검사
- package/runtime 버전 검사
- 필수 배포·인수인계 파일 검사
- GitHub Pages base path `/Defense/` 별도 빌드 및 asset 경로 검사 완료
- v1.0.0 기준 패치 덮어쓰기 후 v1.1.0 전체 파일과 비교 일치

현재 환경 제한:

- Chromium을 SwiftShader/WebGL 옵션으로 실행해도 EGL/ANGLE GPU 프로세스 초기화가 실패하여 자동 시각 검수 불가
- 실제 Android Chrome 및 iPhone Safari 터치 감도는 사용자 기기 확인 필요

---

## 12. 알려진 위험과 주의점

1. **Firebase Hosting 교체 위험**
   - 같은 `web-game2` 프로젝트에 Hosting 배포하면 기존 콘텐츠가 교체될 수 있습니다.

2. **Firestore 규칙 배포**
   - 반드시 프로젝트에 포함된 병합 규칙을 사용합니다.
   - 새 규칙을 단순히 dokkaebiScores만 허용하도록 바꾸면 기존 Defense가 깨질 수 있습니다.

3. **GitHub 저장소 추정**
   - `junl-im/Defense`는 Pages 주소에서 추정했습니다.

4. **서비스 워커 캐시**
   - 패치마다 `public/sw.js`의 CACHE 문자열을 올려야 구버전 캐시 문제가 줄어듭니다.

5. **전투 숫자 성능**
   - 저사양 기기에서 샘플링하고 최대 DOM 수를 제한했지만 실제 기기 확인이 필요합니다.

6. **게임 난이도**
   - 첫 무료 2성으로 초반이 쉬워졌습니다. 웨이브 1~3 난이도를 실제 플레이 후 조정해야 합니다.

---

## 13. 다음 패치 추천 — v1.2.0

가칭: `요괴 패턴 & 도깨비 선택성 패치`

목표:

- 단순히 중앙으로 걷는 적을 넘어, 플레이어가 위치와 스킬 사용을 판단하게 만든다.
- 랜덤 소환의 운빨은 유지하되 최소한의 선택권을 제공한다.

예상 작업:

1. 저주 무당이 일정 시간 도깨비 공격 속도를 낮추는 저주 장판 생성
2. 돌갑옷 귀수가 전방 방패를 들어 특정 방향 피해 감소
3. 질주꾼이 경고선 후 신목으로 돌진
4. 보스 충격파에 바닥 예고 링 추가
5. 소환 결과 3개 중 하나를 고르는 `삼지선다 소환권` 축복 1종
6. 적 상태 아이콘 또는 간단한 색상 텔레그래프
7. 실제 기기에서 UI 겹침 수정
8. v1.2 전체 ZIP·패치 ZIP·인수인계 누적

작업 우선순위:

`적 패턴 3종 → 보스 예고 → 소환 선택권 → 모바일 QA → 밸런스`

---

## 14. 다음 작업자가 시작할 순서

1. `PROJECT_HANDOFF.md` 전체 읽기
2. `PATCH_HISTORY.md` 최신 버전 확인
3. `npm install`
4. `npm run verify`
5. `npm run build`
6. 실제 기기 QA 결과가 있으면 `QA_CHECKLIST.md`에 반영
7. v1.2 기능을 한 번에 많이 넣지 말고 적 패턴부터 구현
8. 패치 완료 후 전체 ZIP과 패치 ZIP을 각각 생성
9. `node_modules`, `.firebase`, 로그 파일을 ZIP에서 제외
10. SHA-256 체크섬 생성
