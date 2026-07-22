# v3.7.3 Absolute No-SVG Policy

런타임·배포 에셋에는 SVG를 사용하지 않는다.

허용 형식:

- UI·아이콘: PNG, WebP
- 텍스처: PNG, WebP, KTX2
- 3D: GLB, glTF
- 이펙트 아틀라스: PNG, WebP, KTX2

검사 대상:

- 실제 `.svg` 파일
- `.svg` 런타임 URL 또는 import 경로
- 인라인 `<svg>` 마크업
- `data:image/svg+xml` data URI
- `image/svg+xml` MIME 선언

`npm run clean:obsolete`는 패치 덮어쓰기 뒤 남은 SVG 파일을 삭제한다. `npm run verify`는 삭제 후에도 남은 참조가 있으면 파일명과 줄 번호를 출력하고 실패한다.
