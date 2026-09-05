import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import test from "node:test";

function runMemoCommands(script) {
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
          const commands = await import("./app/creative-memo-commands.ts");
          const fixtures = await import("./tests/fixtures/story-projects.mjs");
          ${script}
        `,
      ],
      { cwd: process.cwd(), encoding: "utf8" },
    ),
  );
}

test("창작 메모는 장과 컷을 안정 ID로 연결한다", () => {
  const result = runMemoCommands(`
    const project = fixtures.createCurrentV1ProjectFixture();
    const memo = project.creativeMemos[0];
    const chapterLinked = commands.setCreativeMemoChapterLink(memo, "chapter-001");
    const lineLinked = commands.setCreativeMemoLineLink({
      memo: chapterLinked, chapters: project.chapters, lines: project.lines, lineId: "line-002",
    });
    console.log(JSON.stringify({
      chapters: commands.creativeMemoChapterTargets(project.chapters),
      lines: commands.creativeMemoLineTargets({
        chapters: project.chapters, lines: project.lines, chapterId: "chapter-001",
      }),
      lineLinked,
      resolution: commands.resolveCreativeMemoLink({ memo: lineLinked, chapters: project.chapters, lines: project.lines }),
    }));
  `);

  assert.equal(result.chapters[0].id, "chapter-001");
  assert.equal(result.lines[1].id, "line-002");
  assert.equal(result.lineLinked.linkedChapterId, "chapter-001");
  assert.equal(result.lineLinked.linkedLineId, "line-002");
  assert.deepEqual(result.resolution, {
    status: "line",
    label: "1. 비가 내린 약속 · 컷 2",
    chapterId: "chapter-001",
    lineId: "line-002",
  });
});

test("끊어진 메모 연결은 안전한 안내로 표시한다", () => {
  const result = runMemoCommands(`
    const project = fixtures.createCurrentV1ProjectFixture();
    const memo = { ...project.creativeMemos[0], linkedChapterId: "chapter-deleted", linkedLineId: "line-deleted" };
    console.log(JSON.stringify(commands.resolveCreativeMemoLink({ memo, chapters: project.chapters, lines: project.lines })));
  `);

  assert.deepEqual(result, {
    status: "broken",
    label: "연결했던 장이나 컷을 찾을 수 없어요. 다시 골라 주세요.",
  });
});

test("메모를 닫을 때 원래 컷이 삭제되어도 가장 가까운 컷으로 돌아간다", () => {
  const result = runMemoCommands(`
    const project = fixtures.createCurrentV1ProjectFixture();
    const resolved = commands.resolveCreativeMemoReturnLocation({
      chapters: project.chapters,
      lines: project.lines.filter((line) => line.id !== "line-002"),
      location: { chapterId: "chapter-001", lineId: "line-002", view: "scene", focusTarget: "line-body" },
    });
    console.log(JSON.stringify(resolved));
  `);

  assert.equal(result.usedFallback, true);
  assert.deepEqual(result.location, {
    chapterId: "chapter-001",
    lineId: "line-001",
    view: "scene",
    focusTarget: "none",
  });
});
