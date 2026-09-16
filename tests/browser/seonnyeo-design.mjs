import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { launchBrowser } from './support/runtime.mjs';
const output = process.env.QA_OUTPUT || '/tmp/seonnyeo-design';
await mkdir(output, { recursive: true });
const browser = await launchBrowser(output);
const results = [];
try {
  for (const [width, height] of [[320,740],[390,844],[820,1180],[1365,900]]) {
    const page = await browser.newPage({ viewport: { width, height }, reducedMotion: 'reduce' });
    await page.goto(process.env.QA_URL || 'http://localhost:3001');
    await page.locator('.poster-heading h2').waitFor();
    for (const title of ['선녀와 나무꾼', '별주부전', '옹고집전', '선녀와 나무꾼']) {
      const toggle = page.getByRole('button', { name: `다른 이야기 표지로 바꾸기 (${title})`, exact: true });
      await toggle.focus();
      await page.keyboard.press('Enter');
      await page.waitForFunction(title => document.querySelector('.poster-heading h2').textContent === title, title);
      await page.locator('.nolstory-poster-img').evaluate(img => img.decode());
    }
    assert.ok(await page.locator('.nolstory-poster-img').getAttribute('src').then(src => src.includes('seonnyeo.poster.art')));
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    assert.ok(await page.locator('.poster-heading h2').evaluate(el => el.scrollWidth <= el.clientWidth));
    assert.equal(await page.locator('.nolstory-poster-img').evaluate(el => getComputedStyle(el).objectFit), 'cover');
    const framing = await page.locator('.nolstory-poster-img').evaluate(img => {
      const box = img.getBoundingClientRect();
      const scale = Math.max(box.width / img.naturalWidth, box.height / img.naturalHeight);
      const w = img.naturalWidth * scale, h = img.naturalHeight * scale;
      const x = (box.width - w) * .5, y = (box.height - h) * .25;
      // The two figures occupy x=12..84%, y=19..88% in the approved illustration.
      return { fills: w >= box.width && h >= box.height,
        figuresInside: x + w * .12 >= 0 && x + w * .84 <= box.width && y + h * .19 >= 0 && y + h * .88 <= box.height };
    });
    assert.ok(framing.fills && framing.figuresInside, `poster framing at ${width}`);
    await page.screenshot({ path: `${output}/poster-${width}.png`, fullPage: true });
    await page.getByRole('button', { name: '이야기 읽기', exact: true }).click();
    await page.locator('.book-play-entry .student-book-title').filter({ hasText: '선녀와 나무꾼' }).waitFor();
    await page.locator('.book-play-entry .book-art img').evaluate(img => img.decode());
    assert.equal(await page.locator('.book-play-entry .story-stage-background').getAttribute('data-asset-id'), 'seonnyeo.background.poster-art');
    assert.equal(await page.locator('.book-play-entry .story-stage-background').getAttribute('data-fit'), 'contain');
    await page.screenshot({ path: `${output}/reader-${width}.png`, fullPage: true });
    await page.getByRole('button', { name: '이야기 펼치기', exact: true }).click();
    await page.locator('.player-shell').waitFor();
    // A fresh tab after first visit opens the library, independent of playback state.
    const library = await browser.newPage({ viewport: { width, height }, reducedMotion: 'reduce', storageState: await page.context().storageState() });
    await library.goto(process.env.QA_URL || 'http://localhost:3001');
    await library.locator('.library-shelf').waitFor();
    const book = library.getByRole('button', { name: '선녀와 나무꾼 · 기본 이야기', exact: true });
    await book.locator('.book-art img').evaluate(img => img.decode());
    assert.equal(await book.locator('.story-stage-background').getAttribute('data-asset-id'), 'seonnyeo.background.poster-art');
    await library.screenshot({ path: `${output}/library-${width}.png`, fullPage: true });
    await book.click();
    await library.getByRole('dialog', { name: '선녀와 나무꾼', exact: true }).waitFor();
    await library.screenshot({ path: `${output}/book-${width}.png`, fullPage: true });
    await library.getByRole('button', { name: '복제해서 만들기', exact: true }).click();
    await library.locator('.creator-shell').waitFor();
    assert.ok(await library.evaluate(() => Object.values(localStorage).some(value => value.includes('seonnyeo.background.poster-art'))));
    assert.ok(await library.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await library.close();
    await page.close();
    results.push({ width, height, cycle: 'pass', reading: 'pass', library: 'pass', editableCopy: 'pass', overflow: 0 });
  }
  await writeFile(`${output}/results.json`, JSON.stringify(results, null, 2));
  console.log(results);
} finally { await browser.close(); }
