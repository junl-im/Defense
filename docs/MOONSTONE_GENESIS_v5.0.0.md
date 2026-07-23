# Moonstone Genesis v5.0.0

## 목표

Absolute Art Bible v2.0을 문서 규칙이 아니라 런타임·에셋·성능·UI를 함께 통제하는 제작 운영체제로 전환한다.

## 구현 축

### Character DNA v3.0

- 얼굴: 머리 40~44%, 목표 42%, 눈 얼굴 폭 28%, 작은 미소
- 체형: 42/18/15/25
- 헤어: 큰 덩어리 중심, 얇은 실선 금지
- 직업: 전사·궁수·법사·도사·무당 실루엣 DNA
- 희귀도: 일반~신화 장식·FX·금 테두리 증가 규칙
- 장비: 5개 교체 파츠, 6개 필수 소켓
- 애니메이션: 공통 11클립, 5방향 원본과 좌우 반전

### Engine 4.0

- Cinematic / High / Balanced / Performance 4단계 품질 프로필
- FPS, P95, P99, 프레임 지터, 위험 프레임 비율 기반 자동 단계 조절
- 렌더 해상도, FX 예산, 그림자 사용, HUD·그림자·청크 갱신 주기를 함께 조절
- 고정 크기 프레임 샘플 버퍼 유지

### Runtime Art Harmonizer

레거시 GLB는 최종 승인 에셋으로 승격하지 않는다. 대신 플레이 중 일관성을 높이기 위해 다음 값만 안전하게 정규화한다.

- 채도와 밝기 하한
- Stylized PBR roughness·metalness 범위
- 작은 색상 기반 emissive
- 순수 검정에 가까운 재질 완화
- 스타일 잠금 메타데이터 기록

### Moonstone UI

- Gold Border
- Blue Glow
- Rounded Depth
- Drop Shadow
- Hover 105%
- Pressed 95%
- 기존보다 밝은 패널과 전장 조명

### Production Console

`F4` 또는 `?director=1`로 다음 정보를 확인한다.

- Absolute Art Lock
- Character DNA 버전
- 골든 수직 슬라이스 진행 상태
- 품질 프로필과 해상도·FX 비율
- FPS·P95·위험 프레임
- 드로콜·삼각형·텍스처 사용량

## 정직한 에셋 상태

- 런타임 GLB: 19종
- 런타임 조화 처리: 19종
- Character DNA v3.0 최종 검증: 0종
- production-approved: 0종
- 대량 생산: 잠금 유지

런타임 조화 처리는 기존 에셋을 최종 아트로 인정한다는 의미가 아니다.
