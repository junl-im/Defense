# 라니킹덤 v0.7 — 원본 3D 건설 화면을 마을로 복구한 확정 구조

## 원칙: 이미 완성된 원본 엔진을 다시 활용한다
- 《라니킹덤》 마을은 단순한 DOM/이모지 격자가 **아니라** 원래 MIT Hexkingdom 오픈소스 Three.js 3D 건설 장면.
- GitHub 원본: https://github.com/Leks2000/Hexkingdom · 라이선스: MIT · upstream LICENSE 크레딧 보존.
- 기존 게임의 선택·건설·지형 모델·진화·군사·저장·카메라·리서치 시스템을 실제 게임 엔진으로 계속 사용한다.
- v0.5에서 만든 대체 DOM 건설창은 품질 기준에 맞지 않아 폐기. 미병합 v0.6 무료 건설 브랜치는 공개판에 병합하지 않는다.

## 현재 새 구조
- 첫 화면은 이전에 사용하던 진짜 3D 육각형 건설 화면 그대로. 이 장면 전체가 '내 마을'.
- 중심 건물 승격 레벨 1=3×3, 2=4×4, 3=5×5, 4=6×6. 실제 원본 타일 배치에 좌표 범위 제한과 가시적인 원래 프런티어 건설 힌트 적용.
- 중심 건물 승격은 기존 게임의 자원 시스템을 직접 호출하며 건설 타이머·80% 취소 환급·save 복원. 새 가짜 경제, 자동 완료 보상 없음.
- 적 세력의 건설물은 내 마을 3D 장면에서 숨기고 월드 오버뷰에서 실제 기존 FactionSystem 데이터를 참조한다.
- 월드 버튼으로 3D 장면을 빠져나와 다른 세력들의 진짜 home 좌표/영토/병력 관계를 조회. 공격은 실제 기존 ArmySystem.canAttack/attack 검사에 연결, 원거리 무조건 공격/가짜 공격 결과 없음.
- world 모드에서는 3D 렌더 중단, 마을 복귀 시 기존 카메라·지도 상태 그대로 복귀.
- SaveSystem 기존 version 3 및 저장 key 그대로. 기존 v0.5 JSON의 village 슬롯 상태는 새 JSON 안 legacy 필드로 보존하며 자동 전환된 3D 모델이라고 거짓 주장하지 않음.
- Firebase Defense game (web-game2) 미연결. 로컬 PC 작업 폴더 D:\K-city-webgame\Defense 는 GitHub 갱신 후 사용자 로컬에서 pull.

## 이식할 가치가 있는 완성형 오픈소스 비교
- Hexkingdom — https://github.com/Leks2000/Hexkingdom — MIT, 원작 전체 3D 건설 게임이 현재 저장소에 이미 들어와 있음. 마을 기준으로 가장 호환성 높음. **이번 패치에 실제 재적용**.
- 3d.city — https://github.com/lo-th/3d.city — README에는 MIT로 소개되지만 저장소 LICENSE와 COPYING에서 micropolisJS 시뮬레이션 코어의 **GPL-3.0 및 추가 고지**가 명시됨. 이를 MIT 라이선스의 라니킹덤에 통째로 직접 병합하지 않는다. worker/instancing 고수준 설계만 참고.
- Settlement Village — https://github.com/Lingikaushikreddy/Settlement-Village — MIT, 완성형 마을 주민 에이전트·건설/군대/저장. 기술 스택과 시각 톤이 달라 엔진 전체 치환보다 내정/주민 작업 지능 부분 참고.
- Metropolis — https://github.com/rebollo507/Metropolis — ISC, Three.js 도시 건설 오픈소스. 절차 생성 텍스처/세이브/실측 품질 관리 참고.
- Ironcrown — https://github.com/fanaustinca/ironcrown — 코드 공개지만 라이선스 메타데이터 미표시. 공격/영토 설계 참고만, 라이선스 확인 없이 파일 이식 금지.
- Crown & Clan — https://github.com/Sir-Teo/web-coc — Phaser 4/Vite isometric 마을 전략 전체 프로젝트. 라이선스 메타데이터 미표시. 라이선스 검증 전에 이식 금지.
- SlimCity — https://github.com/rbenzing/SlimCityGame — AGPL-3.0, 전체 코드를 MIT 프로젝트에 그대로 복사하지 않음.
- 원작 외부 소스는 라이선스와 종속성을 검토하고 실제 필요한 부분만 선택적으로 통합. 근본적인 게임 전체 교체는 합의된 3D 건설 화면 복구 목표와 충돌하므로 실시하지 않음.

## 한계 / 다음 검증
- 현재 3×3 영역은 기존 육각형 월드 좌표의 q/r 직사각형 제한이며 실제 9개 사각형 건축 슬롯이 아니고 원래 육각형 배치 규칙이 적용됨.
- v0.5 이전 또는 v0.5 native 3D 타일이 이미 3×3 밖에 있으면 데이터를 삭제하지 않고 보존하며 새 타일만 제한.
- 월드 오버뷰는 기존 게임 세력 거점을 기반으로 한 실데이터 2D 전술 지도 1차. 독립 세력 장거리 행군/정찰/자원/경로 수송/PvP 서버 판정은 아직 개발되지 않음.
- 현재 Three.js 장면 자체가 월드와 동일한 엔진을 공유하므로 CPU/GPU 완전 분리는 추후 청크/LOD/맵 전용 워커 단계가 필요.
- 3D 건설 화면/모바일 퍼포먼스/서버 실시간 기능이 플레이 검증을 통과할 때만 main 병합.
