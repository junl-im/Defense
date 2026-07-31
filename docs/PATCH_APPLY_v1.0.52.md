# v1.0.52 CI HOTFIX R7 패치 적용

R7 패치 ZIP은 프로젝트 루트 기준의 직접 덮어쓰기 구조다. `overlay/` 포장 폴더나 패치 전용 메타데이터 파일이 들어 있지 않다.

1. 기존 프로젝트를 백업한다.
2. 패치 ZIP의 내용 전체를 기존 프로젝트 루트에 직접 덮어쓴다.
3. 아래 정리 명령으로 오래된 `dist/`, `dist-pages/`, 실수로 남은 `overlay/`와 루트 패치 메타데이터를 제거한다.
4. 의존성을 새로 설치하고 전체 검증·빌드·dist 검증을 실행한다.

```bash
npm run clean:obsolete
npm ci
npm run verify:ci
VITE_BASE_PATH=/Defense/ npm run build
npm run verify:dist:all
```

패치 ZIP의 모든 파일 경로는 R7 전체 통파일에도 존재해야 하며, 같은 경로의 SHA-256이 일치해야 한다. 패치 적용 후 정리된 프로젝트 트리는 R7 전체 통파일과 동일해야 한다.


## R3 적용

R3 패치 ZIP은 R2와 동일하게 프로젝트 루트 직접 덮어쓰기 구조다. `overlay/` 포장 폴더나 패치 전용 메타데이터를 프로젝트에 추가하지 않는다. R2에 R3를 덮어써도 되고, 최초 v1.0.52 전체본에 바로 덮어써도 된다.

적용 후 GitHub Actions에서 v147 보고서의 실패 메시지가 더 이상 일반 `Runtime.evaluate timed out`가 아니라 단계명과 함께 출력되는지 확인한다. 성공 시 `PASS v1.0.47 offline launch and mid-wave reconnect browser assurance`가 출력되어야 한다.

## R4 적용

R4 패치 ZIP은 프로젝트 루트 직접 덮어쓰기 구조다. R3 또는 이전 v1.0.52 기준본에 ZIP의 내용 전체를 프로젝트 루트로 덮어쓴다. `overlay/` 포장 폴더와 패치 메타데이터는 ZIP 내부에 없다.

적용 후 다음을 실행한다.

```bash
npm run clean:obsolete
npm ci
npm run verify:ci
VITE_BASE_PATH=/Defense/ npm run build
npm run verify:dist:all
```

v147 성공 로그에는 `PASS v1.0.47 offline launch and mid-wave reconnect browser assurance`가 출력되어야 한다. 실패 시 서비스 워커 진단의 `precache.phase`, `completed`, `failed`, `current`, `failures`를 확인한다. R4에서는 역사적 `./src/...` 모듈이 설치 요청 목록에 나타나면 안 된다.


## R5 적용

R5는 R4 또는 이전 v1.0.52 전체본에 적용하는 프로젝트 루트 직접 덮어쓰기 패치다. ZIP 안에 `overlay/` wrapper나 패치 메타데이터가 없으며, ZIP의 `scripts/`, `docs/`, `package.json` 등 프로젝트 경로를 저장소 루트에 그대로 덮어쓴다.

적용 뒤 다음을 실행한다.

```bash
npm run clean:obsolete
npm ci
npm run verify:ci
VITE_BASE_PATH=/Defense/ npm run build
npm run verify:dist:all
```

v147 성공 로그에는 다음이 출력되어야 한다.

```text
PASS v1.0.47 offline launch and mid-wave reconnect browser assurance
```

실패 시 `logs/qa/v147/offline-reconnect-report.json`의 `suite.scenarios[0].saveDiff`를 확인한다. `missing`, `added`, `changed`, `sentinelMissing`에는 실제 지속 저장 키만 표시된다. `storageBefore.volatile`과 `storageAfter.volatile`의 fingerprint 차이는 부트 진단·rolling checkpoint의 정상 갱신이며 그 자체로 실패가 아니다.


## R6 적용

R6는 R5 또는 이전 v1.0.52 전체본에 적용하는 프로젝트 루트 직접 덮어쓰기 패치다. ZIP 안에 `overlay/` wrapper와 패치 메타데이터가 없으며 프로젝트 경로만 포함한다.

적용 후 다음을 실행한다.

```bash
npm run clean:obsolete
npm ci
npm run verify:ci
VITE_BASE_PATH=/Defense/ npm run build
npm run verify:dist:all
```

v147 다음에 v148이 다음과 같이 통과해야 한다.

```text
PASS v1.0.48+ complete dist contains safe persistence, bounded diagnostics, hidden-frame suspension, and comprehensive audit markers under 1.0.52
```

R6 검증기는 `assets/game.js` 하나에 모든 마커가 있어야 한다고 가정하지 않는다. 엔트리에서 실제로 도달 가능한 `assets/chunks/*.js`까지 순회한다. 패치 적용 후에도 `dist/`는 기존 것을 재사용하지 말고 반드시 새로 빌드한다.


## R7 적용

R7은 R6 또는 이전 v1.0.52 전체본에 적용하는 프로젝트 루트 직접 덮어쓰기 패치다. ZIP 안에 `overlay/` wrapper나 패치 메타데이터가 없으며 프로젝트 경로만 포함한다.

production build의 QA API는 localhost에서도 자동 노출되지 않는다. 브라우저 자동화는 반드시 `?qa=v144`, `?qa=v145`, `?qa=v146`, `?qa=v147`, `?qa=v149`처럼 명시적 토큰을 사용한다.

적용 후 새 `dist/`를 생성하고 다음 v149 로그를 확인한다.

```text
PASS v1.0.49 production localhost hides QA API and explicit QA query exposes frozen test API
PASS v1.0.49 foundation on forward-compatible complete Vite dist
```

production-default 시나리오에서 `testApi:true`가 다시 나오면 패치가 적용되지 않았거나 이전 `dist/`를 재사용한 것이다.
