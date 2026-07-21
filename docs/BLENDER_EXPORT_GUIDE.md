# Blender → Three.js/Unity 공용 납품 가이드

## 장면 설정

- Unit System: Metric
- Unit Scale: 1.0
- Up: +Y
- Forward: +Z
- 발 중앙 원점
- Apply Rotation & Scale

## 오브젝트 분리

`head`, `face`, `hair`, `body`, `hand-l`, `hand-r`, `foot-l`, `foot-r`, `weapon`, `accessory`

소켓은 Empty 또는 Bone으로 만든다.

- `socket-weapon-r`
- `socket-fx-weapon`
- `socket-fx-head`
- `socket-fx-feet`

## 리그 이름

- `root`
- `pelvis`
- `spine-01`
- `chest`
- `neck`
- `head`
- `upperarm-l/r`
- `lowerarm-l/r`
- `hand-l/r`
- `thigh-l/r`
- `shin-l/r`
- `foot-l/r`

## 애니메이션 이름

주인공: `idle`, `walk`, `run`, `attack`, `skill`, `hit`, `death`

일반 적: `idle`, `walk`, `attack`, `hit`, `death`, `special`

보스: `idle`, `walk`, `attack-a`, `attack-b`, `skill`, `hit`, `death`, `phase`

## GLB 내보내기

- Format: glTF Binary `.glb`
- Include: Selected Objects
- Transform: +Y Up
- Geometry: Apply Modifiers
- Materials: Export
- Animation: Animation + NLA Strips 또는 All Actions
- Cameras/Lights: Off
- Sparse Accessor: Off
- Draco: 배포 파이프라인에서만 적용

## Three.js 검수

- GLTFLoader 파싱 성공
- 루트 크기와 바닥 원점 확인
- 애니메이션 클립 이름 확인
- Material 수 확인
- SkinnedMesh 본 수 확인
- Bounds가 지나치게 크지 않은지 확인

## Unity 이관 검수

현재 프로젝트는 Three.js가 기준이지만 Unity 이관 시 다음을 사용한다.

- Rig: Generic
- Avatar Definition: Create From This Model
- Root Motion: Off
- Loop Time: Idle/Walk/Run만 On
- Animation Event: 판정 프레임 수동 연결
- Material: URP Toon Shader로 교체
- Prefab: Visual, Collider, VFX Socket, Shadow Blob 분리
