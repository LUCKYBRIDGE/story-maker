import assert from 'node:assert/strict';
import { launchBrowser } from './support/runtime.mjs';

const output = process.env.QA_OUTPUT || '/tmp/classic-reading-qa';
const url = process.env.QA_URL || 'http://localhost:3003';
const browser = await launchBrowser(output);

try {
  const page = await browser.newPage({ viewport: { width: 1365, height: 900 }, reducedMotion: 'reduce' });
  await page.goto(url);
  await page.locator('.nolstory-poster-frame').waitFor();
  await page.getByRole('button', { name: '서재 입장', exact: true }).click();
  await page.locator('.library-shelf').waitFor();

  await page.getByRole('button', { name: '토끼와 자라 · 기본 이야기', exact: true }).click();
  let dialog = page.getByRole('dialog');
  await dialog.waitFor();

  let classicButton = page.getByRole('button', { name: '토끼전 원작 읽기', exact: true });
  await classicButton.waitFor({ state: 'visible' });
  assert.equal(
    (await dialog.locator('.focus-availability').textContent())?.trim(),
    '원작 읽기 · 이용 가능',
  );
  assert.equal(await classicButton.locator('.action-card-title').textContent(), '원작 읽기');
  await page.screenshot({ path: `${output}/library-rabbit-classic-entry.png`, fullPage: true });

  await classicButton.click();
  await page.waitForURL(/\/classic\/rabbit(?:\.html)?\/?$/);
  await page.locator('.book-play-entry').waitFor();
  assert.ok((await page.locator('.student-book').innerText()).includes('토끼전'));

  await page.getByRole('button', { name: '이야기 펼치기', exact: true }).click();
  await page.locator('.player-shell').waitFor();
  assert.ok((await page.locator('.current-reading').innerText()).includes('아주 먼 옛날'));
  await page.screenshot({ path: `${output}/classic-reader-first-cut.png`, fullPage: true });

  await page.goto(url);
  await page.locator('.nolstory-poster-frame').waitFor();
  await page.getByRole('button', { name: '서재 입장', exact: true }).click();
  await page.locator('.library-shelf').waitFor();
  await page.getByRole('button', { name: '옹고집전 · 기본 이야기', exact: true }).click();
  dialog = page.getByRole('dialog');
  await dialog.waitFor();

  classicButton = page.getByRole('button', { name: '옹고집전 원작 읽기', exact: true });
  await classicButton.waitFor({ state: 'visible' });
  assert.equal(
    (await dialog.locator('.focus-availability').textContent())?.trim(),
    '원작 읽기 · 이용 가능',
  );
  assert.equal(await classicButton.locator('.action-card-title').textContent(), '원작 읽기');
  await page.screenshot({ path: `${output}/library-onggojib-classic-entry.png`, fullPage: true });

  await classicButton.click();
  await page.waitForURL(/\/classic\/onggojib(?:\.html)?\/?$/);
  await page.locator('.book-play-entry').waitFor();
  assert.ok((await page.locator('.student-book').innerText()).includes('옹고집전'));

  await page.getByRole('button', { name: '이야기 펼치기', exact: true }).click();
  await page.locator('.player-shell').waitFor();
  assert.ok((await page.locator('.current-reading').innerText()).includes('옛날 어느 고을'));
  await page.screenshot({ path: `${output}/classic-onggojib-first-cut.png`, fullPage: true });

  console.log({ rabbitEntryVisible: true, onggojibEntryVisible: true, routesOpened: true, firstCutsLoaded: true });
  await page.close();
} finally {
  await browser.close();
}
