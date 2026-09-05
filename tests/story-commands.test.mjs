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

const lineTemplate = `{
  type: "dialogue",
  speaker: "left",
  speakerName: "다온",
  text: "",
  leftAssetId: "",
  rightAssetId: "",
  backgroundId: "",
  purposeNote: "",
  emotionNote: "",
  directionNote: "",
}`;

test("장 이동은 순서만 바꾸고 단계·컷·메모 참조를 보존한다", () => {
  const result = runCommands(`
    const project = fixtures.createCurrentV1ProjectFixture();
    project.chapters = [1,2,3].map(n => ({...project.chapters[0], id:'ch-'+n, order:n*10, storyStageKeys:['crisis','climax']}));
    project.lines = project.lines.map(line => ({...line, chapterId:'ch-2'}));
    project.creativeMemos = project.creativeMemos.map(memo => ({...memo, linkedChapterId:'ch-2'}));
    const before = structuredClone(project);
    const moved = commands.moveStoryChapter({chapters:project.chapters,chapterId:'ch-2',direction:-1});
    const next = {...project,chapters:moved.chapters};
    console.log(JSON.stringify({before,project,next,moved,linesSame:next.lines===project.lines,memosSame:next.creativeMemos===project.creativeMemos}));
  `);
  assert.equal(result.moved.ok, true);
  assert.deepEqual(result.project, result.before);
  assert.deepEqual(result.next.chapters.map(c => [c.id,c.order]), [['ch-2',1],['ch-1',2],['ch-3',3]]);
  for (const chapter of result.next.chapters) {
    const original=result.before.chapters.find(c=>c.id===chapter.id);
    assert.deepEqual(chapter, {...original,order:chapter.order});
  }
  assert.equal(result.linesSame, true);
  assert.equal(result.memosSame, true);
});

test("빈 장 목록·없는 대상·첫 장 위로·마지막 장 아래로 이동은 안전하게 거부한다", () => {
  const result = runCommands(`
    const first = fixtures.createCurrentV1ProjectFixture().chapters[0];
    const cases = [
      {chapters:[],chapterId:'missing',direction:1},
      {chapters:[first],chapterId:'missing',direction:1},
      {chapters:[first],chapterId:first.id,direction:-1},
      {chapters:[first],chapterId:first.id,direction:1},
      {chapters:[first,{...first,id:'last',order:2}],chapterId:'last',direction:1},
    ];
    console.log(JSON.stringify(cases.map(input => commands.moveStoryChapter(input))));
  `);
  assert.deepEqual(result.map(r=>r.ok), [false,false,false,false,false]);
  assert.deepEqual(result.map(r=>r.code), ['chapter-not-found','chapter-not-found','cannot-move','cannot-move','cannot-move']);
});

test("0개 장면에서도 새 장면을 불변으로 만들고 선택한다", () => {
  const result = runCommands(`
    const project = fixtures.createCurrentV1ProjectFixture();
    const originalLines = structuredClone(project.lines);
    const created = commands.createStoryLine({
      lines: [], chapterId: "chapter-empty", line: ${lineTemplate}, createId: () => "line-new",
    });
    console.log(JSON.stringify({ created, originalLines, project }));
  `);

  assert.equal(result.created.ok, true);
  assert.equal(result.created.selectedLineId, "line-new");
  assert.deepEqual(result.created.lines.map((line) => [line.id, line.order]), [
    ["line-new", 1],
  ]);
  assert.deepEqual(result.project.lines, result.originalLines);
});

test("삽입과 복제는 순서를 연속으로 만들고 주입된 새 ID를 선택한다", () => {
  const result = runCommands(`
    const project = fixtures.createCurrentV1ProjectFixture();
    const inserted = commands.createStoryLine({
      lines: project.lines, chapterId: "chapter-001", line: ${lineTemplate},
      createId: () => "line-inserted", insertAfterLineId: "line-001",
    });
    const copied = commands.duplicateStoryLine({
      lines: inserted.lines, lineId: "line-inserted", createId: () => "line-copy",
    });
    console.log(JSON.stringify({ inserted, copied, original: project.lines }));
  `);

  assert.equal(result.inserted.ok, true);
  assert.deepEqual(result.inserted.lines.map((line) => [line.id, line.order]), [
    ["line-001", 1],
    ["line-inserted", 2],
    ["line-002", 3],
  ]);
  assert.equal(result.copied.ok, true);
  assert.equal(result.copied.selectedLineId, "line-copy");
  assert.deepEqual(result.copied.lines.map((line) => [line.id, line.order]), [
    ["line-001", 1],
    ["line-inserted", 2],
    ["line-copy", 3],
    ["line-002", 4],
  ]);
  assert.deepEqual(result.original.map((line) => line.id), ["line-001", "line-002"]);
});

test("처음·마지막 이동은 실패하고 중간 이동만 선택과 순서를 바꾼다", () => {
  const result = runCommands(`
    const project = fixtures.createCurrentV1ProjectFixture();
    const withThree = commands.createStoryLine({
      lines: project.lines, chapterId: "chapter-001", line: ${lineTemplate}, createId: () => "line-003",
    }).lines;
    console.log(JSON.stringify({
      first: commands.moveStoryLine({ lines: withThree, lineId: "line-001", direction: -1 }),
      last: commands.moveStoryLine({ lines: withThree, lineId: "line-003", direction: 1 }),
      middle: commands.moveStoryLine({ lines: withThree, lineId: "line-002", direction: -1 }),
    }));
  `);

  assert.deepEqual(result.first, { ok: false, code: "cannot-move" });
  assert.deepEqual(result.last, { ok: false, code: "cannot-move" });
  assert.equal(result.middle.ok, true);
  assert.equal(result.middle.selectedLineId, "line-002");
  assert.deepEqual(result.middle.lines.map((line) => [line.id, line.order]), [
    ["line-002", 1],
    ["line-001", 2],
    ["line-003", 3],
  ]);
});

test("1개와 20개 장면 삭제는 안전한 선택 대상과 연속 order를 돌려준다", () => {
  const result = runCommands(`
    const project = fixtures.createCurrentV1ProjectFixture();
    const one = commands.deleteStoryLine({ lines: [project.lines[0]], lineId: "line-001" });
    const many = Array.from({ length: 20 }, (_, index) => ({
      ...project.lines[0], id: \`line-\${index + 1}\`, order: index + 1,
    }));
    const middle = commands.deleteStoryLine({ lines: many, lineId: "line-10" });
    const last = commands.deleteStoryLine({ lines: many, lineId: "line-20" });
    const duplicateId = commands.duplicateStoryLine({
      lines: many, lineId: "line-1", createId: () => "line-2",
    });
    console.log(JSON.stringify({ one, middle, last, duplicateId }));
  `);

  assert.deepEqual(result.one, { ok: true, lines: [] });
  assert.equal(result.middle.ok, true);
  assert.equal(result.middle.selectedLineId, "line-11");
  assert.deepEqual(result.middle.lines.map((line) => line.order), Array.from({ length: 19 }, (_, index) => index + 1));
  assert.equal(result.last.ok, true);
  assert.equal(result.last.selectedLineId, "line-19");
  assert.deepEqual(result.duplicateId, { ok: false, code: "duplicate-id" });
});
