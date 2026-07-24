import { createWriteStream } from 'node:fs';
import { spawn } from 'node:child_process';
import { getLogPath } from './output-paths.mjs';

const separator = process.argv.indexOf('--');
if (separator < 4 || separator === process.argv.length - 1) {
  console.error('Usage: node scripts/run-with-log.mjs <category> <filename> -- <command> [args...]');
  process.exit(2);
}
const category = process.argv[2];
const filename = process.argv[3];
const command = process.argv[separator + 1];
const args = process.argv.slice(separator + 2);
const output = getLogPath(category, filename);
const stream = createWriteStream(output, { flags: 'w' });
const child = spawn(command, args, { cwd: process.cwd(), env: process.env, shell: process.platform === 'win32' });

for (const source of [child.stdout, child.stderr]) {
  source.on('data', (chunk) => {
    process.stdout.write(chunk);
    stream.write(chunk);
  });
}
child.on('error', (error) => {
  const line = `Command launch failed: ${error.message}\n`;
  process.stderr.write(line); stream.write(line); stream.end(); process.exit(1);
});
child.on('close', (code) => {
  stream.end(() => {
    console.log(`LOG ${output}`);
    process.exit(code ?? 1);
  });
});
