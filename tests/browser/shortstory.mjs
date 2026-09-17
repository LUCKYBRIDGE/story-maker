import assert from 'node:assert/strict';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {chromium} from 'playwright';
const output='/tmp/shortstory-browser';await mkdir(output,{recursive:true});
const browser=await chromium.launch({headless:true,...(process.env.QA_CHANNEL?{channel:process.env.QA_CHANNEL}:{})});
try {
const page=await browser.newPage({viewport:{width:1365,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto(process.env.QA_URL||'http://localhost:3100');await page.getByRole('button',{name:'서재 입장',exact:true}).click();
await page.getByRole('button',{name:'별주부전 · 기본 이야기',exact:true}).click();
assert.equal(await page.getByRole('button',{name:'별주부전 원작 읽기',exact:true}).count(),1);
await page.getByRole('button',{name:/숏스토리 짧은 그림책/}).click();
await page.getByRole('button',{name:'책 펼치기',exact:true}).click();await page.getByRole('heading',{name:'용궁의 근심',exact:true}).waitFor();
await page.getByRole('button',{name:'한눈에 보기',exact:true}).click();assert.equal(await page.locator('.short-grid article').count(),8);
await page.screenshot({path:output+'/overview.png',fullPage:true});
await page.getByRole('button',{name:'직접 만들어 보기',exact:true}).click();
await page.getByLabel('책 제목',{exact:true}).fill('테스트 그림책');
await page.getByRole('article',{name:'1쪽 편집',exact:true}).getByLabel('글',{exact:true}).fill('내가 쓴 새로운 첫 장면');
await page.getByRole('article',{name:'1쪽 편집',exact:true}).getByRole('button',{name:'복제',exact:true}).click();
await page.getByRole('button',{name:'2쪽 뒤로',exact:true}).click();
await page.getByRole('button',{name:'장면 추가',exact:false}).click();
assert.equal(await page.locator('.short-editor-grid article').count(),10);
const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('storygame:shortstories:v1')).projects[0]);assert.equal(saved.pages.length,10);assert.equal(saved.pages[0].text,'내가 쓴 새로운 첫 장면');
let download=page.waitForEvent('download');await page.getByRole('button',{name:'작업 파일로 저장',exact:true}).click();const file=await download;await file.saveAs(output+'/work.shortstory');
const data=JSON.parse(await readFile(output+'/work.shortstory','utf8'));assert.equal(data.project.pages.length,10);
download=page.waitForEvent('download');await page.getByRole('button',{name:'친구에게 공유 · HTML',exact:true}).click();await(await download).saveAs(output+'/story.html');
await page.screenshot({path:output+'/editor.png',fullPage:true});
await page.getByText('Excel·시트·인쇄',{exact:true}).click();await page.getByRole('button',{name:'소책자 인쇄',exact:true}).click();assert.equal(await page.locator('.short-print-page').count(),12);assert.ok(await page.getByRole('button',{name:'인쇄 / PDF 저장',exact:true}).isEnabled());await page.pdf({path:output+'/booklet.pdf',preferCSSPageSize:true,printBackground:true});await page.getByRole('button',{name:'닫기',exact:true}).click();await page.getByText('Excel·시트·인쇄',{exact:true}).click();
await page.setViewportSize({width:390,height:844});await page.screenshot({path:output+'/mobile.png',fullPage:true});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
await page.getByRole('button',{name:'← 서재로',exact:true}).click();await page.getByRole('button',{name:'내 작품',exact:true}).click();await page.getByRole('button',{name:'테스트 그림책 · 내 작품',exact:true}).click();await page.getByRole('button',{name:'이어만들기',exact:true}).click();assert.equal(await page.getByLabel('책 제목',{exact:true}).inputValue(),'테스트 그림책');
await page.getByRole('button',{name:'← 서재로',exact:true}).click();
await page.locator('input[accept=".knolstory,.nolstory,.shortstory"]').first().setInputFiles(output+'/work.shortstory');await page.getByLabel('책 제목',{exact:true}).waitFor();
assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('storygame:shortstories:v1')).projects.length),2);
await page.getByRole('button',{name:'← 서재로',exact:true}).click();
const before=await page.evaluate(()=>localStorage.getItem('storygame:shortstories:v1'));
await page.locator('input[accept=".knolstory,.nolstory,.shortstory"]').first().setInputFiles({name:'bad.shortstory',mimeType:'application/json',buffer:Buffer.from('{broken')});
await page.getByRole('alert').filter({hasText:'파일 내용을 읽지 못했어요'}).waitFor();
assert.equal(await page.evaluate(()=>localStorage.getItem('storygame:shortstories:v1')),before);
// Real file:// opening, without a server upload or an application route.
const shared=await browser.newPage();await shared.goto('file://'+output+'/story.html');await shared.getByRole('button',{name:'책 펼치기',exact:true}).click();assert.ok(await shared.getByText('내가 쓴 새로운 첫 장면',{exact:true}).isVisible());await shared.getByRole('button',{name:'한눈에 보기',exact:true}).click();assert.equal(await shared.locator('article').count(),10);
await shared.screenshot({path:output+'/html.png',fullPage:true});
await shared.route('https://luckybridge.github.io/**',route=>route.abort());await shared.goto('file://'+output+'/story.html');await shared.locator('#network:not([hidden])').waitFor();await shared.unroute('https://luckybridge.github.io/**');
const game=await browser.newPage();await game.goto(process.env.QA_URL||'http://localhost:3100');await game.getByRole('button',{name:'나만의 이야기',exact:true}).click();
const gameFile=execFileSync(process.execPath,['--disable-warning=ExperimentalWarning','--experimental-strip-types','--experimental-loader=./tests/node-types-loader.mjs','--input-type=module','-e',`
import {cloneProject,DEFAULT_PROJECT} from './app/story-data.ts';import {createStoryDocument} from './app/story-project-document.ts';import {createKnolstoryProject,encodeKnolstoryFile} from './app/story-file.ts';
const draft={...cloneProject(DEFAULT_PROJECT),id:'html-ui-game',title:'편집 중인 제목'},playback={...draft,title:'친구가 읽는 적용본'};const doc=project=>createStoryDocument({project,savedAt:'2026-09-17T00:00:00.000Z',appVersion:'qa'});console.log(encodeKnolstoryFile(createKnolstoryProject({draft:doc(draft),playback:doc(playback)})));
`],{encoding:'utf8'});
await game.locator('input[accept*=knolstory]').setInputFiles({name:'game.knolstory',mimeType:'application/json',buffer:Buffer.from(gameFile)});await game.getByRole('button',{name:'편집본으로 추가',exact:true}).click();await game.getByRole('button',{name:'파일·복구',exact:true}).click();const gameDownload=game.waitForEvent('download');await game.getByRole('button',{name:'친구에게 공유 · HTML',exact:true}).click();const gameHtml=await readFile(await(await gameDownload).path(),'utf8');assert.equal(JSON.parse(gameHtml.match(/<script id="story-data" type="application\/json">([\s\S]*?)<\/script>/)[1]).payload.title,'친구가 읽는 적용본');
const payload=execFileSync(process.execPath,['--disable-warning=ExperimentalWarning','--experimental-strip-types','--experimental-loader=./tests/node-types-loader.mjs','--input-type=module','-e',`
import {cloneProject,DEFAULT_PROJECT} from './app/story-data.ts';import {knolStoryPayload} from './app/share/share-payload.ts';import {createShareHtml} from './app/share/share-html-export.ts';
const p=cloneProject(DEFAULT_PROJECT);p.chapters=p.chapters.slice(0,1);p.lines=p.lines.filter(l=>l.chapterId===p.chapters[0].id).slice(0,3);p.lines.forEach(l=>delete l.flow);p.lines[0].flow={type:'choice',options:[{id:'a',label:'두 번째 장면',targetLineId:p.lines[1].id},{id:'b',label:'바로 끝내기',targetLineId:null}]};console.log(createShareHtml(knolStoryPayload(p)));
`],{encoding:'utf8'});
await writeFile(output+'/knol.html',payload);await shared.goto('file://'+output+'/knol.html');await shared.getByRole('button',{name:'책 펼치기',exact:true}).click();await shared.getByRole('button',{name:'바로 끝내기',exact:true}).click();await shared.getByRole('heading',{name:'이야기 끝',exact:true}).waitFor();await shared.getByRole('button',{name:'이전',exact:true}).click();await shared.getByRole('button',{name:'두 번째 장면',exact:true}).click();
assert.deepEqual(errors,[]);console.log('PASS: reader, editor, library resume, file round-trip, invalid import preservation, mobile layout, file:// HTML, game branching.');
} finally {await browser.close();}
