# Runtime Stability Assurance v1.0.35

- ID: `DD-RELEASE-INTEGRITY-V135`
- 모바일 HUD: `DD-MOBILE-HUD-STABILITY-V135 / 23.3.0`
- 프레임 수명주기: `FrameScope`
- import 그래프: `src/bootstrap.js` 기준 도달 가능 모듈 자동 수집
- 서비스워커: 생성된 모듈 목록을 `SHELL_ASSETS`에 포함
- 무결성: 파일별 바이트·SHA-256 기록
- 내구성: 100웨이브 동안 FPS·파티클·투사체·위험물·활성 기록의 증가 상한 검사
- UI: 14개 모바일·가로·노치·키보드·브라우저 크롬·줌 프로필 검사
- 접근성: 보스 상태 라이브 리전, 체력·파훼 progressbar, 비활성 라벨 제거
- 빌드 툴체인: 로컬 Vite 설치 완전성 감사, 불완전 패키지는 예외 보고서 기록
- 프로덕션 번들: CI `npm ci` 이후 실제 Vite 빌드와 기존 번들 마커 게이트 유지
