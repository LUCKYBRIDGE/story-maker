import type { StoryProject } from "./story-data";
import { createStoryDocument, parseStoryDocument, parseStoryDocumentJson, type StoryDocumentEnvelope } from "./story-project-document";
import { STORY_ACTIVE_STORAGE_KEY, STORY_DRAFT_STORAGE_KEY, STORY_PROJECT_APP_VERSION, type StoryProjectStorage } from "./story-project-repository";

export const MAX_EDITABLE_PROJECTS = 2;
export const STORY_COLLECTION_KEY = "storygame:projects:v1";
export type ProjectEntry = { draft: StoryDocumentEnvelope; playback: StoryDocumentEnvelope | null };
export type ProjectCollection = { version: 1; selectedProjectId: string | null; projects: ProjectEntry[] };
export type CollectionError = "invalid-data" | "storage" | "limit" | "not-found" | "exists";
export type CollectionResult<T> = { ok: true; value: T } | { ok: false; code: CollectionError; message: string };
const messages: Record<CollectionError, string> = {
  "invalid-data": "작품 보관함을 읽지 못했어요. 기존 저장본은 그대로 보존했어요.",
  storage: "기기에 저장하지 못했어요. 기존 작품을 지우지 말고 파일로 보관해 주세요.",
  limit: "새 이야기를 만들려면 기존 이야기 하나를 직접 정리해 주세요.",
  "not-found": "이 기기에서 해당 작품을 찾지 못했어요.",
  exists: "같은 작품이 있어요. 파일 버전으로 바꿀지 먼저 골라 주세요.",
};
const fail = (code: CollectionError): CollectionResult<never> => ({ ok: false, code, message: messages[code] });
const success = <T>(value: T): CollectionResult<T> => ({ ok: true, value });

/** One setItem commits collection + selection + playback together. Legacy keys remain untouched.
 * This repository is activated by Creation Hub integration; the legacy Studio is not switched mid-session.
 */
