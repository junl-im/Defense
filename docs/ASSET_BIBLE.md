# 도깨비 디펜스 AAA 캐주얼 SD 3D 아트 바이블 v3.0

- 적용 게임 버전: `3.5.0`
- 적용 엔진 버전: `2.5.0`
- 스타일 잠금 ID: `DD-AAA-CASUAL-SD-PBR-3.0`
- 상태: **LOCKED — 임의 변경 금지**

## 1. 한 문장 아트 디렉션

**한국 민담의 도깨비·도사·수호수를 2.3등신 장난감 같은 SD 캐릭터로 만들고, 밝은 손그림 텍스처와 부드러운 스타일라이즈드 PBR로 표현하는 프리미엄 캐주얼 모바일 디펜스.**

목표는 모바일 MMORPG나 사실적 콘솔 게임이 아니다. 작은 화면에서 즉시 읽히는 캐주얼 디펜스의 명확함에, 일반 캐주얼 카툰보다 한 단계 높은 모델링·텍스처·재질 완성도를 더한다.

## 2. 절대 스타일 프롬프트

아래 블록은 모든 캐릭터·몬스터·보스 프롬프트 앞에 그대로 붙인다. 단어 삭제·교체·순서 변경을 금지한다.

```text
AAA Mobile Game Asset,
Premium Korean Mobile RPG Defense Game Style,
Cute Stylized 3D Character,
Chibi 2.3 Heads Proportion,
Large Expressive Eyes,
Rounded Face,
Tiny Body,
Soft Rounded Hands,
Simple Fingers,
Short Legs,
High Quality Hand Painted Texture,
Smooth Color Gradient,
No Realistic Skin,
Soft Ambient Occlusion,
Subtle Rim Light,
Clean Topology,
Game Ready,
Low Poly 6k~10k Triangles,
PBR Stylized,
Bright Saturated Colors,
Fantasy Korean Folklore Theme,
Mobile Game Quality,
Consistent Art Style,
Highly Readable Silhouette,
No Noise,
No Photorealism,
No Anime Illustration,
3D Model Concept,
Orthographic View,
Character Turnaround,
White Background
```

### 고정 네거티브 프롬프트

```text
photorealistic, realistic skin pores, anime illustration, 2D painting, long realistic body, thin limbs, tiny hands, tiny feet, western medieval realism, dark horror, muddy colors, noisy micro details, excessive ornaments, sharp realistic fingers, cinematic depth of field, dramatic perspective, cropped turnaround, inconsistent face, inconsistent proportions, text, watermark, logo
```

## 3. 공용 얼굴·체형

- 목표: **2.3등신**, 허용 범위 2.2~2.4등신.
- 머리 약 43.5%, 몸통 34.5%, 다리 22%.
- 큰 표정 눈, 둥근 볼, 짧은 턱, 작은 코와 입.
- 손은 머리 높이의 약 25%, 발은 약 32%.
- 손가락은 사실적 다섯 손가락 조형보다 단순하고 둥근 형태를 사용한다.
- 피부는 모공·혈관·사진식 반사를 금지한다.
- 캐릭터의 역할은 머리/모자, 무기, 대표 장식의 세 실루엣으로 읽혀야 한다.

### 파츠 분리

`Head / HairOrHat / Body / Hand_L / Hand_R / Foot_L / Foot_R / Weapon / Accessory`

무기와 액세서리는 교체 가능해야 하며, 얼굴 규격과 손발 크기는 모든 캐릭터에서 유지한다.

## 4. 스타일라이즈드 PBR

순수 셀 셰이딩이나 사실적 PBR이 아니라 **손그림 Base Color 중심의 스타일라이즈드 PBR**을 사용한다.

- BaseColor: 고품질 손그림, 큰 색면, 부드러운 색 그라데이션.
- Normal: 큰 옷 주름과 무기 모서리만 보조. 피부·천에 미세 노이즈 금지.
- ORM: 천, 가죽, 칠목, 금속의 큰 재질 차이만 표현.
- Emissive: 눈·부적·도깨비불 등 화면 면적 10% 이내.
- AO: 접합부만 부드럽게, 얼굴을 더럽히지 않는다.
- Rim Light: 청백색 달빛을 8~20% 강도로 한쪽 외곽에만 은은하게 적용.
- 그림자: 매우 부드러운 접지 그림자와 부드러운 캐스트 섀도.
- 색: 밝고 포화도가 높되 한 캐릭터의 대표색 1, 보조색 1, 발광색 1 원칙.

## 5. 5방향 원본 + 미러링

실제 제작은 아래 5방향만 한다.

1. 정면 0°
2. 45°
3. 측면 90°
4. 후측면 135°
5. 후면 180°

좌측은 우측 원본을 미러링해 10~11방향처럼 사용한다. 컨셉 시트는 흰 배경, 직교 카메라, 동일한 크기와 발 중심 정렬을 유지한다.

필수 모션:

- 주인공: Idle, Walk, Run, Attack, Skill, Hit, Death
- 일반 적: Idle, Walk, Attack, Hit, Death, Special
- 보스: Idle, Walk, Attack A/B, Skill, Hit, Death, Phase

## 6. 골든 샘플 제작 순서

1. 절대 스타일 잠금과 얼굴 규격 승인
2. 메인 주인공 도깨비 전사 1종
3. 근접 적·원거리 적·보스 각 1종
4. 바닥·나무·돌·건물
5. UI 공용 프레임·아이콘
6. VFX 공용 언어
7. 승인된 템플릿으로 대량 제작

앞 단계가 승인되지 않으면 다음 단계의 수량 제작을 시작하지 않는다.

