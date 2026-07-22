# DokkaebiLuckDefense3D v3.6.0 Patch

기준 버전: **v3.5.0**

## 적용 방법

1. v3.5.0 프로젝트 루트에 이 패치의 파일을 같은 경로로 덮어씁니다.
2. 정상적인 npm 환경에서는 아래 명령을 실행합니다.

```bash
npm ci
npm run verify
npm run build
```

3. 패키지 저장소를 사용할 수 없는 환경에서는 다음 정적 배포본을 생성합니다.

```bash
npm run verify
npm run build:static
node scripts/verify-static-dist.mjs
```

패치 ZIP에는 `dist/`가 포함되지 않습니다. 실제 서비스 반영 전 반드시 새 빌드를 배포해야 합니다.

## 변경 범위

- 신규 파일 3개
- 수정 파일 16개
- 삭제 파일 없음

## 핵심 변경

- AdaptiveHudLayout 동적 레일 시스템
- HUD 자동/전체/간소 표시 모드
- 런타임 UI 충돌 감사와 성능 로그 연동
- 5개 액션 버튼의 4열 구조 오류 수정
- 모바일 3+2 하단 조작 배열
- 보스전 좌우 레일 자동 하강
- Moonstone HUD 패널·버튼·모달 디자인
- 320px 하단 조작 안전 간격 26px
- 보스 에셋 라벨 중복 키 제거
- v3.6 전용 UI 회귀 검증 추가
