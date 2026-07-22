# DokkaebiLuckDefense3D PATCH v3.4.0

기준 버전: v3.3.0

## 변경

- `DD-AAA-CASUAL-SD-PBR-3.0` 절대 스타일 잠금
- 2.3등신·손그림 Stylized PBR·Soft AO·Subtle Rim
- 5방향 원본+미러링
- 750종 프롬프트 카탈로그
- 현재 GLB 14종 개발용 프로토타입 격리
- 로딩 상태와 AAA 제작 승인 상태 분리
- 승인된 미래 GLB의 BaseColor/Normal/ORM 재질 보존
- 기존 절차형 모델 생성기는 `--prototype-only` 없이는 실행 차단

## 적용

1. v3.3.0 루트에 파일을 덮어씁니다.
2. `DELETE_FILES.txt`의 파일을 삭제합니다.
3. `npm run generate:prompt-catalog`
4. `npm run audit:art`
5. `npm run verify`
6. 정상 npm 환경: `npm run build`
7. 저장소 장애 환경: `npm run build:static`

현재 GLB 14종은 완성 에셋이 아닙니다. 자세한 실패 항목은 `docs/CURRENT_ASSET_AUDIT.md`를 확인하세요.
