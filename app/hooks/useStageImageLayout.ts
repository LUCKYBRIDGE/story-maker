"use client";

import { useLayoutEffect, useRef } from "react";

// Cache the actual transparent foot margin, normalized to each source's own canvas.
const footAnchors = new Map<string, number>();
function footAnchor(image: HTMLImageElement) {
  const cached = footAnchors.get(image.currentSrc);
  if (cached !== undefined) return cached;
  const canvas = document.createElement("canvas");
  canvas.width = Math.min(256, image.naturalWidth);
  canvas.height = Math.ceil(canvas.width * image.naturalHeight / image.naturalWidth);
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return 1;
  try {
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
    for (let y = canvas.height - 1; y >= 0; y--) {
      for (let x = 0; x < canvas.width; x++) {
        if (pixels[(y * canvas.width + x) * 4 + 3] > 16) {
          const anchor = (y + 1) / canvas.height;
          footAnchors.set(image.currentSrc, anchor);
          return anchor;
        }
      }
    }
  } catch { /* Unknown/cross-origin images retain their full canvas bottom. */ }
  return 1;
}

/** Size the real image box, preserving source proportions and a common foot line.
 * Dialogue changes move the viewport; only window size / framing / user scale size actors.
 */
export function useStageImageLayout(variant: "thumbnail" | "editor" | "player", layoutKey: string) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const stage = ref.current;
    if (!stage) return;
    const frame = stage.closest<HTMLElement>(".story-scene-frame");
    const heading = frame?.querySelector<HTMLElement>(".story-scene-heading");
    const images = Array.from(stage.querySelectorAll<HTMLImageElement>("img.story-stage-actor"));
    const layout = () => {
      const width = stage.clientWidth;
      const top = variant === "player" && heading
        ? Math.ceil(Math.max(...Array.from(heading.querySelectorAll("summary, .reader-top-actions")).map(el => el.getBoundingClientRect().bottom - heading.getBoundingClientRect().top))) + 4
        : heading?.offsetHeight ?? 0;
      // The original 35% dock defines the preferred 100% size, independent of current dock height.
      const baseHeight = variant === "player" ? Math.min(430, Math.max(0, (window.innerHeight * .65 - 34 - top - 16) * .76))
        : Math.max(0, stage.clientHeight - 8) * .68;
      const actors = images.filter(image => image.naturalWidth).map(image => {
        const style = getComputedStyle(image);
        const scale = Number(style.getPropertyValue("--actor-scale")) || 1;
        const framing = image.classList.contains("framing-group") ? "group" : image.classList.contains("framing-upper") ? "upper" : "full";
        const slot = framing === "group" ? .62 : framing === "upper" ? .48 : .4;
        const height = Math.min(baseHeight, width * slot * image.naturalHeight / image.naturalWidth);
        const anchor = footAnchor(image);
        return { image, scale, height, anchor, width: height * image.naturalWidth / image.naturalHeight };
      });
      // Reserve transparent padding at the largest supported scale so visible feet do not drift.
      const footMargin = Math.max(0, ...actors.map(a => a.height * 1.4 * (1 - a.anchor)));
      const required = Math.ceil(Math.max(0, ...actors.map(a => a.height * a.scale * a.anchor)) + footMargin + 8);
      // Only the lower body may sit behind the dock; retain at least 65% of every actor.
      const dialogue = frame?.querySelector<HTMLElement>(".dialogue-box");
      const available = window.innerHeight - 34 - top - (dialogue?.offsetHeight ?? 0) - 16;
      const lowerBody = Math.min(...actors.map(a => a.height * a.scale * .35), 0.35 * required);
      const overlap = variant === "player" && actors.length ? Math.max(0, Math.min(required - available, lowerBody)) : 0;
      frame?.style.setProperty("--stage-lower-overlap", `${overlap}px`);
      frame?.style.setProperty("--stage-required-height", `${required}px`);
      frame?.style.setProperty("--stage-heading-height", `${top}px`);
      for (const actor of actors) {
        const { image, scale, height, anchor } = actor;
        image.style.width = `${actor.width * scale}px`;
        image.style.height = `${height * scale}px`;
        image.style.bottom = `${footMargin - height * scale * (1 - anchor)}px`;
        // Keep slot centers at their familiar positions, clamping enlarged/group content inside the stage.
        const center = width * (image.classList.contains("left") ? .24 : .76);
        image.style.left = `${Math.max(4, Math.min(width - actor.width * scale - 4, center - actor.width * scale / 2))}px`;
        image.style.right = "auto";
        image.dataset.footAnchor = String(anchor);
        image.dataset.layoutReady = "true";
      }
    };
    layout();
    const observer = new ResizeObserver(layout);
    observer.observe(stage);
    if (heading) observer.observe(heading);
    const dialogue = frame?.querySelector(".dialogue-box");
    if (dialogue) observer.observe(dialogue);
    images.forEach(image => image.addEventListener("load", layout));
    window.addEventListener("resize", layout);
    return () => {
      observer.disconnect();
      images.forEach(image => image.removeEventListener("load", layout));
      window.removeEventListener("resize", layout);
    };
  }, [variant, layoutKey]);
  return ref;
}
