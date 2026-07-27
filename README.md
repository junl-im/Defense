> 현재 개선 패치: **v1.0.35 / b24.35** — 런타임 수명주기, 오프라인 모듈 캐시, 보스 접근성, 모바일 줌·주소창 안정성 강화

# Dokkaebi Luck Defense 3D

## v1.0.35 핵심 변경

- 모바일 HUD 런타임 `23.3.0`: iOS/Android 브라우저 주소창과 가상 키보드 오인 방지
- 150% 핀치 줌에서 조이스틱·액션 도크 충돌 방지
- 전투 이펙트 RAF를 엔진 수명주기 범위로 편입해 종료·런 전환 시 정리
- 보스 식별 배지의 오래된 ARIA 상태 제거 및 체력·파훼 진행률 의미 보강
- 실제 `src/bootstrap.js` import 그래프 110개를 서비스워커 핵심 캐시와 자동 동기화
- 모바일 UI 겹침 시뮬레이션 14개 프로필 및 100웨이브 자원 상한 시뮬레이션
- 에셋 0바이트·SVG·승인 경계·폭탄병 격리 상태 자동 검증
- 인수인계 내역 작성 필수 계약 유지
- 불완전한 로컬 Vite 설치를 자동 감지하고 CI 재설치 빌드 게이트와 분리

## 검증

```bash
npm run audit:toolchain:v135
npm run verify:release:v135
npm run build:static
npm run verify:dist:v135
npm run create:patch:v135
npm run verify:patch:v135
```

상세 진단은 `docs/SYSTEM_AUDIT_v1.0.35.md`, `docs/RUNTIME_STABILITY_ASSURANCE_v1.0.35.md`, `docs/BUILD_TOOLCHAIN_EXCEPTION_v1.0.35.md`를 확인합니다.

## 보존된 릴리스 기반

- v1.0.12 크로스 플랫폼 비주얼 기반
- v1.0.17 승인 자산 경계
- v1.0.20 주인공 11방향 런타임
- v1.0.29 파생 아틀라스 정제
- v1.0.31 보스·몬스터 에셋 계보 감사
- v1.0.32 실루엣 지문·80웨이브 검증
- v1.0.33 보스 식별·90웨이브 안정성 검증
- v1.0.34 모바일 HUD 복구·가상 뷰포트 검증
