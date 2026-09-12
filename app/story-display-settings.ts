export const DISPLAY_SETTINGS_KEY = "storygame:display-settings:v1";
export type StoryDisplaySettings = { dialoguePercent: number; characterScales: Record<string, number> };
export const DEFAULT_DISPLAY_SETTINGS: StoryDisplaySettings = { dialoguePercent: 35, characterScales: {} };
export function parseDisplaySettings(text: string | null): StoryDisplaySettings {
  try {
    const value = JSON.parse(text ?? "null");
    if (value?.version !== 1) return DEFAULT_DISPLAY_SETTINGS;
    const characterScales: Record<string, number> = {};
    if (value.characterScales && typeof value.characterScales === "object") {
      for (const [key, scale] of Object.entries(value.characterScales)) {
        if (typeof scale === "number" && Number.isFinite(scale) && key.includes(":")) characterScales[key] = Math.min(140, Math.max(40, Math.round(scale)));
      }
    }
    return { dialoguePercent: typeof value.dialoguePercent === "number" && Number.isFinite(value.dialoguePercent)
      ? Math.min(60, Math.max(20, Math.round(value.dialoguePercent))) : 35, characterScales };
  } catch { return DEFAULT_DISPLAY_SETTINGS; }
}
