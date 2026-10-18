# 왕국전략 — 로컬 개발 및 Firebase 프로젝트 기준

## 실제 프로젝트 식별자
- 로컬 PC 작업 폴더: `D:\K-city-webgame\Defense`
- GitHub 원격: https://github.com/junl-im/Defense
- GitHub Pages 공개 주소: https://junl-im.github.io/Defense/
- Firebase **프로젝트 표시 이름**: Defense game
- Firebase **프로젝트 ID**: `web-game2`
- Firebase 콘솔: https://console.firebase.google.com/project/web-game2/overview

로컬 드라이브는 이 대화의 연결 대상이 아니므로 GitHub의 커밋이 PC 폴더에 자동 반영되는 것은 아닙니다.

## PC에서 최신 버전 반영
Windows 명령 프롬프트:
```bat
cd /d D:\K-city-webgame\Defense
git status
git remote -v
git fetch origin
git pull --ff-only origin main
python -m http.server 8123
```
브라우저에서 http://localhost:8123 를 여세요.

**중요:** `git status`에 로컬 수정 내용이 남아 있다면 먼저 보존하세요. 무턱대고 `git reset --hard` 또는 `git clean -fd`를 사용하지 마세요. 이 폴더가 다른 원격 저장소를 가리키는 경우 `git remote -v`를 확인하고 올바른 저장소로 연결해야 합니다.

## Firebase 연결 상태
`.firebaserc`에 프로젝트 ID `web-game2`를 기입했습니다. **이것만으로 로그인·실시간 서버·원격 저장이 연결되는 것은 아닙니다.** 지금은 GitHub Pages + 브라우저 로컬 저장 방식 그대로 실행됩니다.

향후 서버를 구축하기 전에 다음을 확인합니다.
1. Firebase 콘솔에서 **실제 `web-game2` 프로젝트 존재와 현재 서비스·무료 한도·도메인** 확인.
2. Firebase 웹 앱 설정을 확인하고 승인된 앱 초기화 코드를 연결. 임의의 API 키나 앱 ID를 만들어 넣지 않기.
3. Firebase Authentication 인증 방식과 사용 권한을 설계.
4. 사용자 개인 데이터는 `users/{uid}/defenseGame/...`처럼 본인 UID 경로로 분리하고, Firestore 보안 규칙에 **요청 UID === 로그인 UID** 검증. 기존 프로젝트의 데이터·보안 규칙을 덮어쓰지 않기.
5. 기존 `localStorage`에 있는 왕국 진행을 **사용자 승인 및 중복/버전 검사 후** 안전하게 마이그레이션. 이전 진행을 자동 삭제하지 않기.
6. Firebase와 GitHub Actions 시크릿은 절대 Git에 커밋하지 않기. 클라이언트 설정과 서버 비밀키를 혼동하지 않기.
7. 사용자 간 실시간 PvP는 Firebase DB만 연결한다고 구현되지 않습니다. 전투 검증·쿨다운·자원 처리·중복 요청 방지 같은 **서버 권한 검증**이 필요합니다.

## 이번 v0.3 개발
- 이벤트 기반 6단계 한글 왕국 성장 길잡이.
- 영토 설치·숲·농경지·농업 연구·영토 8칸·왕국 승격과 연결.
- 게임을 새로 시작하거나 새로고침해도 기존 게임 상태에서 목표 진행도를 다시 계산 (저장 데이터 구조 무변경).
- 모바일 메뉴 바로가기, PC 화면 바로가기, 접기/펼치기, 기존 모바일 HUD 보존.
- 퀘스트 보상으로 가짜 자원을 지급하거나 기존 경제 구조를 우회하지 않음.

## v0.4 백업·복원 개발 내용
기존 로그인 서버 없이도 게임 내 '저장 관리' 버튼으로 JSON 다운로드·복원을 지원합니다.
복원 전에 파일 구조를 검사하며, 복원 전 기록을 로컬 브라우저에 1회 되돌리기용으로 보관합니다.
주의: 같은 기기의 localStorage에 저장된 되돌리기 기록은 사이트 데이터 삭제 시 함께 지워집니다. 내려받은 파일을 별도 보관해야 합니다.
Firebase `web-game2` 계정/Firestore/실시간 PvP는 아직 **미연결**입니다. 향후 클라우드 세이브를 추가할 때 이 JSON 형식과 이전 로컬 기록 마이그레이션을 기준으로 설계합니다.
