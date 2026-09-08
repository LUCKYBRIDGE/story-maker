// Existing Playwright installation; no project dependency. Start npm run dev first.
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const output=process.env.QA_OUTPUT || '/tmp/story-book-qa';await mkdir(output,{recursive:true});
const doc=execFileSync(process.execPath,['--disable-warning=ExperimentalWarning','--experimental-strip-types','--experimental-loader=./tests/node-types-loader.mjs','--input-type=module','-e',`
import {DEFAULT_PROJECT,cloneProject} from './app/story-data.ts';import {createStoryDocument} from './app/story-project-document.ts';
const p=cloneProject(DEFAULT_PROJECT);p.title='별을 배달하는 토끼';p.chapters=p.chapters.slice(0,2);p.creativeMemos=[];
p.lines=Array.from({length:3},(_,i)=>({...p.lines[0],id:'book-'+i,chapterId:p.chapters[i===2?1:0].id,order:i===2?1:i+1,text:'내 이야기의 '+(i+1)+'번째 장면',...(i===0?{effect:{type:'shake',intensity:'strong',trigger:'scene-enter',delayMs:0}}:{})}));
console.log(JSON.stringify(createStoryDocument({project:p,savedAt:new Date().toISOString(),appVersion:'test'})));
`],{encoding:'utf8'}).trim();
const browser=await chromium.launch({channel:'chrome',headless:true});
const results=[];
try {for(const viewport of [{width:1365,height:900},{width:390,height:844}]) {
 const context=await browser.newContext({viewport});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.env.QA_URL || 'http://localhost:3001');await page.evaluate(doc=>{localStorage.clear();localStorage.setItem('storygame:draft:v1',doc);localStorage.setItem('storygame:active:v1',doc);},doc);await page.reload();
 await page.getByText('터치하여 책 펼치기').click();
 await page.locator('.theater-curtain').waitFor();
 await page.locator('.theater-curtain').evaluate(el=>el.getAnimations({subtree:true}).forEach(a=>{a.pause();a.currentTime=420;}));
 await page.screenshot({path:path.join(output,`home-curtain-${viewport.width}.png`)});
 await page.getByRole('button',{name:'연출 건너뛰기'}).click();
 await page.getByRole('tab',{name:/이어만들기/}).click();
 assert.equal(await page.locator('.saved-book-preview .student-book-title').innerText(),'별을 배달하는 토끼');
 await page.getByText('이 기기에서 이어만들기 ➔').click();
 const open=page.getByRole('button',{name:'📖 내 책 표지 꾸미기'});await open.click();
 let dialog=page.getByRole('dialog',{name:'내 책 표지 꾸미기'});
 await dialog.getByLabel('작품 제목',{exact:true}).fill('취소할 제목');await page.keyboard.press('Escape');assert.ok(await open.evaluate(e=>e===document.activeElement));
 await open.click();assert.equal(await dialog.getByLabel('작품 제목',{exact:true}).inputValue(),'별을 배달하는 토끼');
 await dialog.getByLabel('지은이',{exact:true}).fill('달빛 작가');await dialog.getByLabel('표지 소개 문장',{exact:true}).fill('잃어버린 별은 어디로 갔을까?');
 await dialog.getByRole('button',{name:'그림 중심',exact:true}).click();
 await dialog.getByLabel('표지 색감',{exact:true}).selectOption('night');await dialog.getByLabel('제목 위치',{exact:true}).selectOption('top');await dialog.getByLabel('지은이 위치',{exact:true}).selectOption('bottom');
 await dialog.getByLabel('제목 크기',{exact:true}).fill('38');
 await dialog.getByText('표지 그림 고르기',{exact:true}).click();
 const background=dialog.getByLabel('배경 그림',{exact:true}), character=dialog.getByLabel('표지 인물',{exact:true});
 const initialBackground=await background.inputValue(), initialCharacter=await character.inputValue();
 await background.selectOption('');await character.selectOption('');assert.equal(await dialog.locator('.book-art img').count(),0);
 await background.selectOption(initialBackground);await character.selectOption(initialCharacter);await dialog.getByLabel('인물 위치',{exact:true}).selectOption('right');
 assert.equal(await dialog.locator('.student-book').getAttribute('data-character-position'),'right');await dialog.getByLabel('인물 위치',{exact:true}).selectOption('center');
 await dialog.getByText('표지 그림 고르기',{exact:true}).click();
 await dialog.getByText('뒤표지 · 작가의 말',{exact:true}).click();await dialog.getByLabel('독자에게 하고 싶은 말',{exact:true}).fill('작은 용기가 누군가의 밤을 밝힐 수 있다고 생각하며 썼어요.');
 await dialog.getByRole('button',{name:'앞표지 보기',exact:true}).click();
 // Review preview at the top; scrollable controls remain accessible below on mobile.
 await dialog.evaluate(el=>{el.scrollTop=0;});await page.screenshot({path:path.join(output,`editor-${viewport.width}.png`)});
 const dimensions=await dialog.evaluate(el=>({width:el.clientWidth,scroll:el.scrollWidth,buttons:[...el.querySelectorAll('button')].map(e=>e.getBoundingClientRect().height)}));assert.ok(dimensions.scroll<=dimensions.width+1);assert.ok(dimensions.buttons.every(h=>h>=44));
 // Long title/custom ink must wrap rather than escape the book. Changes are then restored.
 const long='별을 배달하는 토끼와 바다 건너 친구들이 함께 찾아 나선 아주아주 긴 밤의 비밀';
 await dialog.getByLabel('작품 제목',{exact:true}).fill(long);await dialog.getByLabel('제목 글자색',{exact:true}).fill('#eabb38');
 await dialog.evaluate(el=>{el.scrollTop=0;});await page.screenshot({path:path.join(output,`long-title-${viewport.width}.png`)});
 const overflow=await dialog.locator('.student-book').evaluate(el=>({w:el.clientWidth,s:el.scrollWidth,title:el.querySelector('.student-book-title').getBoundingClientRect().toJSON(),face:el.getBoundingClientRect().toJSON()}));assert.ok(overflow.s<=overflow.w+1);assert.ok(overflow.title.bottom<=overflow.face.bottom);
 await dialog.getByLabel('작품 제목',{exact:true}).fill('별을 배달하는 토끼');await dialog.getByRole('button',{name:'기본 글자색',exact:true}).click();await dialog.getByRole('button',{name:'표지 적용',exact:true}).click();
 await page.waitForFunction(()=>JSON.parse(localStorage.getItem('storygame:draft:v1')).project.cover?.author==='달빛 작가');
 assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('storygame:active:v1')).project.cover),undefined);
 await page.getByRole('button',{name:'플레이에 적용',exact:true}).click();await page.getByText(/플레이 적용 완료/).waitFor();
 await page.locator('.creator-primary-nav button').nth(2).click();
 await page.getByRole('button',{name:'이야기 펼치기',exact:true}).waitFor();assert.equal(await page.locator('.player-shell').count(),0);
 await page.screenshot({path:path.join(output,`cover-${viewport.width}.png`)});
 await page.getByRole('button',{name:'이야기 펼치기',exact:true}).click();
 await page.locator('.theater-curtain').waitFor();assert.equal(await page.locator('.player-shell').count(),0);
 const frameSample=await page.locator('.theater-curtain').evaluate(async el=>{const intervals=[];let prev=performance.now();const start=prev;while(performance.now()-start<600){await new Promise(requestAnimationFrame);const now=performance.now();intervals.push(now-prev);prev=now;}const sorted=intervals.slice(1).sort((a,b)=>a-b);return {meanMs:sorted.reduce((a,b)=>a+b,0)/sorted.length,p95Ms:sorted[Math.floor(sorted.length*.95)],panels:el.querySelectorAll('.theater-drape').length};});
 await page.locator('.player-shell').waitFor();
 assert.ok(await page.locator('.player-shell').evaluate(el=>el.getAnimations({subtree:true}).some(a=>a.effect.target.matches('.story-stage-canvas'))),'first cut effect starts after opening');
 await page.getByRole('button',{name:'다음 컷',exact:true}).click();
 await page.getByRole('button',{name:'이 컷 고치기',exact:true}).click();
 if(viewport.width<700) {
   await page.getByRole('button',{name:/편집 방법·이 장 정보/}).click();
   await page.locator('.mobile-chapter-picker select').selectOption({index:1});
 } else await page.locator('.chapter-rail > button').nth(1).click();
 await page.getByRole('button',{name:'이 장부터 보기',exact:true}).click();
 await page.locator('.player-shell').waitFor();assert.equal(await page.locator('.book-play-entry').count(),0);assert.equal(await page.locator('.theater-curtain').count(),0);
 await page.getByRole('button',{name:'편집으로 돌아가기',exact:true}).click();
 // End flow and back cover retain the student's words.
 await page.locator('.creator-primary-nav button').nth(2).click();await page.getByRole('button',{name:'이야기 펼치기',exact:true}).click();await page.getByRole('button',{name:'연출 건너뛰기'}).click();
 await page.locator('.player-shell').waitFor();await page.getByRole('button',{name:'다음 컷',exact:true}).click();await page.getByRole('button',{name:'다음 컷',exact:true}).click();await page.getByRole('button',{name:'공연 마치기',exact:true}).click();await page.getByRole('button',{name:'앞표지로',exact:true}).waitFor();
 assert.ok((await page.locator('.book-back-copy').innerText()).includes('작은 용기'));
 await page.screenshot({path:path.join(output,`back-${viewport.width}.png`)});
 await page.getByRole('button',{name:'편집으로 돌아가기',exact:true}).click();
 await page.reload();await page.getByText('터치하여 책 펼치기').click();await page.getByRole('tab',{name:/이어만들기/}).click();assert.ok((await page.locator('.saved-book-preview').innerText()).includes('달빛 작가'));
 await page.getByText('이 기기에서 이어만들기 ➔').click();await open.click();assert.equal(await dialog.getByLabel('지은이',{exact:true}).inputValue(),'달빛 작가');await dialog.getByRole('button',{name:'닫기',exact:true}).click();
 await page.emulateMedia({reducedMotion:'reduce'});await page.locator('.creator-primary-nav button').nth(2).click();await page.getByRole('button',{name:'이야기 펼치기',exact:true}).click();await page.locator('.player-shell').waitFor();assert.equal(await page.locator('.theater-curtain').count(),0);
 assert.deepEqual(errors,[]);results.push({viewport,frameSample,errors,coverRoundTrip:true,firstEffectAfterCurtain:true,keyboardCancel:true,reducedMotion:true,longTitleWrap:true,minButtonPx:44});console.log(JSON.stringify(results.at(-1)));await context.close();
}await writeFile(path.join(output,'results.json'),JSON.stringify(results,null,2));}finally{await browser.close();}
