import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import test from "node:test";

function run(script) {
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
          const auth = await import("./app/story-flow-auth.ts");
          ${script}
        `,
      ],
      { cwd: process.cwd(), encoding: "utf8" },
    ),
  );
}

test("TEACHER_PASSCODE is WAN", () => {
  const result = run(`console.log(JSON.stringify(auth.TEACHER_PASSCODE));`);
  assert.equal(result, "WAN");
});

test("verifyTeacherPasscode accepts WAN in uppercase, lowercase, and trimmed", () => {
  const result = run(`
    const testCases = [
      auth.verifyTeacherPasscode("WAN"),
      auth.verifyTeacherPasscode("wan"),
      auth.verifyTeacherPasscode(" Wan "),
      auth.verifyTeacherPasscode("wAn"),
      auth.verifyTeacherPasscode(""),
      auth.verifyTeacherPasscode("1234"),
      auth.verifyTeacherPasscode("WANT"),
      auth.verifyTeacherPasscode("WA"),
    ];
    console.log(JSON.stringify(testCases));
  `);
  assert.deepEqual(result, [true, true, true, true, false, false, false, false]);
});

test("countChoiceCuts counts lines with type 'choice'", () => {
  const result = run(`
    const project = {
      lines: [
        { id: "line-1", flow: { type: "choice", options: [] } },
        { id: "line-2", flow: { type: "goto", targetLineId: "line-3" } },
        { id: "line-3", flow: { type: "choice", options: [] } },
        { id: "line-4" },
      ],
    };
    console.log(JSON.stringify({
      total: auth.countChoiceCuts(project),
      excludeLine1: auth.countChoiceCuts(project, "line-1"),
      excludeLine2: auth.countChoiceCuts(project, "line-2"),
    }));
  `);
  assert.equal(result.total, 2);
  assert.equal(result.excludeLine1, 1);
  assert.equal(result.excludeLine2, 2);
});

test("canCreateChoice allows first choice in story, but blocks second choice unless unlocked", () => {
  const result = run(`
    const blankProject = {
      lines: [
        { id: "line-1" },
        { id: "line-2" },
      ],
    };
    const oneChoiceProject = {
      lines: [
        { id: "line-1", flow: { type: "choice", options: [] } },
        { id: "line-2" },
      ],
    };
    console.log(JSON.stringify({
      blankLocked: auth.canCreateChoice(blankProject, "line-1", false),
      editExistingLocked: auth.canCreateChoice(oneChoiceProject, "line-1", false),
      addSecondLocked: auth.canCreateChoice(oneChoiceProject, "line-2", false),
      addSecondUnlocked: auth.canCreateChoice(oneChoiceProject, "line-2", true),
    }));
  `);
  assert.deepEqual(result.blankLocked, { allowed: true });
  assert.deepEqual(result.editExistingLocked, { allowed: true });
  assert.equal(result.addSecondLocked.allowed, false);
  assert.match(result.addSecondLocked.reason, /선택지를 너무 많이 늘리면/);
  assert.deepEqual(result.addSecondUnlocked, { allowed: true });
});

test("canAddThirdOption blocks 3rd option unless unlocked", () => {
  const result = run(`
    console.log(JSON.stringify({
      locked: auth.canAddThirdOption(undefined, false),
      unlocked: auth.canAddThirdOption(undefined, true),
    }));
  `);
  assert.equal(result.locked.allowed, false);
  assert.match(result.locked.reason, /두 갈래/);
  assert.equal(result.unlocked.allowed, true);
});
