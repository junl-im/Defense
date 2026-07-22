import { resolve } from 'node:path';
import { formatSvgViolations, scanSvgPolicy } from './svg-policy.mjs';

const root = resolve(import.meta.dirname, '..');
const violations = scanSvgPolicy(root);

if (violations.length) {
  console.error(`FAIL 절대 SVG 금지 정책 위반 ${violations.length}건`);
  for (const message of formatSvgViolations(violations)) console.error(`  - ${message}`);
  for (const message of formatSvgViolations(violations)) console.error(`::error title=SVG policy violation::${message}`);
  process.exit(1);
}

console.log('PASS 절대 SVG 금지: 파일·경로 참조·인라인·data URI 0건');
