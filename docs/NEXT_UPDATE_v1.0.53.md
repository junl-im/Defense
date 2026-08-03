# Next Update v1.0.53

## R9에서 선행 완료

- 전체 프레임 GPU와 캐릭터 표현 GPU 측정 scope 분리
- timer-query 미지원, disjoint, query 오류, context loss/restore 결정론 행렬
- context 복원 시 extension 재획득과 stale query 폐기

## 남은 v1.0.53 범위

1. 실제 Vite/WebGL 빌드에서 캐릭터 외곽 품질, 잔상 밀도, 모바일 가독성 전후 캡처를 생성한다.
2. 캐릭터 표현 레이어만의 GPU 비용을 과장 없이 측정할 수 있는 scoped render pass 또는 검증 가능한 대체 계측을 설계하고 실기기 예산을 승인한다.
3. 실제 Chrome/Android/iOS 브라우저에서 timer-query 미지원·disjoint·context loss·복원 행렬을 실행한다.
4. 승인된 원본이 제공될 때만 캐릭터별 normal/emissive mask를 선택 적용한다.
5. 궁수·마법사·도사·무당 11방향 원본 시트를 사람 검토하며 임시 자산을 자동 승격하지 않는다.

## R11에서 선행 완료

- production minification에 안전한 v152 dist 계약 마커 적용
- 소스 의미 검증과 번들 존재 검증의 책임 분리
- reachable chunk 기반 안정 마커 fixture 고정

