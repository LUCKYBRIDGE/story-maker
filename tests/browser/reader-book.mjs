import assert from 'node:assert/strict';
import { launchBrowser } from './support/runtime.mjs';
const output=process.env.QA_OUTPUT || '/tmp/reader-book-qa';
const browser=await launchBrowser(output);
try {
 for (const [width,height] of JSON.parse(process.env.QA_VIEWPORTS || "[[1365,1000],[390,844]]")) {
  const page=await browser.newPage({viewport:{width,height},reducedMotion:'reduce'});
  await page.goto(process.env.QA_URL || 'http://localhost:3002');
  await page.locator('.entry-template-options[open]').waitFor({state:'attached'});
  await page.getByRole('button',{name:/이야기 변경/}).click();
  await page.getByRole('button',{name:`${width === 1365 ? '토끼와 자라' : '옹고집전'} · 기본 이야기`,exact:true}).click();
  await page.getByRole('button',{name:'놀스토리 작품 보기',exact:true}).click();
  await page.getByRole('button',{name:'기본 작품 읽기',exact:true}).click();
  await page.locator(".book-play-entry").waitFor();
  await page.screenshot({path:`${output}/cover-${width}.png`});
  const cover=await page.locator('.student-book').boundingBox();
  assert.ok(cover.width>300 && cover.width<width);
  await page.getByRole('button',{name:'이야기 펼치기',exact:true}).click();
  await page.locator('.player-shell').waitFor();
  assert.equal(await page.locator('.reader-story-info').getAttribute('open'),null);
  const first=await page.locator('.current-reading').innerText();
  await page.getByRole('button',{name:'다음 컷',exact:true}).click();
  await page.waitForFunction(first=>document.querySelector('.current-reading')?.textContent!==first,first);
  await page.getByRole('button',{name:'지난 기록',exact:true}).click();
  const history=page.getByRole('dialog',{name:'지난 기록',exact:true});
  assert.equal(await history.locator('.reading-paragraph').first().innerText(),first);
  await history.getByRole('button',{name:'닫기',exact:true}).click();
  await page.getByRole('button',{name:'글씨 크게',exact:true}).click();
  assert.equal(await page.locator('.reading-tools output').innerText(),'22');
  await page.getByRole('button',{name:'이전',exact:true}).click();
  await page.waitForFunction(first=>document.querySelector('.current-reading')?.textContent===first,first);
  await page.getByRole('button',{name:'이동',exact:true}).click();
  const jump=page.getByRole('dialog',{name:'장 처음으로 이동'});
  assert.ok(await jump.isVisible());
  await jump.getByRole('button',{name:/현재 장 처음으로/}).click();
  assert.equal(await page.locator('.current-reading').innerText(),first);
  for(let i=0;i<4;i++) { const previous=await page.locator('.current-reading').innerText(); await page.getByRole('button',{name:'다음 컷',exact:true}).click(); await page.waitForFunction(text=>document.querySelector('.current-reading')?.textContent!==text,previous); }
  assert.ok(await page.locator('.reading-scroll').evaluate(el=>{
   const current=el.querySelector('.current-reading');const a=el.getBoundingClientRect(),b=current.getBoundingClientRect();return b.top>=a.top-1 && b.bottom<=a.bottom+1;
  }));
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.screenshot({path:`${output}/reader-${width}.png`});
  await page.getByRole('button',{name:'돌아가기',exact:true}).click();
  const back=page.getByRole('dialog',{name:'돌아갈 화면'});
  await back.getByRole('button',{name:'이야기 목록으로 돌아가기',exact:true}).click();
  await page.getByRole('heading',{name:/이야기 목록/}).waitFor();
  console.log({width,cover:Math.round(cover.width),history:true,font:true,jump:true,return:true});
  await page.close();
 }
} finally { await browser.close(); }
