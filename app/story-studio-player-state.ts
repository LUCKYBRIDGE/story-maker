import type { StoryProject } from "./story-data";

export type StoryPlaybackContext = {
  kind: "student" | "example";
  project: StoryProject;
};

export function createStoryPlaybackContext(
  kind: StoryPlaybackContext["kind"], project: StoryProject,
): StoryPlaybackContext {
  return { kind, project: structuredClone(project) };
}

// Include ancestors so a button icon or nested editable text keeps native keys.
export const STORY_PLAYER_INTERACTIVE_SELECTOR =
  'input, textarea, select, button, a[href], summary, [contenteditable], [role="button"], [role="textbox"], [role="combobox"], [role="slider"], [role="spinbutton"]';

export function shouldHandleStoryPlayerKey(event: KeyboardEvent) {
  return !event.defaultPrevented && !event.isComposing &&
    !event.altKey && !event.ctrlKey && !event.metaKey &&
    event.target instanceof Element &&
    !event.target.closest(STORY_PLAYER_INTERACTIVE_SELECTOR);
}

export type StoryStudioView = "studio" | "play";

export type StoryStudioPlayerState = {
  view: StoryStudioView;
  playIndex: number;
  context?: StoryPlaybackContext;
};

export type StoryStudioPlayerAction =
  | { type: "open"; index: number; context?: StoryPlaybackContext }
  | { type: "change-index"; index: number }
  | { type: "close" };

export const INITIAL_STORY_STUDIO_PLAYER_STATE: StoryStudioPlayerState = {
  view: "studio",
  playIndex: 0,
};

function safeIndex(index: number) {
  return Number.isFinite(index) ? Math.max(0, Math.floor(index)) : 0;
}

export function storyStudioPlayerReducer(
  state: StoryStudioPlayerState,
  action: StoryStudioPlayerAction,
): StoryStudioPlayerState {
  switch (action.type) {
    case "open":
      return { view: "play", playIndex: safeIndex(action.index),
        ...(action.context ? { context: action.context } : {}) };
    case "change-index":
      return { ...state, playIndex: safeIndex(action.index) };
    case "close":
      return { view: "studio", playIndex: state.playIndex };
  }
}
