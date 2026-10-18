# KINGDOM SLG (Defense repository reboot)

A playable **single-player 3D kingdom-building strategy game** for the browser, based on [Hexkingdom by Aleksandr (Leks2000)](https://github.com/Leks2000/Hexkingdom).

**Play**: https://junl-im.github.io/Defense/

## Implemented systems

- 3D hexagonal maps, animated building growth, field placement and frontier expansion.
- Economy: wood, stone, food, gold, influence, production, trading and caravans.
- Research and technologies; kingdom tiers and building unlocks.
- Army recruitment, border battles, enemy expansion and raids.
- Automatic local browser saves, game restart, desktop and touchscreen controls.

**Not implemented**: online accounts, server-hosted saves, guilds, PvP matchmaking, simultaneous online wars, paid monetization. This is not a fully finished commercial SLG.

## Run locally

```bash
python -m http.server 8123
# open http://localhost:8123/
```

Three.js `0.160.0` is loaded using a version-pinned jsDelivr URL from the original page. A network connection is currently required. No package install or build needed to run.

## QA and deployment

```bash
npm test
```

The source checks run on each push to `main`, then GitHub Actions deploys the static folder to Pages.

## License, credits and change notice

- Original **MIT** license (c) 2026 Aleksandr (Leks2000), preserved in [LICENSE](LICENSE).
- Original upstream: https://github.com/Leks2000/Hexkingdom
- Modified in this repository: site branding, SVG-free icon rendering, deployment policy and QA.
- Temporary emoji pictograms are used in place of original inline SVG icons until verified PNG/WebP assets are prepared.
- Former Defense projects are preserved as `archive/dokkaebi-defense-20261018` and `archive/anime-crowd-runner-20261018` branches.
- GPL/AGPL games such as TravianZ and Pillage First! are references, not code combined into this project.

## Local workspace and Firebase project

- Windows source workspace: `D:\K-city-webgame\Defense` (user-owned local path; remote GitHub edits require a local `git pull`).
- Firebase project display name: **Defense game**; project ID: **web-game2**.
- `.firebaserc` identifies the project but does not initialize login or cloud saves. This v0.3 remains GitHub Pages + local browser saves.
- See [개발 환경 및 Firebase 연결 안내](docs/LOCAL_FIREBASE_KO.md).

## First-play growth missions (v0.3)

Korean tutorial missions guide players through land expansion, forest, farmland, starting agriculture research, owning 8 tiles and starting the first kingdom promotion. Progress is **derived from existing game state**, compatible with pre-v0.3 saves and without changing game economics.

## v0.4 왕국 세이브 백업·복원 (로컬 전용)

화면 아래 **저장 관리** → **현재 왕국 백업** 버튼으로 현재 왕국을 JSON 파일로 내려받을 수 있습니다.
**백업 파일 복원**에서 JSON을 선택하면 저장 형식과 범위를 검사한 뒤 교체 확인을 받습니다.
복원 직전의 왕국은 브라우저에 임시 보관되며 **이전 왕국 되돌리기**로 1회 되돌릴 수 있습니다.

- 기존 `kingdom-tiles-save-v2` 저장 키와 진행 형식은 유지합니다.
- 불완전한 JSON·지원하지 않는 버전·잘못된 지형·중복 영토 좌표·2MB 초과 파일은 복원을 막습니다.
- 사용자가 내려받은 JSON 백업 파일을 별도로 안전한 곳에 보관하세요. 브라우저 데이터를 삭제하면 로컬 되돌리기 기록도 사라집니다.
- 파일 백업은 **Firebase 클라우드 세이브가 아닙니다**. 계정 로그인과 다른 기기 자동 동기화는 구현되지 않았습니다.
- 고해상도 모바일 기기의 렌더링 픽셀 비율을 최대 1.25, 그림자 맵을 1024로 제한하며 PC 품질 설정은 유지합니다.

## 라니킹덤 v0.5 — 마을과 필드 분리

첫 시작은 3×3 마을 건설 화면입니다. 중심 건물 승격으로 4×4/5×5/6×6 확장하고, 필드 나가기 / 내 마을 버튼으로 3D 월드와 전환합니다. 마을 중에는 월드 3D 렌더링을 중단합니다. 건설 취소 시 자원 80% 반환, 진행 상태 한글화, 얇은 스크롤바 적용. 상세 구현 범위와 이식 후보의 라이선스는 [라니킹덤 MASTER](docs/RANI_KINGDOM_MASTER_KO.md)를 참조하세요.
