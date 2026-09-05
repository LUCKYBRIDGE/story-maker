import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { FIXTURE_IDS } from "./fixtures/story-projects.mjs";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const fixtureModuleUrl = new URL(
  "./fixtures/story-projects.mjs",
  import.meta.url,
).href;

function cloneFixture(factoryName) {
  const output = execFileSync(
    process.execPath,
    [
      "--disable-warning=ExperimentalWarning",
      "--experimental-strip-types",
      "--experimental-loader=./tests/node-types-loader.mjs",
      "--input-type=module",
      "-e",
      `
        const { cloneProject } = await import("./app/story-data.ts");
        const fixtures = await import(${JSON.stringify(fixtureModuleUrl)});
        const input = fixtures[${JSON.stringify(factoryName)}]();
        const original = structuredClone(input);
        const result = cloneProject(input);
        console.log(JSON.stringify({ input, original, result }));
      `,
    ],
    { cwd: projectRoot, encoding: "utf8" },
  );
  return JSON.parse(output);
}

test("정상 v1은 입력을 바꾸지 않고 줄바꿈과 앞뒤 공백을 보존한다", () => {
  const { input, original, result } = cloneFixture(
    "createCurrentV1ProjectFixture",
  );

  assert.deepEqual(input, original);
  assert.equal(result.lines[0].text, " 첫 문장입니다.\n둘째 문장입니다. ");
  assert.equal(result.planning.freeNotes, " 편지 끝 문장은 나중에 고친다.\n");
  assert.equal(result.creativeMemos[0].fields[0].value, "큰비로 나무다리 한쪽이 끊어진다.");
});
test("creativeMemos가 없는 이전 v1은 빈 배열을 얻고 입력은 유지된다", () => {
  const { input, original, result } = cloneFixture(
    "createLegacyProjectWithoutCreativeMemosFixture",
  );

  assert.deepEqual(input, original);
  assert.equal(Object.hasOwn(input, "creativeMemos"), false);
  assert.deepEqual(result.creativeMemos, []);
  assert.equal(result.lines[0].text, original.lines[0].text);
});

test("현재 v1은 중복 line ID를 자동으로 고치지 않는다는 특성을 유지한다", () => {
  const { input, original, result } = cloneFixture(
    "createDuplicateLineIdProjectFixture",
  );

  assert.deepEqual(input, original);
  assert.deepEqual(
    result.lines.map((line) => line.id),
    [FIXTURE_IDS.firstLine, FIXTURE_IDS.firstLine],
  );
  assert.equal(new Set(result.lines.map((line) => line.id)).size, 1);
});

test("현재 v1은 끊어진 chapter 참조를 자동으로 고치지 않는다는 특성을 유지한다", () => {
  const { input, original, result } = cloneFixture(
    "createMissingChapterReferenceProjectFixture",
  );

  assert.deepEqual(input, original);
  const chapterIds = new Set(result.chapters.map((chapter) => chapter.id));
  assert.equal(result.lines[1].chapterId, FIXTURE_IDS.missingChapter);
  assert.equal(chapterIds.has(result.lines[1].chapterId), false);
});

test("storyStageKeys가 없는 이전 v1 챕터는 빈 배열을 얻고 정규화된다", () => {
  const output = execFileSync(
    process.execPath,
    [
      "--disable-warning=ExperimentalWarning",
      "--experimental-strip-types",
      "--experimental-loader=./tests/node-types-loader.mjs",
      "--input-type=module",
      "-e",
      `
        const { cloneProject } = await import("./app/story-data.ts");
        const fixtures = await import(${JSON.stringify(fixtureModuleUrl)});
        const input = fixtures.createCurrentV1ProjectFixture();
        delete input.chapters[0].storyStageKeys;
        const original = structuredClone(input);
        const result = cloneProject(input);
        console.log(JSON.stringify({ input, original, result }));
      `,
    ],
    { cwd: projectRoot, encoding: "utf8" },
  );
  const { input, original, result } = JSON.parse(output);

  assert.deepEqual(input, original);
  assert.equal(Object.hasOwn(input.chapters[0], "storyStageKeys"), false);
  assert.deepEqual(result.chapters[0].storyStageKeys, []);
});
