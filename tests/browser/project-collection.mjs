import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { launchBrowser } from './support/runtime.mjs';
const output = process.env.QA_OUTPUT || '/tmp/story-collection-qa';
const url = process.env.QA_URL || 'http://localhost:3003';
const key = 'storygame:projects:v1';
const fixture = JSON.parse(execFileSync(process.execPath, ['--experimental-strip-types','--experimental-loader=./tests/node-types-loader.mjs','--input-type=module','-e', `
import {DEFAULT_PROJECT,cloneProject} from './app/story-data.ts';
import {createStoryDocument} from './app/story-project-document.ts';
import {createStoryWorkbook} from './app/story-workbook.ts';
import {STORY_ASSETS} from './app/story-assets.ts';
const project=cloneProject(DEFAULT_PROJECT);project.title='이전 학생 작품';
const legacy=JSON.stringify(createStoryDocument({project,savedAt:'2026-09-10T00:00:00.000Z',appVersion:'qa'}));
console.log(JSON.stringify({legacy,xlsx:Buffer.from(await createStoryWorkbook(project,STORY_ASSETS).xlsx.writeBuffer()).toString('base64')}));
`], {encoding:'utf8'}));
const browser = await launchBrowser(output);
const read = page => page.evaluate(key => JSON.parse(localStorage.getItem(key)), key);
async function hub(page) {
  await page.locator('.entry-template-options[open]').waitFor({state:'attached'});
  await page.getByRole('button', {name:'나만의 이야기 창작 공작소 열기'}).click();
  await page.getByRole('heading', {name:'창작 관리', exact:true}).waitFor();
}
async function home(page) {
  await page.getByRole('button', {name:'창작 관리', exact:true}).click();
  await page.getByRole('heading', {name:'창작 관리', exact:true}).waitFor();
}
try {
  for (const [width,height] of [[1365,900],[390,844]]) {
    const page = await browser.newPage({viewport:{width,height}, reducedMotion:'reduce'});
    await page.goto(url); await hub(page);
    assert.ok(await page.getByRole('heading',{name:'창작 관리',exact:true}).evaluate(el => el === document.activeElement));
    await page.getByRole('button',{name:'빈 이야기부터 만들기'}).click();
    await page.getByText('작품 기본·큰 생각·이야기 뼈대',{exact:true}).click();
    await page.getByRole('textbox',{name:'이야기 제목',exact:true}).fill('첫 번째 이야기');
    await page.getByRole('button',{name:'+ 첫 장 만들기',exact:true}).click();
    await page.getByRole('button',{name:'바로 이야기 쓰기',exact:true}).click();
    await page.getByRole('button',{name:'+ 해설 컷',exact:true}).click();
    await page.locator('.script-scene-card.active textarea').fill('첫 작품에서 쓴 문장.');
    await page.getByRole('button',{name:'플레이에 적용',exact:true}).click();
    await page.waitForFunction(key => JSON.parse(localStorage.getItem(key)).projects[0].playback.project.lines[0]?.text === '첫 작품에서 쓴 문장.', key);
    await page.locator('.script-scene-card.active textarea').fill('적용 전 첫 작품 수정.');
    // No debounce wait: leaving must save the latest edit before switching.
    await home(page);
    const first = (await read(page)).projects[0]; const firstId = first.draft.project.id;
    assert.equal(first.draft.project.lines[0].text,'적용 전 첫 작품 수정.');
    assert.equal(first.playback.project.lines[0].text,'첫 작품에서 쓴 문장.');
    await page.getByRole('button',{name:'토끼와 자라 · 이어 쓰기',exact:true}).click();
    const input = page.getByLabel('현재 컷 글상자',{exact:true});
    await input.fill('두 번째 작품의 결말.');
    await home(page);
    const two = await read(page); const secondId = two.selectedProjectId;
    assert.notEqual(firstId,secondId); assert.equal(two.projects.length,2);
    assert.equal(two.projects[1].draft.project.source.kind,'baseEdition');
    assert.equal(two.projects[1].draft.project.lines.find(line => line.id === 'palace-continuation-line-7').text,'두 번째 작품의 결말.');
    for (const name of ['빈 이야기부터 만들기','토끼와 자라 · 이어 쓰기','옹고집전 · 이어 쓰기']) {
      assert.ok(await page.getByRole('button',{name,exact:true}).isDisabled());
    }
    assert.ok((await page.getByRole('status').innerText()).includes('두 작품'));
    for (const button of await page.locator('.creation-hub button:visible').all()) assert.ok((await button.boundingBox()).height >= 44);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await page.screenshot({path:`${output}/hub-${width}.png`,fullPage:true});
    if (width === 1365) {
      const before = (await read(page)).projects.map(entry => entry.draft.project);
      await page.locator('.creation-hub input[type=file]:not([accept=".nolstory"])').setInputFiles({name:'third.xlsx',mimeType:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',buffer:Buffer.from(fixture.xlsx,'base64')});
      await page.getByRole('button',{name:'편집본으로 열기',exact:true}).click();
      await page.getByRole('dialog',{name:'작품 가져오기 미리보기'}).getByRole('alert').waitFor();
      assert.deepEqual((await read(page)).projects.map(entry => entry.draft.project),before);
      await page.getByRole('button',{name:'취소 (현재 작업 유지)',exact:true}).click();
    }
    await page.getByRole('article',{name:'첫 번째 이야기',exact:true}).getByRole('button',{name:'이어만들기',exact:true}).click();
    assert.equal(await page.locator('.script-scene-card.active textarea').inputValue(),'적용 전 첫 작품 수정.');
    await home(page);
    const beforeReload = await read(page);
    await page.reload(); await hub(page);
    assert.deepEqual(await read(page),beforeReload);
    assert.equal((await read(page)).selectedProjectId,firstId);
    await page.getByRole('article',{name:'첫 번째 이야기',exact:true}).getByRole('button',{name:'읽기',exact:true}).click();
    await page.getByRole('button',{name:'이야기 펼치기',exact:true}).click();
    await page.locator('.player-shell').waitFor();
    assert.ok((await page.getByRole('region',{name:'현재 대사',exact:true}).innerText()).includes('첫 작품에서 쓴 문장.'));
    assert.ok(!(await page.getByRole('region',{name:'현재 대사',exact:true}).innerText()).includes('적용 전'));
    await page.getByRole('button',{name:'돌아가기',exact:true}).click();
    await page.getByRole('button',{name:'창작 관리로 돌아가기',exact:true}).click();
    await page.getByRole('heading',{name:'창작 관리',exact:true}).waitFor();
    // Reconnect after reading: playback must never overwrite the draft.
    await page.reload(); await hub(page);
    await page.getByRole('article',{name:'첫 번째 이야기',exact:true}).getByRole('button',{name:'이어만들기',exact:true}).click();
    const draftInput = page.locator('.script-scene-card.active textarea');
    await page.evaluate(() => {
      window.originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = function(k,v) { if (k === 'storygame:projects:v1') throw new DOMException('quota','QuotaExceededError'); return window.originalSetItem.call(this,k,v); };
    });
    await draftInput.fill('저장 실패 후 되찾은 문장.');
    await page.getByRole('button',{name:'창작 관리',exact:true}).click();
    assert.ok(await draftInput.isVisible());
    assert.equal((await read(page)).projects[0].draft.project.lines[0].text,'적용 전 첫 작품 수정.');
    await page.evaluate(() => { Storage.prototype.setItem = window.originalSetItem; });
    await home(page);
    assert.equal((await read(page)).projects[0].draft.project.lines[0].text,'저장 실패 후 되찾은 문장.');
    const survivor = (await read(page)).projects[1];
    const deleteButton = page.getByRole('article',{name:'첫 번째 이야기',exact:true}).getByRole('button',{name:'삭제',exact:true});
    page.once('dialog',dialog => dialog.dismiss()); await deleteButton.click();
    assert.equal((await read(page)).projects.length,2);
    page.once('dialog',dialog => dialog.accept()); await deleteButton.click();
    assert.deepEqual((await read(page)).projects,[survivor]);
    await page.getByRole('button',{name:'빈 이야기부터 만들기'}).click();
    await home(page); assert.equal((await read(page)).projects.length,2);
    await page.reload(); await hub(page); assert.equal((await read(page)).projects.length,2);
    console.log({width,height,createEditSwitchReconnect:true,thirdBlocked:true,playbackSeparated:true,saveFailureRetry:true,explicitDelete:true});
    await page.close();
  }
  const page = await browser.newPage({viewport:{width:1365,height:900}});
  await page.addInitScript(legacy => {
    if (sessionStorage.getItem('seeded')) return;
    sessionStorage.setItem('seeded','1');
    localStorage.setItem('storygame:draft:v1',legacy);
    localStorage.setItem('storygame:active:v1',legacy);
    window.originalSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function(k,v) { if(k === 'storygame:projects:v1') throw new DOMException('quota','QuotaExceededError'); return window.originalSetItem.call(this,k,v); };
  },fixture.legacy);
  await page.goto(url); await hub(page);
  await page.getByRole('button',{name:'다시 확인',exact:true}).waitFor();
  assert.equal(await read(page),null);
  assert.equal(await page.evaluate(() => localStorage.getItem('storygame:draft:v1')),fixture.legacy);
  await page.evaluate(() => { Storage.prototype.setItem = window.originalSetItem; });
  await page.getByRole('button',{name:'다시 확인',exact:true}).click();
  await page.getByRole('article',{name:'이전 학생 작품',exact:true}).waitFor();
  assert.equal((await read(page)).projects.length,1);
  assert.equal(await page.evaluate(() => localStorage.getItem('storygame:draft:v1')),fixture.legacy);
  assert.equal(await page.evaluate(() => localStorage.getItem('storygame:active:v1')),fixture.legacy);
  await page.evaluate(key => localStorage.setItem(key,'{"version":99}'),key);
  await page.reload(); await hub(page);
  await page.getByRole('button',{name:'다시 확인',exact:true}).click();
  assert.equal(await page.evaluate(key => localStorage.getItem(key),key),'{"version":99}');
  console.log({legacyMigration:true,legacyBytesPreserved:true,migrationFailureRetry:true,corruptCollectionPreserved:true});
  await page.close();
} finally { await browser.close(); }
