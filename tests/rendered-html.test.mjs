import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { access, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import test from "node:test";
import ExcelJS from "exceljs";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("서버가 로그인 없는 놀퀴즈 스토리 스튜디오 시작 화면을 렌더링한다", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>놀퀴즈 스토리 스튜디오<\/title>/i);
  assert.match(html, /놀퀴즈/);
  assert.match(html, /이야기를 만들어 볼까요\?/);
  assert.match(html, /새 이야기 만들기/);
  assert.match(html, /이어만들기/);
  assert.match(html, /Excel 파일에서 이어만들기/);
  assert.match(html, /공개 Google 시트/);
  assert.match(html, /이어쓰기 템플릿/);
  assert.match(html, /<details class="entry-template-options"><summary>준비된 앞이야기에서 시작하기 · 3가지<\/summary>/);
  assert.match(html, /토끼와 자라 · 땅에서 만난 뒤/);
  assert.match(html, /토끼와 자라 · 용궁에 묶인 토끼/);
  assert.match(html, /옹고집전 · 아내의 선택 이후/);
  assert.match(html, /예시 작품 플레이/);
  assert.match(html, /이 기기의 이야기를 확인하고 있어요/);
  assert.doesNotMatch(html, /Google로 시작하기/);
  assert.doesNotMatch(html, /Your site is taking shape|Building your site/);
});

test("공식 Excel 양식은 웹과 같은 이야기 순서와 네 구성 묶음을 제공한다", async () => {
  const workbook = new ExcelJS.Workbook();
  const file = await readFile(
    new URL(
      "../public/templates/놀퀴즈_스토리_템플릿.xlsx",
      import.meta.url,
    ),
  );
  await workbook.xlsx.load(file);

  assert.deepEqual(
    workbook.worksheets.map((sheet) => sheet.name),
    [
      "시작하기",
      "이야기 구성",
      "장의 흐름",
      "장의 자료",
      "화자",
      "컷 대본",
      "창작 메모",
      "리소스",
    ],
  );
  const planning = workbook.getWorksheet("이야기 구성");
  assert.ok(planning);
  assert.deepEqual(
    [2, 8, 15, 22].map((row) => planning.getCell(row, 1).value),
    [
      "1. 작품 기본",
      "2. 이야기 핵심",
      "3. 이야기 뼈대",
      "4. 더 자세한 메모",
    ],
  );
  assert.equal(planning.getCell("B16").value, "5단계");
  assert.deepEqual(planning.getCell("B16").dataValidation.formulae, [
    '"5단계,4단계,3단계"',
  ]);
  assert.equal(workbook.getWorksheet("리소스")?.rowCount, 109);
  const creativeMemos = workbook.getWorksheet("창작 메모");
  assert.ok(creativeMemos);
  assert.deepEqual(
    creativeMemos.getRow(1).values.slice(1),
    [
      "메모 ID",
      "메모 종류",
      "메모 제목",
      "연결 장 ID",
      "연결 컷 ID",
      "항목 ID",
      "항목 이름",
      "내용",
      "항목 종류",
      "메모 순서",
      "항목 순서",
    ],
  );
});

test("이전 저장본과 새 창작 메모 데이터는 빈 배열로 안전하게 호환된다", () => {
  const projectRoot = fileURLToPath(new URL("../", import.meta.url));
  const output = execFileSync(
    process.execPath,
    [
      "--disable-warning=ExperimentalWarning",
      "--experimental-strip-types",
      "--experimental-loader=./tests/node-types-loader.mjs",
      "--input-type=module",
      "-e",
      `
        const { cloneProject, createBlankProject, DEFAULT_PROJECT } = await import("./app/story-data.ts");
        const legacy = structuredClone(DEFAULT_PROJECT);
        delete legacy.creativeMemos;
        console.log(JSON.stringify({
          legacy: cloneProject(legacy).creativeMemos,
          blank: createBlankProject().creativeMemos,
          example: DEFAULT_PROJECT.creativeMemos,
        }));
      `,
    ],
    { cwd: projectRoot, encoding: "utf8" },
  );
  const result = JSON.parse(output);
  assert.deepEqual(result.legacy, []);
  assert.deepEqual(result.blank, []);
  assert.deepEqual(result.example, []);
});

