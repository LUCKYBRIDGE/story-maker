import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import test from "node:test";

function runLocation(script) {
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
          const location = await import("./app/story-editor-location.ts");
          const fixtures = await import("./tests/fixtures/story-projects.mjs");
          ${script}
        `,
      ],
      { cwd: process.cwd(), encoding: "utf8" },
    ),
  );
}

test("UI 위치는 작품별로 복원하고 다른 작품의 같은 ID를 사용하지 않는다", () => {
  const result = runLocation(`
    const ui = await import('./app/story-studio-ui-session.ts');
    const project = fixtures.createCurrentV1ProjectFixture();
    const before = JSON.stringify(project);
    const session = { version: 1, projectId: project.id, workspaceMode: 'plan', planningView: 'chapters',
      location: {chapterId:'chapter-001',lineId:'line-002',view:'scene',focusTarget:'none'} };
    const same = ui.resolveStudioUiSession(project, session);
    const other = ui.resolveStudioUiSession({...project,id:'another'}, session);
    const deleted = ui.resolveStudioUiSession({...project,lines:project.lines.filter(l=>l.id!=='line-002')},session);
    const empty = ui.resolveStudioUiSession({...project,chapters:[],lines:[]},session);
    console.log(JSON.stringify({same,other,deleted,empty,unchanged:before===JSON.stringify(project)}));
  `);
  assert.equal(result.same.location.lineId, "line-002");
  assert.equal(result.same.workspaceMode, "plan");
  assert.equal(result.same.planningView, "chapters");
  assert.equal(result.other.location.lineId, "line-001");
  assert.equal(result.other.workspaceMode, "create");
  assert.equal(result.deleted.location.lineId, "line-001");
  assert.equal(result.empty.location.lineId, "");
  assert.equal(result.empty.location.view, "chapter");
  assert.equal(result.unchanged, true);
});

test("손상·미래 버전·저장 접근 거부는 UI 위치만 포기하고 예외를 전파하지 않는다", () => {
  const result = runLocation(`
    const ui = await import('./app/story-studio-ui-session.ts');
    const project = fixtures.createCurrentV1ProjectFixture();
    const session = ui.resolveStudioUiSession(project, null);
    let value = '';
    const storage = {getItem:()=>value,setItem:(key,v)=>{value=v}};
    const saved = ui.saveStudioUiSession(()=>storage,session);
    const loaded = ui.loadStudioUiSession(()=>storage);
    value = '{'; const broken = ui.loadStudioUiSession(()=>storage);
    value = JSON.stringify({...session,version:999}); const future = ui.loadStudioUiSession(()=>storage);
    value = JSON.stringify({...session,workspaceMode:'play'}); const badEnum = ui.loadStudioUiSession(()=>storage);
    const denied = ()=>{throw Error('SecurityError')};
    console.log(JSON.stringify({saved,loaded,broken,future,badEnum,
      deniedRead:ui.loadStudioUiSession(denied),deniedWrite:ui.saveStudioUiSession(denied,session),
      writeFailure:ui.saveStudioUiSession(()=>({getItem:()=>null,setItem:()=>{throw Error('quota')}}),session)}));
  `);
  assert.equal(result.saved, true);
  assert.equal(result.loaded.version, 1);
  for (const key of ["broken", "future", "badEnum", "deniedRead"]) assert.equal(result[key], null);
  assert.equal(result.deniedWrite, false);
  assert.equal(result.writeFailure, false);
  assert.equal("scrollY" in result.loaded, false);
});

test("20개 장면에서도 같은 안정 ID로 대본과 장면 꾸미기를 왕복한다", () => {
  const result = runLocation(`
    const project = fixtures.createCurrentV1ProjectFixture();
    const lines = Array.from({ length: 20 }, (_, index) => ({
      ...project.lines[0], id: \`line-\${index + 1}\`, order: index + 1,
    }));
    const current = {
      chapterId: "chapter-001", lineId: "line-20", view: "chapter", focusTarget: "none",
    };
    const scene = location.transitionStoryEditorView({ location: current, view: "scene" });
    const restored = location.resolveStoryEditorLocation({
      chapters: project.chapters, lines, location: scene,
    });
    const chapter = location.transitionStoryEditorView({
      location: restored.location, view: "chapter",
    });
    console.log(JSON.stringify({ scene, restored, chapter }));
  `);

  assert.deepEqual(result.scene, {
    chapterId: "chapter-001",
    lineId: "line-20",
    view: "scene",
    focusTarget: "line-body",
  });
  assert.equal(result.restored.usedFallback, false);
  assert.deepEqual(result.chapter, {
    chapterId: "chapter-001",
    lineId: "line-20",
    view: "chapter",
    focusTarget: "line-body",
  });
});

test("삭제된 장면이나 챕터는 안전한 첫 대상과 초점 없음으로 바꾼다", () => {
  const result = runLocation(`
    const project = fixtures.createCurrentV1ProjectFixture();
    const deletedLine = location.resolveStoryEditorLocation({
      chapters: project.chapters,
      lines: project.lines.filter((line) => line.id !== "line-002"),
      location: {
        chapterId: "chapter-001", lineId: "line-002", view: "scene", focusTarget: "line-body",
      },
    });
    const deletedChapter = location.resolveStoryEditorLocation({
      chapters: [{ ...project.chapters[0], id: "chapter-002", order: 2 }],
      lines: [],
      location: {
        chapterId: "chapter-001", lineId: "line-001", view: "scene", focusTarget: "line-body",
      },
    });
    console.log(JSON.stringify({ deletedLine, deletedChapter }));
  `);

  assert.deepEqual(result.deletedLine, {
    location: {
      chapterId: "chapter-001",
      lineId: "line-001",
      view: "scene",
      focusTarget: "none",
    },
    usedFallback: true,
  });
  assert.deepEqual(result.deletedChapter, {
    location: {
      chapterId: "chapter-002",
      lineId: "",
      view: "chapter",
      focusTarget: "none",
    },
    usedFallback: true,
  });
});

test("새 장면은 본문 초점과 장면 꾸미기 위치를 요청한다", () => {
  const result = runLocation(`
    const next = location.newStoryEditorLineLocation({
      chapterId: "chapter-new", lineId: "line-new",
    });
    console.log(JSON.stringify({ next, same: location.sameStoryEditorLocation(next, { ...next }) }));
  `);

  assert.deepEqual(result.next, {
    chapterId: "chapter-new",
    lineId: "line-new",
    view: "scene",
    focusTarget: "line-body",
  });
  assert.equal(result.same, true);
});

test("대본과 컷 꾸미기 사이의 본문 선택 범위는 현재 글 길이 안에서 보존된다", () => {
  const result = runLocation(`
    console.log(JSON.stringify({
      kept: location.clampStoryEditorTextSelection({ start: 4, end: 9 }, 20),
      shortened: location.clampStoryEditorTextSelection({ start: 8, end: 30 }, 12),
      negative: location.clampStoryEditorTextSelection({ start: -3, end: 2 }, 12),
      reversed: location.clampStoryEditorTextSelection({ start: 8, end: 2 }, 12),
      missing: location.clampStoryEditorTextSelection(undefined, 12) ?? null,
    }));
  `);

  assert.deepEqual(result.kept, { start: 4, end: 9 });
  assert.deepEqual(result.shortened, { start: 8, end: 12 });
  assert.deepEqual(result.negative, { start: 0, end: 2 });
  assert.deepEqual(result.reversed, { start: 8, end: 8 });
  assert.equal(result.missing, null);
});

test("플레이 컷 수정은 작품과 컷 안정 ID가 일치할 때만 열며 삭제·다른 작품을 대체하지 않는다", () => {
  const result = runLocation(`
    const project = fixtures.createCurrentV1ProjectFixture();
    const cut = {projectId:project.id,lineId:'line-002'};
    const resolve = (draft, target=cut) => location.resolvePlayedCutLocation(draft,target);
    const moved = {...project,lines:project.lines.map(l=>({...l,order:3-l.order}))};
    console.log(JSON.stringify({same:resolve(project),moved:resolve(moved),
      deleted:resolve({...project,lines:project.lines.filter(l=>l.id!==cut.lineId)}),
      other:resolve({...project,id:'other'}), empty:resolve({...project,chapters:[],lines:[]}),
      orphan:resolve({...project,chapters:[]})}));
  `);
  assert.deepEqual(result.same, {chapterId:"chapter-001",lineId:"line-002",view:"scene",focusTarget:"line-body"});
  assert.deepEqual(result.moved, result.same);
  for (const key of ["deleted", "other", "empty", "orphan"]) assert.equal(result[key], null);
});
