import { launchBrowser } from './support/runtime.mjs';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';

const output = process.env.QA_OUTPUT || '/Users/baekjiyun/.gemini/antigravity/brain/c387f34b-7a33-4ba4-a03c-d781ce92850e';
await mkdir(output, { recursive: true });
const browser = await launchBrowser(output);

try {
  // 1. Desktop Start Screen (1440x900)
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(process.env.QA_URL || 'http://localhost:3000');
  await page.locator('.nolstory-poster-frame').waitFor({ state: 'attached' });

  // Check QR button on StartScreen
  const qrBtn = page.locator('.poster-qr-btn');
  await qrBtn.waitFor({ state: 'visible' });
  await page.screenshot({ path: `${output}/qr-start-desktop-before.png` });

  // Click QR button to open modal
  await qrBtn.click();
  const modal = page.locator('.qr-modal-dialog');
  await modal.waitFor({ state: 'visible' });
  const qrSvg = modal.locator('.qr-code-svg');
  await qrSvg.waitFor({ state: 'visible' });

  // Verify modal elements
  const title = await modal.locator('.qr-modal-title').textContent();
  assert.equal(title, '교실 화면 바로 접속');
  const url = await modal.locator('.qr-url-text').textContent();
  assert.ok(url.includes('localhost:3000') || url.includes('pages.dev'), `URL must be accurate: ${url}`);

  await page.screenshot({ path: `${output}/qr-start-desktop-modal.png` });

  // Close modal via close button
  await modal.locator('.btn-modal-close').click();
  await modal.waitFor({ state: 'hidden' });

  // 2. Mobile Start Screen (390x844)
  await page.setViewportSize({ width: 390, height: 844 });
  await qrBtn.click();
  await modal.waitFor({ state: 'visible' });
  await page.screenshot({ path: `${output}/qr-start-mobile-modal.png` });
  await modal.locator('.qr-modal-confirm-btn').click();
  await modal.waitFor({ state: 'hidden' });

  // 3. Library Screen (1440x900)
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.locator('.poster-library').click();
  await page.locator('.library-shelf').waitFor({ state: 'visible' });

  // Check QR button on Library screen
  const libQrBtn = page.locator('.library-btn-qr');
  await libQrBtn.waitFor({ state: 'visible' });
  await page.screenshot({ path: `${output}/qr-library-desktop-before.png` });

  // Click library QR button
  await libQrBtn.click();
  await modal.waitFor({ state: 'visible' });
  await page.screenshot({ path: `${output}/qr-library-desktop-modal.png` });

  // Close modal
  await modal.locator('.btn-modal-close').click();
  await modal.waitFor({ state: 'hidden' });

  // 4. Mobile Library Screen (390x844)
  await page.setViewportSize({ width: 390, height: 844 });
  await libQrBtn.click();
  await modal.waitFor({ state: 'visible' });
  await page.screenshot({ path: `${output}/qr-library-mobile-modal.png` });
  await modal.locator('.qr-modal-confirm-btn').click();
  await modal.waitFor({ state: 'hidden' });

  console.log('All QR browser interactions passed successfully!');
} finally {
  await browser.close();
}
