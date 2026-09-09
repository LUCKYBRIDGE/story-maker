import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const output=process.env.QA_OUTPUT || '/tmp/story-flow-qa';await mkdir(output,{recursive:true});
import {execFileSync} from 'node:child_process';
const doc=execFileSync(process.execPath,['--experimental-strip-types','--experimental-loader=./tests/node-types-loader.mjs','--input-type=module','-e',`import {DEFAULT_PROJECT,cloneProject} from './app/story-data.ts';import {createStoryDocument} from './app/story-project-document.ts';const p=cloneProject(DEFAULT_PROJECT);p.chapters=p.chapters.slice(0,1);p.lines=[{...p.lines[0],text:'갈림길 앞에 섰어요.'}];console.log(JSON.stringify(createStoryDocument({project:p,savedAt:new Date().toISOString(),appVersion:'test'})));`],{encoding:'utf8'}).trim();
const browser=await chromium.launch({channel:'chrome',headless:true});const results=[];try { for(const [width,height] of [[1365,900],[820,1180],[390,844]]) { const page=await browser.newPage({viewport:{width,height}});console.log('viewport',width);const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(process.env.QA_URL || 'http://localhost:3002');await page.evaluate(doc=>{localStorage.setItem('storygame:draft:v1',doc);localStorage.setItem('storygame:active:v1',doc)},doc);await page.reload();await page.locator('.entry-template-options[open]').waitFor({state:'attached'});await page.getByRole('button',{name:'나만의 이야기 창작 공작소 열기'}).click();await page.getByRole('tab',{name:/이어만들기/}).click();await page.getByText('이 기기에서 이어만들기 ➔').click();await page.locator('.story-flow-editor summary').click();await page.getByRole('button',{name:'세 갈래 만들기',exact:true}).click();
for(let i=1;i<=3;i++) await page.getByLabel(`선택지 ${i} 문구`,{exact:true}).fill(`길 ${i}로 가기`);
await page.getByRole('button',{name:'갈래 1 쓰러 가기',exact:true}).click();
await page.getByLabel('현재 컷 글상자',{exact:true}).fill('첫 번째 갈래입니다.');
for(const [name,text] of [['갈래 2','두 번째 갈래입니다.'],['갈래 3','세 번째 갈래입니다.'],['다시 만나는 이야기','함께 다시 만났어요.']]) {
 if(await page.locator('.story-flow-overview').getAttribute('open')===null) await page.locator('.story-flow-overview summary').click();await page.locator('.story-flow-overview').getByRole('button',{name:`${name} · 1컷`,exact:true}).click();await page.getByLabel('현재 컷 글상자',{exact:true}).fill(text);
}
await page.getByRole('button',{name:'플레이에 적용',exact:true}).click();
await page.waitForFunction(()=>JSON.parse(localStorage.getItem('storygame:active:v1')).project.lines.some(line=>line.flow?.type==='choice'),null,{timeout:10000}).catch(async error=>{console.log(await page.locator('body').innerText());await page.screenshot({path:`${output}/apply-failure-${width}.png`,timeout:5000});throw error;});if(!await page.locator('.creator-primary-nav button').nth(2).isVisible())await page.getByRole('button',{name:/편집 방법·이 장 정보/}).click();await page.locator('.creator-primary-nav button').nth(2).click();await page.getByRole('button',{name:'이야기 펼치기',exact:true}).click();await page.locator('.player-choices').waitFor();console.log('playing',width);
assert.ok(await page.getByRole('button',{name:'다음 컷',exact:true}).isDisabled());
await page.locator('.player-shell').press('ArrowRight');assert.equal(await page.locator('.player-choices button').count(),3);
await page.screenshot({path:`${output}/choices-${width}.png`,fullPage:true});
for(const [i,text] of [[1,'첫 번째 갈래입니다.'],[2,'두 번째 갈래입니다.'],[3,'세 번째 갈래입니다.']]) {
 await page.getByRole('button',{name:`길 ${i}로 가기`,exact:true}).click();await page.getByText(text,{exact:true}).waitFor();
 await page.getByRole('button',{name:'다음 컷',exact:true}).click();await page.getByText('함께 다시 만났어요.',{exact:true}).waitFor();
 assert.ok(await page.getByRole('button',{name:'공연 마치기',exact:true}).isVisible());
 await page.getByRole('button',{name:'이전',exact:true}).click();await page.getByText(text,{exact:true}).waitFor();
 await page.getByRole('button',{name:'이전',exact:true}).click();await page.locator('.player-choices').waitFor();
}
assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
for(const button of await page.locator('.player-choices button').all()){const box=await button.boundingBox();assert.ok(box.height>=44);}
await page.getByRole('button',{name:'편집으로 돌아가기',exact:true}).click();
await page.reload();await page.locator('.entry-template-options[open]').waitFor({state:'attached'});
await page.getByRole('button',{name:'나만의 이야기 창작 공작소 열기'}).click();await page.getByRole('tab',{name:/이어만들기/}).click();await page.getByText('이 기기에서 이어만들기 ➔').click();
const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('storygame:draft:v1')).project);
assert.equal(saved.lines.find(l=>l.flow?.type==='choice').flow.options.length,3);
console.log('passed',width);assert.deepEqual(errors,[]);results.push({width,height,branches:3,join:true,previous:true,keyboard:true,reload:true});await page.close();
} await writeFile(`${output}/results.json`,JSON.stringify(results,null,2)); console.log(results);
} finally {await browser.close();}
