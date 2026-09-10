import test from 'node:test';
import {execFileSync} from 'node:child_process';
test('publication freezes snapshots, compares content, preserves remix provenance and enforces permission',()=>{
 execFileSync(process.execPath,['--disable-warning=ExperimentalWarning','--experimental-strip-types','--experimental-loader=./tests/node-types-loader.mjs','--input-type=module','-e',`
import assert from 'node:assert/strict';
import {DEFAULT_PROJECT,cloneProject} from './app/story-data.ts';
import {storyFingerprint,createPublication,queryPublications,transitionSubmission,remixSharedFile} from './app/story-publication.ts';
const p=cloneProject(DEFAULT_PROJECT);p.source={kind:'baseEdition',baseStoryId:'rabbit-turtle',baseEditionId:'base'};
const pub=await createPublication(p,{id:'pub',allowRemix:true});const before=JSON.stringify(p);
assert.ok(Object.isFrozen(pub.file.story.project.lines[0]));assert.throws(()=>pub.file.story.project.title='changed');
const clone=cloneProject(p);clone.id='new';clone.updatedAt='now';clone.planning.freeNotes='private';
const map=new Map(clone.lines.map((line,i)=>[line.id,'renamed-'+i]));
clone.lines.forEach(line=>{line.id=map.get(line.id);if(line.flow?.type==='goto'&&line.flow.targetLineId)line.flow.targetLineId=map.get(line.flow.targetLineId);if(line.flow?.type==='choice')line.flow.options.forEach(o=>{o.id='new-'+o.id;if(o.targetLineId)o.targetLineId=map.get(o.targetLineId);});});
assert.equal(await storyFingerprint(p),await storyFingerprint(clone));
const fingerprint=await storyFingerprint(p);
for(const change of [
 x=>x.title+=' new', x=>x.chapters[0].title+=' new', x=>x.lines[0].text+=' new',
 x=>x.lines[0].backgroundId='different-asset',x=>x.lines[0].effect={type:'shake',trigger:'on-enter',delayMs:0},
 x=>x.lines[0].flow={type:'goto',targetLineId:null},
 x=>x.cover={...(x.cover??{}),subtitle:'new cover'},
]) {const changed=cloneProject(p);change(changed);assert.notEqual(await storyFingerprint(changed),fingerprint);}
const ids=cloneProject(p);ids.chapters.forEach((chapter,i)=>{const old=chapter.id;chapter.id='chapter-'+i;ids.lines.filter(l=>l.chapterId===old).forEach(l=>l.chapterId=chapter.id);});
assert.equal(await storyFingerprint(ids),fingerprint);
clone.lines[0].text+=' changed';assert.notEqual(await storyFingerprint(p),await storyFingerprint(clone));
const remix=await remixSharedFile(pub.file,'remix','pub');assert.equal(remix.source.kind,'publication');assert.equal(remix.source.originalFingerprint,pub.fingerprint);assert.equal(JSON.stringify(p),before);
const denied=await createPublication(p,{id:'denied',allowRemix:false});await assert.rejects(()=>remixSharedFile(denied.file,'new'));await assert.rejects(()=>remixSharedFile(pub.file,p.id));
assert.deepEqual(queryPublications([pub],{baseStoryId:'rabbit-turtle'}),[pub]);assert.deepEqual(queryPublications([pub],{schoolId:'unknown'}),[]);
assert.equal(transitionSubmission({publicationId:'pub',status:'draft'},'pending').status,'pending');assert.throws(()=>transitionSubmission({publicationId:'pub',status:'draft'},'approved'));
`],{encoding:'utf8'});
});
