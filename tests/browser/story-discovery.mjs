import assert from 'node:assert/strict';
import {launchBrowser} from './support/runtime.mjs';
const output=process.env.QA_OUTPUT || '/tmp/story-discovery-qa';
const browser=await launchBrowser(output);
const url=process.env.QA_URL || 'http://localhost:3003';
const snapshot=page=>page.evaluate(()=>localStorage.getItem('storygame:projects:v1'));
async function library(page) {
 await page.locator('.entry-template-options[open]').waitFor({state:'attached'});
 await page.getByRole('button',{name:/이야기 변경/}).click();
 await page.getByRole('heading',{name:'서재',exact:true}).waitFor();
}
async function selectBase(page,title) {
 await page.getByRole('button',{name:`${title} · 기본 이야기`,exact:true}).click();
 await page.getByRole('heading',{name:`${title} · 읽기 선택`,exact:true}).waitFor();
 await page.getByRole('button',{name:'놀스토리 작품 보기',exact:true}).click();
 await page.getByRole('heading',{name:`${title} · 이야기 목록`,exact:true}).waitFor();
}
try {
 for(const [width,height,columns,capacity] of [[1365,900,5,10],[820,1180,3,9],[390,844,2,6]]) {
  const page=await browser.newPage({viewport:{width,height},reducedMotion:'reduce'});
  await page.goto(url);await library(page);
  await page.waitForFunction(capacity=>Number(document.querySelector('.library-shelf')?.dataset.capacity)===capacity,capacity);
  assert.equal(await page.locator('.library-book').count(),2);
  assert.equal(await page.locator('.library-shelf').evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(' ').length),columns);
  assert.ok(await page.getByRole('heading',{name:'서재',exact:true}).evaluate(el=>document.activeElement===el));
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.screenshot({path:`${output}/library-${width}.png`,fullPage:true});
  await page.getByRole('button',{name:'토끼와 자라 · 기본 이야기',exact:true}).focus();await page.keyboard.press('Enter');
  assert.ok(await page.getByRole('button',{name:'원작 전체 · 준비 중',exact:true}).isDisabled());
  await page.getByRole('button',{name:'공유 작품 보기',exact:true}).click();
  await page.getByRole('heading',{name:'아직 제공되는 공유 작품이 없어요',exact:true}).waitFor();
  assert.equal((JSON.parse(await snapshot(page))).projects.length,0);
  await page.getByRole('button',{name:'내 작품',exact:true}).click();
  await page.getByRole('heading',{name:'아직 내 작품이 없어요',exact:true}).waitFor();
  await page.getByRole('button',{name:'기본 작품',exact:true}).click();
  const before=await snapshot(page);
  await page.getByRole('button',{name:'기본 작품 읽기',exact:true}).click();
  await page.getByRole('button',{name:'이야기 펼치기',exact:true}).click();
  await page.locator('.player-shell').waitFor();
  await page.getByRole('button',{name:'돌아가기',exact:true}).click();
  await page.getByRole('button',{name:'이야기 목록으로 돌아가기',exact:true}).click();
  await page.getByRole('heading',{name:'토끼와 자라 · 이야기 목록',exact:true}).waitFor();
  assert.equal(await snapshot(page),before,'master reading does not write student storage');
  await page.getByRole('button',{name:'돌아가기',exact:true}).click();
  await page.getByRole('button',{name:'돌아가기',exact:true}).click();
  await page.getByRole('heading',{name:'서재',exact:true}).waitFor();
  await page.getByRole('button',{name:'메인으로',exact:true}).click();
  assert.equal(await page.locator('.poster-heading h2').innerText(),'토끼와 자라');
  await page.getByRole('button',{name:'놀스토리 작품 읽기',exact:true}).click();
  await page.getByRole('button',{name:'놀스토리 작품 보기',exact:true}).click();
  await page.screenshot({path:`${output}/story-hub-${width}.png`,fullPage:true});
  for(const button of await page.locator('.story-discovery button:visible').all()) assert.ok((await button.boundingBox()).height>=44);
  await page.getByRole('button',{name:'복제해서 만들기',exact:true}).click();
  await page.locator('.creator-shell').waitFor();
  await page.waitForFunction(()=>JSON.parse(localStorage.getItem('storygame:projects:v1')).projects.length===1);
  const first=JSON.parse(await snapshot(page)).projects[0];
  assert.equal(first.draft.project.lines.length,136);assert.equal(first.draft.project.source.baseStoryId,'rabbit-turtle');
  assert.equal(first.playback,null);
  // The master contains two parenthesized narrations. Keep the source unchanged;
  // explicitly edit these in the copy to satisfy the existing authoring rule.
  for (const id of ['review-main-002:start:8','review-main-002:start:30']) {
    const input=page.locator(`.script-scene-card[data-line-id="${id}"] textarea`);
    await input.fill((await input.inputValue()).replace(/[()（）]/g,''));
  }
  await page.getByRole('button',{name:'플레이에 적용',exact:true}).click();
  await page.waitForFunction(()=>JSON.parse(localStorage.getItem('storygame:projects:v1')).projects[0].playback!==null);
  await page.getByRole('button',{name:'창작 관리',exact:true}).click();
  await page.getByRole('heading',{name:'창작 관리',exact:true}).waitFor();
  await page.getByRole('button',{name:'메인으로',exact:true}).click();
  await library(page);
  assert.equal(await page.locator('.library-book').count(),3);
  await page.getByRole('button',{name:`${first.draft.project.title} · 내 작품`,exact:true}).click();
  await page.getByRole('button',{name:'서재로 돌아가기',exact:true}).click();
  await page.getByRole('heading',{name:'서재',exact:true}).waitFor();
  await selectBase(page,'옹고집전');
  await page.getByRole('button',{name:'복제해서 만들기',exact:true}).click();
  await page.locator('.creator-shell').waitFor();
  let stored=JSON.parse(await snapshot(page));
  assert.equal(stored.projects.length,2);assert.equal(stored.projects[1].draft.project.lines.length,345);
  assert.notEqual(stored.projects[0].draft.project.id,stored.projects[1].draft.project.id);
  await page.getByRole('button',{name:'창작 관리',exact:true}).click();
  await page.getByRole('button',{name:'메인으로',exact:true}).click();
  await library(page);await selectBase(page,'옹고집전');
  assert.ok(await page.getByRole('button',{name:'복제해서 만들기',exact:true}).isDisabled());
  assert.ok(await page.getByRole('button',{name:'기본 작품 읽기',exact:true}).isEnabled());
  await page.getByRole('button',{name:'내 작품',exact:true}).click();
  assert.equal(await page.locator('.discovery-card').count(),2);
  await page.locator('.discovery-card').first().getByRole('button',{name:'읽기',exact:true}).click();
  await page.getByRole('button',{name:'이야기 목록으로 돌아가기',exact:true}).click();
  await page.getByRole('heading',{name:'옹고집전 · 이야기 목록',exact:true}).waitFor();
  assert.equal(await page.getByRole('button',{name:'내 작품',exact:true}).getAttribute('aria-pressed'),'true');
  stored=JSON.parse(await snapshot(page));assert.equal(stored.projects.length,2);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  console.log({width,height,columns,capacity,readerReturn:true,masterPreserved:true,cloneReachable:true,twoSlotLimit:true,localPlayback:true});
  await page.close();
 }
} finally {await browser.close();}
