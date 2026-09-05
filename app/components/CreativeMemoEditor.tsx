"use client";

import { useState } from "react";
import {
  CREATIVE_MEMO_TEMPLATES,
  creativeMemoDisplayTitle,
  creativeMemoKindLabel,
  type CreativeMemo,
  type CreativeMemoFieldSource,
} from "../creative-memos";
import type {
  CreativeMemoChapterTarget,
  CreativeMemoLineTarget,
  CreativeMemoLinkResolution,
} from "../creative-memo-commands";

export interface CreativeMemoEditorProps {
  memo: CreativeMemo;
  chapterTargets: CreativeMemoChapterTarget[];
  lineTargets: CreativeMemoLineTarget[];
  linkResolution: CreativeMemoLinkResolution;
  onClose: () => void;
  onChapterLinkChange: (chapterId: string) => void;
  onLineLinkChange: (lineId: string) => void;
  onTitleChange: (value: string) => void;
  onFieldChange: (fieldId: string, value: string) => void;
  onAddField: (label: string, source: CreativeMemoFieldSource) => void;
  onMoveField: (fieldId: string, direction: -1 | 1) => void;
  onDeleteField: (fieldId: string) => void;
  onDeleteMemo: () => void;
}

export function CreativeMemoEditor({
  memo,
  chapterTargets,
  lineTargets,
  linkResolution,
  onClose,
  onChapterLinkChange,
  onLineLinkChange,
  onTitleChange,
  onFieldChange,
  onAddField,
  onMoveField,
  onDeleteField,
  onDeleteMemo,
}: CreativeMemoEditorProps) {
  const [customLabel, setCustomLabel] = useState("");
  const [addFieldOpen, setAddFieldOpen] = useState(false);
  const template = CREATIVE_MEMO_TEMPLATES.find(
    (candidate) => candidate.kind === memo.kind,
  );
  const usedLabels = new Set(memo.fields.map((field) => field.label));
  const recommendedFields =
    template?.recommendedFields.filter((label) => !usedLabels.has(label)) ?? [];

  return (
    <section
      className="creative-memo-editor"
      role="dialog"
      aria-modal="true"
      aria-label={`${creativeMemoKindLabel(memo.kind)} 창작 메모 편집`}
    >
      <header className="creative-memo-editor-heading">
        <div>
          <span>{creativeMemoKindLabel(memo.kind)}</span>
          <h2>{creativeMemoDisplayTitle(memo)}</h2>
          <p>모든 항목은 선택 사항이에요. 필요한 만큼만 써도 돼요.</p>
        </div>
        <button type="button" onClick={onClose}>
          닫기
        </button>
      </header>

      <div className="creative-memo-editor-body">
        <label className="field creative-memo-title-field">
          <span>메모 제목</span>
          <input
            value={memo.title}
            onChange={(event) => onTitleChange(event.target.value)}
            placeholder={
              memo.kind === "free"
                ? "예: 꼭 넣고 싶은 마지막 컷"
                : "예: 토끼, 바닷가, 첫 번째 갈등"
            }
          />
        </label>

        <section className="creative-memo-link">
          <header>
            <div>
              <strong>이야기와 연결하기</strong>
              <small>필요하면 이 메모가 떠오른 장이나 컷을 표시해 둘 수 있어요.</small>
            </div>
            <span
              className={`creative-memo-link-status ${linkResolution.status}`}
              aria-live="polite"
            >
              {linkResolution.status === "broken"
                ? "연결을 다시 골라요"
                : linkResolution.label}
            </span>
          </header>
          <div className="creative-memo-link-selects">
            <label>
              <span>장</span>
              <select
                value={memo.linkedChapterId ?? ""}
                onChange={(event) => onChapterLinkChange(event.target.value)}
              >
                <option value="">연결하지 않음</option>
                {chapterTargets.map((chapter) => (
                  <option key={chapter.id} value={chapter.id}>
                    {chapter.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>컷</span>
              <select
                value={memo.linkedLineId ?? ""}
                disabled={!memo.linkedChapterId || lineTargets.length === 0}
                onChange={(event) => onLineLinkChange(event.target.value)}
              >
                <option value="">
                  {memo.linkedChapterId
                    ? "장 전체에 연결"
                    : "먼저 장을 골라요"}
                </option>
                {lineTargets.map((line) => (
                  <option key={line.id} value={line.id}>
                    {line.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <div className="creative-memo-fields">
          {memo.fields.map((field, index) => (
            <section className="creative-memo-field" key={field.id}>
              <header>
                <div>
                  <strong>{field.label || "이름 없는 항목"}</strong>
                  {field.source !== "default" && (
                    <small>
                      {field.source === "recommended" ? "추천 항목" : "직접 만든 항목"}
                    </small>
                  )}
                </div>
                {memo.kind !== "free" && (
                  <div className="creative-memo-field-actions">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => onMoveField(field.id, -1)}
                    >
                      ↑ 위로 이동
                    </button>
                    <button
                      type="button"
                      disabled={index === memo.fields.length - 1}
                      onClick={() => onMoveField(field.id, 1)}
                    >
                      ↓ 아래로 이동
                    </button>
                    <button
                      className="danger-text-button"
                      type="button"
                      onClick={() => onDeleteField(field.id)}
                    >
                      항목 삭제
                    </button>
                  </div>
                )}
              </header>
              <textarea
                id={`creative-memo-field-${memo.id}-${field.id}`}
                rows={memo.kind === "free" ? 14 : 4}
                value={field.value}
                onChange={(event) => onFieldChange(field.id, event.target.value)}
                placeholder={
                  memo.kind === "free"
                    ? "떠오른 대사, 사건, 조사한 내용, 친구와 의논한 생각을 자유롭게 써 보세요."
                    : `${field.label}에 관해 떠오른 생각을 써 보세요.`
                }
              />
            </section>
          ))}
        </div>

        {memo.kind !== "free" && (
          <section className="creative-memo-add-field">
            <button
              className="creative-memo-add-field-toggle"
              type="button"
              aria-expanded={addFieldOpen}
              onClick={() => setAddFieldOpen((open) => !open)}
            >
              + 항목 추가
            </button>
            {addFieldOpen && (
              <div>
                {recommendedFields.length > 0 ? (
                  <div className="creative-memo-recommendations">
                    <span>추천 항목에서 골라요</span>
                    <div>
                      {recommendedFields.map((label) => (
                        <button
                          type="button"
                          key={label}
                          onClick={() => onAddField(label, "recommended")}
                        >
                          + {label}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p>추천 항목을 모두 추가했어요.</p>
                )}
                <div className="creative-memo-custom-field">
                  <label htmlFor={`custom-field-${memo.id}`}>
                    직접 항목 이름 붙이기
                  </label>
                  <div>
                    <input
                      id={`custom-field-${memo.id}`}
                      value={customLabel}
                      onChange={(event) => setCustomLabel(event.target.value)}
                      placeholder="예: 이 인물만 아는 비밀"
                    />
                    <button
                      type="button"
                      disabled={!customLabel.trim()}
                      onClick={() => {
                        onAddField(customLabel.trim(), "custom");
                        setCustomLabel("");
                      }}
                    >
                      이 항목 추가
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}
      </div>

      <footer className="creative-memo-editor-footer">
        <span>쓴 내용은 이 기기에 자동 저장돼요.</span>
        <button className="danger-text-button" type="button" onClick={onDeleteMemo}>
          이 메모 삭제
        </button>
      </footer>
    </section>
  );
}
