import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import { launchBrowser } from './support/runtime.mjs';
import { seed, openResume } from './support/classroom-fixture.mjs';
const output = process.env.QA_OUTPUT || '/tmp/mobile-input-qa';
const browser = await launchBrowser(output);
try {
 const page = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, reducedMotion: 'reduce' });
 await seed(page); await openResume(page);
 await page.getByRole('button',{name:'이어만들기',exact:true}).tap();
 await page.getByRole('button', { name: '컷 꾸미기', exact: true }).first().tap();
 await page.getByRole('button', { name: /창작 메모 펼치기/ }).tap();
 const board = page.getByRole('region', { name: '창작 메모', exact: true });
 const move = board.getByRole('button', { name: '메모 이동 (드래그 또는 방향키)', exact: true });
 const resize = board.getByRole('button', { name: '메모 크기 조절 (드래그 또는 방향키)', exact: true });
 const session = await page.context().newCDPSession(page);
 async function drag(handle, dx, dy) {
  const box = await handle.boundingBox(); const x = box.x + box.width / 2, y = box.y + box.height / 2;
  await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y, id: 1 }] });
  for (let i = 1; i <= 5; i++) await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x + dx * i / 5, y: y + dy * i / 5, id: 1 }] });
  await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
 }
 const before = await board.boundingBox(); await drag(move, -15, -40);
 assert.ok((await board.boundingBox()).y < before.y, 'touch drag moves memo');
 const oldHeight = (await board.boundingBox()).height; await drag(resize, 0, 40);
 assert.notEqual((await board.boundingBox()).height, oldHeight, 'touch resize changes memo');
 for (const [width, height] of [[844, 390], [390, 420], [390, 844]]) {
  await page.setViewportSize({ width, height });
  await page.waitForFunction(() => {
   const el = document.querySelector('[aria-label="창작 메모"][role="region"]');
   if (!el) return false;
   const r = el.getBoundingClientRect(); return r.bottom <= innerHeight + 1;
  });
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'horizontal overflow');
  const box = await board.boundingBox();
  assert.ok(box.x >= -1 && box.y >= -1 && box.x + box.width <= width + 1 && box.y + box.height <= height + 1, 'memo contained after resize');
  await page.screenshot({ path: `${output}/${width}x${height}.png`, fullPage: true });
 }
 await board.getByRole('button', { name: '창작 메모 닫기' }).tap();
 const input = page.getByLabel('현재 컷 글상자', { exact: true }); await input.tap();
 await input.fill('한글 입력 칸 초점 확인'); // Text fill is explicitly not native IME composition.
 assert.ok(await input.evaluate(el => el === document.activeElement));
 assert.ok(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches));
 await writeFile(`${output}/results.json`, JSON.stringify({ touchDrag: true, touchResize: true, rotation: true,
  shortenedViewport: true, focus: true, reducedMotion: true, physicalDevice: false, nativeIME: false }, null, 2));
 await page.close();
} finally { await browser.close(); }
