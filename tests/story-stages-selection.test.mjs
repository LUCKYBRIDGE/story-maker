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
        const validation = await import("./app/story-project-validation.ts");
        ${script}
      `,
    ],
    { cwd: projectRoot, encoding: "utf8" },
  );
  return JSON.parse(output);
}

test("STORY_STRUCTURE_OPTIONS는 3단계, 4단계(발단-전개-절정-결말), 5단계를 명확히 제공한다", () => {
  const result = runStagesModule(`
    const options = stages.STORY_STRUCTURE_OPTIONS;
    console.log(JSON.stringify({
      modes: options.map(o => o.mode),
      titles: options.map(o => o.title),
      fourSteps: stages.getStructureSteps("four").map(s => s.label),
      threeSteps: stages.getStructureSteps("three").map(s => s.label),
      fiveSteps: stages.getStructureSteps("five").map(s => s.label),
    }));
  `);

  assert.deepEqual(result.modes, ["three", "four", "five"]);
  assert.equal(result.titles[0], "처음 → 중간 → 끝");
  assert.equal(result.titles[1], "발단 → 전개 → 절정 → 결말");
  assert.equal(result.titles[2], "발단 → 전개 → 위기 → 절정 → 결말");
  assert.deepEqual(result.threeSteps, ["처음", "중간", "끝"]);
  assert.deepEqual(result.fourSteps, ["발단", "전개", "절정", "결말"]);
  assert.deepEqual(result.fiveSteps, ["발단", "전개", "위기", "절정", "결말"]);
});

test("STAGE_NAME_TO_KEY는 기승전결 및 처음·중간·끝, 발단·전개·절정·결말을 올바르게 매핑한다", () => {
  const result = runStagesModule(`
    console.log(JSON.stringify({
      gi: stages.parseStoryStageKey("기"),
      seung: stages.parseStoryStageKey("승"),
      jeon: stages.parseStoryStageKey("전"),
      gyeol: stages.parseStoryStageKey("결"),
      cheoeum: stages.parseStoryStageKey("처음"),
      junggan: stages.parseStoryStageKey("중간"),
      kkeut: stages.parseStoryStageKey("끝"),
      baldan: stages.parseStoryStageKey("발단"),
      jeongae: stages.parseStoryStageKey("전개"),
      jeoljeong: stages.parseStoryStageKey("절정"),
      wigi: stages.parseStoryStageKey("위기"),
      textParsed: stages.parseStoryStageKeysText("기, 승, 전, 결"),
    }));
  `);

  assert.equal(result.gi, "opening");
  assert.equal(result.seung, "middle");
  assert.equal(result.jeon, "climax");
  assert.equal(result.gyeol, "ending");
  assert.equal(result.cheoeum, "opening");
  assert.equal(result.junggan, "middle");
  assert.equal(result.kkeut, "ending");
  assert.equal(result.baldan, "opening");
  assert.equal(result.jeongae, "middle");
  assert.equal(result.jeoljeong, "climax");
  assert.equal(result.wigi, "crisis");
  assert.deepEqual(result.textParsed.keys, ["opening", "middle", "climax", "ending"]);
});

test("단계를 설정하지 않아도(미설정/자유) 유효성 검사를 통과하고 기본 라벨이 안전하게 표시된다", () => {
  const result = runStagesModule(`
    const project = fixtures.createCurrentV1ProjectFixture();
    project.chapters[0].storyStageKeys = [];
    const valid = validation.normalizeAndValidateStoryProject(project);
    const labelEmpty = stages.formatStoryStageLabels([], "four", "단계 미설정 (자유)");
    const labelSet = stages.formatStoryStageLabels(["opening"], "four");
    console.log(JSON.stringify({
      isValid: valid.issues.length === 0,
      issueCount: valid.issues.length,
      labelEmpty,
      labelSet,
    }));
  `);

  assert.equal(result.isValid, true);
  assert.equal(result.issueCount, 0);
  assert.equal(result.labelEmpty, "단계 미설정 (자유)");
  assert.equal(result.labelSet, "발단");
});
