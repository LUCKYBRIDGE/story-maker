import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import test from "node:test";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const fixtureModuleUrl = new URL(
  "./fixtures/story-projects.mjs",
  import.meta.url,
).href;

function runDocumentModule(source) {
  const output = execFileSync(
    process.execPath,
    [
      "--disable-warning=ExperimentalWarning",
      "--experimental-strip-types",
      "--experimental-loader=./tests/node-types-loader.mjs",
      "--input-type=module",
      "-e",
      `
        const documentModule = await import("./app/story-project-document.ts");
        const fixtures = await import(${JSON.stringify(fixtureModuleUrl)});
        ${source}
      `,
    ],
    { cwd: projectRoot, encoding: "utf8" },
  );
  return JSON.parse(output);
}

test("StoryDocument는 식별자·버전·주입된 앱 버전과 독립된 작품 복사본을 만든다", () => {
  const result = runDocumentModule(`
    const project = fixtures.createCurrentV1ProjectFixture();
    const original = structuredClone(project);
    const document = documentModule.createStoryDocument({
      project,
      savedAt: "2026-09-01T09:30:00.000Z",
      appVersion: "test-app/1.2.3",
      assetCatalogVersion: "catalog-v2-alpha",
    });
    console.log(JSON.stringify({
      document,
      input: project,
      original,
      projectReferenceIsShared: document.project === project,
    }));
  `);

  assert.deepEqual(result.input, result.original);
  assert.equal(result.projectReferenceIsShared, false);
  assert.equal(result.document.documentType, "story-maker-project");
  assert.equal(result.document.schemaVersion, 1);
  assert.equal(result.document.savedAt, "2026-09-01T09:30:00.000Z");
  assert.equal(result.document.appVersion, "test-app/1.2.3");
  assert.equal(result.document.assetCatalogVersion, "catalog-v2-alpha");
  assert.deepEqual(result.document.project, result.original);
});

test("엄격한 ISO UTC 시각만 허용하고 달력상 존재하지 않는 시각도 거부한다", () => {
  const result = runDocumentModule(`
    const values = [
      "2026-09-01T09:30:00.000Z",
      "2024-02-29T00:00:00.000Z",
      "2026-09-01T09:30:00Z",
      "2026-09-01T09:30:00.000+09:00",
      "2026-02-29T00:00:00.000Z",
      "not-a-date",
    ];
    const project = fixtures.createCurrentV1ProjectFixture();
    const creationErrors = values.map((savedAt) => {
      try {
        documentModule.createStoryDocument({
          project,
          savedAt,
          appVersion: "test-app/1.2.3",
        });
        return null;
      } catch (error) {
        return error instanceof Error ? error.message : String(error);
      }
    });
    console.log(JSON.stringify({
      validity: values.map((value) => documentModule.isStrictIsoUtcTimestamp(value)),
      creationErrors,
    }));
  `);

  assert.deepEqual(result.validity, [true, true, false, false, false, false]);
  assert.deepEqual(result.creationErrors, [
    null,
    null,
    "savedAt must be a strict ISO 8601 UTC timestamp.",
    "savedAt must be a strict ISO 8601 UTC timestamp.",
    "savedAt must be a strict ISO 8601 UTC timestamp.",
    "savedAt must be a strict ISO 8601 UTC timestamp.",
  ]);
});

test("StoryDocument의 JSON 왕복은 작품과 선택 메타데이터를 보존한다", () => {
  const result = runDocumentModule(`
    const project = fixtures.createCurrentV1ProjectFixture();
    const document = documentModule.createStoryDocument({
      project,
      savedAt: "2026-09-01T09:30:00.000Z",
      appVersion: "test-app/1.2.3",
    });
    const roundTripped = JSON.parse(JSON.stringify(document));
    console.log(JSON.stringify({ document, roundTripped }));
  `);

  assert.deepEqual(result.roundTripped, result.document);
  assert.deepEqual(result.roundTripped.project, result.document.project);
  assert.equal(Object.hasOwn(result.document, "assetCatalogVersion"), false);
});

