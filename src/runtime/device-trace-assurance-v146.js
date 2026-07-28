import { resolveMobileViewportV23 } from './mobile-hud-director-v23.js';
import { compareViewportSnapshotsV143, normalizeViewportSnapshotV143 } from './mobile-input-recovery-v143.js';

export const DEVICE_TRACE_ASSURANCE_V146_ID = 'DD-DEVICE-TRACE-ASSURANCE-V146';
export const DEVICE_TRACE_ASSURANCE_VERSION = '1.0.46';

const finite = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const freeze = (value) => Object.freeze(value);

export function normalizeDeviceTraceEventV146(input = {}, index = 0) {
  const layoutWidth = Math.max(1, finite(input.layoutWidth, input.visualWidth || input.width || 1));
  const layoutHeight = Math.max(1, finite(input.layoutHeight, input.visualHeight || input.height || 1));
  const visualWidth = Math.max(1, finite(input.visualWidth, input.width || layoutWidth));
  const visualHeight = Math.max(1, finite(input.visualHeight, input.height || layoutHeight));
  return freeze({
    index,
    atMs: Math.max(0, finite(input.atMs, index * 16)),
    event: String(input.event || 'viewport'),
    visibility: input.visibility === 'hidden' ? 'hidden' : 'visible',
    standalone: Boolean(input.standalone),
    editableFocused: Boolean(input.editableFocused),
    layoutWidth,
    layoutHeight,
    visualWidth,
    visualHeight,
    offsetLeft: Math.max(0, finite(input.offsetLeft)),
    offsetTop: Math.max(0, finite(input.offsetTop)),
    visualScale: Math.max(.1, finite(input.visualScale, input.scale || 1)),
    expected: freeze({ ...(input.expected || {}) })
  });
}

function resetReason(previousEvent, event, comparison) {
  if (!previousEvent) return 'viewport-initialized';
  if (previousEvent.visibility === 'hidden' && event.visibility === 'visible') return 'visibility-resume';
  if (event.event === 'pageshow') return 'page-show';
  if (event.event === 'orientationchange') return 'orientation-change';
  return comparison.reset ? comparison.reason : '';
}

function checkExpected(profile, expected = {}) {
  const failures = [];
  for (const key of ['keyboard', 'browserChrome', 'zoomed', 'landscape', 'phone']) {
    if (typeof expected[key] === 'boolean' && profile[key] !== expected[key]) failures.push(`${key}:${profile[key]}!=${expected[key]}`);
  }
  if (typeof expected.minHeight === 'number' && profile.height < expected.minHeight) failures.push(`height:${profile.height}<${expected.minHeight}`);
  if (typeof expected.maxHeight === 'number' && profile.height > expected.maxHeight) failures.push(`height:${profile.height}>${expected.maxHeight}`);
  return failures;
}

export function replayDeviceViewportTraceV146(trace = {}) {
  const events = Array.isArray(trace.events) ? trace.events.map(normalizeDeviceTraceEventV146) : [];
  const samples = [];
  const failures = [];
  let previousSnapshot = null;
  let previousEvent = null;
  let previousAt = -1;
  let resumeCount = 0;
  let viewportResetCount = 0;
  let keyboardFrames = 0;
  let browserChromeFrames = 0;
  for (const event of events) {
    if (event.atMs < previousAt) failures.push(`event-${event.index}:non-monotonic-time`);
    previousAt = event.atMs;
    const snapshot = normalizeViewportSnapshotV143({
      width: event.visualWidth,
      height: event.visualHeight,
      offsetLeft: event.offsetLeft,
      offsetTop: event.offsetTop,
      scale: event.visualScale
    });
    const comparison = compareViewportSnapshotsV143(previousSnapshot, snapshot);
    const profile = resolveMobileViewportV23({
      layoutWidth: event.layoutWidth,
      layoutHeight: event.layoutHeight,
      visualWidth: event.visualWidth,
      visualHeight: event.visualHeight,
      offsetLeft: event.offsetLeft,
      offsetTop: event.offsetTop,
      visualScale: event.visualScale,
      editableFocused: event.editableFocused
    });
    const reason = resetReason(previousEvent, event, comparison);
    if (reason === 'visibility-resume' || reason === 'page-show') resumeCount += 1;
    if (reason.startsWith('viewport-')) viewportResetCount += 1;
    if (profile.keyboard) keyboardFrames += 1;
    if (profile.browserChrome) browserChromeFrames += 1;
    for (const failure of checkExpected(profile, event.expected)) failures.push(`event-${event.index}:${failure}`);
    if (profile.offsetRight < 0 || profile.offsetBottom < 0) failures.push(`event-${event.index}:negative-safe-offset`);
    samples.push(freeze({ event, snapshot, comparison, resetReason: reason, profile }));
    previousSnapshot = snapshot;
    previousEvent = event;
  }
  const last = samples.at(-1);
  const checks = freeze({
    hasEvents: events.length >= 2,
    monotonic: !failures.some((entry) => entry.includes('non-monotonic-time')),
    expectedStates: !failures.some((entry) => entry.includes('!=')),
    safeOffsets: !failures.some((entry) => entry.includes('negative-safe-offset')),
    finalVisible: Boolean(last && last.event.visibility === 'visible'),
    finalUsableViewport: Boolean(last && last.profile.width >= 280 && last.profile.height >= 280),
    resumeRecovered: !trace.requireResume || resumeCount > 0,
    keyboardObserved: !trace.requireKeyboard || keyboardFrames > 0,
    browserChromeObserved: !trace.requireBrowserChrome || browserChromeFrames > 0
  });
  return freeze({
    id: DEVICE_TRACE_ASSURANCE_V146_ID,
    releaseVersion: DEVICE_TRACE_ASSURANCE_VERSION,
    traceId: String(trace.id || ''),
    platform: String(trace.platform || ''),
    sampleCount: samples.length,
    resumeCount,
    viewportResetCount,
    keyboardFrames,
    browserChromeFrames,
    checks,
    failures: freeze(failures),
    passed: Object.values(checks).every(Boolean),
    samples: freeze(samples)
  });
}

export function replayDeviceTraceSuiteV146(input = {}) {
  const traces = Array.isArray(input.traces) ? input.traces : [];
  const reports = traces.map(replayDeviceViewportTraceV146);
  return freeze({
    id: DEVICE_TRACE_ASSURANCE_V146_ID,
    releaseVersion: DEVICE_TRACE_ASSURANCE_VERSION,
    traceCount: reports.length,
    passedCount: reports.filter((report) => report.passed).length,
    failedTraceIds: freeze(reports.filter((report) => !report.passed).map((report) => report.traceId)),
    passed: reports.length >= 3 && reports.every((report) => report.passed),
    reports: freeze(reports)
  });
}
