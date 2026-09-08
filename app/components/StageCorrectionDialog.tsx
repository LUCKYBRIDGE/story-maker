"use client";

import React from "react";
import { ModalDialog } from "./ModalDialog";
import type {
  StageConsistencyWarning,
  StageSuggestion,
} from "../story-stages";

export interface StageCorrectionDialogProps {
  open: boolean;
  warning: StageConsistencyWarning | null;
  onApplySuggestion: (suggestion: StageSuggestion) => void;
  onDismiss: () => void;
}

export function StageCorrectionDialog({
  open,
  warning,
  onApplySuggestion,
  onDismiss,
}: StageCorrectionDialogProps) {
  if (!open || !warning) return null;

  return (
    <ModalDialog
      overlayClassName="stage-correction-overlay"
      dialogClassName="stage-correction-dialog"
      label="이야기 단계 다듬기 안내"
      onClose={onDismiss}
    >
      <div className="stage-correction-header">
        <span className="stage-correction-badge">💡 이야기 구성 도움말</span>
        <h2>{warning.title}</h2>
        <p className="stage-correction-subtitle">
          이야기 단계를 알맞게 맞추면 읽는 사람이 사건의 흐름을 더 쉽게 이해해요.
        </p>
      </div>

      <div className="stage-correction-body">
        <div className="current-pattern-box" role="region" aria-label="현재 이야기 단계 흐름">
          <span className="pattern-label">현재 흐름:</span>
          <strong className="pattern-value">{warning.detectedPattern}</strong>
        </div>

        <p className="stage-correction-message">{warning.message}</p>

        <div className="stage-suggestions-list" role="group" aria-label="추천 단계 변경안">
          <span className="suggestions-heading">이렇게 다듬어 볼까요?</span>
          {warning.suggestions.map((suggestion, index) => (
            <button
              key={suggestion.targetMode + index}
              type="button"
              className="stage-suggestion-card"
              onClick={() => onApplySuggestion(suggestion)}
            >
              <div className="suggestion-card-main">
                <strong className="suggestion-card-title">
                  ✨ {suggestion.label}
                </strong>
                <p className="suggestion-card-desc">
                  {suggestion.description}
                </p>
              </div>
              <span className="suggestion-action-btn">바꾸기</span>
            </button>
          ))}
        </div>
      </div>

      <div className="stage-correction-footer">
        <button
          type="button"
          className="stage-keep-button"
          onClick={onDismiss}
        >
          그대로 둘게요
        </button>
        <span className="stage-keep-guide">
          (바꾸지 않고 지금 구성을 유지해요)
        </span>
      </div>
    </ModalDialog>
  );
}
