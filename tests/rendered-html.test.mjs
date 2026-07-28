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
  assert.match(html, /새 작품 만들기/);
  assert.match(html, /Excel 작품 불러오기/);
  assert.match(html, /Google 시트에서 불러오기/);
  assert.match(html, /이어쓰기 템플릿/);
  assert.match(html, /토끼와 자라 템플릿 1 · 땅에서 만난 뒤/);
  assert.match(html, /자라는 토끼를 어떻게 용궁으로 데려갈까요/);
  assert.match(html, /토끼와 자라 템플릿 2 · 용궁에 묶인 토끼/);
  assert.match(html, /결박된 토끼는 어떻게 위기를 벗어날까요/);
  assert.match(html, /옹고집전 템플릿 1 · 아내의 선택 이후/);
  assert.match(
    html,
    /가짜 옹고집을 선택한 뒤, 관아와 가족에게 어떤 일이/,
  );
  assert.match(html, /준비된 내용:\s*가족의 변화·두 옹고집의 관아 다툼/);
  assert.match(html, /예시 작품 먼저 플레이/);
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
      "챕터 흐름",
      "챕터 자료",
      "화자",
      "장면",
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
});

test("기본 예시와 세 이어쓰기 템플릿은 끊김 없는 챕터 흐름을 제공한다", () => {
  const projectRoot = fileURLToPath(new URL("../", import.meta.url));
  const output = execFileSync(
    process.execPath,
    [
      "--disable-warning=ExperimentalWarning",
      "--experimental-strip-types",
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
  const [studio, globals, storyData, storyAssets, workbook] = await Promise.all([
    readFile(new URL("../app/StoryStudio.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../app/story-data.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/story-assets.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/story-workbook.ts", import.meta.url), "utf8"),
  ]);

  assert.match(storyData, /speakerNames:\s*string\[\]/);
  assert.match(storyData, /planning:\s*StoryPlanning/);
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
  assert.match(studio, /한 챕터에는 한 가지 중요한 변화를 담고/);
  assert.match(studio, /function chapterArcLabel/);
  assert.match(studio, /chapter-flow-stage/);
  assert.match(studio, /다음 챕터 ·/);
  assert.match(studio, /이번 챕터에서 달라지는 일/);
  assert.match(studio, /그 결과 다음에 생기는 일/);
  assert.match(studio, /대사를 이어 읽으며 써요/);
  assert.match(studio, /인물과 배경까지 꾸며요/);
  assert.match(studio, /장면 꾸미기/);
  assert.match(studio, /대본 전체/);
  assert.match(studio, /파일·복구/);
  assert.match(studio, /인물·배경·추가 메모/);
  assert.match(studio, /scene-more-actions/);
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
  assert.match(studio, /function shouldMirrorAsset/);
  assert.match(studio, /function assetPlacementClass/);
  assert.match(studio, /CHARACTER_FACING/);
  assert.match(studio, /function SceneStagingCopy/);
  assert.match(studio, /function copySceneStaging/);
  assert.match(studio, /다른 장면의 이미지 배치를 그대로 사용/);
  assert.match(studio, /원작 사용/);
  assert.match(studio, /추가 연출/);
  assert.match(studio, /기본 추천/);
  assert.match(studio, /추천 이미지/);
  assert.match(studio, /모든 이미지/);
  assert.match(studio, /전신/);
  assert.match(studio, /상반신/);
  assert.match(studio, /function AddSpeaker/);
  assert.match(studio, /\+ 화자 추가/);
  assert.match(studio, /화자 이름/);
  assert.match(studio, /이미지 선택/);
  assert.match(studio, /태그로 좁히기/);
  assert.match(studio, /검색·태그 초기화/);
  assert.match(studio, /다른 이미지 고르기/);
  assert.match(studio, /사용할 캐릭터 고르기/);
  assert.match(studio, /createPortal/);
  assert.match(studio, /document\.body/);
  assert.match(studio, /현재 장면에서 사용 중/);
  assert.match(studio, /currentValue/);
  assert.doesNotMatch(studio, /\+ 자료 추가/);
  assert.doesNotMatch(studio, /이미지는 이 창을 열었을 때만 보여요/);
  assert.match(studio, /asset-picker-grid/);
  assert.match(globals, /\.asset-picker-findbar/);
  assert.match(globals, /\.asset-picker-filter-toggle/);
  assert.match(globals, /\.asset-picker-result-summary/);
  assert.match(globals, /\.asset-picker-current/);
  assert.match(globals, /\.asset-picker-current-thumb\.background/);
  assert.match(studio, /이야기 구성/);
  assert.match(studio, /챕터 흐름/);
  assert.match(studio, /이야기 나침반/);
  assert.match(studio, /이야기 소재/);
  assert.match(studio, /실패하면 어떤 일이 생기나요/);
  assert.match(studio, /발단 → 전개 → 위기 → 절정 → 결말/);
  assert.match(studio, /발단 → 전개 → 위기 → 결말/);
  assert.match(studio, /처음 → 중간 → 끝/);
  assert.match(studio, /이야기 구성 방식/);
  assert.match(studio, /구성 점검/);
  assert.match(studio, /인물·배경·추가 메모/);
  assert.match(studio, /이 챕터 편집/);
  assert.match(studio, /대본 전체/);
  assert.match(studio, /장면 꾸미기/);
  assert.match(studio, /편집할 때만 보는/);
  assert.match(studio, /현재 편집/);
  assert.match(studio, /즐겨찾기/);
  assert.match(studio, /최근 사용/);
  assert.match(studio, /선택한 태그 지우기/);
  assert.match(studio, /Excel에서 불러오기/);
  assert.match(studio, /Excel로 저장/);
  assert.match(studio, /시트에서 불러오기/);
  assert.match(studio, /빈 작품 시작/);
  assert.match(studio, /function startRabbitTurtleContinuation1/);
  assert.match(studio, /function startRabbitTurtleContinuation2/);
  assert.match(studio, /시작할 곳:\s*자라의 첫 설득/);
  assert.match(studio, /시작할 곳:\s*토끼의 첫 대응/);
  assert.match(studio, /시작할 곳:\s*선택 뒤 첫 장면/);
  assert.match(studio, /처음부터 읽고 고치기/);
  assert.match(studio, /이어 쓸 곳으로/);
  assert.match(studio, /function moveThroughStory/);
  assert.match(studio, /화자·이미지·장면 설정/);
  assert.match(studio, /해설 · 이야기 설명/);
  assert.match(studio, /대사 · 인물이 말함/);
  assert.match(studio, /장면과 사건을 들려주는 글/);
  assert.match(studio, /narration-heading/);
  assert.match(studio, /function DialogueText/);
  assert.match(studio, /function DialogueInline/);
  assert.match(studio, /className="dialogue-speaker"/);
  assert.match(studio, /parenthetical-direction/);
  assert.doesNotMatch(
    studio,
    /speaker-name/,
    "화자 이름을 대사와 떨어진 배지로 표시하면 안 됩니다.",
  );
  assert.match(studio, /해설에는 괄호를 쓸 수 없어요/);
  assert.match(studio, /속마음·표정·행동은 학생이 직접/);
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
  assert.match(workbook, /이 챕터 화자/);
  assert.match(workbook, /장면 역할/);
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
    parsedAssets.some(
      (asset) =>
        asset.story === "토끼와 자라" &&
        asset.usage === "추가 연출" &&
        asset.framing === "상반신",
    ),
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
