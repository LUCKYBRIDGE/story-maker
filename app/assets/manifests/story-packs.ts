import type { StoryPack } from "../asset-types";
import { STORY_CHARACTERS } from "./characters";

export const STORY_PACKS: StoryPack[] = [
  { id: "rabbit-turtle", title: "별주부전", aliases: ["토끼와 자라", "토끼전"], recommendedCharacterIds: STORY_CHARACTERS.filter(c => c.storyPackIds.includes("rabbit-turtle")).map(c => c.id), order: 0 },
  { id: "onggojib", title: "옹고집전", aliases: [], recommendedCharacterIds: STORY_CHARACTERS.filter(c => c.storyPackIds.includes("onggojib")).map(c => c.id), order: 1 },
  { id: "seonnyeo", title: "선녀와 나무꾼", aliases: [], recommendedCharacterIds: STORY_CHARACTERS.filter(c => c.storyPackIds.includes("seonnyeo")).map(c => c.id), order: 2 },
  { id: "heungbu-nolbu", title: "흥부와 놀부", aliases: ["흥부전"], recommendedCharacterIds: STORY_CHARACTERS.filter((character) => character.storyPackIds.includes("heungbu-nolbu")).map((character) => character.id), order: 3 },
];

export function findStoryPackByTitle(title: string) {
  return STORY_PACKS.find((pack) => pack.title === title || pack.aliases.includes(title));
}
