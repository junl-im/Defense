# 라니킹덤 — 마을·월드 이원화 MASTER v0.5

## 확정 개발 원칙
- 표시 게임명: 라니킹덤. 모든 게임 UI, 오류 안내, 툴팁은 한국어.
- 시작 화면: 독립된 마을 건설 화면. 필드 나가기 → 기존 외부 월드, 내 마을 → 마을 복귀.
- 중심 건물 1단계: 3×3(9칸), 2단계: 4×4(16칸), 3단계: 5×5(25칸), 4단계: 6×6(36칸).
- 중심 건물과 일반 건물은 자원 투입과 완공 시간을 갖는다. 건설 취소 시 건설비 80% 반환.
- 마을 건설은 도로 배치를 필요로 하지 않는다. 기존 저장의 도로 정보는 호환을 위해 유지.
- 사용자 Windows 경로 D:\K-city-webgame\Defense / GitHub junl-im/Defense / Firebase 프로젝트 Defense game (web-game2).

## 이번 1차 개발: 실제 동작 범위
- VillageState: 월드 육각형과 분리한 마을 건설 칸, 개별 시설, 자원 소비·생산·건설 시간, 취소·승격·저장 복원.
- VillageView: 모바일·PC 반응형 3×3 마을 격자, 마을 건설 카드·중심 건물 업그레이드, 필드 나가기 / 내 마을.
- 마을에서는 기존 Three.js 월드의 그리기와 3D 애니메이션·일부 필드 AI 틱을 정지해 GPU 부하 절감. 마을 건설과 자원·연구는 계속.
- 기존 SaveSystem v3에 선택적 village 필드만 추가. 기존 저장 파일은 해당 필드가 없으면 새 3×3 마을을 생성하며 원래 월드 진행을 지운 것은 아님.
- 기존 세계 건설 대기열도 건설 중 / 강화 중 / 연구 중 표시. 완료 전 건설 취소 및 80% 환급.
- 게임 전반에 얇은 금빛 스크롤바 CSS 적용. 게임 내 마을의 3D 건물 표현과 고품질 래스터 아트는 추후 패치.

## 과도기 시스템과 다음 전환 단계
- 지금은 내부 마을 2D 격자와 기존 외부 3D 헥스 월드를 분리한 1차 구조다. 완성형 월드 마을 노드·행군·약탈·정찰·마을 간 전투는 아직 별도 구현 필요.
- 기존 외부 월드에는 지형 설치/내정의 레거시 동작이 남아 있으며 마을 내부의 새 경제와 일부 겹칠 수 있다. 최종 내정 규칙은 마을로 통합할 예정이다.
- 월드의 시설 메시는 마을 모드에서 그리지 않지만 최초 Game 초기화 시 월드 메시를 아직 만든다. 완전한 메모리 절약·월드 청크 지연 로딩은 후속 개발.
- 실제 스마트폰 FPS, 저사양 휴대폰 메모리·발열, 백그라운드 앱 복귀는 실기기 검증 필요.
- Firebase web-game2 로그인·Firestore·실시간 PvP는 아직 미연결. 인증 없는 클라이언트 공격 승리를 서버 공용 기록으로 사용하지 않는다.

## 공개 자료 조사 / 이식 라이선스
- Cimulity — https://github.com/zeikar/cimulity — MIT; 도시간 물리·경제 시뮬레이션, 화면과 core 분리, 타일 선택 UI 참고 후보.
- SlimCity — https://github.com/rbenzing/SlimCityGame — AGPL-3.0; Three.js InstancedMesh, worker simulation 및 타일 커맨드 구조 참고. 원본 코드 직접 병합 금지.
- Pillage First! — https://github.com/jurerotar/Pillage-First-Ask-Questions-Later — AGPL-3.0; 마을/필드/병력·행군·건설 루프 참고. 원본 코드 직접 병합 금지.
- Civil-Zones — https://github.com/beautifulplanet/Civil-Zones — GitHub 저장소 메타데이터상 라이선스 미명시. 아이디어만 조사하고 코드·에셋을 무단 이식하지 않는다.
- Fable Cities — https://github.com/rawprogress/fable-cities — README의 MIT 코드·CC0 자산 설명 참고. 실제 파일별 저작권·CREDITS 확인 후 선택.
- Phaser tilemap culling — https://docs.phaser.io/api-documentation/function/tilemaps — 화면에 보이는 부분만 그리는 기술 참고. 기존 Three.js 런타임을 새 엔진으로 갈아엎지 않음.

## 후속 개발 우선순위
1. 월드에서 군주·다른 마을·자원 필드 노드를 별도 관리. 정찰/약탈/전투는 세력, 거리, 병력과 서버 권한 설계.
2. 월드 렌더는 영역별 청크/LOD/인스턴싱으로 규모 성장에도 높은 프레임 유지.
3. 마을 건축물 외형 고도화: PNG/WebP 또는 인스턴스 3D, 건물 레벨별 외형.
4. 건설 작업의 남은 시간/취소, 개발 안내, 가느다란 스크롤바 PC·모바일 전 화면 검사.
5. 저장 데이터의 필드/마을 간 경제 중복 해소, 개별 마을 여러 개 대응, 공격 시 고급 월드 기능 추가.
6. GitHub Actions 한글/저장/전투/마을 브라우저 QA 통과 후에만 배포.
