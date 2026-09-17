import { getHeungbuProject } from "./story-heungbu";
import examples from "./story-examples.generated.json";
import { DEFAULT_COVER } from "./story-cover";
import type { StoryProject } from "./story-data";
import type { StoryTheme } from "./story-discovery";

export const EXAMPLE_SOURCE_COMMIT = examples.sourceCommit;
export function getExampleProject(theme: StoryTheme): StoryProject {
  if (theme === "heungbu") return getHeungbuProject();
  const index = theme === "rabbit" ? 0 : theme === "onggojib" ? 1 : 2;
  const project = structuredClone(examples.projects[index]) as StoryProject;
  if (theme === "seonnyeo" && !project.cover) {
    project.cover = { ...DEFAULT_COVER, theme: "night", subtitle: "두 고향과 선택",
      backgroundId: "seonnyeo.background.poster-art", characterId: "", titleSize: 34 };
  }
  return project;
}
