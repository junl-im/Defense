# QA 체크리스트 — v1.1.0

## 자동 확인 완료

- [x] `npm ci`
- [x] `npm run verify`
- [x] `node --check src/main.js`
- [x] `node --check src/firebase.js`
- [x] `npm run build`
- [x] HTML ID와 JavaScript DOM 참조 누락 검사
- [x] package/runtime 버전 1.1.0 일치
- [x] 필수 배포·인수인계 파일 존재 검사
- [x] Firebase 코드 동적 청크 분리 확인
- [x] `dist/` 생성 확인
- [x] `VITE_BASE_PATH=/Defense/` GitHub Pages 전용 빌드
- [x] GitHub Pages 빌드의 JS/CSS 경로가 `/Defense/assets/...`로 생성됨
- [x] v1.0.0 기준 패치 ZIP 덮어쓰기 후 전체 v1.1.0과 파일 비교 일치
- [x] 프로젝트 ZIP에서 `node_modules` 제외 예정

## 실제 기기에서 확인할 항목

### 시작과 첫 30초

- [ ] Android Chrome에서 타이틀 화면 표시
- [ ] iPhone Safari에서 타이틀 화면 표시
- [ ] 시작 후 약 0.5초에 2성 도깨비 무료 강림
- [ ] 시작 후 약 2.5초에 첫 웨이브 자동 시작
- [ ] 미션 배너가 HUD와 겹치지 않음
- [ ] 첫 무료 소환에서 골드가 차감되지 않음
- [ ] 시작 골드가 70으로 유지됨

### 신규 전투 피드백

- [ ] 일반 피해 숫자 표시
- [ ] 치명타 숫자가 더 크게 표시
- [ ] 저사양 기기에서 전투 숫자 과다 생성 없음
- [ ] 연속 처치 x2 이상 UI 표시
- [ ] 10연속 처치에서 추가 엽전 지급
- [ ] 체인 시간이 끝나면 UI 숨김
- [ ] 신목 무피해 웨이브에서 무결점 보너스
- [ ] 보스 등장 시 체력바 표시
- [ ] 보스 사망 시 체력바 숨김
- [ ] 지원 기기에서 소환·합성·피격 진동 작동

### 모바일 성능

- [ ] 4.5초 샘플 후 저프레임에서 최적화 배지 표시
- [ ] 렌더 해상도 하향 후 터치 좌표와 화면 일치
- [ ] 저사양 Android에서 30 FPS 이상 목표
- [ ] 장시간 플레이 후 전투 숫자 DOM 누적 없음
- [ ] 10웨이브 종료 후 메모리 급증 없음

### 기존 게임 루프 회귀

- [ ] 조이스틱 이동
- [ ] 오른쪽 드래그 카메라
- [ ] 질주
- [ ] 도깨비불
- [ ] 랜덤 소환 비용 증가
- [ ] 동일 종류·동일 별 3개 자동 합성
- [ ] 5성 합성 이후 오류 없음
- [ ] 슬롯 15개 환생 처리
- [ ] 대박 기운 100% 보장
- [ ] 인연 시너지 적용
- [ ] 3·6·9웨이브 축복
- [ ] 5웨이브 저승 호랑이
- [ ] 10웨이브 백귀 야행왕
- [ ] 승리·패배 결과 화면

### Firebase·GitHub

- [ ] Firebase Authentication 익명 로그인 활성화
- [ ] `npm run deploy:rules` 성공
- [ ] 기존 Defense 사용자·리더보드 읽기 정상
- [ ] `dokkaebiScores` 생성·읽기 정상
- [ ] GitHub Pages workflow 성공
- [ ] Pages 주소 `/Defense/`에서 정적 파일 경로 정상
- [ ] 새로고침 후 404 없음
- [ ] PWA 서비스 워커가 v1.1.0 캐시로 교체

## 현재 환경의 검수 제한

제작 환경의 Chromium을 `--use-gl=swiftshader --enable-webgl`로 실행했지만 EGL/ANGLE GPU 프로세스 초기화가 실패해 제한 시간 내 DOM 렌더가 완료되지 않았습니다. 정적 코드, Vite 번들, DOM 연결, 배포 경로는 자동 검사했으며 최종 시각 품질과 터치 감도는 실제 Android·iOS에서 확인해야 합니다.
