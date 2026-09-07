import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import test from "node:test";

function run(source) {
  return JSON.parse(execFileSync(process.execPath, [
    "--disable-warning=ExperimentalWarning", "--experimental-strip-types",
    "--experimental-loader=./tests/node-types-loader.mjs", "--input-type=module", "-e",
    `
      import assert from "node:assert/strict";
      const data = await import("./app/story-data.ts");
      const templates = [data.RABBIT_TURTLE_CONTINUATION_TEMPLATE, data.ONGGOJIB_CONTINUATION_TEMPLATE];
      ${source}
    `,
  ], { cwd: process.cwd(), encoding: "utf8" }));
}

test("두 틀은 위기 직후 빈 컷 하나에서 시작하고, 해결·판결·결말을 미리 정하지 않는다", () => {
  const projects = run("console.log(JSON.stringify(templates));");
  for (const project of projects) {
    const point = project.continuation;
    const blank = project.lines.filter(line => !line.text.trim());
    assert.equal(blank.length, 1);
    assert.equal(blank[0].id, point.lineId);
    assert.equal(blank[0].chapterId, point.chapterId);
    assert.equal(project.lines.at(-1).id, point.lineId);
    assert.equal(blank[0].type, "dialogue");
    const chapter = project.chapters.find(chapter => chapter.id === point.chapterId);
    assert.deepEqual(chapter.storyStageKeys, []);
    for (const field of ["summary", "purpose", "mood", "keyEvents", "nextChapterIdea"]) {
      assert.equal(chapter[field], "", field);
    }
    for (const field of ["theme", "endingChange", "climax", "ending", "freeNotes"]) {
      assert.equal(project.planning[field], "", field);
    }
    assert.equal(blank[0].backgroundId, project.lines.at(-2).backgroundId);
    assert.equal(blank[0].leftAssetId, project.lines.at(-2).leftAssetId);
    assert.equal(blank[0].rightAssetId, project.lines.at(-2).rightAssetId);
    assert.equal(new Set(project.lines.map(line => line.id)).size, project.lines.length);
    assert.ok(project.lines.every(line => !Object.hasOwn(line, "choices")));
  }
  const [rabbit, onggojib] = projects;
  assert.match(rabbit.lines.at(-3).text, /간이 필요하다/);
  assert.match(rabbit.lines.at(-2).text, /호위들이 토끼를 붙잡았다/);
  assert.equal(rabbit.lines.at(-1).speakerName, "토끼");
  assert.doesNotMatch(rabbit.lines.map(line => line.text).join("\n"), /간을.*두고|간을.*놓고|육지로 돌아왔/);
  assert.match(onggojib.lines.at(-2).text, /재판장으로 끌고 왔다/);
  assert.match(onggojib.lines.at(-2).text, /재판이 시작되려는 참/);
  assert.equal(onggojib.lines.at(-1).speakerName, "진짜 옹고집");
  assert.doesNotMatch(JSON.stringify(onggojib), /아내의 선택|돌아가겠습니다|족보를.*물|판결을 내렸|패소/);
});

test("새 틀의 모든 무대 자산은 기존 카탈로그에 있고 사본 편집은 원본을 바꾸지 않는다", () => {
  assert.equal(run(`
    const { STORY_ASSETS } = await import("./app/story-assets.ts");
    const ids = new Set(STORY_ASSETS.map(asset => asset.id));
    for (const source of templates) {
      const before = JSON.stringify(source);
      const copy = data.cloneProject(source);
      for (const item of [...copy.chapters, ...copy.lines]) {
        for (const key of ["backgroundId", "leftAssetId", "rightAssetId"]) {
          assert.ok(!item[key] || ids.has(item[key]), item[key]);
        }
      }
      copy.lines.at(-1).text = "내가 정한 첫 문장";
      copy.chapters.at(-1).storyStageKeys.push("crisis");
      assert.equal(JSON.stringify(source), before);
    }
    console.log(true);
  `), true);
});

