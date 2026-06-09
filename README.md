# Kingdom Seed / Defense

GitHub Pages + Firebase 무료 플랜 기준 모바일 웹 타워 디펜스 프로토타입입니다.

## 현재 버전 v0.2

- Firebase 프로젝트 `web-game2` 설정 반영
- 익명 / Google / 이메일 로그인
- Firestore 유저 세이브 / 일일 리더보드
- 1개 스테이지, 10웨이브
- 궁수 / 마법 / 병영 / 포탑
- 타워 3레벨 업그레이드
- Lv.3 특수 스킬
  - 궁수: 독화살
  - 마법: 마력 감속
  - 병영: 방패 태세
  - 포탑: 충격탄
- 영웅 레온
  - 빈 맵 터치 이동
  - 자동 근접 공격
  - 대지강타 스킬
- 글로벌 스펠
  - 메테오
  - 용병 소환

## 1. 로컬 실행

```bash
npm install
cp .env.example .env
npm run dev
```

Windows PowerShell에서는 아래처럼 복사해도 됩니다.

```powershell
copy .env.example .env
npm run dev
```

## 2. Firebase 설정

이미 아래 Web App 설정이 반영되어 있습니다.

```bash
VITE_FIREBASE_API_KEY=AIzaSyD0DWQWMSmGqYMAkJSZULmFmjsk7x8HRxE
VITE_FIREBASE_AUTH_DOMAIN=web-game2.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=web-game2
VITE_FIREBASE_STORAGE_BUCKET=web-game2.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=91491483724
VITE_FIREBASE_APP_ID=1:91491483724:web:0a3e02dcc4c8badd76b4e9
VITE_FIREBASE_MEASUREMENT_ID=G-SPYS3QERB5
```

로컬 개발은 `.env`, GitHub Pages 배포는 `.env.production`을 사용합니다.

## 3. Firestore Rules 배포

Firebase CLI 설치 후:

```bash
npm install -g firebase-tools
firebase login
firebase use web-game2
npm run deploy:rules
```

또는 Firebase Console > Firestore Database > Rules에 `firestore.rules` 내용을 붙여넣고 Publish 해도 됩니다.

## 4. GitHub Desktop으로 Repository 올리기

1. 이 폴더 압축을 풉니다.
2. GitHub Desktop 실행
3. File > Add Local Repository 선택
4. 압축 푼 `kingdom-seed-starter` 폴더 선택
5. Repository가 아니라고 나오면 `create a repository` 선택
6. 좌측 하단 Summary에 `Initial Kingdom Seed v0.2` 입력
7. Commit to main 클릭
8. Publish repository 클릭
9. GitHub 웹에서 Repository > Settings > Pages 이동
10. Source를 GitHub Actions로 선택
11. main에 push될 때마다 자동 배포됩니다.

## 5. Firebase Auth 확인

Firebase Console > Authentication > Sign-in method에서 아래 3개가 켜져 있어야 합니다.

- Anonymous
- Email/Password
- Google

Firebase Console > Authentication > Settings > Authorized domains에 아래 도메인을 확인하세요.

- localhost
- web-game2.firebaseapp.com
- 본인 GitHub Pages 도메인: `YOUR_ID.github.io`

## 6. 게임 조작

- 타워 스팟 터치: 방사형 건설 메뉴
- 타워 터치: 업그레이드 패널
- 병영 터치 후 집결지: 병사 이동 위치 변경
- 빈 맵 터치: 영웅 레온 이동
- 메테오 버튼 후 맵 터치: 광역 피해
- 용병소환 버튼 후 맵 터치: 15초 길막 용병 2명
- 대지강타 버튼: 영웅 주변 광역 피해 + 짧은 기절
- 조기 웨이브: 다음 웨이브 즉시 호출, 보너스 골드

## 7. 다음 개발 후보

- 진짜 픽셀 아트 에셋 교체
- 타워별 전용 투사체 애니메이션
- 연구소 영구 업그레이드 UI
- 스테이지 선택 월드맵
- 사운드 / 진동 / 타격 이펙트
- App Check 적용
