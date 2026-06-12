# KingdomSeed v2.35.2 Combat FX Governor Patch

## 목표
v2.35.1에서 추가된 전투 쥬스 연출을 유지하되, 모바일 저사양/약한 네트워크 환경에서 전투 중 FX 객체가 폭주하지 않도록 안정화했습니다.

## 변경 사항
- `src/game/Effects.ts`
  - Floating Combat Text에 동시 활성 개수 제한을 연결했습니다.
  - Projectile에 동시 활성 개수 제한을 연결했습니다.
  - Death Poof 파티클 계열에 동시 활성 개수 제한을 연결했습니다.
  - `quality=low` 또는 자동 저전력 모드에서는 투사체의 부가 glow/trail/pin 오브젝트 생성을 생략해 draw call과 tween 수를 줄입니다.
  - 파라볼라 투사체 trail 위치 계산에서 y좌표가 잘못 들어가던 런타임 연출 버그를 수정했습니다.

## 검증
- `npm run build` 통과
- `tsc && vite build` 통과
- Vite의 500kB 이상 청크 경고는 기존 번들 구조 경고이며 빌드 실패가 아닙니다.

## 적용 방법
프로젝트 루트에 zip 내용을 그대로 덮어씌운 뒤 아래 명령으로 확인하세요.

```bash
npm install
npm run build
```

## 주의
이 패치는 새 대용량 에셋을 기본 부팅에 추가하지 않습니다. 기본 실행 성능을 우선하고, 고급 연출은 기존 품질/런타임 가버너 정책을 따릅니다.
