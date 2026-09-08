import type { Chapter, StoryLine } from "./story-data";
import { splitStoryText } from "./story-cut-length";

export function moveStoryChapter({ chapters, chapterId, direction }: {
  chapters: Chapter[];
  chapterId: string;
  direction: -1 | 1;
}): { ok: true; chapters: Chapter[] } | { ok: false; code: "chapter-not-found" | "cannot-move" } {
  const ordered = [...chapters].sort((a, b) => a.order - b.order);
  const index = ordered.findIndex(chapter => chapter.id === chapterId);
  if (index < 0) return { ok: false, code: "chapter-not-found" };
  const target = index + direction;
  if (target < 0 || target >= ordered.length) return { ok: false, code: "cannot-move" };
  [ordered[index], ordered[target]] = [ordered[target], ordered[index]];
  return { ok: true, chapters: ordered.map((chapter, i) => ({ ...chapter, order: i + 1 })) };
}

export type StoryLineCommandFailureCode =
  | "line-not-found"
  | "cannot-move"
  | "duplicate-id"
  | "cannot-merge";

export type StoryLineCommandResult =
  | { ok: true; lines: StoryLine[]; selectedLineId?: string }
  | { ok: false; code: StoryLineCommandFailureCode };

export type NewStoryLine = Omit<StoryLine, "id" | "chapterId" | "order">;

type CreateStoryLineOptions = {
  lines: StoryLine[];
  chapterId: string;
  line: NewStoryLine;
  createId: () => string;
  insertAfterLineId?: string;
};

type LineIdCommandOptions = {
  lines: StoryLine[];
  lineId: string;
};

type MoveStoryLineOptions = LineIdCommandOptions & {
  direction: -1 | 1;
};

type DuplicateStoryLineOptions = LineIdCommandOptions & {
  createId: () => string;
};

function orderedLines(lines: StoryLine[], chapterId: string) {
  return lines
    .filter((line) => line.chapterId === chapterId)
    .slice()
    .sort((left, right) => left.order - right.order);
}

function withContinuousOrder(lines: StoryLine[]) {
  return lines.map((line, index) => ({ ...line, order: index + 1 }));
}

function replaceChapterLines(
  lines: StoryLine[],
  chapterId: string,
  nextChapterLines: StoryLine[],
) {
  let nextIndex = 0;
  const replaced = lines.flatMap((line) => {
    if (line.chapterId !== chapterId) return [line];
    const replacement = nextChapterLines[nextIndex++];
    return replacement ? [replacement] : [];
  });
  return [...replaced, ...nextChapterLines.slice(nextIndex)];
}

function hasId(lines: StoryLine[], id: string) {
  return lines.some((line) => line.id === id);
}

export function createStoryLine({
  lines,
  chapterId,
  line,
  createId,
  insertAfterLineId,
}: CreateStoryLineOptions): StoryLineCommandResult {
  const id = createId();
  if (hasId(lines, id)) return { ok: false, code: "duplicate-id" };

  const chapterLines = orderedLines(lines, chapterId);
  const insertAfterIndex = insertAfterLineId
    ? chapterLines.findIndex((candidate) => candidate.id === insertAfterLineId)
    : chapterLines.length - 1;
  const insertIndex = insertAfterIndex < 0 ? chapterLines.length : insertAfterIndex + 1;
  const created: StoryLine = {
    ...line,
    id,
    chapterId,
    order: insertIndex + 1,
  };
  const nextChapterLines = withContinuousOrder([
    ...chapterLines.slice(0, insertIndex),
    created,
    ...chapterLines.slice(insertIndex),
  ]);
  return {
    ok: true,
    lines: replaceChapterLines(lines, chapterId, nextChapterLines),
    selectedLineId: id,
  };
}

export function moveStoryLine({
  lines,
  lineId,
  direction,
}: MoveStoryLineOptions): StoryLineCommandResult {
  const line = lines.find((candidate) => candidate.id === lineId);
  if (!line) return { ok: false, code: "line-not-found" };

  const chapterLines = orderedLines(lines, line.chapterId);
  const index = chapterLines.findIndex((candidate) => candidate.id === lineId);
  const targetIndex = index + direction;
  if (targetIndex < 0 || targetIndex >= chapterLines.length) {
    return { ok: false, code: "cannot-move" };
  }
  [chapterLines[index], chapterLines[targetIndex]] = [
    chapterLines[targetIndex],
    chapterLines[index],
  ];
  return {
    ok: true,
    lines: replaceChapterLines(
      lines,
      line.chapterId,
      withContinuousOrder(chapterLines),
    ),
    selectedLineId: lineId,
  };
}

