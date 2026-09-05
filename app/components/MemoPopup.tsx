"use client";

import type { Chapter, StoryLine, StoryProject } from "../story-data";
import type { StoryStructureOption } from "./StoryPlanScreen";
import {
  creativeMemoDisplayTitle,
  creativeMemoExcerpt,
  creativeMemoKindLabel,
  type CreativeMemo,
  type CreativeMemoKind,
} from "../creative-memos";
import {
  canonicalizeStoryStageKeys,
  formatStoryStageLabels,
} from "../story-stages";

export type MemoSection =
  | "story"
  | "structure"
  | "details"
  | "creative"
  | "chapter"
  | "scene";

export type CreativeMemoScope = Exclude<CreativeMemoKind, "free"> | "free";
export type MemoScope = "all" | "story" | CreativeMemoScope | "chapter" | "scene";
export type MemoWindowSize = "compact" | "large";

export interface MemoSearchResult {
  id: string;
  section: MemoSection;
  scope?: Exclude<MemoScope, "all">;
  label: string;
  context: string;
  content: string;
  fieldId: string;
  chapterId?: string;
  lineId?: string;
  memoId?: string;
}

export function memoResultScope(result: MemoSearchResult): Exclude<MemoScope, "all"> {
  if (result.scope) return result.scope;
  if (result.section === "chapter" || result.section === "scene") {
    return result.section;
  }
  return "story";
}

export interface MemoPopupProps {
  draft: StoryProject;
  currentLocation: string;
  memoWindowSize: MemoWindowSize;
  onSetMemoWindowSize: (size: MemoWindowSize | ((current: MemoWindowSize) => MemoWindowSize)) => void;
  onReturnFromMemoPopup: () => void;
  memoSearch: string;
  onSetMemoSearch: (search: string) => void;
  memoScope: MemoScope;
  onSetMemoScope: (scope: MemoScope) => void;
  normalizedMemoSearch: string;
  filteredMemoSearchResults: MemoSearchResult[];
  onOpenMemoSearchResult: (result: MemoSearchResult) => void;
  onOpenVisibleMemoSections: () => void;
  onCloseAllMemoSections: () => void;
  memoSectionsOpen: Record<MemoSection, boolean>;
  onSetMemoSectionOpen: (section: MemoSection, open: boolean) => void;
  memoScopeAllowsSection: (section: MemoSection) => boolean;
  selectedStructure: StoryStructureOption;
  selectedChapter: Chapter;
  selectedLine?: StoryLine;
  selectedLineIndex: number;
  orderedCreativeMemos: CreativeMemo[];
  onUpdatePlanning: (patch: Partial<StoryProject["planning"]>) => void;
  onUpdateChapter: (id: string, patch: Partial<Chapter>) => void;
  onUpdateLine: (id: string, patch: Partial<StoryLine>) => void;
  onSelectCreativeMemoId: (id: string) => void;
}

