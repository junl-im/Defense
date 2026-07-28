import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const verifier = path.join(root, 'scripts', 'verify-dist-v143.mjs');
const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'v143-css-contract-'));

const common = {
  'version.json': JSON.stringify({ releaseVersion: '1.0.46', buildId: 'b24.46' }),
  'index.html': '<button id="summon-btn" data-summon-visibility-v143="enhanced"></button>',
  'assets/game.js': "console.log('DD-MOBILE-INPUT-RECOVERY-V143','mobile-input-recovery-v143');\n",
};

const fixtures = [
  {
    name: 'double-colon',
    shouldPass: true,
    css: `
      #summon-btn[data-summon-visibility-v143="enhanced"] {
        isolation:isolate; overflow:visible; touch-action:manipulation;
        -webkit-tap-highlight-color:transparent;
      }
      #summon-btn[data-summon-visibility-v143="enhanced"]::before {
        content:"소환"; position:absolute; pointer-events:none;
      }
    `,
  },
  {
    name: 'single-colon-and-grouped-selectors',
    shouldPass: true,
    css: `
      .shared, #summon-btn[data-summon-visibility-v143=enhanced] {
        isolation:isolate; overflow:visible; touch-action:manipulation;
        -webkit-tap-highlight-color:#0000;
      }
      .shared-label, #summon-btn[data-summon-visibility-v143=enhanced]:before {
        content:"소환"; position:absolute; pointer-events:none;
      }
    `,
  },
  {
    name: 'declarations-split-across-media-rules',
    shouldPass: true,
    css: `
      #summon-btn[data-summon-visibility-v143=enhanced] { isolation:isolate; overflow:visible; }
      @media(max-width:520px) {
        #summon-btn[data-summon-visibility-v143=enhanced] {
          touch-action:manipulation; -webkit-tap-highlight-color:rgba(0,0,0,0);
        }
      }
      #summon-btn[data-summon-visibility-v143=enhanced]::before { content:"소환"; position:absolute; }
      @media(max-width:520px) {
        .shared, #summon-btn[data-summon-visibility-v143=enhanced]:before { pointer-events:none; }
      }
    `,
  },
  {
    name: 'missing-pointer-events',
    shouldPass: false,
    expectedError: 'pointer-events:none',
    css: `
      #summon-btn[data-summon-visibility-v143=enhanced] {
        isolation:isolate; overflow:visible; touch-action:manipulation;
        -webkit-tap-highlight-color:#0000;
      }
      #summon-btn[data-summon-visibility-v143=enhanced]:before {
        content:"소환"; position:absolute;
      }
    `,
  },
];

try {
  for (const fixture of fixtures) {
    const dist = path.join(tempRoot, fixture.name);
    for (const [relativePath, value] of Object.entries(common)) {
      const target = path.join(dist, relativePath);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, value);
    }
    const cssPath = path.join(dist, 'assets', 'game.css');
    fs.mkdirSync(path.dirname(cssPath), { recursive: true });
    fs.writeFileSync(cssPath, fixture.css);

    const result = spawnSync(process.execPath, [verifier], {
      cwd: root,
      env: { ...process.env, DIST_DIR: dist },
      encoding: 'utf8',
    });
    const output = `${result.stdout || ''}${result.stderr || ''}`;

    if (fixture.shouldPass && result.status !== 0) {
      throw new Error(`${fixture.name} unexpectedly failed:\n${output}`);
    }
    if (!fixture.shouldPass && result.status === 0) {
      throw new Error(`${fixture.name} unexpectedly passed`);
    }
    if (!fixture.shouldPass && fixture.expectedError && !output.includes(fixture.expectedError)) {
      throw new Error(`${fixture.name} failed without expected diagnostic ${fixture.expectedError}:\n${output}`);
    }
  }
} finally {
  fs.rmSync(tempRoot, { recursive: true, force: true });
}

console.log('PASS v1.0.43 dist CSS verifier accepts minifier selector forms and rejects missing behavior');
