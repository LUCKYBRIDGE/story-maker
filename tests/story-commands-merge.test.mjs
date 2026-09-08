import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import test from "node:test";

function runCommands(script) {
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
          const commands = await import("./app/story-commands.ts");
          const fixtures = await import("./tests/fixtures/story-projects.mjs");
          ${script}
        `,
      ],
      { cwd: process.cwd(), encoding: "utf8" },
    ),
  );
}

test("canMergeStoryLines: 같은 화자·위치의 대사와 해설끼리는 합칠 수 있고, 다른 조건은 거부한다", () => {
  const result = runCommands(`
    const base = {
      id: "line-1",
      chapterId: "chapter-1",
      order: 1,
      type: "dialogue",
      speaker: "left",
      speakerName: "용왕",
      text: "대사",
      leftAssetId: "",
      rightAssetId: "",
      backgroundId: "",
      purposeNote: "",
      emotionNote: "",
      directionNote: "",
    };

    const sameSpeaker = commands.canMergeStoryLines(base, { ...base, id: "line-2", order: 2, text: "이어지는 대사" });
    const diffSpeaker = commands.canMergeStoryLines(base, { ...base, id: "line-2", order: 2, speakerName: "토끼" });
    const diffPosition = commands.canMergeStoryLines(base, { ...base, id: "line-2", order: 2, speaker: "right" });
    const diffChapter = commands.canMergeStoryLines(base, { ...base, id: "line-2", chapterId: "chapter-2" });
    
    const narration1 = { ...base, id: "nar-1", type: "narration", speaker: "narration", speakerName: "해설" };
    const narration2 = { ...base, id: "nar-2", type: "narration", speaker: "narration", speakerName: "해설", text: "해설 둘" };
    const bothNarration = commands.canMergeStoryLines(narration1, narration2);
    const mixed = commands.canMergeStoryLines(base, narration1);

    console.log(JSON.stringify({
      sameSpeaker,
      diffSpeaker,
      diffPosition,
      diffChapter,
      bothNarration,
      mixed,
    }));
  `);

  assert.equal(result.sameSpeaker, true);
  assert.equal(result.diffSpeaker, false);
  assert.equal(result.diffPosition, false);
  assert.equal(result.diffChapter, false);
  assert.equal(result.bothNarration, true);
  assert.equal(result.mixed, false);
});

test("mergeStoryLines: 두 컷을 하나로 합치고 본문 연결, 자산 보존, 연속 order를 유지한다", () => {
  const result = runCommands(`
    const lines = [
      {
        id: "line-1",
        chapterId: "chapter-1",
        order: 1,
        type: "dialogue",
        speaker: "left",
        speakerName: "용왕",
        text: "전하, 약을 찾았습니다.",
        leftAssetId: "yongwang",
        rightAssetId: "",
        backgroundId: "bg-palace",
        purposeNote: "",
        emotionNote: "",
        directionNote: "",
      },
      {
        id: "line-2",
        chapterId: "chapter-1",
        order: 2,
        type: "dialogue",
        speaker: "left",
        speakerName: "용왕",
        text: "육지 토끼의 간입니다.",
        leftAssetId: "",
        rightAssetId: "zara",
        backgroundId: "",
        purposeNote: "",
        emotionNote: "",
        directionNote: "",
      },
      {
        id: "line-3",
        chapterId: "chapter-1",
        order: 3,
        type: "dialogue",
        speaker: "right",
        speakerName: "토끼",
        text: "저를요?",
        leftAssetId: "",
        rightAssetId: "rabbit",
        backgroundId: "",
        purposeNote: "",
        emotionNote: "",
        directionNote: "",
      },
    ];

    const merged = commands.mergeStoryLines({
      lines,
      sourceLineId: "line-1",
      targetLineId: "line-2",
    });

    const failed = commands.mergeStoryLines({
      lines,
      sourceLineId: "line-1",
      targetLineId: "line-3",
    });

    console.log(JSON.stringify({ merged, failed }));
  `);

  assert.equal(result.merged.ok, true);
  assert.equal(result.merged.lines.length, 2);
  assert.equal(result.merged.lines[0].id, "line-1");
  assert.equal(result.merged.lines[0].order, 1);
  assert.equal(result.merged.lines[0].text, "전하, 약을 찾았습니다. 육지 토끼의 간입니다.");
  assert.equal(result.merged.lines[0].leftAssetId, "yongwang");
  assert.equal(result.merged.lines[0].rightAssetId, "zara");
  assert.equal(result.merged.lines[1].id, "line-3");
  assert.equal(result.merged.lines[1].order, 2);
  assert.equal(result.merged.selectedLineId, "line-1");

  assert.equal(result.failed.ok, false);
  assert.equal(result.failed.code, "cannot-merge");
});
