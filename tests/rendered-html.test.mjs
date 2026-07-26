import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

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
  assert.match(html, /웹에서 새 작품/);
  assert.match(html, /Excel 파일 열기/);
  assert.match(html, /Google 시트 불러오기/);
  assert.match(html, /이어쓰기 템플릿/);
  assert.match(html, /토끼와 자라 템플릿 1 · 땅에서 만난 뒤/);
  assert.match(html, /자라는 토끼를 어떻게 용궁으로 데려갈까요/);
  assert.match(html, /토끼와 자라 템플릿 2 · 용궁에 묶인 토끼/);
  assert.match(html, /결박된 토끼는 어떻게 위기를 벗어날까요/);
  assert.match(html, /예시 작품 먼저 플레이/);
  assert.doesNotMatch(html, /Google로 시작하기/);
  assert.doesNotMatch(html, /Your site is taking shape|Building your site/);
});

test("화자·이미지·외부 자료가 분리된 편집 도구로 유지된다", async () => {
  const [studio, storyData, storyAssets, workbook] = await Promise.all([
    readFile(new URL("../app/StoryStudio.tsx", import.meta.url), "utf8"),
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
  assert.match(storyData, /자라가 토끼를 설득하는 첫 말을 직접 써 보세요/);
  assert.match(storyData, /결박된 토끼가 살아남기 위해 하는 첫 말을 직접 써 보세요/);
  assert.match(studio, /function AddSpeaker/);
  assert.match(studio, /\+ 화자 추가/);
  assert.match(studio, /화자 이름/);
  assert.match(studio, /이미지 선택/);
  assert.match(studio, /\+ 자료 추가/);
  assert.match(studio, /asset-picker-grid/);
  assert.match(studio, /스토리 구상/);
  assert.match(studio, /전체 이야기 구성/);
  assert.match(studio, /챕터 흐름 구성/);
  assert.match(studio, /이야기 나침반/);
  assert.match(studio, /이야기 소재/);
  assert.match(studio, /실패하면 어떤 일이 생기나요/);
  assert.match(studio, /발단 → 전개 → 위기 → 절정 → 결말/);
  assert.match(studio, /발단 → 전개 → 위기 → 결말/);
  assert.match(studio, /처음 → 중간 → 끝/);
  assert.match(studio, /이야기 구성 방식/);
  assert.match(studio, /구성 점검/);
  assert.match(studio, /아이디어 보관함/);
  assert.match(studio, /구상 다듬기/);
  assert.match(studio, /챕터 전체 편집/);
  assert.match(studio, /현재 장면 편집/);
  assert.match(studio, /편집할 때만 보는/);
  assert.match(studio, /현재 편집/);
  assert.match(studio, /즐겨찾기/);
  assert.match(studio, /최근 사용/);
  assert.match(studio, /태그 모두 지우기/);
  assert.match(studio, /Excel 파일 열기/);
  assert.match(studio, /Excel로 저장/);
  assert.match(studio, /시트에서 불러오기/);
  assert.match(studio, /빈 작품 시작/);
  assert.match(studio, /function startRabbitTurtleContinuation1/);
  assert.match(studio, /function startRabbitTurtleContinuation2/);
  assert.match(studio, /시작할 곳: 자라의 첫 설득/);
  assert.match(studio, /시작할 곳: 토끼의 첫 대응/);
  assert.match(studio, /처음부터 읽고 고치기/);
  assert.match(studio, /이어 쓸 곳으로/);
  assert.match(studio, /function moveThroughStory/);
  assert.match(studio, /화자·이미지·장면 설정/);
  assert.match(studio, /놀퀴즈_스토리_템플릿\.xlsx/);
  assert.match(studio, /방금 전으로 복구/);
  assert.match(storyAssets, /tags:\s*string\[\]/);
  assert.match(workbook, /downloadStoryWorkbook/);
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
});
