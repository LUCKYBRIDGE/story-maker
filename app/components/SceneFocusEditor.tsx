"use client";

import { StoryStageCanvas } from "./StoryStage";

import { useState, type MutableRefObject } from "react";
import type { Chapter, StoryLine, StoryProject } from "../story-data";
import { STORY_ASSETS, type StoryAsset } from "../story-assets";
import type { StoryApplyIssue } from "../story-apply-issues";
import { resolveStoryStage } from "../story-stage-view";
import { AssetPickerButton, ASSET_BY_ID } from "./AssetPickerButton";
import {
  containsParentheses,
  unique,
  SceneThumbnail,
  AssetPreview,
} from "./SceneThumbnail";
import { AddSpeaker, assetName } from "./ResourceWidgets";
import { groupStoryAssets, sortStoryAssets } from "../story-asset-picker-utils";
import {
  canonicalizeStoryStageKeys,
  formatStoryStageLabels,
} from "../story-stages";

export interface ImageFieldProps {
  label: string;
  type: StoryAsset["type"];
  value: string;
  currentValue?: string;
  allowedIds: string[];
  allowDefault?: boolean;
  favoriteIds: string[];
  recentIds: string[];
  onChange: (assetId: string) => void;
  onUse: (assetId: string) => void;
  onToggleFavorite: (assetId: string) => void;
}

export function ImageField({
  label,
  type,
  value,
  currentValue,
  allowedIds,
  allowDefault = false,
  favoriteIds,
  recentIds,
  onChange,
  onUse,
  onToggleFavorite,
}: ImageFieldProps) {
  const allowedAssets = allowedIds
    .map((id) => ASSET_BY_ID.get(id))
    .filter(
      (asset): asset is StoryAsset => Boolean(asset && asset.type === type),
    );
  const allowedAssetGroups = groupStoryAssets(allowedAssets, type);
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
            {allowDefault ? "장의 기본 이미지" : "선택 안 함"}
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
          buttonText={value ? "다른 이미지 고르기" : "이미지 고르기"}
          value={value}
          currentValue={currentValue}
          allowDefault={allowDefault}
          defaultLabel="장의 기본으로 되돌리기"
          currentLabel={
            currentValue ? "현재 컷에서 사용 중" : "현재 선택"
          }
          favoriteIds={favoriteIds}
          recentIds={recentIds}
          onToggleFavorite={onToggleFavorite}
          onSelect={(assetId) => {
            if (assetId) onUse(assetId);
            onChange(assetId);
          }}
        />
      </div>
      <small>
        선택 창에는 이 장에서 고른 자료가 우선 표시됩니다.
      </small>
    </label>
  );
}

export interface SceneStagingCopyProps {
  chapters: Chapter[];
  lines: StoryLine[];
  currentLineId: string;
  onCopy: (sourceLineId: string) => void;
}

