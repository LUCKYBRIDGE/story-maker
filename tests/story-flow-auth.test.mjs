import test from "node:test";
import assert from "node:assert/strict";
import {
  TEACHER_PASSCODE,
  verifyTeacherPasscode,
  canCreateChoice,
  canAddThirdOption,
  countChoiceCuts,
} from "../app/story-flow-auth.ts";

test("TEACHER_PASSCODE is WAN", () => {
  assert.equal(TEACHER_PASSCODE, "WAN");
});

test("verifyTeacherPasscode accepts WAN in uppercase, lowercase, and trimmed", () => {
  assert.equal(verifyTeacherPasscode("WAN"), true);
  assert.equal(verifyTeacherPasscode("wan"), true);
  assert.equal(verifyTeacherPasscode(" Wan "), true);
  assert.equal(verifyTeacherPasscode("wAn"), true);
  assert.equal(verifyTeacherPasscode(""), false);
  assert.equal(verifyTeacherPasscode("1234"), false);
  assert.equal(verifyTeacherPasscode("WANT"), false);
  assert.equal(verifyTeacherPasscode("WA"), false);
});

test("countChoiceCuts counts lines with type 'choice'", () => {
  const project = {
    lines: [
      { id: "line-1", flow: { type: "choice", options: [] } },
      { id: "line-2", flow: { type: "goto", targetLineId: "line-3" } },
      { id: "line-3", flow: { type: "choice", options: [] } },
      { id: "line-4" },
    ],
  };
  assert.equal(countChoiceCuts(project), 2);
  assert.equal(countChoiceCuts(project, "line-1"), 1);
  assert.equal(countChoiceCuts(project, "line-2"), 2);
});

test("canCreateChoice allows first choice in story, but blocks second choice unless unlocked", () => {
  const blankProject = {
    lines: [
      { id: "line-1" },
      { id: "line-2" },
    ],
  };
  // 1st choice: allowed even when locked
  assert.deepEqual(canCreateChoice(blankProject, "line-1", false), { allowed: true });

  const oneChoiceProject = {
    lines: [
      { id: "line-1", flow: { type: "choice", options: [] } },
      { id: "line-2" },
    ],
  };
  // Editing existing choice line: allowed even when locked
  assert.deepEqual(canCreateChoice(oneChoiceProject, "line-1", false), { allowed: true });

  // Adding 2nd choice on different line: blocked when locked
  const check2 = canCreateChoice(oneChoiceProject, "line-2", false);
  assert.equal(check2.allowed, false);
  assert.match(check2.reason, /선택지를 너무 많이 늘리면/);

  // Adding 2nd choice when unlocked: allowed!
  assert.deepEqual(canCreateChoice(oneChoiceProject, "line-2", true), { allowed: true });
});

test("canAddThirdOption blocks 3rd option unless unlocked", () => {
  assert.equal(canAddThirdOption(undefined, false).allowed, false);
  assert.match(canAddThirdOption(undefined, false).reason, /두 갈래/);
  assert.equal(canAddThirdOption(undefined, true).allowed, true);
});
