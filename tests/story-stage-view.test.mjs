import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import test from "node:test";

function run(script) {
  return JSON.parse(execFileSync(process.execPath, [
    "--disable-warning=ExperimentalWarning", "--experimental-strip-types",
    "--experimental-loader=./tests/node-types-loader.mjs", "--input-type=module", "-e",
    `const {resolveStoryStage,stageShouldMirror}=await import('./app/story-stage-view.ts');
     const {createCurrentV1ProjectFixture}=await import('./tests/fixtures/story-projects.mjs');
     ${script}`,
  ], {encoding:"utf8",cwd:process.cwd()}));
}

test("공통 무대는 기본값을 상속하고 컷 지정은 우선하며 입력을 변경하지 않는다", () => {
  const result=run(`
    const p=createCurrentV1ProjectFixture();
    const chapter=p.chapters[0];
    const line={...p.lines[0],leftAssetId:'',rightAssetId:'',backgroundId:'',speakerName:'   '};
    const before=JSON.stringify({chapter,line});
    const inherited=resolveStoryStage(chapter,line);
    const override=resolveStoryStage(chapter,{...line,backgroundId:'missing-explicit'});
    console.log(JSON.stringify({inherited,override,chapter,unchanged:before===JSON.stringify({chapter,line})}));
  `);
  assert.equal(result.inherited.left.id,result.chapter.leftAssetId);
  assert.equal(result.inherited.background.id,result.chapter.backgroundId);
  assert.equal(result.inherited.speakerName,"화자 없음");
  assert.equal(result.override.background.id,"missing-explicit");
  assert.equal(result.override.background.missing,true);
  assert.equal(result.override.background.src,undefined);
  assert.equal(result.unchanged,true);
});

test("빈 무대·없는 인물·좌우 방향을 안전하고 일관되게 해석한다", () => {
  const result=run(`
    const p=createCurrentV1ProjectFixture();
    console.log(JSON.stringify({
      empty:resolveStoryStage(),
      missing:resolveStoryStage(p.chapters[0],{...p.lines[0],leftAssetId:'not-found'}).left,
      left:stageShouldMirror('rabbit-turtle.character.turtle-unified-720x900','left'),
      right:stageShouldMirror('rabbit-turtle.character.turtle-unified-720x900','right'),
      unknown:stageShouldMirror('not-found','left'),
    }));
  `);
  assert.equal(result.empty.left.id,"");
  assert.equal(result.empty.background.missing,false);
  assert.equal(result.missing.missing,true);
  assert.equal(result.missing.id,"not-found");
  assert.equal(result.left,true);
  assert.equal(result.right,false);
  assert.equal(result.unknown,false);
});

test("어린 자라의 기본·회상은 같은 작은 키를 쓰고 성인 자라는 유지한다", () => {
  const result=run(`
    const p=createCurrentV1ProjectFixture();
    const ids=['rabbit-turtle.character.turtle-child-unified-720x900','rabbit-turtle.character.turtle-child-flashback','rabbit-turtle.character.turtle-unified-720x900'];
    console.log(JSON.stringify(ids.map(id=>resolveStoryStage(p.chapters[0],{...p.lines[0],leftAssetId:id}).left.scale)));
  `);
  assert.deepEqual(result,[0.72,0.72,1]);
});


test("옹고집전 아이들은 성인보다 작은 키로 렌더링한다", () => {
  const result=run(`
    const {STORY_ASSETS}=await import('./app/story-assets.ts');
    const p=createCurrentV1ProjectFixture();
    const ids=STORY_ASSETS.filter(a=>a.story==='옹고집전' && ['아이','둘째 아이','막내 아이'].includes(a.group)).map(a=>a.id);
    console.log(JSON.stringify({children:ids.map(id=>resolveStoryStage(p.chapters[0],{...p.lines[0],leftAssetId:id}).left.scale),adult:resolveStoryStage(p.chapters[0],{...p.lines[0],leftAssetId:'onggojib.character.real-angry-pixel'}).left.scale}));
  `);
  assert.ok(result.children.length>=5);
  assert.ok(result.children.every(scale=>scale===0.62));
  assert.equal(result.adult,1);
});