test("새 틀은 로컬 저장 후 빈 컷·시작점·학생 문장과 기존 저장 작품을 보존한다", () => {
  assert.equal(run(`
    const { createLocalStoryProjectRepository } = await import("./app/story-project-repository.ts");
    const entries = new Map();
    const repository = createLocalStoryProjectRepository({ storage: {
      getItem: key => entries.get(key) ?? null,
      setItem: (key, value) => entries.set(key, value), removeItem: key => entries.delete(key),
    }});
    for (const source of templates) {
      const copy = data.cloneProject(source);
      assert.equal(repository.saveDraft(copy).ok, true);
      assert.deepEqual(repository.loadDraft().project.continuation, copy.continuation);
      assert.equal(repository.loadDraft().project.lines.at(-1).text, "");
      copy.lines.at(-1).text = "내 방식으로 이야기를 바꿀 거야.";
      assert.equal(repository.saveDraft(copy).ok, true);
      assert.equal(repository.loadDraft().project.lines.at(-1).text, copy.lines.at(-1).text);
    }
    // 같은 템플릿 ID라도 저장된 예전 줄거리를 신 템플릿으로 치환하지 않는다.
    const legacy = data.cloneProject(templates[1]);
    legacy.title = "학생이 고친 옛 이어쓰기 작품";
    legacy.lines[0].text = "아내의 선택 이후 내가 고친 문장";
    legacy.lines.at(-1).text = "예전에 만든 나만의 결말";
    assert.equal(repository.saveDraft(legacy).ok, true);
    assert.deepEqual(repository.loadDraft().project, legacy);
    console.log(true);
  `), true);
});

test("앞이야기 플레이 사본은 빈 컷 없이 저장·새로고침되고 편집 시작점은 유지된다", () => {
  assert.equal(run(`
    const { createLocalStoryProjectRepository } = await import("./app/story-project-repository.ts");
    const entries = new Map();
    const repository = createLocalStoryProjectRepository({ storage: {
      getItem: key => entries.get(key) ?? null,
      setItem: (key, value) => entries.set(key, value), removeItem: key => entries.delete(key),
    }});
    for (const project of templates) {
      const preview = data.createContinuationPreview(project);
      assert.equal(preview.continuation, undefined);
      assert.equal(preview.lines.length, project.lines.length - 1);
      assert.ok(preview.lines.every(line => line.text.trim()));
      assert.equal(repository.saveActive(preview).ok, true);
      const loaded = repository.loadActive();
      assert.equal(loaded.ok, true, JSON.stringify(loaded));
      assert.deepEqual(loaded.project, preview);
      assert.equal(project.lines.at(-1).id, project.continuation.lineId);
      preview.lines[0].text = "수정";
      assert.notEqual(project.lines[0].text, "수정");
    }
    console.log(true);
  `), true);
});

test("두 틀의 공식 8탭 Excel 왕복은 빈 컷·본문·무대·자유 계획 필드를 보존한다", () => {
  assert.equal(run(`
    const workbook = await import("./app/story-workbook.ts");
    const sheet = await import("./app/story-sheet.ts");
    const { STORY_ASSETS } = await import("./app/story-assets.ts");
    for (const project of templates) {
      const exported = workbook.createStoryWorkbook(project, STORY_ASSETS);
      assert.equal(exported.worksheets.length, 8);
      const bytes = await exported.xlsx.writeBuffer();
      const snapshot = await workbook.readStoryWorkbook(new File([bytes], "continuation.xlsx"));
      const imported = sheet.importStoryProject(snapshot, "");
      assert.equal(imported.ok, true, JSON.stringify(imported));
      assert.deepEqual(imported.project.lines, project.lines);
      assert.deepEqual(imported.project.planning, project.planning);
      assert.deepEqual(imported.project.chapters, project.chapters);
    }
    console.log(true);
  `), true);
});
