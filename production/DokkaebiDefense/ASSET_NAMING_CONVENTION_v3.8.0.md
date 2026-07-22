# Asset Naming Convention v3.8.0

## ID prefix

- CHR: 캐릭터
- MON: 몬스터
- BOS: 보스
- WPN: 무기
- ICO: 스킬 아이콘
- UI: UI
- VFX: 이펙트
- TIL: 타일
- BG: 배경
- OBJ: 오브젝트

## 파일명

영문 소문자, 숫자, 하이픈 또는 밑줄만 사용한다. 캐릭터와 적은 `category_name_lod0.glb`, UI와 아이콘은 `ui_or_icon_role_variant.webp`, VFX와 타일은 KTX2 납품명을 사용한다. 실제 런타임 경로에 벡터 포맷을 사용하지 않는다.

파일명 변경은 마스터리스트 ID를 바꾸지 않는다. ID는 영구 식별자이고 파일명은 납품 구현이다.