export function duplicateStoryLine({
  lines,
  lineId,
  createId,
}: DuplicateStoryLineOptions): StoryLineCommandResult {
  const source = lines.find((candidate) => candidate.id === lineId);
  if (!source) return { ok: false, code: "line-not-found" };

  const id = createId();
  if (hasId(lines, id)) return { ok: false, code: "duplicate-id" };
  const chapterLines = orderedLines(lines, source.chapterId);
  const index = chapterLines.findIndex((candidate) => candidate.id === lineId);
  const copy = { ...source, id, order: index + 2 };
  return {
    ok: true,
    lines: replaceChapterLines(
      lines,
      source.chapterId,
      withContinuousOrder([
        ...chapterLines.slice(0, index + 1),
        copy,
        ...chapterLines.slice(index + 1),
      ]),
    ),
    selectedLineId: id,
  };
}

export function deleteStoryLine({
  lines,
  lineId,
}: LineIdCommandOptions): StoryLineCommandResult {
  const source = lines.find((candidate) => candidate.id === lineId);
  if (!source) return { ok: false, code: "line-not-found" };

  const chapterLines = orderedLines(lines, source.chapterId);
  const index = chapterLines.findIndex((candidate) => candidate.id === lineId);
  const nextChapterLines = withContinuousOrder(
    chapterLines.filter((candidate) => candidate.id !== lineId),
  );
  const selectedLineId =
    nextChapterLines[index]?.id ?? nextChapterLines[index - 1]?.id;
  return {
    ok: true,
    lines: replaceChapterLines(lines, source.chapterId, nextChapterLines),
    ...(selectedLineId === undefined ? {} : { selectedLineId }),
  };
}

/** Original ID (including continuation pointer) stays on the first cut. */
export function splitStoryLine({ lines, lineId, createId }: DuplicateStoryLineOptions): StoryLineCommandResult {
  const source = lines.find(line => line.id === lineId);
  if (!source) return { ok: false, code: "line-not-found" };
  const chunks = splitStoryText(source.text);
  if (chunks.length === 1) return { ok: true, lines, selectedLineId: lineId };
  const ids = new Set(lines.map(line => line.id));
  const splitLines: StoryLine[] = [{ ...source, text: chunks[0] }];
  for (const text of chunks.slice(1)) {
    const id = createId();
    if (ids.has(id)) return { ok: false, code: "duplicate-id" };
    ids.add(id);
    splitLines.push({ ...source, id, text });
  }
  const chapterLines = orderedLines(lines, source.chapterId);
  const next = chapterLines.flatMap(line => line.id === lineId ? splitLines : [line]);
  return {
    ok: true,
    lines: replaceChapterLines(lines, source.chapterId, withContinuousOrder(next)),
    selectedLineId: lineId,
  };
}

export function canMergeStoryLines(first: StoryLine, second: StoryLine): boolean {
  if (first.chapterId !== second.chapterId) return false;
  // Merging would move or discard the second cut’s timed effect.
  if (first.effect || second.effect) return false;
  if (first.type !== second.type) return false;
  if (first.type === "narration") return true;
  return (
    first.speaker === second.speaker &&
    first.speakerName.trim() === second.speakerName.trim()
  );
}

export type MergeStoryLinesOptions = {
  lines: StoryLine[];
  sourceLineId: string;
  targetLineId: string;
};

export function mergeStoryLines({
  lines,
  sourceLineId,
  targetLineId,
}: MergeStoryLinesOptions): StoryLineCommandResult {
  const first = lines.find((line) => line.id === sourceLineId);
  const second = lines.find((line) => line.id === targetLineId);
  if (!first || !second) return { ok: false, code: "line-not-found" };
  if (!canMergeStoryLines(first, second)) {
    return { ok: false, code: "cannot-merge" };
  }

  const [earlier, later] = first.order < second.order ? [first, second] : [second, first];

  const text1 = earlier.text.trim();
  const text2 = later.text.trim();
  const combinedText =
    !text1 ? text2
    : !text2 ? text1
    : earlier.text.endsWith("\n") || earlier.text.endsWith(" ")
      ? `${earlier.text}${later.text}`
      : `${earlier.text} ${later.text}`;

  const mergedLine: StoryLine = {
    ...earlier,
    text: combinedText,
    leftAssetId: earlier.leftAssetId || later.leftAssetId,
    rightAssetId: earlier.rightAssetId || later.rightAssetId,
    backgroundId: earlier.backgroundId || later.backgroundId,
    purposeNote: earlier.purposeNote || later.purposeNote,
    emotionNote: earlier.emotionNote || later.emotionNote,
    directionNote: earlier.directionNote || later.directionNote,
  };

  const chapterLines = orderedLines(lines, earlier.chapterId);
  const next = chapterLines.flatMap((line) => {
    if (line.id === earlier.id) return [mergedLine];
    if (line.id === later.id) return [];
    return [line];
  });

  return {
    ok: true,
    lines: replaceChapterLines(lines, earlier.chapterId, withContinuousOrder(next)),
    selectedLineId: earlier.id,
  };
}
