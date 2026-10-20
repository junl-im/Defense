# 라니킹덤 v5.9 — 모바일 GitHub Pages HTTP 429 요청량 급감 / 고해상도 에셋 유지

2026-10-20 모바일에서 `Rate limit exceeded / Please wait a few minutes before retrying your request` HTML 응답 보고. 요청에 표시된 IPv6 개인 접속정보는 개발 문서·로그에 저장하지 않는다.

공식 GitHub Pages 제한 문서: https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits . 과다 요청 시 서버 측 429 가능, 일시적 IP 기반 제한과 대역폭 초과 원인은 서버 관리자 계측 없이 확정할 수 없다.

엔진 소스 실사: `engines/fiefdom/public/assets/sprites` 6,936 PNG(약 63MB), 그 외 모델 389, 지형 36 이미지. Fiefdom 원본 `buildCombinedAtlas`가 게임 시작 때 수천 PNG를 동시에 Image()로 받아서 Canvas로 합치는 구조. 이는 모바일에서 높은 요청 부하를 발생시키므로 CI 빌드에서 먼저 묶도록 구조 변경.

- 새로운 `rani-next/v59-pack-sprites.py`: 방향별 2.5D 성/벽/주택, 0 A.D. 유닛 애니메이션 모든 PNG를 Pillow로 원본 손실 없는 RGBA 4K 페이지에 배치; 기존 Fiefdom의 안정적인 height 정렬·anchors·width,height·page index·clip·footprint 유지. 출처 및 원본 PNG는 Git 저장소 그대로 보유.
- `rani-next/v59-mobile-pages.mjs`: 실제 런타임 THREE.DataArrayTexture 및 sprite atlas를 사전 생성된 몇 장의 PNG와 한 개 JSON에서 복원하여 게임 내부 데이터/화면/건축/전투/save 유지. 모바일 작은 화면은 원본 4방향 고품질 PNG 2.5D 프리셋으로 3D 모델의 추가 네트워크 요청을 줄임. PC는 기존 3D. 주소에 `?r3d=1` 명시 시 모바일도 3D 사용 가능.
- `qa-v59-mobile.mjs`: 390×844 Android UA 시뮬레이션, 실제 지역→영주→게임시작, renderer mode 확인, native canvas atlas data, resource timing 기준 5,000+ 요청 절감, 전체 요청 수 상한 검사. 기존 600초 Fiefdom 플레이/PC/모바일/Pages legacy 브라우저 CI 병행.

중요: HTTP 429 자체는 GitHub 인프라 응답이므로 새 코드가 사용자의 기존 제한을 즉시 해제할 수 없다. 회선 전환/시간 경과 후 재접속이 필요할 수 있으며, 장기적으로 독립 CDN 또는 Vercel/Cloudflare 배포 경로를 추가 검토한다. 정식 공개 적용 전 CI와 배포 성공이 확인되어야 한다.
