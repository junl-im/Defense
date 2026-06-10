# Defense v1.0 Patch

로그인 화면과 신규 메인 메뉴를 `배경 이미지 + 코드 UI` 구조로 분리한 패치입니다.

## 적용 방법

프로젝트 루트에 압축을 풀고 같은 파일을 덮어씁니다.

```bash
npm install
npm run build
npm run dev
```

## 핵심 변경

- `MenuScene`: 로그인 전용 화면으로 정리
- `MainMenuScene`: 로그인 후 진입하는 신규 메인 메뉴 추가
- `CodeUiKit`: 로고/버튼/패널/칩/토스트 공통 코드 UI 헬퍼 추가
- `BootScene`: v1.0 배경/장식 에셋 로드
- `main.ts`: `MainMenuScene` 등록
