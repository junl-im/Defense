# 도깨비 전사 골든 샘플 제작 규격 v1

- 게임: `3.5.0`
- 엔진: `2.5.0`
- 스타일 잠금: `DD-AAA-CASUAL-SD-PBR-3.0`
- 에셋 ID: `player-dokkaebi-warrior-golden-v1`
- 현재 단계: **기술 검수 통과 / 아트 디렉터 리뷰 대기**

## 기술 결과

- 9,572 triangles
- Skin 1개
- 공용 휴머노이드 리그 `DOKKAEBI-HUMANOID-RIG-1`
- 내장 AnimationClip 7개: Idle, Walk, Run, Attack, Skill, Hit, Death
- 교체 소켓 2개: WeaponSocket, AccessorySocket
- 임베디드 PBR Map 4개: BaseColor, Normal, ORM, Emissive
- 전투와 도감에서 동일 GLB 사용
- AnimationMixer 우선, 절차형 모션은 폴백에서만 사용

## 아트 승인 전 필수 검수

1. 64px 흑백 실루엣에서 갓·뿔·방망이가 구분되는가
2. 얼굴이 320px 전투 화면에서도 읽히는가
3. 눈·손·발의 크기가 아트 바이블 2.3등신 규격과 일치하는가
4. BaseColor가 미세 노이즈 대신 큰 손그림 색면으로 구성됐는가
5. Normal과 ORM이 얼굴을 더럽히거나 사실적으로 만들지 않는가
6. 공격 0.55초 전에 무기 방향이 읽히는가
7. Hit가 짧고 Death가 과도하게 사실적이지 않은가
8. 모바일 저사양에서 30fps 예산을 지키는가

## 승인 규칙

기술 조건을 통과해도 `production-approved`로 자동 승격하지 않는다. 실기기 화면과 아트 디렉터 리뷰가 끝나야 승인 레지스트리의 상태를 변경한다.
