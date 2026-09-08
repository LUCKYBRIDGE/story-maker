"use client";

import type { MutableRefObject } from "react";
import type { Chapter, StoryLine, StoryProject } from "../story-data";
import type {
  StoryRevisionResponse,
  StoryRevisionResponses,
} from "../story-revision-cycle";
import type { StoryApplyIssue } from "../story-apply-issues";
import {
  canonicalizeStoryStageKeys,
  formatStoryStageLabels,
} from "../story-stages";
import { assetName } from "./ResourceWidgets";
import { SceneThumbnail, containsParentheses, unique } from "./SceneThumbnail";
import { StoryRevisionCheck } from "./StoryRevisionCheck";
import { StorySceneFrame } from "./StoryStage";
import { DialogueInline, DialogueText } from "./StoryPlayer";
import { resolveStoryStage } from "../story-stage-view";
import { CutLengthGuide } from "./CutLengthGuide";
import { countStoryCharacters, STORY_CUT_CHARACTER_LIMIT } from "../story-cut-length";
import { canMergeStoryLines } from "../story-commands";

export type ImageView = "text" | "small";

export interface ScriptScreenProps {
  draft: StoryProject;
  selectedChapter: Chapter;
  selectedChapterLines: StoryLine[];
  selectedLine: StoryLine | undefined;
  selectedLineIndex: number;
  imageView: ImageView;
  highlightedApplyIssue?: StoryApplyIssue | null;
  revisionResponses: StoryRevisionResponses;
  onChooseRevisionResponse: (promptId: string, response: StoryRevisionResponse) => void;
  onSelectLine: (lineId: string) => void;
  onChangeLineType: (lineId: string, type: StoryLine["type"]) => void;
  onUpdateLine: (lineId: string, patch: Partial<StoryLine>) => void;
  onSplitLine: (lineId: string) => void;
  onOpenStoryEditorScene: (line: StoryLine) => void;
  onMoveLine: (lineId: string, delta: -1 | 1) => void;
  onDuplicateLine: (lineId: string) => void;
  onRemoveLine: (lineId: string) => void;
  onAddLine: (type: StoryLine["type"], insertAfterLineId?: string) => void;
  onMergeLine: (sourceLineId: string, targetLineId: string) => void;
  sceneCardRefs?: MutableRefObject<Map<string, HTMLElement>>;
  speakerNameRefs?: MutableRefObject<Map<string, HTMLSelectElement>>;
  lineBodyRefs?: MutableRefObject<Map<string, HTMLTextAreaElement>>;
}

