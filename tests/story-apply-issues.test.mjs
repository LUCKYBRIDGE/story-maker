import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import test from "node:test";

function runIssues(script) {
  return JSON.parse(
    execFileSync(
      process.execPath,
      [
        "--disable-warning=ExperimentalWarning",
        "--experimental-strip-types",
        "--experimental-loader=./tests/node-types-loader.mjs",
        "--input-type=module",
        "-e",
        `
          const issues = await import("./app/story-apply-issues.ts");
          const fixtures = await import("./tests/fixtures/story-projects.mjs");
          ${script}
        `,
      ],
      { cwd: process.cwd(), encoding: "utf8" },
    ),
  );
}

test("선택형 구상 빈칸은 플레이 적용 문제로 만들지 않는다", () => {
  const result = runIssues(`
    const project = fixtures.createCurrentV1ProjectFixture();
    project.planning = Object.fromEntries(Object.keys(project.planning).map(key => [key, key === "structureMode" ? "five" : ""]));
    console.log(JSON.stringify(issues.findStoryApplyIssues(project)));
  `);

  assert.deepEqual(result, []);
});

test("적용 문제는 위치·행동·입력 필드를 함께 제공한다", () => {
  const result = runIssues(`
    const project = fixtures.createCurrentV1ProjectFixture();
    project.title = "";
    project.lines = [
      { ...project.lines[0], id: "line-empty", order: 1, text: "" },
      { ...project.lines[0], id: "line-speaker", order: 2, type: "dialogue", speaker: "left", text: "말", speakerName: "" },
      { ...project.lines[0], id: "line-narration", order: 3, type: "narration", speaker: "narration", speakerName: "해설", text: "(조용히) 비가 온다." },
    ];
    const found = issues.findStoryApplyIssues(project);
    console.log(JSON.stringify({found, navigation: found.map(issues.getStoryApplyIssueNavigation)}));
  `);

  assert.deepEqual(result.found.map((issue) => [issue.code, issue.field, issue.lineId]), [
    ["missing-title", "title", undefined],
    ["empty-line", "line-body", "line-empty"],
    ["missing-speaker-name", "speaker", "line-speaker"],
    ["narration-parentheses", "line-body", "line-narration"],
  ]);
  assert.match(result.found[1].message, /1장/);
  assert.match(result.found[1].message, /글상자가 비어 있어요/);
  assert.deepEqual(result.navigation[0], { workspace: "plan", focus: "title" });
  assert.deepEqual(result.navigation[2], {
    workspace: "create",
    view: "scene",
    chapterId: "chapter-001",
    lineId: "line-speaker",
    focus: "speaker",
  });
});

test("챕터나 장면이 없을 때도 고칠 다음 행동을 안전하게 안내한다", () => {
  const result = runIssues(`
    const project = fixtures.createCurrentV1ProjectFixture();
    project.chapters = [];
    project.lines = [];
    const found = issues.findStoryApplyIssues(project);
    console.log(JSON.stringify({found, navigation: found.map(issues.getStoryApplyIssueNavigation)}));
  `);

  assert.deepEqual(result.found.map((issue) => [issue.code, issue.field]), [
    ["missing-chapter", "chapter-action"],
    ["missing-scene", "scene-action"],
  ]);
  assert.deepEqual(result.navigation, [
    { workspace: "plan", focus: "none" },
    { workspace: "create", view: "chapter", focus: "none" },
  ]);
});

test("컷이 없는 장은 해당 장의 컷 쓰기로 안내해 적용을 막는다", () => {
  const result = runIssues(`
    const project = fixtures.createCurrentV1ProjectFixture();
    project.chapters.push({
      ...project.chapters[0],
      id: "chapter-empty",
      order: 2,
      title: "비어 있는 장",
    });
    const found = issues.findStoryApplyIssues(project);
    console.log(JSON.stringify({found, navigation: found.map(issues.getStoryApplyIssueNavigation)}));
  `);

  assert.deepEqual(result.found.map((issue) => [issue.code, issue.chapterId, issue.field]), [
    ["empty-chapter", "chapter-empty", "scene-action"],
  ]);
  assert.match(result.found[0].message, /2장/);
  assert.match(result.found[0].message, /컷을 하나 추가/);
  assert.deepEqual(result.navigation, [
    {
      workspace: "create",
      view: "chapter",
      chapterId: "chapter-empty",
      focus: "none",
    },
  ]);
});
