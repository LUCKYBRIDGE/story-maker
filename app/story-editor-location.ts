import type { Chapter, StoryLine, StoryProject } from "./story-data";

export type StoryEditorView = "chapter" | "scene";
export type StoryEditorFocusTarget = "none" | "line-body";

export type StoryEditorLocation = {
  chapterId: string;
  lineId: string;
  view: StoryEditorView;
  focusTarget: StoryEditorFocusTarget;
};

export type StoryEditorLocationResolution = {
  location: StoryEditorLocation;
  usedFallback: boolean;
};

export type StoryEditorTextSelection = {
  start: number;
  end: number;
};

function orderedChapters(chapters: Chapter[]) {
  return chapters.slice().sort((left, right) => left.order - right.order);
}

function orderedChapterLines(lines: StoryLine[], chapterId: string) {
  return lines
    .filter((line) => line.chapterId === chapterId)
    .slice()
    .sort((left, right) => left.order - right.order);
}

export function sameStoryEditorPosition(
  left: StoryEditorLocation,
  right: StoryEditorLocation,
) {
  return (
    left.chapterId === right.chapterId &&
    left.lineId === right.lineId &&
    left.view === right.view
  );
}

export function sameStoryEditorLocation(
  left: StoryEditorLocation,
  right: StoryEditorLocation,
) {
  return (
    sameStoryEditorPosition(left, right) &&
    left.focusTarget === right.focusTarget
  );
}

export function resolveStoryEditorLocation({
  chapters,
  lines,
  location,
}: {
  chapters: Chapter[];
  lines: StoryLine[];
  location: StoryEditorLocation;
}): StoryEditorLocationResolution {
  const chapter =
    chapters.find((candidate) => candidate.id === location.chapterId) ??
    orderedChapters(chapters)[0];
  if (!chapter) {
    return {
      location: {
        chapterId: "",
        lineId: "",
        view: "chapter",
        focusTarget: "none",
      },
      usedFallback: Boolean(location.chapterId || location.lineId),
    };
  }

  const chapterLines = orderedChapterLines(lines, chapter.id);
  const line =
    chapterLines.find((candidate) => candidate.id === location.lineId) ??
    chapterLines[0];
  const usedFallback =
    chapter.id !== location.chapterId || (line?.id ?? "") !== location.lineId;
  const view = line || location.view === "chapter" ? location.view : "chapter";
  const focusTarget =
    line && !usedFallback ? location.focusTarget : "none";

  return {
    location: {
      chapterId: chapter.id,
      lineId: line?.id ?? "",
      view,
      focusTarget,
    },
    usedFallback,
  };
}

export function transitionStoryEditorView({
  location,
  view,
}: {
  location: StoryEditorLocation;
  view: StoryEditorView;
}): StoryEditorLocation {
  return {
    ...location,
    view,
    focusTarget: location.lineId ? "line-body" : "none",
  };
}

export function newStoryEditorLineLocation({
  chapterId,
  lineId,
  view = "scene",
}: {
  chapterId: string;
  lineId: string;
  view?: StoryEditorView;
}): StoryEditorLocation {
  return {
    chapterId,
    lineId,
    view,
    focusTarget: "line-body",
  };
}

export function clampStoryEditorTextSelection(
  selection: StoryEditorTextSelection | undefined,
  textLength: number,
): StoryEditorTextSelection | undefined {
  if (!selection) return undefined;
  const safeLength = Math.max(0, Math.floor(textLength));
  const start = Math.min(safeLength, Math.max(0, Math.floor(selection.start)));
  const end = Math.min(safeLength, Math.max(start, Math.floor(selection.end)));
  return { start, end };
}

export type PlayedStoryCut = { projectId: string; lineId: string };

// Unlike ordinary editor selection, a played cut must never fall back by position.
export function resolvePlayedCutLocation(
  draft: StoryProject, cut: PlayedStoryCut,
): StoryEditorLocation | null {
  if (draft.id !== cut.projectId) return null;
  const line = draft.lines.find((candidate) => candidate.id === cut.lineId);
  if (!line || !draft.chapters.some((chapter) => chapter.id === line.chapterId)) return null;
  return newStoryEditorLineLocation({ chapterId: line.chapterId, lineId: line.id });
}
