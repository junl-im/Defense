# PATCH 2.35.1 Mobile Combat Juice

이 패치는 상용 모바일 캐주얼 디펜스 게임 수준의 전투 피드백을 추가하되, 기본 실행 성능을 해치지 않는 범위에서 구현했습니다.

## 성능 원칙
- 신규 대용량 에셋을 기본 부팅에 추가하지 않음
- 기존 로드 에셋 키(`projectiles`, `fx-death-poof`, `ui-fx-reward-glimmer-v43`, `ui-reward-chest-glow-v42`) 우선 사용
- 에셋 누락 시 플레이가 깨지지 않도록 경량 폴백 유지
- Floating Combat Text는 초당 예산을 두어 저사양 모드에서 과다 생성 방지
- 크리티컬 카메라 셰이크는 쿨다운 적용

## 검증
`npm run build` 통과.
