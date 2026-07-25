import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

export async function listJavaScriptFilesRecursive(directory) {
  const output = [];
  async function walk(current) {
    for (const entry of await readdir(current, { withFileTypes: true })) {
      const absolute = path.join(current, entry.name);
      if (entry.isDirectory()) await walk(absolute);
      else if (entry.isFile() && entry.name.endsWith('.js')) output.push(absolute);
    }
  }
  await walk(directory);
  return output;
}

export async function readJavaScriptBundleRecursive(directory) {
  const files = await listJavaScriptFilesRecursive(directory);
  return { files, source: (await Promise.all(files.map((file) => readFile(file, 'utf8')))).join('\n') };
}

export function hasApprovalRuntimeMarkerV117(source = '') {
  return [
    'DD-ASSET-APPROVAL-RUNTIME-V117',
    'DD-ASSET-APPROVAL-PIPELINE-V117',
    '__DOKKAEBI_ART_APPROVAL_V117__'
  ].some((marker) => source.includes(marker));
}
