# Blender → Three.js AAA 캐주얼 SD 에셋 규격

## 단위·축

- 1 Blender unit = 1m
- +Y Up, +Z Forward
- Apply Rotation/Scale
- 원점은 발 중앙

## 모델 구조

- Armature 1개
- Head, HairOrHat, Body, Weapon, Accessory 분리
- 무기 소켓 `socket_weapon_r`
- 등 장식 `socket_back`
- VFX 소켓 `fx_weapon`, `fx_head`, `fx_feet`
- 일반 캐릭터 6k~10k triangles, 보스 10k~18k
- Clean topology와 변형용 edge loop

## 텍스처

- BaseColor: 1024², 손그림 그라데이션, 노이즈 금지
- Normal: 큰 주름만, 강도 약하게
- ORM: R=AO, G=Roughness, B=Metallic
- Emissive: 선택 사항
- sRGB: BaseColor/Emissive, Linear: Normal/ORM

## 리깅·애니메이션

- 일반 캐릭터 48 bones 이하
- 보스 72 bones 이하
- 각 동작을 독립 Action으로 제작
- Hero: idle, walk, run, attack, skill, hit, death
- 루프 동작은 첫/마지막 중복 프레임 제거
- Root motion은 기본 비활성

## GLB 내보내기

- Format: glTF Binary (.glb)
- Include: Selected Objects
- Transform: +Y Up
- Data: Custom Properties ON
- Animation: NLA Strips 또는 All Actions
- Tangents ON
- Draco는 최종 모바일 검증 후 적용

## 필수 extras

- `styleLockId: DD-ABSOLUTE-ART-BIBLE-2.0`
- `approvalStatus: art-review` 또는 `production-approved`
- `sourcePromptId`
- `artistRevision`

`production-approved`는 자동 검사와 실기기 아트 리뷰를 모두 통과한 뒤에만 사용한다.
