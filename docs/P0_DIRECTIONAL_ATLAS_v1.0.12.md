# P0 Authored Directional Atlas — v1.0.12

## 런타임 규격

- 방향: 11
- 상태: 6
- 그리드: 11열 × 6행
- 총 P0 개체: 4
- 총 프레임: 264
- 좌우 반전: 금지
- 런타임 승인: 허용
- 최종 제작 아트 승인: 보류

## 상태 행

| 행 | 상태 | 용도 |
|---:|---|---|
| 0 | idle | 대기 및 숨쉬기 |
| 1 | move | 이동·접지 읽기 |
| 2 | attack | 기본 공격 타격 구간 |
| 3 | skill | 직업 고유 스킬 시전 |
| 4 | hit | 피격 반응 및 타격점 확인 |
| 5 | death | 사망·소멸 방향 확인 |

## P0 개체

```text
hero-warrior
 guardian-ember
monster-imp
boss-tiger
```

각 개체는 High·Medium·Low 변형을 제공한다. 프레임 그리드는 모든 품질 단계에서 동일하므로 런타임 UV 계약이 변하지 않는다.

## 런타임 선택

`CombatVisualDirectorV112`는 카메라와 개체의 상대 방위를 11방향 인덱스로 변환한다. P0 아틀라스는 미러링 없이 해당 열을 직접 선택하며, 상태 머신 값은 `idle`, `move`, `attack`, `skill`, `hit`, `death`로 정규화한다.

## 품질 한계

현재 시트는 기존 GLB의 형상·재질 정보를 기반으로 한 결정적 런타임 제작본이다. 다음 항목은 후속 수작업 검토 대상이다.

- 손·무기 실루엣의 프레임별 정리
- 직업별 anticipation, impact, recovery 타이밍 확대
- 얼굴 표정과 피격 표정
- 발 접지 및 보스의 약점별 피격 반응
- 궁극기 전용 프레임과 VFX 소켓

따라서 `runtimeApproved: true`와 `productionArtApproved: false`를 동시에 유지한다.
