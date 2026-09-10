import type { StoryLine } from "./story-data";
export function lineSpeakerNames(line: Pick<StoryLine, "type" | "speakerName" | "coSpeakerNames">): string[] {
  if (line.type === "narration") return [];
  return [...new Set([line.speakerName, ...(line.coSpeakerNames ?? [])].map(name => name.trim()).filter(Boolean))];
}
