# Dokkaebi Defense 아트 바이블 v3.8.0

## 절대 방향

한국 전통 판타지를 밝고 고급스러운 캐주얼 3D로 재해석한다. 도깨비·신선·무당·저승사자·구미호·호랑이·산신령·용을 귀엽고 멋있고 반짝이며 가볍게 표현한다. 모든 제작물은 기존 절대 프롬프트와 `DD-AAA-CASUAL-SD-PBR-3.0` 잠금을 상속한다.

## 캐릭터 비율

- 2.3등신
- 머리 42%
- 몸 35%
- 다리 23%
- 큰 동그란 눈과 굵은 눈썹
- 둥근 손, 단순한 손가락, 짧은 다리
- 무기는 몸보다 크게 보이고 64px 썸네일에서도 직업을 식별해야 한다

## 색상

주색은 Gold, Blue, Purple, Red, White다. 밝은 색면과 부드러운 그라데이션을 사용한다. 회색 위주, 어두운 갈색 위주, 칙칙한 저채도 조합은 금지한다. Common 등급의 Gray는 테두리나 작은 배지에만 제한적으로 사용한다.

## 재질과 조명

- Stylized PBR
- Hand Painted BaseColor
- 부드러운 Normal
- Soft ORM
- Soft Ambient Occlusion
- Subtle Rim Light
- Soft Shadow
- 실사 피부, 사진 질감, 거친 미세 노이즈 금지

## 모델링

일반 캐릭터 6k~10k triangles, 보스 10k~18k triangles를 기준으로 한다. 머리·무기·대표 장식의 세 덩어리만으로 실루엣이 읽혀야 한다. 얼굴 규격, 손 크기, 발 크기, 모자 높이, 무기 비율을 공용 템플릿으로 관리한다.

## 등급 표현

- Common: Gray 소형 테두리
- Rare: Blue
- Epic: Purple
- Legend: Orange
- Mythic: Red
- Immortal: Rainbow
- God: Gold

등급은 프레임, 빛, 파티클 밀도, 무기 장식으로 표현하며 얼굴과 피부색을 무리하게 바꾸지 않는다.

## 승인 게이트

1. 정면 실루엣 승인
2. 5방향 턴어라운드 승인
3. 표정·얼굴 규격 승인
4. BaseColor 승인
5. 리그·9개 동작 승인
6. 모바일 64px 가독성 승인
7. 엔진 triangles·재질·메모리 승인

아트 리뷰와 기술 리뷰가 모두 완료되지 않으면 `approved` 상태를 사용할 수 없다.
