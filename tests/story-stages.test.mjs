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
        const stagesModule = await import("./app/story-stages.ts");
        ${script}
      `,
    ],
    { cwd: projectRoot, encoding: "utf8" },
  );
  return JSON.parse(output);
}

test("canonicalizeStoryStageKeys는 중복을 제거하고 정규 순서로 정렬한다", () => {
  const result = runStagesModule(`
    console.log(JSON.stringify({
      dedupAndSort: stagesModule.canonicalizeStoryStageKeys(["climax", "opening", "climax", "middle"]),
      empty: stagesModule.canonicalizeStoryStageKeys([]),
      nullish: stagesModule.canonicalizeStoryStageKeys(null),
      invalidFiltered: stagesModule.canonicalizeStoryStageKeys(["foo", "ending", "invalid", "crisis"]),
    }));
  `);

  assert.deepEqual(result.dedupAndSort, ["opening", "middle", "climax"]);
  assert.deepEqual(result.empty, []);
  assert.deepEqual(result.nullish, []);
  assert.deepEqual(result.invalidFiltered, ["crisis", "ending"]);
});

test("formatStoryStageLabels는 구성 방식에 맞춰 가운뎃점(·)으로 라벨을 포맷한다", () => {
  const result = runStagesModule(`
    console.log(JSON.stringify({
      fiveCrisisClimax: stagesModule.formatStoryStageLabels(["crisis", "climax"], "five"),
      fiveMiddleThree: stagesModule.formatStoryStageLabels(["middle", "crisis", "climax"], "five"),
      threeAll: stagesModule.formatStoryStageLabels(["opening", "middle", "ending"], "three"),
      emptyWithFallback: stagesModule.formatStoryStageLabels([], "five", "단계 미지정"),
      emptyWithoutFallback: stagesModule.formatStoryStageLabels([], "five"),
    }));
  `);

  assert.equal(result.fiveCrisisClimax, "위기·절정");
  assert.equal(result.fiveMiddleThree, "전개·위기·절정");
  assert.equal(result.threeAll, "처음·중간·끝");
  assert.equal(result.emptyWithFallback, "단계 미지정");
  assert.equal(result.emptyWithoutFallback, "");
});

test("mapStageToStructureLabel은 3·4·5단계 명칭을 정확히 매핑한다", () => {
  const result = runStagesModule(`
    console.log(JSON.stringify({
      openingFive: stagesModule.mapStageToStructureLabel("opening", "five"),
      openingThree: stagesModule.mapStageToStructureLabel("opening", "three"),
      middleThree: stagesModule.mapStageToStructureLabel("middle", "three"),
      endingThree: stagesModule.mapStageToStructureLabel("ending", "three"),
      endingFive: stagesModule.mapStageToStructureLabel("ending", "five"),
    }));
  `);

  assert.equal(result.openingFive, "발단");
  assert.equal(result.openingThree, "처음");
  assert.equal(result.middleThree, "중간");
  assert.equal(result.endingThree, "끝");
  assert.equal(result.endingFive, "결말");
});

test("recommendChapterStageKeys는 권장 시나리오(5단계 5장, 5단계 3장, 3단계 1장 등)를 충족한다", () => {
  const result = runStagesModule(`
    console.log(JSON.stringify({
      // 5단계 5장: 한 단계씩
      fiveIn5: [0, 1, 2, 3, 4].map((i) => stagesModule.recommendChapterStageKeys(i, 5, "five")),
      // 5단계 3장: 발단 / 전개·위기·절정 / 결말
      fiveIn3: [0, 1, 2].map((i) => stagesModule.recommendChapterStageKeys(i, 3, "five")),
      // 3단계 1장: 처음·중간·끝
      threeIn1: stagesModule.recommendChapterStageKeys(0, 1, "three"),
      // 5단계 1장: 전체 5단계
      fiveIn1: stagesModule.recommendChapterStageKeys(0, 1, "five"),
      // 5단계 6장: 순서대로 분배
      fiveIn6: [0, 1, 2, 3, 4, 5].map((i) => stagesModule.recommendChapterStageKeys(i, 6, "five")),
    }));
  `);

  // 5단계 5장
  assert.deepEqual(result.fiveIn5, [
    ["opening"],
    ["middle"],
    ["crisis"],
    ["climax"],
    ["ending"],
  ]);

  // 5단계 3장: 발단 / 전개·위기·절정 / 결말
  assert.deepEqual(result.fiveIn3, [
    ["opening"],
    ["middle", "crisis", "climax"],
    ["ending"],
  ]);

  // 3단계 1장: 처음·중간·끝 (opening, middle, ending)
  assert.deepEqual(result.threeIn1, ["opening", "middle", "ending"]);

  // 5단계 1장: 발단~결말
  assert.deepEqual(result.fiveIn1, ["opening", "middle", "crisis", "climax", "ending"]);

  // 5단계 6장: 첫 장은 opening, 마지막 장은 ending 보장
  assert.deepEqual(result.fiveIn6[0], ["opening"]);
  assert.deepEqual(result.fiveIn6[5], ["ending"]);
  assert.equal(result.fiveIn6.length, 6);
});

test("getStageToChaptersMap과 getUnlinkedStagesAndChapters는 연결 및 미연결 상태를 계산한다", () => {
  const result = runStagesModule(`
    const chapters = [
      { id: "c1", order: 1, title: "1장", storyStageKeys: ["opening"] },
      { id: "c2", order: 2, title: "2장", storyStageKeys: ["crisis", "climax"] },
      { id: "c3", order: 3, title: "3장", storyStageKeys: [] },
    ];
    console.log(JSON.stringify({
      stageMap: stagesModule.getStageToChaptersMap(chapters),
      unlinkedFive: stagesModule.getUnlinkedStagesAndChapters(chapters, "five"),
      unlinkedThree: stagesModule.getUnlinkedStagesAndChapters(chapters, "three"),
    }));
  `);

  assert.equal(result.stageMap.opening.length, 1);
  assert.equal(result.stageMap.crisis.length, 1);
  assert.equal(result.stageMap.climax.length, 1);
  assert.equal(result.stageMap.middle.length, 0);
  assert.equal(result.stageMap.ending.length, 0);

  // 5단계 모드에서 미연결 장: c3, 미연결 단계: middle, ending
  assert.deepEqual(result.unlinkedFive.unlinkedChapters.map((c) => c.id), ["c3"]);
  assert.deepEqual(result.unlinkedFive.unlinkedStages, ["middle", "ending"]);

  // 3단계 모드(처음/중간/끝): c1(opening)은 연결됨, middle과 ending은 미연결
  assert.deepEqual(result.unlinkedThree.unlinkedChapters.map((c) => c.id), ["c3"]);
  assert.deepEqual(result.unlinkedThree.unlinkedStages, ["middle", "ending"]);
});
