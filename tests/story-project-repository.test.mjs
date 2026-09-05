import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import test from "node:test";

function runRepositoryModule(script) {
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
          const repositoryModule = await import("./app/story-project-repository.ts");
          const fixtures = await import("./tests/fixtures/story-projects.mjs");
          ${script}
        `,
      ],
      { cwd: process.cwd(), encoding: "utf8" },
    ),
  );
}

test("기존 v1 초안은 읽은 뒤 같은 저장 키에 문서 봉투로 마이그레이션한다", () => {
  const result = runRepositoryModule(`
    const values = new Map();
    const storage = {
      getItem: (key) => values.get(key) ?? null,
      setItem: (key, value) => values.set(key, value),
    };
    const legacy = fixtures.createLegacyProjectWithoutCreativeMemosFixture();
    values.set(repositoryModule.STORY_DRAFT_STORAGE_KEY, JSON.stringify(legacy));
    const repository = repositoryModule.createLocalStoryProjectRepository({
      storage,
      now: () => "2026-09-01T10:00:00.000Z",
      appVersion: "test-app/1.2.3",
    });
    const loaded = repository.loadDraft();
    console.log(JSON.stringify({
      loaded,
      stored: JSON.parse(values.get(repositoryModule.STORY_DRAFT_STORAGE_KEY)),
      legacy,
    }));
  `);

  assert.equal(result.loaded.ok, true);
  assert.equal(result.loaded.source, "legacy-v1");
  assert.deepEqual(result.loaded.project.creativeMemos, []);
  assert.equal(result.stored.documentType, "story-maker-project");
  assert.equal(result.stored.schemaVersion, 1);
  assert.equal(result.stored.savedAt, "2026-09-01T10:00:00.000Z");
  assert.equal("creativeMemos" in result.legacy, false);
});

test("손상 저장본은 현재 초안을 덮어쓰지 않고 위치가 있는 오류를 반환한다", () => {
  const result = runRepositoryModule(`
    const values = new Map([
      [repositoryModule.STORY_DRAFT_STORAGE_KEY, fixtures.MALFORMED_STORY_PROJECT_JSON],
    ]);
    const storage = {
      getItem: (key) => values.get(key) ?? null,
      setItem: (key, value) => values.set(key, value),
    };
    const repository = repositoryModule.createLocalStoryProjectRepository({ storage });
    const currentDraft = fixtures.createCurrentV1ProjectFixture();
    const before = structuredClone(currentDraft);
    const loaded = repository.loadDraft();
    console.log(JSON.stringify({ loaded, currentDraft, before, stored: values.get(repositoryModule.STORY_DRAFT_STORAGE_KEY) }));
  `);

  assert.equal(result.loaded.ok, false);
  assert.deepEqual(result.loaded.issues, [{
    code: "invalid-json",
    path: "$",
    message: "Document JSON could not be parsed.",
  }]);
  assert.deepEqual(result.currentDraft, result.before);
  assert.equal(result.stored, '{"id":"fixture-story-001","title":"닫히지 않은 JSON"');
});

test("지연 저장은 마지막 초안만 저장하고 flush와 저장 상태를 제공한다", () => {
  const result = runRepositoryModule(`
    const values = new Map();
    const scheduled = new Map();
    let nextTimerId = 1;
    const timer = {
      setTimeout: (callback) => {
        const id = nextTimerId++;
        scheduled.set(id, callback);
        return id;
      },
      clearTimeout: (id) => scheduled.delete(id),
    };
    const storage = {
      getItem: (key) => values.get(key) ?? null,
      setItem: (key, value) => values.set(key, value),
    };
    const repository = repositoryModule.createLocalStoryProjectRepository({
      storage,
      now: () => "2026-09-01T10:00:00.000Z",
    });
    const statuses = [];
    const queue = repositoryModule.createStoryProjectSaveQueue({
      repository,
      timer,
      onStatusChange: (status) => statuses.push(status),
    });
    const first = fixtures.createCurrentV1ProjectFixture();
    const last = fixtures.createCurrentV1ProjectFixture();
    first.title = "첫 입력";
    last.title = "마지막 입력";
    queue.schedule(first);
    queue.schedule(last);
    const callbacks = [...scheduled.values()];
    callbacks.forEach((callback) => callback());
    const stored = JSON.parse(values.get(repositoryModule.STORY_DRAFT_STORAGE_KEY));
    console.log(JSON.stringify({ statuses, scheduled: scheduled.size, stored, flushed: queue.flush() }));
  `);

  assert.deepEqual(result.statuses, ["saving", "saving", "saved"]);
  assert.equal(result.scheduled, 0);
  assert.equal(result.stored.project.title, "마지막 입력");
  assert.equal(result.flushed, undefined);
});

test("저장 실패는 failed 상태와 Excel 보관 안내를 반환한다", () => {
  const result = runRepositoryModule(`
    const storage = {
      getItem: () => null,
      setItem: () => { throw new Error("quota"); },
    };
    const repository = repositoryModule.createLocalStoryProjectRepository({ storage });
    const statuses = [];
    const queue = repositoryModule.createStoryProjectSaveQueue({
      repository,
      onStatusChange: (status) => statuses.push(status),
    });
    queue.schedule(fixtures.createCurrentV1ProjectFixture());
    const result = queue.flush();
    console.log(JSON.stringify({ result, statuses }));
  `);

  assert.deepEqual(result.statuses, ["saving", "failed"]);
  assert.deepEqual(result.result, {
    ok: false,
    message: "기기에 저장하지 못했어요. Excel로 저장해 작품을 보관해 주세요.",
  });
});
