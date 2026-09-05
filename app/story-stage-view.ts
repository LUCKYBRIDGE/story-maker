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
      placement: stagePlacementClass(id),
      mirrored: stageShouldMirror(id, side),
    };
  };
  return {
    background: { id: backgroundId, src: backgroundAsset?.src, missing: Boolean(backgroundId && !backgroundAsset) },
    left: character("left"),
    right: character("right"),
    speakerName: line?.speakerName.trim() || "화자 없음",
    narration: line?.type === "narration",
  };
}
