import assert from 'node:assert/strict';
import test from 'node:test';
import { generateQrSvgData, QrCodeEcc } from '../app/story-qr-code.ts';

test('qr-code: generates valid SVG path data for short and long URLs', () => {
  const shortResult = generateQrSvgData('http://localhost:3000/');
  assert.ok(shortResult.size > 21, 'QR code size must exceed minimal 21 modules + border');
  assert.equal(shortResult.viewBox, `0 0 ${shortResult.size} ${shortResult.size}`);
  assert.ok(shortResult.path.startsWith('M'), 'SVG path must start with M');
  assert.ok(shortResult.path.includes('h1v1h-1z'), 'SVG path must contain module squares');

  const prodResult = generateQrSvgData('https://story-maker.pages.dev');
  assert.ok(prodResult.size >= shortResult.size, 'Longer URL produces equal or larger version');
  assert.equal(prodResult.viewBox, `0 0 ${prodResult.size} ${prodResult.size}`);

  const longResult = generateQrSvgData('https://ae42b7f2.story-maker-5b1.pages.dev/classroom/session-1234?mode=preview');
  assert.ok(longResult.size >= prodResult.size);
  assert.ok(longResult.path.length > 2000, 'Path length must contain sufficient dark modules');
});

test('qr-code: respects quiet zone border parameter', () => {
  const border0 = generateQrSvgData('https://story-maker.pages.dev', 0);
  const border4 = generateQrSvgData('https://story-maker.pages.dev', 4);
  const border10 = generateQrSvgData('https://story-maker.pages.dev', 10);

  assert.equal(border4.size, border0.size + 8);
  assert.equal(border10.size, border0.size + 20);
});

test('qr-code: Ecc levels are distinct and correctly ordered', () => {
  assert.equal(QrCodeEcc.LOW.ordinal, 0);
  assert.equal(QrCodeEcc.MEDIUM.ordinal, 1);
  assert.equal(QrCodeEcc.QUARTILE.ordinal, 2);
  assert.equal(QrCodeEcc.HIGH.ordinal, 3);
});
