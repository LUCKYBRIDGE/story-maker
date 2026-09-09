"use client";

import type { CreativeMemo, CreativeMemoFieldSource } from "../creative-memos";
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

export function CreativeMemoEditor({ memo, chapterTargets, linkResolution, onClose, onChapterLinkChange, onTitleChange, onFieldChange, onAddField, onDeleteMemo }: CreativeMemoEditorProps) {
  return <section className="creative-memo-editor sticky-single-editor" role="dialog" aria-modal="false" aria-label="창작 메모 편집">
    <header className="sticky-single-heading"><strong>창작 메모</strong><button type="button" onClick={onClose}>닫기</button></header>
    <div className="sticky-memo-scroll">
      {memo.fields.map(field => <label className="sticky-single-field" key={field.id}>
        {memo.fields.length > 1 && <span>{field.label}</span>}
        <textarea id={`creative-memo-field-${memo.id}-${field.id}`} aria-label={memo.fields.length === 1 ? "메모 내용" : `메모 내용 · ${field.label}`} rows={8} value={field.value} onChange={event => onFieldChange(field.id, event.target.value)} placeholder="글쓰며 참고할 생각을 적어 두세요." />
      </label>)}
      {!memo.fields.length && <button type="button" onClick={() => onAddField("내용", "default")}>내용 쓰기</button>}
      <details className="sticky-memo-info"><summary>추가 정보 · {memo.linkedChapterId ? "장 메모" : "작품 전체"}</summary>
        <label>제목 (선택)<input value={memo.title} onChange={event => onTitleChange(event.target.value)} /></label>
        <label>메모 범위<select aria-label="메모 범위" value={memo.linkedChapterId ?? ""} onChange={event => onChapterLinkChange(event.target.value)}>
          <option value="">작품 전체</option>
          {linkResolution.status === "broken" && <option value={memo.linkedChapterId}>연결한 장 확인</option>}
          {chapterTargets.map(chapter => <option key={chapter.id} value={chapter.id}>{chapter.label}</option>)}
        </select></label>
        {memo.linkedLineId && <small>기존 컷 연결 정보는 보관 중이에요.</small>}
        <button type="button" className="danger-text-button" onClick={onDeleteMemo}>이 메모 삭제</button>
      </details>
    </div>
    <small className="sticky-single-footer">글쓰기 참고용 · 플레이에 숨김</small>
  </section>;
}
