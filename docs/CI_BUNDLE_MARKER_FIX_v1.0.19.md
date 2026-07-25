# CI Bundle Marker Fix v1.0.19

기존 검증기는 Vite가 압축 후 변경하는 함수명과 잘못된 정책 문자열을 검색했습니다.
실제 번들에는 `DD-ASSET-APPROVAL-PIPELINE-V117`이 포함되지만 검증기는 `DD-ASSET-APPROVAL-V117`을 요구해 실패했습니다.
또한 `dist/assets` 최상위만 읽어 `chunks` 하위 번들을 놓칠 수 있었습니다.

v1.0.19는 고정 마커 `DD-ASSET-APPROVAL-RUNTIME-V117`을 런타임 보고서에 포함하고 모든 JS 번들을 재귀 검색합니다.
