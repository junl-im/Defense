# v1.0.24 CI Root Hygiene Fix

## 발생 오류

```text
FAIL project root hygiene
 - README_PATCH.txt (허용되지 않은 루트 파일)
```

## 원인

이전 패치 적용본 일부가 도구용 안내 파일 `README_PATCH.txt`와 패치 메타데이터를 프로젝트 최상위 폴더에 복사했습니다. 기존 루트 정리 정책은 `PATCH_README.txt` 형태만 인식하고 실제 파일명 `README_PATCH.txt`를 인식하지 못했습니다.

## 수정

- `README_PATCH.txt` 및 버전 접미사가 붙은 변형을 레거시 패치 파일로 인식
- `PATCH_APPLIED_v*.txt`와 `PATCH_MANIFEST_v*.json`도 함께 정리
- `npm run verify` 및 `npm run build` 시작 전에 자동 이동
- 이동 경로: `logs/legacy-root-output/`
- 같은 파일이 반복해서 생성되면 동일 파일은 제거하고 내용이 다른 파일만 duplicate 번호로 보존
- v1.0.24 원클릭 적용기는 패치 안내·매니페스트를 프로젝트 루트에 복사하지 않음
- 적용 완료 마커는 `logs/PATCH_APPLIED_v1.0.24.txt`에만 기록

## 재현 검증

깨끗한 v1.0.23 루트에 아래 세 파일을 만든 상태로 패치를 적용했습니다.

```text
README_PATCH.txt
PATCH_APPLIED_v1.0.23.txt
PATCH_MANIFEST_v1.0.23.json
```

그 후 `npm run verify`를 실행해 세 파일이 `logs/legacy-root-output/`으로 이동되고 루트 위생 검사와 v1.0.24 전체 검증이 통과하는 것을 확인했습니다.
