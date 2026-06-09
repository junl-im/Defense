# Kingdom Seed v0.6 Patch

v0.6은 반복 성장형 구조를 한 단계 더 밀어 올리는 패치입니다.

## 추가 내용

- Stage 004: 마왕의 관문 추가
- 신규 적 5종 추가
  - 검은 약탈자
  - 가고일
  - 흑마도사
  - 공성 골렘
  - 관문 군주
- Stage 4 전용 fortress 테마 맵 그래픽 추가
- 보스 웨이브 경고 연출 추가
- 전투 속도 1x / 2x 토글 추가
- 일시정지 패널 추가
- 월드맵에 전술 도감 버튼 추가
- CodexScene 추가
  - 타워 역할/특수 스킬 확인
  - 적 체력/속도/약점 확인

## 적용 방법

이 폴더의 파일들을 기존 프로젝트 루트에 덮어쓰기 합니다.

주요 변경 파일:

```txt
src/main.ts
src/game/types.ts
src/game/balance.ts
src/game/Enemy.ts
src/scenes/GameScene.ts
src/scenes/WorldMapScene.ts
src/scenes/CodexScene.ts
```

## 적용 후 확인

```bash
npm run build
```

성공하면 GitHub Desktop에서 commit 후 push 합니다.

```txt
Summary: Add stage 4 boss gate and codex
Commit to main
Push origin
```

배포 후 확인:

```txt
https://junl-im.github.io/Defense/?v=060
```

## 다음 v0.7 추천

- 실제 PNG/WebP 스프라이트 적용
- 타워별 전용 공격 사운드
- 적 사망 애니메이션 프레임 적용
- Stage 선택 화면의 맵 이미지를 실제 배경으로 교체
- 일일 도전 보상과 미션 시스템 추가
