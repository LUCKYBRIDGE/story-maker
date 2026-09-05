import type { StoryProject } from "./story-data";
import { resolveStoryEditorLocation, type StoryEditorLocation } from "./story-editor-location";

export const STUDIO_UI_SESSION_KEY = "storygame:ui-session:v1";

// Optional UI metadata, deliberately outside StoryProject and Excel.
export type StudioUiSession = {
  version: 1;
  projectId: string;
  workspaceMode: "plan" | "create";
  planningView: "story" | "chapters";
  location: StoryEditorLocation;
};
type SessionStorage = Pick<Storage, "getItem" | "setItem">;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function parseStudioUiSession(value: unknown): StudioUiSession | null {
  if (!isRecord(value) || value.version !== 1 || typeof value.projectId !== "string" || !value.projectId) return null;
  if (value.workspaceMode !== "plan" && value.workspaceMode !== "create") return null;
  if (value.planningView !== "story" && value.planningView !== "chapters") return null;
  const location = value.location;
  if (!isRecord(location) || typeof location.chapterId !== "string" || typeof location.lineId !== "string") return null;
  if (location.view !== "chapter" && location.view !== "scene") return null;
  return {
    version: 1, projectId: value.projectId,
    workspaceMode: value.workspaceMode, planningView: value.planningView,
    location: { chapterId: location.chapterId, lineId: location.lineId, view: location.view, focusTarget: "none" },
  };
}

export function resolveStudioUiSession(project: StoryProject, value: unknown): StudioUiSession {
  const parsed = parseStudioUiSession(value);
  const saved = parsed?.projectId === project.id ? parsed : null;
  const location = resolveStoryEditorLocation({
    chapters: project.chapters, lines: project.lines,
    location: saved?.location ?? { chapterId: "", lineId: "", view: "chapter", focusTarget: "none" },
  }).location;
  return {
    version: 1, projectId: project.id,
    workspaceMode: saved?.workspaceMode ?? (project.chapters.length ? "create" : "plan"),
    planningView: saved?.planningView ?? "story", location,
  };
}

export function loadStudioUiSession(storage: () => SessionStorage): StudioUiSession | null {
  try {
    return parseStudioUiSession(JSON.parse(storage().getItem(STUDIO_UI_SESSION_KEY) ?? "null"));
  } catch {
    return null;
  }
}

export function saveStudioUiSession(storage: () => SessionStorage, session: StudioUiSession): boolean {
  try {
    const safe = parseStudioUiSession(session);
    if (!safe) return false;
    storage().setItem(STUDIO_UI_SESSION_KEY, JSON.stringify(safe));
    return true;
  } catch {
    return false;
  }
}
