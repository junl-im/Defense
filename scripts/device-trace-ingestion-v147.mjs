import { createHash } from 'node:crypto';

export const DEVICE_TRACE_INGESTION_V147_ID = 'DD-DEVICE-TRACE-INGESTION-V147';
export const DEVICE_TRACE_INGESTION_VERSION = '1.0.47';

const SENSITIVE_KEYS = new Set([
  'deviceid','installationid','advertisingid','vendorid','accountid','userid','username','email','phonenumber','telephonenumber','mobilephone','mobilenumber',
  'ip','ipaddress','mac','macaddress','ssid','bssid','useragent','cookie','authorization','token','sessionid',
  'serialnumber','operatorname','hostname','filepath','absolutepath'
]);
const SECRET_PATTERNS = [
  /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i,
  /\b(?:\d{1,3}\.){3}\d{1,3}\b/,
  /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/i,
  /\b(?:bearer|token)\s+[a-z0-9._~+\/-]+=*\b/i
];

const canonical = (value) => JSON.stringify(value, (_key, item) => {
  if (item && typeof item === 'object' && !Array.isArray(item)) {
    return Object.fromEntries(Object.entries(item).sort(([a], [b]) => a.localeCompare(b)));
  }
  return item;
});
export const sha256JsonV147 = (value) => createHash('sha256').update(canonical(value)).digest('hex');

function sanitizeString(value, removed, path) {
  let text = String(value);
  for (const pattern of SECRET_PATTERNS) {
    if (pattern.test(text)) {
      removed.push(`${path}:pattern`);
      return '[redacted]';
    }
  }
  if (/^(?:[A-Za-z]:\\|\/home\/|\/Users\/|\/var\/|\/tmp\/)/.test(text)) {
    removed.push(`${path}:path`);
    return text.split(/[\\/]/).filter(Boolean).at(-1) || '[redacted-path]';
  }
  return text;
}

function sanitizeValue(value, removed, path = '$') {
  if (Array.isArray(value)) return value.map((item, index) => sanitizeValue(item, removed, `${path}[${index}]`));
  if (!value || typeof value !== 'object') return typeof value === 'string' ? sanitizeString(value, removed, path) : value;
  const output = {};
  for (const [key, item] of Object.entries(value)) {
    const normalized = key.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (SENSITIVE_KEYS.has(normalized)) {
      removed.push(`${path}.${key}`);
      continue;
    }
    output[key] = sanitizeValue(item, removed, `${path}.${key}`);
  }
  return output;
}

function validateProvenance(input = {}) {
  const failures = [];
  if (!['real-device', 'sanitized-v146-import'].includes(String(input.sourceType || ''))) failures.push('sourceType');
  if (!String(input.captureTool || '').trim()) failures.push('captureTool');
  if (input.consent !== 'qa-authorized') failures.push('consent');
  if (!/^\d{4}-\d{2}-\d{2}T/.test(String(input.capturedAt || ''))) failures.push('capturedAt');
  if (!String(input.approvalTicket || '').match(/^[A-Z0-9][A-Z0-9._-]{4,80}$/i)) failures.push('approvalTicket');
  return failures;
}

function normalizeTrace(trace = {}, index = 0) {
  const events = Array.isArray(trace.events) ? trace.events.map((event, eventIndex) => ({
    atMs: Math.max(0, Number(event.atMs) || eventIndex * 16),
    event: String(event.event || 'viewport'),
    visibility: event.visibility === 'hidden' ? 'hidden' : 'visible',
    standalone: Boolean(event.standalone),
    editableFocused: Boolean(event.editableFocused),
    layoutWidth: Math.max(1, Number(event.layoutWidth) || Number(event.visualWidth) || 1),
    layoutHeight: Math.max(1, Number(event.layoutHeight) || Number(event.visualHeight) || 1),
    visualWidth: Math.max(1, Number(event.visualWidth) || Number(event.layoutWidth) || 1),
    visualHeight: Math.max(1, Number(event.visualHeight) || Number(event.layoutHeight) || 1),
    offsetLeft: Math.max(0, Number(event.offsetLeft) || 0),
    offsetTop: Math.max(0, Number(event.offsetTop) || 0),
    visualScale: Math.max(.1, Number(event.visualScale) || 1),
    expected: event.expected && typeof event.expected === 'object' ? event.expected : {}
  })) : [];
  return {
    id: String(trace.id || `trace-${index + 1}`).replace(/[^a-z0-9._-]+/gi, '-').slice(0, 80),
    platform: String(trace.platform || 'unknown').slice(0, 80),
    requireResume: Boolean(trace.requireResume),
    requireKeyboard: Boolean(trace.requireKeyboard),
    requireBrowserChrome: Boolean(trace.requireBrowserChrome),
    events
  };
}

export function ingestDeviceTraceV147(rawInput = {}) {
  const provenanceFailures = validateProvenance(rawInput.provenance || {});
  const removed = [];
  const sanitized = sanitizeValue(rawInput, removed);
  const traces = (Array.isArray(sanitized.traces) ? sanitized.traces : []).map(normalizeTrace);
  const failures = [...provenanceFailures.map((name) => `provenance:${name}`)];
  if (!traces.length) failures.push('traces:empty');
  for (const [index, trace] of traces.entries()) {
    if (trace.events.length < 2) failures.push(`trace-${index}:insufficient-events`);
    let previous = -1;
    trace.events.forEach((event, eventIndex) => {
      if (event.atMs < previous) failures.push(`trace-${index}:event-${eventIndex}:non-monotonic`);
      previous = event.atMs;
    });
  }
  const sourceSha256 = sha256JsonV147(rawInput);
  const output = {
    id: DEVICE_TRACE_INGESTION_V147_ID,
    releaseVersion: DEVICE_TRACE_INGESTION_VERSION,
    provenance: {
      sourceType: String(rawInput.provenance?.sourceType || ''),
      captureTool: String(rawInput.provenance?.captureTool || ''),
      capturedDate: String(rawInput.provenance?.capturedAt || '').slice(0, 10),
      approvalTicket: String(rawInput.provenance?.approvalTicket || ''),
      consent: 'qa-authorized',
      sourceSha256,
      sanitizer: DEVICE_TRACE_INGESTION_V147_ID,
      removedIdentifierCount: removed.length
    },
    traces
  };
  const serialized = JSON.stringify(output);
  for (const pattern of SECRET_PATTERNS) if (pattern.test(serialized)) failures.push('output:identifier-pattern');
  return Object.freeze({ output, removed: Object.freeze(removed), failures: Object.freeze(failures), passed: failures.length === 0 });
}

export function validateCommittedTraceFixtureV147(fixture = {}) {
  const failures = [];
  if (fixture.id !== DEVICE_TRACE_INGESTION_V147_ID) failures.push('id');
  if (fixture.releaseVersion !== DEVICE_TRACE_INGESTION_VERSION) failures.push('releaseVersion');
  if (!/^[a-f0-9]{64}$/.test(String(fixture.provenance?.sourceSha256 || ''))) failures.push('sourceSha256');
  if (fixture.provenance?.consent !== 'qa-authorized') failures.push('consent');
  if (!Array.isArray(fixture.traces) || fixture.traces.length < 3) failures.push('traceCount');
  const serialized = JSON.stringify(fixture);
  for (const key of SENSITIVE_KEYS) if (new RegExp(`"${key}"`, 'i').test(serialized)) failures.push(`sensitive-key:${key}`);
  for (const pattern of SECRET_PATTERNS) if (pattern.test(serialized)) failures.push('identifier-pattern');
  return Object.freeze({ passed: failures.length === 0, failures: Object.freeze(failures) });
}
