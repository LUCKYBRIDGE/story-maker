import { STORY_ASSETS } from "./story-assets";
import type { Chapter, StoryLine } from "./story-data";

const assets = new Map(STORY_ASSETS.map(asset => [asset.id, asset]));

export const CHARACTER_FACING = new Map<string, "left" | "right">([
  ["rabbit-turtle.character.turtle-unified-720x900", "left"],
  ["rabbit-turtle.character.turtle-child-unified-720x900", "left"],
  ["rabbit-turtle.character.rabbit-white-unified-720x900", "right"],
  ["rabbit-turtle.character.dragonking-unified-720x900", "left"],
  ["rabbit-turtle.character.dragonking-young-unified-720x900", "left"],
  ["rabbit-turtle.character.dragonking-recovered-unified-720x900", "left"],
  ["rabbit-turtle.character.physician-unified-720x900", "right"],
]);

export function stagePlacementClass(assetId: string) {
  const framing = assets.get(assetId)?.framing;
  return framing === "상반신" ? "framing-upper"
    : framing === "여러 인물" ? "framing-group"
    : framing === "전신" ? "framing-full" : "";
}

export function stageShouldMirror(assetId: string, side: "left" | "right") {
  const facing = CHARACTER_FACING.get(assetId);
  return Boolean(facing && facing !== (side === "left" ? "right" : "left"));
}

/** Read-only resolution: an invalid explicit cut ID never silently inherits another image. */
export function resolveStoryStage(chapter?: Chapter | null, line?: StoryLine | null) {
  const backgroundId = line?.backgroundId || chapter?.backgroundId || "";
  const backgroundAsset = assets.get(backgroundId);
  const character = (side: "left" | "right") => {
    const key = side === "left" ? "leftAssetId" : "rightAssetId";
    const id = line?.[key] || chapter?.[key] || "";
    const asset = assets.get(id);
    return {
      id,
      src: asset?.src,
      label: asset?.displayName || (side === "left" ? "왼쪽 인물" : "오른쪽 인물"),
      missing: Boolean(id && !asset),
      scaleGroup: asset ? `${asset.story}:${asset.group}` : "",
      scaleLabel: asset?.group ?? "",
      placement: stagePlacementClass(id),
      // An age variant has its own stage stature; never distort its head/body proportions.
      scale: asset?.story === "토끼와 자라" && asset.group === "어린 자라" ? 0.72
        : asset?.story === "옹고집전" && ["아이", "둘째 아이", "막내 아이"].includes(asset.group) ? 0.62 : 1,
      mirrored: stageShouldMirror(id, side),
    };
  };
  return {
    background: { meaningful: backgroundAsset?.backgroundRole !== "scenery", id: backgroundId, src: backgroundAsset?.src, missing: Boolean(backgroundId && !backgroundAsset) },
    left: character("left"),
    right: character("right"),
    speakerName: line?.speakerName.trim() || "화자 없음",
    narration: line?.type === "narration",
  };
}
