import assert from 'node:assert/strict';
import { launchBrowser } from './support/runtime.mjs';
import { openLibrary } from './support/library-entry.mjs';

const url = process.env.QA_URL || 'http://localhost:3000';
const output = process.env.QA_OUTPUT || '/tmp/creation-hub-qa';

const browser = await launchBrowser(output);

try {
  for (const [width, height] of [[1440, 900], [390, 844]]) {
    const page = await browser.newPage({ viewport: { width, height }, reducedMotion: 'reduce' });
    await page.goto(url);
    await openLibrary(page);

    // 1. Create a story via actual UI flow
    await page.getByRole('button', { name: '내 작품', exact: true }).click();
    await page.getByRole('button', { name: '빈 책 · 새 이야기 만들기', exact: true }).click();
    await page.getByRole('button', { name: /빈 이야기부터 만들기/ }).click();

    // In Studio editor, edit title and return to library
    await page.locator('.creator-shell').waitFor();
    await page.getByRole('button', { name: '서재로', exact: true }).click();
    await page.locator('.library-shelf').waitFor();

    // 2. Open CreationHub modal from toolbar
    const manageBtn = page.getByRole('button', { name: '창작 관리', exact: true });
    await manageBtn.click();

    // 3. Verify modal dialog and heading
    await page.locator('.creation-hub-modal-overlay').waitFor();
    const heading = page.getByRole('heading', { name: '창작 관리', exact: true });
    await heading.waitFor();
    assert.ok(await heading.evaluate(el => el === document.activeElement), 'heading receives focus');

    // 4. Verify mini book cover is rendered inside the project card
    const cardCover = page.locator('.creation-project-card .creation-card-cover .student-book');
    assert.ok(await cardCover.isVisible(), 'mini book cover rendered');

    // 5. Verify all buttons meet 44px+ touch requirements
    for (const btn of await page.locator('.creation-hub button:visible').all()) {
      const box = await btn.boundingBox();
      assert.ok(box.height >= 44 && box.width >= 44, `Button ${await btn.textContent()} touch target too small (${box.width}x${box.height})`);
    }

    // 6. Verify template download link exists
    const templateLink = page.getByRole('link', { name: /빈 Excel 양식 받기/ });
    assert.ok(await templateLink.isVisible(), 'template download link visible');
    assert.ok((await templateLink.getAttribute('href')).includes('놀퀴즈_스토리_템플릿.xlsx'), 'template download href accurate');

    // 7. Verify Google sheet label & input
    const sheetInput = page.getByLabel('공개 Google 시트 주소', { exact: true });
    assert.ok(await sheetInput.isVisible(), 'sheet input visible');

    // 8. Capture screenshot of CreationHub modal on top of library
    await page.screenshot({ path: `${output}/creation-modal-${width}.png`, fullPage: false });

    // 9. Close modal via "서재로" button
    const backBtn = page.getByRole('button', { name: '서재로', exact: true });
    await backBtn.click();
    await page.locator('.creation-hub-modal-overlay').waitFor({ state: 'detached' });
    assert.ok(await page.locator('.library-shelf').isVisible(), 'library shelf returned');

    // 10. Test shelf direct book interaction (FocusBook popup)
    await page.getByRole('button', { name: '내 작품', exact: true }).click();
    const localBook = page.locator('.shelf-book:not(.library-book-new)').first();
    assert.ok(await localBook.isVisible(), 'local book exists on shelf');
    await localBook.click();
    await page.locator('.library-focus-stage').waitFor();
    const manageToolBtn = page.getByRole('button', { name: 'Excel·복구 도구', exact: true });
    assert.ok(await manageToolBtn.isVisible(), 'Excel·복구 도구 button exists in shelf book popup');
    await page.screenshot({ path: `${output}/shelf-book-focus-${width}.png`, fullPage: false });
    await page.keyboard.press('Escape');

    await page.close();
  }

  console.log('CreationHub library integration tests passed successfully!');
} finally {
  await browser.close();
}