export function createProjectCollectionRepository({ storage, now = () => new Date().toISOString() }: {
  storage: StoryProjectStorage; now?: () => string;
}) {
  const metadata = () => ({savedAt: now(), appVersion: STORY_PROJECT_APP_VERSION});
  function document(project: StoryProject) {
    return parseStoryDocument(createStoryDocument({project, ...metadata()}), metadata());
  }
  function write(collection: ProjectCollection): CollectionResult<ProjectCollection> {
    try { storage.setItem(STORY_COLLECTION_KEY, JSON.stringify(collection)); return success(structuredClone(collection)); }
    catch { return fail("storage"); }
  }
  function read(): CollectionResult<ProjectCollection> {
    try {
      const raw = storage.getItem(STORY_COLLECTION_KEY);
      if (raw === null) {
        // Import only the editable draft. A different active snapshot is never promoted to an editable project.
        const legacy = storage.getItem(STORY_DRAFT_STORAGE_KEY);
        const collection: ProjectCollection = {version: 1, selectedProjectId: null, projects: []};
        if (legacy !== null) {
          const draft = parseStoryDocumentJson(legacy, metadata());
          if (!draft.ok) return fail("invalid-data");
          const activeRaw = storage.getItem(STORY_ACTIVE_STORAGE_KEY);
          let playback: StoryDocumentEnvelope | null = null;
          if (activeRaw !== null) {
            const active = parseStoryDocumentJson(activeRaw, metadata());
            // Preserve all legacy bytes and report corruption instead of silently dropping an unreadable snapshot.
            if (!active.ok) return fail("invalid-data");
            if (active.document.project.id === draft.document.project.id) playback = active.document;
          }
          collection.projects.push({draft: draft.document, playback});
          collection.selectedProjectId = draft.document.project.id;
        }
        return write(collection);
      }
      const data = JSON.parse(raw);
      if (!data || data.version !== 1 || !Array.isArray(data.projects) || data.projects.length > MAX_EDITABLE_PROJECTS) return fail("invalid-data");
      const projects: ProjectEntry[] = [];
      for (const entry of data.projects) {
        if (!entry || typeof entry !== "object") return fail("invalid-data");
        const draft = parseStoryDocument(entry.draft, metadata());
        const playback = entry.playback === null ? null : parseStoryDocument(entry.playback, metadata());
        if (!draft.ok || (playback && !playback.ok)) return fail("invalid-data");
        if (playback?.ok && playback.document.project.id !== draft.document.project.id) return fail("invalid-data");
        if (projects.some(p => p.draft.project.id === draft.document.project.id)) return fail("invalid-data");
        projects.push({draft: draft.document, playback: playback?.ok ? playback.document : null});
      }
      if (data.selectedProjectId !== null && !projects.some(p => p.draft.project.id === data.selectedProjectId)) return fail("invalid-data");
      return success({version: 1, selectedProjectId: data.selectedProjectId, projects});
    } catch { return fail("storage"); }
  }
  function mutate(change: (collection: ProjectCollection) => CollectionResult<ProjectCollection>) {
    const loaded = read();
    if (!loaded.ok) return loaded;
    const changed = change(loaded.value);
    return changed.ok ? write(changed.value) : changed;
  }
  return {
    listProjects: read,
    getProject(id: string): CollectionResult<ProjectEntry> {
      const loaded = read(); if (!loaded.ok) return loaded;
      const entry = loaded.value.projects.find(p => p.draft.project.id === id);
      return entry ? success(entry) : fail("not-found");
    },
    getActiveProjectId(): CollectionResult<string | null> {
      const loaded = read(); return loaded.ok ? success(loaded.value.selectedProjectId) : loaded;
    },
    setActiveProject(id: string) {
      return mutate(c => c.projects.some(p => p.draft.project.id === id)
        ? success({...c, selectedProjectId: id}) : fail("not-found"));
    },
    createProject(project: StoryProject) {
      const parsed = document(project); if (!parsed.ok) return fail("invalid-data");
      return mutate(c => {
        if (c.projects.some(p => p.draft.project.id === project.id)) return fail("exists");
        if (c.projects.length >= MAX_EDITABLE_PROJECTS) return fail("limit");
        return success({...c, selectedProjectId: project.id, projects: [...c.projects, {draft: parsed.document, playback: null}]});
      });
    },
    importProject(entry: ProjectEntry, replace = false) {
      const draft = parseStoryDocument(entry.draft);
      const playback = entry.playback === null ? null : parseStoryDocument(entry.playback);
      if (!draft.ok || (playback && !playback.ok) || (playback?.ok && playback.document.project.id !== draft.document.project.id)) return fail("invalid-data");
      return mutate(c => {
        const index = c.projects.findIndex(item => item.draft.project.id === draft.document.project.id);
        if (index >= 0 && !replace) return fail("exists");
        if (index < 0 && c.projects.length >= MAX_EDITABLE_PROJECTS) return fail("limit");
        const imported = { draft: draft.document, playback: playback?.ok ? playback.document : null };
        if (index < 0) c.projects.push(imported); else c.projects[index] = imported;
        c.selectedProjectId = draft.document.project.id;
        return success(c);
      });
    },
    // Saving addresses an existing ID; it never changes selection or creates a third project.
    saveProject(project: StoryProject) {
      const parsed = document(project); if (!parsed.ok) return fail("invalid-data");
      return mutate(c => {
        const entry = c.projects.find(p => p.draft.project.id === project.id);
        if (!entry) return fail("not-found");
        entry.draft = parsed.document;
        return success(c);
      });
    },
    savePlayback(project: StoryProject) {
      const parsed = document(project); if (!parsed.ok) return fail("invalid-data");
      return mutate(c => {
        const entry = c.projects.find(p => p.draft.project.id === project.id);
        if (!entry) return fail("not-found");
        entry.playback = parsed.document;
        return success(c);
      });
    },
    deleteProject(id: string) {
      return mutate(c => {
        if (!c.projects.some(p => p.draft.project.id === id)) return fail("not-found");
        c.projects = c.projects.filter(p => p.draft.project.id !== id);
        if (c.selectedProjectId === id) c.selectedProjectId = c.projects[0]?.draft.project.id ?? null;
        return success(c);
      });
    },
  };
}
export type ProjectCollectionRepository = ReturnType<typeof createProjectCollectionRepository>;
