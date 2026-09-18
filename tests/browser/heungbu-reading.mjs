import { openLibrary } from './support/library-entry.mjs';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, mkdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { launchBrowser } from './support/runtime.mjs';
import { analyzeExample } from '../helpers/example-graph.mjs';
import { getHeungbuProject } from '../../app/story-heungbu.ts';

const output = path.resolve(process.env.QA_OUTPUT || 'outputs/heungbu-qa');
await mkdir(output, { recursive: true });

const root = path.resolve('out');
const prefix = '/story-maker';
const mime = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.webp': 'image/webp', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.ico': 'image/x-icon'
};

await stat(path.join(root, 'index.html'));
const server = createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (pathname !== prefix && !pathname.startsWith(`${prefix}/`)) throw new Error('outside mount');
    let file = path.resolve(root, `.${pathname.slice(prefix.length) || '/'}`);
    if (file !== root && !file.startsWith(`${root}${path.sep}`)) throw new Error('outside root');
    if ((await stat(file)).isDirectory()) file = path.join(file, 'index.html');
    res.setHeader('Content-Type', mime[path.extname(file)] || 'application/octet-stream');
    res.end(await readFile(file));
  } catch {
    res.writeHead(404);
    res.end('Not found');
  }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const url = `http://127.0.0.1:${server.address().port}${prefix}/`;

const project = getHeungbuProject();
const graph = analyzeExample(project);
assert.equal(graph.routes.length, 4, 'Heungbu must have exactly 4 routes');
assert.equal(graph.endingRoutes.length, 2, 'Heungbu must have 2 ending targets');

const browser = await launchBrowser(output);
const results = [];

async function textVisible(page, text) {
  await page.waitForFunction(t => {
    const box = document.querySelector('.dialogue-box');
    return box && box.textContent && box.textContent.includes(t);
  }, text, { timeout: 10_000 });
}

async function waitForStageImages(page) {
  try {
    await page.waitForFunction(() => [...document.querySelectorAll('.story-stage-canvas img')].every(i => i.complete && i.naturalWidth > 0), { timeout: 3000 });
    await page.locator('.story-stage-canvas img').evaluateAll(images => Promise.all(images.map(image => image.decode())));
  } catch {}
  await page.waitForTimeout(150);
}

try {
  for (const [routeIndex, route] of graph.routes.entries()) {
    const [width, height] = routeIndex % 2 === 0 ? [1365, 900] : [390, 844];
    const page = await browser.newPage({ viewport: { width, height }, reducedMotion: 'reduce' });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));

    await page.goto(url);
    await openLibrary(page);

    const bookBtn = page.getByRole('button', { name: '흥부와 놀부 · 기본 이야기', exact: true });
    await bookBtn.waitFor({ state: 'visible' });
    await bookBtn.click();

    // In overlay, click read button
    const readBtn = page.getByRole('button', { name: '기본 작품 읽기', exact: true });
    await readBtn.waitFor({ state: 'visible' });
    await readBtn.click();

    // Opening book cover
    const openBtn = page.getByRole('button', { name: '이야기 펼치기', exact: true });
    await openBtn.waitFor({ state: 'visible' });
    await page.screenshot({ path: `${output}/route-${routeIndex}-cover.png` });
    await openBtn.click();

    await page.locator('.player-shell').waitFor();

    let choicesMade = 0;
    for (let i = 0; i < route.length; i++) {
      const step = route[i];
      const line = graph.byId.get(step.lineId);
      await textVisible(page, line.text);

      // Verify empty character asset state does not show missing/broken indicators
      const missingCount = await page.locator('.story-stage-missing').count();
      assert.equal(missingCount, 0, `Cut ${line.id} must not render .story-stage-missing`);
      const bgErrorCount = await page.locator('.story-stage-background-error').count();
      assert.equal(bgErrorCount, 0, `Cut ${line.id} must not render .story-stage-background-error`);

      // Capture screenshots at key dramatic moments
      if (i === 0) {
        await waitForStageImages(page);
        await page.screenshot({ path: `${output}/route-${routeIndex}-opening.png` });
      } else if (line.flow?.type === 'choice') {
        await waitForStageImages(page);
        await page.screenshot({ path: `${output}/route-${routeIndex}-choice-${choicesMade + 1}.png` });
      } else if (i === route.length - 1) {
        await waitForStageImages(page);
        await page.screenshot({ path: `${output}/route-${routeIndex}-ending.png` });
      } else if (routeIndex === 0 && line.id === 'scene-2-7') {
        await waitForStageImages(page);
        await page.screenshot({ path: `${output}/route-0-conflict-pleading-angry.png` });
      } else if (routeIndex === 0 && line.id === 'scene-4-10') {
        await waitForStageImages(page);
        await page.screenshot({ path: `${output}/route-0-heungbu-wife-worried.png` });
      } else if (routeIndex === 0 && line.id === 'scene-7-7') {
        await waitForStageImages(page);
        await page.screenshot({ path: `${output}/route-0-happy-treasure.png` });
      } else if (routeIndex === 0 && line.id === 'scene-10-12') {
        await waitForStageImages(page);
        await page.screenshot({ path: `${output}/route-0-nolbu-wife-shocked.png` });
      } else if (routeIndex === 0 && line.id === 'scene-10-17') {
        await waitForStageImages(page);
        await page.screenshot({ path: `${output}/route-0-nolbu-remorse.png` });
      }

      if (line.flow?.type === 'choice') {
        choicesMade++;
        assert.equal(await page.locator('.player-choices button').count(), line.flow.options.length);
        const chosenOption = line.flow.options[step.optionIndex];
        const optButton = page.getByRole('button', { name: chosenOption.label, exact: true });
        assert.ok(await optButton.isVisible(), `Option ${chosenOption.label} must be visible`);

        // Test choice selection, back navigation, and re-selection
        await optButton.click();
        const targetLine = graph.byId.get(step.target);
        await textVisible(page, targetLine.text);

        // Previous button to verify choice stability
        const prevButton = page.getByRole('button', { name: '이전', exact: true });
        await prevButton.click();
        await textVisible(page, line.text);

        // Re-click the chosen option to continue
        await page.getByRole('button', { name: chosenOption.label, exact: true }).click();
        await textVisible(page, targetLine.text);
      } else if (step.target !== null) {
        const nextButton = page.getByRole('button', { name: '다음 컷', exact: true });
        await nextButton.click();
      }
    }

    // Story ending verification
    const finishBtn = page.getByRole('button', { name: '공연 마치기', exact: true });
    await finishBtn.waitFor({ state: 'visible' });
    assert.ok(await page.getByRole('button', { name: '다음 컷', exact: true }).isDisabled());

    await page.screenshot({ path: `${output}/route-${routeIndex}-complete.png` });
    await finishBtn.click();

    // Back cover
    await page.getByRole('button', { name: '앞표지로', exact: true }).waitFor();
    await page.screenshot({ path: `${output}/route-${routeIndex}-backcover.png` });

    assert.deepEqual(errors, []);
    results.push({
      routeIndex,
      cuts: route.length,
      endingCut: route.at(-1).lineId,
      choicesMade,
      viewport: `${width}x${height}`
    });
    await page.close();
  }
  await writeFile(`${output}/results.json`, JSON.stringify(results, null, 2));
  console.log('QA Results:', JSON.stringify(results, null, 2));
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
