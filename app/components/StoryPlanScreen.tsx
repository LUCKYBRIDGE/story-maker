"use client";

import type { Dispatch, SetStateAction } from "react";
import type {
  Chapter,
  StoryLine,
  StoryProject,
} from "../story-data";
import {
  CREATIVE_MEMO_TEMPLATES,
  creativeMemoDisplayTitle,
  creativeMemoExcerpt,
  creativeMemoKindLabel,
  type CreativeMemo,
  type CreativeMemoKind,
} from "../creative-memos";
import { AddSpeaker, ResourcePool } from "./ResourceWidgets";
import { ASSET_BY_ID, AssetPickerButton } from "./AssetPickerButton";

import {
  STORY_STRUCTURE_OPTIONS,
  chapterArcLabel as computeChapterArcLabel,
  canonicalizeStoryStageKeys,
  formatStoryStageLabels,
  getUnlinkedStagesAndChapters,
  mapStageToStructureLabel,
  type StoryStageKey,
  type StoryArcKey,
  type StoryStructureOption,
  type StoryStructureStep,
} from "../story-stages";

export function chapterArcLabel(
  chapterIndex: number,
  chapterCount: number,
  steps: Array<{ label: string }>,
) {
  return computeChapterArcLabel(chapterIndex, chapterCount, steps);
}

export {
  STORY_STRUCTURE_OPTIONS,
};
export type {
  StoryArcKey,
  StoryStructureOption,
  StoryStructureStep,
  StoryStageKey,
};

// 이야기 구성 기본 옵션 텍스트 정의 보존 (발단 → 전개 → 위기 → 절정 → 결말 / 발단 → 전개 → 위기 → 결말 / 처음 → 중간 → 끝)

export interface StoryPlanScreenProps {
  draft: StoryProject;
  planningView: "story" | "chapters";
  onPlanningViewChange: (view: "story" | "chapters") => void;
  readyStoryItems: number;
  storyChecklist: { label: string; ready: boolean }[];
  selectedStructure: StoryStructureOption;
  onUpdatePlanning: (patch: Partial<StoryProject["planning"]>) => void;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
  creativeMemoCreatorStep: "choice" | "template" | null;
  setCreativeMemoCreatorStep: Dispatch<SetStateAction<"choice" | "template" | null>>;
  orderedCreativeMemos: CreativeMemo[];
  onAddCreativeMemo: (kind: CreativeMemoKind) => void;
  onOpenCreativeMemo: (id: string) => void;
  onDeleteCreativeMemo: (id: string) => void;
  sortedChapters: Chapter[];
  selectedChapter: Chapter | null;
  selectedChapterLines: StoryLine[];
  continuationPoint?: { chapterId: string; lineId: string; label: string } | null;
  onAddChapter: () => void;
  onRemoveChapter: (id: string) => void;
  onMoveChapter: (id: string, direction: -1 | 1) => void;
  onUpdateChapter: (id: string, patch: Partial<Chapter>) => void;
  onOpenChapterPlan: (id: string) => void;
  onOpenChapterWriter: (id: string) => void;
  onSwitchToCreate: () => void;
  favoriteAssets: string[];
  recentAssets: string[];
  onToggleFavorite: (id: string) => void;
  onAddAssetToChapter: (id: string, type: "character" | "background") => void;
  onRemoveAssetFromChapter: (id: string, type: "character" | "background") => void;
  onAddSpeaker: (name: string, selectNew: boolean) => void;
}

