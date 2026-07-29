import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { ingestDeviceTraceV147, validateCommittedTraceFixtureV147 } from './device-trace-ingestion-v147.mjs';
const root = path.resolve(import.meta.dirname, '..');
const raw = {
  provenance: { sourceType: 'real-device', captureTool: 'viewport-recorder-v2', consent: 'qa-authorized', capturedAt: '2026-07-28T09:30:00Z', approvalTicket: 'QA-V147-TRACE-001', operatorName: 'private operator' },
  deviceId: '2f1c3989-1a62-4ec0-8dc5-6159e67c0db1',
  userAgent: 'private-user-agent',
  email: 'qa@example.com',
  phoneNumber: '+82-10-1234-5678',
  traces: [{ id: 'android-address-bar', platform: 'android-chrome', events: [
    { atMs: 0, visualWidth: 430, visualHeight: 780, layoutWidth: 430, layoutHeight: 932, ipAddress: '10.0.0.4' },
    { atMs: 100, visualWidth: 430, visualHeight: 932, layoutWidth: 430, layoutHeight: 932, filePath: '/home/private/trace.json' }
  ] }]
};
const report = ingestDeviceTraceV147(raw);
assert.equal(report.passed, true, report.failures.join(','));
assert.ok(report.removed.length >= 5);
const text = JSON.stringify(report.output);
assert.equal(text.includes('qa@example.com'), false);
assert.equal(text.includes('10.0.0.4'), false);
assert.equal(text.includes('2f1c3989'), false);
assert.equal(text.includes('+82-10-1234-5678'), false);
const committed = JSON.parse(fs.readFileSync(path.join(root, 'docs/qa/device-viewport-traces-v147.json'), 'utf8'));
const validation = validateCommittedTraceFixtureV147(committed);
assert.equal(validation.passed, true, validation.failures.join(','));
console.log(`PASS v1.0.47 identifier-free device trace provenance (${committed.traces.length} committed traces)`);