test("기본 예시와 세 이어쓰기 템플릿은 끊김 없는 챕터 흐름을 제공한다", () => {
  const projectRoot = fileURLToPath(new URL("../", import.meta.url));
  const output = execFileSync(
    process.execPath,
    [
      "--disable-warning=ExperimentalWarning",
      "--experimental-strip-types",
      "--experimental-loader=./tests/node-types-loader.mjs",
      "--input-type=module",
      "-e",
      `
        const {
          DEFAULT_PROJECT,
          RABBIT_TURTLE_CONTINUATION_TEMPLATE,
          RABBIT_TURTLE_CONTINUATION_TEMPLATE_2,
          ONGGOJIB_CONTINUATION_TEMPLATE,
        } = await import("./app/story-data.ts");
        const projects = [
          DEFAULT_PROJECT,
          RABBIT_TURTLE_CONTINUATION_TEMPLATE,
          RABBIT_TURTLE_CONTINUATION_TEMPLATE_2,
          ONGGOJIB_CONTINUATION_TEMPLATE,
        ];
        console.log(JSON.stringify(projects.map((project) => ({
          title: project.title,
          chapterTitles: project.chapters
            .slice()
            .sort((a, b) => a.order - b.order)
            .map((chapter) => chapter.title),
          chapterSceneCounts: project.chapters
            .slice()
            .sort((a, b) => a.order - b.order)
            .map(
              (chapter) =>
                project.lines.filter(
                  (line) => line.chapterId === chapter.id,
                ).length,
            ),
          lineCount: project.lines.length,
          blankCount: project.lines.filter((line) => !line.text.trim()).length,
          duplicateIds: project.lines.filter(
            (line, index, lines) =>
              lines.findIndex((candidate) => candidate.id === line.id) !== index,
          ).length,
          narrationWithParentheses: project.lines.filter(
            (line) =>
              line.type === "narration" && /[()（）]/.test(line.text),
          ).length,
          internalSourceNameCount:
            JSON.stringify(project).match(/pinky-ne-site/g)?.length ?? 0,
        }))));
      `,
    ],
    { cwd: projectRoot, encoding: "utf8" },
  );
  const summaries = JSON.parse(output);

  assert.deepEqual(
    summaries.map((summary) => summary.lineCount),
    [16, 15, 26, 32],
  );
  assert.deepEqual(
    summaries.map((summary) => summary.blankCount),
    [0, 1, 1, 1],
  );
  assert.ok(summaries.every((summary) => summary.duplicateIds === 0));
  assert.ok(
    summaries.every((summary) => summary.narrationWithParentheses === 0),
  );
  assert.ok(
    summaries.every((summary) => summary.internalSourceNameCount === 0),
  );
  assert.deepEqual(summaries[0].chapterTitles, [
    "뜻밖의 재회",
    "숨기지 않은 부탁",
    "다시 믿기 어려운 까닭",
    "믿음을 확인하는 약속",
    "함께 쓴 첫 문장",
  ]);
  assert.deepEqual(summaries[3].chapterTitles, [
    "말이 사라진 밥상",
    "아이들이 말을 시작하다",
    "두 옹고집이 마주치다",
    "두 옹고집의 첫 관아",
    "아내가 선택한 사람",
    "여기서부터 이어 쓰기",
  ]);
  assert.deepEqual(summaries[0].chapterSceneCounts, [3, 3, 3, 4, 3]);
  assert.deepEqual(summaries[1].chapterSceneCounts, [6, 6, 2, 1]);
  assert.deepEqual(summaries[2].chapterSceneCounts, [6, 6, 7, 6, 1]);
  assert.deepEqual(summaries[3].chapterSceneCounts, [5, 11, 5, 9, 1, 1]);
});

