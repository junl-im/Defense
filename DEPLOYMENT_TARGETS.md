# 배포 대상 기록

마지막 갱신: 2026-07-20

## Firebase

기존 `Defense.zip`에서 직접 확인한 값입니다.

- 프로젝트 ID: `web-game2`
- Auth Domain: `web-game2.firebaseapp.com`
- Storage Bucket: `web-game2.firebasestorage.app`
- 설정 파일: `.env.production`
- Firebase CLI 대상: `.firebaserc`
- 새 랭킹 컬렉션: `dokkaebiScores`

### 중요

`firestore.rules`는 기존 Defense의 `users`, `leaderboards`, `dailySeeds` 규칙을 유지하면서 `dokkaebiScores`만 추가한 병합본입니다.

Firebase Hosting 배포는 같은 프로젝트의 기존 Hosting 콘텐츠를 교체할 수 있습니다. 현재 권장 구성은 다음과 같습니다.

- GitHub Pages: 게임 정적 파일
- Firebase Authentication: 익명 로그인
- Firestore: 온라인 랭킹

## GitHub

기존 프로젝트 문서에서 확인한 Pages 주소:

- Pages: `https://junl-im.github.io/Defense/`
- 예상 저장소: `https://github.com/junl-im/Defense`
- Vite base path: `/Defense/`

ZIP에는 `.git` 폴더가 없어 저장소 URL은 Pages 주소를 기준으로 추정했습니다. GitHub Desktop에 등록된 실제 원격 URL이 다르면 실제 원격을 우선합니다.

## 배포 명령

```bash
npm install
npm run verify
npm run build
npm run deploy:rules
```

Firebase Hosting까지 교체할 때만:

```bash
npm run deploy
```
