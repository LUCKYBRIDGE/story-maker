import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { launchBrowser } from './support/runtime.mjs';
const output = process.env.QA_OUTPUT || '/tmp/library-craft-qa';
const url = process.env.QA_URL || 'http://localhost:3003';
const key = 'storygame:projects:v1';
const fixtures = JSON.parse(execFileSync(process.execPath, ['--disable-warning=ExperimentalWarning', '--experimental-strip-types', '--experimental-loader=./tests/node-types-loader.mjs', '--input-type=module', '-e', `
import { DEFAULT_PROJECT, cloneProject } from './app/story-data.ts';
import { DEFAULT_COVER } from './app/story-cover.ts';
import { createStoryDocument } from './app/story-project-document.ts';
import { createNolstoryShared, encodeNolstoryFile } from './app/story-file.ts';
const project = {...cloneProject(DEFAULT_PROJECT), id:'library-fixture', title:'내가 꾸민 바다 이야기', cover:{...DEFAULT_COVER,theme:'rose',author:'어린 작가',subtitle:'함께 떠나는 모험'}};
const doc = project => createStoryDocument({project,savedAt:'2026-09-11T00:00:00.000Z',appVersion:'qa'});
const playback = {...project,cover:{...project.cover,theme:'night'}};
const shared = Array.from({length:11},(_,i) => encodeNolstoryFile(createNolstoryShared({...project,id:'shared-'+i,title:'친구의 이야기 '+(i+1),source:{kind:'baseEdition',baseStoryId:'rabbit-turtle',baseEditionId:'original'}},true)));
console.log(JSON.stringify({collection:{version:1,selectedProjectId:project.id,projects:[{draft:doc(project),playback:doc(playback)}]},shared}));
`], { encoding: 'utf8' }));
const browser = await launchBrowser(output);
const snapshot = page => page.evaluate(key => localStorage.getItem(key), key);
async function enter(page) {
  await page.goto(url);
  await page.locator('.nolstory-poster-frame').waitFor({state:'attached'});
  await page.getByRole('button',{name:'서재 입장',exact:true}).click();
  await page.locator('.library-shelf').waitFor();
}
async function returnFromReader(page) {
  await page.getByRole('button',{name:'이야기 펼치기',exact:true}).click();
  await page.locator('.player-shell').waitFor();
  await page.getByRole('button',{name:'돌아가기',exact:true}).click();
  await page.getByRole('button',{name:'서재로 돌아가기',exact:true}).click();
  await page.locator('.library-shelf').waitFor();
}
async function dimensions(page) {
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'no horizontal page overflow');
  for (const button of await page.locator('.story-discovery button:visible').all()) {
    if (await button.evaluate(el => Boolean(el.closest('[inert]')))) continue;
    assert.ok((await button.boundingBox()).height >= 44, `44px target: ${await button.textContent()}`);
  }
}
try {
  for (const [width,height,columns,capacity] of [[1365,900,5,10],[820,1180,3,9],[390,844,2,6],[320,740,2,6]]) {
    const page = await browser.newPage({viewport:{width,height},reducedMotion:'reduce'});
    await enter(page);
    await page.waitForFunction(size => Number(document.querySelector('.library-shelf').dataset.capacity) === size, capacity);
    assert.equal(await page.locator('.library-book').count(),3);
    assert.equal(await page.locator('.library-shelf').evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(' ').length),columns);
    await dimensions(page);
    await page.screenshot({path:`${output}/shelf-${width}.png`,fullPage:true});
    const before = await snapshot(page);
    const rabbit = page.getByRole('button',{name:'토끼와 자라 · 기본 이야기',exact:true});
    await rabbit.focus(); await page.keyboard.press('Enter');
    const dialog = page.getByRole('dialog',{name:'토끼와 자라',exact:true});
    await dialog.waitFor();
    assert.equal(await page.locator('.library-room-content').getAttribute('inert'),'');
    assert.ok(await page.getByText('원작 읽기 · 준비 중',{exact:true}).isVisible());
    assert.equal(await page.getByRole('button',{name:'원작 전체 · 준비 중',exact:true}).count(),0);
    for (let i=0;i<10;i++) {
      await page.keyboard.press('Tab');
      assert.ok(await page.evaluate(()=>Boolean(document.activeElement.closest('[role="dialog"]'))), 'Tab stays inside dialog');
    }
    await page.getByRole('button',{name:'다음 이야기',exact:true}).focus();
    await page.keyboard.press('ArrowLeft');
    await page.getByRole('dialog',{name:'옹고집전',exact:true}).waitFor();
    assert.ok(await page.getByRole('button',{name:'다음 이야기',exact:true}).evaluate(el=>el===document.activeElement),'navigation preserves focus');
    await page.keyboard.press('ArrowRight');
    await dimensions(page);
    await page.screenshot({path:`${output}/focus-${width}.png`,fullPage:true});
    if (width >= 390) assert.ok(await page.locator('.focus-action-grid').evaluate(el=>el.getBoundingClientRect().bottom<=innerHeight), 'all actions fit representative viewport');
    await page.keyboard.press('Escape');
    assert.ok(await rabbit.evaluate(el=>el===document.activeElement),'Escape returns focus to original book');
    assert.equal(await page.evaluate(()=>document.body.style.overflow),'');
    await rabbit.click();
    await page.getByRole('button',{name:'공유 작품 보기',exact:true}).click();
    await page.getByRole('heading',{name:'아직 제공되는 공유 작품이 없어요',exact:true}).waitFor();
    assert.equal(await page.locator('.creation-hub').count(),0,'shared action remains in library');
    await page.getByRole('button',{name:'모든 책',exact:true}).click();
    await rabbit.click();
    await page.getByRole('button',{name:'기본 작품 읽기',exact:true}).click();
    await returnFromReader(page);
    assert.equal(await snapshot(page),before,'reading does not change student storage');
    await page.getByRole('button',{name:'내 작품',exact:true}).click();
    assert.equal(await page.locator('.library-footer button').count(),0);
    await page.getByRole('button',{name:'빈 책 · 새 이야기 만들기',exact:true}).click();
    await page.getByRole('dialog',{name:'새 이야기 만들기',exact:true}).waitFor();
    assert.equal(await page.locator('.focus-hardcover-book .blank-book-cover').count(),1);
    await page.screenshot({path:`${output}/new-book-${width}.png`,fullPage:true});
    await page.keyboard.press('Escape');
    assert.ok(await page.getByRole('button',{name:'빈 책 · 새 이야기 만들기',exact:true}).evaluate(el=>el===document.activeElement));
    await page.keyboard.press('Enter');
    await page.getByRole('button',{name:/빈 이야기부터 만들기/}).click();
    await page.locator('.creator-shell').waitFor();
    assert.equal(JSON.parse(await snapshot(page)).projects.length,1);
    await page.close();
    console.log({width,height,shelf:true,focus:true,keyboard:true,readReturn:true,blankCreation:true});
  }
  const page = await browser.newPage({viewport:{width:1365,height:900},reducedMotion:'reduce'});
  await page.addInitScript(({key,collection}) => { if (!localStorage.getItem(key)) localStorage.setItem(key,JSON.stringify(collection)); },{key,collection:fixtures.collection});
  await enter(page);
  const local = page.getByRole('button',{name:'내가 꾸민 바다 이야기 · 내 작품',exact:true});
  assert.equal(await local.locator('.student-book').evaluate(el=>el.style.getPropertyValue('--book-paper')),'#202e50','shelf uses applied cover');
  assert.ok((await local.textContent()).includes('어린 작가'));
  await local.click();
  assert.equal(await page.locator('.focus-hardcover-book .student-book').evaluate(el=>el.style.getPropertyValue('--book-paper')),'#202e50');
  await page.getByRole('button',{name:'읽기',exact:true}).click();
  await returnFromReader(page);
  // Real shared imports exceed both desktop and mobile page capacities.
  const before = await snapshot(page);
  for (const text of fixtures.shared) {
    await page.locator('input[accept=".nolstory"]').setInputFiles({name:'friend.nolstory',mimeType:'application/json',buffer:Buffer.from(text)});
    await page.getByRole('button',{name:'파일의 플레이 버전 읽기',exact:true}).click();
    await returnFromReader(page);
  }
  assert.equal(await snapshot(page),before,'shared reading preserves editable collection');
  await page.getByRole('button',{name:'토끼와 자라 · 기본 이야기',exact:true}).click();
  await page.getByRole('button',{name:'공유 작품 보기',exact:true}).click();
  assert.equal(await page.locator('.library-book').count(),10,'related shared editions open on the shelf');
  await page.getByRole('button',{name:'모든 책',exact:true}).click();

  assert.equal(await page.locator('.library-book').count(),10);
  await page.getByRole('button',{name:'다음 선반 책들 보기'}).click();
  assert.equal(await page.locator('.library-book').count(),5);
  await page.setViewportSize({width:390,height:844});
  await page.waitForFunction(()=>document.querySelector('.library-shelf').dataset.capacity==='6');
  assert.equal(await page.locator('.library-book').count(),6);
  await page.getByRole('button',{name:'다음 선반 책들 보기'}).click();
  assert.equal(await page.locator('.library-book').count(),3);
  await dimensions(page);
  await page.screenshot({path:`${output}/many-books-mobile.png`,fullPage:true});
  await page.setViewportSize({width:1365,height:900});
  await page.waitForFunction(()=>document.querySelector('.library-shelf').dataset.capacity==='10');
  assert.equal(await page.locator('.library-book').count(),5);
  await page.getByRole('button',{name:'이전 선반 책들 보기'}).click();
  assert.equal(await page.locator('.library-book').count(),10,'previous page uses clamped index after resize');
  await page.screenshot({path:`${output}/many-books-desktop.png`,fullPage:true});
  await page.getByRole('button',{name:'내 작품',exact:true}).click();
  assert.equal(await page.locator('.library-book').count(),2,'filter resets pagination');
  await local.click();
  await page.getByRole('button',{name:'이어만들기',exact:true}).click();
  await page.locator('.creator-shell').waitFor();
  assert.equal(JSON.parse(await snapshot(page)).projects[0].draft.project.cover.theme,'rose','editing preserves draft cover separately');
  await page.close();
  console.log('custom covers, applied/draft separation, local reading/editing, shared import, pagination and resize passed');
} finally { await browser.close(); }