test("화자·이미지·외부 자료가 분리된 편집 도구로 유지된다", async () => {
  const [
    studio,
    assetPicker,
    startScreen,
    planScreen,
    resourceWidgets,
    scriptScreen,
    sceneThumbnail,
    storyRevisionCheck,
    creativeMemoEditor,
    sceneFocusEditor,
    memoPopup,
    storyPlayer,
    importPreviewDialog,
    globals,
    storyData,
    storyAssets,
    workbook,
    sheet,
    creativeMemo,
  ] = await Promise.all([
    readFile(new URL("../app/StoryStudio.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/AssetPickerButton.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/StartScreen.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/StoryPlanScreen.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/ResourceWidgets.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/ScriptScreen.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/SceneThumbnail.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/StoryRevisionCheck.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/CreativeMemoEditor.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/SceneFocusEditor.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/MemoPopup.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/StoryPlayer.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/ImportPreviewDialog.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../app/story-data.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/story-assets.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/story-workbook.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/story-sheet.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/creative-memos.ts", import.meta.url), "utf8"),
  ]);

  assert.match(importPreviewDialog, /function ImportIssuesDialog/);
  assert.match(importPreviewDialog, /function ImportConfirmationDialog/);
  assert.match(importPreviewDialog, /import-source-badge/);
  assert.match(importPreviewDialog, /import-issue-card/);
  assert.match(importPreviewDialog, /고치는 법/);
  assert.match(importPreviewDialog, /Google 시트 안내/);
  assert.match(importPreviewDialog, /방금 전으로 복구/);
  assert.match(globals, /\.import-issues-dialog/);
  assert.match(globals, /\.import-confirm-dialog/);
  assert.match(globals, /\.import-issue-card\.error/);
  assert.match(globals, /\.import-issue-card\.warning/);
  assert.match(globals, /\.import-sheet-advice/);

  assert.match(storyData, /speakerNames:\s*string\[\]/);
  assert.match(storyData, /planning:\s*StoryPlanning/);
  assert.match(storyData, /creativeMemos:\s*CreativeMemo\[\]/);
  assert.match(storyData, /structureMode:\s*"five"\s*\|\s*"four"\s*\|\s*"three"/);
  assert.match(storyData, /material:\s*string/);
  assert.match(storyData, /mainCharacter:\s*string/);
  assert.match(storyData, /centralProblem:\s*string/);
  assert.match(storyData, /stakes:\s*string/);
  assert.match(storyData, /crisis:\s*string/);
  assert.match(storyData, /climax:\s*string/);
  assert.match(storyData, /worldNotes:\s*string/);
  assert.match(storyData, /openQuestions:\s*string/);
  assert.match(storyData, /chapterSpeakerNames:\s*string\[\]/);
  assert.match(storyData, /characterAssetIds:\s*string\[\]/);
  assert.match(storyData, /backgroundAssetIds:\s*string\[\]/);
  assert.match(storyData, /function createBlankProject/);
  assert.match(storyData, /RABBIT_TURTLE_CONTINUATION_TEMPLATE/);
  assert.match(storyData, /RABBIT_TURTLE_CONTINUATION_TEMPLATE_2/);
  assert.match(storyData, /continuation-chapter-2/);
  assert.match(storyData, /palace-continuation-chapter-2/);
  assert.match(storyData, /자라가 토끼에게 건네는 첫 말을 직접 써 보세요/);
  assert.match(storyData, /결박된 토끼가 살아남기 위해 하는 첫 말을 직접 써 보세요/);
  assert.match(
    storyData,
    /아이들을 지켜 준 저 사람과 돌아가겠습니다/,
  );
  assert.match(storyData, /오늘 마당에 까치가……/);
  assert.match(storyData, /그래서 어떻게 되었느냐/);
  assert.match(storyData, /title: "뜻밖의 재회"/);
  assert.match(storyData, /title: "믿음을 확인하는 약속"/);
  assert.match(storyData, /title: "함께 쓴 첫 문장"/);
  assert.match(
    storyData,
    /깨진 믿음은 솔직한 말과 지키는 행동으로 다시 쌓을 수 있다/,
  );
  assert.match(planScreen, /한 장에 여러 이야기 단계를 담아도 괜찮아요/);
  assert.match(planScreen, /function chapterArcLabel/);
  assert.match(planScreen, /plan-chapter-item/);
  assert.match(planScreen, /selectedChapter.nextChapterIdea/);
  assert.match(planScreen, /이 장에서 일어나는 일/);
  assert.match(planScreen, /이 장의 결과로 다음에 생기는 일/);
  assert.match(studio, /컷을 이어 읽으며 써요/);
  assert.match(studio, /인물과 배경까지 꾸며요/);
  assert.match(studio, /컷 꾸미기/);
  assert.match(studio, /이 장 대본/);
  assert.match(studio, /파일·복구/);
  assert.match(planScreen, /인물·배경·추가 메모/);
  assert.match(scriptScreen, /scene-more-actions/);
  assert.match(planScreen, /창작 메모/);
  assert.match(planScreen, /\+ 창작 메모/);
  assert.match(planScreen, /어떤 메모를 만들까요/);
  assert.match(planScreen, /자유롭게 쓰기/);
  assert.match(planScreen, /도움 틀로 쓰기/);
  assert.match(creativeMemo, /인물 알아보기/);
  assert.match(creativeMemo, /인물 관계/);
  assert.match(creativeMemo, /장소·세계/);
  assert.match(creativeMemoEditor, /\+ 항목 추가/);
  assert.match(creativeMemoEditor, /직접 항목 이름 붙이기/);
  assert.match(creativeMemoEditor, /위로 이동/);
  assert.match(creativeMemoEditor, /아래로 이동/);
  assert.match(studio, /메모를 삭제할까요/);
  assert.match(studio, /memoSectionsOpen/);
  assert.match(studio, /closeAllMemoSections/);
  assert.match(memoPopup, /memo-popup/);
  assert.match(memoPopup, /메모 찾기/);
  assert.match(studio, /filteredMemoSearchResults/);
  assert.match(studio, /openMemoSearchResult/);
  assert.match(studio, /sortedChapters\.flatMap/);
  assert.match(studio, /orderedDraftLines\.flatMap/);
  assert.match(memoPopup, /크게 보기/);
  assert.match(memoPopup, /작게 보기/);
  assert.match(memoPopup, /원하는 묶음을 펼쳐 글과 비교하고 바로 수정하세요/);
  assert.match(memoPopup, /전체 이야기/);
  assert.match(memoPopup, /이야기 뼈대/);
  assert.match(memoPopup, /현재 장/);
  assert.match(memoPopup, /현재 컷/);
  assert.match(globals, /\.memo-popup\.large/);
  assert.match(globals, /\.memo-search-results/);
  assert.match(globals, /\.memo-section\.current/);
  assert.match(globals, /\.creative-memo-list/);
  assert.match(globals, /\.creative-memo-editor/);
  assert.doesNotMatch(studio, /memo-drawer/);
  assert.doesNotMatch(studio, /chapter-guide-panel|scene-notes-card/);
  assert.doesNotMatch(studio, /<strong>스토리 구상<\/strong>/);
  assert.doesNotMatch(studio, /<strong>이야기 만들기<\/strong>/);
  assert.match(globals, /\.chapter-context-strip/);
  assert.match(globals, /\.chapter-flow-card:not\(:last-of-type\)::after/);
  assert.doesNotMatch(
    studio,
    /놀퀴즈 스토리 플레이|creator-brand-name/,
    "플레이와 편집 화면에서 브랜드명이 불필요하게 반복되면 안 됩니다.",
  );
  assert.match(studio, /기본 제공 이미지 © 놀퀴즈/);
  assert.match(
    storyData,
    /아이들이 놀랍니다\. 부인, 아이들을 데리고 뒤로 물러서시오/,
  );
  assert.match(
    storyData,
    /호위들이 토끼의 앞발을 묶었다/,
  );
  assert.match(storyData, /어린 자라/);
  assert.match(
    storyData,
    /작은 목소리라도 내가 끝까지 듣겠다/,
  );
  assert.match(
    storyData,
    /아내의 선택을 들은 진짜 옹고집 또는 다른 인물의 첫 반응을 써 보세요/,
  );
  assert.match(storyData, /ONGGOJIB_CONTINUATION_TEMPLATE/);
  assert.match(storyData, /어두워진 용궁 대청에 조개등 불빛이 켜졌다/);
  assert.match(storyData, /용궁에서 작은 잔치가 열리오/);
  assert.match(storyData, /호위들을 도와 토끼를 묶어라/);
  assert.match(
    storyData,
    /토끼의 반응 → 자라의 선택이나 시도 → 더 커진 문제/,
  );
  assert.match(
    storyData,
    /진짜 옹고집의 첫 반응 → 사또의 판결이나 새 조건/,
  );
  assert.match(sceneThumbnail, /function shouldMirrorAsset/);
  assert.match(sceneThumbnail, /function assetPlacementClass/);
  assert.match(sceneFocusEditor, /function SceneStagingCopy/);
  assert.match(studio, /function copySceneStaging/);
  assert.match(sceneFocusEditor, /다른 컷의 이미지 배치를 그대로 사용/);
  assert.match(assetPicker, /원작 사용/);
  assert.match(assetPicker, /추가 연출/);
  assert.match(assetPicker, /기본 추천/);
  assert.match(assetPicker, /추천 이미지/);
  assert.match(assetPicker, /모든 이미지/);
  assert.match(assetPicker, /전신/);
  assert.match(assetPicker, /상반신/);
  assert.match(resourceWidgets, /function AddSpeaker/);
  assert.match(resourceWidgets, /\+ 화자 추가/);
  assert.match(resourceWidgets, /화자 이름/);
  assert.match(assetPicker, /이미지 선택/);
  assert.match(assetPicker, /태그로 좁히기/);
  assert.match(assetPicker, /검색·태그 초기화/);
  assert.match(sceneFocusEditor, /다른 이미지 고르기/);
  assert.match(resourceWidgets, /사용할 캐릭터 고르기/);
  assert.match(assetPicker, /createPortal/);
  assert.match(assetPicker, /document\.body/);
  assert.match(sceneFocusEditor, /현재 컷에서 사용 중/);
  assert.match(assetPicker, /currentLabel/);
  assert.match(sceneFocusEditor, /currentValue/);
  assert.doesNotMatch(studio, /\+ 자료 추가/);
  assert.doesNotMatch(assetPicker, /\+ 자료 추가/);
  assert.doesNotMatch(studio, /이미지는 이 창을 열었을 때만 보여요/);
  assert.doesNotMatch(assetPicker, /이미지는 이 창을 열었을 때만 보여요/);
  assert.match(assetPicker, /asset-picker-grid/);
  assert.match(globals, /\.asset-picker-findbar/);
  assert.match(globals, /\.asset-picker-filter-toggle/);
  assert.match(globals, /\.asset-picker-result-summary/);
  assert.match(globals, /\.asset-picker-current/);
  assert.match(globals, /\.asset-picker-current-thumb\.background/);
  assert.match(planScreen, /이야기 구성/);
  assert.match(planScreen, /장의 흐름/);
  assert.match(planScreen, /이야기 나침반/);
  assert.match(planScreen, /이야기 소재/);
  assert.match(planScreen, /실패하면 어떤 일이 생기나요/);
  assert.match(planScreen, /발단 → 전개 → 위기 → 절정 → 결말/);
  assert.match(planScreen, /발단 → 전개 → 위기 → 결말/);
  assert.match(planScreen, /처음 → 중간 → 끝/);
  assert.match(planScreen, /이야기 구성 방식/);
  assert.match(planScreen, /구성 점검/);
  assert.match(planScreen, /인물·배경·추가 메모/);
  assert.match(scriptScreen, /이 장 대본/);
  assert.match(scriptScreen, /\+ 대사 컷/);
  assert.match(scriptScreen, /\+ 해설 컷/);
  assert.match(storyRevisionCheck, /고쳐쓰기 자기 점검/);
  assert.match(storyRevisionCheck, /확인함/);
  assert.match(storyRevisionCheck, /나중에 볼래요/);
  assert.match(studio, /컷 꾸미기/);
  assert.match(planScreen, /편집할 때만 보는/);
  assert.match(studio, /현재 편집/);
  assert.match(assetPicker, /즐겨찾기/);
  assert.match(assetPicker, /최근 사용/);
  assert.match(assetPicker, /선택한 태그 지우기/);
  assert.match(studio, /Excel에서 불러오기/);
  assert.match(studio, /Excel로 저장/);
  assert.match(studio, /시트에서 불러오기/);
  assert.match(studio, /빈 작품 시작/);
  assert.match(studio, /function startRabbitTurtleContinuation1/);
  assert.match(studio, /function startRabbitTurtleContinuation2/);
  assert.match(startScreen, /시작할 곳:\s*자라의 첫 설득/);
  assert.match(startScreen, /시작할 곳:\s*토끼의 첫 대응/);
  assert.match(startScreen, /시작할 곳:\s*선택 뒤 첫 컷/);
  assert.match(studio, /처음부터 읽고 고치기/);
  assert.match(studio, /이어 쓸 곳으로/);
  assert.match(studio, /function moveThroughStory/);
  assert.match(sceneFocusEditor, /화자·이미지·컷 설정/);
  assert.match(scriptScreen, /해설 · 이야기 설명/);
  assert.match(scriptScreen, /대사 · 인물이 말함/);
  assert.match(sceneFocusEditor, /상황과 배경을 들려주는 글/);
  assert.match(storyPlayer, /narration-heading/);
  assert.match(storyPlayer, /function DialogueText/);
  assert.match(storyPlayer, /function DialogueInline/);
  assert.match(storyPlayer, /className="dialogue-speaker"/);
  assert.match(storyPlayer, /parenthetical-direction/);
  assert.doesNotMatch(
    storyPlayer,
    /speaker-name/,
    "화자 이름을 대사와 떨어진 배지로 표시하면 안 됩니다.",
  );
  assert.match(scriptScreen, /해설에는 괄호를 쓸 수 없어요/);
  assert.match(scriptScreen, /속마음·표정·행동은 학생이 직접/);
  assert.match(globals, /\.dialogue-box\.narration/);
  assert.match(globals, /\.script-scene-card\.narration/);
  assert.match(globals, /\.scene-kind-badge\.narration/);
  assert.match(globals, /\.editable-stage-dialogue\.narration/);
  assert.match(globals, /\.dialogue-speaker/);
  assert.match(globals, /\.parenthetical-direction/);
  assert.doesNotMatch(
    globals,
    /\.speaker-name/,
    "화자 이름 배지 스타일이 다시 생기면 안 됩니다.",
  );
  assert.match(studio, /놀퀴즈_스토리_템플릿\.xlsx/);
  assert.match(studio, /방금 전으로 복구/);
  assert.match(storyAssets, /tags:\s*string\[\]/);
  assert.match(
    storyAssets,
    /selectionTier:\s*"기본 추천"\s*\|\s*"추가 자료"/,
  );
  assert.match(workbook, /downloadStoryWorkbook/);
  assert.match(workbook, /"창작 메모"/);
  assert.match(workbook, /"메모 ID"/);
  assert.match(workbook, /"항목 이름"/);
  assert.match(workbook, /"항목 종류"/);
  assert.match(sheet, /creativeMemos/);
  assert.match(sheet, /fetchSheetTab\(sheetId, "창작 메모"/);
  assert.match(creativeMemo, /CreativeMemoKind/);
  assert.match(creativeMemo, /과거의 중요한 일/);
  assert.doesNotMatch(studio, /자유 규격|웹 지원 규격|셀 추가/);
  assert.match(
    workbook,
    /대사에서 속마음·표정·행동은 학생이 직접 괄호 안에 쓰세요/,
  );
  assert.match(
    workbook,
    /해설에는 괄호를 쓰지 말고 시간·장소·상황을 적으세요/,
  );
  assert.match(workbook, /한 줄 이야기/);
  assert.match(workbook, /구성 방식/);
  assert.match(workbook, /이야기 소재/);
  assert.match(workbook, /핵심 인물/);
  assert.match(workbook, /주요 갈등/);
  assert.match(workbook, /실패하면 생기는 일/);
  assert.match(workbook, /"위기"/);
  assert.match(workbook, /"절정"/);
  assert.match(workbook, /인물 설정/);
  assert.match(workbook, /배경·세계 설정/);
  assert.match(workbook, /아직 정하지 못한 것/);
  assert.match(workbook, /이 장의 화자/);
  assert.match(workbook, /컷 역할/);
  assert.match(workbook, /\["화자 이름"\]/);
  assert.doesNotMatch(workbook, /\["사용",\s*"화자 이름"\]/);
  assert.doesNotMatch(studio, /saveProjectToGoogleSheet/);

  const listenerRule =
    globals.match(/\.stage-character\.listener\s*\{([^}]*)\}/)?.[1] ?? "";
  assert.ok(listenerRule, "말하지 않는 캐릭터 표시 규칙이 없습니다.");
  assert.doesNotMatch(
    listenerRule,
    /scale\(/,
    "화자가 바뀔 때 캐릭터 크기가 달라지면 안 됩니다.",
  );

  const assetDeclaration = storyAssets.indexOf("export const STORY_ASSETS");
  const assetJsonStart = storyAssets.indexOf("= [", assetDeclaration) + 2;
  const assetJsonEnd = storyAssets.lastIndexOf("];");
  const parsedAssets = JSON.parse(
    storyAssets.slice(assetJsonStart, assetJsonEnd + 1),
  );
  const originalRabbitTurtleAssets = parsedAssets.filter(
    (asset) =>
      asset.story === "토끼와 자라" && asset.usage === "원작 사용",
  );
  assert.equal(
    originalRabbitTurtleAssets.filter((asset) => asset.type === "character")
      .length,
    7,
  );
  assert.equal(
    originalRabbitTurtleAssets.filter((asset) => asset.type === "background")
      .length,
    9,
  );
  assert.ok(
    parsedAssets
      .filter(
        (asset) =>
          asset.story === "토끼와 자라" && asset.type === "character",
      )
      .every((asset) => asset.framing === "전신"),
  );
  const recommendedAssets = parsedAssets.filter(
    (asset) => asset.selectionTier === "기본 추천",
  );
  assert.equal(recommendedAssets.length, 49);
  assert.equal(
    recommendedAssets.filter(
      (asset) => asset.story === "토끼와 자라" && asset.type === "character",
    ).length,
    7,
  );
  assert.equal(
    recommendedAssets.filter(
      (asset) => asset.story === "토끼와 자라" && asset.type === "background",
    ).length,
    12,
  );
  assert.equal(
    recommendedAssets.filter(
      (asset) => asset.story === "옹고집전" && asset.type === "character",
    ).length,
    23,
  );
  assert.equal(
    recommendedAssets.filter(
      (asset) => asset.story === "옹고집전" && asset.type === "background",
    ).length,
    7,
  );
  assert.ok(
    parsedAssets
      .filter((asset) => asset.selectionTier === "기본 추천")
      .every(
        (asset) =>
          asset.framing !== "상반신" &&
          asset.framing !== "여러 인물" &&
          !asset.sourcePath.includes("_cg_"),
      ),
  );
  assert.doesNotMatch(
    storyData,
    /rabbit-turtle\.character\.rabbit-(?:suspicious|thinking|shocked)/,
  );
  assert.doesNotMatch(
    storyData,
    /onggojib\.background\.(?:court-child-choice|exiled-mirror|reconciliation)/,
  );

  const catalogAssetIds = new Set(
    [...storyAssets.matchAll(/"id":\s*"([^"]+)"/g)].map((match) => match[1]),
  );
  const parsedAssetById = new Map(
    parsedAssets.map((asset) => [asset.id, asset]),
  );
  const templateAssetIds = new Set(
    [
      ...storyData.matchAll(
        /"((?:rabbit-turtle|onggojib)\.(?:character|background)\.[^"]+)"/g,
      ),
    ].map((match) => match[1]),
  );

  for (const assetId of templateAssetIds) {
    assert.ok(
      catalogAssetIds.has(assetId),
      `템플릿 이미지가 자료 목록에 없습니다: ${assetId}`,
    );
    assert.equal(
      parsedAssetById.get(assetId)?.selectionTier,
      "기본 추천",
      `기본 작품과 템플릿은 엄선한 이미지만 사용해야 합니다: ${assetId}`,
    );
  }

  const catalogSources = [
    ...storyAssets.matchAll(/"src":\s*"([^"]+)"/g),
  ].map((match) => match[1]);
  for (const source of catalogSources) {
    await access(new URL(`../public${source}`, import.meta.url));
  }
});

