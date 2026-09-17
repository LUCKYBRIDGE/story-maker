import test from 'node:test';
import {execFileSync} from 'node:child_process';
function run(body){execFileSync(process.execPath,['--disable-warning=ExperimentalWarning','--experimental-strip-types','--experimental-loader=./tests/node-types-loader.mjs','--input-type=module','-e',`
import assert from 'node:assert/strict';
import {DEFAULT_PROJECT,cloneProject} from './app/story-data.ts';
import {createStoryDocument,parseStoryDocument} from './app/story-project-document.ts';
import {isStoryPresentation,PRESENTATION_PRESETS,presentationRange} from './app/story-presentation.ts';
const p=cloneProject(DEFAULT_PROJECT);
const presentation={...structuredClone(PRESENTATION_PRESETS[3].presentation),transition:{type:'perspective-blackout',mode:'confirm',title:'시점',durationMs:900},actors:{left:{xAnchor:30,scaleMultiplier:1.2,facing:'left'},right:{spectral:true,opacity:.4,emphasis:'dim'}}};
const doc=()=>createStoryDocument({project:p,savedAt:'2026-09-17T00:00:00.000Z',appVersion:'test'});
${body}`],{encoding:'utf8'});}
test('v1 file migrates, v2 validates all fields and future schemas are rejected',()=>run(`
import {createKnolstoryProject,parseKnolstoryFile} from './app/story-file.ts';
const old=doc();old.schemaVersion=1;old.project.lines[0].effect={type:'crack',intensity:'strong',trigger:'after-delay',delayMs:200};
const migrated=parseStoryDocument(old);assert.ok(migrated.ok);assert.equal(migrated.document.schemaVersion,2);assert.equal(migrated.document.project.lines[0].presentation.effects[0].type,'crack');assert.ok(!('effect' in migrated.document.project.lines[0]));
const file=createKnolstoryProject({draft:old,playback:old});assert.equal(file.manifest.version,1);assert.ok(parseKnolstoryFile(JSON.stringify(file)).ok);
for(const malformed of [{look:{type:'unknown'}},{actors:{left:{scaleMultiplier:5}}},{effects:[{type:'flash',delayMs:-1}]},{transition:{type:'fade-black',durationMs:Infinity}},{look:{type:'flashback',duration:3}}]) assert.equal(isStoryPresentation(malformed),false);
p.lines[0].presentation=presentation;assert.ok(parseStoryDocument(doc()).ok);assert.equal(parseStoryDocument({...doc(),schemaVersion:99}).ok,false);
`));
test('advanced presentation survives real Excel edits, shared files/remix and stable fingerprint',()=>run(`
import {createStoryWorkbook,readStoryWorkbook} from './app/story-workbook.ts';
import {importStoryProject} from './app/story-sheet.ts';import {STORY_ASSETS} from './app/story-assets.ts';
import {createKnolstoryShared,parseKnolstoryFile} from './app/story-file.ts';
import {storyFingerprint,remixSharedFile} from './app/story-publication.ts';
p.lines[0].presentation=presentation;
const book=createStoryWorkbook(p,STORY_ASSETS);assert.equal(book.worksheets.length,8);const sheet=book.getWorksheet('컷 대본');sheet.getCell(2,7).value='문장만 바꿈';
const load=async()=>importStoryProject(await readStoryWorkbook(new File([await book.xlsx.writeBuffer()],'p.xlsx')),'');
let imported=await load();assert.ok(imported.ok,JSON.stringify(imported));assert.deepEqual(imported.project.lines[0].presentation,presentation);
sheet.getCell(2,15).value='약하게';imported=await load();assert.ok(imported.ok);const expected=structuredClone(presentation);expected.effects[0].intensity='soft';assert.deepEqual(imported.project.lines[0].presentation,expected);
sheet.getCell(2,20).value='{"version":99}';assert.equal((await load()).ok,false);
const shared=createKnolstoryShared(p);shared.sharing.allowRemix=true;const parsed=parseKnolstoryFile(JSON.stringify(shared));assert.ok(parsed.ok);const remix=await remixSharedFile(parsed.file,'remix','test');assert.deepEqual(remix.lines[0].presentation,doc().project.lines[0].presentation);
const same=cloneProject(p);same.lines[0].presentation=Object.fromEntries(Object.entries(structuredClone(presentation)).reverse());assert.equal(await storyFingerprint(p),await storyFingerprint(same));same.lines[0].presentation.actors.left.xAnchor=40;assert.notEqual(await storyFingerprint(p),await storyFingerprint(same));
`));
test('split keeps look/actors, transient cues occur once; branches require explicit range',()=>run(`
import {splitStoryLine,duplicateStoryLine,canMergeStoryLines} from './app/story-commands.ts';
p.lines[0].presentation=presentation;p.lines[0].text='첫 번째 문장입니다. '.repeat(100);let n=0;
const split=splitStoryLine({lines:p.lines,lineId:p.lines[0].id,createId:()=> 'split-'+n++});assert.ok(split.ok);const cuts=split.lines.filter(l=>l.id===p.lines[0].id||l.id.startsWith('split-'));assert.ok(cuts.length>1);assert.deepEqual(cuts[0].presentation,presentation);assert.ok(cuts.slice(1).every(l=>!l.presentation.effects&&!l.presentation.transition));assert.deepEqual(cuts[1].presentation.actors,presentation.actors);
assert.equal(canMergeStoryLines(p.lines[0],p.lines[1]),false);
const copy=duplicateStoryLine({lines:p.lines,lineId:p.lines[0].id,createId:()=> 'copy'});assert.ok(copy.ok);assert.deepEqual(copy.lines.find(l=>l.id==='copy').presentation,presentation);
p.lines[0].flow={type:'goto',targetLineId:p.lines[2].id};assert.equal(presentationRange(p.lines,p.lines[0].id,3),undefined);assert.deepEqual(presentationRange(p.lines,p.lines[0].id,1),[p.lines[0].id]);
`));
test('Pinky generated cuts preserve crack, explicit fractured look, flashback, perspective and spectral actors',()=>run(`
import {readFileSync} from 'node:fs';
import {adaptPinkyPresentation} from './app/pinky-presentation-adapter.ts';
assert.deepEqual(adaptPinkyPresentation({visualMode:'flashback'}),{look:{type:'flashback'}});
const projects=JSON.parse(readFileSync('app/story-examples.generated.json')).projects;
const lines=projects[1].lines;
assert.ok(lines.every(l=>!l.effect&&(!l.presentation||isStoryPresentation(l.presentation))));
for(const predicate of [p=>p.effects?.some(e=>e.type==='screen-crack'),p=>p.look?.type==='fractured-reality',p=>p.transition?.type==='perspective-blackout',p=>p.actors?.right?.spectral]) assert.ok(lines.some(l=>l.presentation&&predicate(l.presentation)));
`));
