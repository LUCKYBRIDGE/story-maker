import examples from "./story-examples.generated.json";
import type { StoryProject } from "./story-data";

export const EXAMPLE_SOURCE_COMMIT = examples.sourceCommit;
export function getExampleProject(theme: "rabbit" | "onggojib"): StoryProject {
  return structuredClone(examples.projects[theme === "rabbit" ? 0 : 1]) as StoryProject;
}
