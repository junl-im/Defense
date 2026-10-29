# 블록 서바이벌 TPS — 7번째 원본 Gobkit CC0 선별 입수 (2026-10-29)

## 상태
- 공식 출처: https://github.com/Ariescar/gobkit-free-assets
- 고정 원본 커밋: `4e73c68fa6e8ca9d948fcc0ce7215c830a022c3b`
- 라이선스 원본: https://github.com/Ariescar/gobkit-free-assets/blob/4e73c68fa6e8ca9d948fcc0ce7215c830a022c3b/LICENSE (CC0-1.0)
- 원본 기술: https://github.com/Ariescar/gobkit-free-assets/blob/4e73c68fa6e8ca9d948fcc0ce7215c830a022c3b/INTEGRATION.md
- 새로 선별한 것은 적 2, 동물 2, 자연물 3의 **7개 GLB 파일**뿐. GitHub Actions가 라이선스와 원본 커밋을 검증하고 선별파일만 아티팩트로 만든다. 원본 저장소 전체를 게임에 복제하지 않는다.
- 기존 KayKit 5개·Kenney 1개 원본(45파일)은 그대로 유지하며, 이번 선정이 성공하면 총 7출처 52파일. 완료 여부는 반드시 해당 CI의 **성공 결과**로 판단.

## 대상 파일·게임 적용 판단
| 경로 | 역할 | 주요 주의 |
| --- | --- | --- |
| minion/minion-a01.glb | 근거리 정지형 몬스터 시제품 | idle/attack/dead만, **walk 없음** |
| minion/minion-b01.glb | 정지형 특수 몬스터 시제품 | idle/attack/dead만, 실제 좀비용 걷기 불가 |
| animal/Bat.glb | 움직이는 박쥐 타입 적 시제품 | idle/attack/dead/walk, 모델 이동 방향 별도 테스트 |
| animal/Corgi.glb | 소형 동물 AI 테스트 대역 | walk 포함, 최종 디자인 아님 |
| nature/Rock001.glb | 엄폐·정적 지형 | 충돌 박스는 런타임에서 따로 정의 |
| nature/TreeLow001.glb | 경량 수목 | 메시 수만큼 드로우콜 제한 |
| nature/Bush001.glb | 관목 | 카메라 가림과 교차 검사 |

## 엔진 연결을 위해 반드시 검증할 사항
- 본 원본 커밋의 애니메이션은 하나의 baked 타임라인을 24FPS의 프레임 범위로 나눔: idle 0–29, attack 30–59, dead 60–89, 동물에 한해 walk 90–119. 별도 웹 배포 manifest는 **서로 다른 named clips로 바뀔 수 있어**, 로더에서 실제 clips를 조회한 후 분기.
- 걷기 부재 미니언을 '이동하는 좀비 완료'로 간주하면 안 됨. 첫 플레이용 진짜 좀비 리그는 Kenney Survivors/Quaternius 정식팩 라이선스와 다운로드 품질 검사 후 채택.
- 스키닝 캐릭터 clone은 THREE.SkeletonUtils.clone()을 사용, 일반 scene.clone()은 본 공유/이상 애니메이션 위험.
- 사망은 루프 없이 마지막 프레임 고정. +Z 전방 모델은 pivot group에서 회전. GLB 불량 시 기본 메시로 폴백.
- 모바일 기준 초기 로드 3–8MB / 30 FPS는 **목표**이지 현재 실측치 아님. 대상 모델별 렌더링·애니메이션·실측은 아직 미검증.
- 저장소 소스와 외부 에셋 구분: 신규 자체 제작 코드 © 2026 곰같은여우, Gobkit CC0 원권리는 Gobkit 라이선스 준수.

## 추가 조사
- [Gobkit 공식 무료 라이브러리](https://gobkit.com/freebies)는 2026-10-29 시점 확장팩이 존재하나, 온라인 manifest가 바뀔 수 있어 직접 GitHub 고정 커밋으로 가져오는 **7개**만 검증집합에 포함.
- [Kenney Animated Survivors](https://kenney.nl/assets/animated-characters-survivors) 와 [Quaternius Zombie Apocalypse](https://quaternius.com/packs/zombieapocalypsekit.html)는 다운로드 실물·라이선스 재확인 이전까지 대기.
- 첫 단계 게임 출시는 기존 `main`과 Pages를 수정하지 않음. 라니킹덤 보존 `archive/rani-kingdom-v539-20261029`을 유지.
