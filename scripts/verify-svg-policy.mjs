import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { scanSvgPolicy } from './svg-policy.mjs';

const fixture = mkdtempSync(resolve(tmpdir(), 'dokkaebi-svg-policy-'));
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

try {
  mkdirSync(resolve(fixture, 'src'), { recursive: true });
  mkdirSync(resolve(fixture, 'public'), { recursive: true });
  writeFileSync(resolve(fixture, 'index.html'), '<img src="icon-192.png">');
  writeFileSync(resolve(fixture, 'src/policy.js'), "const rejectedExtension = 'svg';\n");
  assert(scanSvgPolicy(fixture).length === 0, '정책 설명 문자열을 SVG 참조로 오인함');

  writeFileSync(resolve(fixture, 'src/bad.js'), "const icon = './bad-icon.svg?v=1';\n");
  let violations = scanSvgPolicy(fixture);
  assert(violations.some((item) => item.kind === 'svg-path' && item.path === 'src/bad.js'), 'SVG 경로 참조를 탐지하지 못함');

  rmSync(resolve(fixture, 'src/bad.js'));
  writeFileSync(resolve(fixture, 'index.html'), '<svg viewBox="0 0 1 1"></svg>');
  violations = scanSvgPolicy(fixture);
  assert(violations.some((item) => item.kind === 'inline-svg'), '인라인 SVG를 탐지하지 못함');

  writeFileSync(resolve(fixture, 'public/bad.svg'), '<svg></svg>');
  violations = scanSvgPolicy(fixture);
  assert(violations.some((item) => item.kind === 'svg-file' && item.path === 'public/bad.svg'), 'SVG 파일을 탐지하지 못함');

  console.log('PASS SVG 정책 검사기 오탐·누락 회귀 테스트');
} finally {
  rmSync(fixture, { recursive: true, force: true });
}
