# 블록 서바이벌 TPS — 새 게임 프로젝트

**현재 단계: 오픈소스 조사와 무료 자산 원본 확보. 게임 자체는 아직 플레이 가능한 상태가 아닙니다.**

- 공식 코드·기획 작업 루트: `BlockSurvivalTPS/`
- GitHub: https://github.com/junl-im/Defense
- 작업 브랜치: `feature/block-survival-tps-v01-20261029`
- 라니킹덤 완전 보존: `archive/rani-kingdom-v539-20261029`
- 기존 `main`/Pages는 아직 라니킹덤. 새 TPS 코드의 공개 배포·원본 제거 금지
- 자체 제작 지식 자산 © 2026 **곰같은여우**. 외부 오픈소스/CC0는 각각의 라이선스와 출처가 별도로 적용됩니다.

## 자산과 근거 찾아가기

1. [오픈소스 엔진·자산 대조 기준본](./research/OPEN_SOURCE_ASSET_MASTER_KO.md) — 후보 엔진, AI, TPS 조작, 3D 자료, 라이선스·성능 위험
2. [원본 고정 목록](./research/source-lock.json) — **4개 KayKit 공식 GitHub 저장소**·원본 커밋·가져올 파일 목록
3. [취득 상태·해시·실패 방지·추가 확보 목록](./research/ACQUISITION_STATUS_KO.md) — 실제 아티팩트와 영구 저장된 CC0 3D 소품 구분
4. [취득 스크립트](./tools/acquire-open-assets.mjs) — 공식 GitHub 원본을 PIN 상태로 체크아웃해 라이선스 확인 후 선택 모델만 격리 수집
5. [확장 후보 24개 출처·라이선스 목록](../tps-next/research/SOURCE_REGISTRY.json)
6. [실물 CC0 묘지 자산 3종 및 라이선스](../tps-next/assets/third_party/kaykit-halloween-1.0/) — 원본 3D 모델 3개, 공통 PNG 텍스처, 데이터 검증
7. [소형 자산의 재수집·SHA 검사](../tps-next/tools/acquire-seed.mjs)

`tps-next/`는 **재현 가능한 원본 자산·조사 자료만 보관하는 격리된 보조 공간**입니다. 프로토타입과 정식 게임의 코드·경량 런타임 파일은 `BlockSurvivalTPS/` 한 곳에만 작성하여 구현 중복을 방지합니다.

## 먼저 구현할 플레이 루프

가벼운 블록형 숲/폐허 맵 → 3인칭 생존자 이동/카메라 → 권총 조준/사격 → 쫓아오는 좀비 2종 → 체력/회복/웨이브.

처음에는 싱글플레이, 정적 GitHub Pages 호스팅, 모바일 30FPS 목표, PC 60FPS 목표. 저장 키/서비스워커/아트는 라니킹덤과 완전 분리합니다.

**성능 목표는 미측정 수치이므로 목표로만 기록합니다.** 자산 전체 팩을 앱 첫 실행에서 로드하지 않습니다.

## 로컬 라이선스 및 소스 확인

```bash
node --test BlockSurvivalTPS/tests/*.test.mjs
node BlockSurvivalTPS/tools/acquire-open-assets.mjs --check
node --test tps-next/tools/acquire-seed.test.mjs
node tps-next/tools/acquire-seed.mjs --verify
```

대용량 원본 모델은 임시 폴더/검수 자료만으로 보관하며 별도 최적화 없이 모바일 게임에 포함하지 않습니다.
