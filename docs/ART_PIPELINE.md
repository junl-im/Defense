# Kingdom Seed Art Pipeline v0.8

이 패치는 임시 도형 그래픽에서 실제 게임 아트 파이프라인으로 넘어가기 위한 첫 단계입니다.
목표는 `public/assets` 아래의 파일명과 규격을 고정해서, 나중에 실제 아트만 교체해도 코드 수정 없이 적용되는 구조를 만드는 것입니다.

## 1. 폴더 규칙

```txt
public/assets/ui/          로그인, 버튼, 패널, 아이콘
public/assets/maps/        월드맵 카드, 스테이지 배경, 썸네일
public/assets/sprites/     영웅, 병사, 적, 타워, 투사체
public/assets/effects/     폭발, 타격, 마법 이펙트
public/assets/audio/       효과음, BGM
```

## 2. 로그인 화면 에셋

```txt
assets/ui/title_background.png   960x540, 타이틀 배경
assets/ui/title_logo.png         620x150, 로고/배너
assets/ui/panel_login_ornate.png 450x360, 로그인 패널
assets/ui/status_plaque.png      420x110, 하단 안내판
assets/ui/button_primary.png     330x62, 빠른 시작 버튼
assets/ui/button_blue.png        330x62, 계정 연동 버튼
assets/ui/button_gold.png        330x62, 보조 버튼
assets/ui/button_red.png         330x62, 강조/가입 버튼
assets/ui/icon_*.png             64x64, 로그인 아이콘
```

## 3. 전투 스프라이트 규격

v0.7에서 이미 아래 규격을 사용합니다.

```txt
hero_knight.png          32x32 x 4 frames, horizontal spritesheet
soldier_blue.png         32x32 x 4 frames
mercenary_green.png      32x32 x 4 frames
enemy_*.png              32x32 x 4 frames
tower_*.png              48x48 single image
projectiles.png          16x16 x 4 frames
```

실제 아트를 붙일 때도 같은 규격을 유지하면 코드 수정이 거의 필요 없습니다.
고해상도 아트를 쓰고 싶다면 먼저 2배수, 3배수 원본을 보관하고 웹 배포용은 32px/48px로 export하는 편이 좋습니다.

## 4. 작업 권장 순서

1. 로그인 화면과 버튼 UI를 먼저 확정합니다.
2. 월드맵 카드와 스테이지 썸네일을 확정합니다.
3. 영웅/병사/적 32x32 4프레임 걷기 애니메이션을 교체합니다.
4. 타워 Lv.1~Lv.3 외형 변화를 추가합니다.
5. 공격/사망/폭발 이펙트를 `public/assets/effects`로 분리합니다.
6. 마지막에 BGM/효과음 볼륨 밸런스를 잡습니다.

## 5. RPG Maker 프로젝트 에셋 관련

업로드된 `Defense_Peuple.zip`은 RPG Maker VX Ace 프로젝트 구조이며, 현재 압축 안에는 웹에서 바로 로드 가능한 PNG/WebP 이미지가 포함되어 있지 않습니다.
웹게임으로 쓰려면 RPG Maker 편집기 또는 보유한 원본 리소스에서 PNG로 export한 뒤, 위 규격에 맞춰 배치해야 합니다.

## 6. 저작권/스타일 기준

목표 레퍼런스는 킹덤러쉬식의 명확한 실루엣, 큰 버튼, 중세 판타지 톤, 즉각적인 피드백입니다.
단, 로고/캐릭터/타워/아이콘은 직접 제작한 오리지널 디자인으로 유지합니다.
