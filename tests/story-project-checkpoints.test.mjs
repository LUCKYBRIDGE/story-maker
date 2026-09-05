import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import test from "node:test";

function runCheckpointModule(script) {
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
          const checkpointModule = await import("./app/story-project-checkpoints.ts");
          const fixtures = await import("./tests/fixtures/story-projects.mjs");
          ${script}
        `,
      ],
      { cwd: process.cwd(), encoding: "utf8" },
    ),
  );
}

test("체크포인트는 원인·문서·시각을 보존하고 같은 상태를 중복 저장하지 않는다", () => {
  const result = runCheckpointModule(`
    const values = new Map();
    const storage = {
      getItem: (key) => values.get(key) ?? null,
      setItem: (key, value) => values.set(key, value),
    };
    let sequence = 0;
    const repository = checkpointModule.createStoryProjectCheckpointRepository({
      storage,
      now: () => \`2026-09-01T10:00:\${String(sequence++).padStart(2, "0")}.000Z\`,
      appVersion: "test-app/1.2.3",
      limit: 3,
    });
    const first = fixtures.createCurrentV1ProjectFixture();
    const created = [repository.create("before-delete", first)];
    const duplicate = repository.create("before-delete", first);
    for (const title of ["둘", "셋", "넷"]) {
      const project = fixtures.createCurrentV1ProjectFixture();
      project.title = title;
      created.push(repository.create("before-delete", project));
    }
    console.log(JSON.stringify({
      duplicate,
      created,
      checkpoints: repository.list(),
      stored: JSON.parse(values.get(checkpointModule.STORY_CHECKPOINT_STORAGE_KEY)),
    }));
  `);

  assert.equal(result.duplicate.ok, true);
  assert.equal(result.duplicate.skipped, true);
  assert.equal(result.checkpoints.ok, true);
  assert.equal(result.checkpoints.checkpoints.length, 3);
  assert.deepEqual(
    result.checkpoints.checkpoints.map((checkpoint) => checkpoint.document.project.title),
    ["넷", "셋", "둘"],
  );
  assert.equal(result.stored[0].reason, "before-delete");
  assert.equal(result.stored[0].document.documentType, "story-maker-project");
});

test("복구 전 현재본을 남겨 취소 뒤 재복구해도 작품을 잃지 않는다", () => {
  const result = runCheckpointModule(`
    const values = new Map();
    const storage = {
      getItem: (key) => values.get(key) ?? null,
      setItem: (key, value) => values.set(key, value),
    };
    let sequence = 0;
    const repository = checkpointModule.createStoryProjectCheckpointRepository({
      storage,
      now: () => \`2026-09-01T10:01:\${String(sequence++).padStart(2, "0")}.000Z\`,
    });
    const original = fixtures.createCurrentV1ProjectFixture();
    original.title = "복구할 작품";
    const created = repository.create("before-delete", original);
    const current = fixtures.createCurrentV1ProjectFixture();
    current.title = "현재 편집본";
    const cancelledCurrent = structuredClone(current);
    const restored = repository.restore(created.checkpoint.id, current);
    const replay = repository.restore(restored.checkpoints[0].id, restored.project);
    console.log(JSON.stringify({ cancelledCurrent, current, restored, replay }));
  `);

  assert.deepEqual(result.current, result.cancelledCurrent);
  assert.equal(result.restored.ok, true);
  assert.equal(result.restored.project.title, "복구할 작품");
  assert.equal(result.replay.ok, true);
  assert.equal(result.replay.project.title, "현재 편집본");
});

test("저장 공간 실패와 손상 기록은 현재 작품이나 정상 기록을 덮어쓰지 않는다", () => {
  const result = runCheckpointModule(`
    const values = new Map([
      [checkpointModule.STORY_CHECKPOINT_STORAGE_KEY, "not-json"],
    ]);
    const brokenStorage = {
      getItem: (key) => values.get(key) ?? null,
      setItem: () => { throw new Error("quota"); },
    };
    const repository = checkpointModule.createStoryProjectCheckpointRepository({
      storage: brokenStorage,
    });
    const current = fixtures.createCurrentV1ProjectFixture();
    const before = structuredClone(current);
    console.log(JSON.stringify({
      list: repository.list(),
      create: repository.create("before-delete", current),
      current,
      before,
      stored: values.get(checkpointModule.STORY_CHECKPOINT_STORAGE_KEY),
    }));
  `);

  assert.equal(result.list.ok, false);
  assert.equal(result.create.ok, false);
  assert.deepEqual(result.current, result.before);
  assert.equal(result.stored, "not-json");
});
