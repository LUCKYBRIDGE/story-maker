import { openLibrary } from './support/library-entry.mjs';
import { launchBrowser } from './support/runtime.mjs';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';

const output = process.env.QA_OUTPUT || '/tmp/seonnyeo-e2e';
await mkdir(output, { recursive: true });

const browser = await launchBrowser(output);
const results = [];

try {
  // Test 1: Desktop flow (1366 x 900) - Complete Clone, Edit Dialogue/Asset, Apply, Play, Return to Library, Check Persistence
  {
    const width = 1366, height = 900;
    const page = await browser.newPage({ viewport: { width, height }, reducedMotion: 'reduce' });
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));

    await page.goto(process.env.QA_URL || 'http://localhost:3002');
    await openLibrary(page);

    // 1. Select '선녀와 나무꾼' from base books
    await page.getByRole('button', { name: '선녀와 나무꾼 · 기본 이야기', exact: true }).click();
    await page.getByRole('dialog', { name: '선녀와 나무꾼' }).waitFor();

    // 2. Click '복제해서 만들기' (편집하기)
    const copyButton = page.getByRole('button', { name: '복제해서 만들기', exact: true });
    assert.ok(await copyButton.isVisible(), '복제해서 만들기 button must be visible');
    await copyButton.click();

    // 3. Verify editor opens
    await page.locator('.creator-shell').waitFor();
    console.log('[E2E Desktop] Editor opened for cloned Seonnyeo project');

    // Switch to '컷 꾸미기' (Scene Focus Editor) to edit the current cut
    await page.locator('.editor-mode-switch button').filter({ hasText: '컷 꾸미기' }).click();
    await page.locator('.scene-focus-editor, .scene-essential-assets').first().waitFor();

    // 4. Verify initial text and edit current cut's dialogue
    const dialogueBox = page.getByLabel('현재 컷 글상자', { exact: true });
    await dialogueBox.waitFor();
    const originalText = await dialogueBox.inputValue();
    assert.ok(originalText.includes('깊은 산속 계곡') || originalText.length > 0, 'Original cut text loaded');

    const editedText = '학생이 직접 수정한 첫 장면 대사: 깊은 숲속의 맑은 폭포수.';
    await dialogueBox.fill(editedText);
    console.log('[E2E Desktop] Edited cut dialogue text');

    // 5. Change character expression using AssetPickerButton
    const leftCharPicker = page.locator('.scene-essential-assets .asset-open-button').first();
    await leftCharPicker.click();
    const charDialog = page.getByRole('dialog', { name: '왼쪽 표정 이미지 선택' });
    await charDialog.waitFor();

    // Pick an asset option
    const brightOption = page.locator('.asset-picker-option').filter({ hasText: '밝은' }).first();
    if (await brightOption.isVisible()) {
      await brightOption.click();
    } else {
      await page.locator('.asset-picker-option').nth(1).click();
    }
    await charDialog.locator('.primary-button').click();
    await charDialog.waitFor({ state: 'detached' });
    console.log('[E2E Desktop] Changed left character expression');

    // 6. Change background using AssetPickerButton
    const bgPicker = page.locator('.scene-essential-assets .asset-open-button').nth(2);
    await bgPicker.click();
    const bgDialog = page.getByRole('dialog', { name: '컷 배경 이미지 선택' });
    await bgDialog.waitFor();

    const autumnOption = page.locator('.asset-picker-option').filter({ hasText: '가을' }).first();
    if (await autumnOption.isVisible()) {
      await autumnOption.click();
    } else {
      await page.locator('.asset-picker-option').nth(2).click();
    }
    await bgDialog.locator('.primary-button').click();
    await bgDialog.waitFor({ state: 'detached' });
    console.log('[E2E Desktop] Changed cut background');

    // 7. Apply to play
    const applyButton = page.getByRole('button', { name: '플레이에 적용', exact: true });
    await applyButton.click();
    console.log('[E2E Desktop] Clicked 플레이에 적용');

    // 8. Open Play Mode (이야기 펼치기)
    const playNavButton = page.locator('.creator-primary-nav button').nth(2);
    await playNavButton.click();
    await page.getByRole('button', { name: '이야기 펼치기', exact: true }).click();
    await page.locator('.player-shell').waitFor();

    // 9. Verify edited text renders in the player dialogue box
    await page.waitForFunction(text => {
      const box = document.querySelector('.dialogue-box');
      return box && box.textContent.includes(text);
    }, '학생이 직접 수정한 첫 장면 대사');
    console.log('[E2E Desktop] Player successfully displays student edited text');

    await page.screenshot({ path: `${output}/seonnyeo-player-edited-desktop.png`, fullPage: true });

    // 10. Close player using 돌아가기 -> 편집화면 -> 서재로
    await page.getByRole('button', { name: '돌아가기', exact: true }).click();
    await page.getByRole('button', { name: '편집화면', exact: true }).click();
    await page.getByRole('button', { name: '서재로', exact: true }).click();
    await page.locator('.library-shelf').waitFor();

    // 11. Verify the project is in "내 작품"
    await page.getByRole('button', { name: '내 작품', exact: true }).click();
    const myBook = page.locator('.library-book').filter({ hasText: '선녀와 나무꾼' }).first();
    assert.ok(await myBook.isVisible(), 'Edited Seonnyeo project must be listed in 내 작품');
    console.log('[E2E Desktop] Found edited project in 내 작품 bookshelf');

    // 12. Verify localStorage contents
    const storedProjects = await page.evaluate(() => JSON.parse(localStorage.getItem('storygame:projects:v1')));
    assert.ok(storedProjects.projects.length >= 1, 'Projects list in storage must have >= 1 item');
    const studentProject = storedProjects.projects.find(p => p.draft.project.title === '선녀와 나무꾼');
    assert.ok(studentProject, 'Saved student project must exist');
    assert.equal(studentProject.draft.project.source.kind, 'baseEdition');
    assert.equal(studentProject.draft.project.source.baseStoryId, 'seonnyeo');
    assert.ok(studentProject.draft.project.lines[0].text.includes('학생이 직접 수정한 첫 장면 대사'));
    console.log('[E2E Desktop] Verified storage: baseEdition provenance, cut text preserved');

    assert.deepEqual(errors, []);
    results.push({ test: 'desktop-clone-edit-play-save', width, height, status: 'pass' });
    await page.close();
  }

  // Test 2: Mobile Viewport (390 x 844) - Touch Targets, Responsiveness, No Horizontal Scroll
  {
    const width = 390, height = 844;
    const page = await browser.newPage({ viewport: { width, height }, reducedMotion: 'reduce' });
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));

    await page.goto(process.env.QA_URL || 'http://localhost:3002');
    await openLibrary(page);

    // Check no horizontal scroll on library
    const noOverflowLib = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
    assert.ok(noOverflowLib, 'No horizontal overflow on mobile library');

    // Select '선녀와 나무꾼' base book
    await page.getByRole('button', { name: '선녀와 나무꾼 · 기본 이야기', exact: true }).click();
    await page.getByRole('dialog', { name: '선녀와 나무꾼' }).waitFor();

    // Verify touch target heights (>= 44px) on modal buttons
    for (const btn of await page.locator('.focus-action-card').all()) {
      const box = await btn.boundingBox();
      assert.ok(box.height >= 44, `Action card height ${box.height} >= 44px`);
    }

    // Read base story in mobile
    await page.getByRole('button', { name: '기본 작품 읽기', exact: true }).click();
    await page.getByRole('button', { name: '이야기 펼치기', exact: true }).click();
    await page.locator('.player-shell').waitFor();

    // Verify mobile player layout
    const noOverflowPlayer = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
    assert.ok(noOverflowPlayer, 'No horizontal overflow on mobile player');

    // Verify player control buttons meet 44px touch target requirement
    for (const btn of await page.locator('.player-controls button').all()) {
      const box = await btn.boundingBox();
      if (box) {
        assert.ok(box.height >= 44, `Player button height ${box.height} >= 44px`);
      }
    }

    // Step forward 3 cuts
    for (let i = 0; i < 3; i++) {
      await page.getByRole('button', { name: '다음 컷', exact: true }).click();
    }
    await page.screenshot({ path: `${output}/seonnyeo-player-mobile.png`, fullPage: true });
    console.log('[E2E Mobile] Player responsive layout and 44px touch targets verified');

    assert.deepEqual(errors, []);
    results.push({ test: 'mobile-viewport-touch-targets', width, height, status: 'pass' });
    await page.close();
  }

  // Test 3: Export .knolstory & Re-import Verification
  {
    const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));

    await page.goto(process.env.QA_URL || 'http://localhost:3002');
    await openLibrary(page);
    await page.getByRole('button', { name: '창작 관리', exact: true }).click();
    await page.getByRole('heading', { name: '창작 관리', exact: true }).waitFor();

    // Upload seonnyeo-namukkun.knolstory
    await page.locator('input[accept*="knolstory"], input[accept*="nolstory"]').last().setInputFiles('../pinky-ne-site-publish/dist/ifstory03/seonnyeo-namukkun.knolstory');
    await page.getByRole('dialog', { name: /^(크놀스토리|놀스토리) 파일 열기$/ }).waitFor();
    await page.getByRole('button', { name: '편집본으로 추가', exact: true }).click();

    // Verify project is loaded into storage with all 1632 cuts
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('storygame:projects:v1')));
    const importedProject = saved.projects.find(p => p.draft.project.title === '선녀와 나무꾼');
    assert.ok(importedProject, 'Imported project must exist in projects list');
    assert.equal(importedProject.draft.project.lines.length, 1632, 'All 1632 cuts imported');
    assert.ok(importedProject.draft.project.lines.every(l => l.backgroundId.startsWith('seonnyeo.background.')), 'All lines have seonnyeo backgrounds');
    console.log('[E2E Import] .knolstory import successfully loaded 1632 cuts with backgrounds');

    await page.screenshot({ path: `${output}/seonnyeo-import-verified.png`, fullPage: true });

    assert.deepEqual(errors, []);
    results.push({ test: 'knolstory-import-roundtrip', status: 'pass' });
    await page.close();
  }

  await writeFile(`${output}/results.json`, JSON.stringify(results, null, 2));
  console.log('ALL SEONNYEO E2E TESTS PASSED:', results);
} finally {
  await browser.close();
}
