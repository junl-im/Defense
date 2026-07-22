import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const read = (path) => readFileSync(resolve(root, path), 'utf8');
const verifyProject = read('scripts/verify-project.mjs');
const workflow = read('.github/workflows/deploy.yml');
const failures = [];
const check = (condition, message) => condition ? console.log(`PASS ${message}`) : failures.push(message);

check(verifyProject.includes('VERIFY FAILURE DIGEST'), 'project verifier prints final failure digest');
check(verifyProject.includes('::error title=Project verification failed::'), 'project verifier emits GitHub annotations');
check(!verifyProject.includes("console.error(`\\n검증 실패 ${failures.length}건`);"), 'project verifier has no early hidden exit');
check(workflow.includes('npm run verify 2>&1 | tee verify.log'), 'workflow preserves full verification log');
check(workflow.includes("grep -nE '^(FAIL|::error)|VERIFY FAILURE DIGEST|검증 실패' verify.log"), 'workflow repeats failure digest at step end');
check(verifyProject.includes('추가 루트 Markdown은 빌드를 차단하지 않음'), 'non-runtime Markdown cannot block deployment');
check(verifyProject.includes("for (const runtimeDir of ['public', 'src'])"), 'SVG policy scans runtime asset directories only');

if (failures.length) {
  failures.forEach((message) => console.error(`FAIL ${message}`));
  process.exit(1);
}
console.log('CI failure reporting contract verified');
