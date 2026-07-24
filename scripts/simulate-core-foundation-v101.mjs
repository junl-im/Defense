import fs from 'node:fs';
import { generatedOutput } from './output-paths.mjs';
import CoreFoundationDirectorV101 from '../src/runtime/core-foundation-director-v101.js';
import { VERSION_POLICY } from '../src/version-policy.js';

const director = new CoreFoundationDirectorV101({ versionPolicy: VERSION_POLICY, lowPower: false });
for (let i = 0; i < 180; i += 1) director.sampleFrame(1 / 60, { state: i < 20 ? 'loading' : i < 50 ? 'title' : 'playing' });
for (let i = 0; i < 30; i += 1) director.sampleFrame(0.045, { state: 'playing' });
const stressed = director.diagnostics;
for (let i = 0; i < 240; i += 1) director.sampleFrame(1 / 60, { state: 'playing' });
const recovered = director.diagnostics;
const result = {
  version: '1.0.2',
  passed: stressed.pressure > 0.2 && recovered.pressure < stressed.pressure && recovered.invalidStates === 0,
  stressed,
  recovered,
  nextPatch: '1.0.2'
};
const output = generatedOutput({ category: 'simulations', filename: 'CORE_FOUNDATION_SIMULATION_v1.0.2.json' });
fs.writeFileSync(output, JSON.stringify(result, null, 2) + '\n');
console.log(`${result.passed ? 'PASS' : 'FAIL'} core foundation pressure and recovery simulation`);
console.log(`OUTPUT ${output}`);
if (!result.passed) process.exit(1);
