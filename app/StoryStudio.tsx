"use client";
/* eslint-disable @next/next/no-img-element -- 작품 자료는 동적으로 고른 투명 WebP 이미지입니다. */

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { STORY_ASSETS, type StoryAsset } from "./story-assets";
import {
  cloneProject,
  createBlankProject,
  DEFAULT_PROJECT,
  ONGGOJIB_CONTINUATION_TEMPLATE,
  RABBIT_TURTLE_CONTINUATION_TEMPLATE,
  RABBIT_TURTLE_CONTINUATION_TEMPLATE_2,
  type Chapter,
  type StoryLine,
  type StoryProject,
} from "./story-data";
import {
  buildProjectFromSheet,
  extractSheetId,
  fetchSheetSnapshot,
} from "./story-sheet";

type WorkspaceMode = "plan" | "create";
type PlanningView = "story" | "chapters";
type EditorMode = "chapter" | "scene";
type ImageView = "text" | "small";
type AssetView = "all" | "favorites" | "recent";
type AssetLibraryScope = "recommended" | "all";
type UpdateMode = "sheet" | "draft" | "excel";
type CreatorAccess = "none" | "local";

const DRAFT_KEY = "storygame:draft:v1";
const ACTIVE_KEY = "storygame:active:v1";
const BACKUP_KEY = "storygame:backup:v1";
const FAVORITES_KEY = "storygame:asset-favorites:v1";
const RECENTS_KEY = "storygame:asset-recents:v1";
const ASSET_BY_ID = new Map(STORY_ASSETS.map((asset) => [asset.id, asset]));
const CHARACTER_ASSETS = STORY_ASSETS.filter(
  (asset) => asset.type === "character",
);
const BACKGROUND_ASSETS = STORY_ASSETS.filter(
  (asset) => asset.type === "background",
);
const CHARACTER_FACING = new Map<string, "left" | "right">([
  ["rabbit-turtle.character.turtle-unified-720x900", "left"],
  ["rabbit-turtle.character.turtle-child-unified-720x900", "left"],
  ["rabbit-turtle.character.rabbit-white-unified-720x900", "right"],
  ["rabbit-turtle.character.dragonking-unified-720x900", "left"],
  ["rabbit-turtle.character.dragonking-young-unified-720x900", "left"],
  ["rabbit-turtle.character.dragonking-recovered-unified-720x900", "left"],
  ["rabbit-turtle.character.physician-unified-720x900", "right"],
]);
const STORY_FILTER_TAGS = ["토끼와 자라", "옹고집전"];
const USAGE_FILTER_TAGS = ["원작 사용", "추가 연출"];
const FRAMING_FILTER_TAGS = ["전신", "상반신", "여러 인물"];
const SELECTION_TIER_TAGS = ["기본 추천", "추가 자료"];
const RABBIT_TURTLE_CHARACTER_ORDER = [
  "토끼",
  "자라",
  "용왕",
  "의관",
  "어린 자라",
  "젊은 용왕",
];
const ONGGOJIB_CHARACTER_ORDER = [
  "진짜 옹고집",
  "가짜 옹고집",
  "옹고집의 아내",
  "막내 아이",
  "둘째 아이",
  "사또",
  "포졸",
  "옹고집의 하인",
  "일꾼",
];

type StoryArcKey = "opening" | "middle" | "crisis" | "climax" | "ending";

const STORY_STRUCTURE_OPTIONS: Array<{
  mode: StoryProject["planning"]["structureMode"];
  title: string;
  shortTitle: string;
  steps: Array<{ label: string; guide: string; key: StoryArcKey }>;
}> = [
  {
    mode: "five",
    title: "발단 → 전개 → 위기 → 절정 → 결말",
    shortTitle: "5단계",
    steps: [
      {
        label: "발단",
        guide: "인물과 배경을 보여 주고, 어떤 사건이 시작되나요?",
        key: "opening",
      },
      {
        label: "전개",
        guide: "주인공이 목표를 향해 움직이며 갈등이 어떻게 커지나요?",
        key: "middle",
      },
      {
        label: "위기",
        guide: "가장 큰 어려움이 닥치고, 어떤 선택 앞에 서나요?",
        key: "crisis",
      },
      {
        label: "절정",
        guide: "갈등을 풀기 위해 주인공이 하는 가장 중요한 행동은?",
        key: "climax",
      },
      {
        label: "결말",
        guide: "행동의 결과는 무엇이고, 인물이나 상황이 어떻게 달라지나요?",
        key: "ending",
      },
    ],
  },
  {
    mode: "four",
    title: "발단 → 전개 → 위기 → 결말",
    shortTitle: "4단계",
    steps: [
      {
        label: "발단",
        guide: "인물과 배경을 보여 주고, 어떤 사건이 시작되나요?",
        key: "opening",
      },
      {
        label: "전개",
        guide: "주인공이 목표를 향해 움직이며 갈등이 어떻게 커지나요?",
        key: "middle",
      },
      {
        label: "위기",
        guide: "가장 큰 어려움이 닥치고, 주인공은 무엇을 선택하나요?",
        key: "crisis",
      },
      {
        label: "결말",
        guide: "선택의 결과는 무엇이고, 인물이나 상황이 어떻게 달라지나요?",
        key: "ending",
      },
    ],
  },
  {
    mode: "three",
    title: "처음 → 중간 → 끝",
    shortTitle: "3단계",
    steps: [
      {
        label: "처음",
        guide: "누가 어디에 있고, 어떤 일이 시작되나요?",
        key: "opening",
      },
      {
        label: "중간",
        guide: "어떤 문제가 생기고, 인물은 무엇을 하나요?",
        key: "middle",
      },
      {
        label: "끝",
        guide: "문제는 어떻게 마무리되고, 무엇이 달라지나요?",
        key: "ending",
      },
    ],
  },
];

function chapterArcLabel(
  chapterIndex: number,
  chapterCount: number,
  steps: Array<{ label: string }>,
) {
  if (steps.length === 0) return "이야기";
  if (chapterCount <= 1) return steps[0].label;
  const stepIndex = Math.round(
    (chapterIndex * (steps.length - 1)) / (chapterCount - 1),
  );
  return steps[Math.min(stepIndex, steps.length - 1)].label;
}

function normalizeSearch(value: string) {
  return value
    .trim()
    .toLocaleLowerCase("ko")
    .replace(/\.png$/i, "")
    .replace(/[·_\-\s]/g, "");
}

function containsParentheses(value: string) {
  return /[()（）]/.test(value);
}

function DialogueText({ text }: { text: string }) {
  const parts = text.split(/(\([^()]*\)|（[^（）]*）)/g);

  return (
    <>
      {parts.map((part, index) =>
        /^\([^()]*\)$|^（[^（）]*）$/.test(part) ? (
          <span className="parenthetical-direction" key={`${part}-${index}`}>
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </>
  );
}

function assetName(assetId: string) {
  return ASSET_BY_ID.get(assetId)?.displayName ?? "";
}

function assetPlacementClass(assetId: string) {
  const framing = ASSET_BY_ID.get(assetId)?.framing;
  if (framing === "상반신") return "framing-upper";
  if (framing === "여러 인물") return "framing-group";
  return framing === "전신" ? "framing-full" : "";
}

function shouldMirrorAsset(assetId: string, side: "left" | "right") {
  const currentFacing = CHARACTER_FACING.get(assetId);
  const inwardFacing = side === "left" ? "right" : "left";
  return Boolean(currentFacing && currentFacing !== inwardFacing);
}

function assetGroupLabel(asset: StoryAsset, type: StoryAsset["type"]) {
  return type === "character"
    ? `${asset.selectionTier} · ${asset.framing ?? "구도 미분류"}`
    : asset.selectionTier;
}

function assetGroupRank(asset: StoryAsset, type: StoryAsset["type"]) {
  const selectionRank = asset.selectionTier === "기본 추천" ? 0 : 20;
  const usageRank = asset.usage === "원작 사용" ? 0 : 10;
  if (type !== "character") return selectionRank + usageRank;
  const framingRank =
    asset.framing === "전신"
      ? 0
      : asset.framing === "상반신"
        ? 1
        : asset.framing === "여러 인물"
          ? 2
          : 3;
  return selectionRank + usageRank + framingRank;
}

function sortAssets(
  assets: StoryAsset[],
  type: StoryAsset["type"],
): StoryAsset[] {
  return assets.slice().sort((a, b) => {
    const groupDifference =
      assetGroupRank(a, type) - assetGroupRank(b, type);
    if (groupDifference !== 0) return groupDifference;
    const storyDifference =
      (a.story === "토끼와 자라" ? 0 : 1) -
      (b.story === "토끼와 자라" ? 0 : 1);
    if (storyDifference !== 0) return storyDifference;
    if (type === "character" && a.story === "토끼와 자라") {
      const characterDifference =
        (RABBIT_TURTLE_CHARACTER_ORDER.indexOf(a.group) + 1 || 99) -
        (RABBIT_TURTLE_CHARACTER_ORDER.indexOf(b.group) + 1 || 99);
      if (characterDifference !== 0) return characterDifference;
      const poseDifference =
        (a.pose === "기본" || a.pose === "전신" ? 0 : 1) -
        (b.pose === "기본" || b.pose === "전신" ? 0 : 1);
      if (poseDifference !== 0) return poseDifference;
    }
    if (type === "character" && a.story === "옹고집전") {
      const characterDifference =
        (ONGGOJIB_CHARACTER_ORDER.indexOf(a.group) + 1 || 99) -
        (ONGGOJIB_CHARACTER_ORDER.indexOf(b.group) + 1 || 99);
      if (characterDifference !== 0) return characterDifference;
    }
    const characterDifference = a.group.localeCompare(b.group, "ko");
    return characterDifference || a.pose.localeCompare(b.pose, "ko");
  });
}

function groupAssets(
  assets: StoryAsset[],
  type: StoryAsset["type"],
  preserveOrder = false,
): Array<{ label: string; assets: StoryAsset[] }> {
  const groups = new Map<string, StoryAsset[]>();
  for (const asset of preserveOrder ? assets : sortAssets(assets, type)) {
    const label = assetGroupLabel(asset, type);
    groups.set(label, [...(groups.get(label) ?? []), asset]);
  }
  return Array.from(groups, ([label, groupedAssets]) => ({
    label,
    assets: groupedAssets,
  }));
}

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

function projectContent(project: StoryProject) {
  return JSON.stringify({ ...project, updatedAt: "" });
}

function findContinuationPoint(
  project: StoryProject,
): NonNullable<StoryProject["continuation"]> | null {
  if (
    project.continuation &&
    project.chapters.some(
      (chapter) => chapter.id === project.continuation?.chapterId,
    ) &&
    project.lines.some((line) => line.id === project.continuation?.lineId)
  ) {
    return project.continuation;
  }

  const continuationChapter = project.chapters
    .slice()
    .sort((a, b) => a.order - b.order)
    .find((chapter) => chapter.title.includes("이어 쓰기"));
  const continuationLine = project.lines
    .filter((line) => line.chapterId === continuationChapter?.id)
    .sort((a, b) => a.order - b.order)[0];

  return continuationChapter && continuationLine
    ? {
        chapterId: continuationChapter.id,
        lineId: continuationLine.id,
        label: continuationChapter.summary || "이어서 쓸 첫 장면",
      }
    : null;
}

function AssetPreview({
  assetId,
  className,
  alt,
}: {
  assetId: string;
  className?: string;
  alt: string;
}) {
  const asset = ASSET_BY_ID.get(assetId);
  if (!asset) return null;
  return (
    <img
      className={className}
      src={asset.src}
      alt={alt}
      loading="lazy"
      draggable={false}
    />
  );
}

function AssetPickerButton({
  type,
  label,
  buttonText,
  value,
  favoriteIds,
  recentIds,
  onSelect,
  onToggleFavorite,
}: {
  type: StoryAsset["type"];
  label: string;
  buttonText: string;
  value?: string;
  favoriteIds: string[];
  recentIds: string[];
  onSelect: (assetId: string) => void;
  onToggleFavorite: (assetId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [view, setView] = useState<AssetView>("all");
  const [libraryScope, setLibraryScope] =
    useState<AssetLibraryScope>("recommended");
  const initializedFilters = useRef(false);
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
    const query = normalizeSearch(search);
    const matchedAssets = assets
      .filter((asset) => {
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
            (candidate) => normalizeSearch(candidate).includes(query),
          );
        return matchesSearch && tags.every((tag) => asset.tags.includes(tag));
      });
    return view === "recent"
      ? matchedAssets.sort(
          (a, b) => recentIds.indexOf(a.id) - recentIds.indexOf(b.id),
        )
      : sortAssets(matchedAssets, type);
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
  const filteredAssetGroups = groupAssets(
    filteredAssets,
    type,
    view === "recent",
  );

  return (
    <>
      <button
        type="button"
        className="asset-open-button"
        onClick={() => {
          if (!initializedFilters.current) {
            const selectedAsset = value ? ASSET_BY_ID.get(value) : undefined;
            if (selectedAsset?.type === type) {
              setTags([selectedAsset.story]);
              if (selectedAsset.selectionTier === "추가 자료") {
                setLibraryScope("all");
              }
            }
            initializedFilters.current = true;
          }
          setOpen(true);
        }}
      >
        {buttonText}
      </button>
      {open && (
        <div
          className="asset-picker-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <section
            className="asset-picker-dialog"
            role="dialog"
            aria-modal="true"
            aria-label={`${label} 이미지 선택`}
          >
            <header>
              <div>
                <span className="eyebrow">
                  {type === "character" ? "캐릭터 이미지" : "장소·배경"}
                </span>
                <h2>{label}</h2>
                <p>이미지는 이 창을 열었을 때만 보여요.</p>
              </div>
              <button
                type="button"
                className="asset-picker-close"
                onClick={() => setOpen(false)}
                aria-label="이미지 선택 닫기"
              >
                ×
              </button>
            </header>
            <input
              className="asset-picker-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="토끼, 놀람, 연회장처럼 검색"
              aria-label="이미지 검색"
              autoFocus
            />
            <div className="asset-picker-curation">
              <div>
                <strong>글상자 장면에 잘 맞는 자료부터</strong>
                <small>
                  {type === "character"
                    ? "한 명씩 분리되고 크기·화풍이 비교적 일정한 전신 이미지를 먼저 보여요."
                    : "캐릭터가 미리 합성되지 않은 장소 배경을 먼저 보여요."}
                </small>
              </div>
              <div
                className="asset-picker-scope"
                aria-label="추천 자료 표시 범위"
              >
                <button
                  type="button"
                  className={libraryScope === "recommended" ? "active" : ""}
                  onClick={() => setLibraryScope("recommended")}
                >
                  기본 추천 {recommendedAssetCount}
                </button>
                <button
                  type="button"
                  className={libraryScope === "all" ? "active" : ""}
                  onClick={() => setLibraryScope("all")}
                >
                  추가 자료까지 {assets.length}
                </button>
              </div>
            </div>
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
                  onClick={() => setView(mode as AssetView)}
                >
                  {text}
                </button>
              ))}
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
            <div className="asset-picker-tag-heading">
              <strong>태그</strong>
              <small>여러 개를 고르면 결과가 더 좁아져요.</small>
            </div>
            <div className="asset-picker-tags" aria-label="이미지 태그">
              {availableTags.map((tag) => (
                <button
                  type="button"
                  key={tag}
                  className={tags.includes(tag) ? "active" : ""}
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
                  태그 모두 지우기
                </button>
              )}
            </div>
            <p className="asset-picker-count">
              선택한 조건에 맞는 이미지 {filteredAssets.length}개
            </p>
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
                          value === asset.id ? "selected" : ""
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
                            onSelect(asset.id);
                            setOpen(false);
                          }}
                        >
                          <span className={`asset-picker-thumb ${asset.type}`}>
                            <img src={asset.src} alt="" loading="lazy" />
                          </span>
                          <span className="asset-picker-badges">
                            <b
                              className={
                                asset.selectionTier === "기본 추천"
                                  ? "recommended"
                                  : "additional"
                              }
                            >
                              {asset.selectionTier}
                            </b>
                            {asset.framing && <b>{asset.framing}</b>}
                          </span>
                          <strong>{asset.displayName}</strong>
                          <small>
                            {asset.story} · {asset.label}
                          </small>
                          <span className="asset-tag-summary">
                            {asset.tags.slice(0, 5).join(" · ")}
                          </span>
                          <em>
                            {value === asset.id ? "선택됨" : "이 이미지 선택"}
                          </em>
                        </button>
                      </article>
                    ))}
                  </div>
                </section>
              ))}
              {filteredAssets.length === 0 && (
                <div className="asset-picker-empty">
                  <strong>조건에 맞는 이미지가 없어요.</strong>
                  <button type="button" onClick={() => setTags([])}>
                    태그 모두 지우기
                  </button>
                  {libraryScope === "recommended" && (
                    <button
                      type="button"
                      onClick={() => setLibraryScope("all")}
                    >
                      추가 자료까지 보기
                    </button>
                  )}
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </>
  );
}

