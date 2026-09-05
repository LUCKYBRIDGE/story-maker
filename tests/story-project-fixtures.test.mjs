import assert from "node:assert/strict";
import test from "node:test";
import {
  FIXTURE_IDS,
  MALFORMED_STORY_PROJECT_JSON,
  createCurrentV1ProjectFixture,
  createDuplicateLineIdProjectFixture,
  createLegacyProjectWithoutCreativeMemosFixture,
  createMissingChapterReferenceProjectFixture,
} from "./fixtures/story-projects.mjs";

const PROJECT_KEYS = [
  "chapters",
  "continuation",
  "creativeMemos",
  "description",
  "id",
  "lines",
  "planning",
  "sheetEditable",
  "sheetUrl",
  "speakerNames",
  "title",
  "updatedAt",
];

const PLANNING_KEYS = [
  "centralProblem",
  "characterNotes",
  "climax",
  "crisis",
  "ending",
  "endingChange",
  "freeNotes",
  "mainCharacter",
  "mainGoal",
  "material",
  "middle",
  "mood",
  "openQuestions",
  "opening",
  "premise",
  "stakes",
  "structureMode",
  "theme",
  "worldNotes",
];

const CHAPTER_KEYS = [
  "backgroundAssetIds",
  "backgroundId",
  "chapterSpeakerNames",
  "characterAssetIds",
  "id",
  "keyEvents",
  "leftAssetId",
  "mood",
  "nextChapterIdea",
  "order",
  "purpose",
  "rightAssetId",
  "storyStageKeys",
  "summary",
  "title",
];

const LINE_KEYS = [
  "backgroundId",
  "chapterId",
  "directionNote",
  "emotionNote",
  "id",
  "leftAssetId",
  "order",
  "purposeNote",
  "rightAssetId",
  "speaker",
  "speakerName",
  "text",
  "type",
];

test("정상 v1 fixture는 현재 작품의 모든 필수 필드와 고정 ID를 가진다", () => {
  const project = createCurrentV1ProjectFixture();

  assert.deepEqual(Object.keys(project).sort(), PROJECT_KEYS);
  assert.deepEqual(Object.keys(project.planning).sort(), PLANNING_KEYS);
  assert.deepEqual(Object.keys(project.chapters[0]).sort(), CHAPTER_KEYS);
  assert.deepEqual(Object.keys(project.lines[0]).sort(), LINE_KEYS);
  assert.equal(project.id, FIXTURE_IDS.project);
  assert.equal(project.chapters[0].id, FIXTURE_IDS.chapter);
  assert.equal(project.lines[0].id, FIXTURE_IDS.firstLine);
  assert.equal(project.lines[1].id, FIXTURE_IDS.secondLine);
  assert.equal(project.creativeMemos[0].id, FIXTURE_IDS.memo);
  assert.equal(project.continuation.chapterId, FIXTURE_IDS.chapter);
  assert.equal(project.continuation.lineId, FIXTURE_IDS.secondLine);
  assert.equal(project.lines[0].text, " 첫 문장입니다.\n둘째 문장입니다. ");
});

test("fixture factory는 시간이나 무작위 값 없이 매번 깊은 복사본을 만든다", () => {
  const first = createCurrentV1ProjectFixture();
  const second = createCurrentV1ProjectFixture();

  assert.deepEqual(first, second);
  assert.notStrictEqual(first, second);
  assert.notStrictEqual(first.planning, second.planning);
  assert.notStrictEqual(first.chapters[0], second.chapters[0]);
  assert.notStrictEqual(first.lines[0], second.lines[0]);
  assert.notStrictEqual(first.creativeMemos[0], second.creativeMemos[0]);

  first.planning.theme = "변경한 주제";
  first.lines[0].text = "변경한 문장";
  first.creativeMemos[0].fields[0].value = "변경한 메모";
  assert.equal(second.planning.theme, "약속은 말보다 행동으로 지킨다.");
  assert.equal(second.lines[0].text, " 첫 문장입니다.\n둘째 문장입니다. ");
  assert.equal(
    second.creativeMemos[0].fields[0].value,
    "큰비로 나무다리 한쪽이 끊어진다.",
  );
});

test("이전 fixture는 creativeMemos가 없는 한 가지 호환성 차이만 가진다", () => {
  const expected = createCurrentV1ProjectFixture();
  delete expected.creativeMemos;

  assert.deepEqual(createLegacyProjectWithoutCreativeMemosFixture(), expected);
});

test("중복 ID fixture는 line ID 중복 한 가지만 가진다", () => {
  const expected = createCurrentV1ProjectFixture();
  expected.lines[1].id = expected.lines[0].id;
  const project = createDuplicateLineIdProjectFixture();

  assert.deepEqual(project, expected);
  assert.equal(project.lines[0].id, project.lines[1].id);
  assert.equal(new Set(project.lines.map((line) => line.id)).size, 1);
});

test("끊어진 참조 fixture는 존재하지 않는 chapter를 가리키는 line 한 개만 가진다", () => {
  const expected = createCurrentV1ProjectFixture();
  expected.lines[1].chapterId = FIXTURE_IDS.missingChapter;
  const project = createMissingChapterReferenceProjectFixture();

  assert.deepEqual(project, expected);
  const chapterIds = new Set(project.chapters.map((chapter) => chapter.id));
  assert.equal(chapterIds.has(project.lines[0].chapterId), true);
  assert.equal(chapterIds.has(project.lines[1].chapterId), false);
});

test("파싱 불가 fixture는 항상 JSON.parse에서 실패한다", () => {
  assert.throws(() => JSON.parse(MALFORMED_STORY_PROJECT_JSON), SyntaxError);
});