export function SceneStagingCopy({
  chapters,
  lines,
  currentLineId,
  onCopy,
}: SceneStagingCopyProps) {
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
        <span>무대 배치 가져오기</span>
        <strong>다른 컷의 이미지 배치를 그대로 사용</strong>
        <small>
          대사와 해설은 바꾸지 않고, 배경과 왼쪽·오른쪽 캐릭터만 가져와요.
        </small>
      </div>
      <div className="scene-staging-copy-controls">
        <select
          value={sourceLineId}
          onChange={(event) => setSourceLineId(event.target.value)}
          aria-label="배치를 가져올 컷"
        >
          <option value="">컷을 선택하세요</option>
          {availableChapters.map(({ chapter, lines: chapterLines }) => (
            <optgroup
              label={`${chapter.order}장. ${chapter.title || "이름 없는 장"}`}
              key={chapter.id}
            >
              {chapterLines.map((line) => (
                <option value={line.id} key={line.id}>
                  {line.order}컷 · {line.speakerName || "해설"} ·{" "}
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
              {sourceChapter.order}장. {sourceChapter.title || "이름 없는 장"} ·
              {sourceLine.order}컷
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

type SceneFocusTab = "text" | "left" | "right" | "background";
type SceneAssetSlot = Exclude<SceneFocusTab, "text">;
const SCENE_FOCUS_TABS: ReadonlyArray<readonly [SceneFocusTab, string]> = [
  ["text", "글"],
  ["left", "왼쪽 이미지"],
  ["right", "오른쪽 이미지"],
  ["background", "배경"],
];

function sceneAssetField(slot: SceneAssetSlot) {
  return slot === "left"
    ? "leftAssetId"
    : slot === "right"
      ? "rightAssetId"
      : "backgroundId";
}

function SceneAssetChoicePanel({
  chapter,
  line,
  slot,
  previewAssetId,
  favoriteIds,
  recentIds,
  onPreview,
  onApply,
  onToggleFavorite,
}: {
  chapter: Chapter;
  line: StoryLine;
  slot: SceneAssetSlot;
  previewAssetId: string;
  favoriteIds: string[];
  recentIds: string[];
  onPreview: (assetId: string) => void;
  onApply: () => void;
  onToggleFavorite: (assetId: string) => void;
}) {
  const field = sceneAssetField(slot);
  const type = slot === "background" ? "background" : "character";
  const label =
    slot === "left"
      ? "왼쪽 이미지"
      : slot === "right"
        ? "오른쪽 이미지"
        : "배경";
  const defaultAssetId =
    slot === "left"
      ? chapter.leftAssetId
      : slot === "right"
        ? chapter.rightAssetId
        : chapter.backgroundId;
  const selectedAssetId = line[field];
  const effectiveAssetId = previewAssetId || defaultAssetId;
  const referenceAsset = ASSET_BY_ID.get(effectiveAssetId);
  const allowedIds =
    type === "character"
      ? chapter.characterAssetIds
      : chapter.backgroundAssetIds;
  const allowedAssets = allowedIds
    .map((id) => ASSET_BY_ID.get(id))
    .filter((asset): asset is StoryAsset => asset?.type === type);
  const allowedGroups = groupStoryAssets(
    unique([previewAssetId, ...allowedAssets.map((asset) => asset.id)])
      .map((id) => ASSET_BY_ID.get(id))
      .filter((asset): asset is StoryAsset => asset?.type === type),
    type,
  );
  const nearbyAssets = (() => {
    const typeAssets = STORY_ASSETS.filter((asset) => asset.type === type);
    const story =
      referenceAsset?.story ??
      allowedAssets[0]?.story ??
      typeAssets.find((asset) => asset.selectionTier === "기본 추천")?.story;
    const sorted = sortStoryAssets(typeAssets, type);
    const ids = unique([
      effectiveAssetId,
      ...allowedAssets
        .filter(
          (asset) =>
            !referenceAsset ||
            (asset.story === referenceAsset.story &&
              asset.group === referenceAsset.group),
        )
        .map((asset) => asset.id),
      ...sorted
        .filter(
          (asset) =>
            asset.story === story &&
            asset.group === referenceAsset?.group,
        )
        .map((asset) => asset.id),
      ...allowedAssets.map((asset) => asset.id),
      ...sorted
        .filter(
          (asset) =>
            asset.story === story && asset.selectionTier === "기본 추천",
        )
        .map((asset) => asset.id),
    ]);
    return ids
      .map((id) => ASSET_BY_ID.get(id))
      .filter((asset): asset is StoryAsset => asset?.type === type)
      .slice(0, 6);
  })();
  const changed = previewAssetId !== selectedAssetId;

  return (
    <section
      className="scene-asset-choice"
      role="tabpanel"
      id={`scene-panel-${slot}`}
      aria-labelledby={`scene-tab-${slot}`}
    >
      <header>
        <div>
          <span>{label}</span>
          <strong>
            {referenceAsset
              ? `${referenceAsset.group} · ${referenceAsset.pose}`
              : "현재 보이는 이미지 없음"}
          </strong>
        </div>
        <small aria-live="polite">
          {changed ? "미리보기 중 · 아직 이 컷에 적용되지 않았어요" : "현재 컷 값"}
        </small>
      </header>
      <div className="scene-asset-choice-tools">
        <label>
          <span>이 장에서 고른 이미지</span>
          <select
            value={previewAssetId}
            onChange={(event) => onPreview(event.target.value)}
            aria-label={`${label} 미리보기`}
          >
            <option value="">장의 기본으로</option>
            {allowedGroups.map((group) => (
              <optgroup label={group.label} key={group.label}>
                {group.assets.map((asset) => (
                  <option value={asset.id} key={asset.id}>
                    {asset.displayName}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>
        <AssetPickerButton
          key={`${line.id}:${slot}`}
          type={type}
          label={label}
          buttonText="전체 자료에서 찾기"
          value={previewAssetId}
          currentValue={effectiveAssetId}
          defaultValue={defaultAssetId}
          currentLabel="현재 미리보기"
          allowDefault
          defaultLabel="장의 기본으로"
          applyButtonText="미리보기에서 확인"
          selectionContextKey={`${line.id}:${slot}:${selectedAssetId}`}
          favoriteIds={favoriteIds}
          recentIds={recentIds}
          onToggleFavorite={onToggleFavorite}
          onSelect={onPreview}
        />
      </div>
      <div className={`scene-nearby-assets ${type}`}>
        <strong>
          {type === "character" && referenceAsset
            ? `같은 ${referenceAsset.group}의 표정·동작`
            : "이 장의 가까운 이미지"}
        </strong>
        <div>
          {nearbyAssets.map((asset) => (
            <button
              type="button"
              className={effectiveAssetId === asset.id ? "active" : ""}
              aria-pressed={effectiveAssetId === asset.id}
              onClick={() => onPreview(asset.id)}
              key={asset.id}
            >
              <AssetPreview assetId={asset.id} alt="" />
              <span>{asset.pose || asset.label}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="scene-asset-choice-actions">
        <button type="button" onClick={() => onPreview("")}>
          장의 기본으로
        </button>
        <button
          type="button"
          disabled={!changed}
          onClick={() => onPreview(selectedAssetId)}
        >
          취소
        </button>
        <button
          type="button"
          className="primary-button"
          disabled={!changed}
          onClick={onApply}
        >
          이 컷에 사용
        </button>
      </div>
    </section>
  );
}

export interface SceneFocusEditorProps {
  draft: StoryProject;
  selectedChapter: Chapter;
  selectedChapterLines: StoryLine[];
  selectedLine: StoryLine;
  selectedLineIndex: number;
  selectedStoryLineIndex: number;
  orderedDraftLines: StoryLine[];
  sceneSettingsOpen: boolean;
  onSetSceneSettingsOpen: (open: boolean | ((current: boolean) => boolean)) => void;
  highlightedApplyIssue?: StoryApplyIssue | null;
  favoriteAssets: string[];
  recentAssets: string[];
  onToggleFavorite: (id: string) => void;
  onAddAssetToChapter: (id: string, type: "character" | "background") => void;
  onMoveThroughStory: (delta: -1 | 1) => void;
  onChangeLineType: (lineId: string, type: StoryLine["type"]) => void;
  onUpdateLine: (lineId: string, patch: Partial<StoryLine>) => void;
  onAddSpeaker: (name: string, selectNew?: boolean) => void;
  onCopySceneStaging: (sourceLineId: string) => void;
  onSwitchStoryEditorView: (view: "chapter" | "scene") => void;
  onAddLine: (type: StoryLine["type"], selectNew?: boolean) => void;
  lineBodyRefs?: MutableRefObject<Map<string, HTMLTextAreaElement>>;
  speakerNameRefs?: MutableRefObject<Map<string, HTMLSelectElement>>;
}

export function SceneFocusEditor({
  draft,
  selectedChapter,
  selectedChapterLines,
  selectedLine,
  selectedLineIndex,
  selectedStoryLineIndex,
  orderedDraftLines,
  sceneSettingsOpen,
  onSetSceneSettingsOpen,
  highlightedApplyIssue,
  favoriteAssets,
  recentAssets,
  onToggleFavorite,
  onAddAssetToChapter,
  onMoveThroughStory,
  onChangeLineType,
  onUpdateLine,
  onAddSpeaker,
  onCopySceneStaging,
  onSwitchStoryEditorView,
  onAddLine,
  lineBodyRefs,
  speakerNameRefs,
}: SceneFocusEditorProps) {
  const [activeTab, setActiveTab] = useState<SceneFocusTab>("text");
  const [assetPreview, setAssetPreview] = useState(() => ({
    lineId: selectedLine.id,
    baseLeft: selectedLine.leftAssetId,
    baseRight: selectedLine.rightAssetId,
    baseBackground: selectedLine.backgroundId,
    left: selectedLine.leftAssetId,
    right: selectedLine.rightAssetId,
    background: selectedLine.backgroundId,
  }));
  const previewMatchesCurrentLine =
    assetPreview.lineId === selectedLine.id &&
    assetPreview.baseLeft === selectedLine.leftAssetId &&
    assetPreview.baseRight === selectedLine.rightAssetId &&
    assetPreview.baseBackground === selectedLine.backgroundId;
  const currentAssetPreview =
    previewMatchesCurrentLine
      ? assetPreview
      : {
          lineId: selectedLine.id,
          baseLeft: selectedLine.leftAssetId,
          baseRight: selectedLine.rightAssetId,
          baseBackground: selectedLine.backgroundId,
          left: selectedLine.leftAssetId,
          right: selectedLine.rightAssetId,
          background: selectedLine.backgroundId,
        };
  const previewLine =
    activeTab === "text"
      ? selectedLine
      : {
          ...selectedLine,
          [sceneAssetField(activeTab)]: currentAssetPreview[activeTab],
        };
  const stage = resolveStoryStage(selectedChapter, previewLine);

  function previewAsset(slot: SceneAssetSlot, assetId: string) {
    setAssetPreview((current) => ({
      ...(current.lineId === selectedLine.id &&
      current.baseLeft === selectedLine.leftAssetId &&
      current.baseRight === selectedLine.rightAssetId &&
      current.baseBackground === selectedLine.backgroundId
        ? current
        : {
            lineId: selectedLine.id,
            baseLeft: selectedLine.leftAssetId,
            baseRight: selectedLine.rightAssetId,
            baseBackground: selectedLine.backgroundId,
            left: selectedLine.leftAssetId,
            right: selectedLine.rightAssetId,
            background: selectedLine.backgroundId,
          }),
      [slot]: assetId,
    }));
  }

  function applyPreviewedAsset(slot: SceneAssetSlot) {
    const assetId = currentAssetPreview[slot];
    if (assetId) {
      onAddAssetToChapter(
        assetId,
        slot === "background" ? "background" : "character",
      );
    }
    onUpdateLine(selectedLine.id, { [sceneAssetField(slot)]: assetId });
  }

  return (
    <div className="scene-focus-editor" data-line-id={selectedLine.id}>
      <div className="scene-focus-nav">
        <button
          type="button"
          disabled={selectedStoryLineIndex <= 0}
          onClick={() => onMoveThroughStory(-1)}
        >
          ← 이전 컷
        </button>
        <strong>
          전체 컷 {selectedStoryLineIndex + 1}/
          {orderedDraftLines.length}
          <small>
            {selectedChapter.order}장
            {selectedChapter.storyStageKeys && selectedChapter.storyStageKeys.length > 0
              ? ` (${formatStoryStageLabels(canonicalizeStoryStageKeys(selectedChapter.storyStageKeys), draft.planning.structureMode)})`
              : ""} · 이 장{" "}
            {selectedLineIndex + 1}/{selectedChapterLines.length}
          </small>
        </strong>
        <button
          type="button"
          disabled={selectedStoryLineIndex >= orderedDraftLines.length - 1}
          onClick={() => onMoveThroughStory(1)}
        >
          다음 컷 →
        </button>
      </div>

      <section
        className="editable-stage"
      >
        <StoryStageCanvas stage={stage} variant="editor" />
      </section>

      <div className="scene-focus-tabs" role="tablist" aria-label="현재 컷 편집">
        {SCENE_FOCUS_TABS.map(([tab, label], index) => (
          <button
            type="button"
            role="tab"
            id={`scene-tab-${tab}`}
            aria-controls={`scene-panel-${tab}`}
            aria-selected={activeTab === tab}
            tabIndex={activeTab === tab ? 0 : -1}
            className={activeTab === tab ? "active" : ""}
            onClick={() => setActiveTab(tab)}
            onKeyDown={(event) => {
              const lastIndex = SCENE_FOCUS_TABS.length - 1;
              const nextIndex =
                event.key === "Home"
                  ? 0
                  : event.key === "End"
                    ? lastIndex
                    : event.key === "ArrowLeft"
                      ? (index + lastIndex) % SCENE_FOCUS_TABS.length
                      : event.key === "ArrowRight"
                        ? (index + 1) % SCENE_FOCUS_TABS.length
                        : -1;
              if (nextIndex < 0) return;
              event.preventDefault();
              const nextTab = SCENE_FOCUS_TABS[nextIndex][0];
              setActiveTab(nextTab);
              window.requestAnimationFrame(() =>
                document.getElementById(`scene-tab-${nextTab}`)?.focus(),
              );
            }}
            key={tab}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === "text" ? (
        <label
          className={`editable-stage-dialogue ${
            selectedLine.type === "narration" ? "narration" : ""
          }`}
          role="tabpanel"
          id="scene-panel-text"
          aria-labelledby="scene-tab-text"
        >
          {selectedLine.type === "narration" && (
            <span className="editable-stage-kind">
              <b>해설</b>
              <small>상황과 배경을 들려주는 글</small>
            </span>
          )}
          <div
            className={`editable-stage-writing-line ${selectedLine.type}`}
          >
            {selectedLine.type === "dialogue" && (
              <b className="dialogue-speaker">
                {selectedLine.speakerName || "화자 없음"}:
              </b>
            )}
            <textarea
              ref={(node) => {
                if (lineBodyRefs?.current) {
                  if (node) {
                    lineBodyRefs.current.set(selectedLine.id, node);
                  } else {
                    lineBodyRefs.current.delete(selectedLine.id);
                  }
                }
              }}
              className={
                highlightedApplyIssue?.field === "line-body" &&
                highlightedApplyIssue.lineId === selectedLine.id
                  ? "issue-target-highlight"
                  : undefined
              }
              rows={3}
              value={selectedLine.text}
              onChange={(event) =>
                onUpdateLine(selectedLine.id, {
                  text: event.target.value,
                })
              }
              placeholder={
                selectedLine.type === "narration"
                  ? "시간·장소·상황을 괄호 없이 들려주세요."
                  : "대사를 쓰고, 속마음·행동은 (괄호 안에) 써 보세요."
              }
              aria-label="현재 컷 글상자"
            />
          </div>
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
      ) : (
        <SceneAssetChoicePanel
          chapter={selectedChapter}
          line={selectedLine}
          slot={activeTab}
          previewAssetId={currentAssetPreview[activeTab]}
          favoriteIds={favoriteAssets}
          recentIds={recentAssets}
          onPreview={(assetId) => previewAsset(activeTab, assetId)}
          onApply={() => applyPreviewedAsset(activeTab)}
          onToggleFavorite={onToggleFavorite}
        />
      )}

      <button
        type="button"
        className="mobile-panel-toggle scene-settings-toggle"
        aria-expanded={sceneSettingsOpen}
        onClick={() => onSetSceneSettingsOpen((current) => !current)}
      >
        <span>
          <strong>화자·이미지·컷 설정</strong>
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
            <strong>대사·해설과 컷 설정</strong>
          </div>
          <div className="scene-setting-grid">
            <label className="field">
              <span>종류</span>
              <select
                value={selectedLine.type}
                onChange={(event) =>
                  onChangeLineType(
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
                      onUpdateLine(selectedLine.id, {
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
                    ref={(node) => {
                      if (speakerNameRefs?.current) {
                        if (node) {
                          speakerNameRefs.current.set(selectedLine.id, node);
                        } else {
                          speakerNameRefs.current.delete(selectedLine.id);
                        }
                      }
                    }}
                    className={
                      highlightedApplyIssue?.field === "speaker" &&
                      highlightedApplyIssue.lineId === selectedLine.id
                        ? "issue-target-highlight"
                        : undefined
                    }
                    value={selectedLine.speakerName}
                    onChange={(event) =>
                      onUpdateLine(selectedLine.id, {
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
                <AddSpeaker onAdd={onAddSpeaker} />
              </>
            )}
          </div>
          <SceneStagingCopy
            key={selectedLine.id}
            chapters={draft.chapters}
            lines={draft.lines}
            currentLineId={selectedLine.id}
            onCopy={onCopySceneStaging}
          />
        </section>
      </div>

      <div className="scene-focus-actions">
        <button
          type="button"
          onClick={() => onSwitchStoryEditorView("chapter")}
        >
          이 장 대본으로
        </button>
        <button type="button" onClick={() => onAddLine("dialogue", true)}>
          현재 컷 다음에 + 대사
        </button>
        <button type="button" onClick={() => onAddLine("narration", true)}>
          + 해설
        </button>
      </div>
    </div>
  );
}
