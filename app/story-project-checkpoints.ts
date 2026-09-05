import {
  createStoryDocument,
  parseStoryDocument,
  type StoryDocumentEnvelope,
} from "./story-project-document";
import type { StoryProjectStorage } from "./story-project-repository";
import type { StoryProject } from "./story-data";

export const STORY_CHECKPOINT_STORAGE_KEY = "storygame:checkpoints:v1";
export const STORY_CHECKPOINT_LIMIT = 10;

export type StoryCheckpointReason =
  | "before-delete"
  | "before-import"
  | "before-play-apply"
  | "before-reset"
  | "before-restore"
  | "before-template";

export type StoryProjectCheckpoint = {
  id: string;
  reason: StoryCheckpointReason;
  createdAt: string;
  document: StoryDocumentEnvelope;
};

export type StoryCheckpointListResult =
  | { ok: true; checkpoints: StoryProjectCheckpoint[] }
  | { ok: false; message: string };

export type StoryCheckpointCreateResult =
  | {
      ok: true;
      checkpoint: StoryProjectCheckpoint;
      checkpoints: StoryProjectCheckpoint[];
      skipped: boolean;
    }
  | { ok: false; message: string };

export type StoryCheckpointRestoreResult =
  | {
      ok: true;
      project: StoryProject;
      checkpoints: StoryProjectCheckpoint[];
    }
  | { ok: false; message: string };

type CheckpointRepositoryOptions = {
  storage: StoryProjectStorage;
  now?: () => string;
  appVersion?: string;
  limit?: number;
};

export type StoryProjectCheckpointRepository = {
  list: () => StoryCheckpointListResult;
  create: (
    reason: Exclude<StoryCheckpointReason, "before-restore">,
    project: StoryProject,
  ) => StoryCheckpointCreateResult;
  restore: (
    checkpointId: string,
    currentProject: StoryProject,
  ) => StoryCheckpointRestoreResult;
};

function checkpointFailure(action: "read" | "save") {
  return action === "read"
    ? "이 기기의 복구 기록을 읽지 못했어요. 현재 작품은 그대로예요."
    : "복구 기록을 만들지 못했어요. 현재 작품은 그대로예요. Excel로 저장해 보관해 주세요.";
}

function isCheckpointReason(value: unknown): value is StoryCheckpointReason {
  return [
    "before-delete",
    "before-import",
    "before-play-apply",
    "before-reset",
    "before-restore",
    "before-template",
  ].includes(String(value));
}

function parseCheckpoint(value: unknown): StoryProjectCheckpoint | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const record = value as Record<string, unknown>;
  if (
    typeof record.id !== "string" ||
    typeof record.createdAt !== "string" ||
    !isCheckpointReason(record.reason)
  ) {
    return undefined;
  }
  const parsed = parseStoryDocument(record.document);
  if (!parsed.ok || parsed.source !== "current") return undefined;
  return {
    id: record.id,
    reason: record.reason,
    createdAt: record.createdAt,
    document: parsed.document,
  };
}

function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    return `{${Object.keys(record)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonicalJson(record[key])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

export function createStoryProjectCheckpointRepository({
  storage,
  now = () => new Date().toISOString(),
  appVersion = "story-maker/0.1.0",
  limit = STORY_CHECKPOINT_LIMIT,
}: CheckpointRepositoryOptions): StoryProjectCheckpointRepository {
  if (!Number.isInteger(limit) || limit < 1) {
    throw new Error("limit must be a positive integer.");
  }

  function list(): StoryCheckpointListResult {
    let raw: string | null;
    try {
      raw = storage.getItem(STORY_CHECKPOINT_STORAGE_KEY);
    } catch {
      return { ok: false, message: checkpointFailure("read") };
    }
    if (raw === null) return { ok: true, checkpoints: [] };

    try {
      const values = JSON.parse(raw);
      if (!Array.isArray(values)) throw new Error("checkpoints must be an array");
      const checkpoints = values.map(parseCheckpoint);
      if (checkpoints.some((checkpoint) => !checkpoint)) {
        throw new Error("checkpoint is invalid");
      }
      return { ok: true, checkpoints: checkpoints as StoryProjectCheckpoint[] };
    } catch {
      return { ok: false, message: checkpointFailure("read") };
    }
  }

  function write(checkpoints: StoryProjectCheckpoint[]): StoryCheckpointListResult {
    try {
      storage.setItem(STORY_CHECKPOINT_STORAGE_KEY, JSON.stringify(checkpoints));
      return { ok: true, checkpoints };
    } catch {
      return { ok: false, message: checkpointFailure("save") };
    }
  }

  function createCheckpoint(
    reason: StoryCheckpointReason,
    project: StoryProject,
  ): StoryCheckpointCreateResult {
    const current = list();
    if (!current.ok) return current;
    const latest = current.checkpoints[0];
    if (
      latest &&
      latest.reason === reason &&
      canonicalJson(latest.document.project) === canonicalJson(project)
    ) {
      return {
        ok: true,
        checkpoint: latest,
        checkpoints: current.checkpoints,
        skipped: true,
      };
    }

    try {
      const createdAt = now();
      const document = createStoryDocument({ project, savedAt: createdAt, appVersion });
      const checkpoint: StoryProjectCheckpoint = {
        id: `checkpoint:${createdAt}:${reason}:${current.checkpoints.length + 1}`,
        reason,
        createdAt,
        document,
      };
      const saved = write([checkpoint, ...current.checkpoints].slice(0, limit));
      if (!saved.ok) return saved;
      return {
        ok: true,
        checkpoint,
        checkpoints: saved.checkpoints,
        skipped: false,
      };
    } catch {
      return { ok: false, message: checkpointFailure("save") };
    }
  }

  return {
    list,
    create: (reason, project) => createCheckpoint(reason, project),
    restore(checkpointId, currentProject) {
      const current = list();
      if (!current.ok) return current;
      const checkpoint = current.checkpoints.find(
        (candidate) => candidate.id === checkpointId,
      );
      if (!checkpoint) {
        return { ok: false, message: "복구할 기록을 찾지 못했어요. 현재 작품은 그대로예요." };
      }

      const preserved = createCheckpoint("before-restore", currentProject);
      if (!preserved.ok) return preserved;
      return {
        ok: true,
        project: structuredClone(checkpoint.document.project),
        checkpoints: preserved.checkpoints,
      };
    },
  };
}
