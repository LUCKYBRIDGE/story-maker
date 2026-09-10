import test from 'node:test';
import {execFileSync} from 'node:child_process';
function run(body) {
 execFileSync(process.execPath,['--disable-warning=ExperimentalWarning','--experimental-strip-types','--experimental-loader=./tests/node-types-loader.mjs','--input-type=module','-e',`
import assert from 'node:assert/strict';
import {DEFAULT_PROJECT,cloneProject,createBlankProject} from './app/story-data.ts';
import {createStoryDocument} from './app/story-project-document.ts';
import {createProjectCollectionRepository,STORY_COLLECTION_KEY} from './app/story-project-collection.ts';
import {createNolstoryProject,createNolstoryShared,encodeNolstoryFile,parseNolstoryFile,readNolstoryFile,MAX_NOLSTORY_BYTES} from './app/story-file.ts';
const doc=p=>createStoryDocument({project:p,savedAt:'2026-09-10T00:00:00.000Z',appVersion:'qa'});
const project=id=>({...cloneProject(DEFAULT_PROJECT),id,source:{kind:'baseEdition',baseStoryId:'rabbit-turtle',baseEditionId:'original'}});
${body}`],{encoding:'utf8'});
}
test('project file preserves identity, source, separate draft/playback and null or empty playback',()=>run(`
 const draft=project('a'),play=project('a');draft.lines[0].text='unapplied';play.lines[0].text='applied';
 for(const playback of [doc(play),null,doc({...createBlankProject(),id:'a'})]) {
 const entry={draft:doc(draft),playback};const result=parseNolstoryFile(encodeNolstoryFile(createNolstoryProject(entry)));
 assert.ok(result.ok);assert.deepEqual(result.file.draft,entry.draft);assert.deepEqual(result.file.playback,playback);
 }
`));
test('shared export strips private notes without mutating reading version',()=>run(`
 const p=project('a');p.planning.freeNotes='private';p.sheetUrl='https://private.example';p.lines[0].purposeNote='private';
 const before=JSON.stringify(p),file=createNolstoryShared(p);assert.equal(file.sharing.allowRemix,false);
 assert.equal(file.story.project.lines[0].text,p.lines[0].text);assert.equal(file.story.project.lines[0].purposeNote,'');
 assert.equal(file.story.project.sheetUrl,'');assert.equal(JSON.stringify(p),before);assert.ok(parseNolstoryFile(encodeNolstoryFile(file)).ok);
`));
test('malformed schema, assets, paths, MIME, size and mismatched identity fail before import',()=>run(`
 const file=createNolstoryProject({draft:doc(project('a')),playback:doc(project('a'))});
 for(const alter of [f=>f.manifest.version=99,f=>f.playback.project.id='b',f=>f.assets.push({kind:'builtin',id:'../secret'}),f=>f.files={'x.js':'alert(1)'},f=>f.draft.project.chapters[0].backgroundId='https://evil/image',f=>f.assets[0].path='../image']) {
 const bad=structuredClone(file);alter(bad);assert.equal(parseNolstoryFile(JSON.stringify(bad)).ok,false);
 }
 assert.equal(parseNolstoryFile('{broken').ok,false);
 for(const f of [new File(['x'],'x.txt'),new File([encodeNolstoryFile(file)],'x.nolstory',{type:'text/html'}),new File([new Uint8Array(MAX_NOLSTORY_BYTES+1)],'x.nolstory')]) assert.equal((await readNolstoryFile(f)).ok,false);
`));
test('import enforces two slots, explicit replacement, atomic failure and both saved versions',()=>run(`
 const map=new Map();let reject=false;const repo=createProjectCollectionRepository({storage:{getItem:k=>map.get(k)??null,setItem:(k,v)=>{if(reject)throw Error('quota');map.set(k,v);}}});
 const entry=id=>({draft:doc(project(id)),playback:doc({...project(id),title:'applied '+id})});
 assert.ok(repo.importProject(entry('a')).ok);assert.ok(repo.importProject(entry('b')).ok);const before=map.get(STORY_COLLECTION_KEY);
 assert.equal(repo.importProject(entry('c')).code,'limit');assert.equal(repo.importProject(entry('a')).code,'exists');assert.equal(map.get(STORY_COLLECTION_KEY),before);
 const updated=entry('a');updated.draft.project.title='replaced';reject=true;assert.equal(repo.importProject(updated,true).code,'storage');assert.equal(map.get(STORY_COLLECTION_KEY),before);
 reject=false;assert.ok(repo.importProject(updated,true).ok);assert.deepEqual(repo.getProject('a').value,updated);assert.deepEqual(repo.getProject('b').value,entry('b'));
`));
test('Excel workbook and sheet snapshot round-trip source; old blank source remains unknown',()=>run(`
 import {createStoryWorkbook,readStoryWorkbook} from './app/story-workbook.ts';
 import {importStoryProject} from './app/story-sheet.ts';import {STORY_ASSETS} from './app/story-assets.ts';
 for(const source of [project('a').source,undefined]) {
 const p=project('a');p.source=source;const workbook=createStoryWorkbook(p,STORY_ASSETS);
 const snapshot=await readStoryWorkbook(new File([await workbook.xlsx.writeBuffer()],'work.xlsx'));
 const imported=importStoryProject(snapshot,'');assert.ok(imported.ok,JSON.stringify(imported));assert.deepEqual(imported.project.source,source);
 }
`));

test('multiple speakers survive document, file and Excel while legacy single speakers remain unchanged',()=>run(`
 import {createStoryWorkbook,readStoryWorkbook} from './app/story-workbook.ts';
 import {importStoryProject} from './app/story-sheet.ts';import {STORY_ASSETS} from './app/story-assets.ts';
 import {lineSpeakerNames} from './app/story-speakers.ts';
 const p=project('multi');p.lines[0].type='dialogue';p.lines[0].speakerName='토끼';p.lines[0].coSpeakerNames=['자라','용왕'];
 const result=parseNolstoryFile(encodeNolstoryFile(createNolstoryProject({draft:doc(p),playback:doc(p)})));
 assert.ok(result.ok);assert.deepEqual(lineSpeakerNames(result.file.draft.project.lines[0]),['토끼','자라','용왕']);
 const workbook=createStoryWorkbook(p,STORY_ASSETS);const snapshot=await readStoryWorkbook(new File([await workbook.xlsx.writeBuffer()],'multi.xlsx'));
 const imported=importStoryProject(snapshot,'');assert.ok(imported.ok);assert.deepEqual(imported.project.lines[0].coSpeakerNames,['자라','용왕']);
 assert.deepEqual(lineSpeakerNames({type:'dialogue',speakerName:'옛 화자'}),['옛 화자']);
 const bad=JSON.parse(encodeNolstoryFile(createNolstoryProject({draft:doc(p),playback:null})));bad.draft.project.lines[0].coSpeakerNames=[42];assert.equal(parseNolstoryFile(JSON.stringify(bad)).ok,false);
`));
