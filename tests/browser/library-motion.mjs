import assert from 'node:assert/strict';
import { launchBrowser } from './support/runtime.mjs';
const output='/tmp/library-motion-qa';
const browser=await launchBrowser(output);
try {
 const page=await browser.newPage({viewport:{width:1365,height:900},reducedMotion:'no-preference'});
 await page.goto(process.env.QA_URL || 'http://localhost:3003');
 await page.locator('.entry-template-options[open]').waitFor({state:'attached'});
 await page.getByRole('button',{name:/이야기 변경/}).click();
 const shelf=page.locator('.library-shelf');await shelf.waitFor();
 const books=page.locator('.library-book');assert.equal(await books.count(),3);
 async function check(rows,columns) {
   await page.waitForFunction(({rows,columns})=>{const el=document.querySelector('.library-shelf');return el?.dataset.rows===String(rows)&&Number(el.dataset.capacity)===rows*columns;},{rows,columns});
   await page.waitForTimeout(900);
   const tracks=await shelf.evaluate(el=>getComputedStyle(el).gridTemplateRows.split(' ').map(parseFloat).filter(v=>v>1));
   assert.equal(tracks.length,rows);
   assert.equal(await books.count(),3,'two stories and one creation book');
   const positions=await page.locator('.library-item').evaluateAll(items=>items.map(el=>({id:el.dataset.bookId,x:el.offsetLeft,y:el.offsetTop})));
   assert.equal(positions.at(-1).id,'__new_story__');
   if(columns===2) { assert.equal(positions[2].x,positions[0].x); assert.ok(positions[2].y>positions[0].y,'third book wraps to next row'); }
   else { assert.equal(positions[2].y,positions[0].y); assert.ok(positions[2].x>positions[1].x); }
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   // Near-camera props intentionally extend past the scene edges, without adding scroll.
   const room=await page.locator('.story-discovery').boundingBox();
   for (const side of ['left','right']) {
     const bounds=await page.locator('.library-foreground-'+side).boundingBox();
     assert.ok(bounds.width>=360,'foreground keeps furniture scale on narrow screens');
     assert.ok(bounds.y+bounds.height>room.y+room.height,'near-camera base leaves the frame');
     assert.ok(side==='left' ? bounds.x<room.x : bounds.x+bounds.width>room.x+room.width);
   }
 }
 await check(2,5);await page.screenshot({path:output+'/landscape.png',fullPage:true});
 const rabbit=page.getByRole('button',{name:'토끼와 자라 · 기본 이야기',exact:true});
 await rabbit.focus();
 await page.setViewportSize({width:820,height:1180});
 await page.waitForFunction(()=>document.getAnimations().some(a=>a.effect?.target?.matches?.('.library-item')));
 await check(3,3);
 assert.ok(await rabbit.evaluate(el=>el===document.activeElement),'focus survives layout changes');
 await page.screenshot({path:output+'/portrait-tablet.png',fullPage:true});
 // Interrupt several in-flight moves, including both sides of the orientation threshold.
 for(const [width,height] of [[950,760],[740,980],[1020,780],[590,980],[844,390],[390,844]]) {
   await page.setViewportSize({width,height});await page.waitForTimeout(80);
 }
 await check(3,2);
 assert.ok(await rabbit.evaluate(el=>el===document.activeElement));
 await page.screenshot({path:output+'/portrait-phone.png',fullPage:true});
 await page.getByRole('button',{name:'내 작품',exact:true}).click();
 assert.equal(await books.count(),1);
 const onlyBook=await page.locator('.library-item-new').boundingBox();
 const shelfLeft=await shelf.evaluate(el=>el.getBoundingClientRect().left+parseFloat(getComputedStyle(el).paddingLeft));
 assert.ok(Math.abs(onlyBook.x-shelfLeft)<2,'creation book alone starts at the left');
 assert.equal(await shelf.evaluate(el=>getComputedStyle(el).gridTemplateRows.split(' ').filter(v=>parseFloat(v)>1).length),3,'empty portrait keeps three shelves');
 await page.setViewportSize({width:844,height:390});
 await page.waitForTimeout(900);
 assert.equal(await shelf.getAttribute('data-rows'),'2');
 assert.equal(await shelf.getAttribute('data-capacity'),'6');
 assert.equal(await shelf.evaluate(el=>getComputedStyle(el).gridTemplateRows.split(' ').filter(v=>parseFloat(v)>1).length),2,'empty landscape keeps two shelves');
 await page.getByRole('button',{name:'모든 책',exact:true}).click();
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.setViewportSize({width:390,height:844});await page.waitForTimeout(100);
 assert.equal(await page.evaluate(()=>document.getAnimations().filter(a=>a.playState==='running').length),0,'reduced motion has no running effects');
 await rabbit.click();
 await page.setViewportSize({width:1365,height:900});
 await page.getByRole('dialog',{name:'토끼와 자라',exact:true}).waitFor();
 await page.keyboard.press('Escape');assert.ok(await rabbit.evaluate(el=>el===document.activeElement));
 await page.close();console.log('2/3 shelves, empty shelves, interrupted resize, live book motion, focus and reduced motion passed');
} finally {await browser.close();}