test("G4-01: 가져오기 오류 및 미리보기 다이얼로그는 위치·고치는 법·작품 요약을 정확히 제공한다", async () => {
  const [importDialogSource, globalsSource] = await Promise.all([
    readFile(new URL("../app/components/ImportPreviewDialog.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  // 오류 다이얼로그 요소 검증
  assert.match(importDialogSource, /ImportIssuesDialog/);
  assert.match(importDialogSource, /치명 오류/);
  assert.match(importDialogSource, /확인 필요/);
  assert.match(importDialogSource, /고치는 법:/);
  assert.match(importDialogSource, /Google 시트 안내/);
  assert.match(importDialogSource, /Microsoft\s*Excel\(\.xlsx\)/);
  assert.match(importDialogSource, /label="가져오기 검사 결과"/);

  // 미리보기 다이얼로그 요소 검증
  assert.match(importDialogSource, /ImportConfirmationDialog/);
  assert.match(importDialogSource, /새 작품을 열까요\?/);
  assert.match(importDialogSource, /작품 제목/);
  assert.match(importDialogSource, /장\(場\) 수/);
  assert.match(importDialogSource, /컷\(Cut\) 수/);
  assert.match(importDialogSource, /창작 메모/);
  assert.match(importDialogSource, /취소 \(현재 작업 유지\)/);
  assert.match(importDialogSource, /편집본으로 열기/);

  // CSS 스타일 클래스 검증
  assert.match(globalsSource, /\.import-dialog/);
  assert.match(globalsSource, /\.import-issues-list/);
  assert.match(globalsSource, /\.import-issue-card\.error/);
  assert.match(globalsSource, /\.import-issue-card\.warning/);
  assert.match(globalsSource, /\.import-preview-summary/);
  assert.match(globalsSource, /\.import-sheet-advice/);
});

test("U1-07: 세 무대가 읽기 전용 인물 렌더러와 이미지 실패 처리를 공유한다", async () => {
  const sources = await Promise.all(["SceneThumbnail", "SceneFocusEditor", "StoryPlayer", "StoryStage"].map(name =>
    readFile(new URL(`../app/components/${name}.tsx`, import.meta.url), "utf8")));
  for (const source of sources.slice(0, 3)) {
    assert.match(source, /<StoryStageCanvas/);
    assert.doesNotMatch(source, /backgroundImage:/);
  }
  assert.match(sources[3], /onError=\{\(\) => setFailed\(true\)\}/);
  assert.match(sources[3], /story-stage-missing/);
  assert.match(sources[3], /story-stage-background-error/);
  assert.match(sources[3], /<StoryStageCharacter/);
  assert.match(sources[3], /<StoryStageBackground/);
  assert.match(sources[3], /variant === "thumbnail" \? "lazy" : "eager"/);
  assert.match(sources[3], /decoding="async"/);
  assert.match(sources[3], /loading=\{loading\}/);
  assert.doesNotMatch(sources[3], /onUpdateLine|setDraft|onIndexChange/);
});

test("U1-08: 같은 컷 왕복과 이미지 미리보기·적용·취소 계약을 분리한다", async () => {
  const [studio, script, sceneFocus, assetPicker, location, globals] =
    await Promise.all([
      readFile(new URL("../app/StoryStudio.tsx", import.meta.url), "utf8"),
      readFile(new URL("../app/components/ScriptScreen.tsx", import.meta.url), "utf8"),
      readFile(new URL("../app/components/SceneFocusEditor.tsx", import.meta.url), "utf8"),
      readFile(new URL("../app/components/AssetPickerButton.tsx", import.meta.url), "utf8"),
      readFile(new URL("../app/story-editor-location.ts", import.meta.url), "utf8"),
      readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    ]);

  assert.match(script, /script-selected-stage/);
  assert.match(script, /이 장 대본/);
  assert.match(sceneFocus, /\["text", "글"\]/);
  assert.match(sceneFocus, /\["left", "왼쪽 이미지"\]/);
  assert.match(sceneFocus, /\["right", "오른쪽 이미지"\]/);
  assert.match(sceneFocus, /\["background", "배경"\]/);
  assert.match(sceneFocus, /같은 .*의 표정·동작/);
  assert.match(sceneFocus, /전체 자료에서 찾기/);
  assert.match(sceneFocus, /장의 기본으로/);
  assert.match(sceneFocus, /이 컷에 사용/);
  assert.match(sceneFocus, /previewLine/);
  assert.match(sceneFocus, /onUpdateLine\(selectedLine\.id/);
  assert.doesNotMatch(sceneFocus, /className="scene-image-dropdowns"/);

  assert.match(assetPicker, /pendingAssetId/);
  assert.match(assetPicker, /선택 미리보기/);
  assert.match(assetPicker, /onSelect\(pendingAssetId\)/);
  assert.match(assetPicker, /openedContextRef\.current !== selectionContextKey/);
  assert.match(assetPicker, /event\.key !== "Tab"/);
  assert.match(assetPicker, /openerRef\.current\?\.focus/);
  assert.doesNotMatch(assetPicker, /onSelect\(asset\.id\)/);

  assert.match(studio, /currentLineBodySelection/);
  assert.match(studio, /chapterViewportRef\.current/);
  assert.match(studio, /selection: currentLineBodySelection/);
  assert.match(studio, /clampStoryEditorTextSelection/);
  assert.match(location, /function clampStoryEditorTextSelection/);
  assert.match(globals, /\.scene-focus-tabs/);
  assert.match(globals, /@media \(max-height: 620px\)/);
});

test("G4-02: 이미지 지연 로딩, 비동기 디코딩 및 플레이어 선로딩 성능 최적화 검사", async () => {
  const [sceneThumbSource, assetPickerSource, storyPlayerSource] = await Promise.all([
    readFile(new URL("../app/components/SceneThumbnail.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/AssetPickerButton.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/StoryPlayer.tsx", import.meta.url), "utf8"),
  ]);

  // AssetPreview 비동기 디코딩 및 지연 로딩 지원 검증
  assert.match(sceneThumbSource, /decoding="async"/);
  assert.match(sceneThumbSource, /loading=\{loading\}/);

  // AssetPicker 비동기 디코딩 및 지연 로딩 검증
  assert.match(assetPickerSource, /loading="lazy"/);
  assert.match(assetPickerSource, /decoding="async"/);

  // StoryPlayer 다음 컷 선로딩 및 즉시 렌더링 검증
  assert.match(storyPlayerSource, /다음 컷 자산 선로딩/);
  assert.match(storyPlayerSource, /<StoryStageCanvas stage=\{stage\} variant="player"/);
});

test("G4-03: 키보드 조작·Escape·포커스 트랩 및 접근성 마감 검사", async () => {
  const [modalDialogSource, storyPlayerSource, globalsSource] = await Promise.all([
    readFile(new URL("../app/components/ModalDialog.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/StoryPlayer.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  // ModalDialog Escape 및 Tab 포커스 트랩·복귀 검증
  assert.match(modalDialogSource, /event\.key === "Escape"/);
  assert.match(modalDialogSource, /event\.key === "Tab"/);
  assert.match(modalDialogSource, /previousFocusRef\.current/);
  assert.match(modalDialogSource, /role="dialog"/);
  assert.match(modalDialogSource, /aria-modal="true"/);

  // StoryPlayer 키보드 조작(ArrowRight/Space/ArrowLeft/Escape) 검증
  assert.match(storyPlayerSource, /event\.key === "ArrowRight"/);
  assert.match(storyPlayerSource, /event\.key === "ArrowLeft"/);
  assert.match(storyPlayerSource, /event\.key === "Escape"/);

  // prefers-reduced-motion 미디어 쿼리 검증
  assert.match(globalsSource, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
});

test("U1-03: 공통 셸은 세 단계·저장 상태·적용 행동과 접근성 토큰을 한 계약으로 유지한다", async () => {
  const [studio, studioShell, modalDialog, globals] = await Promise.all([
    readFile(new URL("../app/StoryStudio.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/StudioShell.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/ModalDialog.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  const primaryNav = studioShell
    .split("export function StudioPrimaryNav")[1]
    .split("export function StudioApplyDock")[0];
  assert.equal(primaryNav.match(/<button\b/g)?.length, 3);
  assert.match(primaryNav, /aria-current=/);
  assert.match(primaryNav, /이야기 구성/);
  assert.match(primaryNav, /대본·컷 쓰기/);
  assert.match(primaryNav, /마지막으로 적용한 버전을 확인해요/);
  assert.match(studioShell, /메인으로/);
  assert.match(studioShell, /aria-live="polite"/);
  assert.match(studioShell, /save-state-\$\{saveStatus\}/);
  assert.match(studioShell, /aria-controls="studio-project-tools"/);
  assert.equal(studio.match(/<StudioPrimaryNav\b/g)?.length, 1);
  assert.equal(studio.match(/<StudioApplyDock\b/g)?.length, 1);

  for (const token of [
    "--studio-shell",
    "--studio-bg",
    "--studio-surface",
    "--studio-ink",
    "--studio-muted",
    "--studio-border",
    "--studio-control-border",
    "--studio-accent",
    "--studio-selected-border",
    "--studio-selected-bg",
    "--studio-danger",
  ]) {
    assert.match(globals, new RegExp(`${token}:`));
  }
  assert.match(
    globals,
    /\.creator-header \.save-state\s*\{[^}]*display:\s*inline-flex/s,
  );
  assert.match(globals, /@media \(max-height: 720px\)/);
  assert.match(globals, /\.creator-shell :is\(button, a, input, select, textarea\):focus-visible/);

  const luminance = (hex) => {
    const channels = hex
      .match(/[0-9a-f]{2}/gi)
      .map((value) => Number.parseInt(value, 16) / 255)
      .map((value) =>
        value <= 0.04045
          ? value / 12.92
          : ((value + 0.055) / 1.055) ** 2.4,
      );
    return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
  };
  const contrast = (foreground, background) => {
    const first = luminance(foreground);
    const second = luminance(background);
    return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
  };
  assert.ok(contrast("#142033", "#ffffff") >= 4.5);
  assert.ok(contrast("#526174", "#ffffff") >= 4.5);
  assert.ok(contrast("#ffffff", "#006d77") >= 4.5);
  assert.ok(contrast("#738197", "#ffffff") >= 3);
  assert.ok(contrast("#c76a00", "#ffffff") >= 3);

  assert.match(modalDialog, /onCloseRef/);
  assert.match(modalDialog, /previousFocusRef\.current\.isConnected/);
  assert.match(modalDialog, /tabIndex=\{-1\}/);
});

test("G4-04: 교실 파일럿 보고서는 실제 증거와 내부 QA를 구분한다", async () => {
  const pilotReport = await readFile(
    new URL("../docs/qa/classroom-pilot-report.md", import.meta.url),
    "utf8",
  );

  assert.match(pilotReport, /교실 파일럿 준비용 내부 QA 보고서/);
  assert.match(pilotReport, /실제 학생 대상 파일럿이 아닌/);
  assert.match(pilotReport, /실제 교실 파일럿 미실행/);
  assert.match(pilotReport, /개인정보 보호 원칙/);
  assert.match(pilotReport, /Top 3 Issues/);
  assert.doesNotMatch(pilotReport, /과제 완수율.*100%/);
});

test("G5-03: 학생에게 보이는 창작 용어와 주요 조작 크기를 장·컷 기준으로 유지한다", async () => {
  const [
    studio,
    plan,
    memoPopup,
    memoEditor,
    resources,
    memoCommands,
    revisionCycle,
    globals,
  ] = await Promise.all([
    readFile(new URL("../app/StoryStudio.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/StoryPlanScreen.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/MemoPopup.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/CreativeMemoEditor.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/ResourceWidgets.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/creative-memo-commands.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/story-revision-cycle.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  for (const source of [
    studio,
    plan,
    memoPopup,
    memoEditor,
    resources,
    memoCommands,
    revisionCycle,
  ]) {
    assert.doesNotMatch(source, /챕터|장면/);
  }
  assert.match(studio, /장 \$\{updated\.chapters\.length\}개 · 컷 \$\{updated\.lines\.length\}개/);
  assert.match(memoPopup, /현재 장/);
  assert.match(memoPopup, /현재 컷/);
  assert.match(globals, /G5: 학생 창작 조작 접근성/);
  assert.match(globals, /min-height: 44px/);
});

test("U1-05: 단일 장 목록·반응형 선택 상세에서도 G6 다중 단계 연결을 보존한다", async () => {
  const [plan, globals] = await Promise.all([
    readFile(new URL("../app/components/StoryPlanScreen.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  // G6-03: 다중 단계 선택기
  assert.match(plan, /chapter-stage-picker/);
  assert.match(plan, /stage-select-button/);
  assert.match(plan, /aria-pressed=\{isSelected\}/);
  assert.match(globals, /\.stage-select-button/);
  assert.match(globals, /\.creator-shell \.stage-select-button/);

  // U1-05 supersedes the duplicated matrix/cards, not the multi-stage contract.
  assert.doesNotMatch(plan, /chapter-stage-matrix|planning-view-switch/);
  assert.match(plan, /chapter-plan-selector/);
  assert.match(plan, /plan-chapter-item/);
  assert.match(plan, /formatStoryStageLabels\(chapter.storyStageKeys/);
  assert.match(plan, /plan-project-details/);
  assert.match(plan, /plan-chapter-details/);
  assert.match(plan, /value=\{selectedChapter.summary\}/);
  assert.match(plan, /value=\{selectedChapter.purpose\}/);
  assert.match(plan, /value=\{selectedChapter.keyEvents\}/);
  assert.match(plan, /value=\{selectedChapter.nextChapterIdea\}/);
  assert.match(plan, /chapter-flow-guidance/);
  assert.match(globals, /\.plan-split-layout/);
  assert.match(globals, /\.chapter-plan-selector/);
});

test("G6-05: 대본·장면·메모·고쳐쓰기에 장의 다중 단계 연결이 반영된다", async () => {
  const [script, sceneFocus, memoPopup, revisionCheck, globals] = await Promise.all([
    readFile(new URL("../app/components/ScriptScreen.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/SceneFocusEditor.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/MemoPopup.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/components/StoryRevisionCheck.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  // 대본 화면에서 formatStoryStageLabels 및 script-stage-indicator 표시
  assert.match(script, /formatStoryStageLabels/);
  assert.match(script, /script-stage-indicator/);
  assert.match(globals, /\.script-stage-indicator/);

  // 장면 포커스 편집기에서 장 단계 라벨 표시
  assert.match(sceneFocus, /formatStoryStageLabels/);

  // 메모 팝업에서 현재 장 단계 라벨 표시
  assert.match(memoPopup, /formatStoryStageLabels/);

  // 고쳐쓰기 자기 점검에서 미연결 단계 힌트 및 notice 표시
  assert.match(revisionCheck, /getUnlinkedStagesAndChapters/);
  assert.match(revisionCheck, /revision-stage-notice/);
  assert.match(globals, /\.revision-stage-notice/);
});
