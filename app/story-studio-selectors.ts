import type { Chapter, StoryLine, StoryProject } from "./story-data";

export type StoryEditorSelection = {
  sortedChapters: Chapter[];
  selectedChapter: Chapter | undefined;
  selectedChapterLines: StoryLine[];
  selectedLine: StoryLine | undefined;
  selectedLineIndex: number;
  orderedDraftLines: StoryLine[];
  selectedStoryLineIndex: number;
};

export type ActiveProjectResolution = {
  project: StoryProject;
  usedFallback: boolean;
};

export function resolveActiveProjectForDraft({
  draft,
  active,
}: {
  draft: StoryProject;
  active: StoryProject | null | undefined;
}): ActiveProjectResolution {
  if (active?.id === draft.id) {
    return { project: active, usedFallback: false };
  }

  return {
    project: {
      ...draft,
      chapters: [],
      lines: [],
    },
    usedFallback: true,
  };
}

export function findFirstStoryLineIndexForChapter({
  lines,
  chapterId,
}: {
  lines: StoryLine[];
  chapterId: string;
}) {
  return lines.findIndex((line) => line.chapterId === chapterId);
}

export function selectStoryEditorSelection({
  project,
  selectedChapterId,
  selectedLineId,
}: {
  project: StoryProject;
  selectedChapterId: string;
  selectedLineId: string;
}): StoryEditorSelection {
  const sortedChapters = project.chapters
    .slice()
    .sort((left, right) => left.order - right.order);
  const selectedChapter =
    project.chapters.find((chapter) => chapter.id === selectedChapterId) ??
    project.chapters[0];
  const selectedChapterLines = project.lines
    .filter((line) => line.chapterId === selectedChapter?.id)
    .slice()
    .sort((left, right) => left.order - right.order);
  const selectedLine =
    selectedChapterLines.find((line) => line.id === selectedLineId) ??
    selectedChapterLines[0];
  const selectedLineIndex = selectedLine
    ? selectedChapterLines.findIndex((line) => line.id === selectedLine.id)
    : -1;
  const orderedDraftLines = sortedChapters.flatMap((chapter) =>
    project.lines
      .filter((line) => line.chapterId === chapter.id)
      .slice()
      .sort((left, right) => left.order - right.order),
  );
  const selectedStoryLineIndex = selectedLine
    ? orderedDraftLines.findIndex((line) => line.id === selectedLine.id)
    : -1;

  return {
    sortedChapters,
    selectedChapter,
    selectedChapterLines,
    selectedLine,
    selectedLineIndex,
    orderedDraftLines,
    selectedStoryLineIndex,
  };
}

// One resolution feeds the body, counter, navigation and current-cut identity.
// Empty stories use -1 internally and display 0 / 0.
export function selectStoryPlayerPosition(project: StoryProject, rawIndex: number) {
  const chapters = project.chapters.slice().sort((a, b) => a.order - b.order);
  const lines = chapters.flatMap((chapter) => project.lines
    .filter((line) => line.chapterId === chapter.id)
    .sort((a, b) => a.order - b.order));
  const total = lines.length;
  const index = total === 0 ? -1 : Math.min(total - 1,
    Math.max(0, Number.isFinite(rawIndex) ? Math.floor(rawIndex) : 0));
  const line = lines[index];
  return {
    lines, index, line, total, number: index + 1,
    chapter: chapters.find((chapter) => chapter.id === line?.chapterId),
    playableChapters: chapters.filter((chapter) => lines.some((line) => line.chapterId === chapter.id)),
    canPrevious: index > 0,
    canNext: index >= 0 && index < total - 1,
  };
}
