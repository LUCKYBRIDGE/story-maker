"use client";

import { StoryStudio } from "./StoryStudio";
import { STORY_ASSETS } from "./story-assets";
import { applyStoryAssetTaxonomy } from "./story-asset-taxonomy";

// 기존 StoryAsset ID와 저장 형식은 유지하고, 이미지 Picker가 읽는 태그만 보강한다.
applyStoryAssetTaxonomy(STORY_ASSETS);

export function StoryStudioWithAssetTaxonomy() {
  return <StoryStudio />;
}
