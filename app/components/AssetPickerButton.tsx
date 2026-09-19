"use client";

import { useRef, useState } from "react";
import { STORY_ASSETS, type StoryAsset } from "../story-assets";
import { STORY_PACKS } from "../assets/manifests/story-packs";
import { AssetBrowserDialog } from "./assets/AssetBrowserDialog";

export type AssetView = "all" | "favorites" | "recent";
export type AssetLibraryScope = "recommended" | "all";
export const ASSET_BY_ID = new Map(STORY_ASSETS.map(asset => [asset.id, asset]));
export const CHARACTER_ASSETS = STORY_ASSETS.filter(asset => asset.type === "character");
export const BACKGROUND_ASSETS = STORY_ASSETS.filter(asset => asset.type === "background");
export const STORY_FILTER_TAGS = STORY_PACKS.map(pack => pack.title);
export const USAGE_FILTER_TAGS = ["원작 사용", "추가 연출"];
export const FRAMING_FILTER_TAGS = ["전신", "상반신", "여러 인물"];
export const SELECTION_TIER_TAGS = ["기본 추천", "추가 자료"];

export interface AssetPickerButtonProps {
  type: StoryAsset["type"];
  label: string;
  buttonText: string;
  value?: string;
  currentValue?: string;
  defaultValue?: string;
  currentLabel?: string;
  allowDefault?: boolean;
  defaultLabel?: string;
  applyButtonText?: string;
  selectionContextKey?: string;
  chapterAssetIds?: string[];
  favoriteIds: string[];
  recentIds: string[];
  onSelect: (assetId: string) => void;
  onToggleFavorite: (assetId: string) => void;
}

export function AssetPickerButton(props: AssetPickerButtonProps) {
  return <AssetPickerTrigger key={props.selectionContextKey ?? ""} {...props} />;
}

function AssetPickerTrigger(props: AssetPickerButtonProps) {
  const [open, setOpen] = useState(false);
  const opener = useRef<HTMLButtonElement>(null);
  const [openedContext, setOpenedContext] = useState("");
  const context = props.selectionContextKey ?? "";
  const close = () => {
    setOpen(false);
    requestAnimationFrame(() => opener.current?.focus());
  };
  return <>
    <button ref={opener} type="button" className="asset-open-button" onClick={() => { setOpenedContext(context); setOpen(true); }}>{props.buttonText}</button>
    {open && openedContext === context && <AssetBrowserDialog {...props} onClose={close} />}
  </>;
}
