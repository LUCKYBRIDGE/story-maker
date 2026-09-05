import type { Chapter, StoryLine, StoryProject } from "./story-data";

export type StoryApplyIssueCode =
  | "missing-title"
  | "missing-chapter"
  | "missing-scene"
  | "empty-chapter"
  | "empty-line"
  | "missing-speaker-name"
  | "narration-parentheses";

export type StoryApplyIssueField =
  | "title"
  | "chapter-action"
  | "scene-action"
  | "line-body"
  | "speaker";

export type StoryApplyIssue = {
  id: string;
  code: StoryApplyIssueCode;
  message: string;
  chapterId?: string;
  lineId?: string;
  field: StoryApplyIssueField;
};

export type StoryApplyIssueNavigation = {
  workspace: "plan" | "create";
  view?: "chapter" | "scene";
  chapterId?: string;
  lineId?: string;
  focus: "title" | "line-body" | "speaker" | "none";
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

function chapterLabel(chapter: Chapter) {
  return `${chapter.order}장${chapter.title.trim() ? ` ‘${chapter.title.trim()}’` : ""}`;
}

function linePrefix(chapter: Chapter, line: StoryLine) {
  return `${chapterLabel(chapter)} · ${line.order}컷`;
}

function hasParentheses(value: string) {
  return /[()（）]/.test(value);
}

export function findStoryApplyIssues(project: StoryProject): StoryApplyIssue[] {
  const issues: StoryApplyIssue[] = [];
  if (!project.title.trim()) {
    issues.push({
      id: "missing-title",
      code: "missing-title",
      field: "title",
      message: "이야기 제목이 비어 있어요. 제목 입력칸에 이야기 이름을 써 주세요.",
    });
  }

  const chapters = orderedChapters(project.chapters);
  if (chapters.length === 0) {
    issues.push({
      id: "missing-chapter",
      code: "missing-chapter",
      field: "chapter-action",
      message: "장이 없어요. 장을 하나 만든 뒤 대본 컷을 써 주세요.",
    });
  }
  if (project.lines.length === 0 && chapters.length === 0) {
    issues.push({
      id: "missing-scene",
      code: "missing-scene",
      field: "scene-action",
      message: "컷이 없어요. 장에 대사 또는 해설 컷을 하나 추가해 주세요.",
    });
  }

  for (const chapter of chapters) {
    const lines = orderedLines(project.lines, chapter.id);
    if (lines.length === 0) {
      issues.push({
        id: `empty-chapter:${chapter.id}`,
        code: "empty-chapter",
        chapterId: chapter.id,
        field: "scene-action",
        message: `${chapterLabel(chapter)}에 컷이 없어요. 이 장에 대사 또는 해설 컷을 하나 추가해 주세요.`,
      });
    }
    for (const line of lines) {
      const prefix = linePrefix(chapter, line);
      if (!line.text.trim()) {
        issues.push({
          id: `empty-line:${line.id}`,
          code: "empty-line",
          chapterId: chapter.id,
          lineId: line.id,
          field: "line-body",
          message: `${prefix}의 글상자가 비어 있어요. 이 컷의 대사나 해설을 써 주세요.`,
        });
      }
      if (line.type === "dialogue" && !line.speakerName.trim()) {
        issues.push({
          id: `missing-speaker-name:${line.id}`,
          code: "missing-speaker-name",
          chapterId: chapter.id,
          lineId: line.id,
          field: "speaker",
          message: `${prefix}은(는) 대사 컷이에요. 컷 설정에서 화자 이름을 골라 주세요.`,
        });
      }
      if (line.type === "narration" && hasParentheses(line.text)) {
        issues.push({
          id: `narration-parentheses:${line.id}`,
          code: "narration-parentheses",
          chapterId: chapter.id,
          lineId: line.id,
          field: "line-body",
          message: `${prefix}의 해설에는 괄호를 쓸 수 없어요. 괄호 내용은 대사 컷으로 옮겨 주세요.`,
        });
      }
    }
  }
  return issues;
}

export function getStoryApplyIssueNavigation(
  issue: StoryApplyIssue,
): StoryApplyIssueNavigation {
  if (issue.field === "title") {
    return { workspace: "plan", focus: "title" };
  }
  if (issue.field === "chapter-action") {
    return { workspace: "plan", focus: "none" };
  }
  if (issue.field === "scene-action") {
    return {
      workspace: "create",
      view: "chapter",
      chapterId: issue.chapterId,
      focus: "none",
    };
  }
  return {
    workspace: "create",
    view: "scene",
    chapterId: issue.chapterId,
    lineId: issue.lineId,
    focus: issue.field === "speaker" ? "speaker" : "line-body",
  };
}
