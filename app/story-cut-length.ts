/** UI pacing rule, not a storage/schema limit. Never truncate imported writing. */
export const STORY_CUT_CHARACTER_LIMIT = 160;
const segmenter = new Intl.Segmenter("ko", { granularity: "grapheme" });

function characters(text: string): string[] {
  return Array.from(segmenter.segment(text), part => part.segment);
}

export function countStoryCharacters(text: string): number {
  return characters(text).length;
}

/** Keep every character, including whitespace, and prefer sentence/word boundaries. */
export function splitStoryText(text: string): string[] {
  const units = characters(text);
  const chunks: string[] = [];
  let start = 0;
  while (units.length - start > STORY_CUT_CHARACTER_LIMIT) {
    let end = start + STORY_CUT_CHARACTER_LIMIT;
    const earliest = start + Math.floor(STORY_CUT_CHARACTER_LIMIT / 2);
    let wordBoundary = 0;
    for (let index = end - 1; index >= earliest; index--) {
      if (/\s/u.test(units[index])) {
        wordBoundary ||= index + 1;
        if (units[index].includes("\n") || /[.!?。！？]/u.test(units[index - 1])) {
          end = index + 1;
          break;
        }
      }
      if (index === earliest && wordBoundary) end = wordBoundary;
    }
    chunks.push(units.slice(start, end).join(""));
    start = end;
  }
  chunks.push(units.slice(start).join(""));
  return chunks;
}
