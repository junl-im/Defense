# v1.0.2 Code Health Foundation

## 정리 원칙

1. 실행 그래프에 없는 파일을 즉시 삭제하지 않는다. 과거 회귀 증거인지 먼저 판정한다.
2. 실행되지 않는 과거 증거 모듈은 코드 건강 감사의 명시적 허용 목록으로만 보존한다.
3. 최신 구현이 완전히 대체한 런타임 인스턴스·CSS는 제거한다.
4. 동일 내용의 문서는 하나의 정본만 유지한다.
5. 사용하지 않는 import와 존재하지 않는 패키지 명령 경로는 검증 실패로 처리한다.

## 실제 정리

- 런타임에서 생성만 되고 설치·업데이트되지 않던 `MobileHudDirectorV22` 인스턴스 제거
- v21·v22 모바일 HUD 레이아웃 CSS 제거, v23 예약 영역 레이아웃만 유지
- 사용되지 않는 import 5개 제거
- `docs/ASSET_BIBLE.md` 삭제, 정본 `docs/ABSOLUTE_ART_BIBLE_v2.0.md`로 통합
- 구형 루트 패치 파일은 `clean:obsolete`에서 `logs/legacy-root-output/`으로 자동 이전
- 코드 건강 감사 JSON은 `logs/audits/`에만 생성

## 보존한 비활동 코드

v8~v16 에셋·카메라·아틀라스 모듈 일부는 현재 전투 실행 그래프에는 없지만, 과거 제작 증거와 회귀 검증에 필요하다. 이 파일들은 삭제 대상이 아니라 `verificationOnlyAllowlist`로 관리한다.
