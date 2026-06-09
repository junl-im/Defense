# Kingdom Seed v0.7 Patch

## 핵심 추가

- 모바일 가로 전용 플레이 쉘 추가
- 전체화면 시작 게이트 추가
- Screen Orientation API 지원 브라우저에서 landscape lock 시도
- 지원하지 않는 브라우저에서는 CSS 회전으로 게임 캔버스를 가로 화면처럼 표시
- 모바일 뒤로가기/브라우저 종료 시 커스텀 종료 확인 팝업 추가
- beforeunload 기본 브라우저 종료 확인 보조 추가
- 카카오톡 인앱 브라우저 감지 배너 추가
- Android 카카오톡에서는 Chrome intent 외부 브라우저 열기 버튼 추가
- iOS 카카오톡에서는 링크 복사 및 Safari 열기 안내
- PWA manifest에 fullscreen + landscape 설정 추가
- 생성형 임시 PNG 스프라이트 적용
- 영웅/병사/용병/적/타워 스프라이트 적용
- 사운드 효과 WAV 추가
- 웨이브/건설/업그레이드/공격/폭발/승리/패배 SFX 연결
- 게임 내 전체화면 버튼, 음소거 버튼 추가

## 적용 방법

이 폴더의 내용을 기존 프로젝트 루트에 그대로 덮어쓰기 합니다.

그 후 로컬에서 확인합니다.

```bash
npm run build
```

성공하면 GitHub Desktop에서 커밋합니다.

```txt
Summary: Add landscape fullscreen shell and sprite audio assets
Commit to main
Push origin
```

배포 확인:

```txt
https://junl-im.github.io/Defense/?v=070
```

## 에셋 교체 규칙

현재 public/assets/sprites 아래 이미지는 임시 생성 스프라이트입니다. 실제 에셋을 넣을 때 파일명만 유지하면 코드 수정 없이 교체할 수 있습니다.

- public/assets/sprites/hero_knight.png : 32x32, 4프레임 가로 spritesheet
- public/assets/sprites/soldier_blue.png : 32x32, 4프레임
- public/assets/sprites/mercenary_green.png : 32x32, 4프레임
- public/assets/sprites/enemy_goblin.png 등 : 32x32, 4프레임
- public/assets/sprites/tower_archer.png 등 : 단일 48x48 PNG
- public/assets/audio/*.wav : 효과음

