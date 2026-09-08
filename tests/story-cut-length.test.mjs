import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import test from "node:test";

function run(source) {
  return JSON.parse(execFileSync(process.execPath, [
    "--disable-warning=ExperimentalWarning", "--experimental-strip-types",
    "--experimental-loader=./tests/node-types-loader.mjs", "--input-type=module", "-e",
    `import assert from "node:assert/strict";
    const cut = await import("./app/story-cut-length.ts");
    const commands = await import("./app/story-commands.ts");
    const data = await import("./app/story-data.ts");
    const issues = await import("./app/story-apply-issues.ts");
    ${source}`,
  ], { cwd: process.cwd(), encoding: "utf8" }));
}

test("160자는 공백·줄바꿈을 포함하고 한글 조합/가족 이모지를 중간에서 자르지 않는다", () => {
  assert.equal(run(`
    assert.equal(cut.STORY_CUT_CHARACTER_LIMIT, 160);
    assert.equal(cut.countStoryCharacters("가 나\\n"), 4);
    assert.equal(cut.countStoryCharacters("가👨‍👩‍👧‍👦"), 2);
    for (const text of ["", "가".repeat(159), "가".repeat(160)]) assert.deepEqual(cut.splitStoryText(text), [text]);
    assert.deepEqual(cut.splitStoryText("가".repeat(161)), ["가".repeat(160), "가"]);
    for (const text of ["가👨‍👩‍👧‍👦".repeat(120), "  첫 문장. 다음 문장!\\n".repeat(80), "공백없는글".repeat(100)]) {
      const chunks = cut.splitStoryText(text);
      assert.equal(chunks.join(""), text);
      assert.ok(chunks.every(part => cut.countStoryCharacters(part) <= 160));
    }
    console.log(true);
  `), true);
});

test("나누기는 원문·첫 ID·종류·화자·무대·메모·다른 장을 보존하고 순서를 잇는다", () => {
  assert.equal(run(`
    const project = data.cloneProject(data.RABBIT_TURTLE_CONTINUATION_TEMPLATE);
    const target = project.lines.at(-1);
    target.text = "첫 문장입니다. ".repeat(60);
    const other = { ...target, id: "next-existing", order: 2, text: "다음 컷" };
    project.lines.push(other);
    const before = JSON.stringify(project);
    let serial = 0;
    const result = commands.splitStoryLine({lines:project.lines,lineId:target.id,createId:()=>"split-"+(++serial)});
    assert.equal(result.ok, true);
    const chapter = result.lines.filter(line=>line.chapterId===target.chapterId).sort((a,b)=>a.order-b.order);
    assert.equal(chapter[0].id, project.continuation.lineId);
    assert.equal(chapter.at(-1).id, other.id);
    assert.equal(chapter.slice(0,-1).map(line=>line.text).join(""), target.text);
    for (const [index,line] of chapter.entries()) {
      assert.equal(line.order,index+1);
      for (const key of ["type","speaker","speakerName","leftAssetId","rightAssetId","backgroundId","purposeNote","emotionNote","directionNote"]) assert.equal(line[key],target[key]);
    }
    assert.deepEqual(result.lines.filter(line=>line.chapterId!==target.chapterId),project.lines.filter(line=>line.chapterId!==target.chapterId));
    assert.equal(JSON.stringify(project),before);
    assert.equal(commands.splitStoryLine({lines:project.lines,lineId:target.id,createId:()=>target.id}).code,"duplicate-id");
    assert.equal(commands.splitStoryLine({lines:project.lines,lineId:"missing",createId:()=>"new"}).code,"line-not-found");
    console.log(true);
  `), true);
});

test("초과 글은 저장 형식을 깨지 않고 적용 시 정확한 컷으로 안내하며 나누면 해제된다", () => {
  assert.equal(run(`
    const project = data.cloneProject(data.ONGGOJIB_CONTINUATION_TEMPLATE);
    const line = project.lines.at(-1);
    line.text = "가".repeat(160);
    assert.deepEqual(issues.findStoryApplyIssues(project), []);
    line.text += "나";
    const found = issues.findStoryApplyIssues(project);
    assert.equal(found.length, 1);
    assert.equal(found[0].code, "line-too-long");
    assert.equal(found[0].lineId, line.id);
    assert.equal(issues.getStoryApplyIssueNavigation(found[0]).focus,"line-body");
    const { normalizeAndValidateStoryProject } = await import("./app/story-project-validation.ts");
    assert.deepEqual(normalizeAndValidateStoryProject(project).issues, []);
    const split = commands.splitStoryLine({lines:project.lines,lineId:line.id,createId:()=>"split-first"});
    assert.equal(split.ok,true);
    assert.deepEqual(issues.findStoryApplyIssues({...project,lines:split.lines}), []);
    assert.equal(line.text.length,161);
    console.log(true);
  `), true);
});

test("non-secure context(crypto.randomUUID 미지원 환경)에서도 안전하게 고유 ID를 생성해 컷을 나눈다", () => {
  assert.equal(run(`
    const project = data.cloneProject(data.RABBIT_TURTLE_CONTINUATION_TEMPLATE);
    const line = project.lines.at(-1);
    line.text = "가".repeat(350); // 3 cuts
    let counter = 0;
    // crypto.randomUUID 없는 non-secure context 시뮬레이션
    const fallbackCreateId = () => "line-" + Date.now() + "-" + (++counter) + "-" + Math.random().toString(36).slice(2, 8);
    const result = commands.splitStoryLine({
      lines: project.lines,
      lineId: line.id,
      createId: fallbackCreateId,
    });
    assert.equal(result.ok, true);
    assert.equal(result.lines.length, project.lines.length + 2);
    const newIds = result.lines.map(l => l.id);
    assert.equal(new Set(newIds).size, newIds.length);
    console.log(true);
  `), true);
});
