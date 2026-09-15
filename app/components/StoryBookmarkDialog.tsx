"use client";

import { useState } from "react";
import { ModalDialog } from "./ModalDialog";
import {
  READING_SAVE_SLOT_IDS,
  READING_SAVE_SLOT_LABELS,
  formatSavedDate,
  type ProjectReadingProgress,
  type ReadingSaveSlot,
  type ReadingSaveSlotId,
} from "../story-reading-progress";
import type { Chapter, StoryLine } from "../story-data";

export interface StoryBookmarkDialogProps {
  mode: "resume-prompt" | "manager";
  projectTitle: string;
  currentLine?: StoryLine;
  currentChapter?: Chapter;
  currentCutNumber: number;
  totalCuts: number;
  progress: ProjectReadingProgress | null;
  latestSlot: ReadingSaveSlot | null;
  onClose: () => void;
  onResume: (slot: ReadingSaveSlot) => void;
  onStartFresh?: () => void;
  onSaveManualSlot?: (slotId: ReadingSaveSlotId) => void;
  onDeleteSlot?: (slotId: ReadingSaveSlotId) => void;
}

export function StoryBookmarkDialog({
  mode: initialMode,
  projectTitle,
  currentLine,
  currentChapter,
  currentCutNumber,
  totalCuts,
  progress,
  latestSlot,
  onClose,
  onResume,
  onStartFresh,
  onSaveManualSlot,
  onDeleteSlot,
}: StoryBookmarkDialogProps) {
  const [viewMode, setViewMode] = useState<"resume-prompt" | "manager">(initialMode);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const showFeedback = (message: string) => {
    setFeedbackMessage(message);
    setTimeout(() => {
      setFeedbackMessage(null);
    }, 2800);
  };

  const handleSave = (slotId: ReadingSaveSlotId) => {
    if (onSaveManualSlot) {
      onSaveManualSlot(slotId);
      const label = READING_SAVE_SLOT_LABELS[slotId] ?? slotId;
      showFeedback(`현재 위치가 [${label}]에 저장되었어요.`);
    }
  };

  const handleDelete = (slotId: ReadingSaveSlotId) => {
    if (onDeleteSlot) {
      onDeleteSlot(slotId);
      const label = READING_SAVE_SLOT_LABELS[slotId] ?? slotId;
      showFeedback(`[${label}] 기록을 삭제했어요.`);
    }
  };

  if (viewMode === "resume-prompt" && latestSlot) {
    return (
      <ModalDialog
        overlayClassName="reader-menu-backdrop"
        dialogClassName="reader-menu-dialog reader-bookmark-dialog reader-resume-dialog"
        label="이어읽기 확인"
        onClose={onClose}
      >
        <header>
          <h2>이전에 읽던 것을 이어읽겠습니까?</h2>
          <button type="button" onClick={onClose} aria-label="닫기">
            닫기
          </button>
        </header>

        <section className="bookmark-resume-summary">
          <p className="bookmark-resume-lead">
            <strong>{projectTitle}</strong> 작품을 이전에 읽던 기록이 남아있어요.
          </p>

          <div className="bookmark-slot-card resume-target-card">
            <div className="slot-card-header">
              <span className="slot-badge">{latestSlot.slotLabel}</span>
              <time dateTime={latestSlot.savedAt}>{formatSavedDate(latestSlot.savedAt)}</time>
            </div>
            <div className="slot-card-body">
              <strong className="slot-location">
                {latestSlot.chapterTitle ? `${latestSlot.chapterTitle} · ` : ""}
                {latestSlot.cutNumber} / {latestSlot.totalCuts}번째 컷
              </strong>
              {latestSlot.dialoguePreview && (
                <p className="slot-preview">
                  {latestSlot.speakerName ? (
                    <span className="slot-speaker">{latestSlot.speakerName}: </span>
                  ) : null}
                  “{latestSlot.dialoguePreview}”
                </p>
              )}
            </div>
          </div>
        </section>

        <div className="bookmark-resume-actions">
          <button
            type="button"
            className="primary-button resume-action-button"
            onClick={() => onResume(latestSlot)}
          >
            이어읽기 ({latestSlot.cutNumber}번째 컷)
          </button>
          {onStartFresh && (
            <button
              type="button"
              className="secondary-button resume-action-button"
              onClick={onStartFresh}
            >
              처음부터 읽기 (1번째 컷)
            </button>
          )}
          <button
            type="button"
            className="ghost-button resume-action-button"
            onClick={() => setViewMode("manager")}
          >
            저장 목록에서 선택 (자동1 · 수동1~3)
          </button>
        </div>
      </ModalDialog>
    );
  }

  return (
    <ModalDialog
      overlayClassName="reader-menu-backdrop"
      dialogClassName="reader-menu-dialog reader-bookmark-dialog"
      label="책갈피 및 저장"
      onClose={onClose}
    >
      <header>
        <h2>저장 및 이어읽기</h2>
        <button type="button" onClick={onClose} aria-label="닫기">
          닫기
        </button>
      </header>

      {feedbackMessage && (
        <aside className="bookmark-feedback-toast" role="status" aria-live="polite">
          {feedbackMessage}
        </aside>
      )}

      {currentCutNumber > 0 && (
        <section className="bookmark-current-location">
          <h3>현재 읽고 있는 위치</h3>
          <p className="current-location-detail">
            <strong>
              {currentChapter ? `${currentChapter.order}장. ${currentChapter.title} · ` : ""}
              {currentCutNumber} / {totalCuts}번째 컷
            </strong>
          </p>
          {currentLine?.text && (
            <p className="current-location-preview">
              {currentLine.speaker ? <span>{currentLine.speaker}: </span> : null}
              “{currentLine.text.slice(0, 50)}”
            </p>
          )}

          {onSaveManualSlot && (
            <div className="bookmark-quick-saves">
              <span className="quick-saves-label">현재 위치 바로 저장:</span>
              <div className="quick-saves-buttons">
                <button
                  type="button"
                  className="quick-save-btn"
                  onClick={() => handleSave("manual-1")}
                >
                  수동저장 1
                </button>
                <button
                  type="button"
                  className="quick-save-btn"
                  onClick={() => handleSave("manual-2")}
                >
                  수동저장 2
                </button>
                <button
                  type="button"
                  className="quick-save-btn"
                  onClick={() => handleSave("manual-3")}
                >
                  수동저장 3
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      <section className="bookmark-slots-list">
        <h3>저장 슬롯 목록 (이어읽기)</h3>
        <p className="bookmark-slots-help">원하는 슬롯의 이어읽기 버튼을 누르면 해당 위치로 이동해요.</p>

        <div className="bookmark-slots-grid">
          {READING_SAVE_SLOT_IDS.map((slotId) => {
            const slot = progress?.slots[slotId];
            const isAuto = slotId === "auto";
            const label = READING_SAVE_SLOT_LABELS[slotId];

            return (
              <article
                key={slotId}
                className={`bookmark-slot-card ${slot ? "is-filled" : "is-empty"} ${
                  isAuto ? "is-auto-slot" : ""
                }`}
              >
                <div className="slot-card-header">
                  <span className={`slot-badge ${isAuto ? "badge-auto" : "badge-manual"}`}>
                    {label}
                  </span>
                  {slot && <time dateTime={slot.savedAt}>{formatSavedDate(slot.savedAt)}</time>}
                </div>

                <div className="slot-card-body">
                  {slot ? (
                    <>
                      <strong className="slot-location">
                        {slot.chapterTitle ? `${slot.chapterTitle} · ` : ""}
                        {slot.cutNumber} / {slot.totalCuts}번째 컷
                      </strong>
                      {slot.dialoguePreview && (
                        <p className="slot-preview">
                          {slot.speakerName ? <span>{slot.speakerName}: </span> : null}
                          “{slot.dialoguePreview}”
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="slot-empty-text">
                      {isAuto ? "읽기를 진행하면 자동으로 기록돼요." : "저장된 기록이 없어요."}
                    </p>
                  )}
                </div>

                <div className="slot-card-actions">
                  {slot ? (
                    <>
                      <button
                        type="button"
                        className="primary-button slot-resume-btn"
                        onClick={() => onResume(slot)}
                      >
                        이곳에서 이어읽기
                      </button>
                      {!isAuto && onSaveManualSlot && currentCutNumber > 0 && (
                        <button
                          type="button"
                          className="secondary-button slot-save-btn"
                          onClick={() => handleSave(slotId)}
                          title="현재 위치로 덮어쓰기"
                        >
                          현재 위치로 덮어쓰기
                        </button>
                      )}
                      {!isAuto && onDeleteSlot && (
                        <button
                          type="button"
                          className="ghost-button slot-delete-btn"
                          onClick={() => handleDelete(slotId)}
                          title="저장 슬롯 비우기"
                        >
                          삭제
                        </button>
                      )}
                    </>
                  ) : (
                    !isAuto &&
                    onSaveManualSlot &&
                    currentCutNumber > 0 && (
                      <button
                        type="button"
                        className="secondary-button slot-save-btn"
                        onClick={() => handleSave(slotId)}
                      >
                        현재 위치 저장
                      </button>
                    )
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <footer className="bookmark-dialog-footer">
        <small>저장된 기록은 이 기기의 브라우저에 안전하게 보관돼요.</small>
      </footer>
    </ModalDialog>
  );
}
