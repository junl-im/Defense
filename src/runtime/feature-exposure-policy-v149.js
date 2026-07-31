function readQaToken(search = '') {
  try { return new URLSearchParams(String(search || '')).get('qa') || ''; }
  catch { return ''; }
}

export function resolveFeatureExposureV149({ mode = 'production', hostname = '', search = '', explicitQa = false } = {}) {
  const normalizedMode = String(mode || 'production').toLowerCase();
  const normalizedHost = String(hostname || '').toLowerCase();
  const qaToken = readQaToken(search);
  const local = ['localhost', '127.0.0.1', '::1'].includes(normalizedHost);
  const qaRequested = Boolean(explicitQa || qaToken);
  const production = normalizedMode === 'production';
  const allowQaApi = !production || qaRequested;
  return Object.freeze({
    id: 'DD-FEATURE-EXPOSURE-POLICY-V149',
    production,
    local,
    qaRequested,
    qaToken: qaToken.slice(0, 32),
    allowQaApi,
    exposeDeveloperDiagnostics: allowQaApi,
    exposePublicRuntimeInfo: true
  });
}
