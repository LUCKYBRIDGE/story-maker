import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
const doc=execFileSync(process.execPath,['--experimental-strip-types','--experimental-loader=./tests/node-types-loader.mjs','--input-type=module','-e',`
import {DEFAULT_PROJECT,cloneProject} from './app/story-data.ts';
import {createStoryDocument} from './app/story-project-document.ts';
const p=cloneProject(DEFAULT_PROJECT);p.chapters=p.chapters.slice(0,1);const l=p.lines[0];
p.lines=[{...l,id:'start',order:1,text:'어디로 갈까?',flow:{type:'choice',options:[{id:'a',label:'숲으로 간다',targetLineId:'next'},{id:'b',label:'바다로 간다',targetLineId:'next'}]}},{...l,id:'next',order:2,text:'천천히 걸었다.',flow:{type:'goto',targetLineId:'end'}},{...l,id:'end',order:3,text:'마지막 이야기. '.repeat(15),flow:{type:'choice',options:[{id:'c',label:'집에 돌아간다',targetLineId:null},{id:'d',label:'더 머문다',targetLineId:null}]}}];console.log(JSON.stringify(createStoryDocument({project:p,savedAt:new Date().toISOString(),appVersion:'qa'})));`],{encoding:'utf8'}).trim();
const browser=await chromium.launch();
try {
const page=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});
await page.goto(process.env.QA_URL||'http://localhost:3002');await page.evaluate(doc=>{localStorage.removeItem('storygame:projects:v1');localStorage.setItem('storygame:draft:v1',doc);localStorage.setItem('storygame:active:v1',doc)},doc);await page.reload();
await page.locator('.entry-template-options[open]').waitFor();await page.getByRole('button',{name:'나만의 이야기 창작 공작소 열기'}).click();await page.getByRole('button',{name:'이어만들기',exact:true}).click();
await page.locator('.creator-primary-nav button').last().click();await page.getByRole('button',{name:'이야기 펼치기',exact:true}).click();await page.locator('.player-shell').waitFor();
const actor=page.locator('.player-shell .story-stage-actor').first();const before=await actor.boundingBox();
const choiceBox=await page.locator('.dialogue-box').boundingBox();assert.ok(Math.abs(choiceBox.height-900*.35)<2);assert.ok(choiceBox.y>=0);
await page.locator('.reader-story-info summary').click();assert.deepEqual(await actor.boundingBox(),before);await page.locator('.reader-story-info summary').click();
await page.getByRole('button',{name:/바다로 간다/}).click();await page.getByRole('region',{name:'현재 대사',exact:true}).getByText('천천히 걸었다.').waitFor();
await page.reload();await page.locator('.player-shell').waitFor();
assert.equal(await page.locator('.reading-scroll .reading-paragraph').count(),1);
assert.deepEqual(await actor.boundingBox(),before);
await page.getByRole('button',{name:'지난 기록',exact:true}).click();let history=page.getByRole('dialog',{name:'지난 기록',exact:true});const hb=await history.boundingBox();assert.ok(hb.height>=900*.85);assert.ok(Math.abs(hb.x+hb.width/2-720)<2);assert.ok(Math.abs(hb.y+hb.height/2-450)<2);
assert.ok((await history.innerText()).includes('내 선택: 바다로 간다'));assert.ok(!(await history.innerText()).includes('내 선택: 숲으로 간다'));
await history.getByRole('button',{name:'닫기',exact:true}).click();
for(const [width,height] of [[1440,900],[390,844],[844,390]]){
 await page.setViewportSize({width,height});await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
 const box=await page.locator('.player-shell .dialogue-box').boundingBox();assert.ok(box.height<=height*.65+1);assert.ok(box.y+box.height<=height);console.log({width,height,speechHeight:box.height,max:height*.65});
}
await page.setViewportSize({width:1440,height:900});
await page.getByRole('button',{name:'이전',exact:true}).click();await page.getByRole('button',{name:/숲으로 간다/}).click();await page.getByRole('button',{name:'다음 컷',exact:true}).click();await page.getByRole('button',{name:/더 머문다/}).click();
await page.reload();await page.locator('.player-shell').waitFor();
await page.getByRole('button',{name:'지난 기록',exact:true}).click();history=page.getByRole('dialog',{name:'지난 기록',exact:true});const text=await history.innerText();assert.ok(text.includes('내 선택: 숲으로 간다'));assert.ok(text.includes('내 선택: 더 머문다'));assert.ok(!text.includes('내 선택: 바다로 간다'));
await page.screenshot({path:'/tmp/reader-history.png'});console.log('stable actors, separate transcript, exact choice and terminal choice, reselect: passed');
}finally{await browser.close();}
