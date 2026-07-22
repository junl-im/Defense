# v3.5 코드 구조와 중복 방지 규칙

## 새 모듈

- `src/golden-sample-spec.js`: 골든 샘플 클립·소켓·맵·예산의 단일 원본
- `src/asset-diagnostics.js`: 에셋 진단 UI 렌더링과 HTML 이스케이프
- `scripts/generate_golden_hero_glb.py`: Skin·Clip·PBR Map을 포함한 기술 골든 샘플 생성
- `scripts/verify-golden-sample-glb.mjs`: GLB 바이너리 구조 검증
- `scripts/verify-asset-runtime.mjs`: 로더·AnimationMixer·PBR 보존·UI 연결 회귀 검증

## 금지 규칙

- 에셋 ID, 필수 클립, 소켓 이름을 여러 파일에 수동 복사하지 않는다.
- GLB 로드 성공과 아트 제작 승인을 같은 상태로 표시하지 않는다.
- AnimationClip이 있는 모델에 절차형 파츠 애니메이션을 동시에 적용하지 않는다.
- 압축 선언이 없는 GLB 때문에 DRACO/KTX2 디코더를 미리 로드하지 않는다.
- 에셋 프리로드 진행률을 한 실패에서 두 번 증가시키지 않는다.
- 외부 입력이 포함된 에셋 진단 문자열을 이스케이프 없이 `innerHTML`에 넣지 않는다.

## 확장 순서

골든 주인공 승인 → 근접 적 → 원거리 적 → 보스 → 환경 → UI → VFX → 대량 생산 순서를 유지한다.
