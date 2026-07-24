(() => {
  const RELEASE_VERSION = '1.0.2';
  const BUILD_ID = 'b24.2';
  const VERSION = `${RELEASE_VERSION}-${BUILD_ID}`;
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
      probe: './vendor/three/three.module.js',
      three: './vendor/three/three.module.js',
      addons: './vendor/three/addons/'
    },
    {
      id: 'jsdelivr',
      probe: 'https://cdn.jsdelivr.net/npm/three@0.185.1/package.json',
      three: 'https://cdn.jsdelivr.net/npm/three@0.185.1/build/three.module.js',
      addons: 'https://cdn.jsdelivr.net/npm/three@0.185.1/examples/jsm/'
    },
    {
      id: 'unpkg',
      probe: 'https://unpkg.com/three@0.185.1/package.json',
      three: 'https://unpkg.com/three@0.185.1/build/three.module.js?module',
      addons: 'https://unpkg.com/three@0.185.1/examples/jsm/'
    },
    {
      id: 'esm-sh',
      probe: 'https://esm.sh/three@0.185.1',
      three: 'https://esm.sh/three@0.185.1',
      addons: 'https://esm.sh/three@0.185.1/examples/jsm/'
    }
  ];

  const fail = (message) => {
    status.error = message;
    window.__DOKKAEBI_SHOW_BOOT_ERROR__?.(message);
  };

  const probe = async (candidate) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), candidate.id === 'local-vendor' ? 1800 : 5200);
    try {
      const response = await fetch(candidate.probe, { cache: 'no-store', mode: 'cors', signal: controller.signal });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      await response.body?.cancel?.();
      status.attempts.push({ id: candidate.id, ok: true });
      return true;
    } catch (error) {
      status.attempts.push({ id: candidate.id, ok: false, error: error instanceof Error ? error.message : String(error) });
      return false;
    } finally {
      clearTimeout(timer);
    }
  };

  const launch = async () => {
    if (!HTMLScriptElement.supports?.('importmap')) {
      fail('이 브라우저는 현재 게임 모듈 형식을 지원하지 않습니다. 최신 Chrome, Edge 또는 Safari에서 다시 실행해 주세요.');
      return;
    }
    let selected = null;
    for (const candidate of candidates) {
      if (await probe(candidate)) { selected = candidate; break; }
    }
    if (!selected) {
      fail('3D 엔진 파일에 연결하지 못했습니다. 네트워크 또는 CDN 차단을 확인하거나 npm run build로 생성한 배포본을 사용해 주세요.');
      return;
    }
    status.source = selected.id;
    const map = document.createElement('script');
    map.type = 'importmap';
    map.textContent = JSON.stringify({ imports: { 'three': selected.three, 'three/addons/': selected.addons } });
    document.head.appendChild(map);

    const entry = document.createElement('script');
    entry.type = 'module';
    entry.src = `./src/bootstrap.js?v=${VERSION}`;
    entry.addEventListener('load', () => { status.ready = true; status.entryLoadedAt = Date.now(); }, { once: true });
    entry.addEventListener('error', () => fail(`게임 진입 모듈을 불러오지 못했습니다. 엔진 소스: ${selected.id}`), { once: true });
    document.body.appendChild(entry);
  };

  launch().catch((error) => fail(`부팅 복구 중 오류가 발생했습니다: ${error instanceof Error ? error.message : String(error)}`));
})();
