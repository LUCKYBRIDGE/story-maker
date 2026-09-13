import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = path => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("U2-02: 컷 편집·대본 미리보기·플레이는 같은 프레임/배경/화자 강조를 사용한다", async () => {
  const frame = await source("app/components/StoryStage.tsx");
  for (const name of ["StoryPlayer", "SceneFocusEditor", "ScriptScreen"]) {
    const component = await source(`app/components/${name}.tsx`);
    assert.match(component, /<StorySceneFrame/);
    assert.match(component, /speaker=\{/);
    assert.doesNotMatch(component, /backgroundImage:/);
  }
  assert.match(frame, /loading="eager" decorative/);
  assert.doesNotMatch(frame, /showBackground=\{false\}/);
  assert.match(frame, /variant !== "thumbnail" && speaker === "right"/);
  assert.match(frame, /variant !== "thumbnail" && speaker === "left"/);
  assert.doesNotMatch(frame, /setDraft|onUpdateLine|onIndexChange/);
});

test("U2-02: 해설도 남색 창에서 읽히며 본문은 고정 높이로 자르지 않는다", async () => {
  const css = await source("app/globals.css");
  const frameStyles = css.slice(css.indexOf("/* U2-02:"));
  assert.match(frameStyles, /\.story-scene-frame \.dialogue-box \.narration-copy \{ color: #f8fafc;/);
  assert.match(frameStyles, /background: rgb\(15 23 42 \/ 96%\)/);
  assert.match(frameStyles, /position: relative;\s+inset: auto;/);
  assert.match(frameStyles, /field-sizing: content/);
  assert.match(frameStyles, /overflow-y: auto/);
  assert.doesNotMatch(frameStyles, /line-clamp|text-overflow:\s*ellipsis/);
  assert.match(css, /\.dialogue-copy,[\s\S]*?max-height: none;[\s\S]*?white-space: pre-wrap;/);
});

test("U2-02: 모바일 보조 정보는 펼칠 수 있고 Landing은 서재 진입만 제공한다", async () => {
  const [studio, entry, css, editor] = await Promise.all([
    source("app/StoryStudio.tsx"), source("app/components/StartScreen.tsx"),
    source("app/globals.css"), source("app/components/SceneFocusEditor.tsx"),
  ]);
  assert.match(studio, /mobileEditorToolsOpen \? "mobile-context-open"/);
  assert.match(studio, /aria-expanded=\{mobileEditorToolsOpen\}/);
  assert.match(css, /@media \(max-width: 620px\)[\s\S]*?\.making-workspace:not\(\.mobile-context-open\) \.chapter-context-strip/);
  assert.match(editor, /draft.continuation\?\.lineId === selectedLine.id/);
  assert.match(editor, /orderedDraftLines\[selectedStoryLineIndex - 1\].text/);
  assert.match(entry, /onOpenLibrary/);
  assert.match(entry, /onOpenMyStories/);
  assert.doesNotMatch(entry, /role="tablist"|type="file"/);
  assert.doesNotMatch(css, /\.making-toolbar:not\(\.mobile-open\) \.editor-mode-switch,/);
});

test("U2-02: 플레이 복귀 시 이중 rAF로 ref를 안전하게 복원하고, 모바일 비활성 컷 가이드를 정리한다", async () => {
  const [studio, css] = await Promise.all([
    source("app/StoryStudio.tsx"), source("app/globals.css"),
  ]);
  // 이중 rAF 적용 확인
  assert.match(studio, /let secondFrame: number \| null = null;/);
  assert.match(studio, /secondFrame = window\.requestAnimationFrame/);
  // non-secure fallback ID 생성 확인
  assert.match(studio, /typeof crypto !== "undefined" && typeof crypto\.randomUUID === "function"/);
  // 모바일 비활성 컷 가이드 숨김 확인
  assert.match(css, /\.script-scene-card:not\(\.active\):not\(:focus-within\) \.cut-length-guide:not\(\.over-limit\) \{ display: none; \}/);
  // 버튼 active 피드백 확인
  assert.match(css, /\.cut-length-guide button:active/);
});
