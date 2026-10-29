# TPS 2026-10-29 실제 GLB 바이너리 구조 실사

## 실사 방법과 경계
- 소스: GitHub Actions [성공한 수집 작업](https://github.com/junl-im/Defense/actions/runs/40897237246) / artifact #12908086106, ZIP **5,114,543 바이트**, SHA256 `b25a8a423c04daaf217a177b13f876c38fa1ccf45ff652c9f720b8af77aba3ef`.
- 로컬에서 ZIP 안의 각 GLB 바이너리를 직접 읽어 glTF 2.0 헤더·JSON 청크·accessor 기반 indexed triangles·skins·animations 수량을 검사. 읽기 오류 0. 이를 브라우저에서 GPU 렌더링했다고 해석하면 안 된다.
- 삼각형은 indexed primitive counts / 3 합산 기준. 일부 primitive가 non-indexed이면 실제 그리기 삼각형과 차이 가능. 파일 바이트는 raw GLB (ZIP 내부 압축 이전).

| GLB 모델 | 원본 바이트 | 인덱스 삼각형 | 애니메이션 | 스킨 | 추천 역할 |
| --- | ---: | ---: | ---: | ---: | --- |
| Gobkit minion-a01 | 170,752 | 240 | 1 | 4 | 정지형 잡몹/근접 공격 |
| Gobkit minion-b01 | 174,432 | 240 | 1 | 4 | 정지형 특수 적 |
| Gobkit Bat | 63,308 | 376 | 1 | 1 | 비행 몬스터 AI |
| Gobkit Corgi | 73,516 | 508 | 1 | 1 | 소형 동물 동작 테스트 |
| Gobkit Rock001 | 15,108 | 16 | 0 | 0 | 저비용 엄폐·지형 |
| Gobkit TreeLow001 | 15,612 | 34 | 0 | 0 | 저비용 수목 |
| Gobkit Bush001 | 15,680 | 48 | 0 | 0 | 저비용 관목 |
| KayKit Knight | 3,659,532 | 6,952 | 76 | 1 | 임시 플레이어(최종 현대 복장 아님) |
| KayKit Skeleton_Minion | 4,814,296 | 5,288 | 95 | 1 | 정예 해골 적 |
| KayKit Skeleton_Rogue | 4,827,024 | 5,278 | 95 | 1 | 정예 해골 변형 |
| Kenney blaster-repeater | 66,288 | 700 | 0 | 0 | 총기 외형 |
| Kenney blaster | 59,552 | 624 | 0 | 0 | 총기 외형 |

## 렌더링 및 애니메이션 위험
- Gobkit minion GLB는 실제 파일에서 `movement`이라는 단일 애니메이션(약 3.708초) 확인. 24FPS에서 idle/attack/dead 세그먼트로 쪼개 재생해야 하며 **walk 구간은 없음**. 미니언을 자연스러운 걷기 좀비로 쓰면 안 됨.
- Gobkit Bat·Corgi 파일은 각각 단일 `clip` 타임라인(약 4.958초), 동물용 idle/attack/dead/walk 구간이 있음. 동물은 별도 이동 AI와 모델 회전·높이 적용 필요.
- Gobkit 스키닝 복수 인스턴스는 `SkeletonUtils.clone` 사용; 사망 애니메이션은 1회 재생 후 고정. 업스트림 [통합 가이드](https://github.com/Ariescar/gobkit-free-assets/blob/4e73c68fa6e8ca9d948fcc0ce7215c830a022c3b/INTEGRATION.md) 참고.
- KayKit 해골은 GLB 하나가 약 4.8MB이므로 다수 적을 원본 모델 복제로 무제한 로드하면 안 됨. 첫 출현 시 **1회 로드 후 인스턴스 생성**과 원본/파생본 분리 필요.
- 상태값·HP·충돌·헤드샷·총기 부착·이펙트는 GLB 파일 자체에 구현되어 있지 않음. 모든 모델은 TPS 충돌/공격 시스템과 연결 전.

## 바로 이식 가능한 우선순위
1. 첫 지형: KayKit City Builder 도로+차량+건물, Gobkit 나무·바위·관목 3개를 간단한 collider와 함께 로드.
2. 첫 몬스터: Gobkit Bat 1종 (걷기 클립 기반 움직이는 AI 검증) + Gobkit minion 정지형 타격 대역.
3. 최종 좀비 걷기는 Kenney Survivors·Quaternius 개별 무료 CC0 다운로드본을 실제 검사한 후 채택. Quaternius의 신규 QAL 약관은 별도 재확인.
4. 총기: Kenney GLB 2종 + PNG 조준점/피격 표시 + OGG 사격음, 카메라 오클루전·거리·레이캐스팅을 테스트.
5. 기기별 측정: 모바일 실제 FPS/메모리/첫 다운로드/발열, 저성능 모드의 LOD·드로우콜·텍스처 축소.

## 원본 보존
- GitHub 기본 `main`은 라니킹덤, 보호 참조 `archive/rani-kingdom-v539-20261029` 존재. 이번 실사는 TPS 개발 브랜치만 사용.
- 서드파티 CC0 파일은 Gobkit/KayKit/Kenney 원 라이선스를 유지; 신규 자체 코드 및 고유 기획은 © 2026 곰같은여우.
- SVG 전면 사용 금지. 실사용 원본 ZIP 파일 전체를 웹 초기 로드로 연결하지 않는다.
