import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import test from "node:test";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));

function runStagesModule(script) {
  const output = execFileSync(
    process.execPath,
    [
      "--disable-warning=ExperimentalWarning",
      "--experimental-strip-types",
      "--experimental-loader=./tests/node-types-loader.mjs",
      "--input-type=module",
      "-e",
      `
        const stages = await import("./app/story-stages.ts");
        const fixtures = await import("./tests/fixtures/story-projects.mjs");
        ${script}
      `,
    ],
    { cwd: projectRoot, encoding: "utf8" },
  );
  return JSON.parse(output);
}

test("detectStageConsistencyIssues: ‘처음-중간-결말’ 어휘 혼용을 감지하고 3단계/4단계 추천안을 제공한다", () => {
  const result = runStagesModule(`
    const chapters = [
      { id: "c1", order: 1, title: "1장", storyStageKeys: ["opening"], storyStageRaw: "처음" },
      { id: "c2", order: 2, title: "2장", storyStageKeys: ["middle"], storyStageRaw: "중간" },
      { id: "c3", order: 3, title: "3장", storyStageKeys: ["ending"], storyStageRaw: "결말" },
    ];
    const warning = stages.detectStageConsistencyIssues(chapters, "three");
    console.log(JSON.stringify(warning));
  `);

  assert.ok(result);
  assert.equal(result.type, "mixed_vocabulary");
  assert.match(result.title, /용어가 섞여 있어요/);
  assert.match(result.message, /결말/);
  assert.ok(result.suggestions.length >= 2);
  assert.equal(result.suggestions[0].targetMode, "three");
  assert.equal(result.suggestions[1].targetMode, "four");
});

test("detectStageConsistencyIssues: ‘처음-전개-위기’ 어휘 혼용 및 결말 미완을 감지하고 5단계/3단계 추천안을 제공한다", () => {
  const result = runStagesModule(`
    const chapters = [
      { id: "c1", order: 1, title: "1장", storyStageKeys: ["opening"], storyStageRaw: "처음" },
      { id: "c2", order: 2, title: "2장", storyStageKeys: ["middle"], storyStageRaw: "전개" },
      { id: "c3", order: 3, title: "3장", storyStageKeys: ["crisis"], storyStageRaw: "위기" },
    ];
    const warning = stages.detectStageConsistencyIssues(chapters, "three");
    console.log(JSON.stringify(warning));
  `);

  assert.ok(result);
  assert.equal(result.type, "mixed_vocabulary");
  assert.match(result.message, /위기/);
  assert.equal(result.suggestions[0].targetMode, "five");
  assert.equal(result.suggestions[1].targetMode, "three");
});

test("detectStageConsistencyIssues: 3단계 모드에 ‘위기’나 ‘절정’이 포함된 모드 불일치를 감지한다", () => {
  const result = runStagesModule(`
    const chapters = [
      { id: "c1", order: 1, title: "1장", storyStageKeys: ["opening"] },
      { id: "c2", order: 2, title: "2장", storyStageKeys: ["middle"] },
      { id: "c3", order: 3, title: "3장", storyStageKeys: ["crisis"] },
    ];
    const warning = stages.detectStageConsistencyIssues(chapters, "three");
    console.log(JSON.stringify(warning));
  `);

  assert.ok(result);
  assert.equal(result.type, "mode_mismatch");
  assert.match(result.title, /3단계 구성에 다른 단계가 포함/);
  assert.match(result.message, /위기/);
});

test("detectStageConsistencyIssues: 4단계 모드에 5단계 ‘위기’가 포함된 경우를 감지한다", () => {
  const result = runStagesModule(`
    const chapters = [
      { id: "c1", order: 1, title: "1장", storyStageKeys: ["opening"] },
      { id: "c2", order: 2, title: "2장", storyStageKeys: ["middle"] },
      { id: "c3", order: 3, title: "3장", storyStageKeys: ["crisis"] },
      { id: "c4", order: 4, title: "4장", storyStageKeys: ["ending"] },
    ];
    const warning = stages.detectStageConsistencyIssues(chapters, "four");
    console.log(JSON.stringify(warning));
  `);

  assert.ok(result);
  assert.equal(result.type, "mode_mismatch");
  assert.match(result.title, /4단계 구성에 ‘위기’ 단계가 들어있어요/);
});

