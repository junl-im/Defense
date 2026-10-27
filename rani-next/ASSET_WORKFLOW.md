# 라니킹덤 3D 자산 제작 규격 · v5.36

현재 게임은 2.5D WebP/PNG 스프라이트 중심입니다. **Meshy 또는 TRELLIS.2에서 얻은 GLB 1개를 동일한 Blender 카메라로 네 번 렌더**하고, 검수 후에만 실제 게임 아틀라스에 연결합니다.

## 우선 제작할 12종
`keep` 성채, `gatehouse` 성문, `wall` 성벽, `tower` 감시탑, `house` 주택, `warehouse` 창고, `barracks` 병영, `farm` 농장, `market` 시장, `harbor` 항구, `shipyard` 조선소, `trade_ship` 무역선.

## 3D 제작용 공통 텍스트
Stylized hand-painted isometric medieval kingdom RTS building, royal blue-gray stone masonry and warm timber, clean readable silhouette at small size, PBR materials, separated roof and wall parts, medium-poly geometry, centered origin, no text or logo, no scenic ground plate, one isolated building.

하나의 자산을 각도별 2D 생성하지 않고 반드시 **하나의 3D 원본으로 네 방향을 렌더링**합니다. 생성 도구의 상업 이용 및 제3자 권리 조건은 자산별로 확인합니다.

## 반입 폴더
```
incoming-3d/
  keep.glb
  keep.license.json
staging-3d/keep/
  keep_ne.png
  keep_se.png
  keep_sw.png
  keep_nw.png
  render-manifest.json
```

`keep.license.json`은 실제로 확인한 자료를 바탕으로 아래 필드를 가집니다. 가짜 URL이나 미확인된 권한을 기록해서는 안 됩니다.
```json
{
  "generator": "Meshy",
  "creator": "실제 생성자/계정",
  "source_url": "https://example.org/REAL-MODEL-LINK",
  "license_url": "https://example.org/REAL-LICENSE-LINK",
  "usage_rights": "실제로 검증한 게임 사용 권한 근거",
  "verified_by": "검수 담당자",
  "approved_for_game": true
}
```

## 실행
```bash
node --test rani-next/asset-intake.test.mjs
node rani-next/asset-intake.mjs incoming-3d
blender -b --python rani-next/render-asset-4views.py -- --input incoming-3d/keep.glb --output staging-3d/keep --size 384
```

입력 GLB는 수정하지 않고, 출력은 `staging-3d`로 격리합니다. 메타데이터 검사 합격은 품질·저작권·게임 호환성의 최종 승인이 아닙니다.

## 게임 반영 전 검수
1. 네 방향 동일 배율·크기와 주택/성벽/성문의 시점 일관성
2. 건물 바닥 높이·그림자·투명 배경·충돌 영역 및 2.5D 앵커
3. 모바일 렌더링 비용, 고해상도 확대, 텍스처 원본 권리
4. 기존 `buildings.json`의 4방향 프레임 구조와 표시 테스트
5. 원본 코드, 저장 형식, 지도, 현재 PWA 위치 및 UI 흐름 회귀 테스트

**현재 실제 Meshy/TRELLIS.2 GLB 모델 생성 또는 게임 내 자산 교체는 수행하지 않았습니다.** 본 문서/스크립트는 외부 GLB 반입과 렌더 자동화 준비 단계입니다.
