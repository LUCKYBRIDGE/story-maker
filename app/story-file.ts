import { createBlankProject, cloneProject, type StoryProject } from "./story-data";
import { STORY_ASSETS } from "./story-assets";
import { createStoryDocument, parseStoryDocument, isStrictIsoUtcTimestamp, type StoryDocumentEnvelope } from "./story-project-document";
import { STORY_PROJECT_APP_VERSION } from "./story-project-repository";
import type { ProjectEntry } from "./story-project-collection";
import { findStoryFlowIssues } from "./story-flow";

export const NOLSTORY_MIME = "application/vnd.nolstory+json";
export const MAX_NOLSTORY_BYTES = 10 * 1024 * 1024;
type Manifest = { format: "nolstory"; version: 1; kind: "project" | "shared"; exportedAt: string; appVersion: string };
type AssetReference = { kind: "builtin"; id: string };
export type NolstoryProjectFile = { manifest: Manifest & { kind: "project" }; assets: AssetReference[]; draft: StoryDocumentEnvelope; playback: StoryDocumentEnvelope | null };
export type NolstorySharedFile = { manifest: Manifest & { kind: "shared" }; assets: AssetReference[]; story: StoryDocumentEnvelope; sharing: { allowRemix: boolean; authorDisplayName: string } };
export type NolstoryFile = NolstoryProjectFile | NolstorySharedFile;
export type StoryFileResult = { ok: true; file: NolstoryFile } | { ok: false; message: string };
const record = (value: unknown): value is Record<string, unknown> => !!value && typeof value === "object" && !Array.isArray(value);
const failure = (message: string): StoryFileResult => ({ ok: false, message });

function references(projects: StoryProject[]): AssetReference[] {
  const refs = new Map<string, "character" | "background">();
  function add(id: string | undefined, type: "character" | "background") {
    if (!id) return;
    if (!STORY_ASSETS.some(asset => asset.id === id && asset.type === type)) throw new Error(`지원하지 않는 이미지 참조예요: ${id}. 내장 이미지를 선택한 뒤 다시 보관해 주세요.`);
    refs.set(id, type);
  }
  for (const project of projects) {
    for (const stage of [...project.chapters, ...project.lines]) {
      add(stage.backgroundId, "background"); add(stage.leftAssetId, "character"); add(stage.rightAssetId, "character");
    }
    for (const chapter of project.chapters) {
      chapter.characterAssetIds.forEach(id => add(id, "character"));
      chapter.backgroundAssetIds.forEach(id => add(id, "background"));
    }
    add(project.cover?.backgroundId, "background"); add(project.cover?.characterId, "character");
  }
  return [...refs.keys()].sort().map(id => ({ kind: "builtin", id }));
}

export function parseNolstoryFile(text: string): StoryFileResult {
  if (new TextEncoder().encode(text).byteLength > MAX_NOLSTORY_BYTES) return failure("파일은 10MB 이하로 열 수 있어요.");
  try {
    const value: unknown = JSON.parse(text);
    if (!record(value) || !record(value.manifest)) return failure("놀스토리 파일의 안내 정보를 찾지 못했어요.");
    const manifest = value.manifest;
    const rootFields = manifest.kind === "project" ? ["manifest", "assets", "draft", "playback"] : ["manifest", "assets", "story", "sharing"];
    if (Object.keys(value).some(key => !rootFields.includes(key)) || Object.keys(manifest).some(key => !["format", "version", "kind", "exportedAt", "appVersion"].includes(key))) return failure("지원하지 않는 첨부 파일이나 경로 정보가 있어요.");
    if (manifest.format !== "nolstory" || manifest.version !== 1 || !["project", "shared"].includes(String(manifest.kind)) || typeof manifest.exportedAt !== "string" || !isStrictIsoUtcTimestamp(manifest.exportedAt) || typeof manifest.appVersion !== "string") return failure("지원하지 않는 놀스토리 파일 버전이나 종류예요.");
    const load = (data: unknown) => {
      const result = parseStoryDocument(data);
      if (!result.ok || result.source !== "current") throw new Error("작품 데이터 형식을 확인하지 못했어요. 파일을 바꾸지 말고 원래 기기에서 다시 보관해 주세요.");
      return result.document;
    };
    let file: NolstoryFile;
    if (manifest.kind === "project") {
      const draft = load(value.draft);
      const playback = value.playback === null ? null : load(value.playback);
      if (playback && playback.project.id !== draft.project.id) return failure("편집본과 플레이 버전의 작품 ID가 달라요.");
      file = { manifest: manifest as NolstoryProjectFile["manifest"], draft, playback, assets: [] };
    } else {
      const story = load(value.story);
      if (!record(value.sharing) || typeof value.sharing.allowRemix !== "boolean" || typeof value.sharing.authorDisplayName !== "string") return failure("공유 작품의 고쳐쓰기 허용 정보를 확인하지 못했어요.");
      if (!story.project.lines.length || findStoryFlowIssues(story.project).length) return failure("공유 작품의 읽을 컷과 연결을 확인해 주세요.");
      file = { manifest: manifest as NolstorySharedFile["manifest"], story, sharing: { allowRemix: value.sharing.allowRemix, authorDisplayName: value.sharing.authorDisplayName }, assets: [] };
    }
    const expected = references(file.manifest.kind === "project" && "draft" in file
      ? [file.draft.project, ...(file.playback ? [file.playback.project] : [])] : [(file as NolstorySharedFile).story.project]);
    if (!Array.isArray(value.assets) || value.assets.some(asset => !record(asset) || asset.kind !== "builtin" || typeof asset.id !== "string" || Object.keys(asset).some(key => !["kind", "id"].includes(key)))) return failure("지원하지 않는 이미지나 파일 경로가 있어요. 현재는 내장 이미지 참조만 지원해요.");
    const supplied = value.assets.map(asset => (asset as AssetReference).id).sort();
    if (JSON.stringify(supplied) !== JSON.stringify(expected.map(asset => asset.id))) return failure("작품의 이미지 목록이 실제 참조와 맞지 않아요.");
    file.assets = expected;
    return { ok: true, file };
  } catch (error) {
    return failure(error instanceof SyntaxError ? "파일 내용을 읽지 못했어요. 정상적인 .nolstory 파일인지 확인해 주세요." : error instanceof Error ? error.message : "파일을 열지 못했어요.");
  }
}

