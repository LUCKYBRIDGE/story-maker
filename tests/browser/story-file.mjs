import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readFile} from 'node:fs/promises';
import {launchBrowser} from './support/runtime.mjs';
const key='storygame:projects:v1',output='/tmp/story-file-qa';
const fixture=JSON.parse(execFileSync(process.execPath,['--disable-warning=ExperimentalWarning','--experimental-strip-types','--experimental-loader=./tests/node-types-loader.mjs','--input-type=module','-e',`
import {DEFAULT_PROJECT,cloneProject} from './app/story-data.ts';
import {createStoryDocument} from './app/story-project-document.ts';
import {createNolstoryProject,createNolstoryShared,encodeNolstoryFile} from './app/story-file.ts';
const project=id=>({...cloneProject(DEFAULT_PROJECT),id,title:'파일 작품 '+id});
const doc=p=>createStoryDocument({project:p,savedAt:'2026-09-10T00:00:00.000Z',appVersion:'qa'});
const entry=id=>({draft:doc(project(id)),playback:doc({...project(id),title:'적용본 '+id})});
console.log(JSON.stringify({a:encodeNolstoryFile(createNolstoryProject(entry('a'))),b:encodeNolstoryFile(createNolstoryProject(entry('b'))),c:encodeNolstoryFile(createNolstoryProject(entry('c'))),remix:encodeNolstoryFile(createNolstoryShared(project('remix-source'),true)),shared:encodeNolstoryFile(createNolstoryShared(project('shared')))}));
`],{encoding:'utf8'}));
const browser=await launchBrowser(output);
const read=page=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)),key);
async function hub(page) {
 await page.locator('.entry-template-options[open]').waitFor({state:'attached'});
 await page.getByRole('button',{name:'나만의 이야기 창작 공작소 열기'}).click();
 await page.getByRole('heading',{name:'창작 관리',exact:true}).waitFor();
}
async function open(page,text) {
 await page.locator('input[accept=".nolstory"]').setInputFiles({name:'fixture.nolstory',mimeType:'application/json',buffer:Buffer.from(text)});
 await page.getByRole('dialog',{name:'놀스토리 파일 열기'}).waitFor();
}
async function toHub(page) {await page.getByRole('button',{name:'창작 관리',exact:true}).click();await page.getByRole('heading',{name:'창작 관리',exact:true}).waitFor();}
try {
 for(const [width,height] of [[1365,900],[390,844]]) {
 const page=await browser.newPage({viewport:{width,height},reducedMotion:'reduce'});
 await page.goto(process.env.QA_URL||'http://localhost:3003');await hub(page);
 await open(page,fixture.a);await page.getByRole('button',{name:'편집본으로 추가',exact:true}).click();await toHub(page);
 await open(page,fixture.b);await page.getByRole('button',{name:'편집본으로 추가',exact:true}).click();await toHub(page);
 let saved=await read(page);assert.equal(saved.projects.length,2);assert.equal(saved.projects[0].playback.project.title,'적용본 a');
 // Full slots block a third edit; reading remains available without changing storage.
 await open(page,fixture.remix);assert.ok(await page.getByRole('button',{name:'새 작품으로 고쳐 쓰기',exact:true}).isDisabled());await page.getByRole('dialog').getByRole('button',{name:'닫기',exact:true}).click();
 await open(page,fixture.c);await page.getByRole('button',{name:'편집본으로 추가',exact:true}).click();
 await page.getByRole('dialog').getByRole('alert').waitFor();assert.deepEqual((await read(page)).projects.map(e=>e.draft.project),saved.projects.map(e=>e.draft.project));
 await page.getByRole('dialog').getByRole('button',{name:'닫기',exact:true}).click();
 const replacement=JSON.parse(fixture.a);replacement.draft.project.title='바뀐 편집본';replacement.playback.project.title='바뀐 적용본';
 await open(page,JSON.stringify(replacement));await page.getByRole('button',{name:'기기에 보관한 작품 유지',exact:true}).click();assert.equal((await read(page)).projects[0].draft.project.title,'파일 작품 a');
 await open(page,JSON.stringify(replacement));
 for(const button of await page.getByRole('dialog').getByRole('button').all()) assert.ok((await button.boundingBox()).height>=44);
 await page.screenshot({path:output+'/replace-'+width+'.png',fullPage:true});
 await page.getByRole('button',{name:'파일 버전으로 교체',exact:true}).click();await toHub(page);
 saved=await read(page);assert.equal(saved.projects[0].draft.project.title,'바뀐 편집본');assert.equal(saved.projects[0].playback.project.title,'바뀐 적용본');assert.equal(saved.projects[1].draft.project.title,'파일 작품 b');
 const downloadPromise=page.waitForEvent('download');await page.getByRole('article',{name:'바뀐 편집본',exact:true}).getByRole('button',{name:'파일로 보관',exact:true}).click();
 const download=await downloadPromise;assert.ok(download.suggestedFilename().endsWith('-project.nolstory'));
 const backup=JSON.parse(await readFile(await download.path(),'utf8'));assert.deepEqual(backup.draft.project,saved.projects[0].draft.project);assert.deepEqual(backup.playback,saved.projects[0].playback);
 const beforeShared=await page.evaluate(key=>localStorage.getItem(key),key);
 await open(page,fixture.shared);assert.equal(await page.getByRole('button',{name:'편집본으로 추가',exact:true}).count(),0);
 await page.getByRole('button',{name:'파일의 플레이 버전 읽기',exact:true}).click();await page.getByRole('button',{name:'이야기 펼치기',exact:true}).click();await page.locator('.player-shell').waitFor();
 assert.equal(await page.evaluate(key=>localStorage.getItem(key),key),beforeShared);
 await page.getByRole('button',{name:'돌아가기',exact:true}).click();await page.getByRole('button',{name:'창작 관리로 돌아가기',exact:true}).click();
 await page.reload();await hub(page);assert.deepEqual(await read(page),saved);
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 if(width===1365) {
 await page.getByRole('article',{name:'바뀐 편집본',exact:true}).getByRole('button',{name:'이어만들기',exact:true}).click();
 await page.getByRole('button',{name:'파일·복구',exact:true}).click();
 const sharedDownload=page.waitForEvent('download');await page.getByRole('button',{name:'공유 파일로 보관',exact:true}).click();
 const shared=JSON.parse(await readFile(await (await sharedDownload).path(),'utf8'));
 assert.equal(shared.manifest.kind,'shared');assert.equal(shared.story.project.title,'바뀐 적용본');assert.equal(shared.sharing.allowRemix,false);
 await page.evaluate(()=>{const original=Storage.prototype.setItem;window.restoreFileStorage=()=>{Storage.prototype.setItem=original;};Storage.prototype.setItem=function(k,v){if(k==='storygame:projects:v1')throw new DOMException('quota','QuotaExceededError');return original.call(this,k,v);};});
 await page.getByRole('button',{name:/이야기 구성/}).click();
 await page.getByText('작품 기본·큰 생각·이야기 뼈대',{exact:true}).click();
 await page.getByRole('textbox',{name:'이야기 제목',exact:true}).fill('저장 실패 중 최신 제목');
 const emergency=page.waitForEvent('download');await page.getByRole('button',{name:'.nolstory 편집 백업',exact:true}).click();
 const recovered=JSON.parse(await readFile(await (await emergency).path(),'utf8'));
 assert.equal(recovered.draft.project.title,'저장 실패 중 최신 제목');assert.equal(recovered.playback.project.title,'바뀐 적용본');
 assert.equal((await read(page)).projects[0].draft.project.title,'바뀐 편집본');
 await page.evaluate(()=>window.restoreFileStorage());
 }
 await page.close();console.log('story-file '+width+' passed');
 }
 const page=await browser.newPage({viewport:{width:1365,height:900}});
 await page.goto(process.env.QA_URL||'http://localhost:3003');await hub(page);
 await open(page,fixture.remix);await page.getByRole('button',{name:'파일의 플레이 버전 읽기',exact:true}).click();
 await page.getByRole('button',{name:'이야기 펼치기',exact:true}).click();await page.locator('.player-shell').waitFor();
 await page.getByRole('button',{name:'돌아가기',exact:true}).click();await page.getByRole('button',{name:'창작 관리로 돌아가기',exact:true}).click();
 await page.getByRole('button',{name:'메인으로',exact:true}).click();await page.getByRole('button',{name:/이야기 변경/}).click();
 await page.getByRole('button',{name:'토끼와 자라 · 기본 이야기',exact:true}).click();await page.getByRole('button',{name:'공유 작품 보기',exact:true}).click();
 await page.getByRole('button',{name:'고쳐 쓰기',exact:true}).click();
 await page.getByRole('button',{name:'새 작품으로 고쳐 쓰기',exact:true}).click();await toHub(page);
 const remixed=(await read(page)).projects[0].draft.project;
 assert.notEqual(remixed.id,'remix-source');assert.equal(remixed.source.kind,'sharedFile');assert.equal(remixed.source.originalTitle,'파일 작품 remix-source');assert.match(remixed.source.originalFingerprint,/^sha256:/);
 await page.close();console.log('shared remix passed');
} finally {await browser.close();}
