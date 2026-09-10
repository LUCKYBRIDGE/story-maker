import { cloneProject, type StoryProject } from "./story-data";
import { orderedStoryFlowLines, storyFlowTargets } from "./story-flow";

export type StoryTheme = "rabbit" | "onggojib";
export type DiscoveryScreen = "home" | "library" | "reader-entry" | "story-hub";
export const BASE_STORIES = [
  { theme: "rabbit", id: "rabbit-turtle", title: "토끼와 자라", description: "위기에 빠진 토끼는 어떤 선택을 할까요?" },
  { theme: "onggojib", id: "onggojib", title: "옹고집전", description: "똑같이 생긴 두 옹고집, 진짜는 누구일까요?" },
] as const;

export function libraryPage<T>(items: readonly T[], page: number, size: number) {
  const capacity = Math.max(1, Math.floor(size));
  const pages = Math.max(1, Math.ceil(items.length / capacity));
  const current = Math.max(0, Math.min(Math.floor(page), pages - 1));
  return { items: items.slice(current * capacity, (current + 1) * capacity), page: current, pages };
}

/** Copy only the playable graph into an editable seed. The full master stays intact. */
export function createBaseEditionDraft(master: StoryProject, theme: StoryTheme, id: string): StoryProject {
  const project = cloneProject(master);
  const ordered = orderedStoryFlowLines(master);
  const indices = new Map(ordered.map((line, index) => [line.id, index]));
  const reached = new Set<string>();
  const pending = ordered[0] ? [ordered[0].id] : [];
  while (pending.length) {
    const next = pending.pop()!;
    if (reached.has(next)) continue;
    const index = indices.get(next);
    if (index === undefined) throw new Error("기본 작품의 컷 연결을 확인하지 못했어요.");
    reached.add(next);
    for (const target of storyFlowTargets(ordered, index)) if (target !== null) pending.push(target);
  }
  project.id = id;
  project.source = { kind: "baseEdition", baseStoryId: BASE_STORIES.find(story => story.theme === theme)!.id, baseEditionId: master.id };
  project.lines = project.lines.filter(line => reached.has(line.id));
  const chapterIds = new Set(project.lines.map(line => line.chapterId));
  project.chapters = project.chapters.filter(chapter => chapterIds.has(chapter.id));
  return project;
}
