import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import { launchBrowser } from './support/runtime.mjs';
const output=process.env.QA_OUTPUT || '/tmp/onggojib-art/browser';
const url=(process.env.QA_URL || 'http://localhost:3003/').replace(/\/?$/,'/');
const browser=await launchBrowser(output);const results=[];
try {
 for(const [width,height] of [[1365,900],[820,1180],[390,844]]) {
  const page=await browser.newPage({viewport:{width,height},reducedMotion:'reduce'});
  const route=url+'classic/onggojib';
  const response=await page.request.get(route);
  await page.goto(response.status()===404?route+'.html':route);
  await page.locator('.book-play-entry').waitFor();
  await page.waitForTimeout(1200);
  await page.getByRole('button',{name:'이야기 펼치기',exact:true}).click();
  await page.locator('.player-shell').waitFor();
  for(let i=1;i<=71;i++) {
   await page.locator('.reader-story-info small').filter({hasText:new RegExp(`^${i} / 71$`)}).waitFor({state:'attached'});
   await page.waitForFunction(()=>[...document.querySelectorAll('.story-stage img')].every(x=>x.complete&&x.naturalWidth>0));
   await page.locator('.story-stage img').evaluateAll(images=>Promise.all(images.map(image=>image.decode())));
   await page.waitForTimeout(200);
   assert.ok(await page.locator('.story-stage-actor').evaluateAll(images=>images.every(image=>image.dataset.layoutReady==='true')));
   assert.equal(await page.locator('.story-stage-missing,.story-stage-background-error').count(),0);
   const layout=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,actors:[...document.querySelectorAll('.story-stage-actor')].map(x=>({id:x.dataset.assetId,rect:x.getBoundingClientRect().toJSON()})),dialogue:document.querySelector('.dialogue-box').getBoundingClientRect().toJSON()}));
   assert.equal(layout.overflow,false,`${width} cut ${i}: overflow`);
   await page.screenshot({path:`${output}/${width}-${String(i).padStart(2,'0')}.png`});
   results.push({width,cut:i,...layout});
   if(i<71) await page.getByRole('button',{name:'다음 컷',exact:true}).click();
  }
  assert.ok(await page.getByRole('button',{name:'다음 컷',exact:true}).isDisabled());
  await page.getByRole('button',{name:'이전',exact:true}).click();
  assert.equal(await page.locator('.reader-story-info small').textContent(),'70 / 71');
  await page.getByRole('button',{name:'다음 컷',exact:true}).click();
  await page.close();
 }
 await writeFile(`${output}/layout.json`,JSON.stringify(results,null,2));
 console.log('PASS: 71 cuts × 3 viewports, loaded images, no page overflow, previous/next, final cut');
} finally {await browser.close();}
