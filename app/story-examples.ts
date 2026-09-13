import examples from "./story-examples.generated.json";
import type { StoryProject } from "./story-data";
import type { StoryTheme } from "./story-discovery";

export const EXAMPLE_SOURCE_COMMIT = examples.sourceCommit;
export function getExampleProject(theme: StoryTheme): StoryProject {
  const index = theme === "rabbit" ? 0 : theme === "onggojib" ? 1 : 2;
  return structuredClone(examples.projects[index]) as StoryProject;
}
