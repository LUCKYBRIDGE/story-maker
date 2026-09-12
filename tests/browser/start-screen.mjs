import { launchBrowser } from './support/runtime.mjs';
// Run with the existing Playwright installation and a running development server.
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';

const output = process.env.QA_OUTPUT || '/tmp/start-screen-qa';
await mkdir(output, {recursive:true});
const browser = await launchBrowser(output);
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
  await page.getByRole('button',{name:'토끼와 자라 · 기본 이야기',exact:true}).click();
  await page.getByRole('button',{name:'돌아가기',exact:true}).click();
  await page.getByRole('button',{name:'메인으로',exact:true}).click();
  await page.locator('.nolstory-poster-img').evaluate(img=>img.decode());
  await page.waitForFunction(()=>document.querySelector('.poster-heading h2').textContent==='토끼와 자라');
  assert.deepEqual(await measure(),before,`theme layout shift at ${width}`);
  assert.equal(await page.locator('.poster-heading h2').innerText(),'토끼와 자라');
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`overflow at ${width}`);
  for(const b of await page.locator('.poster-button').all()) { const r=await b.boundingBox(); assert.ok(r.height>=44 && r.width>=44); }
  await page.screenshot({path:`${output}/rabbit-${width}.png`,fullPage:true});
  await page.getByRole('button',{name:'서재 입장',exact:true}).click();
  await page.locator('.library-shelf').waitFor();
  await page.getByRole('button',{name:'메인으로',exact:true}).click();
  const open=page.getByRole('button',{name:'나만의 이야기 창작 공작소 열기'});await open.click();
  await page.getByRole('heading',{name:'창작 관리',exact:true}).waitFor();
  assert.ok(await page.getByRole('heading',{name:'창작 관리',exact:true}).evaluate(el=>el===document.activeElement));
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`hub overflow at ${width}`);
  await page.screenshot({path:`${output}/studio-${width}.png`,fullPage:true});
  await page.getByLabel('공개 Google 시트 주소',{exact:true}).fill('https://example.com/sheet');
  assert.ok(await page.getByRole('button',{name:'Excel 파일 열기',exact:true}).isVisible());
  await page.getByRole('button',{name:'메인으로',exact:true}).focus();
  await page.keyboard.press('Enter');
  await page.locator('.entry-template-options[open]').waitFor({state:'attached'});
  await page.getByRole('button',{name:'이야기 읽기',exact:true}).click();
  await page.getByRole('button',{name:'이야기 펼치기',exact:true}).click();
  await page.locator('.player-shell').waitFor();
  await page.waitForTimeout(1200);
  assert.equal(await page.locator('.nolstory-poster-frame').count(),0);
  assert.deepEqual(errors,[]);
  results.push({width,height,themeShift:0,overflow:0,buttons:'44px+',hubKeyboard:'pass',read:'pass'});
  await page.close();
 }
 await writeFile(`${output}/results.json`,JSON.stringify(results,null,2));console.log(results);
} finally { await browser.close(); }