function ImageField({
  label,
  type,
  value,
  allowedIds,
  allowDefault = false,
  favoriteIds,
  recentIds,
  onChange,
  onUse,
  onToggleFavorite,
}: {
  label: string;
  type: StoryAsset["type"];
  value: string;
  allowedIds: string[];
  allowDefault?: boolean;
  favoriteIds: string[];
  recentIds: string[];
  onChange: (assetId: string) => void;
  onUse: (assetId: string) => void;
  onToggleFavorite: (assetId: string) => void;
}) {
  const allowedAssets = allowedIds
    .map((id) => ASSET_BY_ID.get(id))
    .filter(
      (asset): asset is StoryAsset => Boolean(asset && asset.type === type),
    );
  const allowedAssetGroups = groupAssets(allowedAssets, type);
  return (
    <label className="field image-field">
      <span>{label}</span>
      <div className="image-field-row">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-label={`${label} 선택`}
        >
          <option value="">
            {allowDefault ? "챕터 기본 이미지" : "선택 안 함"}
          </option>
          {allowedAssetGroups.map((group) => (
            <optgroup label={group.label} key={group.label}>
              {group.assets.map((asset) => (
                <option value={asset.id} key={asset.id}>
                  {asset.displayName}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        <AssetPickerButton
          type={type}
          label={label}
          buttonText="+ 자료 추가"
          value={value}
          favoriteIds={favoriteIds}
          recentIds={recentIds}
          onToggleFavorite={onToggleFavorite}
          onSelect={(assetId) => {
            onUse(assetId);
            onChange(assetId);
          }}
        />
      </div>
      <small>
        드롭다운에는 이 챕터에서 고른 자료만 표시됩니다.
      </small>
    </label>
  );
}

function ResourcePool({
  title,
  type,
  ids,
  favoriteIds,
  recentIds,
  onAdd,
  onRemove,
  onToggleFavorite,
}: {
  title: string;
  type: StoryAsset["type"];
  ids: string[];
  favoriteIds: string[];
  recentIds: string[];
  onAdd: (assetId: string) => void;
  onRemove: (assetId: string) => void;
  onToggleFavorite: (assetId: string) => void;
}) {
  return (
    <section className="resource-pool">
      <div className="resource-pool-heading">
        <strong>{title}</strong>
        <span>{ids.length}개</span>
      </div>
      <div className="resource-chip-list">
        {ids.map((id) => (
          <span className="resource-chip" key={id}>
            {assetName(id)}
            <button
              type="button"
              onClick={() => onRemove(id)}
              aria-label={`${assetName(id)} 챕터 자료에서 빼기`}
            >
              ×
            </button>
          </span>
        ))}
        {ids.length === 0 && (
          <span className="empty-resource-copy">아직 고른 자료가 없어요.</span>
        )}
      </div>
      <AssetPickerButton
        type={type}
        label={title}
        buttonText={
          type === "character" ? "+ 캐릭터 이미지 추가" : "+ 장소·배경 추가"
        }
        favoriteIds={favoriteIds}
        recentIds={recentIds}
        onSelect={onAdd}
        onToggleFavorite={onToggleFavorite}
      />
    </section>
  );
}

function AddSpeaker({
  onAdd,
}: {
  onAdd: (name: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const submit = () => {
    const next = name.trim();
    if (!next) return;
    onAdd(next);
    setName("");
    setOpen(false);
  };
  return (
    <div className="add-speaker">
      <button type="button" onClick={() => setOpen((current) => !current)}>
        {open ? "닫기" : "+ 화자 추가"}
      </button>
      {open && (
        <div>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="새 화자 이름"
            aria-label="새 화자 이름"
            autoFocus
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                submit();
              }
            }}
          />
          <button type="button" onClick={submit} disabled={!name.trim()}>
            추가
          </button>
        </div>
      )}
    </div>
  );
}

function SceneThumbnail({
  chapter,
  line,
}: {
  chapter: Chapter;
  line: StoryLine;
}) {
  const backgroundId = line.backgroundId || chapter.backgroundId;
  const leftId = line.leftAssetId || chapter.leftAssetId;
  const rightId = line.rightAssetId || chapter.rightAssetId;
  const background = ASSET_BY_ID.get(backgroundId)?.src;
  return (
    <div
      className={`scene-thumbnail ${line.type}`}
      style={background ? { backgroundImage: `url("${background}")` } : undefined}
    >
      <AssetPreview
        assetId={leftId}
        alt=""
        className={`scene-thumb-character left ${assetPlacementClass(leftId)} ${
          shouldMirrorAsset(leftId, "left") ? "mirrored" : ""
        }`}
      />
      <AssetPreview
        assetId={rightId}
        alt=""
        className={`scene-thumb-character right ${assetPlacementClass(rightId)} ${
          shouldMirrorAsset(rightId, "right") ? "mirrored" : ""
        }`}
      />
      <span>
        {line.type === "narration"
          ? "해설"
          : `${line.speakerName || "화자 없음"}의 대사`}
      </span>
    </div>
  );
}

function SceneStagingCopy({
  chapters,
  lines,
  currentLineId,
  onCopy,
}: {
  chapters: Chapter[];
  lines: StoryLine[];
  currentLineId: string;
  onCopy: (sourceLineId: string) => void;
}) {
  const [sourceLineId, setSourceLineId] = useState("");
  const sourceLine = lines.find((line) => line.id === sourceLineId);
  const sourceChapter = chapters.find(
    (chapter) => chapter.id === sourceLine?.chapterId,
  );
  const availableChapters = chapters
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((chapter) => ({
      chapter,
      lines: lines
        .filter(
          (line) =>
            line.chapterId === chapter.id && line.id !== currentLineId,
        )
        .sort((a, b) => a.order - b.order),
    }))
    .filter((group) => group.lines.length > 0);

  return (
    <section className="scene-staging-copy">
      <div>
        <span>장면 배치 가져오기</span>
        <strong>다른 장면의 이미지 배치를 그대로 사용</strong>
        <small>
          대사와 해설은 바꾸지 않고, 배경과 왼쪽·오른쪽 캐릭터만 가져와요.
        </small>
      </div>
      <div className="scene-staging-copy-controls">
        <select
          value={sourceLineId}
          onChange={(event) => setSourceLineId(event.target.value)}
          aria-label="배치를 가져올 장면"
        >
          <option value="">장면을 선택하세요</option>
          {availableChapters.map(({ chapter, lines: chapterLines }) => (
            <optgroup
              label={`${chapter.order}. ${chapter.title || "이름 없는 챕터"}`}
              key={chapter.id}
            >
              {chapterLines.map((line) => (
                <option value={line.id} key={line.id}>
                  장면 {line.order} · {line.speakerName || "해설"} ·{" "}
                  {line.text.trim().slice(0, 24) || "빈 글상자"}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        <button
          type="button"
          disabled={!sourceLineId}
          onClick={() => {
            onCopy(sourceLineId);
            setSourceLineId("");
          }}
        >
          이 배치 가져오기
        </button>
      </div>
      {sourceLine && sourceChapter && (
        <div className="scene-staging-copy-preview">
          <SceneThumbnail chapter={sourceChapter} line={sourceLine} />
          <span>
            <strong>
              {sourceChapter.order}. {sourceChapter.title || "이름 없는 챕터"} ·
              장면 {sourceLine.order}
            </strong>
            <small>
              왼쪽{" "}
              {assetName(
                sourceLine.leftAssetId || sourceChapter.leftAssetId,
              ) || "없음"}
              {" · "}오른쪽{" "}
              {assetName(
                sourceLine.rightAssetId || sourceChapter.rightAssetId,
              ) || "없음"}
              {" · "}배경{" "}
              {assetName(
                sourceLine.backgroundId || sourceChapter.backgroundId,
              ) || "없음"}
            </small>
          </span>
        </div>
      )}
    </section>
  );
}

function StoryPlayer({
  project,
  startIndex,
  onIndexChange,
  onBack,
}: {
  project: StoryProject;
  startIndex: number;
  onIndexChange: (index: number) => void;
  onBack: () => void;
}) {
  const lines = project.chapters
    .slice()
    .sort((a, b) => a.order - b.order)
    .flatMap((chapter) =>
      project.lines
        .filter((line) => line.chapterId === chapter.id)
        .sort((a, b) => a.order - b.order),
    );
  const line = lines[startIndex] ?? lines[0];
  const chapter = project.chapters.find(
    (candidate) => candidate.id === line?.chapterId,
  );
  const backgroundId = line?.backgroundId || chapter?.backgroundId || "";
  const leftId = line?.leftAssetId || chapter?.leftAssetId || "";
  const rightId = line?.rightAssetId || chapter?.rightAssetId || "";
  const background = ASSET_BY_ID.get(backgroundId)?.src;

  const playChapter = (chapterId: string) => {
    const index = lines.findIndex((candidate) => candidate.chapterId === chapterId);
    onIndexChange(index >= 0 ? index : 0);
  };

  return (
    <main className="player-shell">
      <div
        className="story-stage"
        style={
          background
            ? {
                backgroundImage: `linear-gradient(180deg, rgba(8, 17, 28, 0.05), rgba(8, 17, 28, 0.48)), url("${background}")`,
              }
            : undefined
        }
      >
        <header className="player-topbar">
          <div>
            <span className="eyebrow">스토리 플레이</span>
            <strong>{project.title}</strong>
          </div>
          <div className="player-top-actions">
            <label className="chapter-jump">
              <span className="sr-only">챕터 골라 시작</span>
              <select
                value={chapter?.id ?? ""}
                onChange={(event) => playChapter(event.target.value)}
              >
                {project.chapters
                  .slice()
                  .sort((a, b) => a.order - b.order)
                  .map((item) => (
                    <option value={item.id} key={item.id}>
                      {item.order}. {item.title}
                    </option>
                  ))}
              </select>
            </label>
            <button className="ghost-button light" onClick={onBack}>
              편집으로
            </button>
          </div>
        </header>
        <section className="character-layer" aria-label="이야기 장면">
          <AssetPreview
            assetId={leftId}
            alt={assetName(leftId) || "왼쪽 캐릭터"}
            className={`stage-character left ${assetPlacementClass(leftId)} ${
              line?.speaker === "right" ? "listener" : ""
            } ${shouldMirrorAsset(leftId, "left") ? "mirrored" : ""}`}
          />
          <AssetPreview
            assetId={rightId}
            alt={assetName(rightId) || "오른쪽 캐릭터"}
            className={`stage-character right ${assetPlacementClass(rightId)} ${
              line?.speaker === "left" ? "listener" : ""
            } ${shouldMirrorAsset(rightId, "right") ? "mirrored" : ""}`}
          />
        </section>
        <section
          className={`dialogue-box ${
            line?.type === "narration" ? "narration" : ""
          }`}
          aria-live="polite"
        >
          <div className="dialogue-meta">
            <span>
              {chapter?.order}. {chapter?.title}
            </span>
            <span>
              {lines.length > 0 ? startIndex + 1 : 0} / {lines.length}
            </span>
          </div>
          {line?.type === "narration" ? (
            <>
              <div className="narration-heading">
                <span>해설</span>
              </div>
              <p className="narration-copy">
                {line.text || "이 챕터에는 아직 글이 없어요."}
              </p>
            </>
          ) : (
            <>
              <strong className={`speaker-name ${line?.speaker ?? ""}`}>
                {line?.speakerName || "화자 없음"}
              </strong>
              <p>
                <DialogueText
                  text={line?.text || "이 챕터에는 아직 글이 없어요."}
                />
              </p>
            </>
          )}
          <div className="player-controls">
            <button
              className="ghost-button"
              disabled={startIndex === 0}
              onClick={() => onIndexChange(Math.max(0, startIndex - 1))}
            >
              이전
            </button>
            <button
              className="primary-button"
              disabled={startIndex >= lines.length - 1}
              onClick={() =>
                onIndexChange(Math.min(lines.length - 1, startIndex + 1))
              }
            >
              다음 장면
            </button>
          </div>
        </section>
      </div>
      <footer className="copyright-bar">
        기본 제공 이미지 © 놀퀴즈 · 토끼와 자라·옹고집전 이미지 사용
      </footer>
    </main>
  );
}

export function StoryStudio() {
  const [draft, setDraft] = useState<StoryProject>(() =>
    cloneProject(DEFAULT_PROJECT),
  );
  const [active, setActive] = useState<StoryProject>(() =>
    cloneProject(DEFAULT_PROJECT),
  );
  const [creatorAccess, setCreatorAccess] = useState<CreatorAccess>("none");
  const [view, setView] = useState<"studio" | "play">("studio");
  const [workspaceMode, setWorkspaceMode] =
    useState<WorkspaceMode>("create");
  const [planningView, setPlanningView] =
    useState<PlanningView>("story");
  const [editorMode, setEditorMode] = useState<EditorMode>("chapter");
  const [imageView, setImageView] = useState<ImageView>("text");
  const [selectedChapterId, setSelectedChapterId] = useState(
    DEFAULT_PROJECT.chapters[0].id,
  );
  const [selectedLineId, setSelectedLineId] = useState(
    DEFAULT_PROJECT.lines[0].id,
  );
  const [playIndex, setPlayIndex] = useState(0);
  const [projectToolsOpen, setProjectToolsOpen] = useState(false);
  const [mobileProjectOpen, setMobileProjectOpen] = useState(false);
  const [mobileEditorToolsOpen, setMobileEditorToolsOpen] = useState(false);
  const [chapterGuideOpen, setChapterGuideOpen] = useState(false);
  const [chapterResourcesOpen, setChapterResourcesOpen] = useState(false);
  const [sceneNotesOpen, setSceneNotesOpen] = useState(false);
  const [sceneSettingsOpen, setSceneSettingsOpen] = useState(false);
  const [favoriteAssets, setFavoriteAssets] = useState<string[]>([]);
  const [recentAssets, setRecentAssets] = useState<string[]>([]);
  const [notice, setNotice] = useState(
    "예시 이야기가 준비되어 있어요. 대사를 고쳐 새 이야기를 만들어 보세요.",
  );
  const [busy, setBusy] = useState<UpdateMode | null>(null);
  const [busyStep, setBusyStep] = useState("");
  const [blankConfirmOpen, setBlankConfirmOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [localDraftFound, setLocalDraftFound] = useState(false);
  const [backupFound, setBackupFound] = useState(false);
  const [entryBusy, setEntryBusy] = useState(false);
  const [entryNotice, setEntryNotice] = useState("");
  const updateController = useRef<AbortController | null>(null);
  const excelInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        const savedDraft = localStorage.getItem(DRAFT_KEY);
        const savedActive = localStorage.getItem(ACTIVE_KEY);
        if (savedDraft) {
          setDraft(cloneProject(JSON.parse(savedDraft) as StoryProject));
          setLocalDraftFound(true);
        }
        if (savedActive) {
          setActive(cloneProject(JSON.parse(savedActive) as StoryProject));
        }
        setBackupFound(Boolean(localStorage.getItem(BACKUP_KEY)));
        setFavoriteAssets(
          JSON.parse(localStorage.getItem(FAVORITES_KEY) ?? "[]") as string[],
        );
        setRecentAssets(
          JSON.parse(localStorage.getItem(RECENTS_KEY) ?? "[]") as string[],
        );
      } catch {
        setNotice("이 기기의 이전 저장을 읽지 못해 예시 이야기로 시작했어요.");
      } finally {
        setHydrated(true);
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch {
      window.setTimeout(
        () =>
          setNotice(
            "기기 저장 공간이 부족해요. Excel로 저장해 작품을 보관해 주세요.",
          ),
        0,
      );
    }
  }, [draft, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favoriteAssets));
  }, [favoriteAssets, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(RECENTS_KEY, JSON.stringify(recentAssets));
  }, [recentAssets, hydrated]);

  const selectedChapter =
    draft.chapters.find((chapter) => chapter.id === selectedChapterId) ??
    draft.chapters[0];
  const selectedChapterLines = draft.lines
    .filter((line) => line.chapterId === selectedChapter?.id)
    .sort((a, b) => a.order - b.order);
  const selectedLine =
    selectedChapterLines.find((line) => line.id === selectedLineId) ??
    selectedChapterLines[0];
  const selectedLineIndex = selectedLine
    ? selectedChapterLines.findIndex((line) => line.id === selectedLine.id)
    : -1;
  const hasUnappliedChanges = useMemo(
    () => projectContent(draft) !== projectContent(active),
    [active, draft],
  );

  const sortedChapters = draft.chapters
    .slice()
    .sort((a, b) => a.order - b.order);
  const orderedDraftLines = sortedChapters.flatMap((chapter) =>
    draft.lines
      .filter((line) => line.chapterId === chapter.id)
      .sort((a, b) => a.order - b.order),
  );
  const selectedStoryLineIndex = selectedLine
    ? orderedDraftLines.findIndex((line) => line.id === selectedLine.id)
    : -1;
  const continuationPoint = findContinuationPoint(draft);
  const isAtContinuationPoint =
    continuationPoint?.chapterId === selectedChapter?.id &&
    continuationPoint?.lineId === selectedLine?.id;
  const selectedStructure =
    STORY_STRUCTURE_OPTIONS.find(
      (option) => option.mode === draft.planning.structureMode,
    ) ?? STORY_STRUCTURE_OPTIONS[0];
  const storyChecklist = [
    { label: "이야기 제목", ready: Boolean(draft.title.trim()) },
    {
      label: "소재·주제",
      ready: Boolean(
        draft.planning.material.trim() && draft.planning.theme.trim(),
      ),
    },
    {
      label: "핵심 인물",
      ready: Boolean(draft.planning.mainCharacter.trim()),
    },
    {
      label: "바라는 것",
      ready: Boolean(draft.planning.mainGoal.trim()),
    },
    {
      label: "주요 갈등",
      ready: Boolean(draft.planning.centralProblem.trim()),
    },
    {
      label: `${selectedStructure.shortTitle} 줄거리`,
      ready: selectedStructure.steps.every(
        (step) => draft.planning[step.key].trim(),
      ),
    },
    { label: "챕터", ready: draft.chapters.length > 0 },
  ];
  const readyStoryItems = storyChecklist.filter((item) => item.ready).length;

  function updatePlanning(
    changes: Partial<StoryProject["planning"]>,
  ) {
    setDraft((project) => ({
      ...project,
      planning: { ...project.planning, ...changes },
    }));
  }

  function openChapterPlan(chapterId: string) {
    selectChapter(chapterId);
    setPlanningView("chapters");
  }

  function openChapterWriter(chapterId: string) {
    selectChapter(chapterId);
    setWorkspaceMode("create");
    setEditorMode("chapter");
  }

  function updateChapter(chapterId: string, changes: Partial<Chapter>) {
    setDraft((project) => ({
      ...project,
      chapters: project.chapters.map((chapter) =>
        chapter.id === chapterId ? { ...chapter, ...changes } : chapter,
      ),
    }));
  }

  function updateLine(lineId: string, changes: Partial<StoryLine>) {
    setDraft((project) => ({
      ...project,
      lines: project.lines.map((line) =>
        line.id === lineId ? { ...line, ...changes } : line,
      ),
    }));
  }

  function copySceneStaging(sourceLineId: string) {
    if (!selectedLine || !selectedChapter) return;
    const sourceLine = draft.lines.find((line) => line.id === sourceLineId);
    const sourceChapter = draft.chapters.find(
      (chapter) => chapter.id === sourceLine?.chapterId,
    );
    if (!sourceLine || !sourceChapter) return;

    const copiedStaging = {
      leftAssetId: sourceLine.leftAssetId || sourceChapter.leftAssetId,
      rightAssetId: sourceLine.rightAssetId || sourceChapter.rightAssetId,
      backgroundId: sourceLine.backgroundId || sourceChapter.backgroundId,
    };
    const copiedCharacterIds = [
      copiedStaging.leftAssetId,
      copiedStaging.rightAssetId,
    ].filter(Boolean);
    const copiedBackgroundIds = [copiedStaging.backgroundId].filter(Boolean);

    setDraft((project) => ({
      ...project,
      chapters: project.chapters.map((chapter) =>
        chapter.id === selectedChapter.id
          ? {
              ...chapter,
              characterAssetIds: unique([
                ...chapter.characterAssetIds,
                ...copiedCharacterIds,
              ]),
              backgroundAssetIds: unique([
                ...chapter.backgroundAssetIds,
                ...copiedBackgroundIds,
              ]),
            }
          : chapter,
      ),
      lines: project.lines.map((line) =>
        line.id === selectedLine.id ? { ...line, ...copiedStaging } : line,
      ),
    }));
    setNotice(
      `${sourceChapter.order}. ${sourceChapter.title || "이름 없는 챕터"} · 장면 ${sourceLine.order}의 이미지 배치를 가져왔어요. 현재 글상자 내용은 그대로예요.`,
    );
  }

  function changeLineType(lineId: string, type: StoryLine["type"]) {
    if (!selectedChapter) return;
    const firstSpeaker =
      selectedChapter.chapterSpeakerNames[0] ??
      draft.speakerNames[0] ??
      "주인공";
    setDraft((project) => ({
      ...project,
      speakerNames:
        type === "dialogue"
          ? unique([...project.speakerNames, firstSpeaker])
          : project.speakerNames,
      chapters: project.chapters.map((chapter) =>
        chapter.id === selectedChapter.id && type === "dialogue"
          ? {
              ...chapter,
              chapterSpeakerNames: unique([
                ...chapter.chapterSpeakerNames,
                firstSpeaker,
              ]),
            }
          : chapter,
      ),
      lines: project.lines.map((line) =>
        line.id === lineId
          ? {
              ...line,
              type,
              speaker: type === "narration" ? "narration" : "left",
              speakerName: type === "narration" ? "해설" : firstSpeaker,
            }
          : line,
      ),
    }));
  }

  function selectChapter(chapterId: string) {
    setSelectedChapterId(chapterId);
    const firstLine = draft.lines
      .filter((line) => line.chapterId === chapterId)
      .sort((a, b) => a.order - b.order)[0];
    setSelectedLineId(firstLine?.id ?? "");
  }

  function selectStoryLine(line: StoryLine) {
    setSelectedChapterId(line.chapterId);
    setSelectedLineId(line.id);
  }

  function moveThroughStory(direction: -1 | 1) {
    const nextLine = orderedDraftLines[selectedStoryLineIndex + direction];
    if (nextLine) selectStoryLine(nextLine);
  }

  function editStoryFromBeginning() {
    const firstLine = orderedDraftLines[0];
    if (!firstLine) return;
    setWorkspaceMode("create");
    setEditorMode("scene");
    selectStoryLine(firstLine);
    setSceneSettingsOpen(false);
    setNotice(
      "첫 장면부터 차례로 읽고 고칠 수 있어요. ‘다음 장면’을 누르면 챕터를 넘어 계속 이어집니다.",
    );
  }

  function returnToContinuationPoint() {
    if (!continuationPoint) return;
    const continuationLine = draft.lines.find(
      (line) => line.id === continuationPoint.lineId,
    );
    if (!continuationLine) return;
    setWorkspaceMode("create");
    setEditorMode("scene");
    selectStoryLine(continuationLine);
    setSceneSettingsOpen(false);
    setNotice(
      `${continuationPoint.label} 장면으로 돌아왔어요. 여기서부터 이야기를 이어 써 보세요.`,
    );
  }

  function addChapter() {
    const id = `chapter-${Date.now()}`;
    const chapter: Chapter = {
      id,
      order: draft.chapters.length + 1,
      title: "",
      summary: "",
      purpose: "",
      mood: "",
      keyEvents: "",
      nextChapterIdea: "",
      chapterSpeakerNames: [],
      characterAssetIds: [],
      backgroundAssetIds: [],
      backgroundId: "",
      leftAssetId: "",
      rightAssetId: "",
    };
    setDraft((project) => ({
      ...project,
      chapters: [...project.chapters, chapter],
    }));
    setPlanningView("chapters");
    setSelectedChapterId(id);
    setSelectedLineId("");
    setChapterGuideOpen(true);
  }

  function removeChapter(chapterId: string) {
    const sceneCount = draft.lines.filter(
      (line) => line.chapterId === chapterId,
    ).length;
    if (
      !window.confirm(
        sceneCount > 0
          ? `이 챕터와 장면 ${sceneCount}개를 함께 삭제할까요?`
          : "이 챕터를 삭제할까요?",
      )
    ) {
      return;
    }
    const remaining = sortedChapters.filter((chapter) => chapter.id !== chapterId);
    setDraft((project) => ({
      ...project,
      chapters: project.chapters.filter((chapter) => chapter.id !== chapterId),
      lines: project.lines.filter((line) => line.chapterId !== chapterId),
    }));
    selectChapter(remaining[0]?.id ?? "");
    setNotice("챕터를 삭제했어요. 현재 플레이는 아직 그대로예요.");
  }

  function addLine(type: StoryLine["type"], openScene = false) {
    if (!selectedChapter) return;
    const id = `line-${Date.now()}`;
    const firstSpeaker =
      selectedChapter.chapterSpeakerNames[0] ??
      draft.speakerNames[0] ??
      "주인공";
    const insertOrder =
      openScene && selectedLine?.chapterId === selectedChapter.id
        ? selectedLine.order + 1
        : selectedChapterLines.length + 1;
    const line: StoryLine = {
      id,
      chapterId: selectedChapter.id,
      order: insertOrder,
      type,
      speaker: type === "narration" ? "narration" : "left",
      speakerName: type === "narration" ? "해설" : firstSpeaker,
      text: "",
      leftAssetId: "",
      rightAssetId: "",
      backgroundId: "",
      purposeNote: "",
      emotionNote: "",
      directionNote: "",
    };
    setDraft((project) => ({
      ...project,
      speakerNames:
        type === "dialogue"
          ? unique([...project.speakerNames, firstSpeaker])
          : project.speakerNames,
      chapters: project.chapters.map((chapter) =>
        chapter.id === selectedChapter.id && type === "dialogue"
          ? {
              ...chapter,
              chapterSpeakerNames: unique([
                ...chapter.chapterSpeakerNames,
                firstSpeaker,
              ]),
            }
          : chapter,
      ),
      lines: [
        ...project.lines.map((existing) =>
          existing.chapterId === selectedChapter.id &&
          existing.order >= insertOrder
            ? { ...existing, order: existing.order + 1 }
            : existing,
        ),
        line,
      ],
    }));
    setSelectedLineId(id);
    if (openScene) setEditorMode("scene");
  }

  function removeLine(lineId: string) {
    if (!window.confirm("이 장면을 삭제할까요?")) return;
    const nextLines = selectedChapterLines.filter((line) => line.id !== lineId);
    setDraft((project) => ({
      ...project,
      lines: project.lines
        .filter((line) => line.id !== lineId)
        .map((line) => {
          if (line.chapterId !== selectedChapter?.id) return line;
          const index = nextLines.findIndex((candidate) => candidate.id === line.id);
          return { ...line, order: index + 1 };
        }),
    }));
    setSelectedLineId(nextLines[0]?.id ?? "");
  }

  function moveLine(lineId: string, direction: -1 | 1) {
    setDraft((project) => {
      const ordered = project.lines
        .filter((line) => line.chapterId === selectedChapter?.id)
        .sort((a, b) => a.order - b.order);
      const index = ordered.findIndex((line) => line.id === lineId);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= ordered.length) return project;
      [ordered[index], ordered[target]] = [ordered[target], ordered[index]];
      const orderMap = new Map(
        ordered.map((line, lineIndex) => [line.id, lineIndex + 1]),
      );
      return {
        ...project,
        lines: project.lines.map((line) =>
          orderMap.has(line.id)
            ? { ...line, order: orderMap.get(line.id)! }
            : line,
        ),
      };
    });
  }

  function duplicateLine(lineId: string) {
    const source = draft.lines.find((line) => line.id === lineId);
    if (!source) return;
    const id = `line-${Date.now()}`;
    setDraft((project) => {
      const chapterLines = project.lines
        .filter((line) => line.chapterId === source.chapterId)
        .sort((a, b) => a.order - b.order);
      const next: StoryLine[] = [];
      chapterLines.forEach((line) => {
        next.push(line);
        if (line.id === lineId) next.push({ ...line, id });
      });
      return {
        ...project,
        lines: [
          ...project.lines.filter((line) => line.chapterId !== source.chapterId),
          ...next.map((line, index) => ({ ...line, order: index + 1 })),
        ],
      };
    });
    setSelectedLineId(id);
    setNotice("장면을 복제했어요.");
  }

  function addSpeaker(name: string, assignToSelectedScene = true) {
    if (!selectedChapter) return;
    setDraft((project) => ({
      ...project,
      speakerNames: unique([...project.speakerNames, name]),
      chapters: project.chapters.map((chapter) =>
        chapter.id === selectedChapter.id
          ? {
              ...chapter,
              chapterSpeakerNames: unique([
                ...chapter.chapterSpeakerNames,
                name,
              ]),
            }
          : chapter,
      ),
      lines: project.lines.map((line) =>
        assignToSelectedScene && line.id === selectedLine?.id
          ? { ...line, speakerName: name }
          : line,
      ),
    }));
    setNotice(`화자 ‘${name}’을(를) 이 챕터에 추가했어요.`);
  }

  function addAssetToChapter(assetId: string, type: StoryAsset["type"]) {
    if (!selectedChapter || !assetId) return;
    updateChapter(
      selectedChapter.id,
      type === "character"
        ? {
            characterAssetIds: unique([
              ...selectedChapter.characterAssetIds,
              assetId,
            ]),
          }
        : {
            backgroundAssetIds: unique([
              ...selectedChapter.backgroundAssetIds,
              assetId,
            ]),
          },
    );
    setRecentAssets((current) =>
      [assetId, ...current.filter((id) => id !== assetId)].slice(0, 24),
    );
  }

  function removeAsset(assetId: string, type: StoryAsset["type"]) {
    if (!selectedChapter) return;
    const usedInLines = selectedChapterLines.some((line) =>
      type === "character"
        ? line.leftAssetId === assetId || line.rightAssetId === assetId
        : line.backgroundId === assetId,
    );
    const usedAsDefault =
      type === "character"
        ? selectedChapter.leftAssetId === assetId ||
          selectedChapter.rightAssetId === assetId
        : selectedChapter.backgroundId === assetId;
    if (usedInLines || usedAsDefault) {
      setNotice(
        `‘${assetName(assetId)}’은(는) 현재 장면에서 사용 중이라 먼저 다른 이미지로 바꿔야 해요.`,
      );
      return;
    }
    updateChapter(
      selectedChapter.id,
      type === "character"
        ? {
            characterAssetIds: selectedChapter.characterAssetIds.filter(
              (id) => id !== assetId,
            ),
          }
        : {
            backgroundAssetIds: selectedChapter.backgroundAssetIds.filter(
              (id) => id !== assetId,
            ),
          },
    );
  }

  function toggleFavorite(assetId: string) {
    setFavoriteAssets((current) =>
      current.includes(assetId)
        ? current.filter((id) => id !== assetId)
        : [...current, assetId],
    );
  }

  function backupDraft() {
    localStorage.setItem(BACKUP_KEY, JSON.stringify(draft));
    setBackupFound(true);
  }

  function restoreBackup() {
    try {
      const saved = localStorage.getItem(BACKUP_KEY);
      if (!saved) {
        setNotice("복구할 직전 편집본이 없어요.");
        return;
      }
      const restored = cloneProject(JSON.parse(saved) as StoryProject);
      setDraft(restored);
      setSelectedChapterId(restored.chapters[0]?.id ?? "");
      setSelectedLineId(restored.lines[0]?.id ?? "");
      setNotice("방금 전 편집본으로 복구했어요.");
    } catch {
      setNotice("직전 편집본을 읽지 못했어요. 저장한 Excel을 열어 주세요.");
    }
  }

  async function applyDraft() {
    const controller = new AbortController();
    updateController.current = controller;
    setBusy("draft");
    try {
      setBusyStep("플레이에 표시할 내용 확인 중");
      await new Promise<void>((resolve, reject) => {
        const timer = window.setTimeout(resolve, 280);
        controller.signal.addEventListener("abort", () => {
          window.clearTimeout(timer);
          reject(new DOMException("Aborted", "AbortError"));
        });
      });
      if (!draft.title.trim()) throw new Error("이야기 제목을 써 주세요.");
      if (draft.chapters.length === 0) {
        throw new Error("챕터를 하나 만들어 주세요.");
      }
      if (draft.lines.length === 0) throw new Error("장면을 하나 만들어 주세요.");
      const empty = draft.lines.find((line) => !line.text.trim());
      if (empty) {
        const chapter = draft.chapters.find(
          (candidate) => candidate.id === empty.chapterId,
        );
        throw new Error(
          `${chapter?.title || "챕터"} · 장면 ${empty.order}의 글상자가 비어 있어요.`,
        );
      }
      const unnamed = draft.lines.find(
        (line) => line.type === "dialogue" && !line.speakerName.trim(),
      );
      if (unnamed) throw new Error("대사 장면의 화자 이름을 골라 주세요.");
      const narrationWithParentheses = draft.lines.find(
        (line) =>
          line.type === "narration" && containsParentheses(line.text),
      );
      if (narrationWithParentheses) {
        const chapter = draft.chapters.find(
          (candidate) => candidate.id === narrationWithParentheses.chapterId,
        );
        throw new Error(
          `${chapter?.title || "챕터"} · 장면 ${
            narrationWithParentheses.order
          }의 해설에는 괄호를 쓸 수 없어요. 속마음이나 행동은 대사 장면의 괄호 안에 써 주세요.`,
        );
      }
      backupDraft();
      setBusyStep("새 플레이 버전 만드는 중");
      const updated = cloneProject({
        ...draft,
        updatedAt: new Intl.DateTimeFormat("ko-KR", {
          hour: "2-digit",
          minute: "2-digit",
        }).format(new Date()),
      });
      setActive(updated);
      localStorage.setItem(ACTIVE_KEY, JSON.stringify(updated));
      setNotice(
        `플레이 적용 완료 · 챕터 ${updated.chapters.length}개 · 장면 ${updated.lines.length}개`,
      );
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        setNotice("적용을 중지했어요. 직전 플레이는 그대로예요.");
      } else {
        setNotice(
          error instanceof Error
            ? error.message
            : "플레이에 적용하지 못했어요.",
        );
      }
    } finally {
      updateController.current = null;
      setBusy(null);
      setBusyStep("");
    }
  }

  async function updateFromSheet() {
    const sheetId = extractSheetId(draft.sheetUrl);
    if (!sheetId) {
      setNotice("Google 시트의 공유 주소를 확인해 주세요.");
      return;
    }
    const controller = new AbortController();
    updateController.current = controller;
    setBusy("sheet");
    try {
      setBusyStep("공개 Google 시트를 읽는 중");
      const snapshot = await fetchSheetSnapshot(sheetId, controller.signal);
      setBusyStep("챕터·장면·이미지 연결 확인 중");
      const imported = buildProjectFromSheet(snapshot, draft.sheetUrl);
      backupDraft();
      setDraft(imported);
      setSelectedChapterId(imported.chapters[0]?.id ?? "");
      setSelectedLineId(imported.lines[0]?.id ?? "");
      setNotice("시트 내용을 편집본으로 가져왔어요. 확인 후 플레이에 적용하세요.");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        setNotice("시트 불러오기를 중지했어요.");
      } else {
        setNotice(
          error instanceof Error ? error.message : "시트를 읽지 못했어요.",
        );
      }
    } finally {
      updateController.current = null;
      setBusy(null);
      setBusyStep("");
    }
  }

  async function openExcelFile(file?: File) {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".xlsx")) {
      const message = "`.xlsx` 형식의 Excel 파일을 골라 주세요.";
      if (creatorAccess === "none") setEntryNotice(message);
      else setNotice(message);
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      const message = "파일이 15MB보다 커요. 이미지가 들어 있지 않은 작품 파일인지 확인해 주세요.";
      if (creatorAccess === "none") setEntryNotice(message);
      else setNotice(message);
      return;
    }
    const controller = new AbortController();
    updateController.current = controller;
    setBusy("excel");
    setEntryBusy(true);
    try {
      setBusyStep("Excel 파일을 이 기기에서 읽는 중");
      const { readStoryWorkbook } = await import("./story-workbook");
      const snapshot = await readStoryWorkbook(file);
      if (controller.signal.aborted) {
        throw new DOMException("Aborted", "AbortError");
      }
      const imported = buildProjectFromSheet(snapshot, "");
      backupDraft();
      setDraft(imported);
      setSelectedChapterId(imported.chapters[0]?.id ?? "");
      setSelectedLineId(imported.lines[0]?.id ?? "");
      setCreatorAccess("local");
      setWorkspaceMode("create");
      setEntryNotice("");
      setNotice(`‘${file.name}’을 편집본으로 열었어요.`);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Excel 파일을 읽지 못했어요.";
      if (creatorAccess === "none") setEntryNotice(message);
      else setNotice(message);
    } finally {
      updateController.current = null;
      setBusy(null);
      setBusyStep("");
      setEntryBusy(false);
      if (excelInputRef.current) excelInputRef.current.value = "";
    }
  }

  async function saveExcelFile() {
    const controller = new AbortController();
    updateController.current = controller;
    setBusy("excel");
    try {
      setBusyStep("창작 메모와 작품 내용 저장 중");
      const { downloadStoryWorkbook } = await import("./story-workbook");
      await downloadStoryWorkbook(draft, STORY_ASSETS);
      if (controller.signal.aborted) {
        throw new DOMException("Aborted", "AbortError");
      }
      setNotice("현재 편집본과 창작 메모를 Excel로 저장했어요.");
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : "Excel로 저장하지 못했어요.",
      );
    } finally {
      updateController.current = null;
      setBusy(null);
      setBusyStep("");
    }
  }

  function startBlankProject() {
    const blank = createBlankProject();
    backupDraft();
    setDraft(blank);
    setSelectedChapterId("");
    setSelectedLineId("");
    setWorkspaceMode("plan");
    setPlanningView("story");
    setEditorMode("chapter");
    setMobileProjectOpen(false);
    setMobileEditorToolsOpen(false);
    setSceneSettingsOpen(false);
    setCreatorAccess("local");
    setBlankConfirmOpen(false);
    setNotice("빈 작품을 열었어요. 구상부터 시작하거나 바로 챕터를 만드세요.");
  }

  function startContinuationTemplate(
    source: StoryProject,
    continuationChapterId: string,
    continuationLineId: string,
    message: string,
  ) {
    const template = cloneProject(source);
    const playableLines = template.lines.filter((line) => line.text.trim());
    const playableStart = cloneProject({
      ...template,
      chapters: template.chapters.filter((chapter) =>
        playableLines.some((line) => line.chapterId === chapter.id),
      ),
      lines: playableLines,
    });
    backupDraft();
    setDraft(template);
    setActive(playableStart);
    localStorage.setItem(ACTIVE_KEY, JSON.stringify(playableStart));
    setSelectedChapterId(continuationChapterId);
    setSelectedLineId(continuationLineId);
    setWorkspaceMode("create");
    setEditorMode("scene");
    setMobileProjectOpen(false);
    setMobileEditorToolsOpen(false);
    setSceneSettingsOpen(false);
    setChapterGuideOpen(false);
    setChapterResourcesOpen(false);
    setSceneNotesOpen(false);
    setCreatorAccess("local");
    setNotice(message);
  }

  function startRabbitTurtleContinuation1() {
    startContinuationTemplate(
      RABBIT_TURTLE_CONTINUATION_TEMPLATE,
      "continuation-chapter-2",
      "continuation-line-6",
      "토끼와 자라가 만난 다음 장면을 열었어요. 자라의 첫 말부터 이어 써 보세요.",
    );
  }

  function startRabbitTurtleContinuation2() {
    startContinuationTemplate(
      RABBIT_TURTLE_CONTINUATION_TEMPLATE_2,
      "palace-continuation-chapter-2",
      "palace-continuation-line-7",
      "용궁에 묶인 토끼의 다음 장면을 열었어요. 토끼의 첫 말부터 이어 써 보세요.",
    );
  }

  function startOnggojibContinuation() {
    startContinuationTemplate(
      ONGGOJIB_CONTINUATION_TEMPLATE,
      "onggojib-continuation",
      "onggojib-continuation-line-1",
      "아내가 가짜 옹고집을 선택한 다음 장면을 열었어요. 선택 뒤 첫 반응부터 이어 써 보세요.",
    );
  }

  function requestBlankProject() {
    const hasContent =
      Boolean(draft.title.trim()) ||
      draft.chapters.length > 0 ||
      draft.lines.length > 0;
    if (hasContent) setBlankConfirmOpen(true);
    else startBlankProject();
  }

  function openPlay(index = 0) {
    setPlayIndex(Math.max(0, index));
    setView("play");
  }

  function playSelectedChapter() {
    if (!selectedChapter) return;
    const lines = active.chapters
      .slice()
      .sort((a, b) => a.order - b.order)
      .flatMap((chapter) =>
        active.lines
          .filter((line) => line.chapterId === chapter.id)
          .sort((a, b) => a.order - b.order),
      );
    const index = lines.findIndex(
      (line) => line.chapterId === selectedChapter.id,
    );
    openPlay(index >= 0 ? index : 0);
  }

  if (view === "play") {
    return (
      <StoryPlayer
        project={active}
        startIndex={playIndex}
        onIndexChange={setPlayIndex}
        onBack={() => setView("studio")}
      />
    );
  }

  if (creatorAccess === "none") {
    return (
      <main className="entry-shell">
        <section className="entry-card" aria-labelledby="entry-title">
          <div className="entry-brand">
            <span className="brand-mark large">놀퀴즈</span>
            <span>NOLQUIZ STORY STUDIO</span>
          </div>
          <div className="entry-copy">
            <span className="eyebrow">학생이 직접 만드는 비주얼 이야기</span>
            <h1 id="entry-title">
              생각을 글로 쓰고,
              <br />
              장면으로 완성하세요
            </h1>
            <p>
              회원가입 없이 이 기기에서 구상하고, 챕터를 쓰고, 실제 게임
              장면처럼 연출할 수 있어요.
            </p>
          </div>
          <div className="entry-source-grid" aria-label="작품 시작 방법">
            <button
              className="entry-source-button primary-source"
              onClick={startBlankProject}
            >
              <span aria-hidden="true">✦</span>
              <strong>웹에서 새 작품</strong>
              <small>완전히 빈 이야기부터 시작해요.</small>
            </button>
            <button
              className="entry-source-button"
              onClick={() => excelInputRef.current?.click()}
              disabled={entryBusy}
            >
              <span aria-hidden="true">X</span>
              <strong>Excel 파일 열기</strong>
              <small>파일은 이 기기 안에서만 읽어요.</small>
            </button>
            <button
              className="entry-source-button"
              onClick={() => {
                setCreatorAccess("local");
                setWorkspaceMode("create");
                setProjectToolsOpen(true);
                setNotice("작품 관리에서 공개 Google 시트 주소를 넣으세요.");
              }}
            >
              <span aria-hidden="true">G</span>
              <strong>Google 시트 불러오기</strong>
              <small>공개 또는 웹에 게시한 시트를 읽어요.</small>
            </button>
          </div>
          <section
            className="entry-template-panel"
            aria-labelledby="continuation-template-title"
          >
            <div className="entry-template-heading">
              <div>
                <span className="eyebrow">이어쓰기 템플릿</span>
                <h2 id="continuation-template-title">
                  이야기의 중간부터 시작해도 돼요
                </h2>
              </div>
              <small>준비된 앞부분을 읽고, 빈 장면부터 직접 이어 씁니다.</small>
            </div>
            <div className="entry-template-list">
              <button
                className="entry-template-card"
                onClick={startRabbitTurtleContinuation1}
              >
                <span className="template-number">01</span>
                <span className="template-copy">
                  <strong>토끼와 자라 템플릿 1 · 땅에서 만난 뒤</strong>
                  <small>
                    자라는 토끼를 어떻게 용궁으로 데려갈까요?
                  </small>
                  <em>
                    준비된 내용: 용왕의 명령과 두 인물의 만남 · 시작할 곳:
                    자라의 첫 설득
                  </em>
                </span>
                <b>이어서 쓰기</b>
              </button>
              <button
                className="entry-template-card"
                onClick={startRabbitTurtleContinuation2}
              >
                <span className="template-number">02</span>
                <span className="template-copy">
                  <strong>토끼와 자라 템플릿 2 · 용궁에 묶인 토끼</strong>
                  <small>
                    결박된 토끼는 어떻게 위기를 벗어날까요?
                  </small>
                  <em>
                    준비된 내용: 용왕의 명령·잔치 초대·용궁 결박 · 시작할 곳:
                    토끼의 첫 대응
                  </em>
                </span>
                <b>이어서 쓰기</b>
              </button>
              <button
                className="entry-template-card"
                onClick={startOnggojibContinuation}
              >
                <span className="template-number">03</span>
                <span className="template-copy">
                  <strong>옹고집전 템플릿 1 · 아내의 선택 이후</strong>
                  <small>
                    가짜 옹고집을 선택한 뒤, 관아와 가족에게 어떤 일이
                    생길까요?
                  </small>
                  <em>
                    준비된 내용: 가족의 변화·두 옹고집의 관아 다툼·아내의
                    선택 · 시작할 곳: 선택 뒤 첫 장면
                  </em>
                </span>
                <b>이어서 쓰기</b>
              </button>
            </div>
          </section>
          <input
            ref={excelInputRef}
            hidden
            type="file"
            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            onChange={(event) => openExcelFile(event.target.files?.[0])}
          />
          <div className="entry-actions">
            {hydrated && localDraftFound && (
              <button
                className="entry-recovery-button"
                onClick={() => {
                  setCreatorAccess("local");
                  setNotice("이 기기의 저장된 작업을 이어서 엽니다.");
                }}
              >
                이 기기의 저장된 작업 이어하기
              </button>
            )}
            <button
              className="entry-preview-button"
              onClick={() => {
                setActive(cloneProject(DEFAULT_PROJECT));
                openPlay(0);
              }}
            >
              예시 작품 먼저 플레이
            </button>
          </div>
          {entryNotice && (
            <p className="entry-error" role="alert">
              {entryNotice}
            </p>
          )}
          <p className="entry-footnote">
            웹 편집은 이 기기에 자동 저장됩니다. 중요한 작품은 `Excel로
            저장`해 따로 보관하세요.
          </p>
        </section>
        <footer className="entry-copyright">
          기본 제공 이미지 © 놀퀴즈 · 학생 스토리게임 제작에 자유롭게 사용
        </footer>
        {busy && (
          <div className="update-overlay" role="dialog" aria-modal="true">
            <div className="update-card">
              <span className="update-spinner" aria-hidden="true" />
              <h2>{busyStep}</h2>
              <button
                className="stop-button"
                onClick={() => updateController.current?.abort()}
              >
                업데이트 강제 중지
              </button>
            </div>
          </div>
        )}
      </main>
    );
  }

  const currentLocation = selectedChapter
    ? `챕터 ${selectedChapter.order} 〈${
        selectedChapter.title || "제목 없음"
      }〉${
        selectedLine
          ? ` › 장면 ${selectedLineIndex + 1}/${selectedChapterLines.length} › ${
              editorMode === "scene"
                ? selectedLine.type === "narration"
                  ? "해설 장면 편집"
                  : `${selectedLine.speakerName || "화자 없음"}의 대사 편집`
                : "챕터 전체 편집"
            }`
          : ""
      }`
    : "아직 챕터가 없어요";

  return (
    <main className="creator-shell">
      <header className="creator-header">
        <div className="creator-brand">
          <span className="brand-mark">놀퀴즈</span>
          <div>
            <strong>
              스토리 스튜디오
            </strong>
            <small>{currentLocation}</small>
          </div>
        </div>
        <div className="creator-header-actions">
          <span className="save-state">기기에 저장됨</span>
          <button
            className="quiet-button"
            onClick={() => setProjectToolsOpen((current) => !current)}
          >
            작품 관리
          </button>
          <button
            className="apply-button"
            onClick={applyDraft}
            disabled={!hasUnappliedChanges}
          >
            {hasUnappliedChanges ? "플레이에 적용" : "적용 완료"}
          </button>
          <button
            className="play-button"
            onClick={() => openPlay(0)}
            disabled={active.lines.length === 0}
          >
            플레이
          </button>
        </div>
      </header>

      <button
        className="mobile-panel-toggle project-info-toggle"
        aria-expanded={mobileProjectOpen}
        onClick={() => setMobileProjectOpen((current) => !current)}
      >
        <span>
          <strong>작품 정보</strong>
          <small>
            {draft.title || "제목 없음"} · 챕터 {draft.chapters.length} · 장면{" "}
            {draft.lines.length}
          </small>
        </span>
        <b>{mobileProjectOpen ? "접기" : "펼치기"}</b>
      </button>

      <section
        className={`creator-project-bar ${
          mobileProjectOpen ? "mobile-open" : ""
        }`}
      >
        <label>
          <span>이야기 제목</span>
          <input
            value={draft.title}
            onChange={(event) =>
              setDraft((project) => ({ ...project, title: event.target.value }))
            }
            placeholder="우리 이야기의 제목"
          />
        </label>
        <label>
          <span>작품 소개</span>
          <input
            value={draft.description}
            onChange={(event) =>
              setDraft((project) => ({
                ...project,
                description: event.target.value,
              }))
            }
            placeholder="이 이야기를 한 문장으로 소개해 보세요."
          />
        </label>
        <div className="project-counts">
          <span>챕터 {draft.chapters.length}</span>
          <span>장면 {draft.lines.length}</span>
        </div>
      </section>

      {projectToolsOpen && (
        <section className="project-tools" aria-label="작품 관리">
          <div>
            <span className="eyebrow">작품 관리</span>
            <h2>가져오기·내보내기와 복구</h2>
            <p>평소에는 닫아 두고 이야기 쓰기에 집중할 수 있어요.</p>
          </div>
          <div className="project-tool-actions">
            <button onClick={() => excelInputRef.current?.click()}>
              Excel 파일 열기
            </button>
            <button onClick={saveExcelFile}>Excel로 저장</button>
            <a
              href="/templates/놀퀴즈_스토리_템플릿.xlsx"
              download
            >
              빈 Excel 템플릿
            </a>
            {backupFound && (
              <button onClick={restoreBackup}>방금 전으로 복구</button>
            )}
            <button className="danger-link" onClick={requestBlankProject}>
              빈 작품 시작
            </button>
          </div>
          <div className="google-tool-row">
            <input
              type="url"
              value={draft.sheetUrl}
              onChange={(event) =>
                setDraft((project) => ({
                  ...project,
                  sheetUrl: event.target.value,
                  sheetEditable: false,
                }))
              }
              placeholder="공개 Google 시트 주소"
              aria-label="공개 Google 시트 주소"
            />
            <button onClick={updateFromSheet}>시트에서 불러오기</button>
          </div>
          <input
            ref={excelInputRef}
            hidden
            type="file"
            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            onChange={(event) => openExcelFile(event.target.files?.[0])}
          />
        </section>
      )}

      <p className="creator-notice" role="status">
        {notice}
      </p>

      {continuationPoint && (
        <section
          className="continuation-edit-bar"
          aria-label="이어쓰기 편집 안내"
        >
          <div>
            <span className="eyebrow">이어쓰기 작품</span>
            <strong>
              앞이야기도 고치고, 이어 쓸 곳으로 돌아올 수 있어요.
            </strong>
            <small>
              준비된 장면도 내 이야기의 일부예요. 처음부터 차례로 읽으며
              대사와 해설을 바꿔 보세요.
            </small>
          </div>
          <div>
            <button onClick={editStoryFromBeginning}>
              처음부터 읽고 고치기
            </button>
            <button
              className={isAtContinuationPoint ? "active" : ""}
              onClick={returnToContinuationPoint}
            >
              이어 쓸 곳으로
            </button>
          </div>
        </section>
      )}

      <nav className="creator-primary-nav" aria-label="창작 과정">
        <button
          className={workspaceMode === "plan" ? "active" : ""}
          onClick={() => setWorkspaceMode("plan")}
        >
          <span>1</span>
          <div>
            <strong>스토리 구상</strong>
            <small>창작 메모 · 플레이에는 보이지 않아요</small>
          </div>
        </button>
        <button
          className={workspaceMode === "create" ? "active" : ""}
          onClick={() => setWorkspaceMode("create")}
        >
          <span>2</span>
          <div>
            <strong>이야기 만들기</strong>
            <small>대사·해설·이미지를 실제 장면으로 만들어요</small>
          </div>
        </button>
        <button onClick={() => openPlay(0)} disabled={active.lines.length === 0}>
          <span>3</span>
          <div>
            <strong>플레이</strong>
            <small>마지막으로 적용한 버전을 확인해요</small>
          </div>
        </button>
      </nav>

      {workspaceMode === "plan" ? (
        <section className="planning-workspace">
          <header className="workspace-heading">
            <div>
              <span className="eyebrow">편집할 때만 보는 창작 메모</span>
              <h1>이야기의 방향부터 챕터 흐름까지</h1>
              <p>
                구상 내용은 자동 저장되지만 플레이 화면에는 나타나지 않아요.
              </p>
            </div>
            <button
              className="primary-button"
              onClick={() => setWorkspaceMode("create")}
            >
              바로 이야기 쓰기
            </button>
          </header>
          <nav className="planning-view-switch" aria-label="구상 화면 선택">
            <button
              className={planningView === "story" ? "active" : ""}
              onClick={() => setPlanningView("story")}
            >
              <span>1</span>
              <div>
                <strong>전체 이야기 구성</strong>
                <small>구성 방식·소재·인물·갈등</small>
              </div>
            </button>
            <button
              className={planningView === "chapters" ? "active" : ""}
              onClick={() => setPlanningView("chapters")}
            >
              <span>2</span>
              <div>
                <strong>챕터 흐름 구성</strong>
                <small>사건을 나누고 장면 쓰기로 연결</small>
              </div>
            </button>
          </nav>

          {planningView === "story" ? (
            <div className="story-planning-layout">
              <section className="planning-card story-basics-card">
                <div className="card-heading">
                  <span>창작 메모 · 기본 설정</span>
                  <strong>이야기의 이름과 중심 생각</strong>
                </div>
                <div className="story-basics-grid">
                  <label className="field">
                    <span>이야기 제목</span>
                    <input
                      value={draft.title}
                      onChange={(event) =>
                        setDraft((project) => ({
                          ...project,
                          title: event.target.value,
                        }))
                      }
                      placeholder="이야기의 제목을 지어 보세요."
                    />
                  </label>
                  <label className="field">
                    <span>이야기 소재</span>
                    <textarea
                      rows={2}
                      value={draft.planning.material}
                      onChange={(event) =>
                        updatePlanning({ material: event.target.value })
                      }
                      placeholder="이야기의 출발점이 되는 사건, 경험, 상상"
                    />
                  </label>
                  <label className="field">
                    <span>이야기 주제</span>
                    <textarea
                      rows={2}
                      value={draft.planning.theme}
                      onChange={(event) =>
                        updatePlanning({ theme: event.target.value })
                      }
                      placeholder="이야기에서 중요하게 다룰 생각"
                    />
                  </label>
                  <label className="field">
                    <span>전체 분위기</span>
                    <textarea
                      rows={2}
                      value={draft.planning.mood}
                      onChange={(event) =>
                        updatePlanning({ mood: event.target.value })
                      }
                      placeholder="모험, 긴장, 재미처럼 써 보세요."
                    />
                  </label>
                </div>
              </section>

              <section className="planning-card story-compass-card">
                <div className="card-heading">
                  <span>이야기 나침반</span>
                  <strong>이야기의 핵심 다섯 가지</strong>
                </div>
                <p className="planning-help">
                  정답을 쓰는 칸이 아니에요. 생각이 바뀌면 언제든 다시 고칠 수
                  있어요.
                </p>
                <div className="story-compass-grid">
                  <label className="field compass-field">
                    <span>핵심 인물은 누구인가요?</span>
                    <textarea
                      rows={2}
                      value={draft.planning.mainCharacter}
                      onChange={(event) =>
                        updatePlanning({ mainCharacter: event.target.value })
                      }
                      placeholder="예: 다시 만난 토끼와 자라"
                    />
                  </label>
                  <label className="field compass-field">
                    <span>무엇을 바라고 있나요?</span>
                    <textarea
                      rows={2}
                      value={draft.planning.mainGoal}
                      onChange={(event) =>
                        updatePlanning({ mainGoal: event.target.value })
                      }
                      placeholder="주인공이 꼭 이루고 싶은 것"
                    />
                  </label>
                  <label className="field compass-field">
                    <span>주요 갈등은 무엇인가요?</span>
                    <textarea
                      rows={2}
                      value={draft.planning.centralProblem}
                      onChange={(event) =>
                        updatePlanning({ centralProblem: event.target.value })
                      }
                      placeholder="사건, 오해, 두려움, 상대 인물"
                    />
                  </label>
                  <label className="field compass-field">
                    <span>실패하면 어떤 일이 생기나요?</span>
                    <textarea
                      rows={2}
                      value={draft.planning.stakes}
                      onChange={(event) =>
                        updatePlanning({ stakes: event.target.value })
                      }
                      placeholder="포기하거나 실패했을 때 잃게 되는 것"
                    />
                  </label>
                  <label className="field compass-field">
                    <span>마지막에 무엇이 달라지나요?</span>
                    <textarea
                      rows={2}
                      value={draft.planning.endingChange}
                      onChange={(event) =>
                        updatePlanning({ endingChange: event.target.value })
                      }
                      placeholder="인물의 마음, 관계 또는 상황의 변화"
                    />
                  </label>
                </div>
                <label className="field wide premise-field">
                  <span>한 줄로 이어 보기</span>
                  <textarea
                    rows={2}
                    value={draft.planning.premise}
                    onChange={(event) =>
                      updatePlanning({ premise: event.target.value })
                    }
                    placeholder="누가, 무엇을 바라지만, 어떤 문제를 만나, 어떻게 달라지는 이야기"
                  />
                </label>
              </section>

              <aside className="planning-card story-check-card">
                <div className="card-heading">
                  <span>구성 점검</span>
                  <strong>
                    {readyStoryItems}/{storyChecklist.length} 준비
                  </strong>
                </div>
                <progress
                  value={readyStoryItems}
                  max={storyChecklist.length}
                  aria-label="전체 이야기 구성 진행"
                />
                <ul>
                  {storyChecklist.map((item) => (
                    <li className={item.ready ? "ready" : ""} key={item.label}>
                      <span>{item.ready ? "✓" : "○"}</span>
                      {item.label}
                    </li>
                  ))}
                </ul>
                <p>
                  모두 채우지 않아도 이야기를 쓸 수 있어요. 막혔을 때 돌아와
                  확인하는 안내판입니다.
                </p>
                <button
                  className="primary-button"
                  onClick={() => setPlanningView("chapters")}
                >
                  챕터로 나누기
                </button>
              </aside>

              <section className="planning-card story-arc-card">
                <div className="card-heading">
                  <span>이야기 뼈대</span>
                  <strong>{selectedStructure.title}</strong>
                </div>
                <p className="planning-help">
                  이야기의 길이와 난이도에 맞는 구성을 고르세요. 바꾸더라도
                  이미 쓴 내용은 지워지지 않아요.
                </p>
                <div
                  className="structure-mode-picker"
                  role="group"
                  aria-label="이야기 구성 방식"
                >
                  {STORY_STRUCTURE_OPTIONS.map((option) => (
                    <button
                      className={
                        option.mode === selectedStructure.mode ? "active" : ""
                      }
                      key={option.mode}
                      onClick={() =>
                        updatePlanning({ structureMode: option.mode })
                      }
                      type="button"
                    >
                      <b>{option.shortTitle}</b>
                      <span>{option.title}</span>
                    </button>
                  ))}
                </div>
                <div
                  className={`story-arc-grid guided-arc-grid mode-${selectedStructure.mode}`}
                >
                  {selectedStructure.steps.map((step, index) => (
                    <label className="field arc-step" key={step.key}>
                      <span>
                        <b>{index + 1}</b>
                        {step.label}
                      </span>
                      <small>{step.guide}</small>
                      <textarea
                        rows={5}
                        value={draft.planning[step.key]}
                        onChange={(event) =>
                          updatePlanning({
                            [step.key]: event.target.value,
                          } as Partial<StoryProject["planning"]>)
                        }
                      />
                    </label>
                  ))}
                </div>
              </section>

              <section className="planning-card story-details-card">
                <div className="card-heading">
                  <span>창작 메모 · 세부 설정</span>
                  <strong>인물과 배경을 구체적으로 정하기</strong>
                </div>
                <div className="planning-two-columns">
                  <label className="field">
                    <span>인물 설정</span>
                    <textarea
                      rows={7}
                      value={draft.planning.characterNotes}
                      onChange={(event) =>
                        updatePlanning({ characterNotes: event.target.value })
                      }
                      placeholder={"이름 / 이야기에서의 역할\n성격 / 바라는 것 / 다른 인물과의 관계\n이야기 끝에서 달라지는 점"}
                    />
                  </label>
                  <label className="field">
                    <span>배경·세계 설정</span>
                    <textarea
                      rows={7}
                      value={draft.planning.worldNotes}
                      onChange={(event) =>
                        updatePlanning({ worldNotes: event.target.value })
                      }
                      placeholder={"언제, 어디에서 벌어지는 이야기인가요?\n이 세계에서 꼭 지켜야 하는 규칙이나 특별한 장소가 있나요?"}
                    />
                  </label>
                </div>
              </section>

              <section className="planning-card idea-parking-card">
                <div className="card-heading">
                  <span>아이디어 보관함</span>
                  <strong>아직 결정하지 않아도 되는 생각</strong>
                </div>
                <div className="planning-two-columns">
                  <label className="field editor-only-field">
                    <span>아직 정하지 못한 것 · 한 줄에 하나씩</span>
                    <textarea
                      rows={5}
                      value={draft.planning.openQuestions}
                      onChange={(event) =>
                        updatePlanning({ openQuestions: event.target.value })
                      }
                      placeholder={"결말은 밝게 끝낼까?\n새 인물을 등장시킬까?"}
                    />
                  </label>
                  <label className="field editor-only-field">
                    <span>자유 창작 메모</span>
                    <textarea
                      rows={5}
                      value={draft.planning.freeNotes}
                      onChange={(event) =>
                        updatePlanning({ freeNotes: event.target.value })
                      }
                      placeholder="떠오른 대사, 연출, 장소처럼 잊고 싶지 않은 생각"
                    />
                  </label>
                </div>
              </section>
            </div>
          ) : (
            <div className="chapter-planning-workspace">
              <section className="chapter-flow-board">
                <div className="chapter-flow-heading">
                  <div>
                    <span className="eyebrow">구성 한눈에 보기</span>
                    <h2>챕터가 어떻게 이어지는지 확인하세요</h2>
                    <p>
                      한 챕터에는 한 가지 중요한 변화를 담고, 그 결과가 다음
                      챕터의 원인이 되게 이어 보세요.
                    </p>
                  </div>
                  <button className="primary-button" onClick={addChapter}>
                    + 챕터 추가
                  </button>
                </div>
                <div className="chapter-flow-list">
                  {sortedChapters.map((chapter, chapterIndex) => {
                    const filledItems = [
                      chapter.title,
                      chapter.summary,
                      chapter.purpose,
                      chapter.keyEvents,
                    ].filter((value) => value.trim()).length;
                    const eventCount = chapter.keyEvents
                      .split("\n")
                      .filter((value) => value.trim()).length;
                    const sceneCount = draft.lines.filter(
                      (line) => line.chapterId === chapter.id,
                    ).length;
                    const nextChapter = sortedChapters[chapterIndex + 1];
                    const isContinuationChapter =
                      continuationPoint?.chapterId === chapter.id;
                    const arcLabel = isContinuationChapter
                      ? "이어쓰기"
                      : chapterArcLabel(
                          chapterIndex,
                          sortedChapters.length,
                          selectedStructure.steps,
                        );
                    return (
                      <article
                        className={`chapter-flow-card ${
                          chapter.id === selectedChapter?.id ? "active" : ""
                        } ${isContinuationChapter ? "continuation" : ""}`}
                        key={chapter.id}
                      >
                        <div className="chapter-flow-stage">
                          <span>{arcLabel}</span>
                          {chapter.id === selectedChapter?.id && (
                            <b>현재 보고 있어요</b>
                          )}
                        </div>
                        <header>
                          <span>{chapter.order}</span>
                          <div>
                            <strong>
                              {chapter.title || `챕터 ${chapter.order}`}
                            </strong>
                            <small>
                              구상 {filledItems}/4 · 사건 {eventCount} · 장면{" "}
                              {sceneCount}
                            </small>
                          </div>
                        </header>
                        <p>
                          {chapter.summary ||
                            "이 챕터에서 달라지는 일을 적어 보세요."}
                        </p>
                        <div className="chapter-flow-link">
                          <span>
                            {nextChapter
                              ? `다음 챕터 · ${nextChapter.order}. ${
                                  nextChapter.title || "제목 없음"
                                }`
                              : "이야기를 더 이어 쓴다면"}
                          </span>
                          <strong>
                            {chapter.nextChapterIdea || "아직 연결 메모가 없어요."}
                          </strong>
                        </div>
                        <div className="chapter-flow-actions">
                          <button onClick={() => openChapterPlan(chapter.id)}>
                            구상 다듬기
                          </button>
                          <button onClick={() => openChapterWriter(chapter.id)}>
                            대사 쓰기
                          </button>
                        </div>
                      </article>
                    );
                  })}
                  {sortedChapters.length === 0 && (
                    <button className="chapter-flow-empty" onClick={addChapter}>
                      <strong>첫 챕터 만들기</strong>
                      <span>이야기의 시작에서 일어날 일을 정해 보세요.</span>
                    </button>
                  )}
                </div>
              </section>

              <div className="planning-grid chapter-planning-grid">
                <aside className="chapter-rail planning-chapter-rail">
                  <div className="chapter-rail-heading">
                    <div>
                      <span className="eyebrow">챕터 구상</span>
                      <strong>챕터 목록</strong>
                    </div>
                    <button onClick={addChapter} aria-label="챕터 추가">
                      +
                    </button>
                  </div>
                  {sortedChapters.map((chapter) => (
                    <button
                      key={chapter.id}
                      className={
                        chapter.id === selectedChapter?.id ? "active" : ""
                      }
                      onClick={() => selectChapter(chapter.id)}
                    >
                      <span>{chapter.order}</span>
                      <div>
                        <strong>
                          {chapter.title || `챕터 ${chapter.order}`}
                        </strong>
                        <small>{chapter.summary || "아직 구상 중"}</small>
                      </div>
                    </button>
                  ))}
                </aside>

                {selectedChapter ? (
                  <section className="planning-card chapter-plan-card">
                    <div className="card-heading with-actions">
                      <div>
                        <span>챕터 {selectedChapter.order}</span>
                        <strong>한 챕터의 변화 만들기</strong>
                      </div>
                      <button
                        className="danger-link"
                        onClick={() => removeChapter(selectedChapter.id)}
                      >
                        챕터 삭제
                      </button>
                    </div>
                    <div className="chapter-plan-status">
                      <span>
                        구상{" "}
                        {
                          [
                            selectedChapter.title,
                            selectedChapter.summary,
                            selectedChapter.purpose,
                            selectedChapter.keyEvents,
                          ].filter((value) => value.trim()).length
                        }
                        /4
                      </span>
                      <span>
                        장면 {selectedChapterLines.length}개
                      </span>
                      <span>
                        화자 {selectedChapter.chapterSpeakerNames.length}명
                      </span>
                    </div>
                    <label className="field wide">
                      <span>챕터 제목 · 플레이에도 표시</span>
                      <input
                        value={selectedChapter.title}
                        onChange={(event) =>
                          updateChapter(selectedChapter.id, {
                            title: event.target.value,
                          })
                        }
                        placeholder={`챕터 ${selectedChapter.order} 제목`}
                      />
                    </label>
                    <label className="field wide editor-only-field">
                      <span>이 챕터에서 가장 중요하게 달라지는 일</span>
                      <textarea
                        rows={3}
                        value={selectedChapter.summary}
                        onChange={(event) =>
                          updateChapter(selectedChapter.id, {
                            summary: event.target.value,
                          })
                        }
                        placeholder="이 챕터를 한 문장으로 요약해 보세요."
                      />
                    </label>
                    <div className="planning-two-columns">
                      <label className="field editor-only-field">
                        <span>전체 이야기에서 맡은 역할</span>
                        <textarea
                          rows={3}
                          value={selectedChapter.purpose}
                          onChange={(event) =>
                            updateChapter(selectedChapter.id, {
                              purpose: event.target.value,
                            })
                          }
                          placeholder="인물 소개, 문제 시작, 중요한 선택, 마무리"
                        />
                      </label>
                      <label className="field editor-only-field">
                        <span>인물의 감정은 어떻게 바뀌나요?</span>
                        <textarea
                          rows={3}
                          value={selectedChapter.mood}
                          onChange={(event) =>
                            updateChapter(selectedChapter.id, {
                              mood: event.target.value,
                            })
                          }
                          placeholder="예: 경계 → 궁금함 → 결심"
                        />
                      </label>
                    </div>
                    <label className="field wide editor-only-field">
                      <span>꼭 일어날 사건 · 한 줄에 하나씩</span>
                      <textarea
                        rows={4}
                        value={selectedChapter.keyEvents}
                        onChange={(event) =>
                          updateChapter(selectedChapter.id, {
                            keyEvents: event.target.value,
                          })
                        }
                        placeholder={
                          "자라가 찾아온다.\n자라가 부탁한다.\n그 말을 들은 토끼가 결정을 내린다."
                        }
                      />
                    </label>
                    <label className="field wide editor-only-field">
                      <span>이 챕터의 결과로 다음에 생기는 일</span>
                      <textarea
                        rows={2}
                        value={selectedChapter.nextChapterIdea}
                        onChange={(event) =>
                          updateChapter(selectedChapter.id, {
                            nextChapterIdea: event.target.value,
                          })
                        }
                        placeholder="이번 선택이나 사건 때문에 다음 챕터에서 생기는 일"
                      />
                    </label>
                    <details className="chapter-resource-details">
                      <summary>이 챕터에서 사용할 화자·이미지 정하기</summary>
                      <p>
                        장면 편집의 드롭다운에는 여기에서 고른 자료만 표시돼요.
                      </p>
                      <section className="resource-pool">
                        <div className="resource-pool-heading">
                          <strong>화자 이름</strong>
                          <span>
                            {selectedChapter.chapterSpeakerNames.length}개
                          </span>
                        </div>
                        <div className="resource-chip-list">
                          {selectedChapter.chapterSpeakerNames.map((name) => (
                            <span className="resource-chip" key={name}>
                              {name}
                            </span>
                          ))}
                          {selectedChapter.chapterSpeakerNames.length === 0 && (
                            <span className="empty-resource-copy">
                              아직 고른 화자가 없어요.
                            </span>
                          )}
                        </div>
                        <AddSpeaker
                          onAdd={(name) => addSpeaker(name, false)}
                        />
                      </section>
                      <ResourcePool
                        title="캐릭터 이미지"
                        type="character"
                        ids={selectedChapter.characterAssetIds}
                        favoriteIds={favoriteAssets}
                        recentIds={recentAssets}
                        onToggleFavorite={toggleFavorite}
                        onAdd={(id) => addAssetToChapter(id, "character")}
                        onRemove={(id) => removeAsset(id, "character")}
                      />
                      <ResourcePool
                        title="장소·배경"
                        type="background"
                        ids={selectedChapter.backgroundAssetIds}
                        favoriteIds={favoriteAssets}
                        recentIds={recentAssets}
                        onToggleFavorite={toggleFavorite}
                        onAdd={(id) => addAssetToChapter(id, "background")}
                        onRemove={(id) => removeAsset(id, "background")}
                      />
                    </details>
                    <button
                      className="primary-button full-button"
                      onClick={() => openChapterWriter(selectedChapter.id)}
                    >
                      이 챕터의 대사·해설 쓰기
                    </button>
                  </section>
                ) : (
                  <section className="empty-creator-state">
                    <span>1</span>
                    <h2>첫 챕터를 구상해 보세요</h2>
                    <p>
                      챕터를 만든 뒤 주요 변화와 사건을 정할 수 있어요.
                    </p>
                    <button className="primary-button" onClick={addChapter}>
                      + 첫 챕터 만들기
                    </button>
                  </section>
                )}
              </div>
            </div>
          )}
        </section>
      ) : (
        <section className="making-workspace">
          <header
            className={`making-toolbar ${
              mobileEditorToolsOpen ? "mobile-open" : ""
            }`}
          >
            <button
              className="mobile-panel-toggle editor-tools-toggle"
              aria-expanded={mobileEditorToolsOpen}
              onClick={() => setMobileEditorToolsOpen((current) => !current)}
            >
              <span>
                <strong>편집 방법</strong>
                <small>
                  {editorMode === "chapter" ? "챕터 전체" : "현재 장면"} ·{" "}
                  {imageView === "text" ? "글만" : "작은 그림"}
                </small>
              </span>
              <b>{mobileEditorToolsOpen ? "접기" : "펼치기"}</b>
            </button>
            <div className="editor-mode-switch" aria-label="편집 화면 선택">
              <button
                className={editorMode === "chapter" ? "active" : ""}
                onClick={() => setEditorMode("chapter")}
              >
                <strong>챕터 전체 편집</strong>
                <small>대사를 이어 읽으며 써요</small>
              </button>
              <button
                className={editorMode === "scene" ? "active" : ""}
                onClick={() => setEditorMode("scene")}
                disabled={!selectedLine}
              >
                <strong>현재 장면 편집</strong>
                <small>인물과 배경까지 꾸며요</small>
              </button>
            </div>
            <div className="location-pill">
              <span>지금 고치는 곳</span>
              <strong>{currentLocation}</strong>
            </div>
            <label className="view-setting">
              <span>보기 설정</span>
              <select
                value={imageView}
                onChange={(event) =>
                  setImageView(event.target.value as ImageView)
                }
              >
                <option value="text">글만 보기</option>
                <option value="small">작은 그림 함께 보기</option>
              </select>
            </label>
          </header>

          {selectedChapter ? (
            <div className="making-layout">
              <aside className="chapter-rail">
                <div className="chapter-rail-heading">
                  <div>
                    <span className="eyebrow">이야기 순서</span>
                    <strong>챕터</strong>
                  </div>
                  <button onClick={addChapter} aria-label="챕터 추가">
                    +
                  </button>
                </div>
                {sortedChapters.map((chapter, chapterIndex) => {
                  const arcLabel =
                    continuationPoint?.chapterId === chapter.id
                      ? "이어쓰기"
                      : chapterArcLabel(
                          chapterIndex,
                          sortedChapters.length,
                          selectedStructure.steps,
                        );
                  return (
                    <button
                      key={chapter.id}
                      className={
                        chapter.id === selectedChapter.id ? "active" : ""
                      }
                      onClick={() => selectChapter(chapter.id)}
                    >
                      <span>{chapter.order}</span>
                      <div>
                        <strong>
                          {chapter.title || `챕터 ${chapter.order}`}
                        </strong>
                        <small>
                          {arcLabel} ·{" "}
                          {
                            draft.lines.filter(
                              (line) => line.chapterId === chapter.id,
                            ).length
                          }
                          개 장면
                        </small>
                      </div>
                    </button>
                  );
                })}
              </aside>

              <div className="mobile-chapter-picker">
                <label>
                  <span>챕터 선택</span>
                  <select
                    value={selectedChapter.id}
                    onChange={(event) => selectChapter(event.target.value)}
                  >
                    {sortedChapters.map((chapter) => (
                      <option value={chapter.id} key={chapter.id}>
                        {chapter.order}. {chapter.title || "제목 없음"}
                      </option>
                    ))}
                  </select>
                </label>
                <button onClick={addChapter}>+ 챕터</button>
              </div>

              <section className="editor-main">
                <header className="chapter-editor-heading">
                  <div>
                    <span className="eyebrow">
                      챕터 {selectedChapter.order}
                    </span>
                    <h1>{selectedChapter.title || "제목 없는 챕터"}</h1>
                    <p>
                      장면 {selectedChapterLines.length}개 · 대사{" "}
                      {
                        selectedChapterLines.filter(
                          (line) => line.type === "dialogue",
                        ).length
                      }
                      개 · 해설{" "}
                      {
                        selectedChapterLines.filter(
                          (line) => line.type === "narration",
                        ).length
                      }
                      개
                    </p>
                  </div>
                  <div>
                    <button
                      className="quiet-button"
                      onClick={() => setChapterGuideOpen((current) => !current)}
                    >
                      구상 메모 {chapterGuideOpen ? "닫기" : "보기"}
                    </button>
                    <button
                      className="quiet-button"
                      onClick={() =>
                        setChapterResourcesOpen((current) => !current)
                      }
                    >
                      챕터 자료 {chapterResourcesOpen ? "닫기" : "설정"}
                    </button>
                    <button
                      className="ghost-button"
                      onClick={playSelectedChapter}
                    >
                      이 챕터부터 보기
                    </button>
                  </div>
                </header>

                <section className="chapter-context-strip">
                  <div>
                    <span>이번 챕터에서 달라지는 일</span>
                    <strong>
                      {selectedChapter.summary ||
                        "이 챕터에서 생길 가장 중요한 변화를 적어 보세요."}
                    </strong>
                  </div>
                  <b aria-hidden="true">→</b>
                  <div>
                    <span>그 결과 다음에 생기는 일</span>
                    <strong>
                      {selectedChapter.nextChapterIdea ||
                        "다음 사건으로 이어질 내용을 정해 보세요."}
                    </strong>
                  </div>
                </section>

                {chapterGuideOpen && (
                  <section className="chapter-guide-panel">
                    <div className="story-direction-strip">
                      <span>전체 이야기 나침반</span>
                      <strong>
                        핵심 인물:{" "}
                        {draft.planning.mainCharacter || "아직 정하지 않음"} ·{" "}
                        {draft.planning.mainGoal || "바라는 것 미정"} · 주요 갈등:{" "}
                        {draft.planning.centralProblem || "아직 정하지 않음"} ·
                        실패하면:{" "}
                        {draft.planning.stakes || "아직 정하지 않음"}
                      </strong>
                    </div>
                    <div>
                      <span>이 챕터에서 달라지는 일</span>
                      <strong>
                        {selectedChapter.summary || "주요 내용을 적어 보세요."}
                      </strong>
                    </div>
                    <div>
                      <small>이 챕터의 역할</small>
                      <p>{selectedChapter.purpose || "아직 메모가 없어요."}</p>
                    </div>
                    <div>
                      <small>꼭 들어갈 사건</small>
                      <p>{selectedChapter.keyEvents || "아직 메모가 없어요."}</p>
                    </div>
                    <button
                      onClick={() => setWorkspaceMode("plan")}
                    >
                      구상 화면에서 수정
                    </button>
                  </section>
                )}

                {chapterResourcesOpen && (
                  <section className="chapter-resource-panel">
                    <div className="panel-title">
                      <div>
                        <span className="eyebrow">챕터 자료</span>
                        <h2>이 챕터에서 사용할 것만 고르기</h2>
                      </div>
                      <button
                        className="quiet-button"
                        onClick={() => setChapterResourcesOpen(false)}
                      >
                        닫기
                      </button>
                    </div>
                    <section className="resource-pool">
                      <div className="resource-pool-heading">
                        <strong>화자 이름</strong>
                        <span>{selectedChapter.chapterSpeakerNames.length}개</span>
                      </div>
                      <div className="resource-chip-list">
                        {selectedChapter.chapterSpeakerNames.map((name) => (
                          <span className="resource-chip" key={name}>
                            {name}
                          </span>
                        ))}
                        {selectedChapter.chapterSpeakerNames.length === 0 && (
                          <span className="empty-resource-copy">
                            아직 고른 화자가 없어요.
                          </span>
                        )}
                      </div>
                      <AddSpeaker
                        onAdd={(name) => addSpeaker(name, false)}
                      />
                    </section>
                    <ResourcePool
                      title="캐릭터 이미지"
                      type="character"
                      ids={selectedChapter.characterAssetIds}
                      favoriteIds={favoriteAssets}
                      recentIds={recentAssets}
                      onToggleFavorite={toggleFavorite}
                      onAdd={(id) => addAssetToChapter(id, "character")}
                      onRemove={(id) => removeAsset(id, "character")}
                    />
                    <ResourcePool
                      title="장소·배경"
                      type="background"
                      ids={selectedChapter.backgroundAssetIds}
                      favoriteIds={favoriteAssets}
                      recentIds={recentAssets}
                      onToggleFavorite={toggleFavorite}
                      onAdd={(id) => addAssetToChapter(id, "background")}
                      onRemove={(id) => removeAsset(id, "background")}
                    />
                    <div className="chapter-default-grid">
                      <ImageField
                        label="챕터 기본 배경"
                        type="background"
                        value={selectedChapter.backgroundId}
                        allowedIds={selectedChapter.backgroundAssetIds}
                        favoriteIds={favoriteAssets}
                        recentIds={recentAssets}
                        onToggleFavorite={toggleFavorite}
                        onUse={(id) => addAssetToChapter(id, "background")}
                        onChange={(backgroundId) =>
                          updateChapter(selectedChapter.id, { backgroundId })
                        }
                      />
                      <ImageField
                        label="기본 왼쪽 이미지"
                        type="character"
                        value={selectedChapter.leftAssetId}
                        allowedIds={selectedChapter.characterAssetIds}
                        favoriteIds={favoriteAssets}
                        recentIds={recentAssets}
                        onToggleFavorite={toggleFavorite}
                        onUse={(id) => addAssetToChapter(id, "character")}
                        onChange={(leftAssetId) =>
                          updateChapter(selectedChapter.id, { leftAssetId })
                        }
                      />
                      <ImageField
                        label="기본 오른쪽 이미지"
                        type="character"
                        value={selectedChapter.rightAssetId}
                        allowedIds={selectedChapter.characterAssetIds}
                        favoriteIds={favoriteAssets}
                        recentIds={recentAssets}
                        onToggleFavorite={toggleFavorite}
                        onUse={(id) => addAssetToChapter(id, "character")}
                        onChange={(rightAssetId) =>
                          updateChapter(selectedChapter.id, { rightAssetId })
                        }
                      />
                    </div>
                  </section>
                )}

                {editorMode === "chapter" ? (
                  <div className="chapter-script-editor">
                    <div className="script-editor-heading">
                      <div>
                        <strong>챕터 전체 대본</strong>
                        <span>글상자를 눌러 바로 수정할 수 있어요.</span>
                      </div>
                      <span>
                        {selectedLine
                          ? `장면 ${selectedLineIndex + 1} 편집 중`
                          : "장면 없음"}
                      </span>
                    </div>
                    <div className="script-scene-list">
                      {selectedChapterLines.map((line, index) => (
                        <article
                          className={`script-scene-card ${line.type} ${
                            line.id === selectedLine?.id ? "active" : ""
                          }`}
                          key={line.id}
                          onFocus={() => setSelectedLineId(line.id)}
                          onClick={() => setSelectedLineId(line.id)}
                        >
                          <div className="scene-order">
                            <strong>{index + 1}</strong>
                            <span>
                              {line.id === selectedLine?.id ? "편집 중" : "장면"}
                            </span>
                          </div>
                          <div className="scene-writing-fields">
                            <div className="scene-inline-controls">
                              <span
                                className={`scene-kind-badge ${line.type}`}
                              >
                                {line.type === "narration"
                                  ? "해설 · 이야기 설명"
                                  : "대사 · 인물이 말함"}
                              </span>
                              <select
                                value={line.type}
                                aria-label={`장면 ${index + 1} 종류`}
                                onChange={(event) =>
                                  changeLineType(
                                    line.id,
                                    event.target.value as StoryLine["type"],
                                  )
                                }
                              >
                                <option value="dialogue">대사</option>
                                <option value="narration">해설</option>
                              </select>
                              {line.type === "dialogue" && (
                                <>
                                  <select
                                    value={line.speaker}
                                    aria-label={`장면 ${index + 1} 화자 위치`}
                                    onChange={(event) =>
                                      updateLine(line.id, {
                                        speaker: event.target
                                          .value as StoryLine["speaker"],
                                      })
                                    }
                                  >
                                    <option value="left">왼쪽</option>
                                    <option value="right">오른쪽</option>
                                  </select>
                                  <select
                                    value={line.speakerName}
                                    aria-label={`장면 ${index + 1} 화자 이름`}
                                    onChange={(event) =>
                                      updateLine(line.id, {
                                        speakerName: event.target.value,
                                      })
                                    }
                                  >
                                    {unique([
                                      line.speakerName,
                                      ...selectedChapter.chapterSpeakerNames,
                                    ]).map((name) => (
                                      <option value={name} key={name}>
                                        {name}
                                      </option>
                                    ))}
                                  </select>
                                </>
                              )}
                            </div>
                            <textarea
                              rows={3}
                              value={line.text}
                              autoFocus={
                                line.id === selectedLine?.id &&
                                selectedChapterLines.length === 1 &&
                                !line.text
                              }
                              placeholder={
                                line.type === "narration"
                                  ? "시간·장소·상황을 괄호 없이 들려주세요."
                                  : "대사를 쓰고, 속마음·행동은 (괄호 안에) 써 보세요."
                              }
                              onChange={(event) =>
                                updateLine(line.id, { text: event.target.value })
                              }
                              aria-label={`장면 ${index + 1} 내용`}
                            />
                            <small
                              className={`scene-writing-help ${
                                line.type === "narration" &&
                                containsParentheses(line.text)
                                  ? "warning"
                                  : ""
                              }`}
                            >
                              {line.type === "narration"
                                ? containsParentheses(line.text)
                                  ? "해설에는 괄호를 쓸 수 없어요. 이 내용을 대사 장면으로 옮겨 주세요."
                                  : "해설은 괄호 없이 시간·장소·상황을 들려줘요."
                                : "속마음·표정·행동은 학생이 직접 (괄호 안에) 써요."}
                            </small>
                            <small className="scene-asset-summary">
                              왼쪽{" "}
                              {assetName(
                                line.leftAssetId ||
                                  selectedChapter.leftAssetId,
                              ) || "없음"}
                              {" · "}오른쪽{" "}
                              {assetName(
                                line.rightAssetId ||
                                  selectedChapter.rightAssetId,
                              ) || "없음"}
                              {" · "}배경{" "}
                              {assetName(
                                line.backgroundId ||
                                  selectedChapter.backgroundId,
                              ) || "없음"}
                            </small>
                          </div>
                          {imageView === "small" && (
                            <SceneThumbnail
                              chapter={selectedChapter}
                              line={line}
                            />
                          )}
                          <div className="scene-card-actions">
                            <button
                              onClick={() => moveLine(line.id, -1)}
                              disabled={index === 0}
                              aria-label={`장면 ${index + 1} 위로 이동`}
                            >
                              ↑
                            </button>
                            <button
                              onClick={() => moveLine(line.id, 1)}
                              disabled={
                                index === selectedChapterLines.length - 1
                              }
                              aria-label={`장면 ${index + 1} 아래로 이동`}
                            >
                              ↓
                            </button>
                            <button onClick={() => duplicateLine(line.id)}>
                              복제
                            </button>
                            <button
                              className="scene-focus-button"
                              onClick={() => {
                                setSelectedLineId(line.id);
                                setEditorMode("scene");
                              }}
                            >
                              장면 자세히 편집
                            </button>
                            <button
                              className="danger-link"
                              onClick={() => removeLine(line.id)}
                            >
                              삭제
                            </button>
                          </div>
                        </article>
                      ))}
                      {selectedChapterLines.length === 0 && (
                        <div className="empty-script">
                          <strong>아직 장면이 없어요.</strong>
                          <p>
                            대사나 해설을 추가하면 빈 글상자에 바로 쓸 수
                            있어요.
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="add-scene-row">
                      <button onClick={() => addLine("dialogue")}>
                        + 대사 장면
                      </button>
                      <button onClick={() => addLine("narration")}>
                        + 해설 장면
                      </button>
                    </div>
                  </div>
                ) : selectedLine ? (
                  <div className="scene-focus-editor">
                    <div className="scene-focus-nav">
                      <button
                        disabled={selectedStoryLineIndex <= 0}
                        onClick={() => moveThroughStory(-1)}
                      >
                        ← 이전 장면
                      </button>
                      <strong>
                        전체 장면 {selectedStoryLineIndex + 1}/
                        {orderedDraftLines.length}
                        <small>
                          챕터 {selectedChapter.order} · 이 챕터{" "}
                          {selectedLineIndex + 1}/{selectedChapterLines.length}
                        </small>
                      </strong>
                      <button
                        disabled={
                          selectedStoryLineIndex >= orderedDraftLines.length - 1
                        }
                        onClick={() => moveThroughStory(1)}
                      >
                        다음 장면 →
                      </button>
                    </div>

                    <section
                      className="editable-stage"
                      style={
                        ASSET_BY_ID.get(
                          selectedLine.backgroundId ||
                            selectedChapter.backgroundId,
                        )?.src
                          ? {
                              backgroundImage: `linear-gradient(180deg, rgba(9,20,29,.04), rgba(9,20,29,.5)), url("${
                                ASSET_BY_ID.get(
                                  selectedLine.backgroundId ||
                                    selectedChapter.backgroundId,
                                )?.src
                              }")`,
                            }
                          : undefined
                      }
                    >
                      <div className="stage-background-action">
                        <AssetPickerButton
                          type="background"
                          label="장면 배경"
                          buttonText={
                            selectedLine.backgroundId ||
                            selectedChapter.backgroundId
                              ? "배경 변경"
                              : "+ 배경 추가"
                          }
                          value={selectedLine.backgroundId}
                          favoriteIds={favoriteAssets}
                          recentIds={recentAssets}
                          onToggleFavorite={toggleFavorite}
                          onSelect={(id) => {
                            addAssetToChapter(id, "background");
                            updateLine(selectedLine.id, { backgroundId: id });
                          }}
                        />
                      </div>
                      {(["left", "right"] as const).map((side) => {
                        const lineId =
                          side === "left"
                            ? selectedLine.leftAssetId
                            : selectedLine.rightAssetId;
                        const defaultId =
                          side === "left"
                            ? selectedChapter.leftAssetId
                            : selectedChapter.rightAssetId;
                        const effectiveId = lineId || defaultId;
                        return (
                          <div
                            className={`editable-character-slot ${side}`}
                            key={side}
                          >
                            <AssetPreview
                              assetId={effectiveId}
                              alt={assetName(effectiveId) || `${side} 캐릭터`}
                              className={`editable-stage-character ${assetPlacementClass(
                                effectiveId,
                              )} ${
                                shouldMirrorAsset(effectiveId, side)
                                  ? "mirrored"
                                  : ""
                              }`}
                            />
                            <AssetPickerButton
                              type="character"
                              label={
                                side === "left"
                                  ? "왼쪽 캐릭터"
                                  : "오른쪽 캐릭터"
                              }
                              buttonText={
                                effectiveId
                                  ? side === "left"
                                    ? "왼쪽 이미지 변경"
                                    : "오른쪽 이미지 변경"
                                  : side === "left"
                                    ? "+ 왼쪽 인물 추가"
                                    : "+ 오른쪽 인물 추가"
                              }
                              value={lineId}
                              favoriteIds={favoriteAssets}
                              recentIds={recentAssets}
                              onToggleFavorite={toggleFavorite}
                              onSelect={(id) => {
                                addAssetToChapter(id, "character");
                                updateLine(
                                  selectedLine.id,
                                  side === "left"
                                    ? { leftAssetId: id }
                                    : { rightAssetId: id },
                                );
                              }}
                            />
                          </div>
                        );
                      })}
                      <label
                        className={`editable-stage-dialogue ${
                          selectedLine.type === "narration"
                            ? "narration"
                            : ""
                        }`}
                      >
                        <span className="editable-stage-kind">
                          <b>
                            {selectedLine.type === "narration"
                              ? "해설"
                              : selectedLine.speakerName || "화자 없음"}
                          </b>
                          <small>
                            {selectedLine.type === "narration"
                              ? "장면과 사건을 들려주는 글"
                              : `${
                                  selectedLine.speaker === "right"
                                    ? "오른쪽"
                                    : "왼쪽"
                                }에서 말하는 대사`}
                          </small>
                        </span>
                        <textarea
                          rows={3}
                          value={selectedLine.text}
                          onChange={(event) =>
                            updateLine(selectedLine.id, {
                              text: event.target.value,
                            })
                          }
                          placeholder={
                            selectedLine.type === "narration"
                              ? "시간·장소·상황을 괄호 없이 들려주세요."
                              : "대사를 쓰고, 속마음·행동은 (괄호 안에) 써 보세요."
                          }
                          aria-label="현재 장면 글상자"
                        />
                        <small
                          className={`stage-writing-help ${
                            selectedLine.type === "narration" &&
                            containsParentheses(selectedLine.text)
                              ? "warning"
                              : ""
                          }`}
                        >
                          {selectedLine.type === "narration"
                            ? containsParentheses(selectedLine.text)
                              ? "해설에는 괄호를 쓸 수 없어요."
                              : "해설은 괄호 없이 씁니다."
                            : "속마음·표정·행동은 (괄호 안에) 직접 씁니다."}
                        </small>
                      </label>
                    </section>

                    <button
                      className="mobile-panel-toggle scene-settings-toggle"
                      aria-expanded={sceneSettingsOpen}
                      onClick={() => setSceneSettingsOpen((current) => !current)}
                    >
                      <span>
                        <strong>화자·이미지·장면 설정</strong>
                        <small>종류, 화자 위치, 캐릭터와 배경</small>
                      </span>
                      <b>{sceneSettingsOpen ? "접기" : "펼치기"}</b>
                    </button>

                    <div
                      className={`scene-focus-lower ${
                        sceneSettingsOpen ? "mobile-open" : ""
                      }`}
                    >
                      <section className="scene-setting-card">
                        <div className="card-heading">
                          <span>플레이에 표시</span>
                          <strong>대사·해설과 장면 설정</strong>
                        </div>
                        <div className="scene-setting-grid">
                          <label className="field">
                            <span>종류</span>
                            <select
                              value={selectedLine.type}
                              onChange={(event) =>
                                changeLineType(
                                  selectedLine.id,
                                  event.target.value as StoryLine["type"],
                                )
                              }
                            >
                              <option value="dialogue">대사</option>
                              <option value="narration">해설</option>
                            </select>
                          </label>
                          {selectedLine.type === "dialogue" && (
                            <>
                              <label className="field">
                                <span>화자 위치</span>
                                <select
                                  value={selectedLine.speaker}
                                  onChange={(event) =>
                                    updateLine(selectedLine.id, {
                                      speaker: event.target
                                        .value as StoryLine["speaker"],
                                    })
                                  }
                                >
                                  <option value="left">왼쪽</option>
                                  <option value="right">오른쪽</option>
                                </select>
                              </label>
                              <label className="field">
                                <span>화자 이름</span>
                                <select
                                  value={selectedLine.speakerName}
                                  onChange={(event) =>
                                    updateLine(selectedLine.id, {
                                      speakerName: event.target.value,
                                    })
                                  }
                                >
                                  {unique([
                                    selectedLine.speakerName,
                                    ...selectedChapter.chapterSpeakerNames,
                                  ]).map((name) => (
                                    <option value={name} key={name}>
                                      {name}
                                    </option>
                                  ))}
                                </select>
                              </label>
                              <AddSpeaker onAdd={addSpeaker} />
                            </>
                          )}
                        </div>
                        <div className="scene-image-dropdowns">
                          <ImageField
                            label="왼쪽 캐릭터"
                            type="character"
                            value={selectedLine.leftAssetId}
                            allowDefault
                            allowedIds={selectedChapter.characterAssetIds}
                            favoriteIds={favoriteAssets}
                            recentIds={recentAssets}
                            onToggleFavorite={toggleFavorite}
                            onUse={(id) =>
                              addAssetToChapter(id, "character")
                            }
                            onChange={(leftAssetId) =>
                              updateLine(selectedLine.id, { leftAssetId })
                            }
                          />
                          <ImageField
                            label="오른쪽 캐릭터"
                            type="character"
                            value={selectedLine.rightAssetId}
                            allowDefault
                            allowedIds={selectedChapter.characterAssetIds}
                            favoriteIds={favoriteAssets}
                            recentIds={recentAssets}
                            onToggleFavorite={toggleFavorite}
                            onUse={(id) =>
                              addAssetToChapter(id, "character")
                            }
                            onChange={(rightAssetId) =>
                              updateLine(selectedLine.id, { rightAssetId })
                            }
                          />
                          <ImageField
                            label="장면 배경"
                            type="background"
                            value={selectedLine.backgroundId}
                            allowDefault
                            allowedIds={selectedChapter.backgroundAssetIds}
                            favoriteIds={favoriteAssets}
                            recentIds={recentAssets}
                            onToggleFavorite={toggleFavorite}
                            onUse={(id) =>
                              addAssetToChapter(id, "background")
                            }
                            onChange={(backgroundId) =>
                              updateLine(selectedLine.id, { backgroundId })
                            }
                          />
                        </div>
                        <SceneStagingCopy
                          key={selectedLine.id}
                          chapters={draft.chapters}
                          lines={draft.lines}
                          currentLineId={selectedLine.id}
                          onCopy={copySceneStaging}
                        />
                      </section>

                      <section className="scene-notes-card">
                        <button
                          className="scene-notes-toggle"
                          onClick={() => setSceneNotesOpen((current) => !current)}
                        >
                          <span>
                            편집할 때만 보는 장면 메모 · 플레이에는 안 나와요
                          </span>
                          <strong>{sceneNotesOpen ? "닫기" : "열기"}</strong>
                        </button>
                        {sceneNotesOpen && (
                          <div className="scene-notes-fields">
                            <label className="field">
                              <span>이 장면의 역할</span>
                              <textarea
                                rows={3}
                                value={selectedLine.purposeNote}
                                onChange={(event) =>
                                  updateLine(selectedLine.id, {
                                    purposeNote: event.target.value,
                                  })
                                }
                              />
                            </label>
                            <label className="field">
                              <span>인물의 감정</span>
                              <textarea
                                rows={3}
                                value={selectedLine.emotionNote}
                                onChange={(event) =>
                                  updateLine(selectedLine.id, {
                                    emotionNote: event.target.value,
                                  })
                                }
                              />
                            </label>
                            <label className="field">
                              <span>연출 메모</span>
                              <textarea
                                rows={3}
                                value={selectedLine.directionNote}
                                onChange={(event) =>
                                  updateLine(selectedLine.id, {
                                    directionNote: event.target.value,
                                  })
                                }
                              />
                            </label>
                          </div>
                        )}
                      </section>
                    </div>

                    <div className="scene-focus-actions">
                      <button onClick={() => setEditorMode("chapter")}>
                        챕터 전체 편집으로
                      </button>
                      <button onClick={() => addLine("dialogue", true)}>
                        현재 장면 다음에 + 대사
                      </button>
                      <button onClick={() => addLine("narration", true)}>
                        + 해설
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="empty-creator-state">
                    <h2>집중해서 편집할 장면이 없어요</h2>
                    <p>빈 대사 또는 해설 장면을 만들면 바로 커서가 놓입니다.</p>
                    <div>
                      <button
                        className="primary-button"
                        onClick={() => addLine("dialogue", true)}
                      >
                        + 대사 장면
                      </button>
                      <button
                        className="ghost-button"
                        onClick={() => addLine("narration", true)}
                      >
                        + 해설 장면
                      </button>
                    </div>
                  </div>
                )}
              </section>
            </div>
          ) : (
            <section className="empty-creator-state no-chapter">
              <span>1</span>
              <h1>첫 챕터부터 시작하세요</h1>
              <p>
                구상 화면에서 계획해도 되고, 바로 빈 장면을 만들어 써도 돼요.
              </p>
              <div>
                <button
                  className="ghost-button"
                  onClick={() => setWorkspaceMode("plan")}
                >
                  구상부터 하기
                </button>
                <button className="primary-button" onClick={addChapter}>
                  + 첫 챕터 만들기
                </button>
              </div>
            </section>
          )}
        </section>
      )}

      {hasUnappliedChanges && (
        <div className="creator-apply-dock">
          <div>
            <span className="status-dot" />
            <div>
              <strong>플레이에 아직 적용하지 않은 수정이 있어요.</strong>
              <small>편집 내용과 창작 메모는 기기에 자동 저장됐어요.</small>
            </div>
          </div>
          <button onClick={applyDraft}>플레이에 적용</button>
        </div>
      )}

      <footer className="creator-footer">
        <span>기본 제공 이미지 © 놀퀴즈</span>
        <span>토끼와 자라·옹고집전 이미지는 학생 작품 제작에 사용 가능</span>
      </footer>

      {blankConfirmOpen && (
        <div className="blank-confirm-overlay" role="presentation">
          <section
            className="blank-confirm-dialog"
            role="dialog"
            aria-modal="true"
            aria-label="빈 작품 시작 확인"
          >
            <span className="blank-confirm-mark">새 작품</span>
            <h2>완전히 빈 작품을 시작할까요?</h2>
            <p>현재 편집본은 직전 편집본으로 백업한 뒤 새 작품을 엽니다.</p>
            <div>
              <button
                className="ghost-button"
                onClick={() => setBlankConfirmOpen(false)}
              >
                아니요, 돌아가기
              </button>
              <button className="danger-button" onClick={startBlankProject}>
                빈 작품 열기
              </button>
            </div>
          </section>
        </div>
      )}

      {busy && (
        <div className="update-overlay" role="dialog" aria-modal="true">
          <div className="update-card">
            <span className="update-spinner" aria-hidden="true" />
            <span className="eyebrow">
              {busy === "sheet"
                ? "Google 시트 불러오기"
                : busy === "excel"
                  ? "Excel 작업"
                  : "플레이 적용"}
            </span>
            <h2>{busyStep}</h2>
            <p>완료될 때까지 다른 조작을 잠시 멈춥니다.</p>
            <button
              className="stop-button"
              onClick={() => updateController.current?.abort()}
            >
              업데이트 강제 중지
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
