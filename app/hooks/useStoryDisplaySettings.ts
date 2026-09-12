"use client";
import { useMemo, useSyncExternalStore } from "react";
import { DISPLAY_SETTINGS_KEY, parseDisplaySettings, type StoryDisplaySettings } from "../story-display-settings";
const listeners = new Set<() => void>();
let fallback: string | null = null;
function read() {
  try { return localStorage.getItem(DISPLAY_SETTINGS_KEY) ?? fallback; } catch { return fallback; }
}
function subscribe(listener: () => void) {
  listeners.add(listener);
  const changed = (event: StorageEvent) => { if (event.key === DISPLAY_SETTINGS_KEY || event.key === null) listener(); };
  window.addEventListener("storage", changed);
  return () => { listeners.delete(listener); window.removeEventListener("storage", changed); };
}
export function updateStoryDisplaySettings(update: (settings: StoryDisplaySettings) => StoryDisplaySettings) {
  const next = update(parseDisplaySettings(read()));
  const text = JSON.stringify({ version: 1, ...next });
  fallback = text;
  try { localStorage.setItem(DISPLAY_SETTINGS_KEY, text); } catch { /* Keep the adjustment for this open page when storage is unavailable. */ }
  listeners.forEach(listener => listener());
}
export function useStoryDisplaySettings() {
  const text = useSyncExternalStore(subscribe, read, () => null);
  return useMemo(() => parseDisplaySettings(text), [text]);
}
