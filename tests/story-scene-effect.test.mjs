import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import test from 'node:test';

function run(script) {
  return JSON.parse(execFileSync(process.execPath, [
    '--disable-warning=ExperimentalWarning', '--experimental-strip-types',
    '--experimental-loader=./tests/node-types-loader.mjs', '--input-type=module', '-e', `
      const fx = await import('./app/story-scene-effect.ts');
      const { createCurrentV1ProjectFixture } = await import('./tests/fixtures/story-projects.mjs');
      const effect = {type:'shake',intensity:'strong',trigger:'after-delay',delayMs:1500};
      ${script}
    `], {encoding:'utf8'}));
}

test('effects: all types and timings validate; malformed metadata is rejected', () => {
  const result = run(`console.log(JSON.stringify({
    valid: fx.STORY_EFFECTS.flatMap(e => ['scene-enter','with-dialogue','after-delay'].map(trigger => fx.isStorySceneEffect({...effect,type:e.type,trigger}))),
    invalid: [null,{}, {...effect,type:'unknown'}, {...effect,intensity:'extreme'}, {...effect,trigger:'unknown'}, {...effect,trigger:{toString:null}}, ...[-1,10001,NaN,Infinity,'1500'].map(delayMs => ({...effect,delayMs}))].map(fx.isStorySceneEffect)
  }));`);
  assert.equal(result.valid.length, 15);
  assert.ok(result.valid.every(Boolean));
  assert.ok(result.invalid.every(value => !value));
});

test('effects: delay, finite duration, intensity and cancellation are browser-owned', () => {
  const result = run(`
    const calls = []; let cancelled=0;
    const target = {animate:(frames,options) => {calls.push({frames,options});return {cancel:()=>cancelled++};}};
    const stop = fx.playSceneEffect([target,target],effect); stop();
    console.log(JSON.stringify({calls,cancelled,
      immediate:fx.sceneEffectAnimation({...effect,trigger:'scene-enter'}).options.delay,
      dialogue:fx.sceneEffectAnimation({...effect,trigger:'with-dialogue'}).options.delay,
      soft:fx.sceneEffectAnimation({...effect,intensity:'soft'}).keyframes,
    }));
  `);
  assert.equal(result.cancelled, 2);
  assert.equal(result.calls[0].options.delay,1500);
  assert.equal(result.calls[0].options.iterations,1);
  assert.equal(result.calls[0].options.fill,'none');
  assert.equal(result.immediate,0);
  assert.equal(result.dialogue,0);
  assert.notDeepEqual(result.soft,result.calls[0].frames);
});

test('effects: local save/load, active version and clone preserve metadata without touching old lines', () => {
  const result = run(`
    const {createLocalStoryProjectRepository} = await import('./app/story-project-repository.ts');
    const {cloneProject} = await import('./app/story-data.ts');
    const map = new Map();
    const repo = createLocalStoryProjectRepository({storage:{getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v)}});
    const project=createCurrentV1ProjectFixture(); project.lines[0].effect=effect;
    const draft=repo.saveDraft(project), active=repo.saveActive(project);
    const loaded=repo.loadDraft(); const played=repo.loadActive();
    console.log(JSON.stringify({draft,active,loaded,played,clone:cloneProject(project)}));
  `);
  assert.equal(result.draft.ok,true); assert.equal(result.active.ok,true);
  assert.deepEqual(result.loaded.project.lines[0].effect,result.clone.lines[0].effect);
  assert.deepEqual(result.played.project.lines[0].effect,result.clone.lines[0].effect);
  assert.ok(!('effect' in result.clone.lines[1]));
});

test('effects: real XLSX round trip preserves every type and legacy blank columns', () => {
  const result = run(`
    const {createStoryWorkbook,readStoryWorkbook} = await import('./app/story-workbook.ts');
    const {importStoryProject} = await import('./app/story-sheet.ts');
    const {STORY_ASSETS} = await import('./app/story-assets.ts');
    const project=createCurrentV1ProjectFixture();
    project.lines = [...fx.STORY_EFFECTS.map((e,i)=>({...project.lines[0],id:'effect-'+i,order:i+1,effect:{...effect,type:e.type}})), {...project.lines[0],id:'old',order:6}];
    const workbook=createStoryWorkbook(project,STORY_ASSETS);
    const bytes=await workbook.xlsx.writeBuffer();
    const snapshot=await readStoryWorkbook(new File([bytes],'effects.xlsx'));
    const imported=importStoryProject(snapshot,'');
    console.log(JSON.stringify({imported,expected:project.lines.map(l=>l.effect??null)}));
  `);
  assert.equal(result.imported.ok,true,JSON.stringify(result.imported.issues));
  assert.deepEqual(result.imported.project.lines.map(l=>l.effect??null),result.expected);
});

test('effects: invalid saved or imported effect never silently overwrites a work', () => {
  const result = run(`
    const {createStoryDocument,parseStoryDocument} = await import('./app/story-project-document.ts');
    const {createStoryWorkbook,readStoryWorkbook} = await import('./app/story-workbook.ts');
    const {importStoryProject} = await import('./app/story-sheet.ts');
    const {STORY_ASSETS} = await import('./app/story-assets.ts');
    const project=createCurrentV1ProjectFixture(); project.lines[0].effect={...effect,delayMs:-1};
    const document=createStoryDocument({project,savedAt:'2026-09-08T00:00:00.000Z',appVersion:'test'});
    const workbook=createStoryWorkbook(project,STORY_ASSETS);
    const snapshot=await readStoryWorkbook(new File([await workbook.xlsx.writeBuffer()],'bad.xlsx'));
    console.log(JSON.stringify({saved:parseStoryDocument(document),sheet:importStoryProject(snapshot,'')}));
  `);
  assert.equal(result.saved.ok,false); assert.equal(result.sheet.ok,false);
  assert.ok(result.saved.issues.some(i=>i.path.endsWith('.effect')));
  assert.ok(result.sheet.issues.some(i=>i.column==='연출 효과'));
});

test('effects: duplicate retains independent effect and merge refuses to discard timing', () => {
  const result = run(`
    const {duplicateStoryLine,canMergeStoryLines}=await import('./app/story-commands.ts');
    const p=createCurrentV1ProjectFixture(); const first={...p.lines[0],effect};
    const second={...first,id:'second',order:2,effect:undefined};
    const duplicate=duplicateStoryLine({lines:[first],lineId:first.id,createId:()=> 'copy'});
    console.log(JSON.stringify({duplicate,merges:[canMergeStoryLines(first,second),canMergeStoryLines(second,first)]}));
  `);
  assert.equal(result.duplicate.ok,true);
  assert.deepEqual(result.duplicate.lines[0].effect,result.duplicate.lines[1].effect);
  assert.deepEqual(result.merges,[false,false]);
});
