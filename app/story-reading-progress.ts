import type { ReadingRecord } from "./components/ReadingTranscript";
import type { StoryLine } from "./story-data";

export const STORY_READING_PROGRESS_STORAGE_KEY = "storygame:reading-progress:v1";

export const READING_SAVE_SLOT_IDS = ["auto", "manual-1", "manual-2", "manual-3"] as const;
export type ReadingSaveSlotId = (typeof READING_SAVE_SLOT_IDS)[number];

export const READING_SAVE_SLOT_LABELS: Record<ReadingSaveSlotId, string> = {
  auto: "자동저장 1",
  "manual-1": "수동저장 1",
  "manual-2": "수동저장 2",
  "manual-3": "수동저장 3",
};

export interface ReadingSaveSlot {
  slotId: ReadingSaveSlotId;
  slotLabel: string;
  index: number;
  lineId: string;
  chapterId?: string;
  chapterTitle?: string;
  cutNumber: number;
  totalCuts: number;
  dialoguePreview: string;
  speakerName?: string;
  history: ReadingRecord[];
  endingChoice?: string;
  choiceEnded?: boolean;
  savedAt: string;
}

export interface ProjectReadingProgress {
  projectId: string;
  lastReadSlotId?: ReadingSaveSlotId;
  slots: Partial<Record<ReadingSaveSlotId, ReadingSaveSlot>>;
}

export type ReadingProgressRegistry = Record<string, ProjectReadingProgress>;

function defaultStorage(): Storage | null {
  if (typeof window === "undefined" || !window.localStorage) return null;
  return window.localStorage;
}

function resolveStorage(storageProvider?: () => Storage | undefined): Storage | null {
  try {
    const s = storageProvider ? storageProvider() : defaultStorage();
    return s ?? null;
  } catch {
    return null;
  }
}

export function loadAllReadingProgress(storageProvider?: () => Storage | undefined): ReadingProgressRegistry {
  const storage = resolveStorage(storageProvider);
  if (!storage) return {};
  try {
    const raw = storage.getItem(STORY_READING_PROGRESS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return {};
    return parsed as ReadingProgressRegistry;
  } catch {
    return {};
  }
}

export function saveAllReadingProgress(
  registry: ReadingProgressRegistry,
  storageProvider?: () => Storage | undefined,
): boolean {
  const storage = resolveStorage(storageProvider);
  if (!storage) return false;
  try {
    storage.setItem(STORY_READING_PROGRESS_STORAGE_KEY, JSON.stringify(registry));
    return true;
  } catch {
    return false;
  }
}

export function loadProjectReadingProgress(
  projectId: string,
  storageProvider?: () => Storage | undefined,
): ProjectReadingProgress | null {
  if (!projectId) return null;
  const all = loadAllReadingProgress(storageProvider);
  return all[projectId] ?? null;
}

export function getLatestReadingSaveSlot(
  progress: ProjectReadingProgress | null,
): ReadingSaveSlot | null {
  if (!progress || !progress.slots) return null;
  const validSlots = Object.values(progress.slots).filter(
    (slot): slot is ReadingSaveSlot =>
      Boolean(slot && typeof slot.index === "number" && typeof slot.savedAt === "string"),
  );
  if (validSlots.length === 0) return null;

  // 가장 최근에 저장된 슬롯 반환
  return validSlots.reduce((latest, current) => {
    const latestTime = Date.parse(latest.savedAt) || 0;
    const currentTime = Date.parse(current.savedAt) || 0;
    return currentTime >= latestTime ? current : latest;
  });
}

export function saveReadingProgressSlot(
  projectId: string,
  slot: ReadingSaveSlot,
  storageProvider?: () => Storage | undefined,
): boolean {
  if (!projectId || !slot || !slot.slotId) return false;
  const registry = loadAllReadingProgress(storageProvider);
  const currentProject = registry[projectId] ?? {
    projectId,
    slots: {},
  };

  const updatedSlots = {
    ...currentProject.slots,
    [slot.slotId]: {
      ...slot,
      slotLabel: READING_SAVE_SLOT_LABELS[slot.slotId] ?? slot.slotLabel,
    },
  };

  registry[projectId] = {
    projectId,
    lastReadSlotId: slot.slotId,
    slots: updatedSlots,
  };

  return saveAllReadingProgress(registry, storageProvider);
}

export function deleteReadingProgressSlot(
  projectId: string,
  slotId: ReadingSaveSlotId,
  storageProvider?: () => Storage | undefined,
): boolean {
  if (!projectId || !slotId) return false;
  const registry = loadAllReadingProgress(storageProvider);
  const currentProject = registry[projectId];
  if (!currentProject || !currentProject.slots[slotId]) return false;

  const updatedSlots = { ...currentProject.slots };
  delete updatedSlots[slotId];

  registry[projectId] = {
    ...currentProject,
    slots: updatedSlots,
    lastReadSlotId: currentProject.lastReadSlotId === slotId ? undefined : currentProject.lastReadSlotId,
  };

  return saveAllReadingProgress(registry, storageProvider);
}

export function clearProjectReadingProgress(
  projectId: string,
  storageProvider?: () => Storage | undefined,
): boolean {
  if (!projectId) return false;
  const registry = loadAllReadingProgress(storageProvider);
  if (!registry[projectId]) return false;
  delete registry[projectId];
  return saveAllReadingProgress(registry, storageProvider);
}

export function findSafeTargetIndex(lines: StoryLine[], slot: ReadingSaveSlot): number {
  if (!lines || lines.length === 0) return 0;
  if (slot.lineId && lines[slot.index]?.id === slot.lineId) {
    return slot.index;
  }
  if (slot.lineId) {
    const foundIndex = lines.findIndex((line) => line.id === slot.lineId);
    if (foundIndex >= 0) return foundIndex;
  }
  return Math.min(Math.max(0, slot.index), lines.length - 1);
}

export function formatSavedDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return "날짜 정보 없음";

    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const period = hours < 12 ? "오전" : "오후";
    const displayHours = hours % 12 === 0 ? 12 : hours % 12;

    return `${month}월 ${day}일 ${period} ${displayHours}:${minutes}`;
  } catch {
    return "날짜 정보 없음";
  }
}
