# PROJECT HANDOFF — CURRENT v14.0.0

- Project: `DokkaebiLuckDefense3D_FULL_v14.0.0`
- Patch: `Atlas Dominion`
- Game version: `14.0.0`
- Engine version: `11.0.0`
- Save schema: `12`
- Base: `v13.0.0 Transparent Arsenal`

## Current state

1. v13 source sheets 10장과 개별 크롭 415개는 원본 계보로 보존한다.
2. 런타임 사용 가능 프레임과 장비 필수 프레임 128개를 v14 마스터 대상으로 선정했다.
3. 128개를 가장자리 정리·재중앙 정렬하고 `1024×512`, `16×8`, `64px` 단일 아틀라스로 패킹했다.
4. PNG와 lossless WebP 페이지를 모두 생성하고 SHA-256을 등록했다.
5. 직업 선택, 장비, 도감은 CSS 아틀라스 프레임을 사용한다.
6. 전장에는 환경·VFX 빌보드가 실제 배치된다. 데스크톱 최대 10~12개, 저사양 최대 7개다.
7. 카메라 디렉터는 적 분산·수량·보스 압력에 따라 추가 거리와 초점 가중치를 계산한다.
8. Scenic 기본 거리 19.5와 F5 프리셋 순환은 유지한다.
9. 런타임 수직 슬라이스는 6/6이지만 최종 제작 아트는 0/6이다.
10. 1,130개 대량 생산 잠금은 유지한다.

## Verification

- `npm run verify`: PASS
- `python scripts/generate-runtime-atlases-v14.py --check`: PASS
- `npm run build:static`: PASS
- `node scripts/verify-static-dist.mjs`: PASS
- 전투 GLB 19종: PASS
- 모바일 UI 스트레스 6종: PASS
- SVG 정책: PASS
- 텍스처 런타임 예산: PASS

## Important limitations

- v14 마스터 PNG는 자동 가장자리 처리 결과다. 사람의 픽셀 단위 최종 알파 검수와 동일하지 않다.
- 64px 아틀라스 타일은 현재 UI·도감·전장 빌보드용이며 대형 일러스트 확대용이 아니다.
- 최종 영웅·몬스터·보스 GLB와 최종 환경 세트는 아직 제작 승인을 받지 않았다.
- 실제 장시간 모바일 실기기 발열·메모리 QA는 별도로 진행해야 한다.

## Next operator order

1. 실기기에서 직업 카드·장비·도감 아틀라스 선명도 확인
2. 전장 빌보드 겹침·가림·깊이 정렬 검수
3. 적응형 카메라 압력값과 멀미 여부 조정
4. 128개 마스터 프레임 사람 검수 결과 저장
5. 최종 3D 제작 아트 브리지 진행
