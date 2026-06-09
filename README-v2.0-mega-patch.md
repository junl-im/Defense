# Kingdom Seed v2.0 Mega Patch

이번 패치는 소규모 폴리싱이 아니라 캠페인 볼륨을 크게 늘리는 대형 업데이트입니다.

## 포함 내용

- 캠페인 4개 스테이지 → 8개 스테이지 확장
- 신규 적 14종 추가
- 신규 보스급 적: 화산룡, 공허 거신, 삼중 보스 결전
- Stage 5~8 전투맵/카드/썸네일 임시 아트 추가
- 월드맵 슬라이더가 8개 스테이지를 표시하도록 확장
- 전술 도감 적 페이지네이션 추가
- BootScene 프리로드 목록 확장
- 향후 일일 도전/유물/업적을 위한 MegaSystems.ts 추가

## 적용 방법

기존 프로젝트 루트에 `kingdom-seed-v2.0-mega-patch` 폴더 안의 내용을 그대로 덮어쓰기합니다.

```bash
npm run build
```

성공하면 GitHub Desktop에서:

```txt
Summary: Add v2.0 mega campaign expansion
Commit to main
Push origin
```

배포 확인:

```txt
https://junl-im.github.io/Defense/?v=200
```

## 주의

이 패치는 v1.2 이상, 가능하면 v1.4까지 적용된 프로젝트 기준입니다. 아직 v1.2 이전이면 먼저 최신 패치를 적용한 뒤 v2.0을 덮어쓰는 것이 안전합니다.
