import fs from 'node:fs';
import path from 'node:path';

export const BROWSER_EVIDENCE_BUNDLE_V147_ID = 'DD-BROWSER-EVIDENCE-BUNDLE-V147';

const tail = (value, limit) => (Array.isArray(value) ? value.slice(-limit) : []);
const compactScenario = (report = {}, source = '') => {
  const passed = report.passed === true;
  const diagnostics = report.diagnostics || {};
  const base = {
    source,
    id: String(report.id || ''),
    releaseVersion: String(report.releaseVersion || ''),
    scenario: String(report.scenario || report.buildTarget || ''),
    passed,
    error: String(report.error || '')
  };
  if (passed) return {
    ...base,
    summary: report.summary || report.session?.report?.metrics || report.scenarios?.map?.((entry) => ({ scenario: entry.scenario, passed: entry.passed })) || null,
    diagnosticCounts: {
      console: diagnostics.console?.length || 0,
      exceptions: diagnostics.exceptions?.length || 0,
      failedRequests: diagnostics.failedRequests?.length || 0
    }
  };
  return {
    ...base,
    failureDigest: report.failureDigest || report.session?.report?.failureDigest || null,
    diagnostics: {
      consoleTail: tail(diagnostics.console, 30),
      exceptionTail: tail(diagnostics.exceptions, 20),
      failedRequestTail: tail(diagnostics.failedRequests, 30),
      navigation: diagnostics.navigation || null,
      boot: diagnostics.boot || null
    },
    screenshot: report.screenshot || '',
    chromiumStderrTail: String(report.chromiumStderr || '').slice(-12000)
  };
};

export function buildBrowserEvidenceBundleV147(entries = []) {
  const scenarios = entries.map((entry) => compactScenario(entry.report, entry.source));
  return Object.freeze({
    id: BROWSER_EVIDENCE_BUNDLE_V147_ID,
    releaseVersion: '1.0.47',
    scenarioCount: scenarios.length,
    passedCount: scenarios.filter((entry) => entry.passed).length,
    failedCount: scenarios.filter((entry) => !entry.passed).length,
    policy: 'Passed scenarios retain compact summaries. Failed scenarios retain compact diagnostics plus references to full source reports.',
    scenarios: Object.freeze(scenarios)
  });
}

export function collectBrowserEvidenceV147(root) {
  const candidates = [
    'logs/qa/v144/mobile-matrix-report.json',
    'logs/qa/v145/long-session-report.json',
    'logs/qa/v146/release-assurance-report.json',
    'logs/qa/v147/offline-reconnect-report.json'
  ];
  const entries = [];
  for (const relative of candidates) {
    const absolute = path.join(root, relative);
    if (!fs.existsSync(absolute)) continue;
    entries.push({ source: relative, report: JSON.parse(fs.readFileSync(absolute, 'utf8')) });
  }
  return entries;
}
