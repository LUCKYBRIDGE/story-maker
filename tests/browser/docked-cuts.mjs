import { selectLocalBook } from './support/library-entry.mjs';
import { launchBrowser } from './support/runtime.mjs';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
const output='/tmp/docked-cut-qa';
const doc=execFileSync(process.execPath,['--experimental-strip-types','--experimental-loader=./tests/node-types-loader.mjs','--input-type=module','-e',`import {DEFAULT_PROJECT,cloneProject} from './app/story-data.ts';import {createStoryDocument} from './app/story-project-document.ts';const p=cloneProject(DEFAULT_PROJECT);p.chapters=p.chapters.slice(0,1);p.lines=[{...p.lines[0],text:'메모를 참고하며 글을 써요.'},{...p.lines[0],id:'second',order:2,text:'다음 컷'}];p.creativeMemos=[];console.log(JSON.stringify(createStoryDocument({project:p,savedAt:new Date().toISOString(),appVersion:'test'})));`],{encoding:'utf8'}).trim();

const browser=await launchBrowser(output);
try { for (const [width,height] of JSON.parse(process.env.QA_VIEWPORTS || "[[1365,900],[820,1180],[390,844]]")) {
 const page=await browser.newPage({viewport:{width,height}});
 await page.goto(process.env.QA_URL || 'http://localhost:3002');
 await page.evaluate(doc=>{localStorage.removeItem('storygame:projects:v1');localStorage.setItem('storygame:draft:v1',doc);localStorage.setItem('storygame:active:v1',doc)},doc);
 await page.reload();
 await selectLocalBook(page);

 await page.getByRole('button',{name:'이어만들기',exact:true}).click();
 await page.getByRole('button',{name:'컷 꾸미기',exact:true}).first().click();
 const input=page.getByLabel('현재 컷 글상자',{exact:true});
 const dock=page.getByRole('navigation',{name:'항상 보이는 컷 이동'});
 await input.fill('내가 고친 대사');
 await input.press('Alt+ArrowRight');
 await page.waitForFunction(()=>document.querySelector('.scene-focus-editor')?.getAttribute('data-line-id')==='second');
 assert.equal(await input.inputValue(),'다음 컷');
 assert.ok(await input.evaluate(el=>el===document.activeElement));
 assert.ok(await dock.getByRole('button',{name:'다음 컷 ▶',exact:true}).isDisabled());
 await input.press('Alt+ArrowLeft');
 await page.waitForFunction(()=>document.querySelector('.scene-focus-editor')?.getAttribute('data-line-id')!=='second');
 assert.equal(await input.inputValue(),'내가 고친 대사');
 await input.dispatchEvent('keydown',{key:'ArrowRight',altKey:true,isComposing:true});
 assert.equal(await input.inputValue(),'내가 고친 대사');
 await page.evaluate(()=>scrollTo(0,document.body.scrollHeight));
 const box=await dock.boundingBox(); assert.ok(box.y>=0 && box.y+box.height<=height+1);
 for(const button of await dock.locator('button').all()) assert.ok((await button.boundingBox()).height>=44);
 await dock.getByRole('button',{name:'+ 컷 추가',exact:true}).click();
 await page.waitForFunction(()=>JSON.parse(localStorage.getItem('storygame:projects:v1')).projects[0].draft.project.lines.length===3);
 assert.equal(await input.inputValue(),'');
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await input.scrollIntoViewIfNeeded();
 await page.screenshot({path:`${output}/editor-${width}.png`,fullPage:false});
 await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
 await page.getByRole('button',{name:'이 장 대본으로',exact:true}).focus();
 await page.getByRole('button',{name:'이 장 대본으로',exact:true}).press('Enter');
 await page.locator('.chapter-script-editor').waitFor({state:'visible'});
 assert.ok(await dock.isVisible());
 await dock.getByRole('button',{name:'다음 컷 ▶',exact:true}).click();
 await page.waitForFunction(()=>document.querySelector('.script-scene-card.active textarea')?.value==='다음 컷');
 console.log({width,height,docked:true,typingPreserved:true,imeGuard:true,add:true,manuscript:true});
 await page.close();
} } finally { await browser.close(); }
