export type StoryImportSource = "excel" | "sheet";

export type StoryImportSeverity = "error" | "warning";

export type StoryImportCell = {
  raw: string;
  normalized: string;
};

export type StoryImportIssue = {
  severity: StoryImportSeverity;
  source: StoryImportSource;
  sheet: string;
  row: number;
  column: string;
  value: string;
  message: string;
  fix: string;
};

export type StoryImportSheet = {
  name: string;
  csv: string;
};

export type StoryImportSnapshot = {
  source: StoryImportSource;
  project: StoryImportSheet;
  speakers: StoryImportSheet;
  chapters: StoryImportSheet;
  chapterResources: StoryImportSheet;
  lines: StoryImportSheet;
  creativeMemos: StoryImportSheet;
};

export class StoryImportError extends Error {
  readonly issues: StoryImportIssue[];

  constructor(issues: StoryImportIssue[]) {
    super(storyImportErrorMessage(issues));
    this.name = "StoryImportError";
    this.issues = issues;
  }
}

export function storyImportCell(raw: string): StoryImportCell {
  return { raw, normalized: raw.trim() };
}

export function storyImportErrorMessage(issues: StoryImportIssue[]) {
  const errors = issues.filter((issue) => issue.severity === "error");
  const displayed = errors.length > 0 ? errors : issues;
  if (displayed.length === 0) return "가져오기 오류가 없어요.";
  const first = displayed[0];
  const suffix = displayed.length > 1 ? ` 외 ${displayed.length - 1}곳` : "";
  return `${first.sheet} 탭 ${first.row}행 ${first.column}열을 확인해 주세요: ${first.message}${suffix}`;
}

export function createStoryImportSnapshot({
  source,
  names,
  project,
  speakers = "",
  chapters,
  chapterResources = "",
  lines,
  creativeMemos = "",
}: {
  source: StoryImportSource;
  names?: Partial<
    Record<
      "project" | "speakers" | "chapters" | "chapterResources" | "lines" | "creativeMemos",
      string
    >
  >;
  project: string;
  speakers?: string;
  chapters: string;
  chapterResources?: string;
  lines: string;
  creativeMemos?: string;
}): StoryImportSnapshot {
  return {
    source,
    project: { name: names?.project ?? "이야기 구성", csv: project },
    speakers: { name: names?.speakers ?? "화자", csv: speakers },
    chapters: { name: names?.chapters ?? "장의 흐름", csv: chapters },
    chapterResources: {
      name: names?.chapterResources ?? "장의 자료",
      csv: chapterResources,
    },
    lines: { name: names?.lines ?? "컷 대본", csv: lines },
    creativeMemos: { name: names?.creativeMemos ?? "창작 메모", csv: creativeMemos },
  };
}
