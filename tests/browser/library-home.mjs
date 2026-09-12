import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import { launchBrowser } from './support/runtime.mjs';
import { doc } from './support/classroom-fixture.mjs';
import { selectLocalBook, openManagement } from './support/library-entry.mjs';
const output = process.env.QA_OUTPUT || '/tmp/library-home-qa';
const url = process.env.QA_URL || 'http://localhost:3003';
const browser = await launchBrowser(output);
const results = [];
const visitKey = 'storygame:landing-visit:v1';
async function bounds(page, selector) {
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'no horizontal overflow');
  for (const button of await page.locator(selector).all()) {
    if (await button.evaluate(el => Boolean(el.closest('[inert]')))) continue;
    const box = await button.boundingBox();
    assert.ok(box.width >= 44 && box.height >= 44, `44px: ${await button.textContent()} (${box.width}x${box.height})`);
  }
}
try {
  const visitContext = await browser.newContext();
  const page = await visitContext.newPage();
  await page.goto(url);
  await page.locator('.nolstory-poster-frame').waitFor();
  assert.deepEqual(await page.evaluate(key => JSON.parse(localStorage.getItem(key)), visitKey), {visited:true,landingVersion:1});
  await page.getByRole('button',{name:'서재 입장',exact:true}).click();
  await page.locator('.library-shelf').waitFor();
  await page.context().addInitScript(() => {
    window.posterSeen = false;
    new MutationObserver(() => { if (document.querySelector('.nolstory-poster-frame')) window.posterSeen = true; }).observe(document,{childList:true,subtree:true});
  });
  const revisit = await page.context().newPage();
  await revisit.goto(url); await revisit.locator('.library-shelf').waitFor();
  assert.equal(await revisit.evaluate(() => window.posterSeen),false,'returning browser never mounts Landing');
  await revisit.getByRole('button',{name:'놀스토리 소개',exact:true}).click();
  await revisit.locator('.nolstory-poster-frame').waitFor();
  await revisit.reload(); await revisit.locator('.library-shelf').waitFor();
  assert.equal(await revisit.evaluate(() => window.posterSeen),false,'refresh on Landing follows returning home policy');
  await revisit.close(); await page.close(); await visitContext.close();
  for (const value of ['{bad',JSON.stringify({visited:true,landingVersion:0})]) {
    const invalid = await browser.newPage();
    await invalid.addInitScript(({key,value}) => {
      localStorage.setItem(key,value);
      sessionStorage.setItem("storygame:navigation:v1",JSON.stringify({version:1,screen:"library"}));
    },{key:visitKey,value});
    await invalid.goto(url); await invalid.locator('.nolstory-poster-frame').waitFor();
    await invalid.getByRole('button',{name:'서재 입장',exact:true}).click();
    await invalid.locator('.library-shelf').waitFor(); await invalid.close();
  }
  const blocked = await browser.newPage();
  await blocked.addInitScript(() => {
    Storage.prototype.getItem = () => { throw new DOMException('denied','SecurityError'); };
    Storage.prototype.setItem = () => { throw new DOMException('denied','SecurityError'); };
  });
  await blocked.goto(url); await blocked.locator('.nolstory-poster-frame').waitFor();
  await blocked.getByRole('button',{name:'나만의 이야기',exact:true}).click();
  await blocked.locator('.library-shelf').waitFor();
  assert.equal(await blocked.getByRole('button',{name:'내 작품',exact:true}).getAttribute('aria-pressed'),'true');
  await blocked.close();
  for (const [width,height] of [[1440,900],[1280,720],[1024,768],[820,1180],[390,844],[844,390],[320,740],[720,450]]) {
    const page = await browser.newPage({viewport:{width,height},reducedMotion:'reduce'});
    await page.goto(url); await page.locator('.nolstory-poster-frame').waitFor();
    await page.evaluate(doc => {
      localStorage.setItem('storygame:draft:v1',doc); localStorage.setItem('storygame:active:v1',doc);
      localStorage.removeItem('storygame:projects:v1');
    },doc);
    await page.reload(); await selectLocalBook(page);
    const snapshot = await page.evaluate(() => localStorage.getItem('storygame:projects:v1'));
    await page.getByRole('button',{name:'이어만들기',exact:true}).click();
    await page.locator('.creator-shell').waitFor();
    assert.equal(await page.locator('.creator-notice').count(),0,'no empty status banner');
    await page.locator('.creator-project-details > summary').click();
    const coverButton = page.getByRole('button',{name:'내 책 표지 꾸미기',exact:true});
    await coverButton.click();
    const coverDialog = page.getByRole('dialog',{name:'내 책 표지 꾸미기',exact:true});
    await coverDialog.getByLabel('작품 제목',{exact:true}).fill('취소할 제목');
    await page.keyboard.press('Escape');
    assert.ok(await coverButton.evaluate(el => el === document.activeElement),'cover dialog restores focus');
    assert.equal(await page.locator('.creator-project-bar input').first().inputValue(),'학생 원본');
    await page.locator('.creator-project-details > summary').click();
    await page.locator('.creator-primary-nav button').nth(1).click();
    for (const i of [0,1]) assert.ok(await page.locator('.editor-mode-switch button').nth(i).isVisible());
    assert.equal(await page.locator('[aria-label^="현재 위치:"]').count(),1);
    assert.ok((await page.locator('[aria-label^="현재 위치:"]').textContent()).includes('학생 원본'));
    await page.locator('.editor-mode-switch button').nth(1).click();
    assert.equal(await page.locator('.scene-focus-tabs button:visible').count(),4);
    await bounds(page,'.creator-header button:visible, .creator-primary-nav button:visible, .editor-mode-switch button:visible, .scene-focus-tabs button:visible');
    await page.getByLabel('현재 컷 글상자',{exact:true}).fill(`내가 쓴 이야기 ${width}`);
    await page.locator('.editor-mode-switch button').first().click();
    await page.locator('.editor-mode-switch button').nth(1).click();
    assert.equal(await page.getByLabel('현재 컷 글상자',{exact:true}).inputValue(),`내가 쓴 이야기 ${width}`);
    await page.evaluate(() => window.scrollTo(0,0));
    await page.screenshot({path:`${output}/editor-${width}.png`,fullPage:true});
    await page.reload(); await page.getByLabel('현재 컷 글상자',{exact:true}).waitFor();
    assert.equal(await page.getByLabel('현재 컷 글상자',{exact:true}).inputValue(),`내가 쓴 이야기 ${width}`);
    await page.locator('.creator-primary-nav button').first().click();
    await bounds(page,'.creator-primary-nav button:visible');
    await page.screenshot({path:`${output}/plan-${width}.png`,fullPage:true});
    await openManagement(page);
    assert.equal(await page.getByRole('button',{name:'이어만들기',exact:true}).count(),0);
    for (const name of ['파일로 보관','Excel·복구 도구','Excel 파일 열기','.nolstory 파일 열기']) assert.ok(await page.getByRole('button',{name,exact:true}).isVisible());
    await bounds(page,'.creation-hub button:visible');
    await page.screenshot({path:`${output}/management-${width}.png`,fullPage:true});
    const backup = page.waitForEvent('download');
    await page.getByRole('button',{name:'파일로 보관',exact:true}).click();
    assert.ok((await backup).suggestedFilename().endsWith('.nolstory'));
    await page.getByRole('button',{name:'Excel·복구 도구',exact:true}).click();
    await page.locator('#studio-project-tools').waitFor();
    assert.ok(await page.getByRole('button',{name:'Excel로 저장',exact:true}).isVisible());
    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('storygame:projects:v1')));
    assert.deepEqual(stored.projects[0].playback,JSON.parse(snapshot).projects[0].playback,'UI and editing never apply draft to playback');
    results.push({width,height,context:1,modes:2,tabs:4,overflow:0,saveRestore:true,backup:true});
    await page.close();
  }
  await writeFile(`${output}/results.json`,JSON.stringify(results,null,2)); console.log(results);
} finally { await browser.close(); }
