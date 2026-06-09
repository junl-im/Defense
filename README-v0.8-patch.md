# Kingdom Seed v0.8 Patch - Art Pipeline + Fantasy Login Screen

## 추가 내용

- 킹덤러쉬풍 중세 판타지 로그인 화면 적용
- 타이틀 배경, 로고, 장식 패널, 버튼, 로그인 아이콘 추가
- BootScene에서 UI/맵 아트 에셋 선로드
- 로그인 화면에 파티클/토치/패널 부유 애니메이션 추가
- 월드맵/스테이지용 썸네일 에셋 추가
- asset-manifest.json 추가
- docs/ART_PIPELINE.md 추가

## 적용 파일

기존 프로젝트 루트에 이 폴더 내용을 그대로 덮어쓰기 합니다.

```txt
src/scenes/BootScene.ts
src/scenes/MenuScene.ts
public/assets/ui/*
public/assets/maps/*
public/assets/asset-manifest.json
docs/ART_PIPELINE.md
```

## 적용 후 확인

```bash
npm run build
```

성공하면 GitHub Desktop에서 커밋/푸시합니다.

```txt
Summary: Add fantasy login art pipeline
Commit to main
Push origin
```

배포 확인:

```txt
https://junl-im.github.io/Defense/?v=080
```

## 다음 단계 v0.9 추천

- 월드맵 Scene에서 `map-thumb-stage-001~004` 실제 표시
- 타워 Lv.1/Lv.2/Lv.3 별도 이미지 적용
- 적 공격/사망 애니메이션 분리
- 실제 BGM 2종: 메뉴/전투 분리
- 이메일 로그인 prompt를 그래픽 모달 UI로 교체
