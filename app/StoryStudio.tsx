"use client";
/* eslint-disable @next/next/no-img-element -- 학생이 고르는 동적 이미지와 투명 WebP를 원본 비율로 표시합니다. */

import { useEffect, useMemo, useRef, useState } from "react";
import { STORY_ASSETS, type StoryAsset } from "./story-assets";
import {
  cloneProject,
  createBlankProject,
  DEFAULT_PROJECT,
  type Chapter,
  type StoryLine,
  type StoryProject,
} from "./story-data";

type StudioTab = "assets" | "chapters" | "dialogue";
type UpdateMode = "sheet" | "draft" | "excel";
type CreatorAccess = "none" | "local";
type AssetView = "all" | "favorites" | "recent";
type CsvRow = Record<string, string>;

const DRAFT_KEY = "storygame:draft:v1";
const ACTIVE_KEY = "storygame:active:v1";
const BACKUP_KEY = "storygame:backup:v1";
const FAVORITES_KEY = "storygame:asset-favorites:v1";
const RECENTS_KEY = "storygame:asset-recents:v1";
const SHEET_ID_PATTERN = /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/;
const ASSET_BY_ID = new Map(STORY_ASSETS.map((asset) => [asset.id, asset]));
const CHARACTER_ASSETS = STORY_ASSETS.filter(
  (asset) => asset.type === "character",
);
const BACKGROUND_ASSETS = STORY_ASSETS.filter(
  (asset) => asset.type === "background",
);

function normalizeAssetName(value: string) {
  return value
    .trim()
    .toLocaleLowerCase("ko")
    .replace(/\.png$/i, "")
    .replace(/[·_\-\s]/g, "");
}

function findAsset(value: string, type: StoryAsset["type"]) {
  if (!value.trim()) return undefined;
  const direct = ASSET_BY_ID.get(value.trim());
  if (direct?.type === type) return direct;
  const normalized = normalizeAssetName(value);
  return STORY_ASSETS.find(
    (asset) =>
      asset.type === type &&
      [asset.displayName, asset.label, asset.id].some(
        (candidate) => normalizeAssetName(candidate) === normalized,
      ),
  );
}

function parseCsv(csv: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < csv.length; index += 1) {
    const char = csv[index];
    const next = csv[index + 1];
    if (char === '"' && quoted && next === '"') {
      cell += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(cell);
      cell = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(cell);
      if (row.some((value) => value.trim())) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }

  row.push(cell);
  if (row.some((value) => value.trim())) rows.push(row);
  if (rows.length === 0) return [];
  const headers = rows[0].map((header) => header.trim());
  return rows.slice(1).map((values) =>
    Object.fromEntries(
      headers.map((header, index) => [header, values[index]?.trim() ?? ""]),
    ),
  );
}

function getValue(row: CsvRow, ...keys: string[]) {
  for (const key of keys) {
    if (row[key] !== undefined) return row[key].trim();
  }
  return "";
}

function isEnabled(row: CsvRow) {
  const value = getValue(row, "사용", "enabled", "활성").toLowerCase();
  return !["false", "no", "아니요", "0", "사용 안 함"].includes(value);
}

function extractSheetId(url: string) {
  return url.match(SHEET_ID_PATTERN)?.[1] ?? "";
}

function sheetCsvUrl(sheetId: string, tabName: string) {
  return `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tabName)}`;
}

async function fetchSheetTab(
  sheetId: string,
  tabName: string,
  signal: AbortSignal,
) {
  const response = await fetch(sheetCsvUrl(sheetId, tabName), {
    signal,
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`‘${tabName}’ 탭을 읽지 못했어요.`);
  }
  return response.text();
}

async function fetchSheetSnapshot(sheetId: string, signal: AbortSignal) {
  const [project, chapters] = await Promise.all(
    ["작품", "챕터"].map((tab) => fetchSheetTab(sheetId, tab, signal)),
  );
  let speakers = "";
  try {
    speakers = await fetchSheetTab(sheetId, "화자", signal);
  } catch {
    // 이전 형식의 시트는 장면 탭에 쓰인 화자 이름으로 목록을 복원합니다.
  }
  let lines = "";
  try {
    lines = await fetchSheetTab(sheetId, "장면", signal);
  } catch {
    lines = await fetchSheetTab(sheetId, "대사", signal);
  }
  return { project, speakers, chapters, lines };
}

