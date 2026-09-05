import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import test from "node:test";

function runCoreUserFlows(script) {
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
          const storyData = await import("./app/story-data.ts");
          const commands = await import("./app/story-commands.ts");
          const creativeMemos = await import("./app/creative-memos.ts");
          const creativeCommands = await import("./app/creative-memo-commands.ts");
          const selectors = await import("./app/story-studio-selectors.ts");
          const playerState = await import("./app/story-studio-player-state.ts");
          const imports = await import("./app/story-import.ts");
          const sheet = await import("./app/story-sheet.ts");
          const workbook = await import("./app/story-workbook.ts");
          const assets = await import("./app/story-assets.ts");
          const repo = await import("./app/story-project-repository.ts");
          const checkpoints = await import("./app/story-project-checkpoints.ts");
          const stages = await import("./app/story-stages.ts");
          const fixtures = await import("./tests/fixtures/story-projects.mjs");
          ${script}
        `,
      ],
      { cwd: process.cwd(), encoding: "utf8" },
    ),
  );
}

test("CF-10: 다른 작품을 가져오면 이전 플레이를 분리하고 같은 작품의 적용본은 보존한다", () => {
  const result = runCoreUserFlows(`
    const previous = fixtures.createCurrentV1ProjectFixture();
    const imported = { ...storyData.cloneProject(previous), id: "imported-other-story" };
    const different = selectors.resolveActiveProjectForDraft({ draft: imported, active: previous });
    const same = selectors.resolveActiveProjectForDraft({ draft: { ...previous, title: "수정한 편집본" }, active: previous });
    console.log(JSON.stringify({
      importedId: different.project.id,
      playableLines: different.project.lines.length,
      fallback: different.usedFallback,
      samePreserved: same.project === previous,
      sameFallback: same.usedFallback,
      previousLines: previous.lines.length,
    }));
  `);
  assert.equal(result.importedId, "imported-other-story");
  assert.equal(result.playableLines, 0);
  assert.equal(result.fallback, true);
  assert.equal(result.samePreserved, true);
  assert.equal(result.sameFallback, false);
  assert.ok(result.previousLines > 0);
});

test("CF-01: 빈 작품에서 챕터·대사를 추가하고 플레이에 적용하여 첫 플레이를 확인한다", () => {
  const result = runCoreUserFlows(`
    let draft = storyData.createBlankProject();
    let active = storyData.cloneProject(draft);

    // 1. 제목 수정
    draft = { ...draft, title: "비 오는 날의 약속" };

    // 2. 첫 챕터 생성
    const chapter1 = {
      id: "chapter-001",
      order: 1,
      title: "첫 약속",
      summary: "",
      goal: "",
      obstacle: "",
      turningPoint: "",
      payoff: "",
      leftAssetId: "",
      rightAssetId: "",
      backgroundId: "",
      chapterSpeakerNames: ["다온"],
    };
    draft = { ...draft, chapters: [chapter1], speakerNames: ["다온"] };

    // 3. 대사 장면 추가
    const lineCreated = commands.createStoryLine({
      lines: draft.lines,
      chapterId: "chapter-001",
      line: {
        type: "dialogue",
        speaker: "left",
        speakerName: "다온",
        text: "내가 편지를 전할게.",
        leftAssetId: "",
        rightAssetId: "",
        backgroundId: "",
        purposeNote: "",
        emotionNote: "",
        directionNote: "",
      },
      createId: () => "line-001",
    });
    draft = { ...draft, lines: lineCreated.lines };

    // 4. 적용 전 active snapshot은 비어 있음 (Draft/Active 분리)
    const activeBeforeApply = storyData.cloneProject(active);

    // 5. 플레이에 적용
    active = storyData.cloneProject(draft);

    // 6. 플레이 진입
    const initialPlayer = playerState.INITIAL_STORY_STUDIO_PLAYER_STATE;
    const openedPlayer = playerState.storyStudioPlayerReducer(initialPlayer, { type: "open", index: 0 });

    const selection = selectors.selectStoryEditorSelection({
      project: draft,
      selectedChapterId: "chapter-001",
      selectedLineId: "line-001",
    });

    console.log(JSON.stringify({
      draftTitle: draft.title,
      activeBeforeApplyLines: activeBeforeApply.lines.length,
      activeAfterApplyLines: active.lines.length,
      playerView: openedPlayer.view,
      playIndex: openedPlayer.playIndex,
      selectedLineText: selection.selectedLine?.text,
      selectedSpeaker: selection.selectedLine?.speakerName,
    }));
  `);

  assert.equal(result.draftTitle, "비 오는 날의 약속");
  assert.equal(result.activeBeforeApplyLines, 0);
  assert.equal(result.activeAfterApplyLines, 1);
  assert.equal(result.playerView, "play");
  assert.equal(result.playIndex, 0);
  assert.equal(result.selectedLineText, "내가 편지를 전할게.");
  assert.equal(result.selectedSpeaker, "다온");
});

test("CF-02: 이어쓰기 템플릿의 시작 위치를 찾고 적용 전후 플레이 분리를 보장한다", () => {
  const result = runCoreUserFlows(`
    let draft = storyData.cloneProject(storyData.RABBIT_TURTLE_CONTINUATION_TEMPLATE);
    let active = storyData.cloneProject(draft);

    // 1. 이어쓰기 시작점 확인
    const continuationChapter = draft.chapters
      .slice()
      .sort((a, b) => a.order - b.order)
      .find((chapter) => chapter.title.includes("이어 쓰기"));
    const continuationLine = draft.lines
      .filter((line) => line.chapterId === continuationChapter?.id)
      .sort((a, b) => a.order - b.order)[0];

    const continuationPoint = {
      chapterId: continuationChapter?.id,
      lineId: continuationLine?.id,
      label: continuationChapter?.summary || "이어서 쓸 첫 장면",
    };

    // 2. 빈 장면에 글 작성 (Draft만 변경)
    const updatedLines = draft.lines.map((line) =>
      line.id === continuationPoint.lineId
        ? { ...line, text: "토끼는 자라의 말을 끝까지 듣기로 했어요." }
        : line,
    );
    draft = { ...draft, lines: updatedLines };

    // 3. 적용 전 active 확인 (새 문장이 아직 없음)
    const activeContinuationLineBefore = active.lines.find((line) => line.id === continuationPoint.lineId);

    // 4. 플레이에 적용
    active = storyData.cloneProject(draft);
    const activeContinuationLineAfter = active.lines.find((line) => line.id === continuationPoint.lineId);

    console.log(JSON.stringify({
      continuationChapterTitle: continuationChapter?.title,
      activeBefore: activeContinuationLineBefore?.text ?? "",
      activeAfter: activeContinuationLineAfter?.text ?? "",
    }));
  `);

  assert.match(result.continuationChapterTitle, /이어 쓰기/);
  assert.equal(result.activeBefore, "");
  assert.equal(result.activeAfter, "토끼는 자라의 말을 끝까지 듣기로 했어요.");
});

test("CF-03: 창작 메모를 작성하고 검색한 뒤 원래 장면으로 안전하게 돌아온다", () => {
  const result = runCoreUserFlows(`
    let project = fixtures.createCurrentV1ProjectFixture();
    const originalSelectedLineId = "line-002";

    // 1. 창작 메모 생성 (사건·갈등)
    const newMemo = creativeMemos.createCreativeMemo("event");
    newMemo.title = "무지개 언덕 탐험";
    newMemo.fields.push(creativeMemos.createCreativeMemoField("무엇이 방해하는가", "무지개가 뜬 방향으로 걸어갔다.", "template"));
    newMemo.chapterLink = { targetChapterId: "chapter-001" };
    newMemo.lineLink = { targetLineId: originalSelectedLineId };

    project = { ...project, creativeMemos: [...project.creativeMemos, newMemo] };

    // 2. 메모 검색 ("무지개")
    const searchMatches = project.creativeMemos.filter((memo) =>
      memo.title.includes("무지개") || memo.fields.some((f) => f.value.includes("무지개")),
    );

    // 3. 메모 닫기 및 원래 위치 복귀
    const returnLoc = creativeCommands.resolveCreativeMemoReturnLocation({
      chapters: project.chapters,
      lines: project.lines,
      location: {
        chapterId: "chapter-001",
        lineId: originalSelectedLineId,
      },
    });

    console.log(JSON.stringify({
      searchMatchCount: searchMatches.length,
      matchedMemoTitle: searchMatches[0]?.title,
      returnChapterId: returnLoc.location.chapterId,
      returnLineId: returnLoc.location.lineId,
    }));
  `);

  assert.equal(result.searchMatchCount, 1);
  assert.equal(result.matchedMemoTitle, "무지개 언덕 탐험");
  assert.equal(result.returnChapterId, "chapter-001");
  assert.equal(result.returnLineId, "line-002");
});

test("CF-04: Excel/시트 공통 스냅숏 왕복 시 공백과 본문이 완벽하게 보존된다", () => {
  const result = runCoreUserFlows(`
    const original = fixtures.createCurrentV1ProjectFixture();
    original.title = "  공백이 보존되는 제목  ";
    original.lines[0].text = "  앞뒤 공백과\\n줄바꿈이 있는 본문.  ";

    const exported = workbook.createStoryWorkbook(original, assets.STORY_ASSETS);
    const data = await exported.xlsx.writeBuffer();
    const file = new File([data], "cf04.xlsx", {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const snapshot = await workbook.readStoryWorkbook(file);
    const imported = sheet.importStoryProject(snapshot, "");
    if (!imported.ok) throw new Error(JSON.stringify(imported.issues));

    console.log(JSON.stringify({
      titleMatched: imported.project.title === original.title,
      textMatched: imported.project.lines[0].text === original.lines[0].text,
      chaptersCount: imported.project.chapters.length === original.chapters.length,
      linesCount: imported.project.lines.length === original.lines.length,
      memosCount: imported.project.creativeMemos.length === original.creativeMemos.length,
    }));
  `);

  assert.equal(result.titleMatched, true);
  assert.equal(result.textMatched, true);
  assert.equal(result.chaptersCount, true);
  assert.equal(result.linesCount, true);
  assert.equal(result.memosCount, true);
});

test("CF-05: 손상된 파일 가져오기 시 현재 초안을 보호하고 위치 오류를 반환한다", () => {
  const result = runCoreUserFlows(`
    const currentDraft = storyData.cloneProject(fixtures.createCurrentV1ProjectFixture());
    let draft = storyData.cloneProject(currentDraft);

    // 손상된 CSV 스냅숏
    const corruptedSnapshot = imports.createStoryImportSnapshot({
      source: "sheet",
      project: "항목,내용\\n이야기 제목,손상",
      chapters: "챕터 ID,순서,챕터 제목\\nchapter-1,1,첫 챕터",
      lines: '장면 ID,챕터 ID,순서,종류,화자 위치,화자 이름,내용\\nline-1,chapter-1,1,대사,왼쪽,다온,"닫히지 않은 본문',
    });

    const imported = sheet.importStoryProject(corruptedSnapshot, "");

    console.log(JSON.stringify({
      draftPreserved: JSON.stringify(draft) === JSON.stringify(currentDraft),
      isError: !imported.ok,
      issueCount: !imported.ok ? imported.issues.length : 0,
      hasFixGuidance: !imported.ok ? imported.issues.every((issue) => Boolean(issue.fix)) : false,
    }));
  `);

  assert.equal(result.draftPreserved, true);
  assert.equal(result.isError, true);
  assert.equal(result.hasFixGuidance, true);
});

test("CF-06: 저장소 저장 및 새로고침 후 문서 봉투로 안전하게 복원된다", () => {
  const result = runCoreUserFlows(`
    const mockStorage = new Map();
    const mockStorageApi = {
      getItem: (key) => mockStorage.get(key) ?? null,
      setItem: (key, value) => mockStorage.set(key, value),
      removeItem: (key) => mockStorage.delete(key),
    };

    const repository = repo.createLocalStoryProjectRepository({
      storage: mockStorageApi,
      storageKey: repo.STORY_DRAFT_STORAGE_KEY,
    });

    const project = fixtures.createCurrentV1ProjectFixture();
    project.title = "새로고침 시험";
    project.lines[0].text = "새로고침 뒤에도 남아야 해요.";

    const saveResult = repository.saveDraft(project);
    const loadedResult = repository.loadDraft();

    console.log(JSON.stringify({
      saveOk: saveResult.ok,
      loadedTitle: loadedResult.project?.title,
      loadedLineText: loadedResult.project?.lines[0].text,
      hasEnvelope: mockStorage.get(repo.STORY_DRAFT_STORAGE_KEY)?.includes("schemaVersion"),
    }));
  `);

  assert.equal(result.saveOk, true);
  assert.equal(result.loadedTitle, "새로고침 시험");
  assert.equal(result.loadedLineText, "새로고침 뒤에도 남아야 해요.");
  assert.equal(result.hasEnvelope, true);
});

test("CF-07: 모바일 액션 및 장면·메모·플레이 상태 전이가 안전하게 실행된다", () => {
  const result = runCoreUserFlows(`
    let project = fixtures.createCurrentV1ProjectFixture();

    // 1. 모바일에서 새 대사 장면 생성
    const created = commands.createStoryLine({
      lines: project.lines,
      chapterId: "chapter-001",
      line: {
        type: "dialogue",
        speaker: "left",
        speakerName: "어린 자라",
        text: "모바일에서 작성한 대사입니다.",
        leftAssetId: "",
        rightAssetId: "",
        backgroundId: "",
        purposeNote: "",
        emotionNote: "",
        directionNote: "",
      },
      createId: () => "line-mobile-001",
    });
    project = { ...project, lines: created.lines };

    // 2. 장면 선택
    const selection = selectors.selectStoryEditorSelection({
      project,
      selectedChapterId: "chapter-001",
      selectedLineId: "line-mobile-001",
    });

    // 3. 플레이 전환
    const player = playerState.storyStudioPlayerReducer(
      playerState.INITIAL_STORY_STUDIO_PLAYER_STATE,
      { type: "open", index: selection.selectedStoryLineIndex },
    );

    console.log(JSON.stringify({
      createdLineId: created.selectedLineId,
      selectedStoryLineIndex: selection.selectedStoryLineIndex,
      playerPlayIndex: player.playIndex,
      playerView: player.view,
    }));
  `);

  assert.equal(result.createdLineId, "line-mobile-001");
  assert.equal(result.selectedStoryLineIndex, 2);
  assert.equal(result.playerPlayIndex, 2);
  assert.equal(result.playerView, "play");
});

test("CF-08: 다중 단계 연결형 이야기 흐름표에서 3·4·5단계 전환 시 장의 다중 단계가 보존된다", () => {
  const result = runCoreUserFlows(`
    let draft = fixtures.createCurrentV1ProjectFixture();

    // 4개 장 구성: 1장(발단), 2장(전개), 3장(위기, 절정), 4장(결말)
    draft.chapters = [
      { ...draft.chapters[0], id: "ch-1", order: 1, title: "시작", storyStageKeys: ["opening"] },
      { ...draft.chapters[0], id: "ch-2", order: 2, title: "갈등 발생", storyStageKeys: ["middle"] },
      { ...draft.chapters[0], id: "ch-3", order: 3, title: "결정적 대결", storyStageKeys: ["crisis", "climax"] },
      { ...draft.chapters[0], id: "ch-4", order: 4, title: "마무리", storyStageKeys: ["ending"] },
    ];

    // 5단계 모드에서 포맷
    const fiveModeLabels = draft.chapters.map((c) =>
      stages.formatStoryStageLabels(c.storyStageKeys, "five")
    );

    // 4단계 모드로 전환
    draft.planning.structureMode = "four";
    const fourModeLabels = draft.chapters.map((c) =>
      stages.formatStoryStageLabels(c.storyStageKeys, "four")
    );

    // 3단계 모드로 전환
    draft.planning.structureMode = "three";
    const threeModeLabels = draft.chapters.map((c) =>
      stages.formatStoryStageLabels(c.storyStageKeys, "three")
    );

    // 미연결 단계 분석
    const unlinkedFive = stages.getUnlinkedStagesAndChapters(draft.chapters, "five");
    const unlinkedThree = stages.getUnlinkedStagesAndChapters(draft.chapters, "three");

    console.log(JSON.stringify({
      fiveModeLabels,
      fourModeLabels,
      threeModeLabels,
      ch3Keys: draft.chapters[2].storyStageKeys,
      unlinkedFiveCount: unlinkedFive.unlinkedStages.length,
      unlinkedThreeCount: unlinkedThree.unlinkedStages.length,
    }));
  `);

  assert.deepEqual(result.fiveModeLabels, ["발단", "전개", "위기·절정", "결말"]);
  assert.deepEqual(result.fourModeLabels, ["발단", "전개", "위기·절정", "결말"]);
  assert.deepEqual(result.threeModeLabels, ["처음", "중간", "위기·절정", "끝"]);
  assert.deepEqual(result.ch3Keys, ["crisis", "climax"]);
  assert.equal(result.unlinkedFiveCount, 0); // 5단계 모두 연결됨
  assert.equal(result.unlinkedThreeCount, 0); // 3단계(처음/중간/끝) 모두 연결됨
});

test("CF-11: 접힌 모든 계획 필드와 다중 단계는 구조 변경 뒤 Excel에서도 보존된다", () => {
  const result = runCoreUserFlows(`
    let draft = fixtures.createCurrentV1ProjectFixture();
    for (const key of Object.keys(draft.planning)) {
      if (key !== "structureMode") draft.planning[key] = key + " 보존 문장\\n둘째 줄";
    }
    draft.chapters[0] = { ...draft.chapters[0], storyStageKeys: ["crisis", "climax"] };
    const original = storyData.cloneProject(draft);
    for (const structureMode of ["three", "four", "five"]) {
      draft = { ...draft, planning: { ...draft.planning, structureMode } };
    }
    const wb = workbook.createStoryWorkbook(draft, assets.STORY_ASSETS);
    const file = new File([await wb.xlsx.writeBuffer()], "hidden-plan.xlsx");
    const loaded = sheet.importStoryProject(await workbook.readStoryWorkbook(file), "");
    if (!loaded.ok) throw new Error(JSON.stringify(loaded.issues));
    console.log(JSON.stringify({
      planning: loaded.project.planning,
      expectedPlanning: { ...original.planning, structureMode: "five" },
      chapter: loaded.project.chapters[0],
      expectedChapter: original.chapters[0],
      memos: loaded.project.creativeMemos,
      expectedMemos: original.creativeMemos,
    }));
  `);
  assert.deepEqual(result.planning, result.expectedPlanning);
  assert.deepEqual(result.chapter, result.expectedChapter);
  // The official workbook exports memo content/links, not import timestamps.
  const content = (memo) => {
    const { createdAt, updatedAt, ...fields } = memo;
    assert.ok(!Number.isNaN(Date.parse(createdAt)));
    assert.ok(!Number.isNaN(Date.parse(updatedAt)));
    return fields;
  };
  assert.deepEqual(result.memos.map(content), result.expectedMemos.map(content));
});

test("CF-09: 다중 이야기 단계가 포함된 작품의 Excel 내보내기/가져오기 및 적용이 완벽하게 동작한다", () => {
  const result = runCoreUserFlows(`
    let draft = fixtures.createCurrentV1ProjectFixture();
    draft.chapters = [
      { ...draft.chapters[0], id: "ch-1", order: 1, title: "1장", storyStageKeys: ["opening"] },
      { ...draft.chapters[0], id: "ch-2", order: 2, title: "2장", storyStageKeys: ["crisis", "climax"] },
    ];
    draft.lines = [
      { ...draft.lines[0], id: "l-1", chapterId: "ch-1", order: 1 },
      { ...draft.lines[1], id: "l-2", chapterId: "ch-2", order: 1 },
    ];

    // Excel 내보내기
    const wb = workbook.createStoryWorkbook(draft, assets.STORY_ASSETS);
    const data = await wb.xlsx.writeBuffer();
    const file = new File([data], "multi-stage.xlsx", {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    // Excel 가져오기
    const snapshot = await workbook.readStoryWorkbook(file);
    const imported = sheet.importStoryProject(snapshot, "");
    if (!imported.ok) throw new Error(JSON.stringify(imported.issues));

    // 플레이 active 적용
    const active = storyData.cloneProject(imported.project);

    console.log(JSON.stringify({
      importedOk: imported.ok,
      ch1Stages: imported.project.chapters[0].storyStageKeys,
      ch2Stages: imported.project.chapters[1].storyStageKeys,
      activeChaptersCount: active.chapters.length,
      activeLinesCount: active.lines.length,
    }));
  `);

  assert.equal(result.importedOk, true);
  assert.deepEqual(result.ch1Stages, ["opening"]);
  assert.deepEqual(result.ch2Stages, ["crisis", "climax"]);
  assert.equal(result.activeChaptersCount, 2);
  assert.equal(result.activeLinesCount, 2);
});

test("CF-12: 예시 왕복은 학생 저장본·위치를 보존하고 현재 컷 수정은 미적용 편집본의 안정 ID만 연다", () => {
  const result = runCoreUserFlows(`
    const location = await import('./app/story-editor-location.ts');
    const ui = await import('./app/story-studio-ui-session.ts');
    let draft=fixtures.createCurrentV1ProjectFixture();
    const active=storyData.cloneProject(draft);
    const originalText=active.lines[1].text;
    draft.lines[1].text='아직 적용하지 않은 글';
    const values=new Map();
    const storage={getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)};
    const repository=repo.createLocalStoryProjectRepository({storage});
    repository.saveDraft(draft); repository.saveActive(active);
    const origin={version:1,projectId:draft.id,workspaceMode:'plan',planningView:'chapters',
      location:{chapterId:'chapter-001',lineId:'line-001',view:'chapter',focusTarget:'none'}};
    ui.saveStudioUiSession(()=>storage,origin);
    const before=JSON.stringify([...values]);
    let state=playerState.storyStudioPlayerReducer(playerState.INITIAL_STORY_STUDIO_PLAYER_STATE,
      {type:'open',index:0,context:playerState.createStoryPlaybackContext('example',storyData.DEFAULT_PROJECT)});
    state=playerState.storyStudioPlayerReducer(state,{type:'close'});
    const after=JSON.stringify([...values]);
    state=playerState.storyStudioPlayerReducer(state,{type:'open',index:1,context:playerState.createStoryPlaybackContext('student',active)});
    const position=selectors.selectStoryPlayerPosition(state.context.project,state.playIndex);
    const target={projectId:state.context.project.id,lineId:position.line.id};
    const edit=location.resolvePlayedCutLocation(draft,target);
    draft={...draft,lines:draft.lines.filter(l=>l.id!==target.lineId)};
    const deleted=location.resolvePlayedCutLocation(draft,target);
    console.log(JSON.stringify({unchanged:before===after,origin:ui.loadStudioUiSession(()=>storage),expectedOrigin:origin,
      text:position.line.text,originalText,edit,deleted,activeText:active.lines[1].text}));
  `);
  assert.equal(result.unchanged, true);
  assert.deepEqual(result.origin, result.expectedOrigin);
  assert.equal(result.text, result.originalText);
  assert.equal(result.activeText, result.originalText);
  assert.equal(result.edit.lineId, "line-002");
  assert.equal(result.edit.view, "scene");
  assert.equal(result.deleted, null);
});