export function StoryPlanScreen({
  draft,
  readyStoryItems,
  storyChecklist,
  selectedStructure,
  onUpdatePlanning,
  onTitleChange,
  onDescriptionChange,
  creativeMemoCreatorStep,
  setCreativeMemoCreatorStep,
  orderedCreativeMemos,
  onAddCreativeMemo,
  onOpenCreativeMemo,
  onDeleteCreativeMemo,
  sortedChapters,
  selectedChapter,
  selectedChapterLines,
  continuationPoint,
  onAddChapter,
  onRemoveChapter,
  onMoveChapter,
  onUpdateChapter,
  onOpenChapterPlan,
  onOpenChapterWriter,
  onSwitchToCreate,
  favoriteAssets,
  recentAssets,
  onToggleFavorite,
  onAddAssetToChapter,
  onRemoveAssetFromChapter,
  onAddSpeaker,
}: StoryPlanScreenProps) {
  function moveSelectedChapter(direction: -1 | 1, button: HTMLButtonElement) {
    if (!selectedChapter) return;
    onMoveChapter(selectedChapter.id, direction);
    window.requestAnimationFrame(() => {
      // A newly disabled boundary button loses focus in Chrome.
      if (button.disabled) button.parentElement?.focus();
    });
  }

  return (
    <section className="planning-workspace">
      <header className="workspace-heading">
        <div>
          <span className="eyebrow">이야기 구성</span>
          <h1>장의 흐름을 만들어 볼까요?</h1>
          <p>구상은 편집할 때만 보는 메모예요. 자동 저장되지만 플레이 화면에는 나타나지 않아요.</p>
        </div>
        <button
          type="button"
          className="primary-button"
          onClick={onSwitchToCreate}
        >
          바로 이야기 쓰기
        </button>
      </header>
      <details className="plan-project-details">
        <summary>작품 기본·큰 생각·이야기 뼈대</summary>
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
                  onChange={(event) => onTitleChange(event.target.value)}
                  placeholder="이야기의 제목을 지어 보세요."
                />
              </label>
              <label className="field">
                <span>작품 소개</span>
                <textarea
                  rows={2}
                  value={draft.description}
                  onChange={(event) => onDescriptionChange(event.target.value)}
                  placeholder="처음 보는 사람에게 이 이야기를 짧게 소개해 보세요."
                />
              </label>
              <label className="field">
                <span>이야기 소재</span>
                <textarea
                  rows={2}
                  value={draft.planning.material}
                  onChange={(event) =>
                    onUpdatePlanning({ material: event.target.value })
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
                    onUpdatePlanning({ theme: event.target.value })
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
                    onUpdatePlanning({ mood: event.target.value })
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
              정답을 쓰는 칸이 아니에요. 생각이 바뀌면 언제든 다시 고칠 수 있어요.
            </p>
            <div className="story-compass-grid">
              <label className="field compass-field">
                <span>핵심 인물은 누구인가요?</span>
                <textarea
                  rows={2}
                  value={draft.planning.mainCharacter}
                  onChange={(event) =>
                    onUpdatePlanning({ mainCharacter: event.target.value })
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
                    onUpdatePlanning({ mainGoal: event.target.value })
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
                    onUpdatePlanning({ centralProblem: event.target.value })
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
                    onUpdatePlanning({ stakes: event.target.value })
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
                    onUpdatePlanning({ endingChange: event.target.value })
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
                  onUpdatePlanning({ premise: event.target.value })
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
              type="button"
              className="primary-button"
              onClick={() => document.querySelector(".chapter-plan-selector")?.scrollIntoView({ block: "center" })}
            >
              장으로 나누기
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
                    onUpdatePlanning({ structureMode: option.mode })
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
                      onUpdatePlanning({
                        [step.key]: event.target.value,
                      })
                    }
                  />
                </label>
              ))}
            </div>
          </section>

          <details className="planning-card planning-more-card">
            <summary>
              <span>
                <b>인물·배경·추가 메모</b>
                <small>필요할 때만 펼쳐서 자세히 써요.</small>
              </span>
              <strong>열기·접기</strong>
            </summary>
            <div className="planning-more-content">
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
                      onUpdatePlanning({ characterNotes: event.target.value })
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
                      onUpdatePlanning({ worldNotes: event.target.value })
                    }
                    placeholder={"언제, 어디에서 벌어지는 이야기인가요?\n이 세계에서 꼭 지켜야 하는 규칙이나 특별한 장소가 있나요?"}
                  />
                </label>
                <label className="field editor-only-field">
                  <span>아직 정하지 못한 것 · 한 줄에 하나씩</span>
                  <textarea
                    rows={5}
                    value={draft.planning.openQuestions}
                    onChange={(event) =>
                      onUpdatePlanning({ openQuestions: event.target.value })
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
                      onUpdatePlanning({ freeNotes: event.target.value })
                    }
                    placeholder="떠오른 대사, 연출, 장소처럼 잊고 싶지 않은 생각"
                  />
                </label>
              </div>
            </div>
          </details>

          <section className="planning-card creative-memo-library">
            <div className="creative-memo-library-heading">
              <div>
                <span className="eyebrow">필요할 때 꺼내 보는 확장 자료</span>
                <h2>창작 메모</h2>
                <p>
                  기본 이야기 구성은 그대로 두고, 더 자세히 생각하고 싶은
                  인물·관계·장소·사건이나 자유로운 생각을 따로 남겨요.
                </p>
              </div>
              <button
                className="primary-button"
                type="button"
                onClick={() =>
                  setCreativeMemoCreatorStep((current) =>
                    current ? null : "choice",
                  )
                }
              >
                + 창작 메모
              </button>
            </div>

            {creativeMemoCreatorStep === "choice" && (
              <section className="creative-memo-creator" aria-live="polite">
                <header>
                  <div>
                    <span>새 메모</span>
                    <h3>어떤 메모를 만들까요?</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCreativeMemoCreatorStep(null)}
                  >
                    취소
                  </button>
                </header>
                <div className="creative-memo-start-options">
                  <button type="button" onClick={() => onAddCreativeMemo("free")}>
                    <strong>자유롭게 쓰기</strong>
                    <span>빈 종이처럼 원하는 내용을 자유롭게 써요.</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCreativeMemoCreatorStep("template")}
                  >
                    <strong>도움 틀로 쓰기</strong>
                    <span>인물, 관계, 장소, 사건 중 필요한 틀을 골라 써요.</span>
                  </button>
                </div>
              </section>
            )}

            {creativeMemoCreatorStep === "template" && (
              <section className="creative-memo-creator" aria-live="polite">
                <header>
                  <div>
                    <span>도움 틀로 쓰기</span>
                    <h3>무엇을 더 자세히 생각할까요?</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCreativeMemoCreatorStep("choice")}
                  >
                    이전
                  </button>
                </header>
                <div className="creative-memo-template-options">
                  {CREATIVE_MEMO_TEMPLATES.map((template) => (
                    <button
                      type="button"
                      key={template.kind}
                      onClick={() => onAddCreativeMemo(template.kind)}
                    >
                      <strong>{template.title}</strong>
                      <span>{template.description}</span>
                      <small>처음에는 항목 {template.defaultFields.length}개</small>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {orderedCreativeMemos.length > 0 ? (
              <div className="creative-memo-list">
                {orderedCreativeMemos.map((memo) => {
                  const writtenFieldCount = memo.fields.filter((field) =>
                    field.value.trim(),
                  ).length;
                  return (
                    <article className="creative-memo-card" key={memo.id}>
                      <div>
                        <span>{creativeMemoKindLabel(memo.kind)}</span>
                        <strong>{creativeMemoDisplayTitle(memo)}</strong>
                        <p>{creativeMemoExcerpt(memo)}</p>
                      </div>
                      <footer>
                        <small>
                          작성한 항목 {writtenFieldCount}개 · 전체 {memo.fields.length}개
                        </small>
                        <div>
                          <button
                            type="button"
                            onClick={() => onOpenCreativeMemo(memo.id)}
                          >
                            열기
                          </button>
                          <button
                            className="danger-text-button"
                            type="button"
                            onClick={() => onDeleteCreativeMemo(memo.id)}
                          >
                            삭제
                          </button>
                        </div>
                      </footer>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="creative-memo-empty">
                <strong>아직 추가한 창작 메모가 없어요.</strong>
                <p>필요한 순간에 자유 메모나 도움 틀을 하나씩 더해 보세요.</p>
              </div>
            )}
          </section>
        </div>
      </details>
      {(() => {
          const stageAnalysis = getUnlinkedStagesAndChapters(
            sortedChapters,
            selectedStructure.mode,
          );
          const selectedChapterStageKeys = canonicalizeStoryStageKeys(
            selectedChapter?.storyStageKeys,
          );
          const selectedChapterStageLabel = formatStoryStageLabels(
            selectedChapterStageKeys,
            selectedStructure.mode,
            "아직 연결된 단계가 없어요",
          );

          return (
            <div className="chapter-planning-workspace plan-split-layout">
              <section className="chapter-flow-board">
                <div className="chapter-flow-heading">
                  <div>
                    <span className="eyebrow">구성 한눈에 보기</span>
                    <h2>장의 흐름</h2>
                    <p>
                      장을 고르면 옆에서 내용을 정리할 수 있어요. 한 장에 여러 이야기 단계를 담아도 괜찮아요.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="primary-button"
                    onClick={onAddChapter}
                  >
                    + 새 장(場) 추가
                  </button>
                </div>

                {stageAnalysis.unlinkedStages.length > 0 && sortedChapters.length > 0 && (
                  <div className="chapter-flow-guidance">
                    <span className="guidance-tag">💡 이야기 구성 안내</span>
                    <p>
                      <strong>
                        {stageAnalysis.unlinkedStages
                          .map((key) => mapStageToStructureLabel(key, selectedStructure.mode))
                          .join(", ")}
                      </strong>{" "}
                      단계가 아직 어느 장에도 연결되지 않았어요. 장을 연결하면 이야기의 흐름을 더 쉽게 점검할 수 있어요.
                    </p>
                  </div>
                )}

                <label className="chapter-plan-selector">
                  <span>편집할 장</span>
                  <select value={selectedChapter?.id ?? ""} onChange={event => onOpenChapterPlan(event.target.value)} disabled={!sortedChapters.length}>
                    {!sortedChapters.length && <option value="">아직 장이 없어요</option>}
                    {sortedChapters.map(chapter => <option key={chapter.id} value={chapter.id}>{chapter.order}장 · {chapter.title || "제목 없음"}</option>)}
                  </select>
                </label>
                <div className="chapter-flow-list">
                  {sortedChapters.map((chapter) => (
                    <button
                      type="button"
                      className={`plan-chapter-item ${chapter.id === selectedChapter?.id ? "active" : ""}`}
                      key={chapter.id}
                      aria-current={chapter.id === selectedChapter?.id ? "true" : undefined}
                      title={chapter.title || `${chapter.order}장`}
                      onClick={() => onOpenChapterPlan(chapter.id)}
                    >
                      <strong>{chapter.order}장 · {chapter.title || "제목 없음"}</strong>
                      <span>{formatStoryStageLabels(chapter.storyStageKeys, selectedStructure.mode, "단계 미연결")}</span>
                      <small>{draft.lines.filter(line => line.chapterId === chapter.id).length}컷{continuationPoint?.chapterId === chapter.id ? " · 이어쓰기" : ""}</small>
                    </button>
                  ))}
                </div>
              </section>

              <div className="planning-grid chapter-planning-grid">
                {selectedChapter ? (
                  <section className="planning-card chapter-plan-card">
                    <div className="card-heading with-actions">
                      <div>
                        <span>{selectedChapter.order}장</span>
                        <strong>이 장의 사건과 배경 정하기</strong>
                      </div>
                      <button
                        type="button"
                        className="danger-link"
                        onClick={() => onRemoveChapter(selectedChapter.id)}
                      >
                        이 장 삭제
                      </button>
                    </div>
                    <p className="planning-help">{selectedChapter.order}장 · {selectedChapterLines.length}컷 · 나중에 생각을 바꿔도 괜찮아요.</p>
                    <div className="plan-chapter-order" role="group" tabIndex={-1} aria-label={`현재 ${selectedChapter.order}장 순서 바꾸기`}>
                      <button type="button" disabled={sortedChapters[0]?.id === selectedChapter.id} onClick={event => moveSelectedChapter(-1, event.currentTarget)}>↑ 위로 이동</button>
                      <button type="button" disabled={sortedChapters.at(-1)?.id === selectedChapter.id} onClick={event => moveSelectedChapter(1, event.currentTarget)}>↓ 아래로 이동</button>
                    </div>

                    <div className="field wide stage-picker-field">
                      <div className="stage-picker-header">
                        <span>이야기 단계 연결 (여러 개 선택 가능)</span>
                        <small className="stage-picker-summary">
                          {selectedChapterStageLabel}
                        </small>
                      </div>
                      <div
                        className="chapter-stage-picker"
                        role="group"
                        aria-label={`${selectedChapter.order}장 이야기 단계 선택`}
                      >
                        {selectedStructure.steps.map((step) => {
                          const isSelected = selectedChapterStageKeys.includes(step.key);
                          return (
                            <button
                              key={step.key}
                              type="button"
                              className={`stage-select-button ${isSelected ? "active" : ""}`}
                              aria-pressed={isSelected}
                              onClick={() => {
                                const nextKeys = isSelected
                                  ? selectedChapterStageKeys.filter((k) => k !== step.key)
                                  : [...selectedChapterStageKeys, step.key];
                                onUpdateChapter(selectedChapter.id, {
                                  storyStageKeys: canonicalizeStoryStageKeys(nextKeys),
                                });
                              }}
                            >
                              <span className="stage-check-icon">{isSelected ? "●" : "○"}</span>
                              <span className="stage-label">{step.label}</span>
                            </button>
                          );
                        })}
                      </div>
                      <p className="field-guide">
                        한 장에 여러 단계를 담거나(예: 위기·절정), 비워 두어도 괜찮아요.
                      </p>
                    </div>

                    <label className="field wide">
                      <span>장 제목 · 플레이에도 표시</span>
                      <input
                        value={selectedChapter.title}
                        onChange={(event) =>
                          onUpdateChapter(selectedChapter.id, {
                            title: event.target.value,
                          })
                        }
                        placeholder={`${selectedChapter.order}장 제목`}
                      />
                    </label>
                    <label className="field wide editor-only-field">
                      <span>이 장에서 일어나는 일</span>
                      <textarea
                        rows={3}
                        value={selectedChapter.summary}
                        onChange={(event) =>
                          onUpdateChapter(selectedChapter.id, {
                            summary: event.target.value,
                          })
                        }
                        placeholder="이 장에서 일어날 사건과 변화를 한 문장으로 요약해 보세요."
                      />
                    </label>
                    <details className="plan-chapter-details">
                      <summary>자세한 장 계획</summary>
                    <div className="planning-two-columns">
                      <label className="field editor-only-field">
                        <span>전체 이야기에서 맡은 역할</span>
                        <textarea
                          rows={3}
                          value={selectedChapter.purpose}
                          onChange={(event) =>
                            onUpdateChapter(selectedChapter.id, {
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
                            onUpdateChapter(selectedChapter.id, {
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
                          onUpdateChapter(selectedChapter.id, {
                            keyEvents: event.target.value,
                          })
                        }
                        placeholder={
                          "자라가 찾아온다.\n자라가 부탁한다.\n그 말을 들은 토끼가 결정을 내린다."
                        }
                      />
                    </label>
                    <label className="field wide editor-only-field">
                      <span>이 장의 결과로 다음에 생기는 일</span>
                      <textarea
                        rows={2}
                        value={selectedChapter.nextChapterIdea}
                        onChange={(event) =>
                          onUpdateChapter(selectedChapter.id, {
                            nextChapterIdea: event.target.value,
                          })
                        }
                        placeholder="이번 선택이나 사건 때문에 다음 장에서 생기는 일"
                      />
                    </label>
                    </details>
                    <details className="chapter-resource-details">
                      <summary>등장인물과 기본 무대</summary>
                      <section className="plan-default-stage" aria-label="장의 기본 무대">
                        <h3>이 장의 기본 이미지</h3>
                        <p>따로 이미지를 고르지 않은 컷에 사용해요. 컷에서 따로 고른 이미지는 바뀌지 않아요.</p>
                        {([
                          { field: "leftAssetId", label: "왼쪽 인물", type: "character" },
                          { field: "rightAssetId", label: "오른쪽 인물", type: "character" },
                          { field: "backgroundId", label: "배경", type: "background" },
                        ] as const).map(({ field, label, type }) => (
                          <div className="plan-default-stage-item" key={field}>
                            <strong>{label}</strong>
                            <span>{ASSET_BY_ID.get(selectedChapter[field])?.displayName || (selectedChapter[field] ? "자료를 찾을 수 없어요" : "아직 고르지 않았어요")}</span>
                            <AssetPickerButton type={type} label={`장 기본 ${label} 고르기`} buttonText={`${label} 고르기`} value={selectedChapter[field]} favoriteIds={favoriteAssets} recentIds={recentAssets} onToggleFavorite={onToggleFavorite} onSelect={id => onUpdateChapter(selectedChapter.id, { [field]: id })} />
                            <button type="button" disabled={!selectedChapter[field]} onClick={() => onUpdateChapter(selectedChapter.id, { [field]: "" })}>{label} 기본값 지우기</button>
                          </div>
                        ))}
                      </section>
                      <h3>이 장에서 고를 이미지 후보</h3>
                      <p>후보를 추가해도 기본 무대나 컷은 바뀌지 않아요. 편집할 때 선택 창에서 먼저 보여 줘요.</p>
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
                          onAdd={(name) => onAddSpeaker(name, false)}
                        />
                      </section>
                      <ResourcePool
                        title="캐릭터 이미지 후보"
                        type="character"
                        ids={selectedChapter.characterAssetIds}
                        favoriteIds={favoriteAssets}
                        recentIds={recentAssets}
                        onToggleFavorite={onToggleFavorite}
                        onAdd={(id) => onAddAssetToChapter(id, "character")}
                        onRemove={(id) => onRemoveAssetFromChapter(id, "character")}
                      />
                      <ResourcePool
                        title="장소·배경 후보"
                        type="background"
                        ids={selectedChapter.backgroundAssetIds}
                        favoriteIds={favoriteAssets}
                        recentIds={recentAssets}
                        onToggleFavorite={onToggleFavorite}
                        onAdd={(id) => onAddAssetToChapter(id, "background")}
                        onRemove={(id) => onRemoveAssetFromChapter(id, "background")}
                      />
                    </details>
                    <button
                      type="button"
                      className="primary-button full-button"
                      onClick={() => onOpenChapterWriter(selectedChapter.id)}
                    >
                      이 장 대본 쓰기
                    </button>
                  </section>
                ) : (
                  <section className="empty-creator-state">
                    <span>1</span>
                    <h2>첫 장(場)을 구상해 보세요</h2>
                    <p>장을 만든 뒤 주요 사건과 배경을 정할 수 있어요.</p>
                    <button
                      type="button"
                      className="primary-button"
                      onClick={onAddChapter}
                    >
                      + 첫 장 만들기
                    </button>
                  </section>
                )}
              </div>
            </div>
          );
        })()}
    </section>
  );
}
