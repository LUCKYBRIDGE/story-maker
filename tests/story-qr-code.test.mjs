import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import test from 'node:test';

function run(code) {
  return JSON.parse(execFileSync(process.execPath, [
    '--disable-warning=ExperimentalWarning',
    '--experimental-strip-types',
    '--input-type=module',
    '-e',
    `
    import { generateQrSvgData, QrCodeEcc } from './app/story-qr-code.ts';
    ${code}
    `
  ], { encoding: 'utf8' }));
}

test('qr-code: generates valid SVG path data for short and long URLs', () => {
  const r = run(`
    const shortResult = generateQrSvgData('http://localhost:3000/');
    const prodResult = generateQrSvgData('https://story-maker.pages.dev');
    const longResult = generateQrSvgData('https://ae42b7f2.story-maker-5b1.pages.dev/classroom/session-1234?mode=preview');
    console.log(JSON.stringify({
      shortSize: shortResult.size,
      shortViewBox: shortResult.viewBox,
      shortHasPath: shortResult.path.startsWith('M') && shortResult.path.includes('h1v1h-1z'),
      prodSize: prodResult.size,
      prodViewBox: prodResult.viewBox,
      longSize: longResult.size,
      longPathLen: longResult.path.length
    }));
  `);
  assert.ok(r.shortSize > 21);
  assert.equal(r.shortViewBox, `0 0 ${r.shortSize} ${r.shortSize}`);
  assert.ok(r.shortHasPath);
  assert.ok(r.prodSize >= r.shortSize);
  assert.equal(r.prodViewBox, `0 0 ${r.prodSize} ${r.prodSize}`);
  assert.ok(r.longSize >= r.prodSize);
  assert.ok(r.longPathLen > 2000);
});

test('qr-code: respects quiet zone border parameter', () => {
  const r = run(`
    const b0 = generateQrSvgData('https://story-maker.pages.dev', 0);
    const b4 = generateQrSvgData('https://story-maker.pages.dev', 4);
    const b10 = generateQrSvgData('https://story-maker.pages.dev', 10);
    console.log(JSON.stringify({ s0: b0.size, s4: b4.size, s10: b10.size }));
  `);
  assert.equal(r.s4, r.s0 + 8);
  assert.equal(r.s10, r.s0 + 20);
});

test('qr-code: Ecc levels are distinct and correctly ordered', () => {
  const r = run(`
    console.log(JSON.stringify({
      low: QrCodeEcc.LOW.ordinal,
      med: QrCodeEcc.MEDIUM.ordinal,
      qua: QrCodeEcc.QUARTILE.ordinal,
      hig: QrCodeEcc.HIGH.ordinal
    }));
  `);
  assert.deepEqual(r, { low: 0, med: 1, qua: 2, hig: 3 });
});
