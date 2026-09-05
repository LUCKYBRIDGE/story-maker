"use client";

import { ModalDialog } from "./ModalDialog";
import type { EntryLocalDraftStatus } from "./StartScreen";

export function StoryEntryDialog({
  open,
  choiceLabel,
  localDraftStatus,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  choiceLabel: string;
  localDraftStatus: EntryLocalDraftStatus;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;

  const failedDraft = localDraftStatus === "failed";

  return (
    <ModalDialog
      overlayClassName="entry-replace-overlay"
      dialogClassName="entry-replace-dialog"
      label="새 이야기로 교체 확인"
      onClose={onCancel}
    >
      <span className="entry-replace-mark">새 이야기</span>
      <h2>
        {failedDraft
          ? "읽지 못한 저장본을 바꿀까요?"
          : "만들던 이야기를 바꿀까요?"}
      </h2>
      <p>
        {failedDraft
          ? "취소하면 읽지 못한 기기 저장본을 그대로 유지합니다. 계속하면 선택한 새 이야기로 교체됩니다."
          : "현재 편집본을 복구 기록으로 남긴 뒤 선택한 이야기로 바꿉니다."}
      </p>
      <strong className="entry-replace-choice">선택: {choiceLabel}</strong>
      <div>
        <button type="button" className="ghost-button" onClick={onCancel}>
          취소하고 돌아가기
        </button>
        <button type="button" className="danger-button" onClick={onConfirm}>
          새 이야기로 바꾸기
        </button>
      </div>
    </ModalDialog>
  );
}
