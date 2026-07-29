(() => {
  const RELEASE_VERSION = '1.0.48';
  const BUILD_ID = 'b24.48';
  const VERSION = `${RELEASE_VERSION}-${BUILD_ID}`;
  const script = document.currentScript;
  const entryPath = script?.dataset.entry || './src/bootstrap.js';
  const vendorBase = (script?.dataset.vendorBase || './vendor/three/').replace(/\/?$/, '/');
  const status = window.__DOKKAEBI_STATIC_BOOTSTRAP__ = {
    version: RELEASE_VERSION,
    buildId: BUILD_ID,
    startedAt: Date.now(),
    source: '',
    attempts: [],
    ready: false
  };
  const candidates = [
    {
      id: 'local-vendor',
      three: `${vendorBase}three.module.js`,
      addons: `${vendorBase}addons/`,
      timeout: 2200
    },
    {
      id: 'fastly-jsdelivr',
      three: 'https://fastly.jsdelivr.net/npm/three@0.185.1/build/three.module.js',
      addons: 'https://fastly.jsdelivr.net/npm/three@0.185.1/examples/jsm/',
      timeout: 7000
    },
    {
      id: 'jsdelivr-npm',
      three: 'https://cdn.jsdelivr.net/npm/three@0.185.1/build/three.module.js',
      addons: 'https://cdn.jsdelivr.net/npm/three@0.185.1/examples/jsm/',
      timeout: 7000
    },
    {
      id: 'jsdelivr-github',
      three: 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r185/build/three.module.js',
      addons: 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r185/examples/jsm/',
      timeout: 7000
    },
    {
      id: 'unpkg',
      three: 'https://unpkg.com/three@0.185.1/build/three.module.js?module',
      addons: 'https://unpkg.com/three@0.185.1/examples/jsm/',
      timeout: 7000
    },
    {
      id: 'esm-sh',
      three: 'https://esm.sh/three@0.185.1',
      addons: 'https://esm.sh/three@0.185.1/examples/jsm/',
      timeout: 7000
    }
  ];

  const fail = (message) => {
    status.error = message;
    window.__DOKKAEBI_SHOW_BOOT_ERROR__?.(message);
  };

  const probeFile = async (url, timeout) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    try {
      const response = await fetch(url, { cache: 'no-store', mode: 'cors', signal: controller.signal });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('text/html')) throw new Error('HTML response');
      await response.body?.cancel?.();
      return true;
    } finally {
      clearTimeout(timer);
    }
  };

  const probe = async (candidate) => {
    try {
      await Promise.all([
        probeFile(candidate.three, candidate.timeout),
        probeFile(`${candidate.addons}loaders/GLTFLoader.js`, candidate.timeout)
      ]);
      status.attempts.push({ id: candidate.id, ok: true });
      return candidate;
    } catch (error) {
      status.attempts.push({ id: candidate.id, ok: false, error: error instanceof Error ? error.message : String(error) });
      return null;
    }
  };

  const selectCandidate = async () => {
    window.__DOKKAEBI_UPDATE_BOOT_GATE__?.({
      status: '로컬 3D 엔진을 확인하는 중...',
      detail: '인터넷 연결 없이 시작할 수 있는 경로를 먼저 확인합니다.',
      mode: 'engine-local'
    });
    const local = await probe(candidates[0]);
    if (local) return local;
    window.__DOKKAEBI_UPDATE_BOOT_GATE__?.({
      status: '복구 엔진 경로를 확인하는 중...',
      detail: '고정 버전의 안전한 엔진 후보를 확인합니다.',
      mode: 'engine-recovery'
    });
    const remoteResults = await Promise.all(candidates.slice(1).map(probe));
    return remoteResults.find(Boolean) || null;
  };

  const launch = async () => {
    if (!HTMLScriptElement.supports?.('importmap')) {
      fail('이 브라우저는 현재 게임 모듈 형식을 지원하지 않습니다. 최신 Chrome, Edge 또는 Safari에서 다시 실행해 주세요.');
      return;
    }
    const selected = await selectCandidate();
    if (!selected) {
      fail('3D 엔진 파일을 불러오지 못했습니다. 인터넷 연결 또는 CDN 차단을 확인한 뒤 캐시 정리 후 다시 시작해 주세요.');
      return;
    }
    status.source = selected.id;
    window.__DOKKAEBI_UPDATE_BOOT_GATE__?.({
      status: selected.id === 'local-vendor' ? '로컬 3D 엔진 준비 완료' : '3D 엔진 연결 완료',
      detail: selected.id === 'local-vendor' ? '오프라인 실행 경로로 게임을 시작합니다.' : '게임 모듈과 첫 장면을 불러오고 있습니다.',
      mode: selected.id === 'local-vendor' ? 'engine-local-ready' : 'engine-ready'
    });
    const map = document.createElement('script');
    map.type = 'importmap';
    map.textContent = JSON.stringify({ imports: { 'three': selected.three, 'three/addons/': selected.addons } });
    document.head.appendChild(map);

    const entry = document.createElement('script');
    entry.type = 'module';
    entry.src = `${entryPath}${entryPath.includes('?') ? '&' : '?'}v=${VERSION}`;
    entry.addEventListener('load', () => { status.ready = true; status.entryLoadedAt = Date.now(); }, { once: true });
    entry.addEventListener('error', () => fail(`게임 진입 모듈을 불러오지 못했습니다. 엔진 소스: ${selected.id}`), { once: true });
    document.body.appendChild(entry);
  };

  launch().catch((error) => fail(`부팅 복구 중 오류가 발생했습니다: ${error instanceof Error ? error.message : String(error)}`));
})();
