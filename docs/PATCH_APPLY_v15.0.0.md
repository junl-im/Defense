# v15.0.0 덮어쓰기 패치 적용

## 기준 버전

`DokkaebiLuckDefense3D_FULL_v14.0.0`

## 적용

1. 기존 프로젝트를 별도 위치에 백업한다.
2. `DokkaebiLuckDefense3D_PATCH_v15.0.0_OVERWRITE.zip`을 프로젝트 루트에 푼다.
3. 같은 이름의 파일을 모두 덮어쓴다.
4. 패치에 포함된 `PATCH_DELETE.txt`가 비어 있지 않다면 기재된 파일을 삭제한다.
5. 다음 검증을 실행한다.

```bash
npm run verify
npm run build:static
node scripts/verify-static-dist.mjs
```

## 확인 항목

- 타이틀에 `v15.0.0`과 `LIVING BATTLEFIELD` 표시
- `asset-library-v15.html` 접근
- 플레이 중 상자·보급 상자·수정 공명로 근처에서 상호작용 버튼 노출
- `G` 입력으로 상호작용
- 웨이브 중 화로·대포·덫·방벽 자동 작동
- F4 제작 콘솔에서 Living Props, Battlefield Event, Camera 진단 표시

## 주의

- `dist`와 `node_modules`는 덮어쓰기 패치에 포함하지 않는다.
- 패치 적용 후 정적 배포본을 다시 생성한다.
- v15 2D 프롭은 최종 3D 제작 승인 에셋이 아니다.
