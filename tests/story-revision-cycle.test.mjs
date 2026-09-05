import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import test from "node:test";

function runRevisionCycle(script) {
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
          const revision = await import("./app/story-revision-cycle.ts");
          ${script}
        `,
      ],
      { cwd: process.cwd(), encoding: "utf8" },
    ),
  );
}

test("구조마다 고쳐쓰기 질문은 학생이 직접 찾는 네 가지 관점을 제공한다", () => {
  const result = runRevisionCycle(`
    const modes = ["five", "four", "three"];
    console.log(JSON.stringify(Object.fromEntries(
      modes.map((mode) => [mode, revision.storyRevisionPrompts(mode)]),
    )));
  `);

  for (const prompts of Object.values(result)) {
    assert.equal(prompts.length, 4);
    assert.deepEqual(
      prompts.map((prompt) => prompt.id),
      ["character-goal", "scene-cause", "dialogue-and-narration", "story-shape"],
    );
    assert.doesNotMatch(JSON.stringify(prompts), /정답|점수|등급|자동/);
  }
  assert.match(result.five[3].question, /위기/);
  assert.match(result.three[3].question, /중간/);
});

test("확인함과 나중에 볼래요만 기기 상태에 불변으로 기록한다", () => {
  const result = runRevisionCycle(`
    const key = revision.storyRevisionResponseKey({
      projectId: "project-1", structureMode: "four", promptId: "story-shape",
    });
    const first = revision.setStoryRevisionResponse({
      responses: {}, key, response: "checked",
    });
    const second = revision.setStoryRevisionResponse({
      responses: first, key, response: "later",
    });
    const normalized = revision.normalizeStoryRevisionResponses({
      [key]: "later", ignored: "answer", count: 2,
    });
    console.log(JSON.stringify({ key, first, second, normalized }));
  `);

  assert.equal(result.key, "project-1:four:story-shape");
  assert.deepEqual(result.first, { [result.key]: "checked" });
  assert.deepEqual(result.second, { [result.key]: "later" });
  assert.deepEqual(result.normalized, { [result.key]: "later" });
});