test("봉투 없는 정상 v1과 creativeMemos 없는 이전 v1은 metadata로 마이그레이션한다", () => {
  const result = runDocumentModule(`
    const metadata = { savedAt: "2026-09-01T09:30:00.000Z", appVersion: "test-app/1.2.3" };
    const current = fixtures.createCurrentV1ProjectFixture();
    const legacy = fixtures.createLegacyProjectWithoutCreativeMemosFixture();
    const currentBefore = structuredClone(current);
    const legacyBefore = structuredClone(legacy);
    console.log(JSON.stringify({
      current,
      currentBefore,
      legacy,
      legacyBefore,
      currentResult: documentModule.parseStoryDocument(current, metadata),
      legacyResult: documentModule.parseStoryDocument(legacy, metadata),
    }));
  `);

  assert.deepEqual(result.current, result.currentBefore);
  assert.deepEqual(result.legacy, result.legacyBefore);
  assert.equal(result.currentResult.ok, true);
  assert.equal(result.currentResult.source, "legacy-v1");
  assert.deepEqual(result.currentResult.document.project, result.currentBefore);
  assert.equal(result.legacyResult.ok, true);
  assert.deepEqual(result.legacyResult.document.project.creativeMemos, []);
});

test("손상 fixture는 자동 수정하지 않고 위치가 있는 중복·참조·JSON 오류를 돌려준다", () => {
  const result = runDocumentModule(`
    const metadata = { savedAt: "2026-09-01T09:30:00.000Z", appVersion: "test-app/1.2.3" };
    console.log(JSON.stringify({
      duplicate: documentModule.parseStoryDocument(fixtures.createDuplicateLineIdProjectFixture(), metadata),
      brokenReference: documentModule.parseStoryDocument(fixtures.createMissingChapterReferenceProjectFixture(), metadata),
      malformedJson: documentModule.parseStoryDocumentJson(fixtures.MALFORMED_STORY_PROJECT_JSON, metadata),
    }));
  `);

  assert.deepEqual(result.duplicate, {
    ok: false,
    issues: [{
      code: "duplicate-id",
      path: "$.project.lines[1].id",
      message: "line ID 'line-001' is duplicated.",
    }, {
      code: "broken-reference",
      path: "$.project.continuation.lineId",
      message: "continuation references missing line 'line-002'.",
    }],
  });
  assert.deepEqual(result.brokenReference, {
    ok: false,
    issues: [{
      code: "broken-reference",
      path: "$.project.lines[1].chapterId",
      message: "line 'line-002' references missing chapter 'chapter-missing'.",
    }, {
      code: "broken-reference",
      path: "$.project.continuation",
      message: "continuation line must belong to its continuation chapter.",
    }],
  });
  assert.deepEqual(result.malformedJson, {
    ok: false,
    issues: [{ code: "invalid-json", path: "$", message: "Document JSON could not be parsed." }],
  });
});

test("현재 봉투는 선택 필드를 정규화하고 metadata 없는 v1은 열지 않는다", () => {
  const result = runDocumentModule(`
    const metadata = { savedAt: "2026-09-01T09:30:00.000Z", appVersion: "test-app/1.2.3" };
    const project = fixtures.createCurrentV1ProjectFixture();
    delete project.creativeMemos;
    delete project.planning.freeNotes;
    delete project.chapters[0].purpose;
    delete project.lines[0].directionNote;
    const envelope = documentModule.createStoryDocument({ ...metadata, project });
    console.log(JSON.stringify({
      current: documentModule.parseStoryDocument(envelope),
      missingMetadata: documentModule.parseStoryDocument(fixtures.createCurrentV1ProjectFixture()),
    }));
  `);

  assert.equal(result.current.ok, true);
  assert.equal(result.current.source, "current");
  assert.deepEqual(result.current.document.project.creativeMemos, []);
  assert.equal(result.current.document.project.planning.freeNotes, "");
  assert.equal(result.current.document.project.chapters[0].purpose, "");
  assert.equal(result.current.document.project.lines[0].directionNote, "");
  assert.deepEqual(result.missingMetadata, {
    ok: false,
    issues: [{
      code: "legacy-metadata-required",
      path: "$",
      message: "Legacy v1 projects need savedAt and appVersion migration metadata.",
    }],
  });
});
