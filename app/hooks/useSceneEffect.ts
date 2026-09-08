"use client";
import { useEffect, useRef } from "react";
import { isStorySceneEffect, playSceneEffect, type StorySceneEffect } from "../story-scene-effect";

export function useSceneEffect(effect: StorySceneEffect | undefined, playbackKey?: string | number) {
  const frameRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const frame = frameRef.current;
    if (!frame || !isStorySceneEffect(effect)) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let stop = () => {};
    const start = () => {
      stop();
      if (preference.matches) return;
      const targets = Array.from(frame.querySelectorAll<HTMLElement>(effect.type === "shake"
        ? ":scope > .story-stage-background, :scope > .story-stage-canvas"
        : ":scope > .scene-effect-overlay"));
      stop = playSceneEffect(targets, effect);
    };
    start();
    preference.addEventListener("change", start);
    return () => { stop(); preference.removeEventListener("change", start); };
  }, [effect, playbackKey]);
  return frameRef;
}
