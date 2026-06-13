# v2.36.24 REFERENCE REWARD CONTINUITY

## 목표

v2.36.19~v2.36.23에서 전투 actor, 썸네일, 프레임, 진행도, 공세 정보까지 no-text reference art 파이프라인을 연결했다. v2.36.24는 그 흐름을 전투 이후 보상/임무/유물 제작 루프까지 확장한다.

핵심은 “전투에서 본 고퀄 자산 감각이 보상 화면과 성장 화면에서도 끊기지 않는 것”이다. 단, 원본 시안의 글씨/버튼/라벨 이미지는 사용하지 않고, 새로 만든 작은 no-text reward badge만 사용한다.

## 추가 자산

새 경로:

- `public/assets/reference/v2_36_24/reward/`
- `reference_reward_manifest_v2_36_24.json`
- `reference_reward_contact_sheet_no_text.png`

추가 no-text reward badge:

- relic dust
- royal token
- artifact shard
- wood / iron / royal / mythic chest
- forge
- equip
- mission
- contract

모두 PNG + WebP 제공. 텍스트가 박힌 이미지 없음.

## 코드 변경

새 파일:

- `src/game/ReferenceRewardPipeline.ts`

연결 파일:

- `src/game/PremiumRewardForgeUi.ts`
- `src/scenes/GameScene.ts`
- `src/scenes/ArtifactForgeScene.ts`
- `src/scenes/MissionBoardScene.ts`
- `src/scenes/MainMenuScene.ts`
- `src/scenes/WorldMapScene.ts`

## 주요 개선

- 보상 상자 개봉 시 no-text reward badge rail 추가
- 보상 라인에 dust/token/shard/artifact icon을 reference pipeline 기반으로 표시
- 유물 아이콘이 reference evolution thumb 또는 reward badge를 우선 활용
- 유물 제작소 재화 바에 dust/token/chest badge 추가
- 유물 목록/상세/장착 슬롯에 shard/equip badge 추가
- 임무 카드와 보급 상자 패널에 mission/contract/chest badge 추가
- 로비/월드맵 체류 중 reward badge tier를 조용히 선로드
- 전투 결과 화면은 전투 종료 후에만 reward pipeline을 로드

## 안전 정책

- BootScene에 추가하지 않음
- 첫 접속/첫 탭 속도 우선 유지
- 전투 중 active wave 로드 없음
- Save-Data / slow network / runtime lockdown에서는 자동 생략 또는 essential fallback
- texture 로드 실패 시 기존 Phaser primitive fallback 유지
- 텍스트는 live text로 렌더링하고 이미지 안에는 넣지 않음

## 새 검수 옵션

- `?rewardpipeline`
- `?refrewards`
- `?rewardart`
- `?lootart`
- `?norewardpipeline`
- `?norewardart`
- `?legacyrewardart`
- `?essentialreward`
- `?safereward`
- `?fallbackreward`
- `?pngreward`

추천 비교:

- 기본 주소
- `?rewardpipeline`
- `?referenceart&refevolution&rewardpipeline`
- `?norewardart`
- `?essentialreward`

## 검증

- `npm ci`
- `npm run build`
- Vite preview `/` HTTP 200
- `/?rewardpipeline` HTTP 200
- reward WebP asset HTTP 200
