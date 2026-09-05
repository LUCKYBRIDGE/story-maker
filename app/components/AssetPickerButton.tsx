"use client";
/* eslint-disable @next/next/no-img-element -- 작품 자료는 동적으로 고른 투명 WebP 이미지입니다. */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { STORY_ASSETS, type StoryAsset } from "../story-assets";
import {
  groupStoryAssets,
  normalizeAssetSearch,
  sortStoryAssets,
} from "../story-asset-picker-utils";

export type AssetView = "all" | "favorites" | "recent";
export type AssetLibraryScope = "recommended" | "all";

export const ASSET_BY_ID = new Map(
  STORY_ASSETS.map((asset) => [asset.id, asset]),
);
export const CHARACTER_ASSETS = STORY_ASSETS.filter(
  (asset) => asset.type === "character",
);
export const BACKGROUND_ASSETS = STORY_ASSETS.filter(
  (asset) => asset.type === "background",
);
export const STORY_FILTER_TAGS = ["토끼와 자라", "옹고집전"];
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
  favoriteIds: string[];
  recentIds: string[];
  onSelect: (assetId: string) => void;
  onToggleFavorite: (assetId: string) => void;
}

export function AssetPickerButton({
  type,
  label,
  buttonText,
  value,
  currentValue,
  defaultValue,
  currentLabel = "현재 선택",
  allowDefault = false,
  defaultLabel = "장의 기본 이미지",
  applyButtonText = "이 이미지 사용",
  selectionContextKey = "",
  favoriteIds,
  recentIds,
  onSelect,
  onToggleFavorite,
}: AssetPickerButtonProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [view, setView] = useState<AssetView>("all");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [libraryScope, setLibraryScope] =
    useState<AssetLibraryScope>("recommended");
  const [pendingAssetId, setPendingAssetId] = useState(value ?? "");
  const initializedFilters = useRef(false);
  const openerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const openedContextRef = useRef("");
  const assets = type === "character" ? CHARACTER_ASSETS : BACKGROUND_ASSETS;
  const featuredTagGroups = useMemo(
    () => [
      {
        label: "작품",
        tags: STORY_FILTER_TAGS.filter((tag) =>
          assets.some((asset) => asset.tags.includes(tag)),
        ),
      },
      {
        label: "자료",
        tags: USAGE_FILTER_TAGS.filter((tag) =>
          assets.some((asset) => asset.tags.includes(tag)),
        ),
      },
      ...(type === "character"
        ? [
            {
              label: "구도",
              tags: FRAMING_FILTER_TAGS.filter((tag) =>
                assets.some((asset) => asset.tags.includes(tag)),
              ),
            },
          ]
        : []),
    ],
    [assets, type],
  );
  const featuredTags = useMemo(
    () => featuredTagGroups.flatMap((group) => group.tags),
    [featuredTagGroups],
  );
  const availableTags = useMemo(
    () =>
      Array.from(new Set(assets.flatMap((asset) => asset.tags)))
        .filter(
          (tag) =>
            !featuredTags.includes(tag) &&
            !SELECTION_TIER_TAGS.includes(tag),
        )
        .sort((a, b) => a.localeCompare(b, "ko")),
    [assets, featuredTags],
  );
  const filteredAssets = useMemo(() => {
    const query = normalizeAssetSearch(search);
    const matchedAssets = assets.filter((asset) => {
      if (
        libraryScope === "recommended" &&
        asset.selectionTier !== "기본 추천"
      ) {
        return false;
      }
      if (view === "favorites" && !favoriteIds.includes(asset.id)) {
        return false;
      }
      if (view === "recent" && !recentIds.includes(asset.id)) return false;
      const matchesSearch =
        !query ||
        [asset.displayName, asset.label, asset.story, ...asset.tags].some(
          (candidate) => normalizeAssetSearch(candidate).includes(query),
        );
      return matchesSearch && tags.every((tag) => asset.tags.includes(tag));
    });
    return view === "recent"
      ? matchedAssets.sort(
          (a, b) => recentIds.indexOf(a.id) - recentIds.indexOf(b.id),
        )
      : sortStoryAssets(matchedAssets, type);
  }, [
    assets,
    favoriteIds,
    libraryScope,
    recentIds,
    search,
    tags,
    type,
    view,
  ]);
  const recommendedAssetCount = assets.filter(
    (asset) => asset.selectionTier === "기본 추천",
  ).length;
  const filteredAssetGroups = groupStoryAssets(
    filteredAssets,
    type,
    view === "recent",
  );
  const selectedAsset = currentValue || value
    ? ASSET_BY_ID.get(currentValue || value || "")
    : undefined;
  const pendingAsset = pendingAssetId
    ? ASSET_BY_ID.get(pendingAssetId)
    : allowDefault && defaultValue
      ? ASSET_BY_ID.get(defaultValue)
      : undefined;
  const clearFindConditions = () => {
    setSearch("");
    setTags([]);
    setView("all");
  };

  const closePicker = useCallback(() => {
    setOpen(false);
    setPendingAssetId(value ?? "");
    window.requestAnimationFrame(() => openerRef.current?.focus());
  }, [value]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    const closeWithEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") closePicker();
      if (event.key !== "Tab") return;
      const focusable = Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(
          'button:not(:disabled), input:not(:disabled), select:not(:disabled), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      ).filter((element) => !element.hasAttribute("hidden"));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeWithEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeWithEscape);
    };
  }, [closePicker, open]);

  useEffect(() => {
    if (!open || openedContextRef.current === selectionContextKey) return;
    closePicker();
  }, [closePicker, open, selectionContextKey]);

  return (
    <>
      <button
        ref={openerRef}
        type="button"
        className="asset-open-button"
        onClick={() => {
          if (!initializedFilters.current) {
            const selectedAsset = currentValue || value
              ? ASSET_BY_ID.get(currentValue || value || "")
              : undefined;
            if (selectedAsset?.type === type) {
              setTags([selectedAsset.story]);
              if (selectedAsset.selectionTier === "추가 자료") {
                setLibraryScope("all");
              }
            }
            initializedFilters.current = true;
          }
          setPendingAssetId(value ?? "");
          openedContextRef.current = selectionContextKey;
          setOpen(true);
        }}
      >
        {buttonText}
      </button>
      {open &&
        createPortal(
          <div
            className="asset-picker-overlay"
            role="presentation"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) closePicker();
            }}
          >
            <section
              ref={dialogRef}
              className="asset-picker-dialog"
              role="dialog"
              aria-modal="true"
              aria-label={`${label} 이미지 선택`}
            >
              <header>
                <div>
                  <span className="eyebrow">
                    {type === "character"
                      ? "캐릭터 이미지 고르기"
                      : "배경 이미지 고르기"}
                  </span>
                  <h2>{label}</h2>
                  <p>원하는 그림을 누르면 선택되고 이 창이 닫혀요.</p>
                </div>
                <button
                  type="button"
                  className="asset-picker-close"
                  onClick={closePicker}
                  aria-label="이미지 선택 닫기"
                >
                  ×
                </button>
              </header>
              {selectedAsset?.type === type && (
                <div className="asset-picker-current">
                  <span className={`asset-picker-current-thumb ${type}`}>
                    <img
                      src={selectedAsset.src}
                      alt=""
                      loading="lazy"
                      decoding="async"
                    />
                  </span>
                  <span>
                    <small>{currentLabel}</small>
                    <strong>{selectedAsset.displayName}</strong>
                    <b>{selectedAsset.label}</b>
                  </span>
                </div>
              )}
              {pendingAsset?.type === type &&
                (pendingAssetId !== (value ?? "") || !selectedAsset) && (
                  <div className="asset-picker-preview" aria-live="polite">
                    <span className={`asset-picker-current-thumb ${type}`}>
                      <img
                        src={pendingAsset.src}
                        alt=""
                        loading="lazy"
                        decoding="async"
                      />
                    </span>
                    <span>
                      <small>{pendingAssetId ? "선택 미리보기" : defaultLabel}</small>
                      <strong>{pendingAsset.displayName}</strong>
                      <b>{pendingAsset.label}</b>
                    </span>
                  </div>
                )}
              <div className="asset-picker-findbar">
                <input
                  className="asset-picker-search"
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={
                    type === "character"
                      ? "인물 이름, 표정, 동작으로 찾기"
                      : "장소, 시간, 분위기로 찾기"
                  }
                  aria-label="이미지 검색"
                  autoFocus
                />
                <button
                  type="button"
                  className={`asset-picker-filter-toggle ${
                    filtersOpen || tags.length > 0 ? "active" : ""
                  }`}
                  aria-expanded={filtersOpen}
                  onClick={() => setFiltersOpen((current) => !current)}
                >
                  <span>{filtersOpen ? "태그 닫기" : "태그로 좁히기"}</span>
                  {tags.length > 0 && <b>{tags.length}</b>}
                </button>
              </div>
              <div className="asset-picker-browsebar">
                <div className="asset-picker-view" aria-label="이미지 보기">
                  {[
                    ["all", "전체"],
                    ["favorites", `즐겨찾기 ${favoriteIds.length}`],
                    ["recent", "최근 사용"],
                  ].map(([mode, text]) => (
                    <button
                      type="button"
                      key={mode}
                      className={view === mode ? "active" : ""}
                      aria-pressed={view === mode}
                      onClick={() => setView(mode as AssetView)}
                    >
                      {text}
                    </button>
                  ))}
                </div>
                <div className="asset-picker-scope" aria-label="이미지 범위">
                  <button
                    type="button"
                    className={libraryScope === "recommended" ? "active" : ""}
                    aria-pressed={libraryScope === "recommended"}
                    onClick={() => setLibraryScope("recommended")}
                  >
                    추천 이미지 {recommendedAssetCount}
                  </button>
                  <button
                    type="button"
                    className={libraryScope === "all" ? "active" : ""}
                    aria-pressed={libraryScope === "all"}
                    onClick={() => setLibraryScope("all")}
                  >
                    모든 이미지 {assets.length}
                  </button>
                </div>
              </div>
              {filtersOpen && (
                <section className="asset-picker-filter-panel">
                  <div className="asset-picker-tag-heading">
                    <strong>태그로 이미지 좁히기</strong>
                    <small>여러 태그를 고르면 모두 맞는 이미지만 남아요.</small>
                  </div>
                  <div className="asset-picker-featured-filters">
                    {featuredTagGroups.map((group) => (
                      <div
                        className="asset-picker-filter-group"
                        key={group.label}
                        aria-label={`${group.label} 태그`}
                      >
                        <strong>{group.label}</strong>
                        <div>
                          {group.tags.map((tag) => (
                            <button
                              type="button"
                              key={tag}
                              className={tags.includes(tag) ? "active" : ""}
                              aria-pressed={tags.includes(tag)}
                              onClick={() =>
                                setTags((current) => [
                                  ...current.filter(
                                    (value) => !group.tags.includes(value),
                                  ),
                                  ...(current.includes(tag) ? [] : [tag]),
                                ])
                              }
                            >
                              {tag}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="asset-picker-tags" aria-label="이미지 태그">
                    {availableTags.map((tag) => (
                      <button
                        type="button"
                        key={tag}
                        className={tags.includes(tag) ? "active" : ""}
                        aria-pressed={tags.includes(tag)}
                        onClick={() =>
                          setTags((current) =>
                            current.includes(tag)
                              ? current.filter((value) => value !== tag)
                              : [...current, tag],
                          )
                        }
                      >
                        {tag}
                      </button>
                    ))}
                    {tags.length > 0 && (
                      <button
                        type="button"
                        className="clear-tags"
                        onClick={() => setTags([])}
                      >
                        선택한 태그 지우기
                      </button>
                    )}
                  </div>
                </section>
              )}
              <div className="asset-picker-result-summary">
                <p>
                  <strong>{filteredAssets.length}개</strong>의 이미지를 찾았어요.
                </p>
                {(search || tags.length > 0 || view !== "all") && (
                  <button type="button" onClick={clearFindConditions}>
                    검색·태그 초기화
                  </button>
                )}
              </div>
              <div className="asset-picker-results">
                {filteredAssetGroups.map((group) => (
                  <section className="asset-picker-result-group" key={group.label}>
                    <header>
                      <strong>{group.label}</strong>
                      <span>{group.assets.length}개</span>
                    </header>
                    <div className="asset-picker-grid">
                      {group.assets.map((asset) => (
                        <article
                          className={`asset-picker-card ${
                            pendingAssetId === asset.id ? "selected" : ""
                          } ${
                            value === asset.id ? "current" : ""
                          }`}
                          key={asset.id}
                        >
                          <button
                            type="button"
                            className={`asset-picker-favorite ${
                              favoriteIds.includes(asset.id) ? "active" : ""
                            }`}
                            onClick={() => onToggleFavorite(asset.id)}
                            aria-label={
                              favoriteIds.includes(asset.id)
                                ? `${asset.displayName} 즐겨찾기 해제`
                                : `${asset.displayName} 즐겨찾기`
                            }
                          >
                            {favoriteIds.includes(asset.id) ? "★" : "☆"}
                          </button>
                          <button
                            type="button"
                            className="asset-picker-option"
                            onClick={() => {
                              setPendingAssetId(asset.id);
                            }}
                            aria-pressed={pendingAssetId === asset.id}
                          >
                            <span className={`asset-picker-thumb ${asset.type}`}>
                              <img
                                src={asset.src}
                                alt=""
                                loading="lazy"
                                decoding="async"
                              />
                              {pendingAssetId === asset.id && (
                                <b className="asset-picker-selected-mark">
                                  ✓ 선택 미리보기
                                </b>
                              )}
                            </span>
                            <strong>{asset.displayName}</strong>
                            <small>{asset.label}</small>
                            <span className="asset-tag-summary">
                              {asset.story}
                              {asset.framing ? ` · ${asset.framing}` : ""}
                              {asset.selectionTier === "추가 자료"
                                ? " · 추가 이미지"
                                : ""}
                            </span>
                          </button>
                        </article>
                      ))}
                    </div>
                  </section>
                ))}
                {filteredAssets.length === 0 && (
                  <div className="asset-picker-empty">
                    <strong>찾은 이미지가 없어요.</strong>
                    <small>검색어를 바꾸거나 선택한 태그를 지워 보세요.</small>
                    <button type="button" onClick={clearFindConditions}>
                      검색·태그 초기화
                    </button>
                    {libraryScope === "recommended" && (
                      <button
                        type="button"
                        onClick={() => setLibraryScope("all")}
                      >
                        모든 이미지 보기
                      </button>
                    )}
                  </div>
                )}
              </div>
              <footer className="asset-picker-actions">
                {allowDefault && (
                  <button
                    type="button"
                    className="asset-picker-default"
                    aria-pressed={pendingAssetId === ""}
                    onClick={() => setPendingAssetId("")}
                  >
                    {defaultLabel}
                  </button>
                )}
                <button type="button" onClick={closePicker}>
                  취소
                </button>
                <button
                  type="button"
                  className="primary-button"
                  disabled={
                    pendingAssetId === (value ?? "") ||
                    (Boolean(pendingAssetId) && !pendingAsset)
                  }
                  onClick={() => {
                    if (openedContextRef.current !== selectionContextKey) {
                      closePicker();
                      return;
                    }
                    onSelect(pendingAssetId);
                    closePicker();
                  }}
                >
                  {applyButtonText}
                </button>
              </footer>
            </section>
          </div>,
          document.body,
        )}
    </>
  );
}
