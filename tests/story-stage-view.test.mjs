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
