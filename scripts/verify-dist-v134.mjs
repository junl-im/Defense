import path from 'node:path';
import process from 'node:process';
import { verifyDistV134Foundation } from './lib/verify-dist-v134-foundation.mjs';

const root = process.cwd();
const dist = process.env.DIST_DIR ? path.resolve(process.env.DIST_DIR) : path.join(root, 'dist');
const result = verifyDistV134Foundation({ dist });
console.log(`PASS v1.0.34 ${result.mode} deployment foundation preserved under current release ${result.version.releaseVersion} / ${result.version.buildId}`);
