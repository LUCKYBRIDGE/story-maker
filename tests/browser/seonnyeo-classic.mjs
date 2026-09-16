import assert from 'node:assert/strict';
import { launchBrowser } from './support/runtime.mjs';
const output = process.env.QA_OUTPUT || '/tmp/seonnyeo-classic-browser';
const url = process.env.QA_URL.replace(/\/?$/, '/');
const browser = await launchBrowser(output);
try {
  for (const [width, height] of [[1365,900], [820,1180], [390,844]]) {
    const page = await browser.newPage({ viewport: { width, height }, reducedMotion: 'reduce' });
    await page.goto(url);
    await page.getByRole('button', { name: '서재 입장', exact: true }).click();
    await page.getByRole('button', { name: '선녀와 나무꾼 · 기본 이야기', exact: true }).click();
    const entry = page.getByRole('button', { name: '선녀와 나무꾼 원작 읽기', exact: true });
    await entry.waitFor();
    assert.match(await page.locator('.focus-availability').innerText(), /이용 가능/);
    await entry.focus();
    await page.keyboard.press('Enter');
    await page.waitForURL(/\/classic\/seonnyeo(?:\.html)?\/?$/);
    await page.locator('.book-play-entry').waitFor();
    await page.screenshot({ path: `${output}/${width}-cover.png`, fullPage: true });
    await page.getByRole('button', { name: '이야기 펼치기', exact: true }).click();
    await page.locator('.player-shell').waitFor();
    for (let cut = 1; cut <= 83; cut++) {
      await page.locator('.reader-story-info small').filter({ hasText: new RegExp(`^${cut} / 83$`) }).waitFor({ state: 'attached' });
      await page.waitForFunction(() => [...document.querySelectorAll('.story-stage img')].every(i => i.complete && i.naturalWidth > 0));
      await page.locator('.story-stage img').evaluateAll(images => Promise.all(images.map(image => image.decode())));
      await page.waitForFunction(() => [...document.querySelectorAll('.story-stage-actor')].every(i => i.dataset.layoutReady === 'true'));
      // Decoding and layout readiness precede the browser's painted frame.
      await page.waitForTimeout(200);
      const required = { 17: 'woodcutter-holding-robe', 26: 'fairy-holding-first-baby', 36: 'fairy-carrying-children', 49: 'heavenly-bucket', 50: 'woodcutter-in-bucket', 57: 'celestial-horse', 64: 'woodcutter-riding-horse', 71: 'mother-offering-porridge', 73: 'horse-startled-by-porridge', 75: 'woodcutter-fallen', 76: 'celestial-horse-departing', 79: 'woodcutter-aged', 83: 'rooster-calling-sky' }[cut];
      if (required) assert.equal(await page.locator(`.story-stage-actor[src*="classic-${required}.webp"]`).count(), 1, `${width}: cut ${cut} expected current artwork`);
      assert.equal(await page.locator('.story-stage-missing,.story-stage-background-error').count(), 0);
      const layout = await page.evaluate(() => {
        const text = document.querySelector('.dialogue-box');
        return { overflow: document.documentElement.scrollWidth > innerWidth, clipped: text.scrollHeight > text.clientHeight + 1 };
      });
      assert.equal(layout.overflow, false, `${width}: cut ${cut} page overflow`);
      assert.equal(layout.clipped, false, `${width}: cut ${cut} clipped text`);
      if ([1, 4, 6, 16, 17, 21, 26, 27, 32, 35, 36, 48, 49, 50, 52, 54, 57, 61, 64, 71, 73, 75, 76, 79, 83].includes(cut)) await page.screenshot({ path: `${output}/${width}-${cut}.png`, fullPage: true });
      if (cut < 83) await page.getByRole('button', { name: '다음 컷', exact: true }).click();
    }
    assert.match(await page.locator('.current-reading').innerText(), /꼬끼오/);
    assert.ok(await page.getByRole('button', { name: '다음 컷', exact: true }).isDisabled());
    await page.getByRole('button', { name: '이전', exact: true }).click();
    await page.locator('.reader-story-info small').filter({ hasText: /^82 \/ 83$/ }).waitFor({ state: 'attached' });
    await page.getByRole('button', { name: '돌아가기', exact: true }).click();
    await page.getByRole('button', { name: '서재로 돌아가기', exact: true }).click();
    await page.locator('.library-shelf').waitFor();
    const dialog = page.getByRole('dialog');
    if (!await dialog.isVisible()) await page.getByRole('button', { name: '선녀와 나무꾼 · 기본 이야기', exact: true }).click();
    await page.getByRole('button', { name: '선녀와 나무꾼 원작 읽기', exact: true }).click();
    // 서재에서 재진입하면 표지에서 저장된 책갈피를 제시한다.
    await page.getByRole('button', { name: '이야기 펼치기', exact: true }).click();
    await page.getByRole('button', { name: '이어읽기 (82번째 컷)', exact: true }).click();
    await page.locator('.player-shell').waitFor();
    await page.locator('.reader-story-info small').filter({ hasText: /^82 \/ 83$/ }).waitFor({ state: 'attached' });
    // 새 탭은 표지에서 시작하고 기기에 저장된 책갈피로 이어읽는다.
    const reopened = await browser.newPage({ viewport: { width, height }, reducedMotion: "reduce", storageState: await page.context().storageState() });
    const errors = [];
    reopened.on('pageerror', error => errors.push(error.message));
    await reopened.goto(page.url());
    await reopened.getByRole('button', { name: '이야기 펼치기', exact: true }).click();
    await reopened.getByRole('button', { name: '이어읽기 (82번째 컷)', exact: true }).click();
    await reopened.locator('.player-shell').waitFor();
    await reopened.locator('.reader-story-info small').filter({ hasText: /^82 \/ 83$/ }).waitFor({ state: 'attached' });
    await reopened.getByRole('button', { name: '다음 컷', exact: true }).click();
    assert.match(await reopened.locator('.current-reading').innerText(), /꼬끼오/);
    assert.deepEqual(errors, []);
    await reopened.close();
    await page.close();
  }
  console.log('PASS: Seonnyeo classic library entry, 83 cuts × 3 viewports, images/text, previous/next, resume, library return');
} finally { await browser.close(); }
