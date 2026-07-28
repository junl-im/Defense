# Patch Notes v1.0.45

- 완성 게임의 실제 웨이브 시작·완료·보상 흐름을 100회 반복하는 결정적 장시간 QA API를 추가했다.
- 5웨이브마다 frame p50/p95/max, heap, texture, geometry, draw call, triangle, long task와 런타임 오류를 표본화한다.
- 50웨이브에서 WebGL 컨텍스트를 강제로 잃고 복원한 뒤 렌더링 재개를 확인한다.
- 누적 증가량뿐 아니라 10웨이브당 증가 기울기로 메모리·렌더러·프레임 회귀를 탐지한다.
- 승인된 v1.0.44 소스 패키지 대비 raw·gzip 5% 회귀 게이트를 추가했다.
- 53개 런타임 에셋을 13 boot / 40 deferred로 분리하고 74개 명시적 도달성 edge를 생성한다.
- v1.0.44 완성 빌드 검증기를 전진 호환 방식으로 바꿔 v1.0.45에서도 기반 계약을 유지한다.
- 서비스워커와 공개 버전을 `1.0.45-b24.45`로 갱신했다.
## CI packaging hotfix

- v1.0.45 캐시 토큰 변경으로 갱신되는 v1.0.43 도달성·프레젠테이션 및 v1.0.44 에셋 검토 파생 보고서를 패치에 포함해 적용 직후 전체 검증이 stale 없이 통과합니다.
- v1.0.44 patch archive가 저장소 루트에 남긴 `APPLY_KO.txt`를 preverify 단계에서 `logs/legacy-root-output/`로 자동 격리합니다.
- 패치 안내서와 `PATCH_MANIFEST.json`은 앞으로 `overlay/` 밖에 생성하며, overlay 내부 유입을 검증기가 차단합니다.
- QA 증거 업로드는 Node 24 기반 `actions/upload-artifact@v7`을 사용하고, 선행 실패로 증거 폴더가 없는 경우 경고를 만들지 않습니다.

