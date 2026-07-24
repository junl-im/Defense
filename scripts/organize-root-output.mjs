import { resolve } from 'node:path';
import { organizeLegacyRootOutput } from './root-output-policy.mjs';

const root = resolve(import.meta.dirname, '..');
organizeLegacyRootOutput({ root });
