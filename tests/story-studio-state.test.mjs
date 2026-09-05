import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import test from "node:test";

function runStoryStudioState(script) {
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
          const playerState = await import("./app/story-studio-player-state.ts");
          const selectors = await import("./app/story-studio-selectors.ts");
          const fixtures = await import("./tests/fixtures/story-projects.mjs");
          ${script}
        `,
      ],
      { cwd: process.cwd(), encoding: "utf8" },
    ),
  );
}

test("플레이 화면 상태는 열기·장면 변경·닫기를 React 밖에서 예측 가능하게 전환한다", () => {
  const result = runStoryStudioState(`
    const initial = playerState.INITIAL_STORY_STUDIO_PLAYER_STATE;
    const opened = playerState.storyStudioPlayerReducer(initial, { type: "open", index: -2 });
    const moved = playerState.storyStudioPlayerReducer(opened, { type: "change-index", index: 4 });
    const closed = playerState.storyStudioPlayerReducer(moved, { type: "close" });
    console.log(JSON.stringify({ initial, opened, moved, closed }));
  `);

  assert.deepEqual(result.initial, { view: "studio", playIndex: 0 });
  assert.deepEqual(result.opened, { view: "play", playIndex: 0 });
  assert.deepEqual(result.moved, { view: "play", playIndex: 4 });
  assert.deepEqual(result.closed, { view: "studio", playIndex: 4 });
});

test("편집 selector는 챕터·장면 안정 ID와 순서·안전한 첫 대상을 함께 계산한다", () => {
  const result = runStoryStudioState(`
    const project = fixtures.createCurrentV1ProjectFixture();
    project.chapters.push({ ...project.chapters[0], id: "chapter-002", order: 2, title: "두 번째" });
    project.lines.push({ ...project.lines[0], id: "line-003", chapterId: "chapter-002", order: 1 });
    const selected = selectors.selectStoryEditorSelection({
      project, selectedChapterId: "chapter-001", selectedLineId: "line-002",
    });
    const fallback = selectors.selectStoryEditorSelection({
      project, selectedChapterId: "chapter-deleted", selectedLineId: "line-deleted",
    });
    console.log(JSON.stringify({
      selected: {
        chapter: selected.selectedChapter?.id, line: selected.selectedLine?.id,
        chapterLines: selected.selectedChapterLines.map((line) => line.id),
        ordered: selected.orderedDraftLines.map((line) => line.id), storyIndex: selected.selectedStoryLineIndex,
      },
      fallback: { chapter: fallback.selectedChapter?.id, line: fallback.selectedLine?.id },
    }));
  `);

  assert.deepEqual(result.selected, {
    chapter: "chapter-001",
    line: "line-002",
    chapterLines: ["line-001", "line-002"],
    ordered: ["line-001", "line-002", "line-003"],
    storyIndex: 1,
  });
  assert.deepEqual(result.fallback, { chapter: "chapter-001", line: "line-001" });
});

test("다른 작품의 active 버전은 현재 draft에서 재생하지 않는다", () => {
  const result = runStoryStudioState(`
    const draft = fixtures.createCurrentV1ProjectFixture();
    const staleActive = {
      ...draft,
      id: "story-from-another-project",
      title: "이전 작품",
    };
    const mismatched = selectors.resolveActiveProjectForDraft({
      draft,
      active: staleActive,
    });
    const matched = selectors.resolveActiveProjectForDraft({
      draft,
      active: { ...draft },
    });
    const noCutIndex = selectors.findFirstStoryLineIndexForChapter({
      lines: draft.lines,
      chapterId: "chapter-empty",
    });
    console.log(JSON.stringify({
      mismatched: {
        usedFallback: mismatched.usedFallback,
        id: mismatched.project.id,
        title: mismatched.project.title,
        chapters: mismatched.project.chapters.length,
        lines: mismatched.project.lines.length,
      },
      matched: { usedFallback: matched.usedFallback, lines: matched.project.lines.length },
      noCutIndex,
      originalDraftLines: draft.lines.length,
    }));
  `);

  assert.deepEqual(result.mismatched, {
    usedFallback: true,
    id: "fixture-story-001",
    title: "고정된 이야기",
    chapters: 0,
    lines: 0,
  });
  assert.deepEqual(result.matched, { usedFallback: false, lines: 2 });
  assert.equal(result.noCutIndex, -1);
  assert.equal(result.originalDraftLines, 2);
});

test("플레이 유효 위치는 빈 이야기·빈 장과 모든 비정상 인덱스에서 본문·카운터·탐색을 일치시킨다", () => {
  const result = runStoryStudioState(`
    const project = fixtures.createCurrentV1ProjectFixture();
    project.chapters.unshift({...project.chapters[0],id:'empty',order:0});
    const before = JSON.stringify(project);
    const summarize = (p, index) => {
      const s = selectors.selectStoryPlayerPosition(p, index);
      return {index:s.index,number:s.number,total:s.total,line:s.line?.id ?? null,
        previous:s.canPrevious,next:s.canNext,chapters:s.playableChapters.map(c=>c.id)};
    };
    console.log(JSON.stringify({
      cases:[-2,999,0.9,1.9,NaN,Infinity,-Infinity].map(i=>summarize(project,i)),
      empty:summarize({...project,chapters:[],lines:[]},9),
      emptyChapter:summarize({...project,lines:[]},-1), unchanged:before===JSON.stringify(project),
      reduced:playerState.storyStudioPlayerReducer(playerState.INITIAL_STORY_STUDIO_PLAYER_STATE,{type:'open',index:1.9}).playIndex,
    }));
  `);
  for (const [i, index] of [0, 1, 0, 1, 0, 0, 0].entries()) {
    assert.deepEqual(result.cases[i], {index, number:index+1,total:2,line:`line-00${index+1}`,
      previous:index>0,next:index<1,chapters:["chapter-001"]});
  }
  for (const key of ["empty", "emptyChapter"]) assert.deepEqual(result[key], {
    index:-1,number:0,total:0,line:null,previous:false,next:false,chapters:[],
  });
  assert.equal(result.unchanged, true);
  assert.equal(result.reduced, 1);
});

test("예시 컨텍스트는 독립 스냅숏이며 닫을 때 제거된다", () => {
  const result = runStoryStudioState(`
    const example = fixtures.createCurrentV1ProjectFixture();
    const context = playerState.createStoryPlaybackContext('example', example);
    const opened = playerState.storyStudioPlayerReducer(playerState.INITIAL_STORY_STUDIO_PLAYER_STATE,
      {type:'open',index:0,context});
    example.lines[0].text='이후 변경';
    const moved = playerState.storyStudioPlayerReducer(opened,{type:'change-index',index:1});
    const closed = playerState.storyStudioPlayerReducer(moved,{type:'close'});
    console.log(JSON.stringify({kind:moved.context.kind,independent:moved.context.project.lines[0].text!=='이후 변경',closed}));
  `);
  assert.equal(result.kind, "example");
  assert.equal(result.independent, true);
  assert.deepEqual(result.closed, {view:"studio",playIndex:1});
});

test("플레이 단축키는 입력·버튼 자식·선택기·contenteditable 및 이미 처리된 키를 보존한다", () => {
  const result = runStoryStudioState(`
    class Target { constructor(interactive){this.interactive=interactive;} closest(selector){
      if(selector!==playerState.STORY_PLAYER_INTERACTIVE_SELECTOR) throw Error('selector mismatch');
      return this.interactive ? this : null;
    }}
    globalThis.Element=Target;
    const check=(target,extra={})=>playerState.shouldHandleStoryPlayerKey({target,defaultPrevented:false,isComposing:false,altKey:false,ctrlKey:false,metaKey:false,...extra});
    console.log(JSON.stringify({ignored:['input','textarea','select','button span','contenteditable span','a','role=button'].map(()=>check(new Target(true))),
      stage:check(new Target(false)),prevented:check(new Target(false),{defaultPrevented:true}),
      composing:check(new Target(false),{isComposing:true}),modified:check(new Target(false),{ctrlKey:true}),
      selector:playerState.STORY_PLAYER_INTERACTIVE_SELECTOR}));
  `);
  assert.ok(result.ignored.every(value => !value));
  assert.equal(result.stage, true);
  for (const key of ["prevented", "composing", "modified"]) assert.equal(result[key], false);
  for (const selector of ["input", "textarea", "select", "button", "[contenteditable]", "a[href]"]) assert.ok(result.selector.includes(selector));
});
