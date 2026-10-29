# 곰같은여우 — BLOCK SURVIVAL TPS

**마인크래프트보다 한 단계 발전한 블록형 3인칭 몬스터·좀비 생존 슈팅게임** — 싱글플레이 웹 게임 ALPHA 0.1.

**게임 플레이**: https://junl-im.github.io/Defense/

기존 라니킹덤은 이 저장소의 기본 브랜치·공개 배포 대상에서 제거했습니다. 이전 프로젝트 전체 소스와 원형은 [archive/rani-kingdom-v539-20261029](https://github.com/junl-im/Defense/tree/archive/rani-kingdom-v539-20261029) 브랜치에서 별도로 보존합니다. 새 게임은 `BlockSurvivalTPS/`만 개발 기준으로 합니다.

## 조작 및 기능
- PC: WASD 이동, 마우스 시점, 좌클릭 사격, R 장전, Shift 질주, ESC 일시정지
- 모바일: 좌측 이동패드, 우측 시점 조작, 사격·장전·질주 버튼
- 3D 폐허 도시, 체력/탄약/웨이브, 추적형 몬스터, 전리품 소품, 차폐물, 재시작
- 처음 방문 시 무료 플레이. 실시간 멀티·클라우드 세이브는 미구현.

## 개발 및 배포
- [TPS 소스와 상세 검증 기준](./BlockSurvivalTPS/README.md)
- [CC0 에셋 출처 잠금](./BlockSurvivalTPS/research/source-lock.json) — 8개 공식 출처, 60개 원본 선별 파일
- [GitHub Pages 배포 액션](./.github/workflows/deploy-tps.yml): 테스트 → 원본 SHA 고정 3D GLB 7개 포함 → Three.js MIT 웹 번들 생성 → 정적 Pages 배포
- [라이선스·외부 저작물 안내](./THIRD_PARTY_NOTICES.md)

시작하려면 `cd BlockSurvivalTPS && npm install && npm test && npm run build` 후 `dist/index.html`을 로컬 정적 서버로 실행합니다. 또는 CI에서 배포용 ZIP을 받아 내부 바로 실행 HTML을 사용하세요.

**주의**: ALPHA 상태이며 일부 자산은 시제품용 대역입니다. 모바일 FPS·발열·GPU 렌더링과 완성형 좀비 행동은 별도 실기기 QA가 필요합니다.

© 2026 곰같은여우. 자체 신규 소스·게임 디자인은 별도 권리 보호를 받으며, 사용된 외부 소스와 CC0 콘텐츠는 각각의 원 라이선스를 따릅니다. SVG 아이콘·자산 사용 금지.