export function ScriptScreen({
  draft,
  selectedChapter,
  selectedChapterLines,
  selectedLine,
  selectedLineIndex,
  imageView,
  highlightedApplyIssue,
  revisionResponses,
  onChooseRevisionResponse,
  onSelectLine,
  onChangeLineType,
  onUpdateLine,
  onSplitLine,
  onOpenStoryEditorScene,
  onMoveLine,
  onDuplicateLine,
  onRemoveLine,
  onAddLine,
  onMergeLine,
  sceneCardRefs,
  speakerNameRefs,
  lineBodyRefs,
}: ScriptScreenProps) {
  const chapterStageLabel = formatStoryStageLabels(
    canonicalizeStoryStageKeys(selectedChapter.storyStageKeys),
    draft.planning.structureMode,
    `${selectedChapter.order}장`,
  );

  return (
    <div className="chapter-script-editor">
      <div className="script-editor-heading">
        <div>
          <strong>이 장 대본</strong>
          <span>글상자를 눌러 바로 수정할 수 있어요.</span>
        </div>
        <div className="script-heading-meta">
          <span className="script-stage-indicator">{chapterStageLabel}</span>
          <span>
            {selectedLine
              ? `${selectedLineIndex + 1}컷 편집 중`
              : "컷 없음"}
          </span>
        </div>
      </div>
      {selectedLine && (
        <section className="script-selected-stage" aria-label="현재 컷 무대">
          <header>
            <span>
              지금 고치는 곳 · {selectedChapter.order}장 {selectedLineIndex + 1}컷
            </span>
            <button
              type="button"
              onClick={() => onOpenStoryEditorScene(selectedLine)}
            >
              이 컷 꾸미기
            </button>
          </header>
          <StorySceneFrame stage={resolveStoryStage(selectedChapter, selectedLine)} variant="editor" speaker={selectedLine.speaker}>
            <div className="dialogue-box">
              <p>{selectedLine.type === "narration"
                ? <DialogueText text={selectedLine.text || "아래 글상자에 해설을 써 보세요."} />
                : <DialogueInline speakerName={selectedLine.speakerName} text={selectedLine.text || "아래 글상자에 대사를 써 보세요."} />}</p>
            </div>
          </StorySceneFrame>
        </section>
      )}
      <div className="script-scene-list">
        {selectedChapterLines.map((line, index) => {
          const prevLine = index > 0 ? selectedChapterLines[index - 1] : undefined;
          const nextLine =
            index < selectedChapterLines.length - 1
              ? selectedChapterLines[index + 1]
              : undefined;
          const canMergeWithNext = nextLine ? canMergeStoryLines(line, nextLine) : false;
          const canMergeWithPrev = prevLine ? canMergeStoryLines(prevLine, line) : false;
          const canMerge = canMergeWithNext || canMergeWithPrev;

          return (
          <article
            className={`script-scene-card ${line.type} ${
              line.id === selectedLine?.id ? "active" : ""
            }`}
            data-line-id={line.id}
            key={line.id}
            ref={(node) => {
              if (sceneCardRefs?.current) {
                if (node) sceneCardRefs.current.set(line.id, node);
                else sceneCardRefs.current.delete(line.id);
              }
            }}
            onFocus={() => onSelectLine(line.id)}
            onClick={() => onSelectLine(line.id)}
          >
            <div className="scene-order">
              <strong>{index + 1}</strong>
              <span>
                {line.id === selectedLine?.id ? "편집 중" : "컷"}
              </span>
            </div>
            <div className="scene-writing-fields">
              <div className="scene-control-row">
                <div className={`scene-control-box ${line.type}`}>
                  {line.type === "dialogue" ? (
                    <>
                      <div className="scene-control-sub-row">
                        <select
                          className="scene-control-type"
                          value={line.type}
                          aria-label={`${index + 1}컷 종류`}
                          onChange={(event) =>
                            onChangeLineType(
                              line.id,
                              event.target.value as StoryLine["type"],
                            )
                          }
                        >
                          <option value="dialogue">대사</option>
                          <option value="narration">해설</option>
                        </select>
                        <select
                          className="scene-control-position"
                          value={line.speaker}
                          aria-label={`${index + 1}컷 화자 위치`}
                          onChange={(event) =>
                            onUpdateLine(line.id, {
                              speaker: event.target.value as StoryLine["speaker"],
                            })
                          }
                        >
                          <option value="left">왼쪽</option>
                          <option value="right">오른쪽</option>
                        </select>
                      </div>
                      <select
                        ref={(node) => {
                          if (speakerNameRefs?.current) {
                            if (node) {
                              speakerNameRefs.current.set(line.id, node);
                            } else {
                              speakerNameRefs.current.delete(line.id);
                            }
                          }
                        }}
                        className={`scene-control-speaker ${
                          highlightedApplyIssue?.field === "speaker" &&
                          highlightedApplyIssue.lineId === line.id
                            ? "issue-target-highlight"
                            : ""
                        }`}
                        value={line.speakerName}
                        aria-label={`${index + 1}컷 화자 이름`}
                        onChange={(event) =>
                          onUpdateLine(line.id, {
                            speakerName: event.target.value,
                          })
                        }
                      >
                        {unique([
                          line.speakerName,
                          ...draft.speakerNames,
                          ...selectedChapter.chapterSpeakerNames,
                        ]).map((name) => (
                          <option value={name} key={name}>
                            {name}
                          </option>
                        ))}
                      </select>
                      <span className="scene-kind-badge sr-only">대사 · 인물이 말함</span>
                    </>
                  ) : (
                    <>
                      <select
                        className="scene-control-type"
                        value={line.type}
                        aria-label={`${index + 1}컷 종류`}
                        onChange={(event) =>
                          onChangeLineType(
                            line.id,
                            event.target.value as StoryLine["type"],
                          )
                        }
                      >
                        <option value="dialogue">대사</option>
                        <option value="narration">해설</option>
                      </select>
                      <span className="scene-kind-badge narration">
                        해설 · 이야기 설명
                      </span>
                    </>
                  )}
                </div>
                <div className={`script-writing-line ${line.type}`}>
                  <strong className="dialogue-speaker sr-only">
                    {line.speakerName || "화자 없음"}:
                  </strong>
                  <textarea
                    ref={(node) => {
                      if (lineBodyRefs?.current) {
                        if (node) lineBodyRefs.current.set(line.id, node);
                        else lineBodyRefs.current.delete(line.id);
                      }
                    }}
                    className={
                      highlightedApplyIssue?.field === "line-body" &&
                      highlightedApplyIssue.lineId === line.id
                        ? "issue-target-highlight"
                        : undefined
                    }
                    rows={3}
                    value={line.text}
                    placeholder={
                      line.type === "narration"
                        ? "시간·장소·상황을 괄호 없이 들려주세요."
                        : "대사를 쓰고, 속마음·행동은 (괄호 안에) 써 보세요."
                    }
                    onChange={(event) =>
                      onUpdateLine(line.id, {
                        text: event.target.value,
                      })
                    }
                    aria-label={`${index + 1}컷 내용`}
                    aria-describedby={`cut-length-${line.id}`}
                    aria-invalid={countStoryCharacters(line.text) > STORY_CUT_CHARACTER_LIMIT || undefined}
                  />
                </div>
              </div>
              <div className="scene-card-meta-bar">
                <div className="scene-meta-left">
                  <CutLengthGuide id={`cut-length-${line.id}`} text={line.text} onSplit={() => onSplitLine(line.id)} />
                  <small className="scene-asset-summary">
                    왼쪽{" "}
                    {assetName(
                      line.leftAssetId || selectedChapter.leftAssetId,
                    ) || "없음"}
                    {" · "}오른쪽{" "}
                    {assetName(
                      line.rightAssetId || selectedChapter.rightAssetId,
                    ) || "없음"}
                    {" · "}배경{" "}
                    {assetName(
                      line.backgroundId || selectedChapter.backgroundId,
                    ) || "없음"}
                  </small>
                </div>
                <div className="scene-card-actions">
                  <button
                    type="button"
                    className="scene-add-button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onAddLine(line.type, line.id);
                    }}
                    title="이 컷 바로 아래에 새 컷을 추가해요"
                  >
                    + 컷 추가
                  </button>
                  <button
                    type="button"
                    className="scene-merge-button"
                    onClick={(event) => {
                      event.stopPropagation();
                      if (canMergeWithNext && nextLine) {
                        onMergeLine(line.id, nextLine.id);
                      } else if (canMergeWithPrev && prevLine) {
                        onMergeLine(prevLine.id, line.id);
                      }
                    }}
                    disabled={!canMerge}
                    title={
                      canMergeWithNext
                        ? `다음 컷(${index + 2}컷)과 하나로 합치기`
                        : canMergeWithPrev
                          ? `이전 컷(${index}컷)과 하나로 합치기`
                          : "대사·해설 종류와 인물이 같은 앞뒤 컷이 있을 때만 합칠 수 있어요"
                    }
                  >
                    컷 합치기
                  </button>
                  <button
                    type="button"
                    className="scene-focus-button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onOpenStoryEditorScene(line);
                    }}
                  >
                    컷 꾸미기
                  </button>
                  <details className="scene-more-actions">
                    <summary>더보기</summary>
                    <div>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          onAddLine(line.type, line.id);
                        }}
                      >
                        아래에 컷 추가
                      </button>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          if (nextLine) onMergeLine(line.id, nextLine.id);
                        }}
                        disabled={!canMergeWithNext}
                        title={
                          !canMergeWithNext
                            ? "다음 컷과 대사·해설 종류나 인물이 달라요"
                            : "다음 컷과 하나로 합쳐요"
                        }
                      >
                        다음 컷과 합치기
                      </button>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          if (prevLine) onMergeLine(prevLine.id, line.id);
                        }}
                        disabled={!canMergeWithPrev}
                        title={
                          !canMergeWithPrev
                            ? "이전 컷과 대사·해설 종류나 인물이 달라요"
                            : "이전 컷과 하나로 합쳐요"
                        }
                      >
                        이전 컷과 합치기
                      </button>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          onMoveLine(line.id, -1);
                        }}
                        disabled={index === 0}
                      >
                        위로
                      </button>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          onMoveLine(line.id, 1);
                        }}
                        disabled={
                          index === selectedChapterLines.length - 1
                        }
                      >
                        아래로
                      </button>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          onDuplicateLine(line.id);
                        }}
                      >
                        복제
                      </button>
                      <button
                        type="button"
                        className="danger-link"
                        onClick={(event) => {
                          event.stopPropagation();
                          onRemoveLine(line.id);
                        }}
                        disabled={selectedChapterLines.length <= 1}
                      >
                        삭제
                      </button>
                    </div>
                  </details>
                </div>
              </div>
              <small
                className={`scene-writing-help ${
                  line.type === "narration" && containsParentheses(line.text)
                    ? "warning"
                    : ""
                }`}
              >
                {line.type === "narration"
                  ? containsParentheses(line.text)
                    ? "해설에는 괄호를 쓸 수 없어요. 이 내용을 대사 컷으로 옮겨 주세요."
                    : "해설은 괄호 없이 시간·장소·상황을 들려줘요."
                  : "속마음·표정·행동은 학생이 직접 (괄호 안에) 써요."}
              </small>
            </div>
            {imageView === "small" && (
              <SceneThumbnail
                chapter={selectedChapter}
                line={line}
              />
            )}
          </article>
          );
        })}
        {selectedChapterLines.length === 0 && (
          <div className="empty-script">
            <strong>아직 컷이 없어요.</strong>
            <p>
              대사나 해설을 추가하면 빈 글상자에 바로 쓸 수 있어요.
            </p>
          </div>
        )}
      </div>
      <div className="add-scene-row">
        <button type="button" onClick={() => onAddLine("dialogue")}>
          + 대사 컷
        </button>
        <button type="button" onClick={() => onAddLine("narration")}>
          + 해설 컷
        </button>
      </div>
      <StoryRevisionCheck
        project={draft}
        responses={revisionResponses}
        onResponse={(promptId, response) =>
          onChooseRevisionResponse(promptId, response)
        }
        title="대본을 읽고, 고칠 곳을 찾아보세요"
        description="답을 쓰거나 점수를 받는 활동이 아니에요. 한 번 읽고, 필요한 곳만 직접 고쳐 보세요."
      />
    </div>
  );
}
