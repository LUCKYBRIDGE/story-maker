"use client";

import { ModalDialog } from "./ModalDialog";
import type { StoryImportIssue, StoryImportSource } from "../story-import";
import type { StoryProject } from "../story-data";

export interface ImportIssuesDialogProps {
  open: boolean;
  issues: StoryImportIssue[];
  source?: StoryImportSource;
  onClose: () => void;
}

export function ImportIssuesDialog({
  open,
  issues,
  source = "excel",
  onClose,
}: ImportIssuesDialogProps) {
  if (!open) return null;

  const errors = issues.filter((issue) => issue.severity === "error");
  const warnings = issues.filter((issue) => issue.severity === "warning");
  const sourceLabel = source === "sheet" ? "Google 시트" : "Excel 파일";

  return (
    <ModalDialog
      overlayClassName="blank-confirm-overlay"
      dialogClassName="import-dialog import-issues-dialog"
      label="가져오기 검사 결과"
      onClose={onClose}
    >
      <div className="import-dialog-header">
        <span className="import-source-badge">{sourceLabel} 가져오기 오류</span>
        <h2>가져오기를 진행할 수 없어요</h2>
        <p>
          파일 내용에 문제가 있어 편집본으로 열지 못했어요. 아래 위치와 고치는
          법을 확인해 주세요.
        </p>
      </div>

      {source === "sheet" && (
        <div className="import-sheet-advice" role="note">
          <strong>Google 시트 안내</strong>
          <ul>
            <li>
              시트의 공유 권한이 ‘링크가 있는 모든 사용자 — 뷰어’로 열려 있는지
              확인해 주세요.
            </li>
            <li>
              권한 문제가 계속되면 Google 시트에서 [파일 → 다운로드 → Microsoft
              Excel(.xlsx)]로 저장한 뒤 ‘Excel 파일로 불러오기’를 이용해 보세요.
            </li>
          </ul>
        </div>
      )}

      <div className="import-issues-summary">
        <span>오류 {errors.length}건</span>
        {warnings.length > 0 && <span>경고 {warnings.length}건</span>}
      </div>

      <div className="import-issues-list" role="list" tabIndex={0} aria-label="오류 및 경고 목록">
        {issues.map((issue, index) => (
          <article
            key={`${issue.sheet}-${issue.row}-${issue.column}-${index}`}
            className={`import-issue-card ${issue.severity}`}
            role="listitem"
          >
            <div className="import-issue-top">
              <span className={`import-severity-tag ${issue.severity}`}>
                {issue.severity === "error" ? "치명 오류" : "확인 필요"}
              </span>
              <strong className="import-issue-location">
                {issue.sheet} 탭 · {issue.row}행 · {issue.column}열
              </strong>
            </div>

            <p className="import-issue-message">{issue.message}</p>

            {issue.value && (
              <div className="import-issue-value">
                <span className="sr-only">현재 입력값:</span>
                <code>{issue.value}</code>
              </div>
            )}

            {issue.fix && (
              <div className="import-issue-fix">
                <strong>고치는 법:</strong> {issue.fix}
              </div>
            )}
          </article>
        ))}
      </div>

      <div className="import-dialog-actions">
        <button
          type="button"
          className="primary-button"
          onClick={onClose}
          autoFocus
        >
          확인하고 닫기
        </button>
      </div>
    </ModalDialog>
  );
}

export interface ImportConfirmationDialogProps {
  open: boolean;
  project: StoryProject | null;
  fileName?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ImportConfirmationDialog({
  open,
  project,
  fileName,
  onConfirm,
  onCancel,
}: ImportConfirmationDialogProps) {
  if (!open || !project) return null;

  return (
    <ModalDialog
      overlayClassName="blank-confirm-overlay"
      dialogClassName="import-dialog import-confirm-dialog"
      label="작품 가져오기 미리보기"
      onClose={onCancel}
    >
      <div className="import-dialog-header">
        <span className="import-source-badge">가져오기 미리보기</span>
        <h2>새 작품을 열까요?</h2>
        <p>
          {fileName ? `‘${fileName}’ 파일의 ` : ""}
          작품 정보를 확인해 주세요. 편집본으로 열면 현재 작업 중인 내용이
          교체됩니다.
        </p>
      </div>

      <div className="import-preview-summary">
        <div className="import-preview-item">
          <span className="label">작품 제목</span>
          <strong>{project.title || "제목 없음"}</strong>
        </div>
        <div className="import-preview-item">
          <span className="label">장(場) 수</span>
          <strong>{project.chapters.length}개 장</strong>
        </div>
        <div className="import-preview-item">
          <span className="label">컷(Cut) 수</span>
          <strong>{project.lines.length}개 컷</strong>
        </div>
        <div className="import-preview-item">
          <span className="label">창작 메모</span>
          <strong>{project.creativeMemos.length}개</strong>
        </div>
      </div>

      <p className="import-safety-note">
        이전 작업은 언제든 화면 상단의 ‘방금 전으로 복구’ 버튼으로 되돌릴 수
        있어요.
      </p>

      <div className="import-dialog-actions">
        <button
          type="button"
          className="ghost-button"
          onClick={onCancel}
        >
          취소 (현재 작업 유지)
        </button>
        <button
          type="button"
          className="primary-button"
          onClick={onConfirm}
          autoFocus
        >
          편집본으로 열기
        </button>
      </div>
    </ModalDialog>
  );
}