test("detectStageConsistencyIssues: 결말이 처음보다 앞에 있는 순서 역전을 감지한다", () => {
  const result = runStagesModule(`
    const chapters = [
      { id: "c1", order: 1, title: "1장", storyStageKeys: ["ending"] },
      { id: "c2", order: 2, title: "2장", storyStageKeys: ["middle"] },
      { id: "c3", order: 3, title: "3장", storyStageKeys: ["opening"] },
    ];
    const warning = stages.detectStageConsistencyIssues(chapters, "three");
    console.log(JSON.stringify(warning));
  `);

  assert.ok(result);
  assert.equal(result.type, "order_disorder");
});

test("detectStageConsistencyIssues: 단계 미설정(자유)이거나 정합한 단계일 때는 null을 반환한다", () => {
  const result = runStagesModule(`
    const freeChapters = [
      { id: "c1", order: 1, title: "1장", storyStageKeys: [] },
      { id: "c2", order: 2, title: "2장", storyStageKeys: [] },
    ];
    const validThreeChapters = [
      { id: "c1", order: 1, title: "1장", storyStageKeys: ["opening"] },
      { id: "c2", order: 2, title: "2장", storyStageKeys: ["middle"] },
      { id: "c3", order: 3, title: "3장", storyStageKeys: ["ending"] },
    ];
    const validFourChapters = [
      { id: "c1", order: 1, title: "1장", storyStageKeys: ["opening"] },
      { id: "c2", order: 2, title: "2장", storyStageKeys: ["middle"] },
      { id: "c3", order: 3, title: "3장", storyStageKeys: ["climax"] },
      { id: "c4", order: 4, title: "4장", storyStageKeys: ["ending"] },
    ];

    console.log(JSON.stringify({
      free: stages.detectStageConsistencyIssues(freeChapters, "three"),
      three: stages.detectStageConsistencyIssues(validThreeChapters, "three"),
      four: stages.detectStageConsistencyIssues(validFourChapters, "four"),
    }));
  `);

  assert.equal(result.free, null);
  assert.equal(result.three, null);
  assert.equal(result.four, null);
});

test("applyStageSuggestion: 추천안을 적용하면 장들의 단계와 모드가 깨끗하게 정규화되고 재검사 시 null을 반환한다", () => {
  const result = runStagesModule(`
    const chapters = [
      { id: "c1", order: 1, title: "1장", storyStageKeys: ["opening"], storyStageRaw: "처음" },
      { id: "c2", order: 2, title: "2장", storyStageKeys: ["middle"], storyStageRaw: "중간" },
      { id: "c3", order: 3, title: "3장", storyStageKeys: ["ending"], storyStageRaw: "결말" },
    ];
    const warning = stages.detectStageConsistencyIssues(chapters, "three");
    const suggestion = warning.suggestions[0]; // 3단계로 맞추기
    const applied = stages.applyStageSuggestion(chapters, suggestion);
    const rechecked = stages.detectStageConsistencyIssues(applied.chapters, applied.structureMode);

    console.log(JSON.stringify({
      appliedMode: applied.structureMode,
      c1Keys: applied.chapters[0].storyStageKeys,
      c2Keys: applied.chapters[1].storyStageKeys,
      c3Keys: applied.chapters[2].storyStageKeys,
      c3Raw: applied.chapters[2].storyStageRaw,
      rechecked,
    }));
  `);

  assert.equal(result.appliedMode, "three");
  assert.deepEqual(result.c1Keys, ["opening"]);
  assert.deepEqual(result.c2Keys, ["middle"]);
  assert.deepEqual(result.c3Keys, ["ending"]);
  assert.equal(result.c3Raw, undefined);
  assert.equal(result.rechecked, null);
});
