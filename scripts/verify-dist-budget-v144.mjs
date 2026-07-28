import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const root = path.resolve(import.meta.dirname, '..');
const dist = process.env.DIST_DIR ? path.resolve(process.env.DIST_DIR) : path.join(root, 'dist');
const allowStatic = process.argv.includes('--allow-static');
const configPath = path.join(root, 'docs/DIST_BUDGETS_v1.0.44.json');
const reportPath = path.join(root, 'logs/qa/v144/dist-budget-report.json');
const posix = (value) => value.split(path.sep).join('/');

if (!fs.existsSync(path.join(dist, 'index.html'))) throw new Error('v144 budget: dist/index.html missing');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const version = JSON.parse(fs.readFileSync(path.join(dist, 'version.json'), 'utf8'));
const index = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');

const walk = (dir, out = []) => {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
};
const allFiles = walk(dist);
const jsFiles = allFiles.filter((file) => file.endsWith('.js'));
const cssFiles = allFiles.filter((file) => file.endsWith('.css'));
const viteEntry = jsFiles.find((file) => posix(path.relative(dist, file)) === 'assets/game.js');
const viteCss = cssFiles.find((file) => posix(path.relative(dist, file)) === 'assets/game.css');
if ((!viteEntry || !viteCss) && !allowStatic) {
  throw new Error('v144 budget requires the complete Vite dist (assets/game.js and assets/game.css)');
}

