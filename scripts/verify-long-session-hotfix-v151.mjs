import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { buildLongSessionLoadProfileV146, getLoadPhaseBossTypeV146 } from '../src/runtime/long-session-load-profile-v151.js';

const root = path.resolve(import.meta.dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const profile = buildLongSessionLoadProfileV146();

assert.deepEqual(profile.map((entry) => entry.wave), [10, 25, 50, 75, 100]);
assert.equal(profile.length, 5);
assert.equal(profile.filter((entry) => entry.boss).length, 5);
assert.deepEqual([...new Set(profile.map((entry) => entry.bossType))].sort(), ['king', 'serpent', 'tiger']);
assert.equal(getLoadPhaseBossTypeV146(50), 'king');
assert.equal(getLoadPhaseBossTypeV146(11), '');

const director = read('src/runtime/character-presentation-director-v151.js');
assert.match(director, /disableModernRecordV151\(record, error\)/);
assert.match(director, /legacy combat art remains active/);
assert.match(director, /try\s*\{\s*this\.updateModernRecordV151/);
assert.match(director, /presentationFallbacksV151/);

const main = read('src/main.js');
assert.match(main, /getLoadPhaseBossTypeV146\(wave\) \|\| getBossTypeForWave\(wave\)/);
assert.match(main, /runtimeHealthV148: game\.runtimeHealthV148\?\.diagnostics/);
assert.match(main, /runtimeErrors: \[\.\.\.\(game\.runtimeErrors \|\| \[\]\)\]/);


const enemyMaterial = read('src/runtime/enemy-body-material-v151.js');
const premium = read('src/premium-assets.js');
assert.match(enemyMaterial, /resolveEnemyBodyMaterialsV151/);
assert.match(enemyMaterial, /first-renderable:/);
assert.match(enemyMaterial, /Array\.isArray\(object\?\.material\)/);
assert.doesNotMatch(main, /enemy\.group\.userData\.body\.material/);
assert.match(premium, /resolveEnemyBodyMaterialsV151\(group\)/);

const runner = read('scripts/run-release-assurance-v146.mjs');
const chain = read('scripts/verify-dist-chain-v140.mjs');
const distGate = read('scripts/verify-dist-v146.mjs');
const workflow = read('.github/workflows/deploy.yml');
assert.match(chain, /verify-ci-source-revision-v151\.mjs/);
assert.match(distGate, /verify-ci-source-revision-v151\.mjs/);
assert.match(workflow, /verify-ci-source-revision-v151\.mjs/);
assert.match(runner, /DD-V151-ENEMY-MATERIAL-R6/);
assert.match(runner, /runtimeErrorEntries/);
assert.match(runner, /runtimeHealth/);
assert.match(runner, /exceptions:diagnostics\.exceptions\.slice\(-12\)/);

console.log('PASS v1.0.51 long-session hotfix: deterministic boss load phases, per-record presentation fail-open, and actionable runtime diagnostics');
