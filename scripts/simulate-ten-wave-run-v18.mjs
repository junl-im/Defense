import { writeFileSync } from 'node:fs';
import { generatedOutput } from './output-paths.mjs';
import { simulateTenWaveReliability } from '../src/runtime/ten-wave-reliability-simulation.js';

const result = simulateTenWaveReliability();
if (!result.passed || result.wavesCompleted !== 10) {
  console.error(JSON.stringify(result, null, 2));
  process.exit(1);
}
const output = generatedOutput({ category: 'simulations', filename: 'TEN_WAVE_RELIABILITY_SIMULATION_v18.latest.json', baseline: 'docs/TEN_WAVE_RELIABILITY_SIMULATION_v18.0.0.json' });
writeFileSync(output, `${JSON.stringify(result, null, 2)}\n`);
console.log(`PASS ten-wave reliability simulation (${result.wavesCompleted}/10) -> ${output}`);
