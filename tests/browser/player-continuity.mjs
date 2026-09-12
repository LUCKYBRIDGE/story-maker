import assert from 'node:assert/strict';
import {launchBrowser} from './support/runtime.mjs';
const browser=await launchBrowser('/tmp/player-continuity-qa');
try {
 for(const [width,height] of [[390,844],[1365,900],[1380,1412]]) {
  const page=await browser.newPage({viewport:{width,height},reducedMotion:'reduce'});
  await page.goto('http://localhost:3003');
  await page.locator('.entry-template-options[open]').waitFor({state:'attached'});
  await page.getByRole('button',{name:'서재 입장',exact:true}).click();
  await page.locator('.library-shelf').waitFor();
  await page.reload();await page.locator('.library-shelf').waitFor();
  await page.getByRole('button',{name:'빈 책 · 새 이야기 만들기',exact:true}).click();
  await page.getByRole('dialog',{name:'새 이야기 만들기',exact:true}).waitFor();
  await page.reload();await page.getByRole('dialog',{name:'새 이야기 만들기',exact:true}).waitFor();
  await page.keyboard.press('Escape');
  await page.getByRole('button',{name:'메인으로',exact:true}).click();
  await page.getByRole('button',{name:'이야기 읽기',exact:true}).click();
  await page.getByRole('button',{name:'이야기 펼치기',exact:true}).click();
  await page.locator('.player-shell').waitFor();
  await page.reload();await page.locator('.player-shell').waitFor();
  await page.getByRole('button',{name:'다음 컷',exact:true}).click();
  await page.waitForTimeout(200);
  const history=await page.evaluate(()=>JSON.parse(sessionStorage.getItem('storygame:reading-path:v1')).history);
  const saved=await page.evaluate(()=>JSON.parse(sessionStorage.getItem('storygame:navigation:v1')));
  assert.ok(saved.index>0);
  await page.reload();await page.locator('.player-shell').waitFor();
  assert.equal(await page.evaluate(()=>JSON.parse(sessionStorage.getItem('storygame:navigation:v1')).index),saved.index);
  assert.deepEqual(await page.evaluate(()=>JSON.parse(sessionStorage.getItem('storygame:reading-path:v1')).history),history);
  await page.locator('.player-shell img').evaluateAll(images=>Promise.all(images.map(img=>img.decode().catch(()=>{}))));
  const dock=await page.locator('.dialogue-box').boundingBox();
  const credit=await page.locator('.copyright-bar').boundingBox();
  assert.ok(credit.y-(dock.y+dock.height)<22,'dialogue meets bottom credit');
  assert.ok(credit.y+credit.height<=height+2);
  assert.equal(await page.locator('.copyright-bar').innerText(),'© 놀퀴즈');
  await page.screenshot({path:`/tmp/player-continuity-qa/player-${width}.png`});
  // Use the actual loaded example and replace only the current cast with catalog IDs.
  await page.evaluate(()=>{
    const key='storygame:navigation:v1';const state=JSON.parse(sessionStorage.getItem(key));
    state.player.project.lines.forEach(l=>{l.leftAssetId='onggojib.character.child-pixel';l.rightAssetId='onggojib.character.real-angry-pixel';});
    sessionStorage.setItem(key,JSON.stringify(state));
  });
  await page.reload();await page.locator('.player-shell').waitFor();
  const child=page.locator('[data-stature="child"]');await child.waitFor();
  assert.equal(await child.evaluate(el=>getComputedStyle(el).getPropertyValue('--actor-scale').trim()),'0.62');
  await page.locator('.player-shell img').evaluateAll(images=>Promise.all(images.map(img=>img.decode().catch(()=>{}))));
  const adult=page.locator('.story-stage-actor.right');
  assert.ok((await child.boundingBox()).height < (await adult.boundingBox()).height * .7);
  await page.screenshot({path:`/tmp/player-continuity-qa/child-${width}.png`});
  await page.close();
 }
 const invalid=await browser.newPage();
 await invalid.addInitScript(()=>{
   sessionStorage.setItem('storygame:navigation:v1',JSON.stringify({version:1,player:{kind:'student',project:{bad:true}},index:999}));
   sessionStorage.setItem('storygame:book-phase:v1','{bad');
   localStorage.setItem('storygame:display-settings:v1','{bad');
 });
 await invalid.goto('http://localhost:3003');await invalid.locator('.entry-template-options[open]').waitFor({state:'attached'});
 await invalid.getByRole('button',{name:'이야기 읽기',exact:true}).click();
 await invalid.getByRole('button',{name:'이야기 펼치기',exact:true}).click();await invalid.locator('.player-shell').waitFor();
 assert.equal(await invalid.evaluate(()=>JSON.parse(localStorage.getItem('storygame:projects:v1')).projects.length),0,'invalid UI state must not manufacture a saved project');
 await invalid.close();
 console.log('library/dialog reload, first/current reading cut, history, bottom dock, child stature and invalid session recovery passed');
} finally {await browser.close();}
