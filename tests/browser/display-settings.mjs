import assert from 'node:assert/strict';
import {launchBrowser} from './support/runtime.mjs';
const browser=await launchBrowser('/tmp/display-settings-qa');
try {
 for(const [width,height] of [[390,844],[1365,900],[844,390]]) {
  const page=await browser.newPage({viewport:{width,height},reducedMotion:'reduce'});
  await page.goto('http://localhost:3003');await page.locator('.entry-template-options[open]').waitFor({state:'attached'});
  await page.getByRole('button',{name:'이야기 읽기',exact:true}).click();
  await page.getByRole('button',{name:'이야기 펼치기',exact:true}).click();await page.locator('.player-shell').waitFor();
  const box=page.locator('.dialogue-box');
  assert.ok(Math.abs((await box.boundingBox()).height-height*.35)<2);
  await page.getByRole('button',{name:'다음 컷',exact:true}).click();
  assert.ok(Math.abs((await box.boundingBox()).height-height*.35)<2,'short content preserves height');
  const actor=page.locator('.story-stage-actor.left');const before=await actor.boundingBox();
  const group=await actor.getAttribute('data-scale-group');
  await page.getByRole('button',{name:'화면 설정',exact:true}).click();
  const dialog=page.getByRole('dialog',{name:'화면 설정',exact:true});
  const heightSlider=dialog.getByLabel('글상자 높이',{exact:false});
  await heightSlider.fill('45');
  await page.waitForFunction(()=>Math.abs(document.querySelector('.dialogue-box').getBoundingClientRect().height-innerHeight*.45)<2);
  assert.ok(Math.abs((await box.boundingBox()).height-height*.45)<2);
  assert.deepEqual(await actor.boundingBox(),before,'dock size does not resize actors');
  const scaleSlider=dialog.locator('.character-size-setting').filter({hasText:group.split(':')[1]}).getByRole('slider');
  await scaleSlider.fill('80');
  await page.waitForFunction(()=>getComputedStyle(document.querySelector('.story-stage-actor.left')).getPropertyValue('--actor-scale').trim()==='0.8');
  await page.screenshot({path:`/tmp/display-settings-qa/settings-${width}.png`});
  await dialog.getByRole('button',{name:'닫기',exact:true}).click();
  assert.ok(Math.abs((await actor.boundingBox()).height/before.height-.8)<.01);
  await page.reload();await page.locator('.player-shell').waitFor();
  assert.ok(Math.abs((await box.boundingBox()).height-height*.45)<2);
  assert.ok(Math.abs((await actor.boundingBox()).height/before.height-.8)<.01);
  // Switch the same character to another pose, preserving the group adjustment.
  await page.evaluate(()=>{const key='storygame:navigation:v1';const s=JSON.parse(sessionStorage.getItem(key));s.player.project.lines.forEach(l=>l.leftAssetId='onggojib.character.real-angry-pixel');sessionStorage.setItem(key,JSON.stringify(s));});
  await page.reload();await actor.waitFor();
  assert.equal(await actor.evaluate(el=>getComputedStyle(el).getPropertyValue('--actor-scale').trim()),'0.8');
  await page.getByRole('button',{name:'화면 설정',exact:true}).click();
  await dialog.getByRole('button',{name:'글상자 기본값 35%',exact:true}).click();
  await dialog.getByRole('button',{name:group.split(':')[1]+' 크기 기본값',exact:true}).click();
  await page.waitForFunction(()=>Math.abs(document.querySelector('.dialogue-box').getBoundingClientRect().height-innerHeight*.35)<2);
  await page.keyboard.press('Escape');
  assert.ok(Math.abs((await box.boundingBox()).height-height*.35)<2);
  assert.equal(await actor.evaluate(el=>getComputedStyle(el).getPropertyValue('--actor-scale').trim()),'1');
  const credit=await page.locator('.copyright-bar').boundingBox();
  assert.ok(credit.y-(await box.boundingBox()).y-(await box.boundingBox()).height<15);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.locator('.player-shell img').evaluateAll(images=>Promise.all(images.map(img=>img.decode().catch(()=>{}))));
  await page.screenshot({path:`/tmp/display-settings-qa/player-${width}.png`});
  await page.close();
 }
 console.log('35% fixed dock, adjustment/reset, stable actors, grouped poses and refresh passed');
}finally{await browser.close();}
