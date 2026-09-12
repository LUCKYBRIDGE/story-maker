export const DIALOGUE_FONT_BASE_STEPS = [36, 34, 32, 30, 28] as const;
export const READING_FONT_OFFSET_MIN = -4;
export const READING_FONT_OFFSET_MAX = 4;
export const READING_FONT_OFFSET_STEP = 2;
export const READING_FONT_MIN = 24;
export const READING_FONT_MAX = 40;
export const READING_HISTORY_BASE_FONT = 32;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function clampReadingFontOffset(value: number) {
  const stepped = Math.round(value / READING_FONT_OFFSET_STEP) * READING_FONT_OFFSET_STEP;
  return clamp(stepped, READING_FONT_OFFSET_MIN, READING_FONT_OFFSET_MAX);
}

export function dialogueFontCandidates(offset: number) {
  const safeOffset = clampReadingFontOffset(offset);
  return DIALOGUE_FONT_BASE_STEPS.map(size => clamp(size + safeOffset, READING_FONT_MIN, READING_FONT_MAX));
}

export function readingHistoryFontSize(offset: number) {
  return clamp(READING_HISTORY_BASE_FONT + clampReadingFontOffset(offset), READING_FONT_MIN, READING_FONT_MAX);
}
