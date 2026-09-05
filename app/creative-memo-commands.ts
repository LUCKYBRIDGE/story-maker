import type { CreativeMemo } from "./creative-memos";
import {
  resolveStoryEditorLocation,
  type StoryEditorLocation,
  type StoryEditorLocationResolution,
} from "./story-editor-location";
import type { Chapter, StoryLine } from "./story-data";

export type CreativeMemoChapterTarget = {
  id: string;
  label: string;
};

export type CreativeMemoLineTarget = {
  id: string;
  chapterId: string;
  label: string;
};

export type CreativeMemoLinkResolution = {
  status: "unlinked" | "chapter" | "line" | "broken";
  label: string;
  chapterId?: string;
  lineId?: string;
};

function orderedChapters(chapters: Chapter[]) {
  return chapters.slice().sort((left, right) => left.order - right.order);
}

function orderedLines(lines: StoryLine[], chapterId: string) {
  return lines
    .filter((line) => line.chapterId === chapterId)
    .slice()
    .sort((left, right) => left.order - right.order);
}

export function creativeMemoChapterTargets(chapters: Chapter[]) {
  return orderedChapters(chapters).map((chapter) => ({
    id: chapter.id,
    label: `${chapter.order}. ${chapter.title.trim() || "제목 없는 장"}`,
  })) satisfies CreativeMemoChapterTarget[];
}

export function creativeMemoLineTargets({
  chapters,
  lines,
  chapterId,
}: {
  chapters: Chapter[];
  lines: StoryLine[];
  chapterId: string;
}) {
  const chapter = chapters.find((candidate) => candidate.id === chapterId);
  if (!chapter) return [];
  return orderedLines(lines, chapter.id).map((line) => ({
    id: line.id,
    chapterId: chapter.id,
    label: `컷 ${line.order} · ${line.type === "dialogue" ? line.speakerName || "화자 없음" : "해설"}`,
  })) satisfies CreativeMemoLineTarget[];
}

export function setCreativeMemoChapterLink(
  memo: CreativeMemo,
  chapterId: string,
): CreativeMemo {
  return {
    ...memo,
    linkedChapterId: chapterId || undefined,
    linkedLineId: undefined,
  };
}

export function setCreativeMemoLineLink({
  memo,
  chapters,
  lines,
  lineId,
}: {
  memo: CreativeMemo;
  chapters: Chapter[];
  lines: StoryLine[];
  lineId: string;
}): CreativeMemo {
  if (!lineId) return { ...memo, linkedLineId: undefined };
  const line = lines.find((candidate) => candidate.id === lineId);
  const chapter = chapters.find((candidate) => candidate.id === line?.chapterId);
  if (!line || !chapter) return memo;
  return {
    ...memo,
    linkedChapterId: chapter.id,
    linkedLineId: line.id,
  };
}

export function resolveCreativeMemoLink({
  memo,
  chapters,
  lines,
}: {
  memo: CreativeMemo;
  chapters: Chapter[];
  lines: StoryLine[];
}): CreativeMemoLinkResolution {
  if (!memo.linkedChapterId && !memo.linkedLineId) {
    return { status: "unlinked", label: "아직 연결한 장이나 컷이 없어요." };
  }

  const chapter = chapters.find(
    (candidate) => candidate.id === memo.linkedChapterId,
  );
  const line = lines.find((candidate) => candidate.id === memo.linkedLineId);
  if (
    memo.linkedLineId &&
    line &&
    (!memo.linkedChapterId || line.chapterId === memo.linkedChapterId)
  ) {
    const lineChapter = chapters.find((candidate) => candidate.id === line.chapterId);
    if (lineChapter) {
      return {
        status: "line",
        label: `${lineChapter.order}. ${lineChapter.title.trim() || "제목 없는 장"} · 컷 ${line.order}`,
        chapterId: lineChapter.id,
        lineId: line.id,
      };
    }
  }
  if (memo.linkedChapterId && chapter && !memo.linkedLineId) {
    return {
      status: "chapter",
      label: `${chapter.order}. ${chapter.title.trim() || "제목 없는 장"}`,
      chapterId: chapter.id,
    };
  }
  return {
    status: "broken",
    label: "연결했던 장이나 컷을 찾을 수 없어요. 다시 골라 주세요.",
  };
}

export function resolveCreativeMemoReturnLocation({
  chapters,
  lines,
  location,
}: {
  chapters: Chapter[];
  lines: StoryLine[];
  location: StoryEditorLocation;
}): StoryEditorLocationResolution {
  return resolveStoryEditorLocation({ chapters, lines, location });
}
