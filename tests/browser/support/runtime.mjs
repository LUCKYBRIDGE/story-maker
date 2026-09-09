import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

export const viewports = () => process.env.QA_VIEWPORTS
  ? JSON.parse(process.env.QA_VIEWPORTS) : [[1365, 900], [820, 1180], [390, 844]];

// Existing scripts can still use a local Playwright module or branded Chrome.
export async function launchBrowser(output) {
  const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
  const browser = await chromium.launch({
    headless: true,
    ...(process.env.QA_CHANNEL ? { channel: process.env.QA_CHANNEL } : {}),
  });
  await mkdir(output, { recursive: true });
  const pending = new Map();
  const newPage = browser.newPage.bind(browser);
  const close = browser.close.bind(browser);
  let index = 0;
  browser.newPage = async options => {
    const page = await newPage(options);
    page.setDefaultTimeout(15_000);
    page.setDefaultNavigationTimeout(30_000);
    const context = page.context();
    await context.tracing.start({ screenshots: true, snapshots: true, sources: true });
    const entry = { context, id: ++index, errors: [], pageErrors: [] };
    pending.set(page, entry);
    page.on('pageerror', error => { entry.errors.push(error.stack); entry.pageErrors.push(error.message); });
    page.on('console', message => {
      if (message.type() === 'error') entry.errors.push(message.text());
    });
    page.on('requestfailed', request => entry.errors.push(`${request.url()}: ${request.failure()?.errorText}`));
    const pageClose = page.close.bind(page);
    page.close = async () => {
      if (entry.pageErrors.length) throw new Error(`Browser runtime errors: ${entry.pageErrors.join("; ")}`);
      await context.tracing.stop();
      pending.delete(page);
      await pageClose();
    };
    return page;
  };
  browser.close = async () => {
    try {
      for (const [page, { context, id, errors }] of pending) {
        await page.screenshot({ path: path.join(output, `failure-${id}.png`), fullPage: true, timeout: 5000 }).catch(() => {});
        await writeFile(path.join(output, `failure-${id}.json`), JSON.stringify({ url: page.url(), errors }, null, 2));
        await context.tracing.stop({ path: path.join(output, `trace-${id}.zip`) }).catch(() => {});
      }
    } finally { await close(); }
  };
  process.once('SIGTERM', async () => { await browser.close(); process.exit(1); });
  return browser;
}
