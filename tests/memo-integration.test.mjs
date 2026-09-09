import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
function run(script) {return JSON.parse(execFileSync(process.execPath,['--disable-warning=ExperimentalWarning','--experimental-strip-types','--experimental-loader=./tests/node-types-loader.mjs','--input-type=module','-e',`
const sheet=await import('./app/story-sheet.ts');
const {createCurrentV1ProjectFixture}=await import('./tests/fixtures/story-projects.mjs');
const p=createCurrentV1ProjectFixture();
${script}`],{encoding:'utf8'}));}
test('memo text, scope, branches and cover survive Excel and public-sheet CSV together',()=>{
 const r=run(String.raw`
 const {createStoryWorkbook,readStoryWorkbook}=await import('./app/story-workbook.ts');
 const {STORY_ASSETS}=await import('./app/story-assets.ts');
 const {createCreativeMemo}=await import('./app/creative-memos.ts');
 const {createStoryBranches}=await import('./app/story-flow.ts');
 const {createStoryDocument,parseStoryDocument}=await import('./app/story-project-document.ts');
 const {DEFAULT_COVER}=await import('./app/story-cover.ts');
 const memo=createCreativeMemo('free',1);memo.title='참고';memo.linkedChapterId=p.chapters[0].id;memo.fields[0].value='  따옴표 "생각", 쉼표\n둘째 줄\n'+'긴 메모 '.repeat(1200);p.creativeMemos=[memo];p.cover={...DEFAULT_COVER,author:'기억하는 작가'};
 let i=0;const original=createStoryBranches(p,p.lines[0].id,3,()=> 'flow-'+(++i));
 const workbook=createStoryWorkbook(original,STORY_ASSETS);
 const snapshot=await readStoryWorkbook(new File([await workbook.xlsx.writeBuffer()],'memo.xlsx'));
 const tabs=Object.values(snapshot).filter(value=>value&&typeof value==='object'&&'csv' in value);
 globalThis.fetch=async url=>{const name=new URL(url).searchParams.get('sheet');const tab=tabs.find(tab=>tab.name===name);return new Response(tab?.csv??'',{status:tab?200:404});};
 const fetched=await sheet.fetchSheetSnapshot('fixture',new AbortController().signal);
 const results=[sheet.importStoryProject(snapshot,''),sheet.importStoryProject(fetched,'https://docs.google.com/spreadsheets/d/fixture/edit')];
 const doc=parseStoryDocument(createStoryDocument({project:original,savedAt:'2026-09-09T00:00:00.000Z',appVersion:'test'}));
 console.log(JSON.stringify({results,doc,original}));`);
 assert.equal(r.doc.ok,true);
 for(const result of r.results){assert.equal(result.ok,true,JSON.stringify(result));assert.equal(result.project.creativeMemos[0].fields[0].value,r.original.creativeMemos[0].fields[0].value);assert.equal(result.project.creativeMemos[0].linkedChapterId,r.original.creativeMemos[0].linkedChapterId);assert.deepEqual(result.project.cover,r.original.cover);for(const l of r.original.lines)assert.deepEqual(result.project.lines.find(x=>x.id===l.id).flow,l.flow);}
});
for(const failure of ['server','denied','network','html','abort'])test(`public-sheet ${failure} on optional memo tab must stop import`,()=>{
 const r=run(`
 const controller=new AbortController();
 globalThis.fetch=async url=>{if(new URL(url).searchParams.get('sheet')!=='창작 메모')return new Response('ID,내용\\n1,자료');
 if('${failure}'==='network')throw new TypeError('offline');
 if('${failure}'==='abort'){controller.abort();throw new DOMException('중지','AbortError');}
 if('${failure}'==='html')return new Response('<!doctype html><html>login</html>');
 return new Response('error',{status:'${failure}'==='server'?500:403});};
 let failed=false;try{await sheet.fetchSheetSnapshot('fixture',controller.signal);}catch{failed=true;}console.log(JSON.stringify({failed}));`);assert.equal(r.failed,true);
});
test('public-sheet legacy missing memo tab remains supported',()=>{
 const r=run(`globalThis.fetch=async url=>new Response(new URL(url).searchParams.get('sheet')==='창작 메모'?'':'ID,내용',{status:new URL(url).searchParams.get('sheet')==='창작 메모'?404:200});const result=await sheet.fetchSheetSnapshot('fixture',new AbortController().signal);console.log(JSON.stringify({csv:result.creativeMemos.csv}));`);assert.equal(r.csv,'');
});
