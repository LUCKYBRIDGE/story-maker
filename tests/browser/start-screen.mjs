// Run with the existing Playwright installation and a running development server.
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const output = process.env.QA_OUTPUT || '/tmp/start-screen-qa';
await mkdir(output, {recursive:true});
const browser = await chromium.launch({channel:'chrome',headless:true});
const results = [];
try {
 const sizes=process.env.QA_VIEWPORTS ? JSON.parse(process.env.QA_VIEWPORTS) : [[320,740],[360,800],[390,844],[600,960],[768,1024],[820,1180],[960,720],[1024,768],[1440,900],[1920,1080],[720,450],[800,450]];
 for (const [width,height] of sizes) {
  const page = await browser.newPage({viewport:{width,height}});
  const errors=[]; page.on('pageerror',e=>errors.push(e.message));
  await page.goto(process.env.QA_URL || 'http://localhost:3001');
  await page.locator('.entry-template-options[open]').waitFor({state:'attached'});
  await page.locator('.nolstory-poster-img').evaluate(img=>img.decode());
  const selectors=['.poster-brand','.poster-menu','.poster-heading','.poster-read','.poster-footer'];
  const measure=()=>page.evaluate(selectors=>selectors.map(s=>{const r=document.querySelector(s).getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height};}),selectors);
  await page.evaluate(()=>document.fonts.ready);
  const before=await measure();
  const layout=await page.evaluate(()=>{
   const box=s=>document.querySelector(s).getBoundingClientRect();
   const frame=box('.nolstory-poster-frame'),footer=box('.poster-footer'),heading=box('.poster-heading'),art=box('.poster-scene-space');
   return {contained:footer.bottom<=frame.bottom, separated:heading.bottom<=art.top || heading.right<=art.left,
    font:parseFloat(getComputedStyle(document.querySelector('.poster-brand p')).fontSize)};
  });
  assert.ok(layout.contained,`footer outside frame at ${width}`);
  assert.ok(layout.separated,`art overlaps heading at ${width}`);
  assert.ok(layout.font>=15,`small branding at ${width}`);
  await page.screenshot({path:`${output}/onggojib-${width}.png`,fullPage:true});
  await page.getByRole('button',{name:/이야기 변경/}).click();
  await page.locator('.nolstory-poster-img').evaluate(img=>img.decode());
  await page.waitForFunction(()=>document.querySelector('.poster-heading h2').textContent==='토끼와 자라');
  assert.deepEqual(await measure(),before,`theme layout shift at ${width}`);
  assert.equal(await page.locator('.poster-heading h2').innerText(),'토끼와 자라');
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`overflow at ${width}`);
  for(const b of await page.locator('.poster-button').all()) { const r=await b.boundingBox(); assert.ok(r.height>=44 && r.width>=44); }
  await page.screenshot({path:`${output}/rabbit-${width}.png`,fullPage:true});
  const open=page.getByRole('button',{name:'나만의 이야기 창작 공작소 열기'});await open.click();
  const close=page.getByRole('button',{name:'창작 공작소 닫기'});
  await close.waitFor({state:"visible"});
  assert.ok(await page.locator('.modal-brand-name').evaluate(el=>el.scrollHeight<=el.clientHeight && el.scrollWidth<=el.clientWidth),`studio name clipped at ${width}`);
  await page.waitForTimeout(350);
  await page.screenshot({path:`${output}/studio-${width}.png`,fullPage:true});
  assert.ok(await page.locator('.nolstory-studio-modal').evaluate(el=>el.scrollWidth<=el.clientWidth),`modal overflow at ${width}`);
  await close.focus();await page.keyboard.press('Shift+Tab');
  assert.ok(await page.evaluate(()=>!!document.activeElement.closest('.nolstory-studio-modal')));
  await page.getByRole('tab',{name:'새 이야기 만들기'}).focus();await page.keyboard.press('ArrowRight');
  assert.equal(await page.getByRole('tab',{name:/이어만들기/}).getAttribute('aria-selected'),'true');
  await page.getByLabel('공개 Google 시트',{exact:true}).fill('https://example.com/sheet');
  assert.ok(await page.getByRole('button',{name:/Excel 파일에서 이어만들기/}).isVisible());
  await page.keyboard.press('Home');
  await page.getByRole('tab',{name:'새 이야기 만들기'}).click();
  assert.equal(await page.locator('.entry-template-card').count(),2);
  await page.keyboard.press('Escape');
  assert.ok(await open.evaluate(el=>el===document.activeElement));
  await page.getByRole('button',{name:'놀스토리 작품 읽기',exact:true}).click();
  await page.waitForTimeout(1200);
  assert.equal(await page.locator('.nolstory-poster-frame').count(),0);
  assert.deepEqual(errors,[]);
  results.push({width,height,themeShift:0,overflow:0,buttons:'44px+',modalKeyboard:'pass',read:'pass'});
  await page.close();
 }
 await writeFile(`${output}/results.json`,JSON.stringify(results,null,2));console.log(results);
} finally { await browser.close(); }
