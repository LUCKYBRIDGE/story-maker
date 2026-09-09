import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import test from 'node:test';
function run(script) { return JSON.parse(execFileSync(process.execPath,['--disable-warning=ExperimentalWarning','--experimental-strip-types','--experimental-loader=./tests/node-types-loader.mjs','--input-type=module','-e',`
const flow=await import('./app/story-flow.ts');
const commands=await import('./app/story-commands.ts');
const {createCurrentV1ProjectFixture}=await import('./tests/fixtures/story-projects.mjs');
const p=createCurrentV1ProjectFixture(); let n=0; const id=()=> 'new-'+(++n);
${script}`],{encoding:'utf8'})); }
for(const count of [2,3]) test(`${count} choices split, rejoin and continue without falling into another branch`,()=>{
 const r=run(`const source=flow.orderedStoryFlowLines(p)[0];const next=flow.orderedStoryFlowLines(p)[1].id;const branched=flow.createStoryBranches(p,source.id,${count},id);const lines=flow.orderedStoryFlowLines(branched);const choice=lines.find(l=>l.id===source.id);const paths=choice.flow.options.map(o=>{const branch=lines.find(l=>l.id===o.targetLineId);const join=lines.find(l=>l.id===branch.flow.targetLineId);return {branch:branch.id,join:join.id,next:join.flow.targetLineId};});console.log(JSON.stringify({paths,next,issues:flow.findStoryFlowIssues(branched),original:p.lines.length,after:branched.lines.length}));`);
 assert.equal(r.paths.length,count);assert.equal(new Set(r.paths.map(p=>p.branch)).size,count);assert.equal(new Set(r.paths.map(p=>p.join)).size,1);assert.ok(r.paths.every(p=>p.next===r.next));assert.deepEqual(r.issues,[]);assert.equal(r.after,r.original+count+1);
});
test('flow validation rejects invalid counts, duplicate option IDs and cycles but permits joins',()=>{
 const r=run(`const option={id:'a',label:'a',targetLineId:null};const bad=[{type:'choice',options:[option]},{type:'choice',options:[option,option]},{type:'goto',targetLineId:42}].map(flow.isStoryFlow);const first=p.lines[0];first.flow={type:'goto',targetLineId:first.id};console.log(JSON.stringify({bad,issues:flow.findStoryFlowIssues(p)}));`);assert.deepEqual(r.bad,[false,false,false]);assert.ok(r.issues.some(i=>i.kind==='cycle'));
});
test('delete disconnects targets and split moves outgoing flow to the last fragment',()=>{
 const r=run(`const first=p.lines[0],second=p.lines[1];first.flow={type:'goto',targetLineId:second.id};const deleted=commands.deleteStoryLine({lines:p.lines,lineId:second.id});first.text='가'.repeat(350);const split=commands.splitStoryLine({lines:p.lines,lineId:first.id,createId:id});console.log(JSON.stringify({deleted,split,firstId:first.id,secondId:second.id}));`);assert.equal(r.deleted.ok,true);assert.equal(r.deleted.lines.find(l=>l.id===r.firstId).flow.targetLineId,'');assert.equal(r.split.ok,true);assert.equal(r.split.lines.find(l=>l.id===r.firstId).flow,undefined);assert.equal(r.split.lines.filter(l=>l.flow?.targetLineId===r.secondId).length,1);
});
test('branch metadata survives document save and real Excel round trip',()=>{
 const r=run(`const {createStoryDocument,parseStoryDocument}=await import('./app/story-project-document.ts');const {createStoryWorkbook,readStoryWorkbook}=await import('./app/story-workbook.ts');const {importStoryProject}=await import('./app/story-sheet.ts');const {STORY_ASSETS}=await import('./app/story-assets.ts');const b=flow.createStoryBranches(p,p.lines[0].id,3,id);const doc=parseStoryDocument(createStoryDocument({project:b,savedAt:'2026-09-09T00:00:00.000Z',appVersion:'test'}));const wb=createStoryWorkbook(b,STORY_ASSETS);const snapshot=await readStoryWorkbook(new File([await wb.xlsx.writeBuffer()],'branches.xlsx'));const imported=importStoryProject(snapshot,'');console.log(JSON.stringify({doc,imported,expected:b.lines.map(l=>[l.id,l.flow??null])}));`);
 assert.equal(r.doc.ok,true);assert.equal(r.imported.ok,true,JSON.stringify(r.imported));const expected=new Map(r.expected);for(const l of r.imported.project.lines)assert.deepEqual(l.flow??null,expected.get(l.id));
});
test('inserting and duplicating preserves outgoing connection after the new cut; merge protects incoming links',()=>{
 const r=run(`const first=p.lines[0],second=p.lines[1];first.flow={type:'goto',targetLineId:second.id};const inserted=commands.createStoryLine({lines:p.lines,chapterId:first.chapterId,line:{...first,flow:undefined},createId:()=> 'insert',insertAfterLineId:first.id});const duplicate=commands.duplicateStoryLine({lines:p.lines,lineId:first.id,createId:()=> 'copy'});const merged=commands.mergeStoryLines({lines:p.lines,sourceLineId:first.id,targetLineId:second.id});console.log(JSON.stringify({inserted,duplicate,merged,firstId:first.id,secondId:second.id}));`);
 for(const [command,id] of [[r.inserted,'insert'],[r.duplicate,'copy']]){assert.equal(command.ok,true);assert.equal(command.lines.find(l=>l.id===r.firstId).flow,undefined);assert.equal(command.lines.find(l=>l.id===id).flow.targetLineId,r.secondId);}assert.equal(r.merged.ok,false);
});
test('unfinished links remain saveable and block play; missing targets are rejected during import',()=>{
 const r=run(`const {normalizeAndValidateStoryProject}=await import('./app/story-project-validation.ts');const {findStoryApplyIssues}=await import('./app/story-apply-issues.ts');p.lines[0].flow={type:'choice',options:[{id:'a',label:'',targetLineId:''},{id:'b',label:'끝내기',targetLineId:null}]};const saved=normalizeAndValidateStoryProject(p);const apply=findStoryApplyIssues(p);p.lines[0].flow.options[0].targetLineId='missing';console.log(JSON.stringify({saved,apply,broken:normalizeAndValidateStoryProject(p)}));`);assert.ok(r.saved.project);assert.ok(r.apply.some(i=>i.code==='invalid-flow'));assert.ok(r.broken.issues.some(i=>i.code==='broken-reference'));
});
for(const count of [2,3]) for(let placement=0;placement<count;placement++) test(`${count} choices can attach the already-written continuation to choice ${placement+1}`,()=>{
 const r=run(`const before=flow.orderedStoryFlowLines(p);const b=flow.createStoryBranches(p,before[0].id,${count},id,${placement});const source=b.lines.find(l=>l.id===before[0].id);console.log(JSON.stringify({target:source.flow.options[${placement}].targetLineId,expected:before[1].id,before:before.map(l=>[l.id,l.text,l.chapterId]),after:b.lines.map(l=>[l.id,l.text,l.chapterId]),issues:flow.findStoryFlowIssues(b),delta:b.lines.length-p.lines.length}));`);
 assert.equal(r.target,r.expected);assert.equal(r.delta,count);assert.deepEqual(r.issues,[]);for(const line of r.before)assert.deepEqual(r.after.find(l=>l[0]===line[0]),line);
});