export function createNolstoryProject(entry: ProjectEntry, now = new Date().toISOString()): NolstoryProjectFile {
  return { manifest: { format: "nolstory", version: 1, kind: "project", exportedAt: now, appVersion: STORY_PROJECT_APP_VERSION },
    draft: structuredClone(entry.draft), playback: structuredClone(entry.playback), assets: references([entry.draft.project, ...(entry.playback ? [entry.playback.project] : [])]) };
}
export function createNolstoryShared(project: StoryProject, allowRemix = false, now = new Date().toISOString()): NolstorySharedFile {
  // Shared files contain the reading version, not private planning or editing notes.
  project = cloneProject(project);
  project.planning = { ...createBlankProject().planning, structureMode: project.planning.structureMode };
  project.creativeMemos = []; project.sheetUrl = ""; project.sheetEditable = false;
  project.chapters = project.chapters.map(chapter => ({ ...chapter, summary: "", purpose: "", mood: "", keyEvents: "", nextChapterIdea: "" }));
  project.lines = project.lines.map(line => ({ ...line, purposeNote: "", emotionNote: "", directionNote: "" }));
  return { manifest: { format: "nolstory", version: 1, kind: "shared", exportedAt: now, appVersion: STORY_PROJECT_APP_VERSION },
    story: createStoryDocument({ project, savedAt: now, appVersion: STORY_PROJECT_APP_VERSION }),
    assets: references([project]), sharing: { allowRemix, authorDisplayName: project.cover?.author ?? "" } };
}
export function encodeNolstoryFile(file: NolstoryFile): string {
  const text = JSON.stringify(file);
  const parsed = parseNolstoryFile(text);
  if (!parsed.ok) throw new Error(parsed.message);
  return text;
}
export async function readNolstoryFile(file: File): Promise<StoryFileResult> {
  if (!file.name.toLowerCase().endsWith(".nolstory")) return failure(".nolstory 파일을 선택해 주세요.");
  if (file.size > MAX_NOLSTORY_BYTES) return failure("파일은 10MB 이하로 열 수 있어요.");
  if (file.type && ![NOLSTORY_MIME, "application/json", "application/octet-stream", "text/plain"].includes(file.type)) return failure("놀스토리 파일 형식이 아니에요.");
  try { return parseNolstoryFile(await file.text()); } catch { return failure("파일을 읽지 못했어요. 다시 선택해 주세요."); }
}
export function downloadNolstoryFile(file: NolstoryFile, title: string) {
  const blob = new Blob([encodeNolstoryFile(file)], { type: NOLSTORY_MIME });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${(title || "제목 없는 이야기").replace(/[\\/:*?"<>|\u0000-\u001f]/g,"_").slice(0,80)}-${file.manifest.kind}.nolstory`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
