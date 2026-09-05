import {
  createStoryDocument,
  parseStoryDocumentJson,
  type StoryDocumentIssue,
} from "./story-project-document";
import type { StoryProject } from "./story-data";

export const STORY_DRAFT_STORAGE_KEY = "storygame:draft:v1";
export const STORY_ACTIVE_STORAGE_KEY = "storygame:active:v1";
export const STORY_PROJECT_APP_VERSION = "story-maker/0.1.0";

export type StoryProjectStorage = Pick<Storage, "getItem" | "setItem">;

export type StoryProjectLoadResult =
  | { ok: true; project: null; source: "empty" }
  | {
      ok: true;
      project: StoryProject;
      source: "current" | "legacy-v1";
      migrationError?: string;
    }
  | { ok: false; message: string; issues?: StoryDocumentIssue[] };

export type StoryProjectSaveResult =
  | { ok: true; savedAt: string }
  | { ok: false; message: string };

export type StoryProjectSaveStatus = "idle" | "saving" | "saved" | "failed";

type RepositoryOptions = {
  storage: StoryProjectStorage;
  now?: () => string;
  appVersion?: string;
};

type SaveQueueOptions = {
  repository: Pick<StoryProjectRepository, "saveDraft">;
  delayMs?: number;
  onStatusChange?: (status: StoryProjectSaveStatus) => void;
  timer?: Pick<typeof globalThis, "setTimeout" | "clearTimeout">;
};

export type StoryProjectRepository = {
  loadDraft: () => StoryProjectLoadResult;
  loadActive: () => StoryProjectLoadResult;
  saveDraft: (project: StoryProject) => StoryProjectSaveResult;
  saveActive: (project: StoryProject) => StoryProjectSaveResult;
};

export type StoryProjectSaveQueue = {
  schedule: (project: StoryProject) => void;
  flush: () => StoryProjectSaveResult | undefined;
  dispose: () => void;
};

function storageFailure(action: "read" | "save") {
  return action === "read"
    ? "이 기기의 저장된 작업을 읽지 못했어요. Excel 파일이 있다면 다시 열어 주세요."
    : "기기에 저장하지 못했어요. Excel로 저장해 작품을 보관해 주세요.";
}

export function createLocalStoryProjectRepository({
  storage,
  now = () => new Date().toISOString(),
  appVersion = STORY_PROJECT_APP_VERSION,
}: RepositoryOptions): StoryProjectRepository {
  function save(key: string, project: StoryProject): StoryProjectSaveResult {
    try {
      const savedAt = now();
      const document = createStoryDocument({ project, savedAt, appVersion });
      storage.setItem(key, JSON.stringify(document));
      return { ok: true, savedAt };
    } catch {
      return { ok: false, message: storageFailure("save") };
    }
  }

  function load(key: string): StoryProjectLoadResult {
    let raw: string | null;
    try {
      raw = storage.getItem(key);
    } catch {
      return { ok: false, message: storageFailure("read") };
    }
    if (raw === null) return { ok: true, project: null, source: "empty" };

    const parsed = parseStoryDocumentJson(raw, {
      savedAt: now(),
      appVersion,
    });
    if (!parsed.ok) {
      return {
        ok: false,
        message: "이 기기의 저장된 작업 형식을 확인하지 못했어요. 현재 편집본은 그대로예요.",
        issues: parsed.issues,
      };
    }

    const migration =
      parsed.source === "legacy-v1" ? save(key, parsed.document.project) : undefined;
    return {
      ok: true,
      project: parsed.document.project,
      source: parsed.source,
      ...(migration && !migration.ok ? { migrationError: migration.message } : {}),
    };
  }

  return {
    loadDraft: () => load(STORY_DRAFT_STORAGE_KEY),
    loadActive: () => load(STORY_ACTIVE_STORAGE_KEY),
    saveDraft: (project) => save(STORY_DRAFT_STORAGE_KEY, project),
    saveActive: (project) => save(STORY_ACTIVE_STORAGE_KEY, project),
  };
}

export function createStoryProjectSaveQueue({
  repository,
  delayMs = 500,
  onStatusChange,
  timer = globalThis,
}: SaveQueueOptions): StoryProjectSaveQueue {
  if (delayMs < 300 || delayMs > 800) {
    throw new Error("delayMs must be between 300 and 800.");
  }

  let pendingProject: StoryProject | undefined;
  let timeout: ReturnType<typeof setTimeout> | undefined;

  function flush() {
    if (timeout !== undefined) {
      timer.clearTimeout(timeout);
      timeout = undefined;
    }
    if (!pendingProject) return undefined;

    const project = pendingProject;
    pendingProject = undefined;
    const result = repository.saveDraft(project);
    onStatusChange?.(result.ok ? "saved" : "failed");
    return result;
  }

  return {
    schedule(project) {
      pendingProject = structuredClone(project);
      if (timeout !== undefined) timer.clearTimeout(timeout);
      onStatusChange?.("saving");
      timeout = timer.setTimeout(flush, delayMs);
    },
    flush,
    dispose() {
      if (timeout !== undefined) timer.clearTimeout(timeout);
      timeout = undefined;
      pendingProject = undefined;
    },
  };
}
