import { STORY_ASSETS } from "./story-assets";
import type { Chapter, StoryLine } from "./story-data";

const assets = new Map(STORY_ASSETS.map(asset => [asset.id, asset]));

export const CHARACTER_FACING = new Map<string, "left" | "right">([
  ["seonnyeo.character.classic-woodcutter-holding-robe", "right"],
  ["seonnyeo.character.classic-woodcutter-in-bucket", "right"],
  ["seonnyeo.character.classic-celestial-horse", "right"],
  ["seonnyeo.character.classic-woodcutter-riding-horse", "right"],
  ["seonnyeo.character.classic-horse-startled-by-porridge", "right"],
  ["seonnyeo.character.classic-woodcutter-fallen", "right"],
  ["seonnyeo.character.classic-celestial-horse-departing", "right"],

  ["rabbit-turtle.character.classic-turtle-portrait", "left"],
  ["rabbit-turtle.character.rabbit-shocked", "right"],
  ["rabbit-turtle.character.rabbit-thinking", "right"],
  ["rabbit-turtle.character.rabbit-suspicious", "right"],
  ["rabbit-turtle.character.rabbit-speaking-truth", "left"],
  ["rabbit-turtle.character.classic-rabbit-laugh", "right"],
  ["rabbit-turtle.character.turtle-resolve", "left"],
  ["rabbit-turtle.character.turtle-offer", "left"],
  ["rabbit-turtle.character.turtle-tired", "left"],
  ["rabbit-turtle.character.dragonking-sick-elder-attached", "left"],
  ["onggojib.character.classic-master", "left"],
  ["onggojib.character.classic-master-talisman", "right"],
  ["onggojib.character.classic-mother", "left"],
  ["onggojib.character.classic-mother-warm", "left"],
  ["onggojib.character.classic-servant-door", "right"],
  ["onggojib.character.classic-servant-usher", "right"],
  ["rabbit-turtle.character.turtle-unified-720x900", "left"],
  ["rabbit-turtle.character.turtle-child-unified-720x900", "left"],
  ["rabbit-turtle.character.rabbit-white-unified-720x900", "right"],
  ["rabbit-turtle.character.dragonking-unified-720x900", "left"],
  ["rabbit-turtle.character.dragonking-young-unified-720x900", "left"],
  ["rabbit-turtle.character.dragonking-recovered-unified-720x900", "left"],
  ["rabbit-turtle.character.physician-unified-720x900", "right"],
]);

// These composites still represent one adult's pose, so use the adult slot width.
const SEONNYEO_ADULT_COMPOSITES = new Set([
  "seonnyeo.character.classic-fairy-carrying-children",
  "seonnyeo.character.classic-fairy-holding-first-baby",
  "seonnyeo.character.classic-woodcutter-in-bucket",
  "seonnyeo.character.classic-woodcutter-riding-horse",
  "seonnyeo.character.classic-horse-startled-by-porridge",
]);
const SEONNYEO_MOUNTED = new Set([
  "seonnyeo.character.classic-woodcutter-riding-horse",
  "seonnyeo.character.classic-horse-startled-by-porridge",
]);

export function stagePlacementClass(assetId: string) {
  if (SEONNYEO_ADULT_COMPOSITES.has(assetId)) return "framing-full";
  const framing = assets.get(assetId)?.framing;
  return framing === "상반신" ? "framing-upper"
    : framing === "여러 인물" ? "framing-group"
    : framing === "전신" ? "framing-full" : "";
}

export function stageShouldMirror(assetId: string, side: "left" | "right") {
  const facing = CHARACTER_FACING.get(assetId) || (assetId.startsWith("seonnyeo.character.") ? "left" : undefined);
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
      scale: SEONNYEO_MOUNTED.has(id) ? 1.4
        : (asset?.story === "별주부전" || asset?.story === "토끼와 자라") && asset.group === "어린 자라" ? 0.72
        : asset?.story === "옹고집전" && ["아이", "둘째 아이", "막내 아이"].includes(asset.group) ? 0.62
        : asset?.story === "선녀와 나무꾼" && asset.group === "두 아이" ? 0.62
        : asset?.story === "선녀와 나무꾼" && asset.group === "사슴" ? 0.72
        : asset?.story === "선녀와 나무꾼" && asset.group === "수탉" ? 0.48
        : asset?.story === "선녀와 나무꾼" && asset.group === "날개옷" ? 0.65 : 1,
      mirrored: stageShouldMirror(id, side),
      sharedActor: id === "rabbit-turtle.character.classic-riding" || [
        "seonnyeo.character.classic-woodcutter-in-bucket",
        "seonnyeo.character.classic-woodcutter-riding-horse",
        "seonnyeo.character.classic-horse-startled-by-porridge",
      ].includes(id),
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
