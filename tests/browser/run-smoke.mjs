import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { readFile, mkdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';

const output = path.resolve(process.env.QA_OUTPUT || 'outputs/browser-smoke');
await mkdir(output, { recursive: true });
const root = path.resolve('out');
const prefix = '/story-maker';
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.ico': 'image/x-icon' };
let server;
let url = process.env.QA_URL;
if (!url) {
  // Test the real static artifact under the production GitHub Pages mount.
  await stat(path.join(root, 'index.html'));
  server = createServer(async (req, res) => {
    try {
      const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
      if (pathname !== prefix && !pathname.startsWith(`${prefix}/`)) throw new Error('outside mount');
      let file = path.resolve(root, `.${pathname.slice(prefix.length) || '/'}`);
      if (file !== root && !file.startsWith(`${root}${path.sep}`)) throw new Error('outside root');
      if ((await stat(file)).isDirectory()) file = path.join(file, 'index.html');
      res.setHeader('Content-Type', mime[path.extname(file)] || 'application/octet-stream');
      res.end(await readFile(file));
    } catch { res.writeHead(404); res.end('Not found'); }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  url = `http://127.0.0.1:${server.address().port}${prefix}/`;
}
const suites = process.env.QA_SUITES?.split(',') || ['start-screen', 'story-flow', 'sticky-memos', 'pinky-examples', 'library-home'];
const allowed = new Set(['library-home', 'start-screen', 'story-flow', 'sticky-memos', 'pinky-examples', 'mobile-input', 'sheet-import']);
const results = [];
try {
  assert.equal((await fetch(url, { signal: AbortSignal.timeout(10_000) })).status, 200);
  for (const suite of suites) {
    assert.ok(allowed.has(suite), `Unknown QA suite: ${suite}`);
    const suiteOutput = path.join(output, suite);
    await mkdir(suiteOutput, { recursive: true });
    const started = Date.now();
    let log = '';
    const code = await new Promise((resolve, reject) => {
      const child = spawn(process.execPath, [`tests/browser/${suite}.mjs`], {
        env: { ...process.env, QA_URL: url, QA_OUTPUT: suiteOutput,
          QA_VIEWPORTS: process.env.QA_VIEWPORTS || '[[1365,900],[390,844]]' },
        stdio: ['ignore', 'pipe', 'pipe'],
      });
      let timedOut = false;
      const timer = setTimeout(() => { timedOut = true; child.kill('SIGTERM'); }, 300_000);
      for (const stream of [child.stdout, child.stderr]) stream.on('data', data => { log += data; process.stdout.write(data); });
      child.on('error', error => { clearTimeout(timer); reject(error); });
      child.on('close', code => { clearTimeout(timer); resolve(timedOut ? 'timeout' : code); });
    });
    await writeFile(path.join(suiteOutput, 'run.log'), log);
    results.push({ suite, code, seconds: (Date.now() - started) / 1000 });
    await writeFile(path.join(output, 'results.json'), JSON.stringify(results, null, 2));
    assert.equal(code, 0, `${suite} failed; see ${suiteOutput}`);
  }
} finally { if (server) await new Promise(resolve => server.close(resolve)); }
console.log(results);