## 7. 대표 캐릭터 디자인

### 도깨비 전사

푸른 피부, 작은 둥근 뿔, 전통 갓, 큰 나무 방망이, 자신감 있는 미소, 단순한 가죽 갑옷. 얼굴과 무기가 64px에서도 읽혀야 한다.

### 도사

젊은 한국형 퇴마사, 긴 소매 도포, 종이 부적, 마법 두루마리, 흰 머리. 소매와 부적은 큰 덩어리로 표현한다.

### 호랑이 수호수

황금 주황 털, 큰 앞발, 작은 몸, 친근하지만 강한 얼굴. 털 노이즈 대신 큰 손그림 털 색면을 사용한다.

### 구미호

흰 털, 아홉 개의 큰 꼬리, 푸른 마법 오라, 우아한 한국 판타지 장식. 꼬리는 작은 가닥이 아니라 3~5개의 큰 실루엣 군으로 정리한다.

### 저승사자

큰 전통 갓, 검은 도포, 푸른 혼불. 얼굴을 완전히 어둡게 묻지 않고 눈과 표정을 읽을 수 있게 한다.

## 8. 몬스터·보스 규칙

- 아군보다 눈 모양이 날카롭거나 가면으로 구분한다.
- 색만 바꾼 변형을 금지한다.
- 몸통 폭, 귀/뿔, 무기, 이동 자세 중 최소 두 가지를 바꾼다.
- 보스는 일반 적보다 화면 면적 4~6배, 큰 얼굴과 큰 손발을 유지한다.
- 공포보다 수집하고 싶은 피규어 같은 매력을 우선한다.
- 공격 예고 자세는 UI 없이도 읽혀야 한다.

## 9. UI 스타일

- 둥근 금색 프레임, 부드러운 그라데이션, 높은 대비.
- 텍스트 없이도 32px에서 기능이 읽히는 단순한 아이콘.
- 패널은 한지·옻칠·달빛 소재를 큰 면으로 사용한다.
- 상태색은 성공 민트, 보상 금색, 위험 코랄, 비활성 자두 회색으로 고정한다.
- UI 에셋 기본 생성 크기 1024×1024, 실제 게임에서는 다중 해상도로 축소한다.

## 10. 맵·오브젝트

- 8m 모듈형 타일.
- 풀·나무·바위는 둥근 큰 형태, 손그림 그라데이션, 낮은 배경 대비.
- 장터 건물은 곡선 처마, 등롱, 한지, 칠목을 사용하되 전투 중앙을 가리지 않는다.
- 바닥은 위험 장판보다 채도와 명암 대비가 낮아야 한다.

## 11. VFX

- 핵, 꼬리, 충돌의 세 단계.
- 큰 형태, 부드러운 Glow, 짧은 수명, 투명 배경.
- 불·얼음·번개·독·회복은 색뿐 아니라 외곽 형태와 움직임으로 구분한다.
- 사진식 연기, 작은 노이즈 입자, 과도한 블룸을 금지한다.

## 12. 승인 체크리스트

### 캐릭터

- [ ] 절대 프롬프트와 잠금 ID 기록
- [ ] 2.2~2.4등신
- [ ] 큰 눈·둥근 얼굴·큰 손발
- [ ] 64px 흑백 실루엣 통과
- [ ] 5방향 직교 턴어라운드
- [ ] 파츠 분리
- [ ] 6k~10k triangles 일반 캐릭터 기준
- [ ] BaseColor·Normal·ORM 텍스처
- [ ] Skin과 필수 AnimationClip
- [ ] 실제 모바일 화면 검수

### 환경·UI·VFX

- [ ] 캐릭터보다 낮은 배경 대비
- [ ] 32px 아이콘 가독성
- [ ] 텍스트·워터마크 없음
- [ ] 색상 팔레트와 재질 규칙 준수
- [ ] 모바일 메모리·드로우콜 예산 준수

## 13. 현재 에셋 승인·격리 상태

v3.5.0의 도깨비 전사 `player-dokkaebi-warrior-golden-v1`은 다음 기술 조건을 통과한 **아트 리뷰 후보**다.

현재 승인 표기는 **기술 검수 통과 / 아트 리뷰 대기**이며, 최종 제작 승인이 아니다.

- 9,572 triangles
- Skin 1개와 공용 휴머노이드 리그
- Idle, Walk, Run, Attack, Skill, Hit, Death의 7개 AnimationClip
- WeaponSocket, AccessorySocket
- BaseColor·Normal·ORM·Emissive 임베디드 맵
- 전투와 도감에서 AnimationMixer 우선 재생

기술 검수를 통과해도 실제 모바일 화면의 얼굴 가독성, 64px 실루엣, 손그림 질감, 동작 타이밍을 승인하기 전에는 `production-approved`로 승격하지 않는다.

나머지 전투 GLB 13종은 로딩·LOD·도감·수명 관리 기능을 위한 **개발용 프로토타입**이다. Skin, 필수 AnimationClip, 손그림 PBR 텍스처 세트가 없어 완성 에셋으로 승인하지 않는다.

게임 진단 UI는 `GLB 로드 성공`, `기술 검수`, `최종 제작 승인`을 별도로 표시한다. 파일이 로드된다는 이유로 완성 에셋이라고 부르지 않는다.

## 14. 생성 프롬프트 카탈로그

`docs/AAA_ASSET_PROMPT_CATALOG.json`에 캐릭터 50, 몬스터 50, 보스 20, 무기 100, UI 300, VFX 150, 환경 80종의 제작 프롬프트가 저장된다. 모든 항목은 같은 절대 스타일 프롬프트와 네거티브 프롬프트를 공유한다.
