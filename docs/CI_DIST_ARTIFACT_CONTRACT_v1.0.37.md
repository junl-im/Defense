# CI Dist Artifact Contract v1.0.37

## 문제

Vite는 `src/assets/title-v112/title-mascot-v112.webp`를 빌드할 때 `dist/assets/title-mascot-v112.webp` 형태로 재배치한다. 기존 v1.0.23/v1.0.24 검증은 `dist/index.html`에 원본 소스 경로 문자열이 그대로 남아 있어야 한다고 가정해 정상 빌드를 실패 처리했다.

## 수정 계약

- 원본 에셋과 배포 에셋의 SHA-256 및 바이트 크기를 비교한다.
- 실제 배포된 경로가 활성 HTML/CSS/JS에서 참조되는지 확인한다.
- 정적 fallback 구조와 Vite 번들 구조를 모두 허용한다.
- 과거 문서와 격리 레지스트리는 활성 배포 참조로 오인하지 않는다.
- v1.0.35/v1.0.36 배포 검증은 소스 모듈 복사형과 단일 번들형을 모두 판정한다.
