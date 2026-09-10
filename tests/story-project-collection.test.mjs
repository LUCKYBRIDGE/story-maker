import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
function run(body){return JSON.parse(execFileSync(process.execPath,['--disable-warning=ExperimentalWarning','--experimental-strip-types','--experimental-loader=./tests/node-types-loader.mjs','--input-type=module','-e',`
import assert from 'node:assert/strict';
import {createProjectCollectionRepository,STORY_COLLECTION_KEY} from './app/story-project-collection.ts';
import {STORY_DRAFT_STORAGE_KEY,STORY_ACTIVE_STORAGE_KEY} from './app/story-project-repository.ts';
import {createBlankProject} from './app/story-data.ts';
import {createStoryDocument} from './app/story-project-document.ts';
const map=new Map();let reject=false;const storage={getItem:k=>map.get(k)??null,setItem:(k,v)=>{if(reject)throw Error('quota');map.set(k,v)}};
const repo=createProjectCollectionRepository({storage});const project=id=>({...createBlankProject(),id,title:id});
const encode=p=>JSON.stringify(createStoryDocument({project:p,savedAt:'2026-09-10T00:00:00.000Z',appVersion:'test'}));
${body}`],{encoding:'utf8'}));}
test('migration preserves legacy bytes and keeps draft and playback separate, exactly once',()=>{
 const r=run(`const a=project('a'),play={...a,title:'published A'};map.set(STORY_DRAFT_STORAGE_KEY,JSON.stringify(a));map.set(STORY_ACTIVE_STORAGE_KEY,encode(play));const before=[...map];const first=repo.listProjects();map.set(STORY_DRAFT_STORAGE_KEY,encode(project('other')));const second=repo.listProjects();console.log(JSON.stringify({first,second,active:map.get(STORY_ACTIVE_STORAGE_KEY),expected:before[1][1]}));`);
 assert.ok(r.first.ok);assert.equal(r.first.value.projects[0].draft.project.id,'a');assert.equal(r.first.value.projects[0].playback.project.title,'published A');assert.deepEqual(r.first,r.second);assert.equal(r.active,r.expected);
});
test('two projects, ID-addressed late save, playback, switching, limit and explicit deletion',()=>{
 const r=run(`repo.createProject(project('a'));repo.createProject(project('b'));repo.saveProject({...project('a'),title:'A late edit'});repo.savePlayback({...project('a'),title:'A playback'});const selection=repo.getActiveProjectId();const blocked=repo.createProject(project('c'));const before=repo.listProjects();const duplicate=repo.createProject(project('a'));repo.deleteProject('b');const next=repo.createProject(project('c'));console.log(JSON.stringify({selection,blocked,before,duplicate,next}));`);
 assert.equal(r.selection.value,'b');assert.equal(r.blocked.code,'limit');assert.equal(r.duplicate.code,'exists');assert.equal(r.before.value.projects[0].draft.project.title,'A late edit');assert.equal(r.before.value.projects[0].playback.project.title,'A playback');assert.equal(r.before.value.projects[1].draft.project.title,'b');assert.deepEqual(r.next.value.projects.map(p=>p.draft.project.id),['a','c']);
});
test('failed migration or save leaves original bytes recoverable and can retry',()=>{
 const r=run(`map.set(STORY_DRAFT_STORAGE_KEY,encode(project('a')));const legacy=map.get(STORY_DRAFT_STORAGE_KEY);reject=true;const failed=repo.listProjects();assert.equal(map.has(STORY_COLLECTION_KEY),false);reject=false;repo.listProjects();const before=map.get(STORY_COLLECTION_KEY);reject=true;const save=repo.saveProject({...project('a'),title:'lost'});console.log(JSON.stringify({failed,save,unchanged:map.get(STORY_COLLECTION_KEY)===before,legacy:map.get(STORY_DRAFT_STORAGE_KEY)===legacy}));`);
 assert.equal(r.failed.code,'storage');assert.equal(r.save.code,'storage');assert.ok(r.unchanged&&r.legacy);
});
test('corrupt collection is not overwritten or replaced from old legacy keys',()=>{
 const r=run(`map.set(STORY_DRAFT_STORAGE_KEY,encode(project('a')));map.set(STORY_COLLECTION_KEY,'{"version":99}');const result=repo.createProject(project('b'));console.log(JSON.stringify({result,raw:map.get(STORY_COLLECTION_KEY)}));`);assert.equal(r.result.code,'invalid-data');assert.equal(r.raw,'{"version":99}');
});
test('provenance survives save/load and malformed source is rejected',()=>{
 const r=run(`const a={...project('a'),source:{kind:'baseEdition',baseStoryId:'rabbit-turtle',baseEditionId:'nolstory'}};repo.createProject(a);const loaded=repo.getProject('a');const bad=repo.saveProject({...a,source:{kind:'publication'}});console.log(JSON.stringify({loaded,bad}));`);
 assert.equal(r.loaded.value.draft.project.source.baseEditionId,'nolstory');assert.equal(r.bad.code,'invalid-data');
});
test('different legacy playback never becomes a second editable work',()=>{
 const r=run(`map.set(STORY_DRAFT_STORAGE_KEY,encode(project('a')));map.set(STORY_ACTIVE_STORAGE_KEY,encode(project('b')));console.log(JSON.stringify(repo.listProjects()));`);assert.equal(r.value.projects.length,1);assert.equal(r.value.projects[0].playback,null);
});
