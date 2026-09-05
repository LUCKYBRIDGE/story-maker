import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import test from "node:test";

function runAssetPickerUtils(script) {
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
          const utils = await import("./app/story-asset-picker-utils.ts");
          const assetsModule = await import("./app/story-assets.ts");
          ${script}
        `,
      ],
      { cwd: process.cwd(), encoding: "utf8" },
    ),
  );
}

test("normalizeAssetSearch는 공백·확장자·특수문자·대소문자를 안전하게 정규화한다", () => {
  const result = runAssetPickerUtils(`
    const testCases = [
      utils.normalizeAssetSearch(" 토끼_기본.png "),
      utils.normalizeAssetSearch("자라·상반신"),
      utils.normalizeAssetSearch("DRAGON-KING.PNG"),
      utils.normalizeAssetSearch("  진짜 옹고집 - 화남  "),
      utils.normalizeAssetSearch(""),
    ];
    console.log(JSON.stringify(testCases));
  `);

  assert.deepEqual(result, [
    "토끼기본",
    "자라상반신",
    "dragonking",
    "진짜옹고집화남",
    "",
  ]);
});

test("sortStoryAssets는 추천 등급·사용 목적·구도·작품 및 캐릭터 순서에 따라 정렬한다", () => {
  const result = runAssetPickerUtils(`
    const allAssets = assetsModule.STORY_ASSETS;
    const characterAssets = allAssets.filter((a) => a.type === "character");
    const backgroundAssets = allAssets.filter((a) => a.type === "background");

    const sortedCharacters = utils.sortStoryAssets(characterAssets, "character");
    const sortedBackgrounds = utils.sortStoryAssets(backgroundAssets, "background");

    // 기본 추천이 추가 자료보다 앞에 위치하는지 검증
    const firstNonRecommendedCharIndex = sortedCharacters.findIndex(
      (a) => a.selectionTier !== "기본 추천"
    );
    const lastRecommendedCharIndex = sortedCharacters.findLastIndex(
      (a) => a.selectionTier === "기본 추천"
    );

    // 토끼와 자라가 옹고집전보다 앞에 오는지 검증 (기본 추천 그룹 내)
    const recommendedChars = sortedCharacters.filter((a) => a.selectionTier === "기본 추천");
    const firstRabbitIndex = recommendedChars.findIndex((a) => a.story === "토끼와 자라");
    const firstOnggojibIndex = recommendedChars.findIndex((a) => a.story === "옹고집전");

    // 배경 정렬에서 기본 추천이 추가 자료보다 앞에 오는지 검증
    const firstNonRecommendedBgIndex = sortedBackgrounds.findIndex(
      (a) => a.selectionTier !== "기본 추천"
    );
    const lastRecommendedBgIndex = sortedBackgrounds.findLastIndex(
      (a) => a.selectionTier === "기본 추천"
    );

    console.log(JSON.stringify({
      characterSortValid: lastRecommendedCharIndex < firstNonRecommendedCharIndex,
      storyOrderValid: firstRabbitIndex < firstOnggojibIndex,
      backgroundSortValid: lastRecommendedBgIndex < firstNonRecommendedBgIndex,
      firstChar: sortedCharacters[0]?.displayName,
      totalChars: sortedCharacters.length,
      totalBgs: sortedBackgrounds.length,
    }));
  `);

  assert.equal(result.characterSortValid, true);
  assert.equal(result.storyOrderValid, true);
  assert.equal(result.backgroundSortValid, true);
  assert.ok(result.totalChars > 0);
  assert.ok(result.totalBgs > 0);
});

test("groupStoryAssets는 캐릭터·배경 그룹화 및 preserveOrder 모드에서 순서를 보존한다", () => {
  const result = runAssetPickerUtils(`
    const allAssets = assetsModule.STORY_ASSETS;
    const characterAssets = allAssets.filter((a) => a.type === "character");
    const backgroundAssets = allAssets.filter((a) => a.type === "background");

    const charGroups = utils.groupStoryAssets(characterAssets, "character");
    const bgGroups = utils.groupStoryAssets(backgroundAssets, "background");

    // preserveOrder: true 테스트 - 인위적으로 역순 정렬된 3개 에셋 전달
    const sampleAssets = [
      characterAssets[20],
      characterAssets[5],
      characterAssets[0],
    ].filter(Boolean);

    const preservedGroups = utils.groupStoryAssets(sampleAssets, "character", true);
    const flattenedPreservedIds = preservedGroups.flatMap((g) => g.assets.map((a) => a.id));

    console.log(JSON.stringify({
      charGroupLabels: charGroups.map((g) => g.label),
      bgGroupLabels: bgGroups.map((g) => g.label),
      expectedSampleIds: sampleAssets.map((a) => a.id),
      flattenedPreservedIds,
    }));
  `);

  // 캐릭터 그룹 라벨은 tier · framing 형식
  assert.ok(result.charGroupLabels.some((label) => label.includes("기본 추천 · 전신")));
  // 배경 그룹 라벨은 tier 형식
  assert.ok(result.bgGroupLabels.includes("기본 추천"));
  // preserveOrder 모드에서는 입력된 순서가 그대로 유지됨
  assert.deepEqual(result.flattenedPreservedIds, result.expectedSampleIds);
});