export function MemoPopup({
  draft,
  currentLocation,
  memoWindowSize,
  onSetMemoWindowSize,
  onReturnFromMemoPopup,
  memoSearch,
  onSetMemoSearch,
  memoScope,
  onSetMemoScope,
  normalizedMemoSearch,
  filteredMemoSearchResults,
  onOpenMemoSearchResult,
  onOpenVisibleMemoSections,
  onCloseAllMemoSections,
  memoSectionsOpen,
  onSetMemoSectionOpen,
  memoScopeAllowsSection,
  selectedStructure,
  selectedChapter,
  selectedLine,
  selectedLineIndex,
  orderedCreativeMemos,
  onUpdatePlanning,
  onUpdateChapter,
  onUpdateLine,
  onSelectCreativeMemoId,
}: MemoPopupProps) {
  return (
    <aside
      className={`memo-popup ${memoWindowSize}`}
      role="dialog"
      aria-modal="false"
      aria-label="창작 메모 찾기와 편집"
    >
      <header className="memo-popup-heading">
        <div>
          <span className="eyebrow">플레이에는 보이지 않아요</span>
          <h2>창작 메모</h2>
          <p>{currentLocation}</p>
        </div>
        <div className="memo-popup-heading-actions">
          <button
            type="button"
            className="memo-popup-size"
            onClick={() =>
              onSetMemoWindowSize((current) =>
                current === "compact" ? "large" : "compact",
              )
            }
          >
            {memoWindowSize === "compact" ? "크게 보기" : "작게 보기"}
          </button>
          <button
            type="button"
            className="memo-popup-close"
            onClick={onReturnFromMemoPopup}
            aria-label="메모를 닫고 원래 글쓰기로 돌아가기"
          >
            글쓰기로 돌아가기
          </button>
        </div>
      </header>

      <div className="memo-finder">
        <div className="memo-search-box">
          <label htmlFor="memo-search-input">메모 찾기</label>
          <div>
            <input
              id="memo-search-input"
              type="search"
              value={memoSearch}
              onChange={(event) => onSetMemoSearch(event.target.value)}
              placeholder="예: 갈등, 토끼, 다음 장"
            />
            {memoSearch && (
              <button
                type="button"
                onClick={() => onSetMemoSearch("")}
                aria-label="메모 검색어 지우기"
              >
                지우기
              </button>
            )}
          </div>
        </div>
        <div className="memo-scope-filter" aria-label="메모 범위">
          {(
            [
              ["all", "전체"],
              ["story", "이야기 구성"],
              ["character", "인물"],
              ["relationship", "관계"],
              ["place", "장소·세계"],
              ["event", "사건·갈등"],
              ["free", "자유 메모"],
              ["chapter", "장"],
              ["scene", "컷"],
            ] as [MemoScope, string][]
          ).map(([scope, label]) => (
            <button
              type="button"
              key={scope}
              className={memoScope === scope ? "active" : ""}
              aria-pressed={memoScope === scope}
              onClick={() => onSetMemoScope(scope)}
            >
              {label}
            </button>
          ))}
        </div>
        <small className="memo-finder-hint">
          검색하면 작품의 모든 장과 컷에서 찾아요.
        </small>
      </div>

      {normalizedMemoSearch ? (
        <section className="memo-search-results" aria-live="polite">
          <header>
            <strong>
              검색 결과 {filteredMemoSearchResults.length}개
            </strong>
            <small>
              원하는 기록을 누르면 그 메모로 바로 이동해요.
            </small>
          </header>
          {filteredMemoSearchResults.length > 0 ? (
            <div className="memo-result-list">
              {filteredMemoSearchResults.map((result) => (
                <button
                  type="button"
                  key={result.id}
                  onClick={() => onOpenMemoSearchResult(result)}
                >
                  <span>{result.context}</span>
                  <strong>{result.label}</strong>
                  <small>
                    {result.content.trim() ||
                      "아직 작성하지 않은 메모예요."}
                  </small>
                </button>
              ))}
            </div>
          ) : (
            <div className="memo-search-empty">
              <strong>맞는 메모를 찾지 못했어요.</strong>
              <p>검색어를 줄이거나 다른 범위를 선택해 보세요.</p>
            </div>
          )}
        </section>
      ) : (
        <>
          <div className="memo-popup-guide">
            <span>
              원하는 묶음을 펼쳐 글과 비교하고 바로 수정하세요.
            </span>
            <div>
              <button type="button" onClick={onOpenVisibleMemoSections}>
                모두 펼치기
              </button>
              <button type="button" onClick={onCloseAllMemoSections}>
                모두 접기
              </button>
            </div>
          </div>

          {memoScopeAllowsSection("story") && (
            <details
              className="memo-section"
              open={memoSectionsOpen.story}
              onToggle={(event) =>
                onSetMemoSectionOpen("story", event.currentTarget.open)
              }
            >
              <summary>
                <span>
                  <b>전체 이야기</b>
                  <small>소재·주제·인물·갈등</small>
                </span>
                <strong>{memoSectionsOpen.story ? "접기" : "펼치기"}</strong>
              </summary>
              <div className="memo-fields">
                <label className="field">
                  <span>한 줄 이야기</span>
                  <textarea
                    id="memo-field-story-premise"
                    rows={3}
                    value={draft.planning.premise}
                    onChange={(event) =>
                      onUpdatePlanning({ premise: event.target.value })
                    }
                  />
                </label>
                <label className="field">
                  <span>이야기 소재</span>
                  <textarea
                    id="memo-field-story-material"
                    rows={2}
                    value={draft.planning.material}
                    onChange={(event) =>
                      onUpdatePlanning({ material: event.target.value })
                    }
                  />
                </label>
                <label className="field">
                  <span>이야기 주제</span>
                  <textarea
                    id="memo-field-story-theme"
                    rows={2}
                    value={draft.planning.theme}
                    onChange={(event) =>
                      onUpdatePlanning({ theme: event.target.value })
                    }
                  />
                </label>
                <label className="field">
                  <span>핵심 인물</span>
                  <textarea
                    id="memo-field-story-main-character"
                    rows={2}
                    value={draft.planning.mainCharacter}
                    onChange={(event) =>
                      onUpdatePlanning({
                        mainCharacter: event.target.value,
                      })
                    }
                  />
                </label>
                <label className="field">
                  <span>주인공이 바라는 것</span>
                  <textarea
                    id="memo-field-story-main-goal"
                    rows={3}
                    value={draft.planning.mainGoal}
                    onChange={(event) =>
                      onUpdatePlanning({ mainGoal: event.target.value })
                    }
                  />
                </label>
                <label className="field">
                  <span>주요 갈등</span>
                  <textarea
                    id="memo-field-story-central-problem"
                    rows={3}
                    value={draft.planning.centralProblem}
                    onChange={(event) =>
                      onUpdatePlanning({
                        centralProblem: event.target.value,
                      })
                    }
                  />
                </label>
                <label className="field">
                  <span>실패하면 생기는 일</span>
                  <textarea
                    id="memo-field-story-stakes"
                    rows={3}
                    value={draft.planning.stakes}
                    onChange={(event) =>
                      onUpdatePlanning({ stakes: event.target.value })
                    }
                  />
                </label>
                <label className="field">
                  <span>마지막에 달라지는 점</span>
                  <textarea
                    id="memo-field-story-ending-change"
                    rows={3}
                    value={draft.planning.endingChange}
                    onChange={(event) =>
                      onUpdatePlanning({
                        endingChange: event.target.value,
                      })
                    }
                  />
                </label>
              </div>
            </details>
          )}

          {memoScopeAllowsSection("structure") && (
            <details
              className="memo-section"
              open={memoSectionsOpen.structure}
              onToggle={(event) =>
                onSetMemoSectionOpen("structure", event.currentTarget.open)
              }
            >
              <summary>
                <span>
                  <b>이야기 뼈대</b>
                  <small>{selectedStructure.title}</small>
                </span>
                <strong>
                  {memoSectionsOpen.structure ? "접기" : "펼치기"}
                </strong>
              </summary>
              <div className="memo-fields">
                {selectedStructure.steps.map((step) => (
                  <label className="field" key={step.key}>
                    <span>{step.label}</span>
                    <small>{step.guide}</small>
                    <textarea
                      id={`memo-field-structure-${step.key}`}
                      rows={3}
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
            </details>
          )}

          {memoScopeAllowsSection("details") && (
            <details
              className="memo-section"
              open={memoSectionsOpen.details}
              onToggle={(event) =>
                onSetMemoSectionOpen("details", event.currentTarget.open)
              }
            >
              <summary>
                <span>
                  <b>인물·배경·추가 메모</b>
                  <small>세부 설정과 남겨 둘 생각</small>
                </span>
                <strong>
                  {memoSectionsOpen.details ? "접기" : "펼치기"}
                </strong>
              </summary>
              <div className="memo-fields">
                <label className="field">
                  <span>인물 설정</span>
                  <textarea
                    id="memo-field-details-characters"
                    rows={5}
                    value={draft.planning.characterNotes}
                    onChange={(event) =>
                      onUpdatePlanning({
                        characterNotes: event.target.value,
                      })
                    }
                  />
                </label>
                <label className="field">
                  <span>배경·세계 설정</span>
                  <textarea
                    id="memo-field-details-world"
                    rows={5}
                    value={draft.planning.worldNotes}
                    onChange={(event) =>
                      onUpdatePlanning({ worldNotes: event.target.value })
                    }
                  />
                </label>
                <label className="field">
                  <span>전체 분위기</span>
                  <textarea
                    id="memo-field-details-mood"
                    rows={3}
                    value={draft.planning.mood}
                    onChange={(event) =>
                      onUpdatePlanning({ mood: event.target.value })
                    }
                  />
                </label>
                <label className="field">
                  <span>아직 정하지 못한 것</span>
                  <textarea
                    id="memo-field-details-questions"
                    rows={4}
                    value={draft.planning.openQuestions}
                    onChange={(event) =>
                      onUpdatePlanning({
                        openQuestions: event.target.value,
                      })
                    }
                  />
                </label>
                <label className="field">
                  <span>자유 창작 메모</span>
                  <textarea
                    id="memo-field-details-free"
                    rows={4}
                    value={draft.planning.freeNotes}
                    onChange={(event) =>
                      onUpdatePlanning({ freeNotes: event.target.value })
                    }
                  />
                </label>
              </div>
            </details>
          )}

          {memoScopeAllowsSection("creative") && (
            <details
              className="memo-section creative"
              open={memoSectionsOpen.creative}
              onToggle={(event) =>
                onSetMemoSectionOpen("creative", event.currentTarget.open)
              }
            >
              <summary>
                <span>
                  <b>추가한 창작 메모</b>
                  <small>자유 메모와 도움 틀 메모</small>
                </span>
                <strong>
                  {memoSectionsOpen.creative ? "접기" : "펼치기"}
                </strong>
              </summary>
              <div className="memo-creative-list">
                {orderedCreativeMemos
                  .filter(
                    (memo) =>
                      memoScope === "all" || memo.kind === memoScope,
                  )
                  .map((memo) => (
                    <button
                      type="button"
                      key={memo.id}
                      onClick={() => onSelectCreativeMemoId(memo.id)}
                    >
                      <span>{creativeMemoKindLabel(memo.kind)}</span>
                      <strong>{creativeMemoDisplayTitle(memo)}</strong>
                      <small>{creativeMemoExcerpt(memo)}</small>
                    </button>
                  ))}
                {orderedCreativeMemos.filter(
                  (memo) => memoScope === "all" || memo.kind === memoScope,
                ).length === 0 && (
                  <p>이 범위에 만든 창작 메모가 아직 없어요.</p>
                )}
              </div>
            </details>
          )}

          {memoScopeAllowsSection("chapter") && (
            <details
              className="memo-section current"
              open={memoSectionsOpen.chapter}
              onToggle={(event) =>
                onSetMemoSectionOpen("chapter", event.currentTarget.open)
              }
            >
              <summary>
                <span>
                  <b>현재 장</b>
                  <small>
                    {selectedChapter.order}.{" "}
                    {selectedChapter.title || "제목 없음"}
                    {selectedChapter.storyStageKeys && selectedChapter.storyStageKeys.length > 0
                      ? ` (${formatStoryStageLabels(canonicalizeStoryStageKeys(selectedChapter.storyStageKeys), draft.planning.structureMode)})`
                      : ""}
                  </small>
                </span>
                <strong>
                  {memoSectionsOpen.chapter ? "접기" : "펼치기"}
                </strong>
              </summary>
              <div className="memo-fields">
                <label className="field">
                  <span>이번 장에서 달라지는 일</span>
                  <textarea
                    id={`memo-field-chapter-${selectedChapter.id}-summary`}
                    rows={3}
                    value={selectedChapter.summary}
                    onChange={(event) =>
                      onUpdateChapter(selectedChapter.id, {
                        summary: event.target.value,
                      })
                    }
                  />
                </label>
                <label className="field">
                  <span>이 장의 역할</span>
                  <textarea
                    id={`memo-field-chapter-${selectedChapter.id}-purpose`}
                    rows={3}
                    value={selectedChapter.purpose}
                    onChange={(event) =>
                      onUpdateChapter(selectedChapter.id, {
                        purpose: event.target.value,
                      })
                    }
                  />
                </label>
                <label className="field">
                  <span>분위기·감정 흐름</span>
                  <textarea
                    id={`memo-field-chapter-${selectedChapter.id}-mood`}
                    rows={3}
                    value={selectedChapter.mood}
                    onChange={(event) =>
                      onUpdateChapter(selectedChapter.id, {
                        mood: event.target.value,
                      })
                    }
                  />
                </label>
                <label className="field">
                  <span>꼭 들어갈 사건</span>
                  <textarea
                    id={`memo-field-chapter-${selectedChapter.id}-keyEvents`}
                    rows={4}
                    value={selectedChapter.keyEvents}
                    onChange={(event) =>
                      onUpdateChapter(selectedChapter.id, {
                        keyEvents: event.target.value,
                      })
                    }
                  />
                </label>
                <label className="field">
                  <span>다음 장으로 이어질 일</span>
                  <textarea
                    id={`memo-field-chapter-${selectedChapter.id}-nextChapterIdea`}
                    rows={3}
                    value={selectedChapter.nextChapterIdea}
                    onChange={(event) =>
                      onUpdateChapter(selectedChapter.id, {
                        nextChapterIdea: event.target.value,
                      })
                    }
                  />
                </label>
              </div>
            </details>
          )}

          {selectedLine && memoScopeAllowsSection("scene") && (
            <details
              className="memo-section current"
              open={memoSectionsOpen.scene}
              onToggle={(event) =>
                onSetMemoSectionOpen("scene", event.currentTarget.open)
              }
            >
              <summary>
                <span>
                  <b>현재 컷</b>
                  <small>
                    컷 {selectedLineIndex + 1} ·{" "}
                    {selectedLine.type === "narration"
                      ? "해설"
                      : selectedLine.speakerName || "화자 없음"}
                  </small>
                </span>
                <strong>
                  {memoSectionsOpen.scene ? "접기" : "펼치기"}
                </strong>
              </summary>
              <div className="memo-fields">
                <label className="field">
                  <span>이 컷의 역할</span>
                  <textarea
                    id={`memo-field-scene-${selectedLine.id}-purposeNote`}
                    rows={3}
                    value={selectedLine.purposeNote}
                    onChange={(event) =>
                      onUpdateLine(selectedLine.id, {
                        purposeNote: event.target.value,
                      })
                    }
                  />
                </label>
                <label className="field">
                  <span>인물의 감정</span>
                  <textarea
                    id={`memo-field-scene-${selectedLine.id}-emotionNote`}
                    rows={3}
                    value={selectedLine.emotionNote}
                    onChange={(event) =>
                      onUpdateLine(selectedLine.id, {
                        emotionNote: event.target.value,
                      })
                    }
                  />
                </label>
                <label className="field">
                  <span>연출 메모</span>
                  <textarea
                    id={`memo-field-scene-${selectedLine.id}-directionNote`}
                    rows={3}
                    value={selectedLine.directionNote}
                    onChange={(event) =>
                      onUpdateLine(selectedLine.id, {
                        directionNote: event.target.value,
                      })
                    }
                  />
                </label>
              </div>
            </details>
          )}
        </>
      )}
    </aside>
  );
}
