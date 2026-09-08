import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import test from 'node:test';
function run(script) {
  return JSON.parse(execFileSync(process.execPath,['--disable-warning=ExperimentalWarning','--experimental-strip-types','--experimental-loader=./tests/node-types-loader.mjs','--input-type=module','-e',`
    const covers=await import('./app/story-cover.ts');
    const {createCurrentV1ProjectFixture}=await import('./tests/fixtures/story-projects.mjs');
    const project=createCurrentV1ProjectFixture();
    const cover={...covers.resolveStoryCover(project),author:'  별빛 작가  ',subtitle:'첫 줄\\n둘째 줄, "비밀"',authorNote:'작가의 말\\n끝.',layout:'picture',titlePosition:'bottom',authorPosition:'under-title',align:'left',font:'sans',titleSize:42,titleColor:'#edc570'};
    ${script}
  `],{encoding:'utf8'}));
}
test('cover: legacy projects receive a deterministic default without mutation',()=>{
  const r=run(`const before=JSON.stringify(project); const a=covers.resolveStoryCover(project);const b=covers.resolveStoryCover(project);console.log(JSON.stringify({a,b,unchanged:before===JSON.stringify(project),valid:covers.isStoryCover(a)}));`);
  assert.deepEqual(r.a,r.b);assert.equal(r.unchanged,true);assert.equal(r.valid,true);assert.equal(r.a.author,'');assert.equal(r.a.titlePosition,'top');
});
test('cover: safe presets and custom color panel maintain a usable contract',()=>{
  const r=run(`console.log(JSON.stringify({presets:['classic','picture','bold'].map(l=>covers.isStoryCover({...cover,...covers.coverPreset(l)})),dark:covers.coverTextPanel('#000000'),light:covers.coverTextPanel('#ffffff'),bad:[null,{},...['layout','font','theme','authorPosition','titlePosition','align','characterPosition'].map(k=>({...cover,[k]:'oops'})),...[-1,53,NaN,'36'].map(titleSize=>({...cover,titleSize})),{...cover,titleColor:'url(x)'},{...cover,author:null}].map(covers.isStoryCover)}));`);
  assert.ok(r.presets.every(Boolean));assert.ok(r.bad.every(v=>!v));assert.equal(r.dark,'#ffffff');assert.equal(r.light,'#111111');
});
test('cover: local draft, active playback snapshot and clone retain customization',()=>{
  const r=run(`const {createLocalStoryProjectRepository}=await import('./app/story-project-repository.ts');const {cloneProject}=await import('./app/story-data.ts');const map=new Map();const repo=createLocalStoryProjectRepository({storage:{getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v)}});project.cover=cover;repo.saveDraft(project);repo.saveActive(project);const cloned=cloneProject(project);cloned.cover.author='new';console.log(JSON.stringify({expected:cover,draft:repo.loadDraft(),active:repo.loadActive(),original:project.cover}));`);
  assert.equal(r.draft.ok,true);assert.equal(r.active.ok,true);assert.deepEqual(r.draft.project.cover,r.expected);assert.deepEqual(r.active.project.cover,r.expected);assert.deepEqual(r.original,r.expected);
});
test('cover: actual XLSX round trip keeps text whitespace, title and every design field',()=>{
  const r=run(`const {createStoryWorkbook,readStoryWorkbook}=await import('./app/story-workbook.ts');const {importStoryProject}=await import('./app/story-sheet.ts');const {STORY_ASSETS}=await import('./app/story-assets.ts');project.cover=cover;const workbook=createStoryWorkbook(project,STORY_ASSETS);const imported=importStoryProject(await readStoryWorkbook(new File([await workbook.xlsx.writeBuffer()],'cover.xlsx')),'');console.log(JSON.stringify({expected:cover,title:project.title,imported}));`);
  assert.equal(r.imported.ok,true,JSON.stringify(r.imported));assert.deepEqual(r.imported.project.cover,r.expected);assert.equal(r.imported.project.title,r.title);
});
test('cover: malformed document and Excel metadata are rejected with a location',()=>{
  const r=run(`const {createStoryDocument,parseStoryDocument}=await import('./app/story-project-document.ts');const {createStoryWorkbook,readStoryWorkbook}=await import('./app/story-workbook.ts');const {importStoryProject}=await import('./app/story-sheet.ts');const {STORY_ASSETS}=await import('./app/story-assets.ts');project.cover={...cover,titleSize:900};const doc=createStoryDocument({project,savedAt:'2026-09-08T00:00:00.000Z',appVersion:'test'});const workbook=createStoryWorkbook(project,STORY_ASSETS);console.log(JSON.stringify({doc:parseStoryDocument(doc),excel:importStoryProject(await readStoryWorkbook(new File([await workbook.xlsx.writeBuffer()],'bad.xlsx')),'')}));`);
  assert.equal(r.doc.ok,false);assert.equal(r.excel.ok,false);assert.ok(r.doc.issues.some(i=>i.path==='$.project.cover'));assert.ok(r.excel.issues.some(i=>i.message.includes('표지')));
});
test('cover: empty optional workbook rows preserve legacy absence',()=>{
  const r=run(`const {createStoryWorkbook,readStoryWorkbook}=await import('./app/story-workbook.ts');const {importStoryProject}=await import('./app/story-sheet.ts');const {STORY_ASSETS}=await import('./app/story-assets.ts');const workbook=createStoryWorkbook(project,STORY_ASSETS);console.log(JSON.stringify(importStoryProject(await readStoryWorkbook(new File([await workbook.xlsx.writeBuffer()],'legacy.xlsx')),'')));`);
  assert.equal(r.ok,true);assert.equal(r.project.cover,undefined);
});

test('cover: long titles fit with proportional sizing and never grow past the chosen size',()=>{
  const r=run(`console.log(JSON.stringify({short:covers.coverTitleSize('별을 찾아서',36),long:covers.coverTitleSize('별을 찾아 나선 친구들의 아주아주 길고 특별한 모험 이야기',36),small:covers.coverTitleSize('별',24)}));`);
  assert.equal(r.short,36);assert.ok(r.long<36 && r.long>=14);assert.equal(r.small,24);
});
