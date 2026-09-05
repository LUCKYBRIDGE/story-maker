/* eslint-disable @next/next/no-img-element */
"use client";

import { StoryStageCanvas } from "./StoryStage";

import { ASSET_BY_ID } from "./AssetPickerButton";
import type { Chapter, StoryLine } from "../story-data";

import { resolveStoryStage, stagePlacementClass, stageShouldMirror } from "../story-stage-view";
export { CHARACTER_FACING } from "../story-stage-view";

export function assetPlacementClass(assetId: string) { return stagePlacementClass(assetId); }
export function shouldMirrorAsset(assetId: string, side: "left" | "right") { return stageShouldMirror(assetId, side); }

export function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

export function containsParentheses(value: string) {
  return /[()（）]/.test(value);
}

export function AssetPreview({
  assetId,
  className,
  alt,
  loading = "lazy",
}: {
  assetId: string;
  className?: string;
  alt: string;
  loading?: "lazy" | "eager";
}) {
  const asset = ASSET_BY_ID.get(assetId);
  if (!asset) return null;
  return (
    <img
      className={className}
      src={asset.src}
      alt={alt}
      loading={loading}
      decoding="async"
      draggable={false}
    />
  );
}

export function SceneThumbnail({
  chapter,
  line,
}: {
  chapter: Chapter;
  line: StoryLine;
}) {
  const stage = resolveStoryStage(chapter, line);
  return (
    <div
      className={`scene-thumbnail ${line.type}`}
    >
      <StoryStageCanvas stage={stage} variant="thumbnail" />
      <span>
        {line.type === "narration"
          ? "해설"
          : `${stage.speakerName}: ${
              line.text || "빈 대사"
            }`}
      </span>
    </div>
  );
}
