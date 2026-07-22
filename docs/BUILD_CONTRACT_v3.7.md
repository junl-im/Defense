# v3.7 빌드 모듈 계약

## 수정한 실패

GitHub Actions의 Rolldown 단계에서 다음 오류가 발생했다.

```text
[MISSING_EXPORT] "BOSS_ASSET_IDS" is not exported by "src/engine/index.js"
```

`main.js`가 에셋 ID까지 배럴 모듈에 의존하던 구조를 제거했다.

```js
import { ENGINE_VERSION, MobileGameEngine, ... } from './engine/index.js';
import {
  CORE_ASSET_CATALOG,
  PLAYER_ASSET_ID,
  GUARDIAN_ASSET_IDS,
  MONSTER_ASSET_IDS,
  BOSS_ASSET_IDS
} from './engine/asset-catalog.js';
```

에셋 ID의 단일 원본은 `src/engine/asset-catalog.js`다. `src/engine/index.js`의 재수출은 외부 편의를 위해 유지하지만 `main.js` 빌드의 필수 의존점으로 사용하지 않는다.

## 자동 검증

`scripts/verify-module-exports.mjs`는 `src/**/*.js`의 상대 named import를 읽고 대상 모듈의 다음 export를 재귀적으로 확인한다.

- `export const/function/class`
- `export { name }`
- `export { name } from './module.js'`
- `export * from './module.js'`

존재하지 않는 이름을 가져오면 `npm run verify`가 Vite 이전에 실패한다.

## CI 권장 순서

```bash
npm ci
npm run clean:obsolete
npm run verify
npm run build
```

`verify`와 `build`를 분리하지 않는다. 정적 검사만 통과하고 번들러 계약이 깨지는 상황을 줄이기 위해 두 명령을 같은 워크플로에서 연속 실행한다.

## v3.7.1 검증 전 청소 계약

이전 패치 ZIP은 루트 `PATCH_README.md`를 포함했고, ZIP 덮어쓰기는 기존 파일을 삭제하지 못하므로 구형 Vite 번들·SVG가 Git 작업 트리에 남을 수 있었다. GitHub Actions는 `verify`를 `prebuild`보다 먼저 실행하므로 기존 청소 단계가 늦었다.

현재 계약:

- `clean:obsolete`: 루트 패치 문서, SVG, `public/assets/index-*`를 멱등 제거
- `preverify`: 검증 전에 `clean:obsolete` 실행
- `prebuild`: 빌드 전에 같은 청소를 한 번 더 실행
- `verify-project.mjs`: 청소 후 잔여물이 없는지 다시 검사

따라서 오염된 v3.7.0 작업 트리에서도 `npm run verify` 한 번으로 청소와 검증이 순서대로 실행된다.

