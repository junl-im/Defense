# Dokkaebi Luck Defense 3D

## 현재 공개 버전

- 게임: **1.0.3**
- 내부 개발 계보: **23.1.0**
- 빌드 ID: **b24.3**
- 엔진: **21.0.0**
- 세이브 스키마: **21**
- 패치: **Code Health Foundation**

## 버전 순서

- 일반 개선: `1.0.1 → 1.0.2 → ... → 1.0.99`
- 초대규모 개편: `1.1.0 → 1.2.0`
- 캐시와 배포 순서는 별도 빌드 ID로 관리

상세 정책: `docs/VERSION_POLICY_v1.0.md`

## 프로젝트 기본 골격

```text
/
├─ src/          게임 소스
├─ public/       공개 런타임 에셋과 서비스 워커
├─ production/   제작 데이터와 마스터 목록
├─ scripts/      생성·검증·패키징 스크립트
├─ docs/         정식 문서와 승인된 기준선
├─ logs/         검증·빌드·시뮬레이션·감사 생성 결과
├─ dist/         정적 배포 결과
├─ README.md
└─ PROJECT_HANDOFF.md
```

## 코드 건강 규칙

- 사용하지 않는 import를 남기지 않습니다.
- 최신 구현이 대체한 런타임 인스턴스와 CSS는 제거합니다.
- 과거 회귀 증거는 삭제하지 않고 명시적 허용 목록으로 관리합니다.
- 동일한 정식 문서는 하나의 정본만 유지합니다.
- 패키지 명령이 존재하지 않는 파일을 가리키면 검증이 실패합니다.

코드 감사:

```bash
npm run audit:code:v102
```

결과는 `logs/audits/CODE_HEALTH_AUDIT_v1.0.2.json`에 생성됩니다.

## 루트 위생 규칙

- 루트에 로그, 감사 JSON, 시뮬레이션 결과, 미리보기, ZIP을 만들지 않습니다.
- 과거 패치 파일은 `npm run clean:obsolete`가 `logs/legacy-root-output/`으로 이동합니다.
- 패치 관리 파일은 `logs/patch/<version>/` 아래에만 둡니다.

## 검증 명령

```bash
npm run clean:obsolete
npm run hygiene:check
npm run audit:code:v102
npm run verify
npm run build:static
node scripts/verify-static-dist.mjs
```

## 현재 제작 상태

- 런타임 수직 슬라이스: **6/6**
- 10웨이브 상태 시뮬레이션: **10/10**
- 전투 GLB: **19종**
- v13 개별 스프라이트: **415개**
- v15 런타임 아틀라스: **154프레임**
- 최종 제작 아트: **0/6**
- 1,130개 대량 생산: **잠금 유지**