const cleanRef = (value) => decodeURIComponent(value.split(/[?#]/, 1)[0]).replace(/^https?:\/\/[^/]+/i, '');
const resolveRef = (sourceFile, raw) => {
  const clean = cleanRef(raw);
  const candidates = [];
  if (clean.startsWith('/')) {
    const segments = clean.replace(/^\/+/, '').split('/');
    for (let index = 0; index < Math.min(segments.length, 4); index += 1) {
      candidates.push(path.join(dist, ...segments.slice(index)));
    }
  } else {
    candidates.push(path.resolve(path.dirname(sourceFile), clean));
    candidates.push(path.join(dist, clean.replace(/^\.\//, '')));
  }
  return candidates.find((file) => file.startsWith(dist) && fs.existsSync(file) && fs.statSync(file).isFile()) || null;
};

const htmlRefs = [];
for (const pattern of [/<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi, /<link\b[^>]*\bhref=["']([^"']+)["'][^>]*>/gi]) {
  let match;
  while ((match = pattern.exec(index))) {
    if (/\.(?:js|css)(?:[?#]|$)/i.test(match[1])) htmlRefs.push(match[1]);
  }
}
const initial = new Set();
const pending = htmlRefs.map((ref) => resolveRef(path.join(dist, 'index.html'), ref)).filter(Boolean);
const importPatterns = [
  /(?:from\s*|import\s*)["']([^"']+\.js(?:[?#][^"']*)?)["']/g,
  /@import\s+(?:url\()?\s*["']?([^"')]+\.css(?:[?#][^"')]+)?)['"]?\s*\)?/g
];
while (pending.length) {
  const file = pending.pop();
  if (!file || initial.has(file)) continue;
  initial.add(file);
  if (!/\.(?:js|css)$/.test(file)) continue;
  const text = fs.readFileSync(file, 'utf8');
  for (const pattern of importPatterns) {
    pattern.lastIndex = 0;
    let match;
    while ((match = pattern.exec(text))) {
      const resolved = resolveRef(file, match[1]);
      if (resolved && !initial.has(resolved)) pending.push(resolved);
    }
  }
}

const sizeRecord = (files) => ({
  count: files.length,
  rawBytes: files.reduce((sum, file) => sum + fs.statSync(file).size, 0),
  gzipBytes: files.reduce((sum, file) => sum + zlib.gzipSync(fs.readFileSync(file), { level: 9 }).length, 0),
  files: files.map((file) => ({ path: posix(path.relative(dist, file)), bytes: fs.statSync(file).size }))
});
const initialJs = [...initial].filter((file) => file.endsWith('.js'));
const initialCss = [...initial].filter((file) => file.endsWith('.css'));

function imageDimensions(buffer, extension) {
  const ext = extension.toLowerCase();
  if (ext === '.png' && buffer.length >= 24 && buffer.toString('ascii', 1, 4) === 'PNG') {
    return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
  }
  if ((ext === '.jpg' || ext === '.jpeg') && buffer[0] === 0xff && buffer[1] === 0xd8) {
    let offset = 2;
    while (offset + 9 < buffer.length) {
      if (buffer[offset] !== 0xff) { offset += 1; continue; }
      const marker = buffer[offset + 1];
      const length = buffer.readUInt16BE(offset + 2);
      if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)) {
        return { height: buffer.readUInt16BE(offset + 5), width: buffer.readUInt16BE(offset + 7) };
      }
      if (length < 2) break;
      offset += 2 + length;
    }
  }
  if (ext === '.webp' && buffer.length >= 30 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') {
    const kind = buffer.toString('ascii', 12, 16);
    if (kind === 'VP8X') {
      return {
        width: 1 + buffer.readUIntLE(24, 3),
        height: 1 + buffer.readUIntLE(27, 3)
      };
    }
    if (kind === 'VP8L' && buffer[20] === 0x2f) {
      const b0 = buffer[21], b1 = buffer[22], b2 = buffer[23], b3 = buffer[24];
      return {
        width: 1 + b0 + ((b1 & 0x3f) << 8),
        height: 1 + (b1 >> 6) + (b2 << 2) + ((b3 & 0x0f) << 10)
      };
    }
    if (kind === 'VP8 ') {
      for (let offset = 20; offset + 9 < buffer.length; offset += 1) {
        if (buffer[offset] === 0x9d && buffer[offset + 1] === 0x01 && buffer[offset + 2] === 0x2a) {
          return {
            width: buffer.readUInt16LE(offset + 3) & 0x3fff,
            height: buffer.readUInt16LE(offset + 5) & 0x3fff
          };
        }
      }
    }
  }
  return null;
}

const initialTextFiles = [path.join(dist, 'index.html'), ...initialJs, ...initialCss];
const imagePattern = /["'`(=:\s]((?:\.?\.?\/|\/)?[^"'`()\s]+?\.(?:png|webp|jpe?g|avif))(?:[?#][^"'`()\s]*)?/gi;
const textureFiles = new Set();
for (const sourceFile of initialTextFiles) {
  const text = fs.readFileSync(sourceFile, 'utf8');
  imagePattern.lastIndex = 0;
  let match;
  while ((match = imagePattern.exec(text))) {
    const resolved = resolveRef(sourceFile, match[1]);
    if (resolved) textureFiles.add(resolved);
  }
}
const textures = [...textureFiles].map((file) => {
  const data = fs.readFileSync(file);
  const dimensions = imageDimensions(data, path.extname(file));
  return {
    path: posix(path.relative(dist, file)),
    bytes: data.length,
    width: dimensions?.width || null,
    height: dimensions?.height || null,
    estimatedUploadBytes: dimensions ? dimensions.width * dimensions.height * 4 : null
  };
}).sort((a, b) => a.path.localeCompare(b.path));

const report = {
  id: 'DD-DIST-BUDGET-V144',
  releaseVersion: version.releaseVersion,
  buildId: version.buildId,
  buildKind: viteEntry && viteCss ? 'vite' : 'static-fallback',
  totals: {
    js: sizeRecord(jsFiles),
    css: sizeRecord(cssFiles)
  },
  initial: {
    requests: initial.size,
    js: sizeRecord(initialJs),
    css: sizeRecord(initialCss),
    textures: {
      count: textures.length,
      knownDimensions: textures.filter((item) => item.estimatedUploadBytes !== null).length,
      unknownDimensions: textures.filter((item) => item.estimatedUploadBytes === null).length,
      estimatedUploadBytes: textures.reduce((sum, item) => sum + (item.estimatedUploadBytes || 0), 0),
      files: textures
    }
  },
  thresholds: config.thresholds
};

const checks = {
  jsChunks: [report.totals.js.count, config.thresholds.maxJsChunks],
  initialRequests: [report.initial.requests, config.thresholds.maxInitialRequests],
  initialJsRawBytes: [report.initial.js.rawBytes, config.thresholds.maxInitialJsRawBytes],
  initialJsGzipBytes: [report.initial.js.gzipBytes, config.thresholds.maxInitialJsGzipBytes],
  initialCssRawBytes: [report.initial.css.rawBytes, config.thresholds.maxInitialCssRawBytes],
  initialCssGzipBytes: [report.initial.css.gzipBytes, config.thresholds.maxInitialCssGzipBytes],
  initialTextureCount: [report.initial.textures.count, config.thresholds.maxInitialTextureCount],
  initialTextureUploadBytes: [report.initial.textures.estimatedUploadBytes, config.thresholds.maxInitialTextureUploadBytes],
  unknownTextureDimensions: [report.initial.textures.unknownDimensions, config.thresholds.maxUnknownTextureDimensions],
  largestJsChunkBytes: [Math.max(0, ...jsFiles.map((file) => fs.statSync(file).size)), config.thresholds.maxSingleJsChunkRawBytes]
};
report.checks = Object.fromEntries(Object.entries(checks).map(([name, [actual, maximum]]) => [name, { actual, maximum, pass: actual <= maximum }]));

fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
const failures = Object.entries(report.checks).filter(([, value]) => !value.pass);
if (failures.length) {
  for (const [name, value] of failures) console.error(`FAIL v144 dist budget ${name}: ${value.actual} > ${value.maximum}`);
  process.exit(1);
}
console.log(`PASS v1.0.44 dist budgets (${report.totals.js.count} JS, initial gzip ${report.initial.js.gzipBytes} JS + ${report.initial.css.gzipBytes} CSS, ${report.initial.textures.estimatedUploadBytes} texture bytes)`);