function buildProjectFromSheet(
  snapshot: {
    project: string;
    speakers?: string;
    chapters: string;
    lines: string;
  },
  sheetUrl: string,
) {
  const projectRows = parseCsv(snapshot.project);
  const speakerRows = parseCsv(snapshot.speakers ?? "").filter(isEnabled);
  const chapterRows = parseCsv(snapshot.chapters).filter(isEnabled);
  const lineRows = parseCsv(snapshot.lines).filter(isEnabled);
  const problems: string[] = [];
  const projectRow = projectRows[0] ?? {};

  const chapters: Chapter[] = chapterRows
    .filter((row) =>
      getValue(row, "챕터 ID", "chapter_id", "chapter_key", "챕터"),
    )
    .map((row, index) => {
      const id =
        getValue(row, "챕터 ID", "chapter_id", "chapter_key", "챕터") ||
        `chapter-${index + 1}`;
      const backgroundText = getValue(
        row,
        "배경 이미지",
        "background",
        "background_asset",
      );
      const leftText = getValue(
        row,
        "왼쪽 기본 이미지",
        "left_image",
        "left_asset",
      );
      const rightText = getValue(
        row,
        "오른쪽 기본 이미지",
        "right_image",
        "right_asset",
      );
      const background = findAsset(backgroundText, "background");
      const left = findAsset(leftText, "character");
      const right = findAsset(rightText, "character");

      if (backgroundText && !background) {
        problems.push(`${id}: 배경 ‘${backgroundText}’`);
      }
      if (leftText && !left) problems.push(`${id}: 왼쪽 이미지 ‘${leftText}’`);
      if (rightText && !right) {
        problems.push(`${id}: 오른쪽 이미지 ‘${rightText}’`);
      }

      return {
        id,
        order:
          Number(getValue(row, "순서", "order")) || index + 1,
        title:
          getValue(row, "챕터 제목", "title", "제목") ||
          `챕터 ${index + 1}`,
        summary: getValue(row, "한 줄 줄거리", "summary", "줄거리"),
        backgroundId: background?.id ?? "",
        leftAssetId: left?.id ?? "",
        rightAssetId: right?.id ?? "",
      };
    })
    .sort((a, b) => a.order - b.order);

  const chapterIds = new Set(chapters.map((chapter) => chapter.id));
  const lines: StoryLine[] = lineRows
    .filter((row) =>
      getValue(
        row,
        "장면 ID",
        "대사 ID",
        "line_id",
        "line_key",
        "장면",
        "대사",
      ),
    )
    .map((row, index) => {
      const chapterId = getValue(
        row,
        "챕터 ID",
        "chapter_id",
        "chapter_key",
        "챕터",
      );
      const lineId =
        getValue(
          row,
          "장면 ID",
          "대사 ID",
          "line_id",
          "line_key",
          "장면",
          "대사",
        ) || `scene-${index + 1}`;
      const typeText = getValue(row, "종류", "type").toLowerCase();
      const type: StoryLine["type"] =
        typeText === "해설" || typeText === "narration"
          ? "narration"
          : "dialogue";
      const speakerText = getValue(row, "화자 위치", "speaker", "화자");
      const speaker: StoryLine["speaker"] =
        type === "narration"
          ? "narration"
          : speakerText === "오른쪽" || speakerText.toLowerCase() === "right"
            ? "right"
            : "left";
      const leftText = getValue(row, "왼쪽 이미지", "left_image", "left_asset");
      const rightText = getValue(
        row,
        "오른쪽 이미지",
        "right_image",
        "right_asset",
      );
      const backgroundText = getValue(
        row,
        "장면 배경",
        "background",
        "background_override",
      );
      const left = leftText ? findAsset(leftText, "character") : undefined;
      const right = rightText ? findAsset(rightText, "character") : undefined;
      const background = backgroundText
        ? findAsset(backgroundText, "background")
        : undefined;

      if (!chapterIds.has(chapterId)) {
        problems.push(`${lineId}: 없는 챕터 ‘${chapterId}’`);
      }
      if (leftText && !left) problems.push(`${lineId}: 왼쪽 ‘${leftText}’`);
      if (rightText && !right) problems.push(`${lineId}: 오른쪽 ‘${rightText}’`);
      if (backgroundText && !background) {
        problems.push(`${lineId}: 배경 ‘${backgroundText}’`);
      }

      return {
        id: lineId,
        chapterId,
        order: Number(getValue(row, "순서", "order")) || index + 1,
        type,
        speaker,
        speakerName:
          getValue(row, "화자 이름", "speaker_name", "이름") ||
          (type === "narration"
            ? "해설"
            : speaker === "left"
              ? "왼쪽 인물"
              : "오른쪽 인물"),
        text: getValue(row, "내용", "text", "대사 내용"),
        leftAssetId: left?.id ?? "",
        rightAssetId: right?.id ?? "",
        backgroundId: background?.id ?? "",
      };
    })
    .sort((a, b) =>
      a.chapterId === b.chapterId
        ? a.order - b.order
        : chapters.findIndex((chapter) => chapter.id === a.chapterId) -
          chapters.findIndex((chapter) => chapter.id === b.chapterId),
    );

  if (chapters.length === 0) problems.push("사용할 챕터가 없어요.");
  if (problems.length > 0) {
    throw new Error(
      `시트에서 ${problems.length}곳을 확인해 주세요: ${problems
        .slice(0, 3)
        .join(" / ")}${problems.length > 3 ? " 외" : ""}`,
    );
  }

  const speakerNames = Array.from(
    new Set([
      ...speakerRows.map((row) =>
        getValue(row, "화자 이름", "speaker_name", "이름"),
      ),
      ...lines
        .filter((line) => line.type === "dialogue")
        .map((line) => line.speakerName),
    ]),
  ).filter(Boolean);

  return {
    id: extractSheetId(sheetUrl)
      ? `sheet-${extractSheetId(sheetUrl)}`
      : `excel-${Date.now()}`,
    title:
      getValue(projectRow, "작품 제목", "title") || "이름 없는 이야기",
    description:
      getValue(projectRow, "작품 소개", "description") ||
      "불러온 이야기",
    sheetUrl,
    sheetEditable: false,
    speakerNames,
    chapters,
    lines,
    updatedAt: new Intl.DateTimeFormat("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date()),
  } satisfies StoryProject;
}

function AssetSelect({
  value,
  type,
  allowDefault = false,
  onChange,
  onUse,
  label,
}: {
  value: string;
  type: StoryAsset["type"];
  allowDefault?: boolean;
  onChange: (value: string) => void;
  onUse?: (value: string) => void;
  label: string;
}) {
  const assets = type === "character" ? CHARACTER_ASSETS : BACKGROUND_ASSETS;
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewSearch, setPreviewSearch] = useState("");
  const [previewTags, setPreviewTags] = useState<string[]>([]);
  const availableTags = Array.from(
    new Set(assets.flatMap((asset) => asset.tags)),
  ).sort((a, b) => a.localeCompare(b, "ko"));
  const previewAssets = assets.filter((asset) => {
    const search = normalizeAssetName(previewSearch);
    return (
      (!search ||
        [asset.displayName, asset.label, asset.story, ...asset.tags].some(
          (candidate) => normalizeAssetName(candidate).includes(search),
        )) &&
      previewTags.every((tag) => asset.tags.includes(tag))
    );
  });

  return (
    <div className="field asset-select-field">
      <span>{label}</span>
      <div className="asset-select-row">
        <select
          value={value}
          onChange={(event) => {
            onChange(event.target.value);
            if (event.target.value) onUse?.(event.target.value);
          }}
          aria-label={`${label} 이름으로 선택`}
        >
          {allowDefault && <option value="">챕터 기본 이미지</option>}
          {!allowDefault && <option value="">이미지를 고르세요</option>}
          {assets.map((asset) => (
            <option key={asset.id} value={asset.id}>
              {asset.displayName}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="asset-preview-button"
          onClick={() => setPreviewOpen(true)}
        >
          그림으로 고르기
        </button>
      </div>
      {previewOpen && (
        <div
          className="asset-picker-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setPreviewOpen(false);
          }}
        >
          <section
            className="asset-picker-dialog"
            role="dialog"
            aria-modal="true"
            aria-label={`${label} 이미지 미리보기`}
          >
            <header>
              <div>
                <span className="eyebrow">
                  {type === "character" ? "캐릭터 미리보기" : "배경 미리보기"}
                </span>
                <h2>{label}</h2>
              </div>
              <button
                type="button"
                className="asset-picker-close"
                onClick={() => setPreviewOpen(false)}
                aria-label="이미지 미리보기 닫기"
              >
                ×
              </button>
            </header>
            <input
              className="asset-picker-search"
              type="search"
              value={previewSearch}
              onChange={(event) => setPreviewSearch(event.target.value)}
              placeholder="토끼, 분노, 연회장처럼 검색"
              aria-label="미리보기 이미지 검색"
              autoFocus
            />
            <div className="asset-picker-tags" aria-label="이미지 태그">
              {availableTags.map((tag) => (
                <button
                  type="button"
                  key={tag}
                  className={previewTags.includes(tag) ? "active" : ""}
                  onClick={() =>
                    setPreviewTags((current) =>
                      current.includes(tag)
                        ? current.filter((value) => value !== tag)
                        : [...current, tag],
                    )
                  }
                >
                  {tag}
                </button>
              ))}
              {previewTags.length > 0 && (
                <button
                  type="button"
                  className="clear-tags"
                  onClick={() => setPreviewTags([])}
                >
                  태그 모두 지우기
                </button>
              )}
            </div>
            <p className="asset-picker-count">
              태그를 모두 포함한 이미지 {previewAssets.length}개
            </p>
            <div className="asset-picker-grid">
              {allowDefault && (
                <button
                  type="button"
                  className={`asset-picker-option default-option ${value === "" ? "selected" : ""}`}
                  onClick={() => {
                    onChange("");
                    setPreviewOpen(false);
                  }}
                >
                  <span>기본</span>
                  <strong>챕터 기본 이미지</strong>
                  <small>이 장면에서는 챕터 설정을 그대로 사용해요.</small>
                </button>
              )}
              {previewAssets.map((asset) => (
                <button
                  type="button"
                  className={`asset-picker-option ${value === asset.id ? "selected" : ""}`}
                  key={asset.id}
                  onClick={() => {
                    onChange(asset.id);
                    onUse?.(asset.id);
                    setPreviewOpen(false);
                  }}
                >
                  <span className={`asset-picker-thumb ${asset.type}`}>
                    <img
                      src={asset.src}
                      alt=""
                      loading="lazy"
                      draggable={false}
                    />
                  </span>
                  <strong>{asset.displayName}</strong>
                  <small>
                    {asset.story} · {asset.label}
                  </small>
                  <span className="asset-tag-summary">
                    {asset.tags.slice(0, 4).join(" · ")}
                  </span>
                  <em>{value === asset.id ? "선택됨" : "이 이미지 선택"}</em>
                </button>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

function SpeakerNameSelect({
  value,
  names,
  onChange,
  onAdd,
}: {
  value: string;
  names: string[];
  onChange: (value: string) => void;
  onAdd: (value: string) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const options = Array.from(new Set([value, ...names])).filter(Boolean);

  function addName() {
    const nextName = newName.trim();
    if (!nextName) return;
    onAdd(nextName);
    setNewName("");
    setAdding(false);
  }

  return (
    <div className="field speaker-field">
      <span>글상자 화자 이름</span>
      <div className="speaker-select-row">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-label="글상자 화자 이름 선택"
        >
          {options.length === 0 && <option value="">화자를 추가해 주세요</option>}
          {options.map((name) => (
            <option value={name} key={name}>
              {name}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="add-speaker-button"
          onClick={() => setAdding((current) => !current)}
          aria-expanded={adding}
        >
          {adding ? "닫기" : "+ 화자 추가"}
        </button>
      </div>
      {adding && (
        <div className="new-speaker-row">
          <input
            value={newName}
            onChange={(event) => setNewName(event.target.value)}
            placeholder="새 화자 이름"
            aria-label="새 화자 이름"
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                addName();
              }
            }}
            autoFocus
          />
          <button type="button" onClick={addName} disabled={!newName.trim()}>
            목록에 추가
          </button>
        </div>
      )}
      <small>한 번 추가한 이름은 다른 장면에서도 계속 고를 수 있어요.</small>
      <small>고른 이미지의 파일명과는 관계없이 표시됩니다.</small>
    </div>
  );
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

export function StoryStudio() {
  const [draft, setDraft] = useState<StoryProject>(() =>
    cloneProject(DEFAULT_PROJECT),
  );
  const [active, setActive] = useState<StoryProject>(() =>
    cloneProject(DEFAULT_PROJECT),
  );
  const [tab, setTab] = useState<StudioTab>("assets");
  const [view, setView] = useState<"studio" | "play">("studio");
  const [selectedChapterId, setSelectedChapterId] = useState(
    DEFAULT_PROJECT.chapters[0].id,
  );
  const [playIndex, setPlayIndex] = useState(0);
  const [assetType, setAssetType] = useState<StoryAsset["type"]>("character");
  const [assetView, setAssetView] = useState<AssetView>("all");
  const [assetTags, setAssetTags] = useState<string[]>([]);
  const [favoriteAssets, setFavoriteAssets] = useState<string[]>([]);
  const [recentAssets, setRecentAssets] = useState<string[]>([]);
  const [assetSearch, setAssetSearch] = useState("");
  const [dialogueMode, setDialogueMode] = useState<"overview" | "detail">(
    "overview",
  );
  const [notice, setNotice] = useState(
    "예시 이야기가 준비되어 있어요. 이미지를 골라 바꿔 보세요.",
  );
  const [busy, setBusy] = useState<UpdateMode | null>(null);
  const [busyStep, setBusyStep] = useState("");
  const [blankConfirmOpen, setBlankConfirmOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [creatorAccess, setCreatorAccess] = useState<CreatorAccess>("none");
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
        const savedBackup = localStorage.getItem(BACKUP_KEY);
        setBackupFound(Boolean(savedBackup));
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
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
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

  const availableAssetTags = useMemo(
    () =>
      Array.from(
        new Set(
          STORY_ASSETS.filter((asset) => asset.type === assetType).flatMap(
            (asset) => asset.tags,
          ),
        ),
      ).sort((a, b) => a.localeCompare(b, "ko")),
    [assetType],
  );

  const filteredAssets = useMemo(() => {
    const search = normalizeAssetName(assetSearch);
    const matches = STORY_ASSETS.filter((asset) => {
      if (asset.type !== assetType) return false;
      if (
        assetView === "favorites" &&
        !favoriteAssets.includes(asset.id)
      ) {
        return false;
      }
      if (assetView === "recent" && !recentAssets.includes(asset.id)) {
        return false;
      }
      const matchesSearch =
        !search ||
        [asset.displayName, asset.label, asset.story, ...asset.tags].some(
          (value) => normalizeAssetName(value).includes(search),
        );
      return (
        matchesSearch && assetTags.every((tag) => asset.tags.includes(tag))
      );
    });
    if (assetView === "recent") {
      return matches.sort(
        (a, b) => recentAssets.indexOf(a.id) - recentAssets.indexOf(b.id),
      );
    }
    return matches;
  }, [
    assetSearch,
    assetTags,
    assetType,
    assetView,
    favoriteAssets,
    recentAssets,
  ]);

  const playLines = useMemo(
    () =>
      active.chapters
        .slice()
        .sort((a, b) => a.order - b.order)
        .flatMap((chapter) =>
          active.lines
            .filter((line) => line.chapterId === chapter.id)
            .sort((a, b) => a.order - b.order),
        ),
    [active],
  );

  const currentLine = playLines[playIndex] ?? playLines[0];
  const currentChapter = active.chapters.find(
    (chapter) => chapter.id === currentLine?.chapterId,
  );
  const currentBackground =
    currentLine?.backgroundId || currentChapter?.backgroundId || "";
  const currentLeft =
    currentLine?.leftAssetId || currentChapter?.leftAssetId || "";
  const currentRight =
    currentLine?.rightAssetId || currentChapter?.rightAssetId || "";

  function updateChapter(
    chapterId: string,
    changes: Partial<Chapter>,
  ) {
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

  function addSpeakerName(lineId: string, name: string) {
    setDraft((project) => ({
      ...project,
      speakerNames: Array.from(new Set([...project.speakerNames, name])),
      lines: project.lines.map((line) =>
        line.id === lineId ? { ...line, speakerName: name } : line,
      ),
    }));
    setNotice(`화자 ‘${name}’을(를) 목록에 추가했어요.`);
  }

  function addChapter() {
    const order = draft.chapters.length + 1;
    const id = `chapter-${Date.now()}`;
    const chapter: Chapter = {
      id,
      order,
      title: "",
      summary: "",
      backgroundId: "",
      leftAssetId: "",
      rightAssetId: "",
    };
    setDraft((project) => ({ ...project, chapters: [...project.chapters, chapter] }));
    setSelectedChapterId(id);
  }

  function removeChapter(chapterId: string) {
    const sceneCount = draft.lines.filter(
      (line) => line.chapterId === chapterId,
    ).length;
    if (
      !window.confirm(
        sceneCount > 0
          ? `이 챕터와 안에 있는 장면 ${sceneCount}개를 함께 삭제할까요?`
          : "이 챕터를 삭제할까요?",
      )
    ) {
      return;
    }
    const nextChapters = draft.chapters.filter(
      (chapter) => chapter.id !== chapterId,
    );
    setDraft((project) => ({
      ...project,
      chapters: nextChapters,
      lines: project.lines.filter((line) => line.chapterId !== chapterId),
    }));
    setSelectedChapterId(nextChapters[0]?.id ?? "");
    setNotice("챕터를 삭제했어요. 플레이에 반영하기 전까지 현재 플레이는 그대로예요.");
  }

  function addLine() {
    if (!selectedChapter) return;
    const order = selectedChapterLines.length + 1;
    setDraft((project) => {
      const firstSpeaker = project.speakerNames[0] ?? "주인공";
      return {
        ...project,
        speakerNames:
          project.speakerNames.length > 0
            ? project.speakerNames
            : [firstSpeaker],
        lines: [
          ...project.lines,
          {
            id: `line-${Date.now()}`,
            chapterId: selectedChapter.id,
            order,
            type: "dialogue",
            speaker: "left",
            speakerName: firstSpeaker,
            text: "",
            leftAssetId: "",
            rightAssetId: "",
            backgroundId: "",
          },
        ],
      };
    });
  }

  function removeLine(lineId: string) {
    setDraft((project) => ({
      ...project,
      lines: project.lines
        .filter((line) => line.id !== lineId)
        .map((line) => {
          if (line.chapterId !== selectedChapter?.id) return line;
          const remaining = project.lines
            .filter(
              (candidate) =>
                candidate.id !== lineId &&
                candidate.chapterId === selectedChapter?.id,
            )
            .sort((a, b) => a.order - b.order);
          return {
            ...line,
            order:
              remaining.findIndex((candidate) => candidate.id === line.id) + 1,
          };
        }),
    }));
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
      const orders = new Map(
        ordered.map((line, lineIndex) => [line.id, lineIndex + 1]),
      );
      return {
        ...project,
        lines: project.lines.map((line) =>
          orders.has(line.id) ? { ...line, order: orders.get(line.id)! } : line,
        ),
      };
    });
  }

  function duplicateLine(lineId: string) {
    setDraft((project) => {
      const source = project.lines.find((line) => line.id === lineId);
      if (!source) return project;
      const chapterLines = project.lines
        .filter((line) => line.chapterId === source.chapterId)
        .sort((a, b) => a.order - b.order);
      const next: StoryLine[] = [];
      chapterLines.forEach((line) => {
        next.push(line);
        if (line.id === lineId) {
          next.push({
            ...line,
            id: `line-${Date.now()}`,
          });
        }
      });
      const orderById = new Map(
        next.map((line, index) => [line.id, index + 1]),
      );
      return {
        ...project,
        lines: [
          ...project.lines
            .filter((line) => line.chapterId !== source.chapterId),
          ...next.map((line) => ({ ...line, order: orderById.get(line.id)! })),
        ],
      };
    });
    setNotice("장면을 복제했어요.");
  }

  function recordRecentAsset(assetId: string) {
    setRecentAssets((current) => [
      assetId,
      ...current.filter((id) => id !== assetId),
    ].slice(0, 24));
  }

  function toggleFavoriteAsset(assetId: string) {
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
      setNotice("방금 전 편집본으로 복구했어요. 플레이는 아직 바뀌지 않았어요.");
    } catch {
      setNotice("직전 편집본을 읽지 못했어요. 저장해 둔 Excel을 열어 주세요.");
    }
  }

  async function applyDraft() {
    const controller = new AbortController();
    updateController.current = controller;
    setBusy("draft");
    try {
      setBusyStep("변경 내용 확인 중");
      await new Promise<void>((resolve, reject) => {
        const timer = window.setTimeout(resolve, 350);
        controller.signal.addEventListener("abort", () => {
          window.clearTimeout(timer);
          reject(new DOMException("Aborted", "AbortError"));
        });
      });
      if (!draft.title.trim()) {
        throw new Error("플레이에 반영하기 전에 작품 제목을 써 주세요.");
      }
      if (draft.chapters.length === 0) {
        throw new Error("플레이에 반영하기 전에 챕터를 하나 만들어 주세요.");
      }
      if (draft.lines.length === 0) {
        throw new Error("플레이에 반영하기 전에 장면을 하나 만들어 주세요.");
      }
      const emptyLine = draft.lines.find((line) => !line.text.trim());
      if (emptyLine) {
        const chapter = draft.chapters.find(
          (candidate) => candidate.id === emptyLine.chapterId,
        );
        throw new Error(
          `${chapter?.title || "챕터"}의 빈 장면에 글을 써 주세요.`,
        );
      }
      const unnamedLine = draft.lines.find(
        (line) => line.type === "dialogue" && !line.speakerName.trim(),
      );
      if (unnamedLine) {
        const chapter = draft.chapters.find(
          (candidate) => candidate.id === unnamedLine.chapterId,
        );
        throw new Error(
          `${chapter?.title || "챕터"}의 대사 장면에 화자 이름을 골라 주세요.`,
        );
      }
      backupDraft();
      setBusyStep("플레이 버전 바꾸는 중");
      const updated = {
        ...cloneProject(draft),
        updatedAt: new Intl.DateTimeFormat("ko-KR", {
          hour: "2-digit",
          minute: "2-digit",
        }).format(new Date()),
      };
      setActive(updated);
      localStorage.setItem(ACTIVE_KEY, JSON.stringify(updated));
      setNotice(
        `플레이 업데이트 완료 · 챕터 ${updated.chapters.length}개 · 장면 ${updated.lines.length}개`,
      );
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        setNotice("업데이트를 중지했어요. 직전 플레이는 그대로예요.");
      } else {
        setNotice(
          error instanceof Error
            ? error.message
            : "플레이에 반영하지 못했어요. 입력 내용을 확인해 주세요.",
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
      setNotice("구글 시트의 공유 주소를 확인해 주세요.");
      return;
    }
    const controller = new AbortController();
    updateController.current = controller;
    setBusy("sheet");
    try {
      setBusyStep("공개 구글 시트를 한 번 읽는 중");
      const snapshot = await fetchSheetSnapshot(sheetId, controller.signal);
      setBusyStep("캐릭터·표정·배경 연결 확인 중");
      const imported = buildProjectFromSheet(snapshot, draft.sheetUrl);
      backupDraft();
      setBusyStep("웹 편집본으로 가져오는 중");
      setDraft(imported);
      localStorage.setItem(DRAFT_KEY, JSON.stringify(imported));
      setSelectedChapterId(imported.chapters[0]?.id ?? "");
      setNotice(
        `시트에서 편집본을 불러왔어요 · 챕터 ${imported.chapters.length}개 · 장면 ${imported.lines.length}개 · 확인 후 플레이에 반영하세요.`,
      );
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        setNotice("업데이트를 중지했어요. 직전 플레이는 그대로예요.");
      } else {
        setNotice(
          error instanceof Error
            ? error.message
            : "시트를 읽지 못했어요. 공유 권한을 확인해 주세요.",
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
      const message = "파일이 15MB보다 커요. 이미지를 넣지 않은 작품 파일인지 확인해 주세요.";
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
      setBusyStep("챕터·장면·이미지 연결 확인 중");
      const imported = buildProjectFromSheet(snapshot, "");
      backupDraft();
      setDraft(imported);
      localStorage.setItem(DRAFT_KEY, JSON.stringify(imported));
      setSelectedChapterId(imported.chapters[0]?.id ?? "");
      setCreatorAccess("local");
      setView("studio");
      setEntryNotice("");
      setNotice(
        `‘${file.name}’을 편집본으로 열었어요. 확인 후 플레이에 반영하세요.`,
      );
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        setNotice("Excel 열기를 중지했어요. 이전 편집과 플레이는 그대로예요.");
      } else {
        const message =
          error instanceof Error
            ? error.message
            : "Excel 파일을 읽지 못했어요. 공식 템플릿인지 확인해 주세요.";
        if (creatorAccess === "none") setEntryNotice(message);
        else setNotice(message);
      }
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
      setBusyStep("Excel 작품 파일 만드는 중");
      const { downloadStoryWorkbook } = await import("./story-workbook");
      await downloadStoryWorkbook(draft, STORY_ASSETS);
      if (controller.signal.aborted) {
        throw new DOMException("Aborted", "AbortError");
      }
      setNotice("현재 웹 편집본을 Excel로 저장했어요.");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        setNotice("Excel 저장을 중지했어요. 편집본은 그대로예요.");
      } else {
        setNotice(
          error instanceof Error
            ? error.message
            : "Excel 파일을 만들지 못했어요.",
        );
      }
    } finally {
      updateController.current = null;
      setBusy(null);
      setBusyStep("");
    }
  }

  function stopUpdate() {
    updateController.current?.abort();
  }

  function requestBlankProject() {
    const hasContent =
      Boolean(draft.title.trim()) ||
      draft.chapters.length > 0 ||
      draft.lines.length > 0;
    if (hasContent) {
      setBlankConfirmOpen(true);
      return;
    }
    startBlankProject();
  }

  function startBlankProject() {
    const blank = createBlankProject();
    backupDraft();
    setDraft(blank);
    localStorage.setItem(DRAFT_KEY, JSON.stringify(blank));
    setSelectedChapterId("");
    setTab("chapters");
    setCreatorAccess("local");
    setView("studio");
    setBlankConfirmOpen(false);
    setNotice("완전히 빈 작품을 열었어요. 작품 제목과 첫 챕터부터 정해 보세요.");
  }

  async function copyAssetName(asset: StoryAsset) {
    try {
      await navigator.clipboard.writeText(asset.displayName);
      setNotice(`‘${asset.displayName}’ 이름을 복사했어요.`);
    } catch {
      setNotice(`시트에서 사용할 이름: ${asset.displayName}`);
    }
  }

  function openPlay(startIndex = 0) {
    setPlayIndex(Math.max(0, Math.min(startIndex, playLines.length - 1)));
    setView("play");
  }

  function playChapter(chapterId: string) {
    const index = playLines.findIndex((line) => line.chapterId === chapterId);
    openPlay(index >= 0 ? index : 0);
  }

  function previewWithoutLogin() {
    setActive(cloneProject(DEFAULT_PROJECT));
    setPlayIndex(0);
    setView("play");
  }

  function continueLocalDraft() {
    setCreatorAccess("local");
    setView("studio");
    setNotice("이 기기의 저장된 편집본을 이어서 엽니다.");
  }

  if (view === "play") {
    return (
      <main className="player-shell">
        <div
          className="story-stage"
          style={
            currentBackground
              ? {
                  backgroundImage: `linear-gradient(180deg, rgba(8, 17, 28, 0.05), rgba(8, 17, 28, 0.48)), url("${ASSET_BY_ID.get(currentBackground)?.src}")`,
                }
              : undefined
          }
        >
          <header className="player-topbar">
            <div>
              <span className="eyebrow">이야기별 플레이</span>
              <strong>{active.title}</strong>
            </div>
            <div className="player-top-actions">
              <label className="chapter-jump">
                <span className="sr-only">챕터 골라 시작</span>
                <select
                  value={currentChapter?.id ?? ""}
                  onChange={(event) => playChapter(event.target.value)}
                >
                  {active.chapters
                    .slice()
                    .sort((a, b) => a.order - b.order)
                    .map((chapter) => (
                      <option key={chapter.id} value={chapter.id}>
                        {chapter.order}. {chapter.title}
                      </option>
                    ))}
                </select>
              </label>
              <button className="ghost-button light" onClick={() => setView("studio")}>
                편집으로
              </button>
            </div>
          </header>

          <section className="character-layer" aria-label="이야기 장면">
            <AssetPreview
              assetId={currentLeft}
              alt={ASSET_BY_ID.get(currentLeft)?.displayName ?? "왼쪽 캐릭터"}
              className={`stage-character left ${currentLine?.speaker === "right" ? "listener" : ""}`}
            />
            <AssetPreview
              assetId={currentRight}
              alt={ASSET_BY_ID.get(currentRight)?.displayName ?? "오른쪽 캐릭터"}
              className={`stage-character right ${currentLine?.speaker === "left" ? "listener" : ""}`}
            />
          </section>

          <section
            className={`dialogue-box ${currentLine?.type === "narration" ? "narration" : ""}`}
            aria-live="polite"
          >
            <div className="dialogue-meta">
              <span>
                {currentChapter?.order}. {currentChapter?.title}
              </span>
              <span>
                {playIndex + 1} / {playLines.length}
              </span>
            </div>
            <strong className={`speaker-name ${currentLine?.speaker ?? ""}`}>
              {currentLine?.speakerName ?? "이야기"}
            </strong>
            <p>{currentLine?.text ?? "이 챕터에는 대사가 아직 없어요."}</p>
            <div className="player-controls">
              <button
                className="ghost-button"
                disabled={playIndex === 0}
                onClick={() => setPlayIndex((index) => Math.max(0, index - 1))}
              >
                이전
              </button>
              <button
                className="primary-button"
                disabled={playIndex >= playLines.length - 1}
                onClick={() =>
                  setPlayIndex((index) =>
                    Math.min(playLines.length - 1, index + 1),
                  )
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

  if (creatorAccess === "none") {
    return (
      <main className="entry-shell">
        <section className="entry-card" aria-labelledby="entry-title">
          <div className="entry-brand">
            <span className="brand-mark large">이야기별</span>
            <span>STORYGAME STUDIO</span>
          </div>
          <div className="entry-copy">
            <span className="eyebrow">학생이 직접 만드는 이야기</span>
            <h1 id="entry-title">
              원하는 방법으로 시작하고,
              <br />
              내 이야기를 만드세요
            </h1>
            <p>
              회원가입 없이 이 기기에서 만들고, 필요할 때 Excel이나 공개
              Google 시트의 내용을 가져올 수 있어요.
            </p>
          </div>

          <div className="entry-source-grid" aria-label="작품 시작 방법">
            <button
              className="entry-source-button primary-source"
              onClick={startBlankProject}
            >
              <span aria-hidden="true">✦</span>
              <strong>웹에서 새 작품</strong>
              <small>완전히 빈 이야기부터 만들어요.</small>
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
                setView("studio");
                setNotice(
                  "자료 가져오기에서 공개 Google 시트 주소를 넣고 불러오세요.",
                );
              }}
            >
              <span aria-hidden="true">G</span>
              <strong>Google 시트 불러오기</strong>
              <small>공개 또는 웹에 게시한 시트를 읽어요.</small>
            </button>
          </div>

          <input
            ref={excelInputRef}
            hidden
            type="file"
            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            onChange={(event) => openExcelFile(event.target.files?.[0])}
          />

          <div className="entry-actions">
            {hydrated && localDraftFound && (
              <button className="entry-recovery-button" onClick={continueLocalDraft}>
                이 기기의 저장된 작업 이어하기
              </button>
            )}
            <button className="entry-preview-button" onClick={previewWithoutLogin}>
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
              <span className="eyebrow">Excel 작업</span>
              <h2>{busyStep}</h2>
              <p>완료될 때까지 다른 조작을 잠시 멈춥니다.</p>
              <button className="stop-button" onClick={stopUpdate}>
                업데이트 강제 중지
              </button>
            </div>
          </div>
        )}
      </main>
    );
  }

  return (
    <main className="studio-shell">
      <header className="studio-header">
        <div className="brand-lockup">
          <span className="brand-mark">이야기별</span>
          <div>
            <strong>스토리게임 스튜디오</strong>
            <p>고른 이미지와 대사가 한 편의 이야기가 됩니다.</p>
          </div>
        </div>
        <div className="header-actions">
          <span className="save-state">이 기기에 자동 저장</span>
          {backupFound && (
            <button className="google-reconnect-button" onClick={restoreBackup}>
              방금 전으로 복구
            </button>
          )}
          <button className="new-story-button" onClick={requestBlankProject}>
            빈 작품 시작
          </button>
          <button
            className="play-button"
            onClick={() => openPlay(0)}
            disabled={active.lines.length === 0}
          >
            처음부터 플레이
          </button>
        </div>
      </header>

      <section className="project-banner">
        <div>
          <span className="eyebrow">지금 만드는 작품</span>
          <label className="project-title-field">
            <span>작품 제목 · 직접 정하기</span>
            <input
              className="project-title-input"
              value={draft.title}
              placeholder="우리 이야기의 제목"
              onChange={(event) =>
                setDraft((project) => ({
                  ...project,
                  title: event.target.value,
                }))
              }
              aria-label="작품 제목 직접 정하기"
            />
          </label>
          <label className="project-description-field">
            <span>작품 소개</span>
            <input
              value={draft.description}
              placeholder="이 이야기를 한 문장으로 소개해 보세요."
              onChange={(event) =>
                setDraft((project) => ({
                  ...project,
                  description: event.target.value,
                }))
              }
            />
          </label>
        </div>
        <div className="project-stats">
          <span>챕터 {draft.chapters.length}</span>
          <span>장면 {draft.lines.length}</span>
          <span>이미지 {STORY_ASSETS.length}</span>
        </div>
      </section>

      <section className="sheet-panel" aria-label="자료 가져오기와 내보내기">
        <div className="sheet-copy">
          <span className="step-number">1</span>
          <div>
            <strong>자료 가져오기 · 내보내기</strong>
            <p>
              웹 편집은 기기에 자동 저장됩니다. Excel과 공개 Google 시트는
              버튼을 눌렀을 때만 서로 내용을 주고받아요.
            </p>
          </div>
        </div>
        <div className="sheet-actions">
          <div className="file-action-row">
            <button
              className="auto-sheet-button"
              onClick={() => excelInputRef.current?.click()}
            >
              Excel 파일 열기
            </button>
            <button className="sheet-update-button" onClick={saveExcelFile}>
              Excel로 저장
            </button>
            <a
              className="template-link"
              href="/templates/이야기별_구글시트_템플릿.xlsx"
              download
            >
              빈 Excel 템플릿
            </a>
          </div>
          <input
            ref={excelInputRef}
            hidden
            type="file"
            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            onChange={(event) => openExcelFile(event.target.files?.[0])}
          />
          <div className="google-import-row">
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
              aria-label="공개 구글 시트 공유 주소"
            />
            <button className="sheet-update-button" onClick={updateFromSheet}>
              시트에서 불러오기
            </button>
            {draft.sheetUrl && (
              <a
                className="template-link"
                href={draft.sheetUrl}
                target="_blank"
                rel="noreferrer"
              >
                시트 열기
              </a>
            )}
          </div>
          <small className="sheet-help">
            공개 또는 웹에 게시한 시트만 불러올 수 있어요. 비공개 시트는
            `.xlsx`로 내려받아 여세요.
          </small>
        </div>
      </section>

      <p className="notice-bar" role="status">
        {notice}
      </p>

      <nav className="studio-tabs" aria-label="이야기 편집 단계">
        {[
          ["assets", "1", "이미지 도감", "이름과 표정 찾기"],
          ["chapters", "2", "챕터·장소", "배경과 기본 인물"],
          ["dialogue", "3", "대사·해설", "대본 전체 보기·장면 편집"],
        ].map(([value, number, title, description]) => (
          <button
            key={value}
            className={tab === value ? "active" : ""}
            onClick={() => setTab(value as StudioTab)}
          >
            <span>{number}</span>
            <div>
              <strong>{title}</strong>
              <small>{description}</small>
            </div>
          </button>
        ))}
      </nav>

      <section className="workspace">
        {tab === "assets" && (
          <div className="asset-workspace">
            <div className="section-heading">
              <div>
                <span className="eyebrow">놀퀴즈 이미지 보관함</span>
                <h1>태그를 더할수록 쉽게 찾아요</h1>
                <p>
                  캐릭터와 배경을 나눠 보고, 여러 한국어 태그를 함께 골라
                  원하는 표정과 장소를 좁혀 보세요.
                </p>
              </div>
              <span className="result-count">{filteredAssets.length}개</span>
            </div>

            <div className="asset-filters">
              <div className="asset-kind-tabs" aria-label="이미지 종류">
                {[
                  ["character", "캐릭터 이미지"],
                  ["background", "배경 이미지"],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    className={assetType === value ? "active" : ""}
                    onClick={() => {
                      setAssetType(value as StoryAsset["type"]);
                      setAssetTags([]);
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <input
                type="search"
                value={assetSearch}
                onChange={(event) => setAssetSearch(event.target.value)}
                placeholder="토끼, 분노, 연회장처럼 검색"
                aria-label="이미지 검색"
              />
              <div className="filter-group" aria-label="저장된 이미지 보기">
                {[
                  ["all", "전체"],
                  ["favorites", `즐겨찾기 ${favoriteAssets.length}`],
                  ["recent", "최근 사용"],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    className={assetView === value ? "active" : ""}
                    onClick={() => setAssetView(value as AssetView)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="tag-filter-panel">
                <div>
                  <strong>태그</strong>
                  <small>여러 개를 고르면 모두 해당하는 이미지만 남아요.</small>
                </div>
                <div className="tag-filter-list" aria-label="이미지 태그">
                  {availableAssetTags.map((tag) => (
                    <button
                      key={tag}
                      className={assetTags.includes(tag) ? "active" : ""}
                      onClick={() =>
                        setAssetTags((current) =>
                          current.includes(tag)
                            ? current.filter((value) => value !== tag)
                            : [...current, tag],
                        )
                      }
                    >
                      {tag}
                    </button>
                  ))}
                  {assetTags.length > 0 && (
                  <button
                    className="clear-tags"
                    onClick={() => setAssetTags([])}
                  >
                    태그 모두 지우기
                  </button>
                  )}
                </div>
              </div>
            </div>

            <div className="asset-grid">
              {filteredAssets.map((asset) => (
                <article className={`asset-card ${asset.type}`} key={asset.id}>
                  <div className="asset-image">
                    <button
                      className={`favorite-button ${favoriteAssets.includes(asset.id) ? "active" : ""}`}
                      onClick={() => toggleFavoriteAsset(asset.id)}
                      aria-label={
                        favoriteAssets.includes(asset.id)
                          ? `${asset.displayName} 즐겨찾기 해제`
                          : `${asset.displayName} 즐겨찾기`
                      }
                    >
                      {favoriteAssets.includes(asset.id) ? "★" : "☆"}
                    </button>
                    <img
                      src={asset.src}
                      alt={asset.label}
                      loading="lazy"
                      draggable={false}
                    />
                    <span>{asset.story}</span>
                  </div>
                  <div className="asset-card-body">
                    <small>{asset.type === "character" ? "캐릭터" : "배경"}</small>
                    <strong>{asset.displayName}</strong>
                    <p>{asset.label}</p>
                    <div className="asset-card-tags">
                      {asset.tags.slice(0, 5).map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </div>
                    <button onClick={() => copyAssetName(asset)}>
                      이미지 이름 복사
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {tab === "chapters" && selectedChapter && (
          <div className="editor-layout">
            <aside className="chapter-list">
              <div className="aside-title">
                <div>
                  <span className="eyebrow">이야기 순서</span>
                  <strong>챕터</strong>
                </div>
                <button onClick={addChapter} aria-label="새 챕터 추가">
                  +
                </button>
              </div>
              {draft.chapters
                .slice()
                .sort((a, b) => a.order - b.order)
                .map((chapter) => (
                  <button
                    key={chapter.id}
                    className={chapter.id === selectedChapter.id ? "active" : ""}
                    onClick={() => setSelectedChapterId(chapter.id)}
                  >
                    <span>{chapter.order}</span>
                    <div>
                      <strong>{chapter.title}</strong>
                      <small>{chapter.summary}</small>
                    </div>
                  </button>
                ))}
            </aside>

            <div className="editor-panel">
              <div className="section-heading compact">
                <div>
                  <span className="eyebrow">챕터 {selectedChapter.order}</span>
                  <h1>장소와 기본 인물</h1>
                </div>
                <button
                  className="danger-link"
                  onClick={() => removeChapter(selectedChapter.id)}
                >
                  챕터 삭제
                </button>
              </div>
              <div className="chapter-form">
                <label className="field wide">
                  <span>챕터 제목 · 직접 정하기</span>
                  <input
                    value={selectedChapter.title}
                    placeholder={`챕터 ${selectedChapter.order} 제목`}
                    onChange={(event) =>
                      updateChapter(selectedChapter.id, {
                        title: event.target.value,
                      })
                    }
                  />
                </label>
                <label className="field wide">
                  <span>한 줄 줄거리</span>
                  <input
                    value={selectedChapter.summary}
                    onChange={(event) =>
                      updateChapter(selectedChapter.id, {
                        summary: event.target.value,
                      })
                    }
                  />
                </label>
                <AssetSelect
                  value={selectedChapter.backgroundId}
                  type="background"
                  label="챕터 기본 배경"
                  onUse={recordRecentAsset}
                  onChange={(backgroundId) =>
                    updateChapter(selectedChapter.id, { backgroundId })
                  }
                />
                <AssetSelect
                  value={selectedChapter.leftAssetId}
                  type="character"
                  label="왼쪽 기본 이미지"
                  onUse={recordRecentAsset}
                  onChange={(leftAssetId) =>
                    updateChapter(selectedChapter.id, { leftAssetId })
                  }
                />
                <AssetSelect
                  value={selectedChapter.rightAssetId}
                  type="character"
                  label="오른쪽 기본 이미지"
                  onUse={recordRecentAsset}
                  onChange={(rightAssetId) =>
                    updateChapter(selectedChapter.id, { rightAssetId })
                  }
                />
              </div>
              <ScenePreview
                chapter={selectedChapter}
                line={selectedChapterLines[0]}
              />
              <div className="panel-actions">
                <button
                  className="ghost-button"
                  onClick={() => playChapter(selectedChapter.id)}
                >
                  이 챕터부터 보기
                </button>
                <button className="primary-button" onClick={() => setTab("dialogue")}>
                  장면 카드로
                </button>
              </div>
            </div>
          </div>
        )}

        {tab === "chapters" && !selectedChapter && (
          <div className="blank-workspace">
            <span className="blank-icon">1</span>
            <span className="eyebrow">완전히 빈 작품</span>
            <h1>첫 챕터부터 시작하세요</h1>
            <p>
              챕터 제목과 장소를 직접 정한 뒤 장면 카드를 추가할 수 있어요.
            </p>
            <button className="primary-button" onClick={addChapter}>
              + 첫 챕터 만들기
            </button>
          </div>
        )}

        {tab === "dialogue" && selectedChapter && (
          <div className="dialogue-workspace">
            <div className="section-heading">
              <div>
                <span className="eyebrow">챕터 대본 편집</span>
                <h1>{selectedChapter.title}</h1>
                <p>
                  챕터 {selectedChapter.order} · 장면 1부터 차례로 이어집니다.
                  비워 둔 이미지는 챕터 기본값을 사용합니다.
                </p>
              </div>
              <div className="dialogue-view-controls">
                <div className="view-toggle" aria-label="대사 편집 보기">
                  <button
                    className={dialogueMode === "overview" ? "active" : ""}
                    onClick={() => setDialogueMode("overview")}
                  >
                    대본 전체 보기
                  </button>
                  <button
                    className={dialogueMode === "detail" ? "active" : ""}
                    onClick={() => setDialogueMode("detail")}
                  >
                    장면 자세히 편집
                  </button>
                </div>
                <label className="chapter-picker">
                  <span>챕터 선택</span>
                  <select
                    value={selectedChapter.id}
                    onChange={(event) => setSelectedChapterId(event.target.value)}
                  >
                    {draft.chapters
                      .slice()
                      .sort((a, b) => a.order - b.order)
                      .map((chapter) => (
                        <option value={chapter.id} key={chapter.id}>
                          {chapter.order}. {chapter.title}
                        </option>
                      ))}
                  </select>
                </label>
              </div>
            </div>

            {dialogueMode === "overview" ? (
              <div className="script-overview">
                <div className="script-overview-head">
                  <strong>장면</strong>
                  <strong>말하는 사람</strong>
                  <strong>대사·해설</strong>
                  <strong>순서·편집</strong>
                </div>
                {selectedChapterLines.map((line, index) => (
                  <article className="script-row" key={line.id}>
                    <div className="script-scene-number">
                      <strong>{index + 1}</strong>
                      <select
                        value={line.type}
                        aria-label={`장면 ${index + 1} 종류`}
                        onChange={(event) => {
                          const type = event.target.value as StoryLine["type"];
                          updateLine(line.id, {
                            type,
                            speaker: type === "narration" ? "narration" : "left",
                            speakerName:
                              type === "narration"
                                ? "해설"
                                : draft.speakerNames[0] ?? "",
                          });
                        }}
                      >
                        <option value="dialogue">대사</option>
                        <option value="narration">해설</option>
                      </select>
                    </div>
                    <div className="script-speaker">
                      {line.type === "dialogue" ? (
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
                            {Array.from(
                              new Set([line.speakerName, ...draft.speakerNames]),
                            )
                              .filter(Boolean)
                              .map((name) => (
                                <option key={name} value={name}>
                                  {name}
                                </option>
                              ))}
                          </select>
                        </>
                      ) : (
                        <span className="narration-label">해설</span>
                      )}
                    </div>
                    <div className="script-text">
                      <textarea
                        rows={2}
                        value={line.text}
                        aria-label={`장면 ${index + 1} 내용`}
                        onChange={(event) =>
                          updateLine(line.id, { text: event.target.value })
                        }
                      />
                      <small>
                        왼쪽{" "}
                        {ASSET_BY_ID.get(
                          line.leftAssetId || selectedChapter.leftAssetId,
                        )?.displayName || "없음"}
                        {" · "}오른쪽{" "}
                        {ASSET_BY_ID.get(
                          line.rightAssetId || selectedChapter.rightAssetId,
                        )?.displayName || "없음"}
                        {" · "}배경{" "}
                        {ASSET_BY_ID.get(
                          line.backgroundId || selectedChapter.backgroundId,
                        )?.displayName || "없음"}
                      </small>
                    </div>
                    <div className="script-row-actions">
                      <button
                        onClick={() => moveLine(line.id, -1)}
                        disabled={index === 0}
                        aria-label={`장면 ${index + 1} 위로 이동`}
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => moveLine(line.id, 1)}
                        disabled={index === selectedChapterLines.length - 1}
                        aria-label={`장면 ${index + 1} 아래로 이동`}
                      >
                        ↓
                      </button>
                      <button onClick={() => duplicateLine(line.id)}>복제</button>
                      <button onClick={() => setDialogueMode("detail")}>
                        자세히
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
                  <div className="empty-state">
                    <strong>아직 장면이 없어요.</strong>
                    <p>첫 장면을 추가하면 이곳에서 전체 흐름을 볼 수 있어요.</p>
                  </div>
                )}
              </div>
            ) : (
            <div className="line-list">
              {selectedChapterLines.map((line, index) => (
                <article className="line-card" key={line.id}>
                  <div className="line-card-number">{index + 1}</div>
                  <div className="line-card-content">
                    <strong className="scene-card-title">
                      챕터 {selectedChapter.order} · 장면 {index + 1}
                    </strong>
                    <div className="line-top-fields">
                      <label className="field">
                        <span>종류</span>
                        <select
                          value={line.type}
                          onChange={(event) => {
                            const type = event.target.value as StoryLine["type"];
                            updateLine(line.id, {
                              type,
                              speaker:
                                type === "narration" ? "narration" : "left",
                              speakerName:
                                type === "narration"
                                  ? "해설"
                                  : line.type === "narration"
                                    ? draft.speakerNames[0] ?? ""
                                    : line.speakerName,
                            });
                          }}
                        >
                          <option value="dialogue">대사</option>
                          <option value="narration">해설</option>
                        </select>
                      </label>
                      {line.type === "dialogue" && (
                        <>
                          <label className="field">
                            <span>화자 위치</span>
                            <select
                              value={line.speaker}
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
                          </label>
                          <SpeakerNameSelect
                            value={line.speakerName}
                            names={draft.speakerNames}
                            onChange={(speakerName) =>
                              updateLine(line.id, { speakerName })
                            }
                            onAdd={(speakerName) =>
                              addSpeakerName(line.id, speakerName)
                            }
                          />
                        </>
                      )}
                    </div>
                    <label className="field wide">
                      <span>{line.type === "narration" ? "해설" : "대사"}</span>
                      <textarea
                        value={line.text}
                        rows={3}
                        onChange={(event) =>
                          updateLine(line.id, { text: event.target.value })
                        }
                      />
                    </label>
                    <div className="line-image-fields">
                      <AssetSelect
                        value={line.leftAssetId}
                        type="character"
                        allowDefault
                        label="왼쪽 표정·동작"
                        onUse={recordRecentAsset}
                        onChange={(leftAssetId) =>
                          updateLine(line.id, { leftAssetId })
                        }
                      />
                      <AssetSelect
                        value={line.rightAssetId}
                        type="character"
                        allowDefault
                        label="오른쪽 표정·동작"
                        onUse={recordRecentAsset}
                        onChange={(rightAssetId) =>
                          updateLine(line.id, { rightAssetId })
                        }
                      />
                      <AssetSelect
                        value={line.backgroundId}
                        type="background"
                        allowDefault
                        label="이 장면 배경"
                        onUse={recordRecentAsset}
                        onChange={(backgroundId) =>
                          updateLine(line.id, { backgroundId })
                        }
                      />
                    </div>
                  </div>
                  <div className="line-card-preview">
                    <ScenePreview chapter={selectedChapter} line={line} small />
                    <button
                      className="danger-link"
                      onClick={() => removeLine(line.id)}
                    >
                      이 카드 삭제
                    </button>
                  </div>
                </article>
              ))}
              {selectedChapterLines.length === 0 && (
                <div className="empty-state">
                  <strong>아직 장면 카드가 없어요.</strong>
                  <p>첫 이야기 카드를 추가해 보세요.</p>
                </div>
              )}
            </div>
            )}

            <button className="add-line-button" onClick={addLine}>
              + 새 장면 추가
            </button>
          </div>
        )}

        {tab === "dialogue" && !selectedChapter && (
          <div className="blank-workspace">
            <span className="eyebrow">장면을 만들기 전</span>
            <h1>먼저 챕터가 필요해요</h1>
            <p>장면 카드는 챕터 안에 차례로 들어갑니다.</p>
            <button
              className="primary-button"
              onClick={() => setTab("chapters")}
            >
              챕터 만들러 가기
            </button>
          </div>
        )}
      </section>

      <div className="update-dock">
        <div>
          <span className="status-dot" />
          <div>
            <strong>현재 기기 편집본</strong>
            <small>마지막 플레이 업데이트 {active.updatedAt}</small>
          </div>
        </div>
        <button className="primary-button" onClick={applyDraft}>
          현재 편집을 플레이에 반영
        </button>
      </div>

      <footer className="studio-footer">
        <span>기본 제공 이미지 © 놀퀴즈</span>
        <span>토끼와 자라·옹고집전 이미지는 이 스토리게임에서 자유롭게 사용</span>
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
            <p>
              지금 편집 중인 내용 대신 제목·화자·챕터·장면이 모두 빈 작품을
              엽니다.
            </p>
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
                  : "플레이 업데이트"}
            </span>
            <h2>{busyStep}</h2>
            <p>완료될 때까지 다른 조작을 잠시 멈춥니다.</p>
            <button className="stop-button" onClick={stopUpdate}>
              업데이트 강제 중지
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

function ScenePreview({
  chapter,
  line,
  small = false,
}: {
  chapter: Chapter;
  line?: StoryLine;
  small?: boolean;
}) {
  const backgroundId = line?.backgroundId || chapter.backgroundId;
  const leftAssetId = line?.leftAssetId || chapter.leftAssetId;
  const rightAssetId = line?.rightAssetId || chapter.rightAssetId;
  const backgroundSrc = ASSET_BY_ID.get(backgroundId)?.src;
  return (
    <div
      className={`scene-preview ${small ? "small" : ""}`}
      style={
        backgroundSrc
          ? {
              backgroundImage: `linear-gradient(180deg, transparent, rgba(9, 20, 29, 0.42)), url("${backgroundSrc}")`,
            }
          : undefined
      }
    >
      <AssetPreview
        assetId={leftAssetId}
        alt={ASSET_BY_ID.get(leftAssetId)?.displayName ?? "왼쪽 캐릭터"}
        className="preview-character left"
      />
      <AssetPreview
        assetId={rightAssetId}
        alt={ASSET_BY_ID.get(rightAssetId)?.displayName ?? "오른쪽 캐릭터"}
        className="preview-character right"
      />
      <div className="preview-dialogue">
        <strong>{line?.speakerName || "장면 미리보기"}</strong>
        <span>{line?.text || chapter.summary}</span>
      </div>
    </div>
  );
}
