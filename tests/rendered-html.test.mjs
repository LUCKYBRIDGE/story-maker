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

test("서버가 로그인 없는 이야기별 시작 화면을 렌더링한다", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>이야기별 · 스토리게임 스튜디오<\/title>/i);
  assert.match(html, /웹에서 새 작품/);
  assert.match(html, /Excel 파일 열기/);
  assert.match(html, /Google 시트 불러오기/);
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
  assert.match(storyData, /function createBlankProject/);
  assert.match(studio, /function SpeakerNameSelect/);
  assert.match(studio, /\+ 화자 추가/);
  assert.match(studio, /한 번 추가한 이름은 다른 장면에서도 계속 고를 수 있어요/);
  assert.match(studio, /고른 이미지의 파일명과는 관계없이 표시됩니다/);
  assert.match(studio, /그림으로 고르기/);
  assert.match(studio, /asset-picker-grid/);
  assert.match(studio, /대본 전체 보기/);
  assert.match(studio, /장면 자세히 편집/);
  assert.match(studio, /즐겨찾기/);
  assert.match(studio, /최근 사용/);
  assert.match(studio, /태그 모두 지우기/);
  assert.match(studio, /Excel 파일 열기/);
  assert.match(studio, /Excel로 저장/);
  assert.match(studio, /시트에서 불러오기/);
  assert.match(studio, /빈 작품 시작/);
  assert.match(studio, /이야기별_구글시트_템플릿\.xlsx/);
  assert.match(studio, /방금 전으로 복구/);
  assert.match(storyAssets, /tags:\s*string\[\]/);
  assert.match(workbook, /downloadStoryWorkbook/);
  assert.match(workbook, /\["화자 이름"\]/);
  assert.doesNotMatch(workbook, /\["사용",\s*"화자 이름"\]/);
  assert.doesNotMatch(studio, /saveProjectToGoogleSheet/);
});
