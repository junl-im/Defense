# KingdomSeed v2.36.21 - Reference Variant Matrix

## 방향

v2.36.19~v2.36.20에서 인입한 no-text reference art를 단순 이미지 표시가 아니라 상용 모바일 게임용 아트 슬롯/상태 표시 시스템으로 확장했다.

이번 패치의 목표는 다음과 같다.

- 네가 제공한 고퀄 시안 기반 no-text 자산을 게임 UI 전반에 더 자연스럽게 녹인다.
- 글씨가 박힌 이미지는 쓰지 않는다.
- 등급, 선택, 잠금, 보스, 엘리트, 스킬 상태는 이미지 자체에 텍스트를 굽지 않고 코드 기반 프레임/피프/베일로 표현한다.
- 저사양/느린 네트워크/Save-Data/비상 모드에서는 자동으로 essential reference art 스타일로 내려간다.

## 추가

- `src/game/ReferenceVariantSystem.ts`
  - reference art slot frame
  - no-text rarity pips
  - selected/locked/elite/boss/spell/upgrade state frame
  - essential fallback frame
  - reference actor pedestal
  - `?norefvariants`, `?essentialrefart` 등 QA 플래그
- `public/assets/reference/v2_36_21/reference_variant_policy_v2_36_21.json`

## 연결

- HeroHallScene
  - 영웅 reference thumbnail을 프레임 카드로 표시
  - 선택 영웅은 selected frame과 no-text pips로 강조
- CodexScene
  - 타워 도감 thumb에 upgrade frame 적용
  - 몬스터 도감 thumb에 enemy threat 기반 elite/boss frame 적용
- GameScene
  - 타워 건설 카드 icon을 reference slot으로 표시
  - 스킬 버튼 아이콘을 reference spell slot으로 표시
  - 기존 refresh hook을 유지해 reference pack/evolution 로딩 후 자동 갱신
- Tower / Enemy / Hero
  - reference texture가 전투 actor에 적용되면 작은 no-text pedestal을 자동 추가
  - reference texture가 사라지거나 안전 폴백으로 내려가면 pedestal 비활성화

## 안전 정책

- 새 대용량 이미지 없음
- 새 atlas 없음
- 새 사운드 없음
- BootScene 프리로드 없음
- 전투 중 heavy actor art 스트리밍 정책 유지
- Save-Data / slow network / runtime lockdown / emergency fallback에서는 essential static frame 사용
- 실패해도 기존 2.5D fallback과 code fallback 유지

## 검수 옵션

- `?essentialrefart` / `?saferefart` / `?fallbackrefart`: reference frame을 안전/정적 스타일로 강제
- `?norefvariants` / `?novariantart`: reference variant frame 비활성화
- `?legacyrefvariants`: 이전 reference art 표시 비교
- 기존 `?referenceart`, `?refevolution`, `?norefart`, `?norefthumbs`와 함께 비교 가능

## 검증

- `npm ci`
- `npm run build`
- Vite preview `/` HTTP 200
- Vite preview `/?referenceart&refevolution` HTTP 200
- Vite preview `/?essentialrefart` HTTP 200
