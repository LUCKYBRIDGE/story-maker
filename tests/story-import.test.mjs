import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import test from "node:test";

function runStoryImport(script) {
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
          const imports = await import("./app/story-import.ts");
          const sheet = await import("./app/story-sheet.ts");
          const workbook = await import("./app/story-workbook.ts");
          const assets = await import("./app/story-assets.ts");
          const fixtures = await import("./tests/fixtures/story-projects.mjs");
          ${script}
        `,
      ],
      { cwd: process.cwd(), encoding: "utf8" },
    ),
  );
}

test("가져오기 스냅숏은 원문과 판정용 정규화 값을 분리하고 본문 줄바꿈·쉼표·따옴표를 보존한다", () => {
  const result = runStoryImport(`
    const cell = imports.storyImportCell('  첫 줄\\n둘째 줄, "인용"  ');
    const snapshot = imports.createStoryImportSnapshot({
      source: "sheet",
      project: '항목,내용\\n이야기 제목,"  제목, ""따옴표""  "\\n자유 창작 메모,"  첫 줄\\n둘째 줄, ""메모""  "',
      chapters: '챕터 ID,순서,챕터 제목\\nchapter-1,1,"  시작 챕터  "',
      lines: '장면 ID,챕터 ID,순서,종류,화자 위치,화자 이름,내용\\nline-1,chapter-1,1,대사,왼쪽,다온,"  첫 줄\\n둘째 줄, ""인용""  "',
      creativeMemos: '메모 ID,메모 종류,메모 제목,항목 ID,항목 이름,내용,항목 종류,메모 순서,항목 순서\\nmemo-1,자유,  메모 제목  ,field-1,  메모 항목  ,"  값, ""인용""\\n둘째 줄  ",기본,1,1',
    });
    const imported = sheet.importStoryProject(snapshot, "");
    if (!imported.ok) throw new Error(JSON.stringify(imported.issues));
    console.log(JSON.stringify({
      cell,
      title: imported.project.title,
      freeNotes: imported.project.planning.freeNotes,
      chapterTitle: imported.project.chapters[0].title,
      lineText: imported.project.lines[0].text,
      memo: imported.project.creativeMemos[0],
    }));
  `);

  assert.deepEqual(result.cell, {
    raw: '  첫 줄\n둘째 줄, "인용"  ',
    normalized: '첫 줄\n둘째 줄, "인용"',
  });
  assert.equal(result.title, '  제목, "따옴표"  ');
  assert.equal(result.freeNotes, '  첫 줄\n둘째 줄, "메모"  ');
  assert.equal(result.chapterTitle, "  시작 챕터  ");
  assert.equal(result.lineText, '  첫 줄\n둘째 줄, "인용"  ');
  assert.equal(result.memo.title, "  메모 제목  ");
  assert.equal(result.memo.fields[0].value, '  값, "인용"\n둘째 줄  ');
});

test("공식 Excel 최신 양식은 공통 스냅숏을 거쳐 주요 본문과 공백을 잃지 않고 돌아온다", () => {
  const result = runStoryImport(`
    const project = fixtures.createCurrentV1ProjectFixture();
    project.title = '  최신 작품, "따옴표"  ';
    project.planning.freeNotes = '  구상 첫 줄\\n구상 둘째 줄  ';
    project.lines[0].text = '  장면 첫 줄, "말"\\n장면 둘째 줄  ';
    const exported = workbook.createStoryWorkbook(project, assets.STORY_ASSETS);
    const data = await exported.xlsx.writeBuffer();
    const file = new File([data], "latest.xlsx", {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const snapshot = await workbook.readStoryWorkbook(file);
    const imported = sheet.importStoryProject(snapshot, "");
    if (!imported.ok) throw new Error(JSON.stringify(imported.issues));
    console.log(JSON.stringify({
      source: snapshot.source,
      sheets: [snapshot.project.name, snapshot.chapters.name, snapshot.lines.name],
      title: imported.project.title,
      freeNotes: imported.project.planning.freeNotes,
      lineText: imported.project.lines[0].text,
    }));
  `);

  assert.deepEqual(result.sheets, ["이야기 구성", "장의 흐름", "컷 대본"]);
  assert.equal(result.source, "excel");
  assert.equal(result.title, '  최신 작품, "따옴표"  ');
  assert.equal(result.freeNotes, "  구상 첫 줄\n구상 둘째 줄  ");
  assert.equal(result.lineText, '  장면 첫 줄, "말"\n장면 둘째 줄  ');
});

test("이전 Excel 탭·열과 빈 칸은 현재 공통 스냅숏에서 안전하게 읽는다", () => {
  const result = runStoryImport(`
    const snapshot = imports.createStoryImportSnapshot({
      source: "excel",
      names: { project: "작품", chapters: "챕터", lines: "대사" },
      project: "항목,내용\\n작품 제목,이전 작품\\n처음,  시작 본문  ",
      chapters: "chapter_id,order,title\\nlegacy-chapter,1,이전 챕터",
      lines: 'line_id,chapter_id,order,type,speaker,speaker_name,text\\nlegacy-line-1,legacy-chapter,1,dialogue,left,다온,\\nlegacy-line-2,legacy-chapter,2,narration,narration,해설,"  줄바꿈 전\\n줄바꿈 후  "',
    });
    const imported = sheet.importStoryProject(snapshot, "");
    if (!imported.ok) throw new Error(JSON.stringify(imported.issues));
    console.log(JSON.stringify({
      title: imported.project.title,
      opening: imported.project.planning.opening,
      emptyText: imported.project.lines[0].text,
      multilineText: imported.project.lines[1].text,
    }));
  `);

  assert.equal(result.title, "이전 작품");
  assert.equal(result.opening, "  시작 본문  ");
  assert.equal(result.emptyText, "");
  assert.equal(result.multilineText, "  줄바꿈 전\n줄바꿈 후  ");
});

test("손상된 CSV와 필수 탭 누락도 공통 오류 계약으로 위치와 고치는 법을 반환한다", () => {
  const result = runStoryImport(`
    const csvSnapshot = imports.createStoryImportSnapshot({
      source: "sheet",
      project: "항목,내용\\n이야기 제목,손상",
      chapters: "챕터 ID,순서,챕터 제목\\nchapter-1,1,첫 챕터",
      lines: '장면 ID,챕터 ID,순서,종류,화자 위치,화자 이름,내용\\nline-1,chapter-1,1,대사,왼쪽,다온,"닫히지 않은 본문',
    });
    const csvResult = sheet.importStoryProject(csvSnapshot, "");
    const incomplete = workbook.createStoryWorkbook(fixtures.createCurrentV1ProjectFixture(), assets.STORY_ASSETS);
    incomplete.removeWorksheet("컷 대본");
    const data = await incomplete.xlsx.writeBuffer();
    let workbookIssue;
    try {
      await workbook.readStoryWorkbook(new File([data], "incomplete.xlsx"));
    } catch (error) {
      workbookIssue = error.issues?.[0];
    }
    console.log(JSON.stringify({ csvResult, workbookIssue }));
  `);

  assert.equal(result.csvResult.ok, false);
  assert.deepEqual(result.csvResult.issues[0], {
    severity: "error",
    source: "sheet",
    sheet: "컷 대본",
    row: 2,
    column: "알 수 없음",
    value: "닫히지 않은 본문",
    message: "닫히지 않은 큰따옴표가 있어 CSV 한 칸의 끝을 알 수 없어요.",
    fix: "셀 안의 큰따옴표는 두 번(\"\") 쓰고, 열어 둔 큰따옴표는 닫아 주세요.",
  });
  assert.deepEqual(result.workbookIssue, {
    severity: "error",
    source: "excel",
    sheet: "통합 문서",
    row: 1,
    column: "탭 이름",
    value: "컷 대본(또는 장면/대사)",
    message: "필수 탭이 없어요: 컷 대본(또는 장면/대사).",
    fix: "공식 양식의 ‘이야기 구성’, ‘장의 흐름’(또는 ‘챕터 흐름’), ‘컷 대본’(또는 ‘장면’) 탭을 유지해 주세요. 이전 양식의 ‘작품’, ‘챕터’, ‘대사’도 열 수 있어요.",
  });
});

test("공개 시트 접근 실패와 손상된 Excel 파일도 source가 있는 오류를 반환한다", () => {
  const result = runStoryImport(`
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => new Response("비공개", { status: 403 });
    let sheetIssue;
    try {
      await sheet.fetchSheetSnapshot("fixed-sheet-id", new AbortController().signal);
    } catch (error) {
      sheetIssue = error.issues?.[0];
    } finally {
      globalThis.fetch = originalFetch;
    }
    let workbookIssue;
    try {
      await workbook.readStoryWorkbook(new File(["손상됨"], "damaged.xlsx"));
    } catch (error) {
      workbookIssue = error.issues?.[0];
    }
    console.log(JSON.stringify({ sheetIssue, workbookIssue }));
  `);

  assert.deepEqual(result.sheetIssue, {
    severity: "error",
    source: "sheet",
    sheet: "이야기 구성 또는 작품",
    row: 1,
    column: "공개 설정",
    value: "fixed-sheet-id",
    message: "‘이야기 구성’ 또는 ‘작품’ 탭을 읽지 못했어요.",
    fix: "Google 시트를 ‘링크가 있는 모든 사용자에게 공개’로 설정하고 탭 이름을 확인해 주세요. 계속 안 되면 Excel로 저장해 불러와 주세요.",
  });
  assert.deepEqual(result.workbookIssue, {
    severity: "error",
    source: "excel",
    sheet: "통합 문서",
    row: 1,
    column: "파일",
    value: "damaged.xlsx",
    message: "Excel 파일 내용을 읽을 수 없어요.",
    fix: "공식 양식에서 다시 저장한 .xlsx 파일인지 확인해 주세요.",
  });
});

test("손상된 가져오기는 탭·행·열·원문·고치는 법을 반환하고 현재 draft를 바꾸지 않는다", () => {
  const result = runStoryImport(`
    const draft = fixtures.createCurrentV1ProjectFixture();
    const before = structuredClone(draft);
    const snapshot = imports.createStoryImportSnapshot({
      source: "sheet",
      project: "항목,내용\\n이야기 제목,손상 확인",
      chapters: "챕터 ID,순서,챕터 제목\\nchapter-1,1,첫 챕터",
      lines: "장면 ID,챕터 ID,순서,종류,화자 위치,화자 이름,내용\\nline-1,없는-챕터,1,대사,왼쪽,다온,본문",
    });
    const imported = sheet.importStoryProject(snapshot, "");
    const nextDraft = imported.ok ? imported.project : draft;
    console.log(JSON.stringify({
      result: imported,
      draftPreserved: JSON.stringify(before) === JSON.stringify(nextDraft),
    }));
  `);

  assert.equal(result.result.ok, false);
  assert.equal(result.draftPreserved, true);
  assert.deepEqual(result.result.issues[0], {
    severity: "error",
    source: "sheet",
    sheet: "컷 대본",
    row: 2,
    column: "챕터 ID",
    value: "없는-챕터",
    message: "장 ID ‘없는-챕터’에 해당하는 장(場)이 없어요.",
    fix: "장의 흐름 탭에 같은 장 ID를 만들거나 컷의 장 ID를 고쳐 주세요.",
  });
});

test("중복 장·컷 ID와 알 수 없는 컷 종류·화자 위치를 원본 위치와 함께 거부한다", () => {
  const result = runStoryImport(`
    const snapshot = imports.createStoryImportSnapshot({
      source: "sheet",
      project: "항목,내용\\n이야기 제목,손상 확인",
      chapters: "장 ID,순서,장 제목\\nchapter-1,1,첫 장\\nchapter-1,2,둘째 장",
      lines: "컷 ID,장 ID,순서,종류,화자 위치,화자 이름,내용\\nline-1,chapter-1,1,대사,왼쪽,다온,첫 본문\\nline-1,chapter-1,2,알 수 없는 종류,위,하린,둘째 본문",
    });
    const imported = sheet.importStoryProject(snapshot, "");
    if (imported.ok) throw new Error("손상된 작품을 열면 안 됩니다.");
    console.log(JSON.stringify(imported.issues.map((issue) => ({
      sheet: issue.sheet,
      row: issue.row,
      column: issue.column,
      value: issue.value,
      message: issue.message,
      fix: issue.fix,
    }))));
  `);

  assert.deepEqual(result, [
    {
      sheet: "장의 흐름",
      row: 3,
      column: "장 ID",
      value: "chapter-1",
      message: "장 ID ‘chapter-1’이(가) 2행에 이미 있어요.",
      fix: "장의 흐름 탭에서 각 장에 서로 다른 장 ID를 입력해 주세요.",
    },
    {
      sheet: "컷 대본",
      row: 3,
      column: "컷 ID",
      value: "line-1",
      message: "컷 ID ‘line-1’이(가) 2행에 이미 있어요.",
      fix: "컷 대본 탭에서 각 컷에 서로 다른 컷 ID를 입력해 주세요.",
    },
    {
      sheet: "컷 대본",
      row: 3,
      column: "종류",
      value: "알 수 없는 종류",
      message: "컷 종류 ‘알 수 없는 종류’를 알 수 없어요.",
      fix: "종류에는 ‘대사’ 또는 ‘해설’을 입력해 주세요.",
    },
    {
      sheet: "컷 대본",
      row: 3,
      column: "화자 위치",
      value: "위",
      message: "대사 컷의 화자 위치 ‘위’를 알 수 없어요.",
      fix: "대사 컷의 화자 위치에는 ‘왼쪽’ 또는 ‘오른쪽’을 입력해 주세요.",
    },
  ]);
});

test("Excel의 빈 행 뒤 오류도 실제 Excel 행 번호로 안내한다", () => {
  const result = runStoryImport(`
    const workbookDocument = workbook.createStoryWorkbook(
      fixtures.createCurrentV1ProjectFixture(),
      assets.STORY_ASSETS,
    );
    const linesSheet = workbookDocument.getWorksheet("컷 대본");
    linesSheet.spliceRows(2, 0, []);
    linesSheet.getCell("D3").value = "알 수 없는 종류";
    const data = await workbookDocument.xlsx.writeBuffer();
    const snapshot = await workbook.readStoryWorkbook(
      new File([data], "blank-row.xlsx", {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
    );
    const imported = sheet.importStoryProject(snapshot, "");
    console.log(JSON.stringify(imported.ok ? { ok: true } : {
      ok: false,
      issue: imported.issues[0],
    }));
  `);

  assert.deepEqual(result, {
    ok: false,
    issue: {
      severity: "error",
      source: "excel",
      sheet: "컷 대본",
      row: 3,
      column: "종류",
      value: "알 수 없는 종류",
      message: "컷 종류 ‘알 수 없는 종류’를 알 수 없어요.",
      fix: "종류에는 ‘대사’ 또는 ‘해설’을 입력해 주세요.",
    },
  });
});

test("Excel 왕복 시 장의 다중 이야기 단계(예: 위기, 절정)가 완벽하게 보존된다", () => {
  const result = runStoryImport(`
    const project = fixtures.createCurrentV1ProjectFixture();
    project.chapters[0].storyStageKeys = ["crisis", "climax"];
    const exported = workbook.createStoryWorkbook(project, assets.STORY_ASSETS);
    const data = await exported.xlsx.writeBuffer();
    const file = new File([data], "stages.xlsx", {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const snapshot = await workbook.readStoryWorkbook(file);
    const imported = sheet.importStoryProject(snapshot, "");
    if (!imported.ok) throw new Error(JSON.stringify(imported.issues));
    console.log(JSON.stringify({
      storyStageKeys: imported.project.chapters[0].storyStageKeys,
    }));
  `);

  assert.deepEqual(result.storyStageKeys, ["crisis", "climax"]);
});

test("시트/CSV에서 쉼표·가운뎃점·영문 키로 작성된 이야기 단계를 올바르게 파싱한다", () => {
  const result = runStoryImport(`
    const snapshot = imports.createStoryImportSnapshot({
      source: "sheet",
      project: "항목,내용\\n이야기 제목,단계 테스트",
      chapters: '장 ID,순서,장 제목,이야기 단계\\nchapter-1,1,1장,"발단 · 전개"\\nchapter-2,2,2장,"crisis, climax"\\nchapter-3,3,3장,\\nchapter-4,4,4장,"위기\\n절정"',
      lines: "컷 ID,장 ID,순서,종류,화자 위치,화자 이름,내용\\nline-1,chapter-1,1,해설,해설,해설,첫 컷",
    });
    const imported = sheet.importStoryProject(snapshot, "");
    if (!imported.ok) throw new Error(JSON.stringify(imported.issues));
    console.log(JSON.stringify({
      ch1Stages: imported.project.chapters[0].storyStageKeys,
      ch2Stages: imported.project.chapters[1].storyStageKeys,
      ch3Stages: imported.project.chapters[2].storyStageKeys,
      ch4Stages: imported.project.chapters[3].storyStageKeys,
    }));
  `);

  assert.deepEqual(result.ch1Stages, ["opening", "middle"]);
  assert.deepEqual(result.ch2Stages, ["crisis", "climax"]);
  assert.deepEqual(result.ch3Stages, []);
  assert.deepEqual(result.ch4Stages, ["crisis", "climax"]);
});

test("잘못된 이야기 단계 입력 시 오류 위치와 고치는 법을 안내한다", () => {
  const result = runStoryImport(`
    const snapshot = imports.createStoryImportSnapshot({
      source: "sheet",
      project: "항목,내용\\n이야기 제목,단계 오류 테스트",
      chapters: '장 ID,순서,장 제목,이야기 단계\\nchapter-1,1,1장,"발단, 잘못된단계"',
      lines: "컷 ID,장 ID,순서,종류,화자 위치,화자 이름,내용\\nline-1,chapter-1,1,해설,해설,해설,첫 컷",
    });
    const imported = sheet.importStoryProject(snapshot, "");
    console.log(JSON.stringify(imported.ok ? { ok: true } : {
      ok: false,
      issue: imported.issues[0],
    }));
  `);

  assert.deepEqual(result, {
    ok: false,
    issue: {
      severity: "error",
      source: "sheet",
      sheet: "장의 흐름",
      row: 2,
      column: "이야기 단계",
      value: "발단, 잘못된단계",
      message: "이야기 단계 ‘잘못된단계’를 알 수 없어요.",
      fix: "이야기 단계에는 발단(처음), 전개(중간), 위기, 절정, 결말(끝)을 쉼표(,)나 가운뎃점(·)으로 구분해 입력해 주세요.",
    },
  });
});
