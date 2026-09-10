import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
function run(body) {
  return JSON.parse(execFileSync(process.execPath,['--disable-warning=ExperimentalWarning','--experimental-strip-types','--experimental-loader=./tests/node-types-loader.mjs','--input-type=module','-e',`
import assert from 'node:assert/strict';
import {createBaseEditionDraft,libraryPage} from './app/story-discovery.ts';
import {readFileSync} from 'node:fs';
const examples=JSON.parse(readFileSync('./app/story-examples.generated.json','utf8'));
const getExampleProject=theme=>structuredClone(examples.projects[theme==='rabbit'?0:1]);
import {createStoryDocument,parseStoryDocument} from './app/story-project-document.ts';
import {createProjectCollectionRepository} from './app/story-project-collection.ts';
import {analyzeExample} from './tests/helpers/example-graph.mjs';
${body}`],{encoding:'utf8'}));
}
test('both base editions clone only reachable cuts, preserve branch routes and master bytes',()=>{
 const result=run(`const out=[];for(const theme of ['rabbit','onggojib']) {
 const master=getExampleProject(theme),before=JSON.stringify(master),graph=analyzeExample(master);
 const seed=createBaseEditionDraft(master,theme,'new-'+theme);const clonedGraph=analyzeExample(seed);
 assert.equal(JSON.stringify(master),before);assert.notEqual(seed.id,master.id);
 assert.deepEqual(seed.lines.map(line=>line.id).sort(),[...graph.byId.keys()].filter(id=>!graph.unreachable.includes(id)).sort());
 assert.deepEqual(clonedGraph.routes,graph.routes);assert.equal(clonedGraph.unreachable.length,0);
 assert.ok(seed.chapters.every(chapter=>seed.lines.some(line=>line.chapterId===chapter.id)));
 assert.ok(parseStoryDocument(createStoryDocument({project:seed,savedAt:'2026-09-10T00:00:00.000Z',appVersion:'qa'})).ok);
 assert.equal(seed.source.baseEditionId,master.id);seed.lines[0].text='my edit';assert.equal(JSON.stringify(master),before);
 out.push({theme,cuts:clonedGraph.reachableCuts});}console.log(JSON.stringify(out));`);
 assert.deepEqual(result,[{theme:'rabbit',cuts:136},{theme:'onggojib',cuts:345}]);
});
test('base clones use the same two-slot policy and reject a third without replacing either work',()=>{
 const result=run(`const values=new Map();const repo=createProjectCollectionRepository({storage:{getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v)}});
 const master=getExampleProject('rabbit');repo.createProject(createBaseEditionDraft(master,'rabbit','a'));repo.createProject(createBaseEditionDraft(master,'rabbit','b'));
 const before=repo.listProjects();const blocked=repo.createProject(createBaseEditionDraft(master,'rabbit','c'));
 assert.deepEqual(repo.listProjects(),before);console.log(JSON.stringify(blocked));`);
 assert.equal(result.code,'limit');
});
test('library pages contain real supplied books only and clamp after capacity or count changes',()=>{
 const result=run(`const books=Array.from({length:23},(_,i)=>i);const out=[6,9,10].map(size=>{const pages=[];for(let page=0;page<Math.ceil(books.length/size);page++)pages.push(...libraryPage(books,page,size).items);assert.deepEqual(pages,books);return libraryPage(books,99,size);});assert.deepEqual(libraryPage([],8,6),{items:[],page:0,pages:1});console.log(JSON.stringify(out));`);
 assert.deepEqual(result.map(p=>p.items),[[18,19,20,21,22],[18,19,20,21,22],[20,21,22]]);
});
